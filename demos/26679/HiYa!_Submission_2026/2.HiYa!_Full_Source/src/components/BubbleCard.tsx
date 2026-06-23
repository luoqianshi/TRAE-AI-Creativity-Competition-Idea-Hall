import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

interface BubbleCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  delay?: number;
  onClick?: () => void;
}

const BubbleCard = ({ 
  children, 
  className = '', 
  glow = false,
  delay = 0,
  onClick,
}: BubbleCardProps) => {
  const { settings } = useApp();
  const isNeonTheme = settings.currentTheme === 'black';
  const isHoloTheme = settings.currentTheme === 'white';

  const getCardStyles = () => {
    if (isNeonTheme) {
      return {
        background: 'linear-gradient(145deg, hsl(222 47% 11% / 0.95) 0%, hsl(222 47% 8% / 0.9) 100%)',
        boxShadow: glow 
          ? '0 0 40px hsl(142 71% 45% / 0.3), 0 0 80px hsl(142 71% 45% / 0.15), inset 0 1px 0 hsl(142 71% 45% / 0.2)'
          : '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 hsl(142 71% 45% / 0.1)',
        border: glow 
          ? '2px solid hsl(142 71% 45% / 0.5)'
          : '2px solid hsl(142 71% 45% / 0.2)',
      };
    }
    
    if (isHoloTheme) {
      return {
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
        boxShadow: glow 
          ? '0 10px 40px rgba(99, 102, 241, 0.15), 0 0 30px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)'
          : '0 8px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        border: glow 
          ? '2px solid transparent'
          : '2px solid rgba(200, 200, 200, 0.3)',
        backgroundImage: glow ? 'linear-gradient(white, white), linear-gradient(90deg, #EF4444, #F97316, #FBBF24, #22C55E, #3B82F6, #8B5CF6, #EC4899)' : 'none',
        backgroundOrigin: 'border-box',
        backgroundClip: glow ? 'padding-box, border-box' : 'padding-box',
      };
    }
    
    // Default theme-based styling
    return {
      background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.9) 100%)',
      boxShadow: glow 
        ? '0 10px 40px hsl(var(--primary) / 0.25), 0 0 30px hsl(var(--primary) / 0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
        : '0 8px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
      border: glow 
        ? '2px solid hsl(var(--primary) / 0.3)'
        : '2px solid hsl(var(--border) / 0.5)',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={`relative rounded-3xl p-4 sm:p-5 overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={getCardStyles()}
    >
      {/* Glossy highlight */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: isNeonTheme 
            ? 'linear-gradient(180deg, hsl(142 71% 45% / 0.1) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
          borderRadius: 'inherit',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default BubbleCard;
