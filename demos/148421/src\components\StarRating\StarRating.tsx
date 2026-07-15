import { useEffect, useState } from 'react';

interface StarRatingProps {
  value: number; // 0-5
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animate?: boolean;
}

const sizeMap = {
  sm: 'text-xl gap-1',
  md: 'text-2xl gap-1.5',
  lg: 'text-4xl gap-2',
  xl: 'text-6xl gap-3',
};

const LABELS = ['继续加油', '初有成效', '表现不错', '非常优秀', '超级棒！', '完美满分！'];

export default function StarRating({ value, size = 'lg', showLabel = true, animate = true }: StarRatingProps) {
  const [displayStars, setDisplayStars] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplayStars(value);
      return;
    }
    setDisplayStars(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setDisplayStars(i);
      if (i >= value) clearInterval(timer);
    }, 220);
    return () => clearInterval(timer);
  }, [value, animate]);

  const label = LABELS[Math.max(0, Math.min(5, Math.round(value)))];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex ${sizeMap[size]}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`transition-all duration-300 drop-shadow-md ${
              n <= displayStars
                ? 'scale-100 opacity-100'
                : 'scale-90 opacity-30 grayscale'
            }`}
            style={animate ? { transitionDelay: `${n * 0.15}s` } : undefined}
          >
            {n <= displayStars ? '⭐' : '☆'}
          </span>
        ))}
      </div>
      {showLabel && (
        <p className="title-kid text-xl md:text-2xl text-kid-coral animate-pop" style={{ animationDelay: '1.2s' }}>
          {label} 🎉
        </p>
      )}
    </div>
  );
}
