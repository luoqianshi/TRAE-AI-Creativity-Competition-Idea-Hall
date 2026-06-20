/**
 * local server entry file, for local development
 */
import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js';
import { serialService } from './services/serialService.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

serialService.setWebSocketServer(wss);

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send initial connection state
  ws.send(JSON.stringify({ 
    type: 'connectionState', 
    payload: serialService.getConnectionState() 
  }));
  
  // Send initial data
  ws.send(JSON.stringify({ 
    type: 'initialData', 
    payload: serialService.getRecentData() 
  }));
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;