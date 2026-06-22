import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, ChevronDown, ChevronUp, Lock, Unlock, Trash2 } from 'lucide-react';
import { getStudentById, getGoalsByType, getChildGoals, addGoal, updateGoal, hasPermission, getCurrentUser } from '../data/store';
import { VB_MAPP_DOMAINS, VB_MAPP_LEVELS } from '../data/vbmapp';
import AddGoalModal from '../components/AddGoalModal';

export default function IEPGoals() {
  const { id } = useParams();
  const student = getStudentById(id);
  const currentUser = getCurrentUser();
  const isSupervisor = hasPermission('supervisor');
  const isTeacher = hasPermission('teacher');

  const [activeTab, setActiveTab] = useState('level1');
  const [expandedGoals, setExpandedGoals] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addGoalType, setAddGoalType] = useState('level3');

  // Force re-render key
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

  if (!student) return <div className="text-center py-12 text-slate-500">学生不存在</div>;

  const level1Goals = getGoalsByType(id, 'level1');
  const midTermGoals = getGoalsByType(id, 'mid_term');
  const longTermGoals = getGoalsByType(id, 'long_term');

  const toggleExpand = (goalId) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  const isExpanded = (goalId) => expandedGoals.has(goalId);

  const handleGoalAdded = () => {
    refresh();
    setShowAddModal(false);
  };

  const handleDeleteGoal = (goalId) => {
    if (!window.confirm('确定要删除该训练项吗？')) return;
    // Mark as deleted by removing from goals (soft delete via status)
    updateGoal(goalId, { status: 'deleted' });
    refresh();
  };

  const handleAddGoal = (type) => {
    setAddGoalType(type);
    setShowAddModal(true);
  };

  const getStatusTag = (status) => {
    if (status === 'mastered') return <span className="tag tag-success text-xs">已精熟</span>;
    if (status === 'active') return <span className="tag tag-warn text-xs">进行中</span>;
    if (status === 'deleted') return <span className="tag tag-danger text-xs">已删除</span>;
    return <span className="tag text-xs">{status}</span>;
  };

  const tabs = [
    { key: 'level1', label: '一级目标', sub: 'VB-MAPP 里程碑' },
    { key: 'mid_long', label: '中长期目标', sub: '中期 / 长期' },
  ];

  // Only show level1 tab for supervisors
  const visibleTabs = isSupervisor ? tabs : (isTeacher ? [tabs[1]] : tabs);

  return (
    <div key={refreshKey}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{student.name} - IEP 目标</h1>
          <p className="text-slate-500 mt-1">计划周期：2026.04 - 2026.07</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => handleAddGoal(isSupervisor ? 'level1' : 'level3')}
        >
          <Plus size={18} />
          新增目标
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {visibleTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="text-xs text-slate-400 ml-1">{tab.sub}</span>
          </button>
        ))}
      </div>

      {/* Level 1 Goals Section */}
      {activeTab === 'level1' && (
        <div className="space-y-4">
          {level1Goals.map(goal => {
            const level2Goals = getChildGoals(goal.id);
            const expanded = isExpanded(goal.id);

            return (
              <div key={goal.id} className="card overflow-hidden">
                {/* Level 1 Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpand(goal.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{goal.description}</h3>
                        {goal.locked ? (
                          <Lock size={14} className="text-slate-400" />
                        ) : (
                          <Unlock size={14} className="text-slate-400" />
                        )}
                        <button className="p-1 rounded hover:bg-slate-200">
                          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="tag tag-primary text-xs">
                          {VB_MAPP_DOMAINS[goal.domain]?.name || goal.domain}
                        </span>
                        <span className="tag tag-primary text-xs">
                          {VB_MAPP_LEVELS[goal.stage]?.name || goal.stage}
                        </span>
                        {level2Goals.length > 0 && (
                          <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                            {level2Goals.length} 个子目标
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 2 Goals */}
                {expanded && level2Goals.length > 0 && (
                  <div className="border-t border-slate-100 px-5 pb-4">
                    <div className="text-sm font-medium text-slate-500 mt-4 mb-3">二级目标（课程框架）</div>
                    <div className="space-y-3">
                      {level2Goals.map(l2 => {
                        const level3Goals = getChildGoals(l2.id);
                        const l2Expanded = isExpanded(l2.id);

                        return (
                          <div key={l2.id} className="bg-slate-50 rounded-lg overflow-hidden">
                            {/* Level 2 Header */}
                            <div
                              className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={() => toggleExpand(l2.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700">{l2.description}</span>
                                    {l2.locked ? (
                                      <Lock size={12} className="text-slate-400" />
                                    ) : (
                                      <Unlock size={12} className="text-slate-400" />
                                    )}
                                    <button className="p-1 rounded hover:bg-slate-200">
                                      {l2Expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="tag text-xs">{VB_MAPP_DOMAINS[l2.domain]?.name || l2.domain}</span>
                                    {level3Goals.length > 0 && (
                                      <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                                        {level3Goals.length} 个训练项
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Level 3 Goals */}
                            {l2Expanded && (
                              <div className="border-t border-slate-200 px-4 pb-3">
                                <div className="text-xs font-medium text-slate-400 mt-3 mb-2">三级目标（训练项）</div>
                                <div className="space-y-2">
                                  {level3Goals.map(l3 => (
                                    <div key={l3.id} className="bg-white rounded-lg p-3 border border-slate-100">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-slate-700">{l3.description}</div>
                                          {l3.criteria && (
                                            <div className="text-xs text-slate-500 mt-1">
                                              达成标准：{l3.criteria}
                                            </div>
                                          )}
                                          <div className="flex items-center gap-2 mt-2">
                                            {getStatusTag(l3.status)}
                                            {l3.domain && <span className="tag text-xs">{l3.domain}</span>}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          {l3.progressPct !== undefined && (
                                            <div className="text-right min-w-[60px]">
                                              <div className="text-sm font-bold text-slate-700">{l3.progressPct}%</div>
                                              <div className="text-xs text-slate-400">进度</div>
                                            </div>
                                          )}
                                          {isTeacher && l3.status !== 'deleted' && (
                                            <button
                                              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                                              onClick={(e) => { e.stopPropagation(); handleDeleteGoal(l3.id); }}
                                              title="删除训练项"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {l3.progressPct !== undefined && (
                                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2">
                                          <div
                                            className={`h-full rounded-full transition-all ${
                                              l3.status === 'mastered' ? 'bg-green-500' : 'bg-accent-500'
                                            }`}
                                            style={{ width: `${l3.progressPct}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Add level3 button for teachers */}
                                {isTeacher && (
                                  <button
                                    className="mt-3 w-full py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 flex items-center justify-center gap-1 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); handleAddGoal('level3'); }}
                                  >
                                    <Plus size={14} />
                                    新增训练项
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {expanded && level2Goals.length === 0 && (
                  <div className="border-t border-slate-100 px-5 py-4">
                    <p className="text-sm text-slate-400">暂无二级目标</p>
                    {isSupervisor && (
                      <button
                        className="btn-secondary mt-2 text-sm"
                        onClick={(e) => { e.stopPropagation(); handleAddGoal('level2'); }}
                      >
                        <Plus size={14} className="inline mr-1" />
                        新增二级目标
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {level1Goals.length === 0 && (
            <div className="text-center py-12 card">
              <p className="text-slate-500">暂无一级目标</p>
              {isSupervisor && (
                <button className="btn-primary mt-4" onClick={() => handleAddGoal('level1')}>
                  创建第一个一级目标
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mid-term / Long-term Goals Section */}
      {activeTab === 'mid_long' && (
        <div className="space-y-6">
          {/* Mid-term Goals */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3">中期目标</h2>
            <div className="space-y-3">
              {midTermGoals.map(goal => (
                <div key={goal.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{goal.description}</div>
                      {goal.criteria && (
                        <div className="text-sm text-slate-500 mt-1">达成标准：{goal.criteria}</div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusTag(goal.status)}
                        {goal.startDate && goal.endDate && (
                          <span className="text-xs text-slate-400">
                            {goal.startDate} - {goal.endDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {goal.progressPct !== undefined && (
                      <div className="text-right min-w-[80px]">
                        <div className="text-2xl font-bold text-primary-600">{goal.progressPct}%</div>
                        <div className="text-xs text-slate-400">总进度</div>
                      </div>
                    )}
                  </div>
                  {goal.progressPct !== undefined && (
                    <div className="w-full h-2.5 bg-slate-100 rounded-full mt-3">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${goal.progressPct}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {midTermGoals.length === 0 && (
                <div className="card p-6 text-center">
                  <p className="text-slate-500">暂无中期目标</p>
                  {isSupervisor && (
                    <button className="btn-primary mt-3 text-sm" onClick={() => handleAddGoal('mid_term')}>
                      新增中期目标
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Long-term Goals */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3">长期目标</h2>
            <div className="space-y-3">
              {longTermGoals.map(goal => (
                <div key={goal.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{goal.description}</div>
                      {goal.criteria && (
                        <div className="text-sm text-slate-500 mt-1">达成标准：{goal.criteria}</div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusTag(goal.status)}
                        {goal.startDate && goal.endDate && (
                          <span className="text-xs text-slate-400">
                            {goal.startDate} - {goal.endDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {goal.progressPct !== undefined && (
                      <div className="text-right min-w-[80px]">
                        <div className="text-2xl font-bold text-primary-600">{goal.progressPct}%</div>
                        <div className="text-xs text-slate-400">总进度</div>
                      </div>
                    )}
                  </div>
                  {goal.progressPct !== undefined && (
                    <div className="w-full h-2.5 bg-slate-100 rounded-full mt-3">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${goal.progressPct}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {longTermGoals.length === 0 && (
                <div className="card p-6 text-center">
                  <p className="text-slate-500">暂无长期目标</p>
                  {isSupervisor && (
                    <button className="btn-primary mt-3 text-sm" onClick={() => handleAddGoal('long_term')}>
                      新增长期目标
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddGoalModal
          studentId={id}
          initialType={addGoalType}
          onClose={() => setShowAddModal(false)}
          onAdd={handleGoalAdded}
        />
      )}
    </div>
  );
}
