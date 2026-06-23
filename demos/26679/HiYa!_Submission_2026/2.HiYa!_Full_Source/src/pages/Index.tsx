 import { useState, useRef, useCallback, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { useNavigate } from 'react-router-dom';
 import { Settings } from 'lucide-react';
 import { useApp } from '@/context/AppContext';
 import FourWeekCalendar from '@/components/FourWeekCalendar';
 import SmileRating from '@/components/SmileRating';
 import { playHaiya } from '@/lib/sfx';
 import { useNotificationReminder } from '@/hooks/useNotificationReminder';
 import BottomTabBar from '@/components/BottomTabBar';
 import CandyBackground from '@/components/CandyBackground';
 import BounceTitle from '@/components/BounceTitle';
 import BubbleCard from '@/components/BubbleCard';
 import { getThemeById } from '@/lib/themes';
 import { formatLocalDateForZh } from '@/lib/date';
 
 const Index = () => {
   const navigate = useNavigate();
   const { getTodayEntry, getWeekEntries, settings } = useApp();
   const [isPressed, setIsPressed] = useState(false);
   const [progress, setProgress] = useState(0);
   const [showConfetti, setShowConfetti] = useState(false);
   const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
   const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
   
   useNotificationReminder();
   
   const todayEntry = getTodayEntry();
   const weekEntries = getWeekEntries();
   
   const currentTheme = getThemeById(settings.currentTheme || 'orange');
   const isNeonTheme = settings.currentTheme === 'black';
   const isHoloTheme = settings.currentTheme === 'white';
   
   const bestEntry = weekEntries.length > 0 
     ? weekEntries.reduce((best, entry) => entry.rating > best.rating ? entry : best, weekEntries[0])
     : null;
   
   const formatDate = (date: Date) => {
     return date.toLocaleDateString('zh-CN', {
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       weekday: 'long',
     });
   };
 
   const handlePressStart = useCallback(() => {
     playHaiya();
     setIsPressed(true);
     setProgress(0);
     
     progressIntervalRef.current = setInterval(() => {
       setProgress(prev => Math.min(prev + 5, 100));
     }, 100);
     
     pressTimerRef.current = setTimeout(() => {
       setShowConfetti(true);
       setTimeout(() => {
         navigate('/record');
       }, 300);
     }, 2000);
   }, [navigate]);
 
   const handlePressEnd = useCallback(() => {
     setIsPressed(false);
     setProgress(0);
     
     if (pressTimerRef.current) {
       clearTimeout(pressTimerRef.current);
       pressTimerRef.current = null;
     }
     if (progressIntervalRef.current) {
       clearInterval(progressIntervalRef.current);
       progressIntervalRef.current = null;
     }
   }, []);
 
   useEffect(() => {
     return () => {
       if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
       if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
     };
   }, []);
 
   return (
     <div className="min-h-screen max-w-md mx-auto flex flex-col relative overflow-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
       <CandyBackground />
       
       {/* Header */}
       <motion.header
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="p-3 sm:p-4 space-y-0.5 relative z-10 flex justify-between items-start"
       >
         <div>
           <BounceTitle className="text-3xl sm:text-4xl">
             嗨呀！
           </BounceTitle>
           <span className="text-xs sm:text-sm text-muted-foreground">
             {formatDate(new Date())}
           </span>
         </div>
         <motion.button
           whileHover={{ scale: 1.1, rotate: 15 }}
           whileTap={{ scale: 0.9 }}
           onClick={() => navigate('/settings')}
           className="p-3 rounded-full shadow-lg text-primary-foreground"
           style={{
             background: isNeonTheme 
               ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)'
               : isHoloTheme
               ? 'linear-gradient(135deg, #EF4444 0%, #F97316 20%, #FBBF24 40%, #22C55E 60%, #3B82F6 80%, #8B5CF6 100%)'
               : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
             boxShadow: isNeonTheme 
               ? '0 0 20px hsl(142 71% 45% / 0.5)'
               : '0 4px 15px hsl(var(--primary) / 0.4)',
           }}
         >
           <Settings className="w-5 h-5" style={{ color: isNeonTheme ? '#0F172A' : 'white' }} />
         </motion.button>
       </motion.header>
       
       {/* Best Entry of the Week */}
        <div className="px-3 sm:px-4 mb-2 sm:mb-3 relative z-10">
          <BubbleCard glow delay={0.1}>
            <h2 className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'hsl(var(--primary))' }}>
             <motion.span
               animate={{ rotate: [0, 15, -15, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
               🌟
             </motion.span>
             上周最嗨！
           </h2>
            {bestEntry ? (
              <div className="space-y-1.5">
                <SmileRating value={bestEntry.rating} onChange={() => {}} readonly size="sm" />
               <p className="text-xs sm:text-sm line-clamp-2 text-card-foreground">
                 {bestEntry.content || '没有写什么...'}
               </p>
               <span className="text-xs text-muted-foreground">
                 {formatLocalDateForZh(bestEntry.date, { month: 'short', day: 'numeric' })}
               </span>
             </div>
           ) : (
             <p className="text-xs sm:text-sm text-muted-foreground">
               还没有记录哦，快来记录吧！✨
             </p>
           )}
         </BubbleCard>
       </div>
       
       {/* Four Week Calendar */}
        <div className="px-3 sm:px-4 mb-2 sm:mb-3 relative z-10">
          <h2 className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'hsl(var(--primary))' }}>
           <motion.span
             animate={{ y: [0, -3, 0] }}
             transition={{ duration: 1.5, repeat: Infinity }}
           >
             🗓️
           </motion.span>
           这是你的嗨呀！
         </h2>
         <BubbleCard delay={0.2}>
           <FourWeekCalendar />
         </BubbleCard>
       </div>
       
       {/* Center Record Button - Theme-aware circular button */}
       <div className="flex-1 flex items-center justify-center px-4 sm:px-6 relative z-10">
         <motion.div className="relative">
           {/* Pulsing glow effect */}
           <motion.div
             animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.4, 0.6, 0.4],
             }}
             transition={{ 
               duration: 2,
               repeat: Infinity,
               ease: "easeInOut",
             }}
             className="absolute inset-0 rounded-full"
             style={{
               background: isNeonTheme 
                 ? 'radial-gradient(circle, hsl(142 71% 45% / 0.6) 0%, transparent 70%)'
                 : isHoloTheme
                 ? 'radial-gradient(circle, hsl(239 84% 67% / 0.4) 0%, transparent 70%)'
                 : 'radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, transparent 70%)',
               transform: 'scale(1.8)',
               filter: 'blur(30px)',
             }}
           />
           
           {/* Main button */}
           <motion.button
             onMouseDown={handlePressStart}
             onMouseUp={handlePressEnd}
             onMouseLeave={handlePressEnd}
             onTouchStart={handlePressStart}
             onTouchEnd={handlePressEnd}
             animate={isPressed ? { scale: 0.95 } : { scale: [1, 1.03, 1] }}
             transition={isPressed ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full font-bold text-xl p-3"
             style={{
               background: isNeonTheme 
                 ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 50%, hsl(142 71% 28%) 100%)'
                 : isHoloTheme
                 ? 'linear-gradient(135deg, #EF4444 0%, #F97316 16.67%, #FBBF24 33.33%, #22C55E 50%, #3B82F6 66.67%, #8B5CF6 83.33%, #EC4899 100%)'
                 : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 50%, hsl(var(--primary) / 0.7) 100%)',
               boxShadow: isNeonTheme 
                 ? '0 0 50px hsl(142 71% 45% / 0.5), 0 0 100px hsl(142 71% 45% / 0.3), inset 0 -5px 20px rgba(0,0,0,0.3)'
                 : '0 15px 50px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.4), inset 0 -5px 20px rgba(0,0,0,0.1)',
               border: isNeonTheme 
                 ? '2px solid hsl(142 71% 60%)'
                 : 'none',
             }}
             data-testid="button-record"
             data-sfx="off"
           >
             {/* Glossy highlight */}
             <div 
               className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-full"
               style={{
                 background: isNeonTheme 
                   ? 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
                   : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
               }}
             />
             
             {/* Progress fill */}
             <div
               className="absolute inset-0 transition-all duration-100 rounded-full"
               style={{ 
                 background: 'rgba(255,255,255,0.3)',
                 clipPath: `inset(${100 - progress}% 0 0 0)`,
               }}
             />
             
             {/* Content */}
             <div className="relative z-10 flex flex-col items-center justify-center h-full" style={{ color: isNeonTheme ? '#0F172A' : 'white' }}>
                <motion.span 
                  className="text-3xl sm:text-4xl mb-1"
                 animate={{ rotate: [0, 10, -10, 0] }}
                 transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
               >
                 {currentTheme?.emoji || '😊'}
               </motion.span>
               <span className="text-base sm:text-lg font-black">
                 {todayEntry ? '更嗨呀的！' : '嗨呀！'}
               </span>
               {isPressed && (
                 <span className="text-xs mt-1 opacity-80">长按2秒...</span>
               )}
             </div>
           </motion.button>
           
           {/* Confetti burst */}
           {showConfetti && (
             <div className="absolute inset-0 pointer-events-none">
               {[...Array(12)].map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                   animate={{ 
                     opacity: 0, 
                     scale: 1,
                     x: Math.cos(i * 30 * Math.PI / 180) * 100,
                     y: Math.sin(i * 30 * Math.PI / 180) * 100,
                   }}
                   transition={{ duration: 0.6 }}
                   className="absolute top-1/2 left-1/2 text-2xl"
                 >
                   {(currentTheme?.decorations || ['✨', '🎉', '⭐', '💫', '🌟'])[i % 5]}
                 </motion.div>
               ))}
             </div>
           )}
         </motion.div>
       </div>
 
       <BottomTabBar />
     </div>
   );
 };
 
 export default Index;
