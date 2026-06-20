import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  ClipboardList, 
  Star, 
  Wallet, 
  Settings, 
  ChevronRight,
  BadgeCheck,
  Bell,
  Shield
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, orders, skills } = useStore();
  
  const mySkills = skills.filter((s) => s.userId === currentUser?.id);
  const myOrders = orders.filter((o) => o.userId === currentUser?.id);
  
  const menuItems = [
    { 
      icon: ClipboardList, 
      label: '我的技能', 
      value: mySkills.length,
      path: '/my-skills',
      color: 'text-primary'
    },
    { 
      icon: Star, 
      label: '我的评价', 
      value: 0,
      path: '/reviews',
      color: 'text-yellow-500'
    },
    { 
      icon: Wallet, 
      label: '我的钱包', 
      value: '¥128',
      path: '/wallet',
      color: 'text-secondary'
    },
    { 
      icon: Bell, 
      label: '消息通知', 
      value: 3,
      path: '/notifications',
      color: 'text-blue-500'
    },
    { 
      icon: Shield, 
      label: '实名认证', 
      value: currentUser?.isVerified ? '已认证' : '未认证',
      path: '/verify',
      color: 'text-purple-500'
    },
    { 
      icon: Settings, 
      label: '设置', 
      path: '/settings',
      color: 'text-gray-500'
    },
  ];
  
  return (
    <div className="min-h-screen bg-background pb-16 animate-fade-in">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-br from-primary to-primary-light px-4 pt-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={currentUser?.avatar}
              alt={currentUser?.nickname}
              className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
            />
            {currentUser?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-white text-xl font-bold">
              {currentUser?.nickname || '未登录'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <Award className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-xs">
                  信用分 {currentUser?.creditScore || 0}
                </span>
              </div>
              {currentUser?.isVerified && (
                <span className="bg-secondary/20 text-secondary text-xs px-2 py-0.5 rounded-full">
                  ✓已认证
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* 统计数据 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white text-2xl font-bold">{myOrders.length}</p>
            <p className="text-white/80 text-xs mt-1">我的订单</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white text-2xl font-bold">{mySkills.length}</p>
            <p className="text-white/80 text-xs mt-1">发布技能</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white text-2xl font-bold">128</p>
            <p className="text-white/80 text-xs mt-1">积分余额</p>
          </div>
        </div>
      </div>
      
      {/* 功能菜单 */}
      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-4 px-4 py-4 w-full ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${item.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-800 flex-1">
                  {item.label}
                </span>
                {item.value !== undefined && (
                  <span className={`text-sm ${
                    typeof item.value === 'string' && item.value.includes('¥')
                      ? 'text-primary font-medium'
                      : typeof item.value === 'number' && item.value > 0
                        ? 'bg-primary text-white px-2 py-0.5 rounded-full text-xs'
                        : 'text-gray-400'
                  }`}>
                    {typeof item.value === 'number' && item.value > 0 ? item.value : item.value}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            );
          })}
        </div>
        
        {/* 快捷操作 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/publish')}
              className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <span className="text-primary text-lg">📝</span>
              <span className="text-sm text-gray-600">发布新技能</span>
            </button>
            <button 
              onClick={() => navigate('/skills')}
              className="flex items-center gap-2 p-3 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
            >
              <span className="text-secondary text-lg">🔍</span>
              <span className="text-sm text-gray-600">找服务</span>
            </button>
          </div>
        </div>
        
        {/* 版本信息 */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">邻有技 v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">让邻里互助更简单</p>
        </div>
      </div>
    </div>
  );
}