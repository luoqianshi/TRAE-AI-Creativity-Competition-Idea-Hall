import { useEffect, useRef, useState } from 'react';
import { useSerialStore } from '../store/serialStore';
import { Terminal, Trash2 } from 'lucide-react';

const DataDisplay = () => {
  const { data, clearData } = useSerialStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (scrollRef.current && !isHovering) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data, isHovering]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${time}.${ms}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">串口数据</h2>
        </div>
        {data.length > 0 && (
          <button
            onClick={clearData}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="bg-slate-900 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {data.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            暂无数据，请连接串口设备
          </div>
        ) : (
          data.map((item, index) => (
            <div key={index} className="mb-1">
              <span className="text-slate-500 mr-2">[{formatTime(item.timestamp)}]</span>
              {item.isJson ? (
                <span className="text-yellow-400">{item.data}</span>
              ) : (
                <span className="text-green-400">{item.data}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DataDisplay;
