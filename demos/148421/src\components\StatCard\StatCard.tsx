import { Sparkles } from 'lucide-react';

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  gradient: string;
  subtitle?: string;
  animationDelay?: string;
}

export default function StatCard({ icon, label, value, gradient, subtitle, animationDelay }: StatCardProps) {
  return (
    <div
      className={`card-gradient bg-gradient-to-br ${gradient} text-white relative overflow-hidden`}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20 blur-xl" />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-md" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs md:text-sm font-kid font-semibold opacity-90 mb-1">{label}</p>
          <p className="title-kid text-3xl md:text-5xl text-stroke leading-none mb-1">{value}</p>
          {subtitle && <p className="text-[11px] md:text-xs opacity-90 flex items-center gap-1"><Sparkles size={12} />{subtitle}</p>}
        </div>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-3xl md:text-4xl shadow-inner animate-float">
          {icon}
        </div>
      </div>
    </div>
  );
}
