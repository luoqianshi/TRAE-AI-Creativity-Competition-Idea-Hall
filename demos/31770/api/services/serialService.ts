import { SerialPort } from 'serialport';
import { SerialPortInfo, ConnectConfig, SerialData, ConnectionState } from '../../shared/types';
import { WebSocket } from 'ws';

class SerialService {
  private currentPort: SerialPort | null = null;
  private connectionState: ConnectionState = { isConnected: false };
  private wss: any;
  private dataBuffer: SerialData[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  setWebSocketServer(wss: any) {
    this.wss = wss;
  }

  async listPorts(): Promise<SerialPortInfo[]> {
    try {
      const ports = await SerialPort.list();
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        locationId: port.locationId,
        vendorId: port.vendorId,
        productId: port.productId
      }));
    } catch (error) {
      console.error('Error listing ports:', error);
      return [];
    }
  }

  connect(config: ConnectConfig): Promise<ConnectionState> {
    return new Promise((resolve, reject) => {
      if (this.currentPort && this.currentPort.isOpen) {
        this.currentPort.close((err) => {
          if (err) console.error('Error closing port:', err);
        });
      }

      this.currentPort = new SerialPort({
        path: config.path,
        baudRate: config.baudRate
      });

      this.currentPort.on('open', () => {
        this.connectionState = {
          isConnected: true,
          connectedPort: config.path,
          baudRate: config.baudRate
        };
        resolve(this.connectionState);
      });

      this.currentPort.on('data', (data: Buffer) => {
        this.handleData(data);
      });

      this.currentPort.on('error', (error) => {
        console.error('Serial port error:', error);
        reject(error);
      });

      this.currentPort.on('close', () => {
        this.connectionState = { isConnected: false };
        this.broadcastConnectionState();
      });
    });
  }

  disconnect(): ConnectionState {
    if (this.currentPort && this.currentPort.isOpen) {
      this.currentPort.close((err) => {
        if (err) console.error('Error closing port:', err);
      });
    }
    this.connectionState = { isConnected: false };
    this.broadcastConnectionState();
    return this.connectionState;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getRecentData(): SerialData[] {
    return [...this.dataBuffer];
  }

  private handleData(data: Buffer) {
    const dataStr = data.toString('utf8');
    const serialData = this.parseData(dataStr);
    
    this.dataBuffer.push(serialData);
    if (this.dataBuffer.length > this.MAX_BUFFER_SIZE) {
      this.dataBuffer.shift();
    }
    
    this.broadcastData(serialData);
  }

  private parseData(dataStr: string): SerialData {
    let isJson = false;
    let parsedJson: Record<string, any> | undefined;

    try {
      const trimmed = dataStr.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
          (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        parsedJson = JSON.parse(trimmed);
        isJson = true;
      }
    } catch {
      isJson = false;
      parsedJson = undefined;
    }

    return {
      timestamp: Date.now(),
      data: dataStr,
      isJson,
      parsedJson
    };
  }

  private broadcastData(data: SerialData) {
    if (!this.wss) return;
    
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'data', payload: data }));
      }
    });
  }

  private broadcastConnectionState() {
    if (!this.wss) return;
    
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: 'connectionState', 
          payload: this.connectionState 
        }));
      }
    });
  }
}

export const serialService = new SerialService();
