import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, UserPlus, UserMinus, ChevronDown, ChevronUp,
  BookOpen, AlertTriangle, BarChart3, Shield, Phone, ArrowLeft,
} from 'lucide-react';
import {
  getCurrentUser, hasPermission, getStudents, getGoalsByType,
  getTeachingSessionsByStudent, getBehaviorRecordsByStudent,
  getUsers, assignStudentToTeacher, removeStudentFromTeacher,
} from '../data/store';

export default function TeacherManagement() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isSupervisor = currentUser?.role === 'supervisor';

  const [staff, setStaff] = useState(() => getUsers());
  const [students, setStudents] = useState(() => getStudents());
  const [expandedCards, setExpandedCards] = useState({});
  const [assignForm, setAssignForm] = useState({});

  // 权限检查
  if (!isSupervisor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield size={48} className="text-slate-300 mb-4" />
        <p className="text-lg text-slate-500">仅督导可访问此页面</p>
      </div>
    );
  }

  // 统计数据
  const teachers = staff.filter(u => u.role === 'teacher');
  const assistants = staff.filter(u => u.role === 'assistant');
  const teacherCount = teachers.length;
  const assistantCount = assistants.length;
  const studentCount = students.length;
  const ratio = teacherCount > 0 ? `1:${Math.round(studentCount / teacherCount)}` : 'N/A';

  // 获取教师负责的学生
  const getAssignedStudents = (userId, role) => {
    if (role === 'teacher') {
      return students.filter(s => s.assignedTeacherIds?.includes(userId));
    }
    return students.filter(s => s.assignedAssistantIds?.includes(userId));
  };

  // 获取未分配给该教师的学生
  const getUnassignedStudents = (userId, role) => {
    return students.filter(s => {
      if (role === 'teacher') {
        return !s.assignedTeacherIds?.includes(userId);
      }
      return !s.assignedAssistantIds?.includes(userId);
    });
  };

  // 获取本周的日期范围
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // 周一为起始
    const start = new Date(now);
    start.setDate(now.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // 获取学生活跃目标数
  const getActiveGoalCount = (studentId) => {
    const goals = getGoalsByType(studentId, 'level3');
    return goals.filter(g => g.status === 'active').length;
  };

  // 获取本周上课次数
  const getThisWeekSessionCount = (studentId) => {
    const sessions = getTeachingSessionsByStudent(studentId);
    const weekStart = getWeekStart();
    return sessions.filter(s => {
      const d = new Date(s.date || s.createdAt);
      return d >= weekStart;
    }).length;
  };

  // 获取本周问题行为次数
  const getThisWeekBehaviorCount = (studentId) => {
    const records = getBehaviorRecordsByStudent(studentId);
    const weekStart = getWeekStart();
    return records.filter(r => {
      const d = new Date(r.createdAt || r.recordDate);
      return d >= weekStart;
    }).length;
  };

  // 头像颜色
  const getAvatarColor = (name) => {
    const colors = ['bg-primary-500', 'bg-accent-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // 状态标签
  const getStatusTag = (status) => {
    switch (status) {
      case 'active': return <span className="tag tag-success">在训</span>;
      case 'graduated': return <span className="tag tag-primary">已毕业</span>;
      default: return <span className="tag tag-warn">需评估</span>;
    }
  };

  // 角色标签
  const getRoleTag = (role) => {
    if (role === 'teacher') return <span className="tag tag-primary">教师</span>;
    return <span className="tag tag-warn">助教</span>;
  };

  // 工作量边框颜色
  const getWorkloadBorderColor = (studentCount) => {
    if (studentCount > 4) return 'border-l-amber-400';
    if (studentCount < 2) return 'border-l-blue-400';
    return 'border-l-primary-400';
  };

  const getWorkloadBgColor = (studentCount) => {
    if (studentCount > 4) return 'bg-amber-50';
    if (studentCount < 2) return 'bg-blue-50';
    return '';
  };

  // 展开/收起卡片
  const toggleCard = (userId) => {
    setExpandedCards(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // 分配学生
  const handleAssign = (userId, role) => {
    const studentId = assignForm[userId];
    if (!studentId) return;
    assignStudentToTeacher(studentId, userId, role);
    setStudents(getStudents());
    setStaff(getUsers());
    setAssignForm(prev => ({ ...prev, [userId]: '' }));
  };

  // 移除学生
  const handleRemove = (studentId, userId, role) => {
    removeStudentFromTeacher(studentId, userId, role);
    setStudents(getStudents());
    setStaff(getUsers());
  };

  // 工作量分析数据
  const workloadData = useMemo(() => {
    return [...teachers, ...assistants]
      .map(user => {
        const assigned = getAssignedStudents(user.id, user.role);
        const totalActiveGoals = assigned.reduce((sum, s) => sum + getActiveGoalCount(s.id), 0);
        const totalWeekSessions = assigned.reduce((sum, s) => sum + getThisWeekSessionCount(s.id), 0);
        const totalWeekBehaviors = assigned.reduce((sum, s) => sum + getThisWeekBehaviorCount(s.id), 0);
        return {
          ...user,
          studentCount: assigned.length,
          totalActiveGoals,
          totalWeekSessions,
          totalWeekBehaviors,
        };
      })
      .sort((a, b) => b.studentCount - a.studentCount);
  }, [staff, students]);

  return (
    <div>
      {/* 页面头部 */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/students"
          className="btn-secondary flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={16} />
          返回
        </Link>
        <div className="flex items-center gap-2">
          <Users size={24} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-slate-800">教师团队管理</h1>
        </div>
      </div>

      {/* Section 1: 团队概览 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{teacherCount}</div>
          <div className="text-sm text-slate-500 mt-1">教师人数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-accent-500">{assistantCount}</div>
          <div className="text-sm text-slate-500 mt-1">助教人数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{studentCount}</div>
          <div className="text-sm text-slate-500 mt-1">学生总数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-slate-700">{ratio}</div>
          <div className="text-sm text-slate-500 mt-1">师生比</div>
        </div>
      </div>

      {/* Section 2: 教师卡片列表 */}
      <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <BookOpen size={18} />
        教师与助教
      </h2>

      <div className="space-y-4 mb-8">
        {staff.map(user => {
          const assigned = getAssignedStudents(user.id, user.role);
          const unassigned = getUnassignedStudents(user.id, user.role);
          const isExpanded = expandedCards[user.id];
          const borderColor = getWorkloadBorderColor(assigned.length);
          const bgColor = getWorkloadBgColor(assigned.length);

          return (
            <div
              key={user.id}
              className={`card border-l-4 ${borderColor} overflow-hidden`}
            >
              {/* 卡片头部 */}
              <div className={`p-4 flex items-center justify-between ${bgColor}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-lg`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{user.name}</span>
                      {getRoleTag(user.role)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      <Phone size={14} />
                      {user.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tag tag-primary">
                    负责 {assigned.length} 名学生
                  </span>
                  <button
                    onClick={() => toggleCard(user.id)}
                    className="btn-secondary p-2"
                    title={isExpanded ? '收起' : '展开'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* 展开内容：分配的学生列表 */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-4">
                  {assigned.length > 0 ? (
                    <div className="space-y-3">
                      {assigned.map(student => (
                        <div
                          key={student.id}
                          className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link
                                to={`/students/${student.id}`}
                                className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                              >
                                {student.name}
                              </Link>
                              <span className="text-xs text-slate-400">
                                {student.gender} / {student.age}岁
                              </span>
                              <span className="text-xs text-slate-500">
                                {student.currentStage}
                              </span>
                              {getStatusTag(student.status)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} />
                                活跃目标数: {getActiveGoalCount(student.id)}
                              </span>
                              <span className="flex items-center gap-1">
                                本周上课: {getThisWeekSessionCount(student.id)} 次
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle size={12} />
                                本周问题行为: {getThisWeekBehaviorCount(student.id)} 次
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(student.id, user.id, user.role)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            title="移除分配"
                          >
                            <UserMinus size={14} />
                            移除
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      暂无分配的学生
                    </p>
                  )}

                  {/* 分配学生表单 */}
                  {unassigned.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                      <UserPlus size={16} className="text-slate-400" />
                      <select
                        className="input flex-1 text-sm"
                        value={assignForm[user.id] || ''}
                        onChange={(e) => setAssignForm(prev => ({ ...prev, [user.id]: e.target.value }))}
                      >
                        <option value="">选择学生...</option>
                        {unassigned.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.gender}, {s.age}岁, {s.currentStage})
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn-primary text-sm flex items-center gap-1"
                        onClick={() => handleAssign(user.id, user.role)}
                        disabled={!assignForm[user.id]}
                      >
                        <UserPlus size={14} />
                        分配
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section 3: 教师工作量分析 */}
      <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <BarChart3 size={18} />
        教师工作量分析
      </h2>

      <div className="card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="text-left px-4 py-3 font-medium">教师</th>
                <th className="text-left px-4 py-3 font-medium">负责学生数</th>
                <th className="text-left px-4 py-3 font-medium">活跃目标总数</th>
                <th className="text-left px-4 py-3 font-medium">本周上课次数</th>
                <th className="text-left px-4 py-3 font-medium">本周行为记录</th>
              </tr>
            </thead>
            <tbody>
              {workloadData.map((item, index) => {
                const rowBgClass = item.studentCount > 4
                  ? 'bg-amber-50'
                  : item.studentCount < 2
                    ? 'bg-blue-50'
                    : '';
                const workloadLabel = item.studentCount > 4
                  ? (
                    <span className="tag tag-warn text-xs ml-2">
                      <AlertTriangle size={10} className="inline mr-1" />
                      高负荷
                    </span>
                  )
                  : item.studentCount < 2
                    ? (
                      <span className="tag tag-primary text-xs ml-2">
                        低负荷
                      </span>
                    )
                    : null;

                return (
                  <tr
                    key={item.id}
                    className={`border-t border-slate-100 ${rowBgClass}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(item.name)} flex items-center justify-center text-white font-bold text-sm`}>
                          {item.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{item.name}</span>
                        {getRoleTag(item.role)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">{item.studentCount}</span>
                      {workloadLabel}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.totalActiveGoals}</td>
                    <td className="px-4 py-3 text-slate-600">{item.totalWeekSessions}</td>
                    <td className="px-4 py-3 text-slate-600">{item.totalWeekBehaviors}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 图例说明 */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-200 inline-block" />
            高负荷（负责超过4名学生）
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-100 inline-block" />
            低负荷（负责少于2名学生）
          </span>
        </div>
      </div>
    </div>
  );
}
