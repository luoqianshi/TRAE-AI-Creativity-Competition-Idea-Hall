import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { FIELD_GUIDE } from '../data/fridgeMagnet';

export default function FieldGuide() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  return (
    <AnimatedPage type="fade">
            <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-bold">冰箱贴指南</h2>
          <p className="text-text-secondary text-xs">冰箱贴收藏知识与技巧</p>
        </div>
      </div>

      <div className="space-y-3">
        {FIELD_GUIDE.map((guide, i) => (
          <Card key={guide.id} className="stagger-item" style={{ animationDelay: `${i * 0.03}s` }}>
            <button onClick={() => setExpanded(expanded === guide.id ? null : guide.id)} className="w-full tap-active">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {guide.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{guide.title}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-text-secondary transition-transform ${expanded === guide.id ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>
            {expanded === guide.id && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{guide.content}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </AnimatedPage>
  );
}
