import SerialControl from '../components/SerialControl';
import DataDisplay from '../components/DataDisplay';
import JsonTable from '../components/JsonTable';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSerialStore } from '../store/serialStore';
import { Activity, Clock } from 'lucide-react';

export default function Home() {
  useWebSocket();
  const { lastUpdate, wsConnected } = useSerialStore();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">串口数据平台</h1>
              <p className="text-sm text-slate-400">Serial Data Monitor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-sm text-slate-300">
                {wsConnected ? 'WebSocket 已连接' : '正在连接...'}
              </span>
            </div>
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Serial Control */}
          <div>
            <SerialControl />
          </div>

          {/* Data Display */}
          <div>
            <DataDisplay />
          </div>

          {/* JSON Table */}
          <div>
            <JsonTable />
          </div>
        </div>
      </main>
    </div>
  );
}