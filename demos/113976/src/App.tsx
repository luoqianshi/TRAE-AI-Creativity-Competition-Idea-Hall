import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { AppShell } from '@/components/layout/AppShell';
import { AuthPage } from '@/pages/AuthPage';
import { HomePage } from '@/pages/HomePage';
import { TreePage } from '@/pages/TreePage';
import { PersonDetailPage } from '@/pages/PersonDetailPage';
import { PersonEditPage } from '@/pages/PersonEditPage';
import { AddRelativePage } from '@/pages/AddRelativePage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppRoutes() {
  const { user, isLoading, init } = useAuthStore();
  const { loadFamily } = useFamilyStore();

  // 页面加载时从 localStorage 恢复登录态
  useEffect(() => {
    init();
  }, [init]);

  // 登录后加载家族数据
  useEffect(() => {
    if (user) {
      loadFamily(user.id);
    }
  }, [user, loadFamily]);

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-ink-400">加载中...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 未登录：所有路径重定向到登录页 */}
      {!user && <Route path="/*" element={<Navigate to="/auth" replace />} />}

      {/* 登录页（不需要导航栏） */}
      <Route path="/auth" element={<AuthPage />} />

      {/* 已登录访问登录页：重定向到首页 */}
      {user && <Route path="/auth" element={<Navigate to="/" replace />} />}

      {/* 主应用路由（带底部导航） */}
      <Route path="/*" element={
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tree" element={<TreePage />} />
            <Route path="/person/:id" element={<PersonDetailPage />} />
            <Route path="/person/:id/edit" element={<PersonEditPage />} />
            <Route path="/profile/new" element={<PersonEditPage />} />
            <Route path="/add-relative" element={<AddRelativePage />} />
            <Route path="/add-relative/:fromPersonId" element={<AddRelativePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
