import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Award, ChevronLeft, Share2, Heart } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import { useStore } from '@/store/useStore';
import { mockReviews } from '@/utils/mockData';
import { formatDistance, formatPrice } from '@/utils/helpers';
import { useState } from 'react';

export default function SkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { skills } = useStore();
  const [showBooking, setShowBooking] = useState(false);
  
  const skill = skills.find((s) => s.id === id);
  const reviews = mockReviews.filter((r) => r.skillId === id);
  
  if (!skill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-400">技能不存在</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in">
      {/* 头部图片 */}
      <div className="relative h-64">
        <img 
          src={skill.images[0]}
          alt={skill.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* 返回按钮 */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        
        {/* 操作按钮 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* 标题 */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white text-xl font-bold mb-2">{skill.title}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white text-sm">{skill.rating}</span>
            </div>
            <span className="text-white/80 text-sm">已服务{skill.serviceCount}次</span>
          </div>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="px-4 -mt-4 space-y-4">
        {/* 服务者信息 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <img 
              src={skill.user.avatar}
              alt={skill.user.nickname}
              className="w-14 h-14 rounded-full border-2 border-primary/20"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-gray-800">
                  {skill.user.nickname}
                </h3>
                {skill.user.isVerified && (
                  <span className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full">
                    ✓已认证
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Award className="w-3.5 h-3.5" />
                <span>信用分 {skill.user.creditScore}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatPrice(skill.price, skill.priceUnit)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{formatDistance(skill.distance)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-primary" />
              <span>随时可预约</span>
            </div>
          </div>
        </div>
        
        {/* 服务详情 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-base font-medium text-gray-800 mb-3">服务详情</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {skill.description}
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">服务范围:</span>
              <span className="text-xs text-gray-700">本小区及周边{formatDistance(skill.distance * 2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">所属分类:</span>
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {skill.category}
              </span>
            </div>
          </div>
        </div>
        
        {/* 用户评价 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-gray-800">用户评价</h3>
            <span className="text-xs text-gray-400">{reviews.length}条评价</span>
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">暂无评价</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 底部预约按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <button 
          onClick={() => setShowBooking(true)}
          className="btn-primary w-full text-center"
        >
          立即预约
        </button>
      </div>
      
      {/* 预约弹窗 */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in">
          <div className="bg-white rounded-t-2xl w-full p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">预约服务</h3>
              <button onClick={() => setShowBooking(false)}>
                <span className="text-gray-400 text-xl">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">服务时间</label>
                <input 
                  type="datetime-local"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">服务地址</label>
                <input 
                  type="text"
                  placeholder="请输入详细地址"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">备注说明</label>
                <textarea 
                  placeholder="请描述您的需求..."
                  className="input w-full h-24 resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-sm text-gray-500">预计费用</span>
                  <span className="text-lg font-bold text-primary ml-2">
                    ¥{skill.price}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setShowBooking(false);
                    navigate('/orders');
                  }}
                  className="btn-primary"
                >
                  确认预约
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}