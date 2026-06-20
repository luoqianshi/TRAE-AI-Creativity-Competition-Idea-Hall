import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import CategoryNav from '@/components/CategoryNav';
import SkillCard from '@/components/SkillCard';
import BannerCarousel from '@/components/BannerCarousel';
import { useStore } from '@/store/useStore';

export default function Home() {
  const navigate = useNavigate();
  const { 
    skills, 
    categories, 
    banners, 
    selectedCategory, 
    searchQuery,
    setSelectedCategory,
    setSearchQuery 
  } = useStore();
  
  // 筛选技能
  const filteredSkills = skills
    .filter((skill) => selectedCategory ? skill.category === selectedCategory : true)
    .filter((skill) => searchQuery 
      ? skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);
  
  return (
    <div className="min-h-screen bg-background pb-16 animate-fade-in">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-primary to-primary-light px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-xl font-bold">邻有技</h1>
            <p className="text-white/80 text-xs mt-1">邻里互助，温暖社区</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full px-3 py-1 text-white text-xs">
              阳光小区
            </div>
          </div>
        </div>
        
        {/* 搜索栏 */}
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => navigate('/skills')}
        />
      </div>
      
      {/* 内容区域 */}
      <div className="px-4 -mt-4 space-y-4">
        {/* 轮播图 */}
        <BannerCarousel banners={banners} />
        
        {/* 分类导航 */}
        <CategoryNav 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        
        {/* 附近技能推荐 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-gray-800">
              {selectedCategory ? `${selectedCategory}推荐` : '附近技能推荐'}
            </h2>
            <button 
              onClick={() => navigate('/skills')}
              className="text-xs text-primary"
            >
              查看更多 →
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {filteredSkills.map((skill) => (
              <SkillCard 
                key={skill.id}
                skill={skill}
                onClick={() => navigate(`/skill/${skill.id}`)}
              />
            ))}
          </div>
          
          {filteredSkills.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm">暂无相关技能</p>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="mt-3 text-primary text-xs"
              >
                查看全部技能
              </button>
            </div>
          )}
        </div>
        
        {/* 快速入口 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-3">快速入口</h3>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/publish')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-lg">📝</span>
              </div>
              <span className="text-xs text-gray-600">发布技能</span>
            </button>
            <button 
              onClick={() => navigate('/orders')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-secondary text-lg">📋</span>
              </div>
              <span className="text-xs text-gray-600">我的订单</span>
            </button>
            <button 
              onClick={() => navigate('/wallet')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 text-lg">💰</span>
              </div>
              <span className="text-xs text-gray-600">我的钱包</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}