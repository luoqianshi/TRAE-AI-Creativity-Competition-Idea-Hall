import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/home'), 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex flex-col items-center justify-center">
      <div className="animate-spring-bounce">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect x="10" y="8" width="36" height="40" rx="4" stroke="white" strokeWidth="2" fill="none" />
            <line x1="10" y1="20" x2="46" y2="20" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <circle cx="28" cy="34" r="8" stroke="white" strokeWidth="1.5" opacity="0.6" fill="none" />
            <text x="28" y="37" textAnchor="middle" fontSize="8" fill="white" opacity="0.8">贴</text>
          </svg>
        </div>
      </div>
      <h1 className="text-white text-3xl font-bold mb-2 animate-fade-in">冰箱贴集</h1>
      <p className="text-white/70 text-sm animate-fade-in-delay">冰箱贴图案记录与旅行足迹</p>
      <div className="mt-12 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>
    </div>
  );
}
