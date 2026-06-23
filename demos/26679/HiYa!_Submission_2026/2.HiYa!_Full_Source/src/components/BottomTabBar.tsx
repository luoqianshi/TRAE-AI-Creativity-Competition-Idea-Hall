import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smile, Calendar, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useApp();
  
  const isNeonTheme = settings.currentTheme === 'black';

  const tabs = [
    { id: 'home', label: '今天嗨呀！', icon: Smile, path: '/' },
    { id: 'history', label: '嗨呀！动态', icon: Calendar, path: '/history' },
    { id: 'theme', label: '嗨呀！主题', icon: Palette, path: '/theme-store' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: isNeonTheme 
          ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
          : 'linear-gradient(180deg, hsl(var(--card) / 0.95) 0%, hsl(var(--accent) / 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: isNeonTheme 
          ? '2px solid hsl(142 71% 45% / 0.3)'
          : '2px solid hsl(var(--primary) / 0.2)',
        boxShadow: isNeonTheme 
          ? '0 -4px 20px hsl(142 71% 45% / 0.1)'
          : '0 -4px 20px hsl(var(--primary) / 0.1)',
      }}
    >
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <motion.div
                animate={{ 
                  scale: active ? 1.2 : 1,
                  y: active ? -4 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                style={{
                  color: active 
                    ? (isNeonTheme ? '#4ADE80' : 'hsl(var(--primary))') 
                    : (isNeonTheme ? 'rgba(74, 222, 128, 0.6)' : 'hsl(var(--muted-foreground))'),
                }}
              >
                <Icon className="w-5 h-5 mb-1" />
              </motion.div>
              <motion.span 
                className="text-xs"
                style={{
                  color: active 
                    ? (isNeonTheme ? '#4ADE80' : 'hsl(var(--primary))') 
                    : (isNeonTheme ? 'rgba(74, 222, 128, 0.6)' : 'hsl(var(--muted-foreground))'),
                  fontWeight: active ? 700 : 500,
                }}
              >
                {tab.label}
              </motion.span>
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-1 w-10 h-1.5 rounded-full"
                  style={{
                    background: isNeonTheme 
                      ? 'linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)'
                      : 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
                    boxShadow: isNeonTheme 
                      ? '0 0 10px rgba(74, 222, 128, 0.5)'
                      : '0 2px 8px hsl(var(--primary) / 0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
