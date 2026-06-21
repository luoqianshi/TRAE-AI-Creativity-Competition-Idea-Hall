import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';

const AVATARS = ['🧲', '📍', '🗺️', '✈️', '🏔️', '🌊', '🏖️', '🌆', '🗼', '🎡', '🎒', '🌍'];

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('🧲');

  useEffect(() => {
    const saved = localStorage.getItem('fm_profile');
    if (saved) {
      const p = JSON.parse(saved);
      setName(p.name || '');
      setBio(p.bio || '');
      setAvatar(p.avatar || '🧲');
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('fm_profile', JSON.stringify({
      name: name.trim(),
      bio: bio.trim(),
      avatar,
    }));
    navigate(-1);
  };

  return (
    <AnimatedPage type="fade">
            <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-bold">编辑资料</h2>
          <p className="text-text-secondary text-xs">自定义你的形象</p>
        </div>
      </div>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">头像</label>
        <div className="grid grid-cols-6 gap-3">
          {AVATARS.map((a, i) => (
            <button key={i} onClick={() => setAvatar(a)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl tap-active ${avatar === a ? 'bg-teal-200 ring-2 ring-teal-600' : 'bg-gray-50'}`}>
              {a}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">昵称</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="输入昵称" className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </Card>

      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-2">签名</label>
        <input type="text" value={bio} onChange={e => setBio(e.target.value)} placeholder="写一句话介绍自己" className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </Card>

      <div className="flex gap-3">
        <button onClick={handleSave} className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium tap-active">保存</button>
        <button onClick={() => navigate(-1)} className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-xl text-sm font-medium tap-active">取消</button>
      </div>
    </AnimatedPage>
  );
}
