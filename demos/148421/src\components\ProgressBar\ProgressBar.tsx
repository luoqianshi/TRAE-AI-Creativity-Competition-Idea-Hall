interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'sky' | 'mint' | 'lemon' | 'coral' | 'lavender' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const colorMap = {
  sky: 'from-kid-sky to-blue-400',
  mint: 'from-kid-mint to-green-400',
  lemon: 'from-kid-lemon to-yellow-400',
  coral: 'from-kid-coral to-orange-400',
  lavender: 'from-kid-lavender to-purple-400',
  pink: 'from-kid-pink to-rose-400',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-5',
};

export default function ProgressBar({ value, max = 100, color = 'sky', size = 'md', showLabel = false }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full">
      <div className={`progress-track ${sizeMap[size]}`}>
        <div
          className={`progress-fill bg-gradient-to-r ${colorMap[color]} shadow-inner relative overflow-hidden`}
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse-slow" />
        </div>
      </div>
      {showLabel && (
        <p className="mt-1 text-xs font-kid text-kid-textLight">
          {Math.round(pct)}% ({value}/{max})
        </p>
      )}
    </div>
  );
}
