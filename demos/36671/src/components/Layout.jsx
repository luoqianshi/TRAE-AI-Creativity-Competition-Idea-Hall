import { useLocation, useNavigate } from 'react-router-dom';

const TAB_BAR_HEIGHT = 64;

export function StatusBar() {
  return null;
}

export function TabBar({ tabs }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div
        className="glass-island mx-4 mb-3 flex items-center justify-around px-1"
        style={{ height: TAB_BAR_HEIGHT, borderRadius: 28 }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`tap-active flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive
                  ? 'bg-blue-500/10'
                  : ''
              }`}
              style={{ borderRadius: 24 }}
            >
              <div className={`w-10 h-10 flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-blue-500 to-blue-400 shadow-md shadow-blue-500/25'
                  : ''
              }`} style={{ borderRadius: 16 }}>
                <tab.icon size={20} color={isActive ? 'white' : '#94a3b8'} />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium transition-colors duration-300 ${
                isActive ? 'text-blue-500' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PageContainer({ children, className = '' }) {
  return (
    <div
      className={`flex-1 min-h-0 overflow-y-auto scrollbar-hide pt-6 ${className}`}
      style={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
    >
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  );
}

export { TAB_BAR_HEIGHT };
