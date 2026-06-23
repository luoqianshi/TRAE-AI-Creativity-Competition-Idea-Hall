import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { themes, ThemeDefinition, applyTheme } from '@/lib/themes';
import { useApp } from '@/context/AppContext';
import { playRandomSyllable } from '@/lib/sfx';

const MyWardrobe = () => {
  const { settings, updateSettings } = useApp();
   const currentTheme = settings.currentTheme || 'orange';

  const handleApplyTheme = (theme: ThemeDefinition) => {
    updateSettings({ currentTheme: theme.id });
    applyTheme(theme.id);
    playRandomSyllable();
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const isActive = (themeId: string) => currentTheme === themeId;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4"
    >
       <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-primary">
        <motion.span
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎨
        </motion.span>
         疯狂宇宙主题
      </h2>
       <p className="text-sm mb-4 text-muted-foreground">
         10种疯狂配色，点击切换宇宙！
      </p>

       <div className="grid grid-cols-2 gap-3">
        {themes.map((theme, index) => {
          const active = isActive(theme.id);
           const isBlackTheme = theme.id === 'black';
           const isWhiteTheme = theme.id === 'white';

          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
               whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleApplyTheme(theme)}
               className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{
                boxShadow: active 
                   ? `0 8px 30px ${theme.preview.primary}66, 0 0 20px ${theme.preview.primary}33`
                   : '0 4px 15px rgba(0, 0, 0, 0.08)',
                 border: active ? `3px solid ${theme.preview.primary}` : '2px solid rgba(255,255,255,0.5)',
              }}
            >
              {/* Glow effect for active */}
              {active && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                     background: `radial-gradient(circle at center, ${theme.preview.primary}4D 0%, transparent 70%)`,
                  }}
                />
              )}
              
              {/* Theme preview background */}
              <div
                 className="h-20 p-3 relative flex flex-col justify-between"
                 style={{ background: theme.bgGradient }}
              >
                {/* Glossy highlight */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                  style={{
                     background: isBlackTheme 
                       ? 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)'
                       : 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                  }}
                />
                
                 {/* Theme emoji */}
                 <div className="text-2xl relative z-10">{theme.emoji}</div>
 
                 {/* Theme name */}
                 <p
                   className="text-xs font-bold truncate relative z-10"
                   style={{ 
                     color: isBlackTheme ? '#4ADE80' : isWhiteTheme ? '#6366F1' : '#FFFFFF',
                     textShadow: isBlackTheme ? '0 0 10px #4ADE80' : isWhiteTheme ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                   }}
                >
                  {theme.name}
                </p>
              </div>

               {/* Theme info */}
              <div 
                 className="p-2 flex items-center justify-between"
                style={{
                   background: isBlackTheme 
                     ? 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)'
                     : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,251,245,0.9) 100%)',
                }}
              >
                 {/* Color dots */}
                 <div className="flex gap-1">
                   {Object.values(theme.preview).map((color, i) => (
                     <motion.div
                       key={i}
                       whileHover={{ scale: 1.2 }}
                       className="w-4 h-4 rounded-full"
                       style={{ 
                         backgroundColor: color,
                         border: isBlackTheme ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.8)',
                         boxShadow: isBlackTheme ? `0 0 8px ${color}` : '0 1px 4px rgba(0,0,0,0.1)',
                       }}
                     />
                   ))}
                 </div>
 
                 {/* Description */}
                 <p className="text-[10px] text-muted-foreground truncate max-w-[60%]">
                   {theme.description}
                 </p>
              </div>

              {/* Active indicator */}
              {active && (
                <motion.div 
                   className="absolute top-2 right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <div 
                     className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                       background: isBlackTheme 
                         ? 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)'
                         : `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.accent} 100%)`,
                       boxShadow: `0 2px 10px ${theme.preview.primary}80`,
                    }}
                  >
                     <Check className="w-3 h-3" style={{ color: isBlackTheme ? '#0F172A' : '#FFFFFF' }} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default MyWardrobe;
