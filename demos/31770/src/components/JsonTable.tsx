import { useSerialStore } from '../store/serialStore';
import { Table, Trash2 } from 'lucide-react';

const JsonTable = () => {
  const { jsonData, clearData } = useSerialStore();

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

  const getAllKeys = () => {
    const keys = new Set<string>();
    jsonData.forEach(item => {
      if (item.parsedJson) {
        Object.keys(item.parsedJson).forEach(key => keys.add(key));
      }
    });
    return Array.from(keys);
  };

  const keys = getAllKeys();

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Table className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">JSON 数据表格</h2>
        </div>
        {jsonData.length > 0 && (
          <button
            onClick={clearData}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        )}
      </div>

      <div className="bg-slate-900 rounded-lg overflow-hidden">
        {jsonData.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            暂无 JSON 数据
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-300 font-medium">时间</th>
                  {keys.map((key) => (
                    <th key={key} className="px-4 py-3 text-left text-slate-300 font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[...jsonData].reverse().map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatTime(item.timestamp)}
                    </td>
                    {keys.map((key) => {
                      const value = item.parsedJson?.[key];
                      return (
                        <td key={key} className="px-4 py-3 text-slate-300">
                          {typeof value === 'object' 
                            ? JSON.stringify(value) 
                            : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonTable;
