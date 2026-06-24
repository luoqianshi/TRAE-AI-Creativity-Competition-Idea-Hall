import { useEffect, useRef } from 'react';
import { Mic, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();
  const capsuleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const capsule = capsuleRef.current;
    if (!capsule) return;

    let angle = 0;
    let rafId = 0;

    const animate = () => {
      angle += 0.5;
      capsule.style.transform = `rotateX(${20 + Math.sin(angle * 0.02) * 10}deg) rotateY(${angle * 0.3}deg)`;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#1a1a2e] to-[#0f0f1a]" />

      <div
        ref={capsuleRef}
        className="relative mb-10 h-40 w-80 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_80px_-20px_rgba(99,102,241,0.6)]"
        style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
        <div className="absolute left-8 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_20px_4px_rgba(255,255,255,0.8)]" />
      </div>

      <h1 className="relative z-10 mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
        思绪胶囊
        <span className="block text-2xl font-medium tracking-wide text-cyan-300 sm:text-3xl">
          MindCapsule
        </span>
      </h1>

      <p className="relative z-10 max-w-2xl text-lg leading-relaxed text-indigo-100/80 sm:text-xl">
        按下录音，把一闪而过的灵感封存成可检索的知识卡片。
        <br className="hidden sm:block" />
        AI 自动整理，让碎片信息生长为你的第二大脑。
      </p>

      <button
        onClick={() => navigate('/app')}
        className="relative z-10 mt-10 flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.7)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-10px_rgba(99,102,241,0.9)]"
      >
        <Mic size={22} />
        开始记录
        <ArrowRight size={20} />
      </button>
    </section>
  );
}
