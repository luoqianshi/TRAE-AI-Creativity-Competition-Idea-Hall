import { useNavigate } from 'react-router-dom';
import { Filter, SortAsc, X } from 'lucide-react';
import SkillCard from '@/components/SkillCard';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function Skills() {
  const navigate = useNavigate();
  const { skills, categories, selectedCategory, setSelectedCategory, sortBy, setSortBy } = useStore();
  const [showFilter, setShowFilter] = useState(false);
  
  // 筛选和排序
  const filteredSkills = skills
    .filter((skill) => selectedCategory ? skill.category === selectedCategory : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'serviceCount':
          return b.serviceCount - a.serviceCount;
        default:
          return 0;
      }
    });
  
  const sortOptions = [
    { value: 'distance', label: '距离最近' },
    { value: 'rating', label: '评分最高' },
    { value: 'price', label: '价格最低' },
    { value: 'serviceCount', label: '服务最多' },
  ];
  
  return (
    <div className="min-h-screen bg-background pb-16 animate-fade-in">
      {/* 头部 */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-800">技能市场</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`p-2 rounded-lg ${showFilter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* 分类标签 */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                !selectedCategory 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              全部
            </button>
            {categories.slice(0, -1).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === cat.name 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* 筛选面板 */}
        {showFilter && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">排序方式</span>
              <button onClick={() => setShowFilter(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as typeof sortBy)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                    sortBy === opt.value 
                      ? 'bg-primary text-white' 
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <SortAsc className="w-3 h-3" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 技能列表 */}
      <div className="px-4 py-4">
        <div className="mb-3 text-sm text-gray-500">
          共找到 {filteredSkills.length} 个技能
        </div>
        
        <div className="space-y-3">
          {filteredSkills.map((skill) => (
            <SkillCard 
              key={skill.id}
              skill={skill}
              onClick={() => navigate(`/skill/${skill.id}`)}
            />
          ))}
        </div>
        
        {filteredSkills.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">暂无相关技能</p>
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setShowFilter(false);
              }}
              className="btn-primary text-sm"
            >
              查看全部技能
            </button>
          </div>
        )}
      </div>
    </div>
  );
}