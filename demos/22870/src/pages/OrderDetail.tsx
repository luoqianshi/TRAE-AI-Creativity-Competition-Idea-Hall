import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, MessageCircle, Phone, ChevronLeft, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderStatusMap } from '@/utils/mockData';
import { formatServiceTime } from '@/utils/helpers';
import { useState } from 'react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useStore();
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  
  const order = orders.find((o) => o.id === id);
  
  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-400">订单不存在</p>
      </div>
    );
  }
  
  const statusInfo = orderStatusMap[order.status];
  
  const handleComplete = () => {
    updateOrderStatus(order.id, 'completed');
    setShowReview(true);
  };
  
  const handleCancel = () => {
    updateOrderStatus(order.id, 'cancelled');
    navigate('/orders');
  };
  
  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in">
      {/* 头部 */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">订单详情</h1>
          <div className="w-5" />
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="px-4 py-4 space-y-4">
        {/* 状态卡片 */}
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">订单状态</p>
              <p className="text-xl font-bold mt-1">{statusInfo.label}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">
                {order.status === 'completed' ? '✅' : 
                 order.status === 'cancelled' ? '❌' : 
                 order.status === 'in_progress' ? '🔧' : '⏳'}
              </span>
            </div>
          </div>
          
          {/* 进度条 */}
          {order.status !== 'cancelled' && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                {['pending', 'accepted', 'in_progress', 'completed'].map((s, i) => (
                  <div key={s} className="flex-1 flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      ['pending', 'accepted', 'in_progress', 'completed'].indexOf(order.status) >= i
                        ? 'bg-white'
                        : 'bg-white/30'
                    }`} />
                    <span className="text-xs mt-1 text-white/80">
                      {i === 0 ? '待接单' : i === 1 ? '已接单' : i === 2 ? '进行中' : '已完成'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 服务信息 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-start gap-3">
            <img 
              src={order.skill.images[0]}
              alt={order.skill.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-800">
                {order.skill.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {order.skill.description.slice(0, 50)}...
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {order.skill.category}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 服务者信息 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">服务者信息</h3>
          <div className="flex items-center gap-3">
            <img 
              src={order.provider.avatar}
              alt={order.provider.nickname}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {order.provider.nickname}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                信用分 {order.provider.creditScore}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-secondary" />
              </button>
              <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 订单详情 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">订单详情</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">服务时间</span>
              <span className="text-sm text-gray-800 ml-auto">
                {formatServiceTime(order.serviceTime)}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-500">服务地址</span>
              <span className="text-sm text-gray-800 ml-auto text-right">
                {order.address}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">订单金额</span>
              <span className="text-lg font-bold text-primary ml-auto">
                ¥{order.amount}
              </span>
            </div>
          </div>
        </div>
        
        {/* 备注 */}
        {order.remark && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">备注说明</h3>
            <p className="text-sm text-gray-600">{order.remark}</p>
          </div>
        )}
      </div>
      
      {/* 底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="flex gap-3">
          {order.status === 'pending' && (
            <>
              <button 
                onClick={handleCancel}
                className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 text-sm font-medium"
              >
                取消订单
              </button>
              <button 
                onClick={() => navigate('/skills')}
                className="flex-1 btn-primary text-sm"
              >
                重新选择
              </button>
            </>
          )}
          {order.status === 'in_progress' && (
            <>
              <button 
                onClick={handleCancel}
                className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 text-sm font-medium"
              >
                取消订单
              </button>
              <button 
                onClick={handleComplete}
                className="flex-1 btn-primary text-sm"
              >
                确认完成
              </button>
            </>
          )}
          {order.status === 'completed' && (
            <button 
              onClick={() => setShowReview(true)}
              className="btn-primary w-full text-sm"
            >
              评价服务
            </button>
          )}
        </div>
      </div>
      
      {/* 评价弹窗 */}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in">
          <div className="bg-white rounded-t-2xl w-full p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">评价服务</h3>
              <button onClick={() => setShowReview(false)}>
                <span className="text-gray-400 text-xl">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 星级评分 */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">服务评分</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setReviewRating(i)}
                      className="p-1"
                    >
                      <Star className={`w-8 h-8 ${
                        i <= reviewRating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-200'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 评价内容 */}
              <div>
                <textarea 
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="分享您的服务体验..."
                  className="input w-full h-24 resize-none"
                />
              </div>
              
              <button 
                onClick={() => {
                  setShowReview(false);
                  navigate('/orders');
                }}
                className="btn-primary w-full text-sm"
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}