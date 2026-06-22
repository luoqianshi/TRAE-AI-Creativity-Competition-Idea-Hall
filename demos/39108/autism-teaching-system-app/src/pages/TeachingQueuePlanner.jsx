import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, ChevronUp, ChevronDown, Trash2, Check } from 'lucide-react';
import {
  getStudentById, getGoalsByType, createTeachingQueue,
  getMaintenancePool, getMasteredLibrary, getCurrentUser,
} from '../data/store';
import { VB_MAPP_DOMAINS } from '../data/vbmapp';

export default function TeachingQueuePlanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = getStudentById(id);
  const currentUser = getCurrentUser();

  // 三类目标池
  const allGoals = getGoalsByType(id, 'level3') || [];
  const activeGoals = allGoals.filter(g => g.status === 'active');
  const maintenancePool = getMaintenancePool(id) || [];
  const masteredLibrary = getMasteredLibrary(id) || [];

  const [selectedItems, setSelectedItems] = useState([]); // [{id, description, type, domain, goalId, hierarchyPath}]

  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };

  const moveItem = (index, direction) => {
    setSelectedItems(prev => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const removeItem = (itemId) => {
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleStart = () => {
    if (selectedItems.length === 0) return;
    const queue = createTeachingQueue({
      studentId: id,
      name: `${currentUser?.name || ''}的课堂`,
      items: selectedItems.map(item => ({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2) + item.id,
        goalId: item.goalId || item.id,
        description: item.description,
        type: item.type,
        domain: item.domain,
        hierarchyPath: item.hierarchyPath || '',
        status: 'pending',
        probeResult: null,
        trials: [],
        finalProbeResult: null,
        passed: null,
        promptLevel: 0,
        barrierTags: [],
        notes: '',
      })),
    });
    navigate(`/students/${id}/training/run/${queue.id}`);
  };

  if (!student) return <div className="p-6">学生不存在</div>;

  const typeLabels = { acquisition: '新授', maintenance: '维持', review: '复习' };
  const typeColors = { acquisition: 'bg-blue-100 text-blue-700', maintenance: 'bg-purple-100 text-purple-700', review: 'bg-green-100 text-green-700' };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <Link to={`/students/${id}/training`} className="p-1 rounded-md hover:bg-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold">规划上课顺序</h1>
          <p className="text-xs text-slate-500">{student.name}</p>
        </div>
        {selectedItems.length > 0 && (
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
            已选 {selectedItems.length} 个
          </span>
        )}
      </div>

      <div className="p-4 space-y-4 pb-32">
        {/* 新授目标 */}
        {activeGoals.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              新授目标（{activeGoals.length}）
            </h2>
            <div className="space-y-1.5">
              {activeGoals.map(goal => {
                const isSelected = selectedItems.some(i => i.id === goal.id);
                const domainInfo = VB_MAPP_DOMAINS[goal.domain];
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleItem({
                      id: goal.id,
                      description: goal.description,
                      type: 'acquisition',
                      domain: goal.domain,
                      goalId: goal.id,
                      hierarchyPath: goal.hierarchyPath || '',
                    })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all active:scale-[0.99] ${
                      isSelected ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm text-slate-700 truncate">{goal.description}</p>
                      <p className="text-xs text-slate-400">{domainInfo?.name || goal.domain}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 维持目标 */}
        {maintenancePool.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              维持目标（{maintenancePool.length}）
            </h2>
            <div className="space-y-1.5">
              {maintenancePool.map(item => {
                const isSelected = selectedItems.some(i => i.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem({
                      id: item.id,
                      description: item.skillName,
                      type: 'maintenance',
                      domain: item.domain || '',
                      goalId: item.goalId,
                      hierarchyPath: '',
                    })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all active:scale-[0.99] ${
                      isSelected ? 'border-purple-400 bg-purple-50' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm text-slate-700 truncate">{item.skillName}</p>
                      <p className="text-xs text-slate-400">维持 · 第{item.week || 1}周</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 精熟库复习 */}
        {masteredLibrary.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              精熟库复习（{masteredLibrary.length}）
            </h2>
            <div className="space-y-1.5">
              {masteredLibrary.map(item => {
                const isSelected = selectedItems.some(i => i.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem({
                      id: item.id,
                      description: item.skillName,
                      type: 'review',
                      domain: item.domain || '',
                      goalId: item.id,
                      hierarchyPath: '',
                    })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all active:scale-[0.99] ${
                      isSelected ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-green-500 bg-green-500' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm text-slate-700 truncate">{item.skillName}</p>
                      <p className="text-xs text-slate-400">复习 · 已复习{item.reviewCount || 0}次</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 已选队列预览 */}
        {selectedItems.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">上课顺序预览</h2>
            <div className="space-y-1.5">
              {selectedItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{index + 1}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[item.type]}`}>
                    {typeLabels[item.type]}
                  </span>
                  <p className="flex-1 text-sm text-slate-700 truncate">{item.description}</p>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveItem(index, 1)}
                      disabled={index === selectedItems.length - 1}
                      className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeGoals.length === 0 && maintenancePool.length === 0 && masteredLibrary.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">暂无可选目标</p>
            <Link to={`/students/${id}/goals`} className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
              先去添加课程目标
            </Link>
          </div>
        )}
      </div>

      {/* 吸底按钮 */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom">
          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <Play size={18} />
            开始上课（{selectedItems.length} 个目标）
          </button>
        </div>
      )}
    </div>
  );
}
