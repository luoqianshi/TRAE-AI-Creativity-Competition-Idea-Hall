import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Target, Calendar, Play, ChevronRight,
  Plus, CheckCircle, Clock, Star, Award, RefreshCw,
  FileText, Users, Printer
} from 'lucide-react';
import {
  getStudentById, getGoalsByType, getGoalsByStudent, getGoalsByType as getGoalsByTypeFn,
  createTeachingSession, getCurrentUser, getTodaySessions, getTeachingSessionsByStudent,
  getTrainingRecordsByStudent, getMaintenancePool, getMasteredLibrary
} from '../data/store';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export default function ClassroomTraining() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const student = getStudentById(id);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'record' ? 'record' : 'lesson');

  // 响应 URL 参数变化切换 tab
  useEffect(() => {
    if (searchParams.get('tab') === 'record') {
      setActiveTab('record');
    }
  }, [searchParams]);

  // --- 备课相关状态 ---
  const [selectedAcquisition, setSelectedAcquisition] = useState(new Set());
  const [selectedMaintenance, setSelectedMaintenance] = useState(new Set());
  const [selectedReview, setSelectedReview] = useState(new Set());

  const today = new Date();
  const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 ${WEEKDAYS[today.getDay()]}`;
  const todayISO = today.toISOString().split('T')[0];

  const allGoals = useMemo(() => {
    return getGoalsByType(id, 'level1')
      .concat(getGoalsByType(id, 'level2'))
      .concat(getGoalsByType(id, 'level3'))
      .concat(getGoalsByType(id, 'mid_term'))
      .concat(getGoalsByType(id, 'long_term'));
  }, [id]);

  const acquisitionGoals = useMemo(() => getGoalsByType(id, 'level3').filter((g) => g.status === 'active'), [id]);
  const maintenancePool = useMemo(() => getMaintenancePool(id), [id]);
  const masteredLibrary = useMemo(() => getMasteredLibrary(id), [id]);
  const todaySessions = useMemo(() => getTodaySessions(id), [id]);
  const allSessions = useMemo(() => getTeachingSessionsByStudent(id), [id]);

  if (!student) return <div className="text-center py-12 text-slate-500">学生不存在</div>;

  // --- 备课目标选择 ---
  const toggleAcquisition = (goalId) => {
    const next = new Set(selectedAcquisition);
    if (next.has(goalId)) next.delete(goalId);
    else next.add(goalId);
    setSelectedAcquisition(next);
  };
  const toggleMaintenance = (poolId) => {
    const next = new Set(selectedMaintenance);
    if (next.has(poolId)) next.delete(poolId);
    else next.add(poolId);
    setSelectedMaintenance(next);
  };
  const toggleReview = (libraryId) => {
    const next = new Set(selectedReview);
    if (next.has(libraryId)) next.delete(libraryId);
    else next.add(libraryId);
    setSelectedReview(next);
  };

  const buildHierarchyPath = (goalId, all) => {
    const goal = all.find((g) => g.id === goalId);
    if (!goal) return '';
    const parts = [];
    let current = goal;
    while (current) {
      parts.unshift(current.description);
      current = current.parentGoalId ? all.find((g) => g.id === current.parentGoalId) : null;
    }
    return parts.join(' > ');
  };

  // --- 开始上课 ---
  const handleStartTeaching = () => {
    if (selectedAcquisition.size === 0 && selectedMaintenance.size === 0 && selectedReview.size === 0) {
      alert('请至少选择一个目标');
      return;
    }
    const currentUser = getCurrentUser();

    const acquisitionGoalsData = acquisitionGoals
      .filter((g) => selectedAcquisition.has(g.id))
      .map((g) => ({
        goalId: g.id, description: g.description, domain: g.domain || '',
        criteria: g.criteria || '', hierarchyPath: buildHierarchyPath(g.id, allGoals),
      }));

    const maintenanceGoalsData = maintenancePool
      .filter((m) => selectedMaintenance.has(m.id))
      .map((m) => ({
        poolId: m.id, skillName: m.skillName, goalId: m.goalId,
      }));

    const reviewGoalsData = masteredLibrary
      .filter((m) => selectedReview.has(m.id))
      .map((m) => ({
        libraryId: m.id, skillName: m.skillName, domain: m.domain || '',
      }));

    const trialGoalsData = [
      ...acquisitionGoalsData.map((g) => ({
        goalId: g.goalId, description: g.description, domain: g.domain,
        hierarchyPath: g.hierarchyPath, type: 'acquisition', probeResult: null, trials: [],
        finalProbeResult: null, passed: null,
      })),
      ...maintenanceGoalsData.map((g) => ({
        goalId: g.goalId, description: g.skillName, domain: '', hierarchyPath: '维持目标',
        type: 'maintenance', probeResult: null, trials: [], finalProbeResult: null, passed: null,
      })),
      ...reviewGoalsData.map((g) => ({
        goalId: g.libraryId, description: g.skillName, domain: g.domain,
        hierarchyPath: '精熟库复习', type: 'review', probeResult: null, trials: [],
        finalProbeResult: null, passed: null,
      })),
    ];

    const session = createTeachingSession({
      studentId: id, date: todayISO,
      teacherId: currentUser?.id, teacherName: currentUser?.name,
      acquisitionGoals: acquisitionGoalsData,
      maintenanceGoals: maintenanceGoalsData, reviewGoals: reviewGoalsData,
      trialGoals: trialGoalsData, status: 'planned',
    });

    navigate(`/students/${id}/teach/${session.id}`);
  };

  // --- 训练记录 ---
  const trainingRecords = useMemo(() => {
    return getTrainingRecordsByStudent(id);
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planned': return { label: '计划中', cls: 'bg-slate-100 text-slate-600' };
      case 'in_progress': return { label: '进行中', cls: 'bg-blue-100 text-blue-700' };
      case 'completed': return { label: '已完成', cls: 'bg-emerald-100 text-emerald-700' };
      default: return { label: status, cls: 'bg-slate-100 text-slate-600' };
    }
  };

  const getGoalDescription = (goalId) => {
    const goal = allGoals.find((g) => g.id === goalId);
    return goal?.description || goalId;
  };

  const getAccuracy = (record) => {
    if (record.totalTrials > 0) return Math.round((record.correctTrials / record.totalTrials) * 100);
    return 0;
  };

  return (
    <div>
      {/* 页面标题 */}
      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{student.name} - 课堂训练记录</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <Calendar size={14} /> <span>{todayStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs 导航 */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('lesson')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'lesson'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen size={16} /> 备课 &amp; 上课
        </button>
        <button
          onClick={() => setActiveTab('record')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'record'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText size={16} /> 训练记录
        </button>
      </div>

      {/* Tab 1: 备课 & 上课 */}
      {activeTab === 'lesson' && (
        <div>
          {/* 今日已有教案 */}
          {todaySessions.length > 0 && (
            <div className="mb-5">
              <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Star size={14} className="text-amber-500" /> 今日已有教案
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {todaySessions.map((session) => {
                  const total = (session.acquisitionGoals?.length || 0) + (session.maintenanceGoals?.length || 0) + (session.reviewGoals?.length || 0);
                  const badge = getStatusBadge(session.status);
                  return (
                    <Link
                      key={session.id}
                      to={`/students/${id}/teach/${session.id}`}
                      className="card p-4 hover:shadow-md transition-shadow cursor-pointer block"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                        <span className="text-xs text-slate-400">{session.teacherName}</span>
                      </div>
                      <div className="text-base font-medium text-slate-800 mb-1">共 {total} 个目标</div>
                      <div className="flex gap-2 text-xs text-slate-500 flex-wrap">
                        {session.acquisitionGoals?.length > 0 && <span className="text-primary-600">({session.acquisitionGoals.length}新授)</span>}
                        {session.maintenanceGoals?.length > 0 && <span className="text-purple-600">({session.maintenanceGoals.length}维持)</span>}
                        {session.reviewGoals?.length > 0 && <span className="text-emerald-600">({session.reviewGoals.length}复习)</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 历史会话 */}
          {allSessions.length > todaySessions.length && (
            <div className="mb-5">
              <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Clock size={14} /> 历史备课记录
              </div>
              <div className="card p-4 mb-5 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allSessions.filter((s) => s.date !== todayISO).map((session) => {
                    const total = (session.acquisitionGoals?.length || 0) + (session.maintenanceGoals?.length || 0) + (session.reviewGoals?.length || 0);
                    const badge = getStatusBadge(session.status);
                    return (
                      <Link
                        key={session.id}
                        to={`/students/${id}/teach/${session.id}`}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800">{session.date}</div>
                          <div className="text-xs text-slate-400">共 {total} 个目标 · {session.teacherName}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 新授目标 */}
          <div className="card mb-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary-600" />
                <div className="text-base font-bold text-slate-800">新授目标</div>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">{acquisitionGoals.length} 个活跃目标</span>
              </div>
              <div className="text-sm text-slate-500">
                已选 <span className="font-bold text-primary-600">{selectedAcquisition.size}</span> 个
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {acquisitionGoals.length === 0 ? (
                <div className="px-5 py-8 text-center text-slate-500">暂无活跃的新授目标</div>
              ) : (
                acquisitionGoals.map((goal) => {
                  const isSelected = selectedAcquisition.has(goal.id);
                  return (
                    <div
                      key={goal.id}
                      className={`px-5 py-4 cursor-pointer transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleAcquisition(goal.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center shrink-0 text-xs font-bold ${isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800">{goal.description}</div>
                          <div className="text-sm text-slate-500 truncate">{buildHierarchyPath(goal.id, allGoals)}</div>
                          {goal.progressPct !== undefined && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-24 h-2 bg-slate-200 rounded-full">
                                <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${goal.progressPct}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">{goal.progressPct}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 维持目标 */}
          {maintenancePool.length > 0 && (
            <div className="card mb-4 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw size={18} className="text-purple-600" />
                  <div className="text-base font-bold text-slate-800">维持目标</div>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">{maintenancePool.length} 个观察中</span>
                </div>
                <div className="text-sm text-slate-500">已选 <span className="font-bold text-purple-600">{selectedMaintenance.size}</span> 个</div>
              </div>
              <div className="divide-y divide-slate-100">
                {maintenancePool.map((item) => {
                  const isSelected = selectedMaintenance.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`px-5 py-4 cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleMaintenance(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center shrink-0 text-xs font-bold ${isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800">{item.skillName}</div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span>进入日期：{item.enteredDate}</span>
                            <span>当前：第{item.week}周</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 精熟库复习 */}
          {masteredLibrary.length > 0 && (
            <div className="card mb-4 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-emerald-600" />
                  <div className="text-base font-bold text-slate-800">精熟库穿插复习</div>
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">{masteredLibrary.length} 个已精熟</span>
                </div>
                <div className="text-sm text-slate-500">已选 <span className="font-bold text-emerald-600">{selectedReview.size}</span> 个</div>
              </div>
              <div className="divide-y divide-slate-100">
                {masteredLibrary.map((item) => {
                  const isSelected = selectedReview.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`px-5 py-4 cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleReview(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center shrink-0 text-xs font-bold ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800">{item.skillName}</div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span>精熟日期：{item.masteredDate}</span>
                            <span>已复习 {item.reviewCount} 次</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 开始上课按钮 */}
          <div className="card p-6 mt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-slate-600">
                共选择
                <span className="font-bold text-primary-600 mx-1">{selectedAcquisition.size + selectedMaintenance.size + selectedReview.size}</span>
                个目标
                {selectedAcquisition.size > 0 && <span className="ml-2">（新授 {selectedAcquisition.size}）</span>}
                {selectedMaintenance.size > 0 && <span className="ml-2 text-purple-600">（维持 {selectedMaintenance.size}）</span>}
                {selectedReview.size > 0 && <span className="ml-2 text-emerald-600">（复习 {selectedReview.size}）</span>}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/students/${id}/training/plan`}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  规划顺序
                </Link>
                <button
                  className="btn-primary flex items-center gap-2 text-base px-6 py-3"
                  onClick={handleStartTeaching}
                  disabled={selectedAcquisition.size === 0 && selectedMaintenance.size === 0 && selectedReview.size === 0}
                >
                  <Play size={18} /> 开始上课
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 训练记录 */}
      {activeTab === 'record' && (
        <div>
          {/* 家长交接总表 */}
          {(() => {
            const completedSessions = allSessions
              .filter((s) => s.status === 'completed')
              .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
              .slice(0, 3);

            const getTypeLabel = (type) => {
              switch (type) {
                case 'acquisition': return { label: '新授', cls: 'bg-blue-100 text-blue-700' };
                case 'maintenance': return { label: '维持', cls: 'bg-purple-100 text-purple-700' };
                case 'review': return { label: '复习', cls: 'bg-emerald-100 text-emerald-700' };
                default: return { label: type, cls: 'bg-slate-100 text-slate-600' };
              }
            };

            const getResultLabel = (passed) => {
              switch (passed) {
                case true: return { label: '通过', cls: 'bg-emerald-100 text-emerald-700' };
                case false: return { label: '未通过', cls: 'bg-red-100 text-red-700' };
                case null: return { label: '进行中', cls: 'bg-blue-100 text-blue-700' };
                default: return { label: '未开始', cls: 'bg-slate-100 text-slate-600' };
              }
            };

            const calcAccuracy = (trials) => {
              if (!trials || trials.length === 0) return 0;
              const correct = trials.filter((t) => t === '+').length;
              return Math.round((correct / trials.length) * 100);
            };

            return (
              <div className="card overflow-hidden mb-5">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-slate-800">家长交接总表</div>
                    <div className="text-xs text-slate-400">最近3次上课记录汇总</div>
                  </div>
                  <button
                    className="print:hidden flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> 打印交接单
                  </button>
                </div>

                {completedSessions.length === 0 ? (
                  <div className="px-5 py-12 text-center text-slate-400">
                    <FileText size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">暂无已完成的上课记录，完成上课后将自动生成交接总表</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {completedSessions.map((session) => {
                      const badge = getStatusBadge(session.status);
                      const trialGoals = session.trialGoals || [];
                      return (
                        <div key={session.id} className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-800">{session.date}</span>
                              <span className="text-xs text-slate-400">授课老师：{session.teacherName}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                          </div>

                          {trialGoals.length === 0 ? (
                            <div className="text-sm text-slate-400 py-4 text-center">暂无详细记录</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-600 text-xs">
                                    <th className="px-3 py-2 text-left font-medium border border-slate-200 w-12">序号</th>
                                    <th className="px-3 py-2 text-left font-medium border border-slate-200">目标名称</th>
                                    <th className="px-3 py-2 text-center font-medium border border-slate-200 w-16">类型</th>
                                    <th className="px-3 py-2 text-center font-medium border border-slate-200 w-16">首测</th>
                                    <th className="px-3 py-2 text-center font-medium border border-slate-200 w-16">尾测</th>
                                    <th className="px-3 py-2 text-center font-medium border border-slate-200 w-16">正确率</th>
                                    <th className="px-3 py-2 text-center font-medium border border-slate-200 w-16">结果</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {trialGoals.map((goal, idx) => {
                                    const typeInfo = getTypeLabel(goal.type);
                                    const resultInfo = getResultLabel(goal.passed);
                                    const accuracy = calcAccuracy(goal.trials);
                                    return (
                                      <tr key={goal.goalId || idx} className="hover:bg-slate-50">
                                        <td className="px-3 py-2 border border-slate-200 text-slate-500">{idx + 1}</td>
                                        <td className="px-3 py-2 border border-slate-200 text-slate-800">{goal.description}</td>
                                        <td className="px-3 py-2 border border-slate-200 text-center">
                                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeInfo.cls}`}>{typeInfo.label}</span>
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-center text-slate-500">{goal.probeResult !== null && goal.probeResult !== undefined ? goal.probeResult : '-'}</td>
                                        <td className="px-3 py-2 border border-slate-200 text-center text-slate-500">{goal.finalProbeResult !== null && goal.finalProbeResult !== undefined ? goal.finalProbeResult : '-'}</td>
                                        <td className="px-3 py-2 border border-slate-200 text-center font-medium text-slate-700">{accuracy}%</td>
                                        <td className="px-3 py-2 border border-slate-200 text-center">
                                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${resultInfo.cls}`}>{resultInfo.label}</span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <div className="text-base font-bold text-slate-800">历史训练记录</div>
              <div className="text-xs text-slate-400">共 {trainingRecords.length} 条记录</div>
            </div>
            <div className="divide-y divide-slate-100">
              {trainingRecords.length === 0 ? (
                <div className="px-5 py-12 text-center text-slate-400">
                  <FileText size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">暂无训练记录</p>
                  <p className="text-xs mt-1">请先在"备课 &amp; 上课"选择目标并完成上课</p>
                </div>
              ) : (
                trainingRecords.map((record) => {
                  const goal = allGoals.find((g) => g.id === record.goalId);
                  const totalCount = record.totalTrials || 0;
                  const correctCount = record.correctTrials || 0;
                  const errorCount = record.errorTrials || (totalCount - correctCount);
                  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : (record.value || 0);
                  return (
                    <div key={record.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-slate-800">
                          {goal?.description || '未找到目标'}
                        </div>
                        <div className="text-base font-bold text-primary-600">
                          {accuracy}%
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                        <span>{record.recordDate}</span>
                        <span>·</span>
                        <span>{record.recorderName}</span>
                        {record.promptLevel !== undefined && record.promptLevel !== null && (
                          <>
                            <span>·</span>
                            <span>辅助: {record.promptLevel === 0 ? '独立' : record.promptLevel === 1 ? '视觉提示' : record.promptLevel === 2 ? '听觉提示' : '肢体辅助'}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>正确 {correctCount}</span>
                        <span>/</span>
                        <span>错误 {errorCount}</span>
                        <span>/</span>
                        <span>共 {totalCount || 1} 次</span>
                      </div>
                      {record.notes && <div className="text-xs text-slate-500 mt-1">{record.notes}</div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}