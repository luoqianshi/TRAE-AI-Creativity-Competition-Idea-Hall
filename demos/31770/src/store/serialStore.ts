import { create } from 'zustand';
import { SerialPortInfo, SerialData, ConnectionState } from '../../shared/types';

interface SerialStore {
  ports: SerialPortInfo[];
  selectedPort: string;
  baudRate: number;
  connectionState: ConnectionState;
  data: SerialData[];
  jsonData: SerialData[];
  lastUpdate: Date | null;
  wsConnected: boolean;
  
  setPorts: (ports: SerialPortInfo[]) => void;
  setSelectedPort: (port: string) => void;
  setBaudRate: (rate: number) => void;
  setConnectionState: (state: ConnectionState) => void;
  addData: (data: SerialData) => void;
  setInitialData: (data: SerialData[]) => void;
  clearData: () => void;
  setWsConnected: (connected: boolean) => void;
  setLastUpdate: (date: Date) => void;
}

export const useSerialStore = create<SerialStore>((set) => ({
  ports: [],
  selectedPort: '',
  baudRate: 9600,
  connectionState: { isConnected: false },
  data: [],
  jsonData: [],
  lastUpdate: null,
  wsConnected: false,
  
  setPorts: (ports) => set({ ports }),
  setSelectedPort: (port) => set({ selectedPort: port }),
  setBaudRate: (rate) => set({ baudRate: rate }),
  setConnectionState: (state) => set({ connectionState: state }),
  addData: (data) => set((state) => {
    // 检查数据是否已存在（基于时间戳和数据内容）
    const isDuplicate = state.data.some(item => 
      item.timestamp === data.timestamp && item.data === data.data
    );
    
    if (isDuplicate) {
      return state; // 如果是重复数据，不添加
    }
    
    const newData = [...state.data, data];
    const newJsonData = data.isJson 
      ? [...state.jsonData, data] 
      : state.jsonData;
    
    if (newData.length > 100) newData.shift();
    if (newJsonData.length > 50) newJsonData.shift();
    
    return { 
      data: newData, 
      jsonData: newJsonData,
      lastUpdate: new Date()
    };
  }),
  setInitialData: (data) => set(() => {
    // 对初始数据进行去重
    const uniqueData = data.filter((item, index, self) => 
      index === self.findIndex((t) => t.timestamp === item.timestamp && t.data === item.data)
    );
    
    const jsonData = uniqueData.filter(d => d.isJson);
    return { 
      data: uniqueData.slice(-100), 
      jsonData: jsonData.slice(-50),
      lastUpdate: new Date()
    };
  }),
  clearData: () => set({ data: [], jsonData: [] }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
  setLastUpdate: (date) => set({ lastUpdate: date }),
}));
