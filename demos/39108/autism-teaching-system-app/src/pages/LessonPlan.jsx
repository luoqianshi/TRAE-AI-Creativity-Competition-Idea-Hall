import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckSquare, Square, BookOpen, Target, RefreshCw,
  Award, ChevronRight, Calendar, Play,
} from 'lucide-react';
import {
  getStudentById,
  getGoalsByType,
  getChildGoals,
  getMaintenancePool,
  getMasteredLibrary,
  createTeachingSession,
  getCurrentUser,
  getTodaySessions,
} from '../data/store';

const buildHierarchyPath = (goalId, allGoals) => {
  const goal = allGoals.find(g => g.id === goalId);
  if (!goal) return goal?.description || '';
  const parts = [];
  // Find parent chain
  let current = goal;
  while (current) {
    parts.unshift(current.description);
    current = current.parentGoalId ? allGoals.find(g => g.id === current.parentGoalId) : null;
  }
  return parts.join(' > ');
};

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export default function LessonPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = getStudentById(id);
  const currentUser = getCurrentUser();

  const [selectedAcquisition, setSelectedAcquisition] = useState(new Set());
  const [selectedMaintenance, setSelectedMaintenance] = useState(new Set());
  const [selectedReview, setSelectedReview] = useState(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

  // Today's date display
  const today = new Date();
  const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 ${WEEKDAYS[today.getDay()]}`;
  const todayISO = today.toISOString().split('T')[0];

  // All goals for this student (used for hierarchy path building)
  const allGoals = useMemo(() => {
    return getGoalsByType(id, 'level1')
      .concat(getGoalsByType(id, 'level2'))
      .concat(getGoalsByType(id, 'level3'))
      .concat(getGoalsByType(id, 'mid_term'))
      .concat(getGoalsByType(id, 'long_term'));
  }, [id, refreshKey]);

  // Active level3 goals (acquisition goals)
  const acquisitionGoals = useMemo(() => {
    return getGoalsByType(id, 'level3').filter(g => g.status === 'active');
  }, [id, refreshKey]);

  // Maintenance pool
  const maintenancePool = useMemo(() => {
    return getMaintenancePool(id);
  }, [id, refreshKey]);

  // Mastered library
  const masteredLibrary = useMemo(() => {
    return getMasteredLibrary(id);
  }, [id, refreshKey]);

  // Today's existing sessions
  const todaySessions = useMemo(() => {
    return getTodaySessions(id);
  }, [id, refreshKey]);

  if (!student) {
    return <div className="text-center py-12 text-slate-500">学生不存在</div>;
  }

  // Toggle handlers
  const toggleAcquisition = (goalId) => {
    setSelectedAcquisition(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const toggleMaintenance = (poolId) => {
    setSelectedMaintenance(prev => {
      const next = new Set(prev);
      if (next.has(poolId)) next.delete(poolId);
      else next.add(poolId);
      return next;
    });
  };

  const toggleReview = (libraryId) => {
    setSelectedReview(prev => {
      const next = new Set(prev);
      if (next.has(libraryId)) next.delete(libraryId);
      else next.add(libraryId);
      return next;
    });
  };

  // Generate lesson plan - select all by default
  const handleGenerate = () => {
    setSelectedAcquisition(new Set(acquisitionGoals.map(g => g.id)));
    setSelectedMaintenance(new Set(maintenancePool.map(m => m.id)));
    setSelectedReview(new Set(masteredLibrary.map(m => m.id)));
  };

  // Start teaching session
  const handleStartTeaching = () => {
    if (selectedAcquisition.size === 0 && selectedMaintenance.size === 0 && selectedReview.size === 0) {
      alert('请至少选择一个目标');
      return;
    }

    const acquisitionGoalsData = acquisitionGoals
      .filter(g => selectedAcquisition.has(g.id))
      .map(g => ({
        goalId: g.id,
        description: g.description,
        domain: g.domain || '',
        criteria: g.criteria || '',
        hierarchyPath: buildHierarchyPath(g.id, allGoals),
      }));

    const maintenanceGoalsData = maintenancePool
      .filter(m => selectedMaintenance.has(m.id))
      .map(m => ({
        poolId: m.id,
        skillName: m.skillName,
        goalId: m.goalId,
      }));

    const reviewGoalsData = masteredLibrary
      .filter(m => selectedReview.has(m.id))
      .map(m => ({
        libraryId: m.id,
        skillName: m.skillName,
        domain: m.domain || '',
      }));

    // 将所有选中的目标转换为 trialGoals 格式（供上课记录使用）
    const trialGoalsData = [
      ...acquisitionGoalsData.map(g => ({
        goalId: g.goalId,
        description: g.description,
        domain: g.domain,
        hierarchyPath: g.hierarchyPath,
        type: 'acquisition',
        probeResult: null,
        trials: [],
        finalProbeResult: null,
        passed: null,
      })),
      ...maintenanceGoalsData.map(g => ({
        goalId: g.goalId,
        description: g.skillName,
        domain: '',
        hierarchyPath: '维持目标',
        type: 'maintenance',
        probeResult: null,
        trials: [],
        finalProbeResult: null,
        passed: null,
      })),
      ...reviewGoalsData.map(g => ({
        goalId: g.libraryId,
        description: g.skillName,
        domain: g.domain,
        hierarchyPath: '精熟库复习',
        type: 'review',
        probeResult: null,
        trials: [],
        finalProbeResult: null,
        passed: null,
      })),
    ];

    const session = createTeachingSession({
      studentId: id,
      date: todayISO,
      teacherId: currentUser?.id,
      teacherName: currentUser?.name,
      acquisitionGoals: acquisitionGoalsData,
      maintenanceGoals: maintenanceGoalsData,
      reviewGoals: reviewGoalsData,
      trialGoals: trialGoalsData,
      status: 'planned',
    });

    refresh();
    navigate(`/students/${id}/teach/${session.id}`);
  };

  // Status badge renderer
  const getStatusBadge = (status) => {
    switch (status) {
      case 'planned':
        return <span className="tag text-xs">计划中</span>;
      case 'in_progress':
        return (
          <span className="tag tag-primary text-xs animate-pulse">
            进行中
          </span>
        );
      case 'completed':
        return <span className="tag tag-success text-xs">已完成</span>;
      default:
        return <span className="tag text-xs">{status}</span>;
    }
  };

  // Maintenance status badge
  const getMaintenanceStatusBadge = (status) => {
    switch (status) {
      case 'observing':
        return <span className="tag tag-primary text-xs">观察中</span>;
      case 'passed':
        return <span className="tag tag-success text-xs">已通过</span>;
      case 'failed':
        return <span className="tag tag-danger text-xs">需回流</span>;
      default:
        return <span className="tag text-xs">{status}</span>;
    }
  };

  return (
    <div key={refreshKey}>
      {/* Back button */}
      <Link
        to={`/students/${id}`}
        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4"
      >
        <ChevronRight size={16} className="rotate-180" />
        <span className="text-sm">返回学生详情</span>
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <BookOpen size={24} className="text-primary-600" />
              <h1 className="text-2xl font-bold text-slate-800">
                {student.name} - 备课
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-2 text-slate-500">
              <Calendar size={16} />
              <span>{todayStr}</span>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={handleGenerate}>
            <Target size={18} />
            生成今日教案
          </button>
        </div>
      </div>

      {/* Today's existing sessions */}
      {todaySessions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">今日已有教案</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaySessions.map(session => {
              const totalGoals =
                (session.acquisitionGoals?.length || 0) +
                (session.maintenanceGoals?.length || 0) +
                (session.reviewGoals?.length || 0);
              return (
                <Link
                  key={session.id}
                  to={`/students/${id}/teach/${session.id}`}
                  className="card p-4 hover:shadow-md transition-shadow cursor-pointer block"
                >
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(session.status)}
                    <span className="text-xs text-slate-400">
                      {session.teacherName}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    共 {totalGoals} 个目标
                    {session.acquisitionGoals?.length > 0 && (
                      <span className="text-primary-600 ml-1">
                        ({session.acquisitionGoals.length}新授)
                      </span>
                    )}
                    {session.maintenanceGoals?.length > 0 && (
                      <span className="text-purple-600 ml-1">
                        ({session.maintenanceGoals.length}维持)
                      </span>
                    )}
                    {session.reviewGoals?.length > 0 && (
                      <span className="text-emerald-600 ml-1">
                        ({session.reviewGoals.length}复习)
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 1: Acquisition Goals */}
      <div className="card mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-primary-600" />
            <h2 className="text-lg font-bold text-slate-800">新授目标</h2>
            <span className="tag tag-primary text-xs">
              {acquisitionGoals.length} 个活跃目标
            </span>
          </div>
          <div className="text-sm text-slate-500">
            已选择 <span className="font-bold text-primary-600">{selectedAcquisition.size}</span> 个新授目标
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {acquisitionGoals.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              暂无活跃的新授目标
            </div>
          ) : (
            acquisitionGoals.map(goal => {
              const isSelected = selectedAcquisition.has(goal.id);
              const hierarchyPath = buildHierarchyPath(goal.id, allGoals);
              return (
                <div
                  key={goal.id}
                  className={`px-6 py-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => toggleAcquisition(goal.id)}
                >
                  <div className="flex items-start gap-3">
                    {isSelected ? (
                      <CheckSquare size={20} className="text-primary-600 mt-0.5 shrink-0" />
                    ) : (
                      <Square size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-800">{goal.description}</span>
                        {goal.domain && <span className="tag tag-primary text-xs">{goal.domain}</span>}
                      </div>
                      <div className="text-sm text-slate-500 mt-1 truncate">
                        {hierarchyPath}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {goal.progressPct !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">进度</span>
                            <div className="w-24 h-2 bg-slate-200 rounded-full">
                              <div
                                className="h-full bg-primary-500 rounded-full transition-all"
                                style={{ width: `${goal.progressPct}%` }}
                              />
                            </div>
                            <span className="font-medium text-slate-700">{goal.progressPct}%</span>
                          </div>
                        )}
                        {goal.criteria && (
                          <span className="text-slate-400 text-xs">
                            达成标准：{goal.criteria}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Maintenance Goals */}
      <div className="card mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-purple-600" />
            <h2 className="text-lg font-bold text-slate-800">维持目标</h2>
            <span className="tag tag-warn text-xs">
              {maintenancePool.length} 个观察中
            </span>
          </div>
          <div className="text-sm text-slate-500">
            已选择 <span className="font-bold text-purple-600">{selectedMaintenance.size}</span> 个维持目标
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {maintenancePool.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              暂无维持池中的技能
            </div>
          ) : (
            maintenancePool.map(item => {
              const isSelected = selectedMaintenance.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`px-6 py-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-purple-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => toggleMaintenance(item.id)}
                >
                  <div className="flex items-start gap-3">
                    {isSelected ? (
                      <CheckSquare size={20} className="text-purple-600 mt-0.5 shrink-0" />
                    ) : (
                      <Square size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-800">{item.skillName}</span>
                        {getMaintenanceStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>进入日期：{item.enteredDate}</span>
                        <span>当前：第{item.week}周</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 3: Mastered Library Review */}
      <div className="card mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800">精熟库穿插复习</h2>
            <span className="tag tag-success text-xs">
              {masteredLibrary.length} 个已精熟
            </span>
          </div>
          <div className="text-sm text-slate-500">
            已选择 <span className="font-bold text-emerald-600">{selectedReview.size}</span> 个复习目标
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {masteredLibrary.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              精熟库为空
            </div>
          ) : (
            masteredLibrary.map(item => {
              const isSelected = selectedReview.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`px-6 py-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => toggleReview(item.id)}
                >
                  <div className="flex items-start gap-3">
                    {isSelected ? (
                      <CheckSquare size={20} className="text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <Square size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-800">{item.skillName}</span>
                        {item.domain && <span className="tag text-xs">{item.domain}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>精熟日期：{item.masteredDate}</span>
                        <span>已复习 {item.reviewCount} 次</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Start Teaching Button */}
      <div className="card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-slate-600">
            共选择{' '}
            <span className="font-bold text-primary-600">{selectedAcquisition.size}</span>{' '}
            个新授目标、
            <span className="font-bold text-purple-600">{selectedMaintenance.size}</span>{' '}
            个维持目标、
            <span className="font-bold text-emerald-600">{selectedReview.size}</span>{' '}
            个复习目标
          </div>
          <button
            className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
            onClick={handleStartTeaching}
            disabled={
              selectedAcquisition.size === 0 &&
              selectedMaintenance.size === 0 &&
              selectedReview.size === 0
            }
          >
            <Play size={20} />
            开始上课
          </button>
        </div>
      </div>
    </div>
  );
}
