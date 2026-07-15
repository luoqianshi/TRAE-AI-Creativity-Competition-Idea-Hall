import type { ReactNode } from 'react';

interface NavButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  gradient: string;
  onClick?: () => void;
  badge?: ReactNode | number;
}

export default function NavButton({ icon, title, subtitle, gradient, onClick, badge }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group card-gradient bg-gradient-to-br ${gradient} text-white text-left relative overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 active:scale-100 shadow-kid hover:shadow-kid-lg`}
    >
      <div className="absolute inset-0 bg-stripes opacity-25 group-hover:opacity-40 transition-opacity" />
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

      {badge !== undefined && (
        <div className="absolute top-3 right-3 z-10">
          {typeof badge === 'number' ? (
            <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-extrabold shadow-kid ${badge > 0 ? 'bg-white text-kid-coral animate-pulse-slow' : 'bg-white/40 text-white'}`}>
              {badge}
            </span>
          ) : (
            badge
          )}
        </div>
      )}

      <div className="relative flex flex-col items-center text-center gap-4 py-4">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-5xl md:text-6xl shadow-kid-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h3 className="title-kid text-xl md:text-2xl mb-1">{title}</h3>
          <p className="text-xs md:text-sm opacity-90 font-kid">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}
