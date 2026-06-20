import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Eye, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/helpers';

export default function MySkills() {
  const navigate = useNavigate();
  const { currentUser, skills } = useStore();
  
  const mySkills = skills.filter((s) => s.userId === currentUser?.id);
  
  return (
    <div className="min-h-screen bg-background pb-16 animate-fade-in">
      {/* 头部 */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">我的技能</h1>
          <button 
            onClick={() => navigate('/publish')}
            className="text-primary text-sm font-medium"
          >
            发布
          </button>
        </div>
      </div>
      
      {/* 技能列表 */}
      <div className="px-4 py-4">
        {mySkills.length > 0 ? (
          <div className="space-y-3">
            {mySkills.map((skill) => (
              <div 
                key={skill.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex items-start gap-3 p-4">
                  <img 
                    src={skill.images[0]}
                    alt={skill.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-800">
                        {skill.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        skill.isActive 
                          ? 'bg-secondary/10 text-secondary' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {skill.isActive ? '上架中' : '已下架'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {skill.description.slice(0, 40)}...
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {formatPrice(skill.price, skill.priceUnit)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">{skill.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        服务{skill.serviceCount}次
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-1 py-3 text-sm text-gray-600 hover:bg-gray-50">
                    <Eye className="w-4 h-4" />
                    查看
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-3 text-sm text-primary hover:bg-primary/5 border-l border-gray-100">
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-3 text-sm text-red-500 hover:bg-red-50 border-l border-gray-100">
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">暂未发布技能</p>
            <button 
              onClick={() => navigate('/publish')}
              className="btn-primary text-sm"
            >
              发布技能
            </button>
          </div>
        )}
      </div>
    </div>
  );
}