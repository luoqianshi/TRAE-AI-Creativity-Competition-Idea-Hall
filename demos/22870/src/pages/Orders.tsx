import { useNavigate } from 'react-router-dom';
import OrderCard from '@/components/OrderCard';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { OrderStatus } from '@/types';

export default function Orders() {
  const navigate = useNavigate();
  const { orders } = useStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  
  const tabs = [
    { id: 'all', label: '全部', count: orders.length },
    { id: 'pending', label: '待接单', count: orders.filter(o => o.status === 'pending').length },
    { id: 'in_progress', label: '进行中', count: orders.filter(o => o.status === 'in_progress' || o.status === 'accepted').length },
    { id: 'completed', label: '已完成', count: orders.filter(o => o.status === 'completed').length },
  ];
  
  const filteredOrders = orders.filter((order) => 
    activeTab === 'all' 
      ? true 
      : activeTab === 'in_progress' 
        ? order.status === 'in_progress' || order.status === 'accepted'
        : order.status === activeTab
  );
  
  return (
    <div className="min-h-screen bg-background pb-16 animate-fade-in">
      {/* 头部 */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-800 mb-3">订单中心</h1>
          
          {/* Tab切换 */}
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as OrderStatus | 'all')}
                className={`relative pb-2 text-sm ${
                  activeTab === tab.id 
                    ? 'text-primary font-medium' 
                    : 'text-gray-500'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 订单列表 */}
      <div className="px-4 py-4">
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id}
                order={order}
                onClick={() => navigate(`/order/${order.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">暂无相关订单</p>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary text-sm"
            >
              去找服务
            </button>
          </div>
        )}
      </div>
    </div>
  );
}