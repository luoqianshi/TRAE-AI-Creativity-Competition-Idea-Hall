import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wind, Music, PencilLine, Sun, Menu } from 'lucide-react';

import WelcomeScreen from './components/WelcomeScreen';
import DashboardView from './components/DashboardView';
import BreathView from './components/BreathView';
import SoundView from './components/SoundView';
import CanvasView from './components/CanvasView';
import IslandView from './components/IslandView';

import { SavedArtwork, MoodLog, MoodType } from './types';
import { INITIAL_SAVED_ARTWORKS, INITIAL_MOOD_LOGS, USER_PROFILE } from './data';

type TabId = 'home' | 'breath' | 'sound' | 'canvas' | 'island';

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lumina_dark_mode');
    return saved === 'true';
  });

  // Toggle dark mode side effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lumina_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Dynamic application state lists
  const [artworks, setArtworks] = useState<SavedArtwork[]>(() => {
    const saved = localStorage.getItem('lumina_artworks');
    return saved ? JSON.parse(saved) : INITIAL_SAVED_ARTWORKS;
  });

  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => {
    const saved = localStorage.getItem('lumina_moods');
    return saved ? JSON.parse(saved) : INITIAL_MOOD_LOGS;
  });

  // Persist storage hook
  useEffect(() => {
    localStorage.setItem('lumina_artworks', JSON.stringify(artworks));
  }, [artworks]);

  useEffect(() => {
    localStorage.setItem('lumina_moods', JSON.stringify(moodLogs));
  }, [moodLogs]);

  // Handlers
  const handleStartApp = () => {
    setHasStarted(true);
  };

  const handleAddArtwork = (newArt: SavedArtwork) => {
    setArtworks((prev) => [newArt, ...prev]);
  };

  const handleToggleFavorite = (id: string) => {
    setArtworks((prev) =>
      prev.map((art) => {
        if (art.id === id) {
          return {
            ...art,
            category: art.category === 'favorite' ? 'all' : 'favorite'
          };
        }
        return art;
      })
    );
  };

  const handleAddMoodLog = (type: MoodType, desc: string) => {
    const labels = {
      calm: '平静 Calm',
      anxious: '焦虑 Anxious',
      tired: '疲惫 Tired',
      irritated: '烦躁 Irritated',
      low: '低落 Low'
    };

    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const newLog: MoodLog = {
      id: `log-${Date.now()}`,
      type,
      label: labels[type],
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      description: desc,
      icon: 'waves',
      date: formattedDate
    };

    setMoodLogs((prev) => [newLog, ...prev]);
  };

  // Navigations routing shortcuts
  const handleGoToBreath = () => setActiveTab('breath');
  const handleGoToSound = () => setActiveTab('sound');
  const handleGoToIsland = () => setActiveTab('island');

  return (
    <div className="min-h-screen bg-[#fff8f2] text-[#221b0b] font-sans antialiased overflow-x-hidden selection:bg-[#4f6167]/20 selection:text-[#4f6167] app-container">
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <WelcomeScreen onStart={handleStartApp} />
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col min-h-screen"
          >
            {/* STATIC APP BAR - Screen 2 */}
            <header className="sticky top-0 z-40 bg-[#fff8f2]/80 backdrop-blur-xl border-b border-white/40 px-6 py-4.5 flex justify-between items-center max-w-4xl w-full mx-auto">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-full hover:bg-[#4f6167]/5 text-slate-700 transition-colors active:scale-95">
                  <Menu className="w-5 h-5 stroke-[1.8]" />
                </button>
                <span className="font-sans text-xl font-light tracking-[0.25em] text-[#221b0b] select-none">
                  LUMINA
                </span>
              </div>
              
              {/* Profile headshot trigger icon */}
              <div
                onClick={() => setActiveTab('island')}
                className="w-10 h-10 rounded-full border border-white/60 overflow-hidden shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <img
                  className="w-full h-full object-cover"
                  src={USER_PROFILE.avatarUrl}
                  alt="Alex profile thumbnail"
                  referrerPolicy="no-referrer"
                />
              </div>
            </header>

            {/* PRIMARY VIEW CONTENT */}
            <main className="flex-grow max-w-4xl w-full mx-auto px-6 pt-8 pb-36 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                  transition={{ 
                    duration: 0.55, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="w-full h-full"
                >
                  {activeTab === 'home' && (
                    <DashboardView
                      onStartBreathing={handleGoToBreath}
                      onNavigateToSound={handleGoToSound}
                      onNavigateToIsland={handleGoToIsland}
                      moodLogs={moodLogs}
                      onAddMoodLog={handleAddMoodLog}
                    />
                  )}

                  {activeTab === 'breath' && (
                    <BreathView
                      onAddArtwork={handleAddArtwork}
                      onNavigateToIsland={handleGoToIsland}
                    />
                  )}

                  {activeTab === 'sound' && (
                    <SoundView />
                  )}

                  {activeTab === 'canvas' && (
                    <CanvasView
                      onAddArtwork={handleAddArtwork}
                      onNavigateToIsland={handleGoToIsland}
                    />
                  )}

                  {activeTab === 'island' && (
                    <IslandView
                      artworks={artworks}
                      moodLogs={moodLogs}
                      onToggleFavorite={handleToggleFavorite}
                      isDarkMode={isDarkMode}
                      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* GORGEOUS FLOATING BOTTOM NAVIGATION BAR */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[calc(100%-32px)]">
              <div className="glass-panel rounded-full p-2.5 pb-3 flex items-center justify-around border-white/50 shadow-xl shadow-slate-900/[0.04]">
                {[
                  { id: 'home', label: '首页', icon: Home },
                  { id: 'breath', label: '呼吸', icon: Wind },
                  { id: 'sound', label: '声场', icon: Music },
                  { id: 'canvas', label: '画布', icon: PencilLine },
                  { id: 'island', label: '浮岛', icon: Sun }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabId)}
                      className="relative py-2 px-3 flex flex-col items-center gap-1 transition-all group select-none active:scale-95 duration-200"
                    >
                      {/* Active glowing indicator bubble behind */}
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                          className="absolute inset-0 bg-[#4f6167]/10 rounded-full"
                        />
                      )}
                      
                      <IconComponent
                        className={`w-5 h-5 transition-colors stroke-[1.8] ${
                          isActive
                            ? 'text-[#4f6167]'
                            : 'text-slate-500 hover:text-slate-900 group-hover:scale-105 transition-transform'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-semibold tracking-wider transition-colors uppercase ${
                          isActive ? 'text-[#4f6167]' : 'text-slate-500 font-normal'
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
