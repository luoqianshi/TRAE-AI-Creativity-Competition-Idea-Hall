import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ChoiceOptionProps {
  label: string;
  prefix: ReactNode;
  onClick?: () => void;
  state?: 'idle' | 'correct' | 'wrong' | 'selected';
  disabled?: boolean;
  index: number;
}

const COLORS = [
  { bg: 'from-kid-sky to-blue-400', border: 'border-kid-sky/50', hover: 'hover:border-kid-sky' },
  { bg: 'from-kid-coral to-orange-400', border: 'border-kid-coral/50', hover: 'hover:border-kid-coral' },
  { bg: 'from-kid-mint to-green-400', border: 'border-kid-mint/50', hover: 'hover:border-kid-mint' },
  { bg: 'from-kid-lavender to-purple-400', border: 'border-kid-lavender/50', hover: 'hover:border-kid-lavender' },
];

export default function ChoiceOption({ label, prefix, onClick, state = 'idle', disabled, index }: ChoiceOptionProps) {
  const color = COLORS[index % COLORS.length];

  let stateClass = '';
  let stateIcon: ReactNode = null;
  if (state === 'correct') {
    stateClass = '!bg-gradient-to-br !from-kid-mint !to-green-500 !text-white !border-kid-mint !scale-[1.02] shadow-kid-lg animate-pop';
    stateIcon = <Check size={28} strokeWidth={3.5} className="animate-pop" />;
  } else if (state === 'wrong') {
    stateClass = '!bg-gradient-to-br !from-kid-coral !to-red-500 !text-white !border-kid-coral animate-shake';
    stateIcon = <X size={28} strokeWidth={3.5} className="animate-pop" />;
  } else if (state === 'selected') {
    stateClass = 'ring-4 ring-white/70 scale-[1.02]';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || state === 'correct' || state === 'wrong'}
      className={`group relative flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl border-4 border-dashed bg-gradient-to-br ${color.bg} text-white transition-all duration-200 w-full text-left shadow-kid hover:shadow-kid-lg hover:-translate-y-0.5 active:translate-y-0 ${color.border} ${color.hover} disabled:cursor-not-allowed disabled:hover:translate-y-0 ${stateClass}`}
    >
      <div className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/30 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center shadow-inner">
        <span className="title-kid text-xl md:text-2xl">{prefix}</span>
      </div>
      <span className="flex-1 font-kid font-bold text-base md:text-xl break-words">
        {label}
      </span>
      <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
        {stateIcon}
      </div>
      <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-white/0 group-hover:bg-white/10 transition-all pointer-events-none" />
    </button>
  );
}
