import { useEffect } from 'react';
import { useSerialStore } from '../store/serialStore';
import { Usb, Plug, PowerOff, RefreshCw } from 'lucide-react';

const SerialControl = () => {
  const {
    ports,
    selectedPort,
    baudRate,
    connectionState,
    setPorts,
    setSelectedPort,
    setBaudRate,
    setConnectionState,
  } = useSerialStore();

  const fetchPorts = async () => {
    try {
      const response = await fetch('/api/serial/ports');
      const data = await response.json();
      setPorts(data);
      if (data.length > 0 && !selectedPort) {
        setSelectedPort(data[0].path);
      }
    } catch (error) {
      console.error('Failed to fetch ports:', error);
    }
  };

  const connect = async () => {
    if (!selectedPort) return;
    try {
      const response = await fetch('/api/serial/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPort, baudRate }),
      });
      const data = await response.json();
      setConnectionState(data);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const disconnect = async () => {
    try {
      const response = await fetch('/api/serial/disconnect', {
        method: 'POST',
      });
      const data = await response.json();
      setConnectionState(data);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  const baudRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <Usb className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">串口控制</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              串口选择
            </label>
            <div className="flex gap-2">
              <select
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                disabled={connectionState.isConnected}
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">请选择串口</option>
                {ports.map((port) => (
                  <option key={port.path} value={port.path}>
                    {port.path} {port.manufacturer ? `(${port.manufacturer})` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchPorts}
                disabled={connectionState.isConnected}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50"
                title="刷新串口列表"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              波特率
            </label>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(Number(e.target.value))}
              disabled={connectionState.isConnected}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {baudRates.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionState.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-300">
              {connectionState.isConnected 
                ? `已连接: ${connectionState.connectedPort} @ ${connectionState.baudRate}` 
                : '未连接'}
            </span>
          </div>

          {connectionState.isConnected ? (
            <button
              onClick={disconnect}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
            >
              <PowerOff className="w-5 h-5" />
              断开
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={!selectedPort}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plug className="w-5 h-5" />
              连接
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SerialControl;
