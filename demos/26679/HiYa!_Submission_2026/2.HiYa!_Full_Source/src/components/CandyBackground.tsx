import { motion } from 'framer-motion';
 import { useApp } from '@/context/AppContext';
 import { getThemeById, getThemeDecorations, getThemeGradient } from '@/lib/themes';

interface CandyBackgroundProps {
  children?: React.ReactNode;
}

const CandyBackground = ({ children }: CandyBackgroundProps) => {
   const { settings } = useApp();
   const themeId = settings.currentTheme || 'orange';
   const theme = getThemeById(themeId);
   const decorations = getThemeDecorations(themeId);
   const bgGradient = getThemeGradient(themeId);
   
   // Check if it's neon black theme
   const isNeonTheme = themeId === 'black';
   const isWhiteTheme = themeId === 'white';
 
  return (
    <>
       {/* Dynamic theme gradient background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
           background: bgGradient,
        }}
      />
      
       {/* Rainbow border overlay for white theme */}
       {isWhiteTheme && (
         <div 
           className="fixed inset-0 pointer-events-none"
           style={{
             background: 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(249,115,22,0.1), rgba(234,179,8,0.1), rgba(34,197,94,0.1), rgba(59,130,246,0.1), rgba(139,92,246,0.1), rgba(236,72,153,0.1))',
             mixBlendMode: 'overlay',
           }}
         />
       )}
 
       {/* Neon glow overlay for black theme */}
       {isNeonTheme && (
         <div 
           className="fixed inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(244,114,182,0.15) 0%, transparent 50%)',
           }}
         />
       )}
       
      {/* Floating decorations layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         {/* Decoration 1 - top right */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ 
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
           className="absolute top-[10%] right-[5%] text-4xl will-change-transform"
           style={{ opacity: isNeonTheme ? 0.7 : 0.4 }}
        >
           <span role="img" aria-label="decoration">{decorations[0]}</span>
        </motion.div>
        
         {/* Decoration 2 - top left */}
        <motion.div
          animate={{ 
            y: [0, 15, 0],
          }}
          transition={{ 
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
           className="absolute top-[5%] left-[10%] text-3xl will-change-transform"
           style={{ opacity: isNeonTheme ? 0.6 : 0.3 }}
        >
           <span role="img" aria-label="decoration">{decorations[1]}</span>
        </motion.div>
        
         {/* Decoration 3 - center right */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
           className="absolute top-[40%] right-[8%] text-2xl will-change-transform"
           style={{ 
             opacity: isNeonTheme ? 0.8 : 0.5,
           }}
        >
           <span role="img" aria-label="decoration">{decorations[2]}</span>
        </motion.div>
        
         {/* Decoration 4 - bottom left */}
        <motion.div
          animate={{ 
            y: [0, 10, 0],
          }}
          transition={{ 
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
           className="absolute bottom-[30%] left-[5%] text-3xl will-change-transform"
           style={{ 
             opacity: isNeonTheme ? 0.7 : 0.35,
           }}
        >
           <span role="img" aria-label="decoration">{decorations[3]}</span>
        </motion.div>
        
         {/* Decoration 5 - bottom right */}
        <motion.div
          animate={{ 
            y: [0, -12, 0],
          }}
          transition={{ 
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
           className="absolute bottom-[15%] right-[15%] text-3xl will-change-transform"
           style={{ opacity: isNeonTheme ? 0.6 : 0.25 }}
        >
           <span role="img" aria-label="decoration">{decorations[4]}</span>
        </motion.div>
        
         {/* Extra sparkle - top center */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
           className="absolute top-[25%] left-[50%] text-xl will-change-transform"
        >
           <span role="img" aria-label="sparkle">✨</span>
        </motion.div>
      </div>
      
      {children}
    </>
  );
};

export default CandyBackground;
