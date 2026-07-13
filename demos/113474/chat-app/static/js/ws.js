// WebSocket 客户端（自动重连 + 心跳）
const WS = (() => {
    let socket = null;
    let reconnectAttempts = 0;
    let heartbeatTimer = null;
    let reconnectTimer = null;
    let isManualClose = false;
    const handlers = {};

    const on = (type, handler) => {
        if (!handlers[type]) handlers[type] = [];
        handlers[type].push(handler);
    };

    const emit = (type, data) => {
        if (handlers[type]) {
            handlers[type].forEach((h) => {
                try {
                    h(data);
                } catch (e) {
                    console.error(`WS handler error [${type}]:`, e);
                }
            });
        }
    };

    const connect = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        isManualClose = false;
        const protocol = location.protocol === "https:" ? "wss:" : "ws:";
        const url = `${protocol}//${location.host}/ws/chat?token=${encodeURIComponent(token)}`;

        try {
            socket = new WebSocket(url);
        } catch (e) {
            console.error("WebSocket 创建失败:", e);
            scheduleReconnect();
            return;
        }

        socket.onopen = () => {
            console.log("WebSocket 已连接");
            reconnectAttempts = 0;
            startHeartbeat();
            emit("open", {});
        };

        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                emit(msg.type, msg.data || {});
            } catch (e) {
                console.error("WS 消息解析失败:", e);
            }
        };

        socket.onclose = (event) => {
            console.log(`WebSocket 关闭 (code=${event.code})`);
            stopHeartbeat();
            if (!isManualClose) {
                scheduleReconnect();
            }
            emit("close", { code: event.code });
        };

        socket.onerror = (error) => {
            console.error("WebSocket 错误:", error);
        };
    };

    const send = (type, data) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type, data }));
            return true;
        }
        return false;
    };

    const startHeartbeat = () => {
        stopHeartbeat();
        heartbeatTimer = setInterval(() => {
            send("ping", {});
        }, 30000);
    };

    const stopHeartbeat = () => {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    };

    const scheduleReconnect = () => {
        if (reconnectTimer) return;
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`将在 ${delay}ms 后重连 (第 ${reconnectAttempts} 次)`);
        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connect();
        }, delay);
    };

    const disconnect = () => {
        isManualClose = true;
        stopHeartbeat();
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        if (socket) {
            socket.close();
            socket = null;
        }
    };

    const isConnected = () => socket && socket.readyState === WebSocket.OPEN;

    return { connect, disconnect, send, on, isConnected };
})();
