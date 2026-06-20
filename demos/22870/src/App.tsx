import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from '@/pages/Home';
import Skills from '@/pages/Skills';
import SkillDetail from '@/pages/SkillDetail';
import Publish from '@/pages/Publish';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import Profile from '@/pages/Profile';
import MySkills from '@/pages/MySkills';
import Wallet from '@/pages/Wallet';
import TabBar from '@/components/TabBar';
import { useStore } from '@/store/useStore';

// 路由到Tab映射
function getActiveTab(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/skills') || path.startsWith('/skill')) return 'skills';
  if (path === '/publish') return 'publish';
  if (path.startsWith('/orders') || path.startsWith('/order')) return 'orders';
  if (path === '/profile' || path === '/my-skills' || path === '/wallet') return 'profile';
  return 'home';
}

// TabBar显示判断
function shouldShowTabBar(path: string): boolean {
  // 详情页不显示TabBar
  if (path.startsWith('/skill/') || path.startsWith('/order/')) return false;
  return true;
}

function AppContent() {
  const location = useLocation();
  const { setActiveTab } = useStore();
  
  useEffect(() => {
    setActiveTab(getActiveTab(location.pathname) as 'home' | 'skills' | 'publish' | 'orders' | 'profile');
  }, [location.pathname, setActiveTab]);
  
  const showTabBar = shouldShowTabBar(location.pathname);
  
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/skill/:id" element={<SkillDetail />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-skills" element={<MySkills />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
      
      {showTabBar && (
        <TabBar 
          activeTab={getActiveTab(location.pathname)}
          onTabChange={(tab) => {
            const paths = {
              home: '/',
              skills: '/skills',
              publish: '/publish',
              orders: '/orders',
              profile: '/profile',
            };
            window.location.href = paths[tab as keyof typeof paths] || '/';
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}