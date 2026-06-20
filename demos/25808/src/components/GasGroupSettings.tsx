import React from 'react';
import { Settings, X, Save } from 'lucide-react';
import { GasGroupConfig, DailyFieldConfig } from '../shared/types';

interface GasGroupSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GasGroupConfig[];
  saveGroups: (groups: GasGroupConfig[]) => void;
  allGasFields: DailyFieldConfig[];
}

export const GasGroupSettings: React.FC<GasGroupSettingsProps> = ({
  isOpen,
  onClose,
  groups,
  saveGroups,
  allGasFields,
}) => {
  const [localGroups, setLocalGroups] = React.useState<GasGroupConfig[]>(groups);

  React.useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  if (!isOpen) return null;

  const handleAddGroup = () => {
    setLocalGroups(prev => [...prev, { id: 'group_' + Date.now(), name: '新分组', memberIds: [] }]);
  };

  const handleDeleteGroup = (groupId: string) => {
    setLocalGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleUpdateGroup = (groupId: string, name: string, memberIds: string[]) => {
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, name, memberIds } : g));
  };

  const handleSave = () => {
    saveGroups(localGroups);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600" />
            分组仪表配置
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-lg">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-6">
          {localGroups.map(group => (
            <div key={group.id} className="space-y-3 p-3 border border-zinc-100 rounded-lg bg-zinc-50/50">
              <div className="flex gap-2">
                <input
                  className="flex-grow px-3 py-2 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-900"
                  value={group.name}
                  onChange={e => handleUpdateGroup(group.id, e.target.value, group.memberIds)}
                />
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-zinc-100 rounded-lg bg-white">
                {allGasFields.map(field => (
                  <label key={field.id} className="flex items-center gap-2 text-xs text-zinc-700 p-1 hover:bg-zinc-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={group.memberIds.includes(field.id)}
                      onChange={e => {
                        const newMemberIds = e.target.checked
                          ? [...group.memberIds, field.id]
                          : group.memberIds.filter(id => id !== field.id);
                        handleUpdateGroup(group.id, group.name, newMemberIds);
                      }}
                      className="rounded accent-orange-600 text-orange-600 focus:ring-orange-500"
                    />
                    {field.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleAddGroup}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-orange-600 border border-dashed border-orange-200 rounded-lg hover:bg-orange-50"
          >
            + 添加分组
          </button>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
