import React from 'react';
import { Plus, Save, GripHorizontal, GripVertical, CornerDownRight, Trash2, X } from 'lucide-react';

export interface ColumnConfig {
  id: string;
  name: string;
  isSystem?: boolean;
  type?: 'text' | 'select' | 'number';
  options?: { value: string; label: string }[];
}

export interface RowData {
  id: string;
  name: string;
  [key: string]: string | number | undefined;
}

export interface ConfigTableEditorProps<T extends { id: string; name: string; [key: string]: string | number | undefined }> {
  title: string;
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  columns: ColumnConfig[];
  columnOrder: string[];
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  addColumn: () => void;
  removeColumn: (id: string) => void;
  insertRow: (idx: number) => void;
  onSave: (e: React.FormEvent) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  dragPrefix: string;
  rowNameField?: string;
}

export const ConfigTableEditor = <T extends { id: string; name: string; [key: string]: string | number | undefined }>({
  title,
  data,
  setData,
  columns,
  columnOrder,
  setColumnOrder,
  addColumn,
  removeColumn,
  insertRow,
  onSave,
  openConfirm,
  dragPrefix,
  rowNameField = 'name',
}: ConfigTableEditorProps<T>) => {
  const sortedCols = columnOrder
    .map(colId => columns.find(c => c.id === colId))
    .filter(Boolean) as ColumnConfig[];

  const handleColumnDrop = (targetColId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data.startsWith(`${dragPrefix}Col:`)) {
      const fromCol = data.replace(`${dragPrefix}Col:`, '');
      if (fromCol && fromCol !== targetColId) {
        setColumnOrder(prev => {
          const fromIdx = prev.indexOf(fromCol);
          const toIdx = prev.indexOf(targetColId);
          if (fromIdx === -1 || toIdx === -1) return prev;
          const next = [...prev];
          const [removed] = next.splice(fromIdx, 1);
          next.splice(toIdx, 0, removed);
          return next;
        });
      }
    }
  };

  const handleRowDrop = (targetIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data.startsWith(`${dragPrefix}Row:`)) {
      const fromIdx = parseInt(data.replace(`${dragPrefix}Row:`, ''));
      if (fromIdx !== targetIdx) {
        setData(prev => {
          const next = [...prev];
          const [removed] = next.splice(fromIdx, 1);
          next.splice(targetIdx, 0, removed);
          return next;
        });
      }
    }
  };

  const renderCell = (row: RowData, col: ColumnConfig, idx: number) => {
    const cellValue = row[col.id];
    
    if (col.type === 'select' && col.options) {
      return (
        <select
          value={cellValue}
          onChange={e => {
            const n = [...data] as RowData[];
            n[idx][col.id] = e.target.value;
            setData(n as T[]);
          }}
          className="w-full py-1.5 px-2 border border-transparent hover:border-zinc-200 focus:border-cyan-500 bg-transparent focus:bg-white rounded text-sm transition-all"
        >
          {col.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    
    if (col.type === 'number') {
      return (
        <input
          type="number"
          value={cellValue || 0}
          onChange={e => {
            const n = [...data] as RowData[];
            n[idx][col.id] = parseFloat(e.target.value) || 0;
            setData(n as T[]);
          }}
          className="w-full py-1.5 px-3 border border-transparent hover:border-zinc-200 focus:border-cyan-500 rounded text-sm bg-transparent focus:bg-white transition-all font-mono text-right"
        />
      );
    }
    
    return (
      <input
        type="text"
        value={cellValue || ''}
        placeholder={col.id === 'name' ? '名称' : `输入${col.name}`}
        onChange={e => {
          const n = [...data] as RowData[];
          n[idx][col.id] = e.target.value;
          setData(n as T[]);
        }}
        className="w-full py-1.5 px-3 border border-transparent hover:border-zinc-200 focus:border-cyan-500 rounded text-sm bg-transparent focus:bg-white transition-all"
      />
    );
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{title}</h3>
        <button
          type="button"
          onClick={addColumn}
          className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 transition-colors px-3 py-1.5 rounded-lg flex items-center space-x-1"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>添加新配置列</span>
        </button>
      </div>

      <div className="overflow-x-auto border border-zinc-200/60 rounded-xl max-h-[450px]">
        <table className="w-full text-left border-collapse whitespace-nowrap bg-white">
          <thead className="sticky top-0 z-10 bg-zinc-50 border-b border-zinc-200">
            <tr className="text-xs font-semibold text-zinc-500">
              <th className="py-3 px-4 w-32 border-r border-zinc-100">操作</th>
              <th className="py-3 px-4 w-16 text-center border-r border-zinc-100">序号</th>
              {sortedCols.filter(col => col.name !== '代码ID (唯一)' && col.id !== 'id').map((col) => (
                <th
                  key={col.id}
                  className={`py-3 px-4 group ${!col.isSystem ? 'border-l border-zinc-100' : ''}`}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', `${dragPrefix}Col:${col.id}`); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleColumnDrop(col.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 cursor-move text-zinc-600" title="拖动此列重排序">
                      <GripHorizontal className="h-4 w-4 text-zinc-300 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span>{col.name}</span>
                    </div>
                    {!col.isSystem && (
                      <button type="button" onClick={() => removeColumn(col.id)} className="text-red-400 hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors group"
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('text/plain', `${dragPrefix}Row:${idx}`); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={handleRowDrop(idx)}
              >
                <td className="py-2 px-4 border-r border-zinc-100 space-x-1">
                  <div className="inline-block cursor-move text-zinc-300 hover:text-zinc-500 opacity-50 group-hover:opacity-100 align-middle mr-1" title="拖动此行重新排序">
                    <GripVertical className="h-4 w-4 inline" />
                  </div>
                  <button
                    type="button"
                    onClick={() => insertRow(idx)}
                    title="复制当前行"
                    className="text-zinc-400 hover:text-cyan-600 transition-colors"
                  >
                    <CornerDownRight className="h-4 w-4 inline" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const rowName = row[rowNameField] || '新配置';
                      openConfirm("删除配置", `确定删除「${rowName}」配置吗？`, () => {
                        setData(prev => prev.filter((_, i) => i !== idx));
                      });
                    }}
                    title="删除"
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 inline" />
                  </button>
                </td>
                <td className="py-2 px-4 text-center text-zinc-400 border-r border-zinc-100">{idx + 1}</td>
                {sortedCols.filter(col => col.name !== '代码ID (唯一)' && col.id !== 'id').map(col => (
                  <td key={col.id} className={`py-2 px-4 ${!col.isSystem ? 'border-l border-zinc-100' : ''}`}>
                    {renderCell(row, col, idx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-start pb-4 border-b border-zinc-100">
        <button
          type="button"
          onClick={() => insertRow(data.length - 1)}
          className="text-xs font-semibold text-zinc-500 hover:text-cyan-600 transition-colors flex items-center space-x-1"
        >
          <CornerDownRight className="h-3.5 w-3.5" />
          <span>在末尾追加行</span>
        </button>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition"
      >
        <Save className="h-4 w-4" />
        <span>保存配置</span>
      </button>
    </form>
  );
};