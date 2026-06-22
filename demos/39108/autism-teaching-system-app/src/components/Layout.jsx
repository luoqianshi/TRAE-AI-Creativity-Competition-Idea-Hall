import { Outlet, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Users, ClipboardCheck, Target, BookOpen, BarChart3, Menu, X, LogOut, Shield, RefreshCw, AlertTriangle, BookMarked, Activity, UserCog } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getCurrentUser, logout, ROLE_LABELS, hasPermission, getStudentById } from '../data/store';
import BehaviorRecordFloat from './BehaviorRecordFloat';
import CallAssistantFloat from './CallAssistantFloat';

const ROLE_BADGE_COLORS = {
  admin: 'bg-red-100 text-red-700',
  supervisor: 'bg-amber-100 text-amber-700',
  teacher: 'bg-primary-100 text-primary-700',
  assistant: 'bg-slate-100 text-slate-600',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isStudentRoute = location.pathname.includes('/students/');
  const studentId = isStudentRoute ? location.pathname.split('/')[2] : null;
  const studentName = useMemo(() => studentId ? getStudentById(studentId)?.name || null : null, [studentId]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [];

  // 管理员只看到人员管理
  if (currentUser?.role === 'admin') {
    navItems.push({ path: '/admin/staff', label: '人员管理', icon: UserCog });
  } else {
    navItems.push({ path: '/students', label: '学生档案', icon: Users });
    // 督导可以看到教师管理
    if (currentUser?.role === 'supervisor') {
      navItems.push({ path: '/teacher-management', label: '教师管理', icon: UserCog });
    }
  }

  const studentNavItems = (studentId && currentUser?.role !== 'admin') ? [
    { path: `/students/${studentId}`, label: '学生档案', icon: Users },
    { path: `/students/${studentId}/training`, label: '课堂训练记录', icon: BookOpen },
    { path: `/students/${studentId}/goals`, label: 'IEP 目标', icon: Target },
    { path: `/students/${studentId}/report`, label: '进展报告', icon: BarChart3 },
    // 督导专属：技能评估
    ...(currentUser?.role === 'supervisor' ? [
      { path: `/students/${studentId}/assessment`, label: '技能评估', icon: ClipboardCheck },
    ] : []),
    // 教师+权限可见维持池和障碍分析
    ...(hasPermission('teacher') ? [
      { path: `/students/${studentId}/maintenance`, label: '维持池', icon: RefreshCw },
      { path: `/students/${studentId}/barriers`, label: '障碍分析', icon: AlertTriangle },
      { path: `/students/${studentId}/behavior-analysis`, label: '问题行为分析', icon: Activity },
    ] : []),
  ] : [];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AT</span>
            </div>
            <span className="font-bold text-slate-800">教学管理系统</span>
          </div>
          <button
            className="lg:hidden p-1 rounded-md hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {studentId && (
            <>
              <div className="pt-4 pb-2 px-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  当前学生
                </div>
              </div>
              {studentNavItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{currentUser?.name || '未登录'}</span>
            {currentUser?.role && (
              <span className={`tag ${ROLE_BADGE_COLORS[currentUser.role] || 'bg-slate-100 text-slate-600'}`}>
                <Shield size={12} className="mr-1" />
                {ROLE_LABELS[currentUser.role]}
              </span>
            )}
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-medium text-sm">
                {currentUser?.name ? currentUser.name.charAt(0) : '?'}
              </span>
            </div>
            <button
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={handleLogout}
              title="退出登录"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* 全局浮动组件：问题行为记录 + 呼叫助教 */}
      {studentId && (
        <>
          <BehaviorRecordFloat studentId={studentId} studentName={studentName} />
          <CallAssistantFloat studentId={studentId} studentName={studentName} />
        </>
      )}
    </div>
  );
}
