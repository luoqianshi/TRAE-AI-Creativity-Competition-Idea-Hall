import { useEffect, useRef } from 'react';
import { useSerialStore } from '../store/serialStore';
import { SerialData, ConnectionState } from '../../shared/types';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const {
    setConnectionState,
    addData,
    setInitialData,
    setWsConnected,
    setLastUpdate,
  } = useSerialStore();

  useEffect(() => {
    // 开发环境直接连接后端，生产环境使用相对路径
    const isDev = import.meta.env.DEV;
    const wsUrl = isDev 
      ? 'ws://localhost:3001' 
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
    
    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connectionState':
              setConnectionState(message.payload as ConnectionState);
              break;
            case 'data':
              addData(message.payload as SerialData);
              break;
            case 'initialData':
              setInitialData(message.payload as SerialData[]);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setWsConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 10秒自动刷新
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);
};
