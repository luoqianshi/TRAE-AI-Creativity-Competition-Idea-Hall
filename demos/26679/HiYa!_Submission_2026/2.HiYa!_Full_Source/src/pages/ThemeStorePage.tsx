import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import BottomTabBar from '@/components/BottomTabBar';
import MyWardrobe from '@/components/MyWardrobe';
import UnlockCelebration from '@/components/UnlockCelebration';
import ThemeLockScreen from '@/components/ThemeLockScreen';
import { useApp } from '@/context/AppContext';
import CandyBackground from '@/components/CandyBackground';
import BounceTitle from '@/components/BounceTitle';
import { getThemeById } from '@/lib/themes';

const ThemeStorePage = () => {
  const navigate = useNavigate();
  const { entries, settings } = useApp();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  const themeId = settings.currentTheme || 'orange';
  const isNeonTheme = themeId === 'black';
  const isHoloTheme = themeId === 'white';
  const isYellowTheme = themeId === 'yellow';
  
  const daysRecorded = entries.length;
  
  // Check if user is HiYaJoHn (case-insensitive) to bypass 20-day restriction
  const isDeveloper = settings.userId?.toLowerCase() === 'hiyajohn';
   // Also check if theme store was unlocked via import
   const isUnlocked = isDeveloper || daysRecorded >= 20 || settings.themeStoreUnlocked === true;

  useEffect(() => {
    if (!isUnlocked) {
      setShowLockScreen(true);
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      const celebrationShown = localStorage.getItem('haiya_celebration_shown');
      if (!celebrationShown) {
        setShowCelebration(true);
        localStorage.setItem('haiya_celebration_shown', 'true');
      }
    }
  }, [isUnlocked]);

  const handleDoubleTap = () => {
    if (!isUnlocked) return;
    
    const now = Date.now();
    if (now - lastTapTime < 300) {
      setShowCelebration(true);
    }
    setLastTapTime(now);
  };

  return (
    <div 
      className="min-h-screen pb-24 pt-safe relative"
      onClick={handleDoubleTap}
    >
      <CandyBackground />

      {/* Header */}
      <header className="relative z-10 p-4 pt-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="absolute left-4 top-6 p-3 rounded-full shadow-lg"
          style={{
            background: isNeonTheme 
              ? 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)'
              : isHoloTheme
              ? 'linear-gradient(135deg, #EF4444 0%, #F97316 16.67%, #FBBF24 33.33%, #22C55E 50%, #3B82F6 66.67%, #8B5CF6 83.33%, #EC4899 100%)'
              : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)',
            boxShadow: isNeonTheme 
              ? '0 0 30px rgba(74, 222, 128, 0.3)'
              : `0 4px 15px hsl(var(--primary) / 0.3)`,
          }}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: isYellowTheme ? '#78350F' : '#FFFFFF' }} />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-2"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6" style={{ color: isNeonTheme ? '#4ADE80' : isYellowTheme ? '#78350F' : 'hsl(var(--primary))' }} />
            </motion.div>
            <BounceTitle className="text-2xl">
              嗨呀！主题
            </BounceTitle>
            <motion.div
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles className="w-6 h-6" style={{ color: isNeonTheme ? '#4ADE80' : isYellowTheme ? '#78350F' : 'hsl(var(--primary))' }} />
            </motion.div>
          </div>
          <p className="text-sm" style={{ color: isNeonTheme ? '#4ADE80' : isYellowTheme ? '#78350F' : 'hsl(var(--primary) / 0.8)' }}>选择你喜欢的主题风格</p>
        </motion.div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 space-y-8">
        <MyWardrobe />
        <div className="h-8" />
      </div>

      <BottomTabBar />

      <UnlockCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      {showLockScreen && !isUnlocked && (
        <ThemeLockScreen 
          daysRecorded={daysRecorded} 
          onClose={() => setShowLockScreen(false)} 
        />
      )}
    </div>
  );
};

export default ThemeStorePage;
