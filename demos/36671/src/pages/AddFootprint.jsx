import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { useStorage } from '../hooks/useStorage';
export default function AddFootprint() {
  const navigate = useNavigate();
  const [, setFootprints] = useStorage('fm_footprints', []);
  const [magnets] = useStorage('fm_magnets', []);

  const [magnetId, setMagnetId] = useState('');
  const [magnetName, setMagnetName] = useState('');
  const [location, setLocation] = useState('');
  const [trip, setTrip] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleMagnetChange = (id) => {
    setMagnetId(id);
    const m = magnets.find(m => m.id === id);
    if (m) {
      setMagnetName(m.name);
      if (!location) setLocation(m.origin);
    }
  };

  const handleSave = () => {
    const footprint = {
      id: `footprint_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      magnetId,
      magnetName: magnetName.trim() || '冰箱贴',
      location: location.trim() || '未知',
      trip: trip.trim() || '旅行',
      time: parseInt(time) || 0,
      notes: notes.trim(),
    };
    setFootprints(prev => [...prev, footprint]);
    navigate('/footprints');
  };

  return (
    <AnimatedPage type="fade">
            <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-bold">记录足迹</h2>
          <p className="text-text-secondary text-xs">记录一次旅行足迹</p>
        </div>
      </div>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">关联冰箱贴</label>
        <select value={magnetId} onChange={e => handleMagnetChange(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none">
          <option value="">选择已有冰箱贴（可选）</option>
          {magnets.map(m => (
            <option key={m.id} value={m.id}>{m.name} - {m.origin}</option>
          ))}
        </select>
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">冰箱贴名称</label>
        <input type="text" value={magnetName} onChange={e => setMagnetName(e.target.value)} placeholder="冰箱贴名称" className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">旅行地点</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="输入旅行地点" className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">旅行名称</label>
        <input type="text" value={trip} onChange={e => setTrip(e.target.value)} placeholder="如：北京三日游" className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">用时</label>
        <div className="flex items-center gap-2">
          <input type="number" value={time} onChange={e => setTime(e.target.value)} placeholder="秒" className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
          <span className="text-xs w-10 text-right">秒</span>
        </div>
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">笔记</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="记录旅行故事..." rows={3} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none resize-none" />
      </Card>

      <div className="flex gap-3">
        <button onClick={handleSave} className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium tap-active">保存</button>
        <button onClick={() => navigate(-1)} className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-xl text-sm font-medium tap-active">取消</button>
      </div>
    </AnimatedPage>
  );
}
