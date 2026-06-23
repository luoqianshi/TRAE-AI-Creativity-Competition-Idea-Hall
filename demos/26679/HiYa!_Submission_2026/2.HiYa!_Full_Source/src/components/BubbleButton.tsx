import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getThemeById } from '@/lib/themes';

interface BubbleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary';
  'data-testid'?: string;
}

const BubbleButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  size = 'md',
  variant = 'primary',
  'data-testid': testId,
}: BubbleButtonProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { settings } = useApp();
  
  const theme = useMemo(() => getThemeById(settings.currentTheme || 'orange'), [settings.currentTheme]);
  const isNeonTheme = settings.currentTheme === 'black';
  const isHoloTheme = settings.currentTheme === 'white';

  const handleClick = () => {
    if (disabled) return;
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 600);
    
    onClick?.();
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm rounded-xl',
    md: 'py-3 px-6 text-base rounded-2xl',
    lg: 'py-4 px-8 text-lg rounded-2xl',
    xl: 'py-5 px-10 text-xl rounded-3xl',
  };

  // Dynamic theme-based styles
  const getVariantStyles = () => {
    if (isNeonTheme) {
      return {
        primary: {
          background: 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)',
          boxShadow: '0 0 30px hsl(142 71% 45% / 0.6), 0 0 60px hsl(142 71% 45% / 0.3)',
          color: '#0F172A',
        },
        secondary: {
          background: 'linear-gradient(135deg, hsl(330 81% 60%) 0%, hsl(330 76% 50%) 100%)',
          boxShadow: '0 0 20px hsl(330 81% 60% / 0.5)',
          color: '#0F172A',
        },
      };
    }
    
    if (isHoloTheme) {
      return {
        primary: {
          background: 'linear-gradient(135deg, #EF4444 0%, #F97316 20%, #FBBF24 40%, #22C55E 60%, #3B82F6 80%, #8B5CF6 100%)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)',
          color: 'white',
        },
        secondary: {
          background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          color: '#374151',
        },
      };
    }
    
    // Default theme-based colors using CSS variables
    return {
      primary: {
        background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 50%, hsl(var(--primary) / 0.7) 100%)`,
        boxShadow: '0 8px 30px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.3)',
        color: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent) / 0.8) 100%)',
        boxShadow: '0 4px 20px hsl(var(--primary) / 0.2)',
        color: 'hsl(var(--accent-foreground))',
      },
    };
  };

  const variantStyles = getVariantStyles();
  const confettiColors = theme?.decorations || ['✨', '🎉', '⭐', '💫', '🌟'];

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.92, rotate: [-1, 1, 0] }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={handleClick}
      disabled={disabled}
      className={`relative font-bold ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={variantStyles[variant]}
      data-testid={testId}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-inherit opacity-60 blur-md -z-10"
        style={{ 
          background: variantStyles[variant].background,
          borderRadius: 'inherit',
        }}
      />
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
      
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 1, 
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{ 
                opacity: 0, 
                scale: 1,
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
              }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 text-sm"
            >
              {confettiColors[i % confettiColors.length]}
            </motion.div>
          ))}
        </div>
      )}
    </motion.button>
  );
};

export default BubbleButton;
