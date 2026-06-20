import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { mockCategories } from '@/utils/mockData';
import { generateId } from '@/utils/helpers';

export default function Publish() {
  const navigate = useNavigate();
  const { currentUser, addSkill } = useStore();
  const [publishType, setPublishType] = useState<'skill' | 'demand'>('skill');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    priceUnit: '次',
    images: [] as string[],
  });
  
  const handleSubmit = () => {
    if (publishType === 'skill') {
      const newSkill = {
        id: generateId(),
        userId: currentUser?.id || '6',
        user: currentUser || {
          id: '6',
          nickname: '我',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
          creditScore: 80,
          isVerified: false,
        },
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price) || 0,
        priceUnit: formData.priceUnit,
        rating: 0,
        serviceCount: 0,
        images: formData.images.length > 0 
          ? formData.images 
          : ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=service%20provider%20showing%20skills&image_size=landscape_4_3'],
        distance: 0.5,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      addSkill(newSkill);
      navigate('/my-skills');
    } else {
      navigate('/orders');
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-16 animate-fade-in">
      {/* 头部 */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">发布</h1>
          <div className="w-5" />
        </div>
        
        {/* 类型切换 */}
        <div className="px-4 pb-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPublishType('skill')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                publishType === 'skill' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600'
              }`}
            >
              发布技能
            </button>
            <button
              onClick={() => setPublishType('demand')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                publishType === 'demand' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600'
              }`}
            >
              发布需求
            </button>
          </div>
        </div>
      </div>
      
      {/* 表单区域 */}
      <div className="px-4 py-4 space-y-4">
        {publishType === 'skill' ? (
          <>
            {/* 技能标题 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                技能标题
              </label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：家电维修、手机教学..."
                className="input w-full"
              />
            </div>
            
            {/* 技能分类 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                技能分类
              </label>
              <div className="grid grid-cols-4 gap-2">
                {mockCategories.slice(0, -1).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.name })}
                    className={`py-2 rounded-lg text-xs ${
                      formData.category === cat.name 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 技能描述 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                详细描述
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请详细描述您的技能、服务范围、经验等..."
                className="input w-full h-32 resize-none"
              />
            </div>
            
            {/* 价格设置 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                服务价格
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-primary font-medium">¥</span>
                    <input 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      className="flex-1 bg-transparent text-center text-lg font-medium focus:outline-none"
                    />
                  </div>
                </div>
                <select 
                  value={formData.priceUnit}
                  onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                  className="input w-20"
                >
                  <option value="次">次</option>
                  <option value="小时">小时</option>
                  <option value="天">天</option>
                </select>
              </div>
            </div>
            
            {/* 图片上传 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                添加图片
              </label>
              <div className="flex gap-3">
                {formData.images.map((img, i) => (
                  <div key={i} className="w-20 h-20 rounded-lg overflow-hidden relative">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setFormData({ 
                        ...formData, 
                        images: formData.images.filter((_, idx) => idx !== i) 
                      })}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {formData.images.length < 3 && (
                  <button className="w-20 h-20 rounded-lg bg-gray-100 flex flex-col items-center justify-center gap-1">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400">添加</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">最多上传3张图片</p>
            </div>
          </>
        ) : (
          <>
            {/* 需求描述 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                需求描述
              </label>
              <textarea 
                placeholder="请详细描述您的需求..."
                className="input w-full h-32 resize-none"
              />
            </div>
            
            {/* 期望价格 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                期望价格
              </label>
              <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-primary font-medium">¥</span>
                <input 
                  type="number"
                  placeholder="0"
                  className="flex-1 bg-transparent text-center text-lg font-medium focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">可填写期望价格范围</p>
            </div>
            
            {/* 时间要求 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                时间要求
              </label>
              <input 
                type="datetime-local"
                className="input w-full"
              />
            </div>
            
            {/* 联系方式 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                联系方式
              </label>
              <input 
                type="tel"
                placeholder="请输入手机号"
                className="input w-full"
              />
            </div>
          </>
        )}
        
        {/* 提交按钮 */}
        <button 
          onClick={handleSubmit}
          className="btn-primary w-full text-center mt-6"
        >
          {publishType === 'skill' ? '发布技能' : '发布需求'}
        </button>
        
        {/* 提示 */}
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <p className="text-xs text-yellow-600">
            发布内容需遵守平台规则，禁止发布违法违规信息
          </p>
        </div>
      </div>
    </div>
  );
}