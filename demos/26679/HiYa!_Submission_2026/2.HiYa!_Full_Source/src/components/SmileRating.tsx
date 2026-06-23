import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { getRatingVisuals, RatingLevel } from '@/lib/ratingStyles';

interface SmileRatingProps {
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'poster';
}

const smileFaces = [
  { emoji: '😊', label: '嗨呀！' },
  { emoji: '😆', label: '嗨呀呀！！' },
  { emoji: '🤩', label: '嗨呀嗨呀！！！' },
];

const sizeClasses = {
  sm: { text: 'text-2xl', box: 'w-12 h-12', radius: '14px' },
  md: { text: 'text-4xl', box: 'w-16 h-16', radius: '18px' },
  lg: { text: 'text-5xl', box: 'w-20 h-20', radius: '22px' },
};

const SmileRating = ({ value, onChange, readonly = false, size = 'lg' }: SmileRatingProps) => {
  const { settings } = useApp();
  const themeId = settings?.currentTheme || 'orange';

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {smileFaces.map((face, index) => {
        const rating = (index + 1) as RatingLevel;
        const isSelected = value === rating;
        const sizeConfig = sizeClasses[size];

        // Always paint each tier with its own visual — even when not selected
        // we show a faint preview, so the 3-tier hierarchy is obvious.
        const visuals = getRatingVisuals(themeId, rating);
        const isMedal = rating === 3;

        return (
          <motion.button
            key={rating}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(rating)}
            className={`relative ${sizeConfig.box} flex items-center justify-center transition-all duration-300 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            style={{
              borderRadius: sizeConfig.radius,
              background: visuals.background,
              boxShadow: isSelected
                ? visuals.boxShadow
                : (isMedal
                    ? visuals.boxShadow.replace(/0\.\d+/g, (m) => String(parseFloat(m) * 0.45))
                    : '0 2px 8px rgba(0,0,0,0.08)'),
              border: visuals.border ?? (isSelected ? '2.5px solid rgba(255,255,255,0.6)' : '2.5px solid transparent'),
              opacity: isSelected ? 1 : 0.55,
              transform: isSelected ? 'scale(1)' : 'scale(0.92)',
            }}
            animate={isSelected ? {
              scale: [1, 1.08, 1],
              rotate: isMedal ? [0, -4, 4, 0] : [0, -2, 2, 0],
            } : {}}
            transition={isSelected ? {
              duration: isMedal ? 0.8 : 0.6,
              repeat: Infinity,
              repeatDelay: 1,
            } : {}}
            whileHover={!readonly ? { scale: isSelected ? 1.08 : 1.05, opacity: 1 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            aria-label={face.label}
          >
            {/* Metallic shine overlay only for the medal (Level 3) */}
            {isMedal && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: sizeConfig.radius,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.15) 100%)',
                }}
                animate={isSelected ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.6 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Crown for the medal */}
            {isMedal && isSelected && (
              <motion.span
                className="absolute -top-3 -right-2 text-base"
                animate={{ y: [0, -3, 0], rotate: [-8, 8, -8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                👑
              </motion.span>
            )}

            <span
              className={`${sizeConfig.text} relative z-10`}
              style={{
                filter: isMedal && isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' : undefined,
              }}
            >
              {face.emoji}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SmileRating;
