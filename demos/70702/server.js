const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

// QR Code generation endpoint
app.get('/api/qr', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url required' });
    const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 1 });
    res.json({ dataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Device registry: roomId -> { sender: ws, receiver: ws }
const rooms = new Map();

function generateRoomId() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function forwardToPeer(ws, currentRoom, role, msg) {
  const room = rooms.get(currentRoom);
  if (!room) return false;
  const peer = role === 'sender' ? room.receiver : room.sender;
  if (peer && peer.readyState === 1) {
    peer.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    return true;
  }
  return false;
}

wss.on('connection', (ws) => {
  let currentRoom = null;
  let role = null;

  ws.on('message', (data, isBinary) => {
    // Binary data: file chunk, forward directly
    if (isBinary) {
      const room = rooms.get(currentRoom);
      if (!room) return;
      const peer = role === 'sender' ? room.receiver : room.sender;
      if (peer && peer.readyState === 1) {
        peer.send(data, true);
      }
      return;
    }

    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (e) {
      return;
    }

    switch (msg.type) {
      case 'create-room': {
        if (currentRoom) {
          ws.send(JSON.stringify({ type: 'error', message: '当前连接已有活跃房间' }));
          return;
        }
        const roomId = generateRoomId();
        currentRoom = roomId;
        role = 'sender';
        rooms.set(roomId, { sender: ws, receiver: null, createdAt: Date.now() });
        ws.send(JSON.stringify({ type: 'room-created', roomId }));
        console.log(`[Room ${roomId}] Created by sender`);
        break;
      }

      case 'join-room': {
        const { roomId } = msg;
        const room = rooms.get(roomId);
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: '房间不存在或已过期' }));
          return;
        }
        if (room.sender === ws) {
          ws.send(JSON.stringify({ type: 'error', message: '不能加入自己创建的房间' }));
          return;
        }
        if (room.receiver) {
          ws.send(JSON.stringify({ type: 'error', message: '房间已满' }));
          return;
        }
        if (currentRoom) {
          ws.send(JSON.stringify({ type: 'error', message: '当前连接已加入其他房间' }));
          return;
        }
        currentRoom = roomId;
        role = 'receiver';
        room.receiver = ws;
        room.sender.send(JSON.stringify({ type: 'peer-joined' }));
        ws.send(JSON.stringify({ type: 'peer-joined' }));
        console.log(`[Room ${roomId}] Receiver joined`);
        break;
      }

      // ---- File transfer ----
      case 'file-meta':
      case 'file-accept':
      case 'file-reject':
      case 'file-complete':
      case 'transfer-progress':
      case 'clip-sync':
      case 'folder-meta':
      case 'folder-accept':
      case 'folder-reject':
      case 'folder-file-meta':
      case 'folder-file-accept':
      case 'folder-file-complete':
      case 'privacy-result':
        forwardToPeer(ws, currentRoom, role, msg);
        break;

      // ---- WebRTC signaling ----
      case 'webrtc-offer':
      case 'webrtc-answer':
      case 'webrtc-ice-candidate':
        forwardToPeer(ws, currentRoom, role, msg);
        break;

      case 'ping':
      case 'pong':
        break;
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      const peer = role === 'sender' ? room.receiver : room.sender;
      if (peer) {
        peer.send(JSON.stringify({ type: 'peer-left' }));
      }
      rooms.delete(currentRoom);
      console.log(`[Room ${currentRoom}] ${role} disconnected, room closed`);
    }
  });
});

// Clean up expired rooms (30 min)
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms) {
    if (now - room.createdAt > 30 * 60 * 1000) {
      if (room.sender) room.sender.close();
      if (room.receiver) room.receiver.close();
      rooms.delete(roomId);
    }
  }
}, 60 * 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`
╔══════════════════════════════════════════╗
║       Swift Transfer 文件快传已启动       ║
╠══════════════════════════════════════════╣
║  本地访问: http://localhost:${PORT}           ║
║  局域网访问: http://${ip}:${PORT}    ║
║  功能: 双向传输/文件夹/断点续传/P2P      ║
║        图片压缩/隐私扫描                  ║
╚══════════════════════════════════════════╝
  `);
});

function getLocalIP() {
  const os = require('os');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}
