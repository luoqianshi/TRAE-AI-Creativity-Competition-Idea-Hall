import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { useStorage } from '../hooks/useStorage';
import { MAGNET_THEMES, MAGNET_MATERIALS, MAGNET_CONDITIONS } from '../data/fridgeMagnet';

export default function AddMagnet() {
  const navigate = useNavigate();
  const [, setMagnets] = useStorage('fm_magnets', []);

  const [theme, setTheme] = useState('city');
  const [material, setMaterial] = useState('ceramic');
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [condition, setCondition] = useState('mint');
  const [acquired, setAcquired] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const magnet = {
      id: `magnet_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      theme,
      material,
      name: name.trim(),
      origin: origin.trim() || '未知',
      condition,
      acquired: acquired.trim() || '购买',
      time: parseInt(time) || 0,
      notes: notes.trim(),
    };
    setMagnets(prev => [...prev, magnet]);
    navigate('/magnets');
  };

  return (
    <AnimatedPage type="fade">
            <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-bold">收集冰箱贴</h2>
          <p className="text-text-secondary text-xs">记录一枚新冰箱贴</p>
        </div>
      </div>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">冰箱贴主题</label>
        <div className="grid grid-cols-3 gap-2">
          {MAGNET_THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)} className={`p-3 rounded-xl text-center tap-active ${theme === t.id ? 'bg-teal-200 ring-2 ring-teal-600' : 'bg-gray-50'}`}>
              <span className="text-xl block mb-1">{t.icon}</span>
              <p className="text-[10px] font-medium">{t.name}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">冰箱贴材质</label>
        <div className="grid grid-cols-3 gap-2">
          {MAGNET_MATERIALS.map(m => (
            <button key={m.id} onClick={() => setMaterial(m.id)} className={`p-3 rounded-xl text-center tap-active ${material === m.id ? 'bg-teal-200 ring-2 ring-teal-600' : 'bg-gray-50'}`}>
              <span className="text-xl block mb-1">{m.icon}</span>
              <p className="text-[10px] font-medium">{m.name}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">冰箱贴名称</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="输入冰箱贴名称" className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">来源地</label>
        <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="输入来源城市" className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">品相</label>
        <div className="flex flex-wrap gap-2">
          {MAGNET_CONDITIONS.map(c => (
            <button key={c.id} onClick={() => setCondition(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium tap-active ${condition === c.id ? 'text-white' : 'bg-gray-100 text-text-secondary'}`} style={condition === c.id ? { backgroundColor: c.color } : {}}>
              {c.name}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">冰箱贴属性</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs w-12">获取方式</span>
            <input type="text" value={acquired} onChange={e => setAcquired(e.target.value)} placeholder="购买/赠送" className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-12">用时</span>
            <input type="number" value={time} onChange={e => setTime(e.target.value)} placeholder="秒" className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
            <span className="text-xs w-10 text-right">秒</span>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">笔记</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="记录旅行故事..." rows={3} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none resize-none" />
      </Card>

      <div className="flex gap-3">
        <button onClick={handleSave} className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium tap-active">保存</button>
        <button onClick={() => navigate(-1)} className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-xl text-sm font-medium tap-active">取消</button>
      </div>
    </AnimatedPage>
  );
}
