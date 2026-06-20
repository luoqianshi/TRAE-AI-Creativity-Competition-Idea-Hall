import { Home, Search, PlusCircle, ClipboardList, User } from 'lucide-react';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'skills', label: '技能', icon: Search },
  { id: 'publish', label: '发布', icon: PlusCircle },
  { id: 'orders', label: '订单', icon: ClipboardList },
  { id: 'profile', label: '我的', icon: User },
];

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
              {tab.id === 'publish' && (
                <div className={`absolute -top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'bg-primary/20 text-primary'
                }`}>
                  <PlusCircle className="w-5 h-5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}