import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Phone, MapPin, FileText, Target, TrendingUp, Activity, RefreshCw, CheckCircle, Star, Utensils, Gamepad2, Heart, Music, Sparkles, Plus, X, Edit2, Users, Clock, MessageSquare, FileUp, UserCog, UserPlus, UserMinus, Shield
} from 'lucide-react';
import {
  getStudentById,
  getStudentStats,
  getGoalsByType,
  getChildGoals,
  getMaintenancePool,
  getMasteredLibrary,
  getReinforcersByStudent,
  addReinforcerItem,
  updateReinforcerItem,
  deleteReinforcerItem,
  getScreeningByStudent,
  updateScreening,
  getCommunicationLogsByStudent,
  addCommunicationLog,
  deleteCommunicationLog,
  getClassHoursByStudent,
  updateClassHours,
  hasPermission,
  getCurrentUser,
  getUsers,
  assignStudentToTeacher,
  removeStudentFromTeacher,
  ROLE_LABELS,
} from '../data/store';

const COMMUNICATION_TYPES = [
  { id: 'parent_meeting', name: '家长会面' },
  { id: 'phone', name: '电话沟通' },
  { id: 'wechat', name: '微信/消息' },
  { id: 'email', name: '邮件' },
  { id: 'other', name: '其他' },
];

