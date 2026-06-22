import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './data/store';
import Layout from './components/Layout';
import Login from './pages/Login';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import SkillAssessment from './pages/SkillAssessment';
import IEPGoals from './pages/IEPGoals';
import ProgressReport from './pages/ProgressReport';
import MaintenancePool from './pages/MaintenancePool';
import BarrierAnalysis from './pages/BarrierAnalysis';
import TeachingSession from './pages/TeachingSession';
import BehaviorAnalysis from './pages/BehaviorAnalysis';
import TeacherManagement from './pages/TeacherManagement';
import ClassroomTraining from './pages/ClassroomTraining';
import AssessmentQueuePlanner from './pages/AssessmentQueuePlanner';
import AssessmentRunner from './pages/AssessmentRunner';
import TeachingQueuePlanner from './pages/TeachingQueuePlanner';
import TeachingRunner from './pages/TeachingRunner';
import Register from './pages/Register';
import AdminStaffManagement from './pages/AdminStaffManagement';

function ProtectedRoute({ children }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 管理员路由守卫：管理员不能访问学生相关页面
function AdminRoute({ children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/students" replace />;
  return children;
}

// 非管理员路由守卫：非管理员不能访问管理员页面
function NonAdminRoute({ children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/staff" replace />;
  return children;
}

// 全屏页面（无侧边栏，适合手机端操作）
function FullScreenPage({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

function HomePage() {
  const user = getCurrentUser();
  if (user?.role === 'admin') return <Navigate to="/admin/staff" replace />;
  return <Navigate to="/students" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 全屏页面：评估执行、上课执行、队列规划 */}
        <Route path="/students/:id/assessment/run/:queueId" element={
          <FullScreenPage><AssessmentRunner /></FullScreenPage>
        } />
        <Route path="/students/:id/training/run/:queueId" element={
          <FullScreenPage><TeachingRunner /></FullScreenPage>
        } />
        <Route path="/students/:id/assessment/plan" element={
          <FullScreenPage><AssessmentQueuePlanner /></FullScreenPage>
        } />
        <Route path="/students/:id/training/plan" element={
          <FullScreenPage><TeachingQueuePlanner /></FullScreenPage>
        } />

        {/* 带 Layout 的常规页面 */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />

          {/* 管理员专属页面 */}
          <Route path="admin/staff" element={
            <AdminRoute><AdminStaffManagement /></AdminRoute>
          } />

          {/* 非管理员页面（管理员访问会被重定向） */}
          <Route path="students" element={<NonAdminRoute><StudentList /></NonAdminRoute>} />
          <Route path="students/:id" element={<NonAdminRoute><StudentDetail /></NonAdminRoute>} />
          <Route path="students/:id/assessment" element={<NonAdminRoute><SkillAssessment /></NonAdminRoute>} />
          <Route path="students/:id/goals" element={<NonAdminRoute><IEPGoals /></NonAdminRoute>} />
          <Route path="students/:id/report" element={<NonAdminRoute><ProgressReport /></NonAdminRoute>} />
          <Route path="students/:id/maintenance" element={<NonAdminRoute><MaintenancePool /></NonAdminRoute>} />
          <Route path="students/:id/barriers" element={<NonAdminRoute><BarrierAnalysis /></NonAdminRoute>} />
          <Route path="students/:id/behavior-analysis" element={<NonAdminRoute><BehaviorAnalysis /></NonAdminRoute>} />
          <Route path="students/:id/training" element={<NonAdminRoute><ClassroomTraining /></NonAdminRoute>} />
          <Route path="students/:id/teach/:sessionId" element={<NonAdminRoute><TeachingSession /></NonAdminRoute>} />
          <Route path="teacher-management" element={<NonAdminRoute><TeacherManagement /></NonAdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
