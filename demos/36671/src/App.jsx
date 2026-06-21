import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TabBar, PageContainer } from './components/Layout';
import Splash from './pages/Splash';
import Home from './pages/Home';
import CreatePage from './pages/CreatePage';
import Preview3D from './pages/Preview3D';
import CanvasPage from './pages/CanvasPage';
import OrderPage from './pages/OrderPage';
import Magnets from './pages/Magnets';
import Profile from './pages/Profile';

/* 底部 TabBar 配置 - 4个标签 */
const TABS = [
  {
    path: '/home',
    label: '首页',
    icon: ({ size, color }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )},
  {
    path: '/create',
    label: '创建',
    icon: ({ size, color }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    )},
  {
    path: '/canvas',
    label: '回忆',
    icon: ({ size, color }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )},
  {
    path: '/profile',
    label: '我的',
    icon: ({ size, color }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )},
];

function AppRoutes() {
  const location = useLocation();
  const isTabRoute = TABS.some(t => t.path === location.pathname);

  return (
    <div className="h-full flex flex-col">
      <PageContainer>
        <Routes>
          <Route path="/" element={<Splash />} />
          {/* TabBar 页面 */}
          <Route path="/home" element={<Home />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/profile" element={<Profile />} />
          {/* 子页面 */}
          <Route path="/preview-3d/:id" element={<Preview3D />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/magnets" element={<Magnets />} />
        </Routes>
      </PageContainer>
      {isTabRoute && <TabBar tabs={TABS} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