export default function StudentDetail() {
  const { id } = useParams();
  const student = getStudentById(id);
  const stats = getStudentStats(id);
  const goals = getGoalsByType(id, 'level1');
  const maintenancePool = getMaintenancePool(id);
  const masteredLibrary = getMasteredLibrary(id);

  const [reinforcers, setReinforcers] = useState(() => getReinforcersByStudent(id));
  const [showAddReinforcer, setShowAddReinforcer] = useState(false);
  const [editingReinforcer, setEditingReinforcer] = useState(null);
  const [newReinforcer, setNewReinforcer] = useState({ name: '', category: 'edible', preferenceLevel: 'high', notes: '' });

  // 初筛数据
  const [screening, setScreening] = useState(() => getScreeningByStudent(id));
  const [editingScreening, setEditingScreening] = useState(false);
  const [screeningForm, setScreeningForm] = useState(() => getScreeningByStudent(id));

  // 家校沟通
  const [communicationLogs, setCommunicationLogs] = useState(() => getCommunicationLogsByStudent(id));
  const [showAddLogForm, setShowAddLogForm] = useState(false);
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], type: 'parent_meeting', content: '', contactPerson: '' });

  // 课时统计
  const [classHours, setClassHours] = useState(() => getClassHoursByStudent(id));
  const [editingHours, setEditingHours] = useState(false);
  const [hoursForm, setHoursForm] = useState(() => getClassHoursByStudent(id));
  const [newSchedule, setNewSchedule] = useState({ day: '', time: '', teacher: '' });

  const [activeTab, setActiveTab] = useState('overview');

  const canEdit = hasPermission('teacher');
  const currentUser = getCurrentUser();
  const isSupervisor = currentUser?.role === 'supervisor';

  // 教师团队管理
  const [allStaff, setAllStaff] = useState(() => getUsers());
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshStudent = () => {
    setRefreshKey(k => k + 1);
  };

  const handleAssignTeacher = (staffId, role) => {
    assignStudentToTeacher(id, staffId, role);
    refreshStudent();
  };

  const handleRemoveTeacher = (staffId, role) => {
    removeStudentFromTeacher(id, staffId, role);
    refreshStudent();
  };

  const handleAddReinforcer = () => {
    if (!newReinforcer.name.trim()) return;
    addReinforcerItem({
      studentId: id,
      name: newReinforcer.name.trim(),
      category: newReinforcer.category,
      preferenceLevel: newReinforcer.preferenceLevel,
      notes: newReinforcer.notes.trim(),
      lastAssessedDate: new Date().toISOString().split('T')[0],
    });
    setReinforcers(getReinforcersByStudent(id));
    setShowAddReinforcer(false);
    setNewReinforcer({ name: '', category: 'edible', preferenceLevel: 'high', notes: '' });
  };

  const handleEditReinforcer = (item) => {
    setEditingReinforcer(item);
    setNewReinforcer({ name: item.name, category: item.category, preferenceLevel: item.preferenceLevel, notes: item.notes || '' });
  };

  const handleSaveEditReinforcer = () => {
    if (!editingReinforcer || !newReinforcer.name.trim()) return;
    updateReinforcerItem(editingReinforcer.id, {
      name: newReinforcer.name.trim(),
      category: newReinforcer.category,
      preferenceLevel: newReinforcer.preferenceLevel,
      notes: newReinforcer.notes.trim(),
    });
    setReinforcers(getReinforcersByStudent(id));
    setEditingReinforcer(null);
    setNewReinforcer({ name: '', category: 'edible', preferenceLevel: 'high', notes: '' });
  };

  const handleDeleteReinforcer = (itemId) => {
    if (!confirm('确定要删除这个强化物记录吗？')) return;
    deleteReinforcerItem(itemId);
    setReinforcers(getReinforcersByStudent(id));
    setEditingReinforcer(null);
  };

  const closeReinforcerModal = () => {
    setShowAddReinforcer(false);
    setEditingReinforcer(null);
    setNewReinforcer({ name: '', category: 'edible', preferenceLevel: 'high', notes: '' });
  };

  const isModalOpen = showAddReinforcer || editingReinforcer !== null;

  // 初筛保存
  const handleSaveScreening = () => {
    updateScreening(id, {
      carsScore: screeningForm.carsScore || '',
      abcScore: screeningForm.abcScore || '',
      assessmentDate: screeningForm.assessmentDate || '',
      developmentalAge: screeningForm.developmentalAge || '',
      additionalNotes: screeningForm.additionalNotes || '',
    });
    setScreening({ ...screeningForm });
    setEditingScreening(false);
  };

  // 沟通记录保存
  const handleAddLog = () => {
    if (!newLog.content.trim()) return;
    addCommunicationLog({
      studentId: id,
      date: newLog.date,
      type: newLog.type,
      content: newLog.content.trim(),
      contactPerson: newLog.contactPerson.trim(),
      recordedBy: getCurrentUser()?.name || '未知',
      recordedById: getCurrentUser()?.id,
    });
    setCommunicationLogs(getCommunicationLogsByStudent(id));
    setShowAddLogForm(false);
    setNewLog({ date: new Date().toISOString().split('T')[0], type: 'parent_meeting', content: '', contactPerson: '' });
  };

  const handleDeleteLog = (logId) => {
    if (!confirm('确定要删除这条沟通记录吗？')) return;
    deleteCommunicationLog(logId);
    setCommunicationLogs(getCommunicationLogsByStudent(id));
  };

  // 课时保存
  const handleSaveHours = () => {
    updateClassHours(id, {
      totalHours: parseInt(hoursForm.totalHours) || 0,
      usedHours: parseInt(hoursForm.usedHours) || 0,
      remainingHours: (parseInt(hoursForm.totalHours) || 0) - (parseInt(hoursForm.usedHours) || 0),
      schedule: hoursForm.schedule,
      renewalDate: hoursForm.renewalDate || '',
    });
    setClassHours(getClassHoursByStudent(id));
    setEditingHours(false);
  };

  const handleAddSchedule = () => {
    if (!newSchedule.day || !newSchedule.time) return;
    const currentSchedule = hoursForm.schedule || [];
    setHoursForm({
      ...hoursForm,
      schedule: [...currentSchedule, { day: newSchedule.day, time: newSchedule.time, teacher: newSchedule.teacher }],
    });
    setNewSchedule({ day: '', time: '', teacher: '' });
  };

  const handleRemoveSchedule = (index) => {
    const currentSchedule = hoursForm.schedule || [];
    setHoursForm({
      ...hoursForm,
      schedule: currentSchedule.filter((_, i) => i !== index),
    });
  };

  if (!student) {
    return <div className="text-center py-12 text-slate-500">学生不存在</div>;
  }

  const getAvatarColor = (name) => {
    const colors = ['bg-primary-500', 'bg-accent-500', 'bg-purple-500', 'bg-rose-500'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const TABS = [
    { key: 'overview', label: '档案概览', icon: FileText },
    { key: 'screening', label: '基础信息 & 初筛', icon: Users },
    { key: 'communication', label: '家校沟通', icon: MessageSquare },
    { key: 'hours', label: '课时统计', icon: Clock },
    ...(isSupervisor ? [{ key: 'team', label: '教师团队', icon: UserCog }] : []),
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{student.name} - 学生档案</h1>
          <p className="text-slate-500 text-sm mt-1">
            {student.gender} · {student.age}岁 · {student.diagnosisType} · 入学 {student.enrolledAt}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: 档案概览 */}
      {activeTab === 'overview' && (
        <>
          {/* 学生信息卡片 */}
          <div className="card p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5"><MapPin size={14} /><span>{student.address}</span></div>
                  <div className="flex items-center gap-1.5"><Phone size={14} /><span>联系人：{student.guardianName} · {student.guardianPhone}</span></div>
                  <div className="flex items-center gap-1.5"><Calendar size={14} /><span>诊断医院：{student.diagnosisHospital}</span></div>
                  <div className="flex items-center gap-1.5"><FileText size={14} /><span>诊断日期：{student.diagnosisDate}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="card p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <Target size={16} className="text-emerald-500" />
                已掌握技能
              </div>
              <div className="text-2xl font-bold text-emerald-600">{stats.masteredCount}</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (stats.masteredCount / 10) * 100)}%` }}></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <Activity size={16} className="text-accent-500" />
                学习中技能
              </div>
              <div className="text-2xl font-bold text-accent-600">{stats.learningCount}</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2">
                <div className="h-full bg-accent-500 rounded-full" style={{ width: `${Math.min(100, (stats.learningCount / 10) * 100)}%` }}></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <FileText size={16} className="text-red-500" />
                待达成目标
              </div>
              <div className="text-2xl font-bold text-red-500">{stats.pendingCount}</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (stats.pendingCount / 10) * 100)}%` }}></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <TrendingUp size={16} className="text-primary-500" />
                目标达成率
              </div>
              <div className="text-2xl font-bold text-primary-600">{Math.round(stats.avgProgress)}%</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${stats.avgProgress}%` }}></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <RefreshCw size={16} className="text-purple-500" />
                维持池观察中
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.maintenancePoolSize}</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (stats.maintenancePoolSize / 5) * 100)}%` }}></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <CheckCircle size={16} className="text-emerald-500" />
                精熟库
              </div>
              <div className="text-2xl font-bold text-emerald-600">{stats.masteredLibrarySize}</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (stats.masteredLibrarySize / 5) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* IEP Goals */}
          <div className="card p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">当前 IEP 目标</h2>
            <Link to={`/students/${id}/goals`} className="text-sm text-primary-600 hover:text-primary-700">查看全部</Link>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => {
                const childGoals = getChildGoals(goal.id);
                const level2Count = childGoals.filter((g) => g.type === 'level2').length;
                const level3Count = childGoals.filter((g) => g.type === 'level3').length;
                return (
                  <div key={goal.id} className="border-l-4 border-primary-500 bg-slate-50 rounded-r-lg p-3">
                    <div className="font-medium text-slate-800">{goal.description}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {level2Count > 0 && <span>二级目标：{level2Count}个</span>}
                      {level2Count > 0 && level3Count > 0 && <span> · </span>}
                      {level3Count > 0 && <span>三级训练项：{level3Count}个</span>}
                    </div>
                    <div className="text-right text-sm">
                      <span className="text-primary-600 font-bold">{goal.progressPct || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${goal.progressPct || 0}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 强化物偏好 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-800">强化物偏好</h2>
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAddReinforcer(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <Plus size={14} />新增强化物
                </button>
              )}
            </div>
            {reinforcers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {reinforcers.map((r) => {
                  const categoryIcons = {
                  edible: <Utensils size={16} className="text-orange-500" />,
                  toy: <Gamepad2 size={16} className="text-blue-500" />,
                  sensory: <Music size={16} className="text-purple-500" />,
                  social: <Heart size={16} className="text-rose-500" />,
                  activity: <Sparkles size={16} className="text-cyan-500" />,
                };
                const levelBadge = {
                  high: { label: '高偏好', cls: 'bg-emerald-100 text-emerald-700' },
                  medium: { label: '中偏好', cls: 'bg-amber-100 text-amber-700' },
                  low: { label: '低偏好', cls: 'bg-slate-100 text-slate-600' },
                  unknown: { label: '未评估', cls: 'bg-slate-50 text-slate-400' },
                };
                const badge = levelBadge[r.preferenceLevel] || levelBadge.unknown;
                const assessedDate = r.lastAssessedDate ? `评估于 ${r.lastAssessedDate.slice(5)}` : '';
                  return (
                    <div
                      key={r.id}
                      onClick={() => canEdit && handleEditReinforcer(r)}
                      className={`border border-slate-200 rounded-lg p-3 ${canEdit ? 'cursor-pointer hover:border-primary-300 hover:bg-primary-50/50' : ''} transition-all`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {categoryIcons[r.category] || <Sparkles size={16} className="text-slate-400" />}
                        <span className="font-medium text-slate-800">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                        {assessedDate && <span className="text-xs text-slate-400">{assessedDate}</span>}
                      </div>
                      {r.notes && <p className="text-xs text-slate-400 mt-1">{r.notes}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Star size={32} className="mx-auto mb-2 opacity-30" />
                <p>暂无强化物记录</p>
              </div>
            )}
          </div>

          {/* 教师备注 */}
          {student.notes && (
            <div className="card p-6 mt-4">
              <h2 className="text-lg font-bold text-slate-800 mb-3">教师备注</h2>
              <p className="text-slate-600 text-sm">{student.notes}</p>
            </div>
          )}
        </>
      )}

      {/* Tab: 基础信息 & 初筛 */}
      {activeTab === 'screening' && (
        <>
          {/* 基础信息 */}
          <div className="card p-6 mb-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">基础信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col"><span className="text-slate-400 text-xs">学生姓名</span><span className="text-slate-800 font-medium">{student.name}</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">性别 / 年龄</span><span className="text-slate-800 font-medium">{student.gender} · {student.age}岁</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">诊断类型</span><span className="text-slate-800 font-medium">{student.diagnosisType}</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">诊断医院</span><span className="text-slate-800 font-medium">{student.diagnosisHospital}</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">诊断日期</span><span className="text-slate-800 font-medium">{student.diagnosisDate}</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">入学日期</span><span className="text-slate-800 font-medium">{student.enrolledAt}</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">当前阶段</span><span className="text-slate-800 font-medium">{student.currentStage}</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">最近评估日期</span><span className="text-slate-800 font-medium">{student.lastAssessmentDate}</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">监护人姓名</span><span className="text-slate-800 font-medium">{student.guardianName}</span></div>
              <div className="flex flex-col"><span className="text-slate-400 text-xs">联系电话</span><span className="text-slate-800 font-medium">{student.guardianPhone}</span></div>
              <div className="flex flex-col md:col-span-2"><span className="text-slate-400 text-xs">居住地址</span><span className="text-slate-800 font-medium">{student.address}</span></div>
            </div>
          </div>

          {/* 初筛信息 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">入园初筛评估</h2>
              {canEdit && (
                <button
                  onClick={() => {
                    if (editingScreening) {
                    setEditingScreening(false);
                  } else {
                    setScreeningForm({ ...screening });
                    setEditingScreening(true);
                  }}}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  {editingScreening ? '取消编辑' : '编辑初筛信息'}
                </button>
              )}
            </div>
            {editingScreening ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CARS 评分</label>
                  <input
                    type="text"
                    value={screeningForm.carsScore || ''}
                    onChange={(e) => setScreeningForm({ ...screeningForm, carsScore: e.target.value })}
                    placeholder="例如：45"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ABC 评分</label>
                  <input
                    type="text"
                    value={screeningForm.abcScore || ''}
                    onChange={(e) => setScreeningForm({ ...screeningForm, abcScore: e.target.value })}
                    placeholder="例如：67"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">入园评估日期</label>
                  <input
                    type="date"
                    value={screeningForm.assessmentDate || ''}
                    onChange={(e) => setScreeningForm({ ...screeningForm, assessmentDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">基础发育年龄</label>
                  <input
                    type="text"
                    value={screeningForm.developmentalAge || ''}
                    onChange={(e) => setScreeningForm({ ...screeningForm, developmentalAge: e.target.value })}
                    placeholder="例如：3岁6个月"
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">备注信息</label>
                  <textarea
                    value={screeningForm.additionalNotes || ''}
                    onChange={(e) => setScreeningForm({ ...screeningForm, additionalNotes: e.target.value })}
                    placeholder="初筛观察记录..."
                    className="input h-20 resize-none"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button className="btn-primary" onClick={handleSaveScreening}>保存初筛信息</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-blue-500 text-xs mb-1">CARS 评分</div>
                  <div className="text-blue-800 font-bold text-lg">{screening.carsScore || '—'}</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <div className="text-amber-500 text-xs mb-1">ABC 评分</div>
                  <div className="text-amber-800 font-bold text-lg">{screening.abcScore || '—'}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <div className="text-emerald-500 text-xs mb-1">入园评估日期</div>
                  <div className="text-emerald-800 font-medium">{screening.assessmentDate || '—'}</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <div className="text-purple-500 text-xs mb-1">基础发育年龄</div>
                  <div className="text-purple-800 font-medium">{screening.developmentalAge || '—'}</div>
                </div>
                {screening.additionalNotes && (
                  <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-slate-500 text-xs mb-1">备注信息</div>
                    <div className="text-slate-700 text-sm">{screening.additionalNotes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: 家校沟通 */}
      {activeTab === 'communication' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">家校沟通记录</h2>
            {canEdit && (
              <button
                onClick={() => setShowAddLogForm(!showAddLogForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <Plus size={14} /> 新增沟通记录
              </button>
            )}
          </div>

          {/* 新增沟通记录表单 */}
          {showAddLogForm && (
            <div className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">沟通日期</label>
                  <input
                    type="date"
                    value={newLog.date}
                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">沟通方式</label>
                  <select
                    value={newLog.type}
                    onChange={(e) => setNewLog({ ...newLog, type: e.target.value })}
                    className="input"
                  >
                    {COMMUNICATION_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">沟通对象</label>
                  <input
                    type="text"
                    value={newLog.contactPerson}
                    onChange={(e) => setNewLog({ ...newLog, contactPerson: e.target.value })}
                    placeholder="例如：王先生"
                    className="input"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">沟通内容</label>
                <textarea
                  value={newLog.content}
                  onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                  placeholder="记录沟通的主要内容和家长反馈..."
                  className="input h-24 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button className="btn-primary" onClick={handleAddLog} disabled={!newLog.content.trim()}>保存记录</button>
              </div>
            </div>
          )}

          {/* 沟通记录列表 */}
          <div className="space-y-3">
            {communicationLogs.length > 0 ? (
              communicationLogs.map((log) => {
                const typeInfo = COMMUNICATION_TYPES.find((t) => t.id === log.type);
                return (
                  <div key={log.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-800">{typeInfo?.name || '沟通'}</span>
                          <span className="text-xs text-slate-400">{log.date}</span>
                          <span className="text-xs text-slate-400">· {log.contactPerson}</span>
                        </div>
                        <div className="text-sm text-slate-600">{log.content}</div>
                        <div className="text-xs text-slate-400 mt-2">记录人：{log.recordedBy}</div>
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-red-400 hover:text-red-600 p-1 shrink-0"
                          title="删除"
                        >
                            <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p>暂无沟通记录</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: 教师团队管理（仅督导可见） */}
      {activeTab === 'team' && isSupervisor && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserCog size={20} className="text-primary-600" />
            教师团队管理
          </h2>

          {/* 当前团队 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-600 mb-3">当前负责教师</h3>
            {student.assignedTeacherIds?.length > 0 || student.assignedAssistantIds?.length > 0 ? (
              <div className="space-y-2">
                {student.assignedTeacherIds?.map(teacherId => {
                  const teacher = allStaff.find(u => u.id === teacherId);
                  if (!teacher) return null;
                  return (
                    <div key={teacherId} className="flex items-center justify-between p-3 bg-primary-50 border border-primary-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">{teacher.name}</span>
                          <span className="text-xs text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded ml-2">{ROLE_LABELS[teacher.role]}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeacher(teacherId, 'teacher')}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        <UserMinus size={12} />
                        移除
                      </button>
                    </div>
                  );
                })}
                {student.assignedAssistantIds?.map(assistantId => {
                  const assistant = allStaff.find(u => u.id === assistantId);
                  if (!assistant) return null;
                  return (
                    <div key={assistantId} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold text-sm">
                          {assistant.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">{assistant.name}</span>
                          <span className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded ml-2">{ROLE_LABELS[assistant.role]}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeacher(assistantId, 'assistant')}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        <UserMinus size={12} />
                        移除
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-lg">
                暂无分配的教师
              </div>
            )}
          </div>

          {/* 添加教师 */}
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-3">添加教师到团队</h3>
            <div className="space-y-2">
              {allStaff
                .filter(u => !student.assignedTeacherIds?.includes(u.id) && !student.assignedAssistantIds?.includes(u.id))
                .map(staff => (
                  <div key={staff.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold text-sm">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-slate-800">{staff.name}</span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-2">{ROLE_LABELS[staff.role]}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignTeacher(staff.id, staff.role)}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 py-1 rounded transition-colors"
                    >
                      <UserPlus size={12} />
                      添加
                    </button>
                  </div>
                ))}
              {allStaff.filter(u => !student.assignedTeacherIds?.includes(u.id) && !student.assignedAssistantIds?.includes(u.id)).length === 0 && (
                <div className="text-center py-4 text-slate-400 text-sm">
                  所有教师已分配
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: 课时统计 */}
      {activeTab === 'hours' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">课时与课程安排</h2>
            {canEdit && (
              <button
                onClick={() => {
                  if (editingHours) {
                    setEditingHours(false);
                  } else {
                    setHoursForm({ ...classHours });
                    setEditingHours(true);
                  }}}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                {editingHours ? '取消编辑' : '编辑课时'}
              </button>
            )}
          </div>

          {editingHours ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">总课时</label>
                  <input
                    type="number"
                    value={hoursForm.totalHours || ''}
                    onChange={(e) => setHoursForm({ ...hoursForm, totalHours: e.target.value })}
                    placeholder="例如：120"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">已使用课时</label>
                  <input
                    type="number"
                    value={hoursForm.usedHours || ''}
                    onChange={(e) => setHoursForm({ ...hoursForm, usedHours: e.target.value })}
                    placeholder="例如：87"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">续费日期</label>
                  <input
                    type="date"
                    value={hoursForm.renewalDate || ''}
                    onChange={(e) => setHoursForm({ ...hoursForm, renewalDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* 课程安排编辑 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">课程安排</label>
                <div className="space-y-2 mb-3">
                  {(hoursForm.schedule || []).map((sch, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">{sch.day} · {sch.time} · {sch.teacher || '未指定老师'}</span>
                      <button
                        onClick={() => handleRemoveSchedule(idx)}
                        className="text-red-400 hover:text-red-600 ml-auto shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={newSchedule.day}
                    onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                    placeholder="星期几"
                    className="input flex-1 min-w-[100px]"
                  />
                  <input
                    type="text"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                    placeholder="时间"
                    className="input flex-1 min-w-[100px]"
                  />
                  <input
                    type="text"
                    value={newSchedule.teacher}
                    onChange={(e) => setNewSchedule({ ...newSchedule, teacher: e.target.value })}
                    placeholder="授课老师"
                    className="input flex-1 min-w-[100px]"
                  />
                  <button className="btn-secondary" onClick={handleAddSchedule} disabled={!newSchedule.day || !newSchedule.time}>添加</button>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary" onClick={handleSaveHours}>保存课时信息</button>
              </div>
            </div>
          ) : (
            <div>
              {/* 课时进度 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="text-blue-500 text-xs mb-1">总课时</div>
                  <div className="text-blue-800 font-bold text-2xl">{classHours.totalHours || 0}</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <div className="text-amber-500 text-xs mb-1">已使用</div>
                  <div className="text-amber-800 font-bold text-2xl">{classHours.usedHours || 0}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  <div className="text-emerald-500 text-xs mb-1">剩余课时</div>
                  <div className="text-emerald-800 font-bold text-2xl">{classHours.remainingHours ?? classHours.totalHours - classHours.usedHours}</div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>课时使用进度</span>
                  <span>
                    {classHours.totalHours > 0 ? Math.round(((classHours.usedHours || 0) / (classHours.totalHours || 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{
                      width: `${classHours.totalHours > 0 ? Math.min(100, ((classHours.usedHours || 0) / classHours.totalHours) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* 续费日期 */}
              {classHours.renewalDate && (
                <div className="mb-6 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <div className="text-purple-500 text-xs">下次续费日期</div>
                  <div className="text-purple-800 font-medium">{classHours.renewalDate}</div>
                </div>
              )}

              {/* 课程安排 */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">每周课程安排</h3>
                <div className="space-y-2">
                  {(classHours.schedule || []).length > 0 ? (
                    (classHours.schedule || []).map((sch, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                          {sch.day}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">{sch.time}</div>
                          <div className="text-xs text-slate-400">授课老师：{sch.teacher || '未指定'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-sm">暂无课程安排</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 新增/编辑强化物弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editingReinforcer ? '编辑强化物' : '新增强化物'}</h3>
              <button onClick={closeReinforcerModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">名称</label>
                <input
                  type="text"
                  value={newReinforcer.name}
                  onChange={(e) => setNewReinforcer({ ...newReinforcer, name: e.target.value })}
                  placeholder="如：小熊饼干、泡泡玩具..."
                  className="input w-full"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">类别</label>
                  <select
                    value={newReinforcer.category}
                    onChange={(e) => setNewReinforcer({ ...newReinforcer, category: e.target.value })}
                    className="input w-full"
                  >
                    <option value="edible">食物</option>
                    <option value="toy">玩具</option>
                    <option value="sensory">感官</option>
                    <option value="social">社交</option>
                    <option value="activity">活动</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">偏好程度</label>
                  <select
                    value={newReinforcer.preferenceLevel}
                    onChange={(e) => setNewReinforcer({ ...newReinforcer, preferenceLevel: e.target.value })}
                    className="input w-full"
                  >
                    <option value="high">高偏好</option>
                    <option value="medium">中偏好</option>
                    <option value="low">低偏好</option>
                    <option value="unknown">未评估</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注（选填）</label>
                <input
                  type="text"
                  value={newReinforcer.notes}
                  onChange={(e) => setNewReinforcer({ ...newReinforcer, notes: e.target.value })}
                  placeholder="如：连续3天偏好稳定..."
                  className="input w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-between mt-6">
              {editingReinforcer && (
                <button
                  onClick={() => handleDeleteReinforcer(editingReinforcer.id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  删除
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={closeReinforcerModal} className="btn-secondary px-4 py-2">取消</button>
                <button
                  onClick={editingReinforcer ? handleSaveEditReinforcer : handleAddReinforcer}
                  disabled={!newReinforcer.name.trim()}
                  className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingReinforcer ? '保存修改' : '确认添加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
