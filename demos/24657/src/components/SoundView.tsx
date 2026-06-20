import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, VolumeX, Volume2, CloudRain, Wind, Droplets, Flame, HelpCircle, Heart, Star } from 'lucide-react';
import { SOUND_SCENES } from '../data';
import { SoundScene } from '../types';
import { ambientAudioEngine } from '../utils/audioEngine';

export default function SoundView() {
  const [activeScene, setActiveScene] = useState<SoundScene>(SOUND_SCENES[0]); // Default "海之漂浮" Deep Sea
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [mixVolume, setMixVolume] = useState<number>(65);

  // Active micro mixers toggled states & volume ratios
  const [mixRain, setMixRain] = useState(true);
  const [volRain, setVolRain] = useState<number>(65);

  const [mixWind, setMixWind] = useState(false);
  const [volWind, setVolWind] = useState<number>(40);

  const [mixDroplets, setMixDroplets] = useState(false);
  const [volDroplets, setVolDroplets] = useState<number>(50);

  const [mixFire, setMixFire] = useState(false);
  const [volFire, setVolFire] = useState<number>(30);

  // Synchronize dynamic Web Audio loops with state updates
  useEffect(() => {
    if (isPlaying) {
      ambientAudioEngine.start();
    } else {
      ambientAudioEngine.stop();
    }
  }, [isPlaying]);

  useEffect(() => {
    ambientAudioEngine.setMasterVolume(mixVolume);
  }, [mixVolume]);

  useEffect(() => {
    ambientAudioEngine.transitionToScene(activeScene.id);
  }, [activeScene.id]);

  useEffect(() => {
    ambientAudioEngine.setChannelVolume('rain', volRain, mixRain);
  }, [volRain, mixRain]);

  useEffect(() => {
    ambientAudioEngine.setChannelVolume('wind', volWind, mixWind);
  }, [volWind, mixWind]);

  useEffect(() => {
    ambientAudioEngine.setChannelVolume('droplet', volDroplets, mixDroplets);
  }, [volDroplets, mixDroplets]);

  useEffect(() => {
    ambientAudioEngine.setChannelVolume('fire', volFire, mixFire);
  }, [volFire, mixFire]);

  // Handle automatic setup/unmount cleanup
  useEffect(() => {
    // Attempt play initially from user focus / state
    return () => {
      ambientAudioEngine.stop();
    };
  }, []);

  // Track skipped tracks in loop
  const handleNextTrack = () => {
    const currentIndex = SOUND_SCENES.findIndex((s) => s.id === activeScene.id);
    const nextIndex = (currentIndex + 1) % SOUND_SCENES.length;
    setActiveScene(SOUND_SCENES[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    const currentIndex = SOUND_SCENES.findIndex((s) => s.id === activeScene.id);
    const prevIndex = (currentIndex - 1 + SOUND_SCENES.length) % SOUND_SCENES.length;
    setActiveScene(SOUND_SCENES[prevIndex]);
    setIsPlaying(true);
  };

  const handleToggleScenePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      
      {/* SECTION 1: Active Mix Controller board (光屿声场) */}
      <section className="relative glass-panel rounded-[36px] p-8 overflow-hidden min-h-[360px] flex flex-col justify-between items-center text-center">
        {/* Soft Liquid Background Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] pointer-events-none z-0">
          <div className="absolute w-[80%] h-[80%] bg-violet-400/10 rounded-full blur-[40px] animate-pulse-glow left-[-10%] top-[-10%]" />
          <div className="absolute w-[60%] h-[60%] bg-amber-400/10 rounded-full blur-[50px] animate-pulse-glow right-[-10%] bottom-[-10%]" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 w-full space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#4f6167] bg-white/40 px-3.5 py-1 rounded-full border border-white/40">
            调音混音台
          </span>
          <h2 className="text-2xl font-light text-[#221b0b]">光屿声场 mixer</h2>
        </div>

        {/* Central Core Circle Visualizer */}
        <div className="relative my-8 z-10">
          {/* Main Ring */}
          <div className="w-56 h-56 rounded-full border-2 border-dashed border-[#4f6167]/20 flex items-center justify-center relative shadow-inner">
            
            {/* Spinning decorative ring */}
            {isPlaying && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[4px] border border-[#4f6167]/10 rounded-full border-t-[#4f6167]/40 pointer-events-none"
              />
            )}

            {/* Inner blending core */}
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.05, 1] : [1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-36 h-36 rounded-full bg-white/95 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group border border-white"
            >
              <div className="text-center space-y-1">
                <span className="p-1 px-2.5 rounded-full bg-teal-50 text-[10px] text-teal-800 font-semibold uppercase tracking-wider block w-fit mx-auto scale-90 mb-1">
                  Blending
                </span>
                <p className="text-sm font-semibold text-[#221b0b]">{activeScene.title}</p>
                <p className="text-[10px] text-[#424849]/50 tracking-wide uppercase font-mono">
                  {isPlaying ? '正在合成腔音...' : '已静音'}
                </p>
              </div>

              {/* Float micro ambient droplets markers dynamically */}
              <AnimatePresence>
                {mixRain && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 0.85 + (volRain / 100) * 0.3, 
                      opacity: 0.4 + (volRain / 100) * 0.6,
                      y: isPlaying ? [0, -3, 0] : 0
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-2 left-6 bg-sky-50 dark:bg-sky-950/40 rounded-full p-1.5 border border-white/80 shadow"
                  >
                    <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  </motion.div>
                )}
                {mixWind && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 0.85 + (volWind / 100) * 0.3, 
                      opacity: 0.4 + (volWind / 100) * 0.6,
                      x: isPlaying ? [0, 3, 0] : 0
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-2 right-6 bg-orange-50 dark:bg-orange-950/40 rounded-full p-1.5 border border-white/80 shadow"
                  >
                    <Wind className="w-3.5 h-3.5 text-orange-600" />
                  </motion.div>
                )}
                {mixDroplets && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 0.85 + (volDroplets / 100) * 0.3, 
                      opacity: 0.4 + (volDroplets / 100) * 0.6,
                      y: isPlaying ? [0, 3, 0] : 0
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-2 left-6 bg-teal-50 dark:bg-teal-950/40 rounded-full p-1.5 border border-white/80 shadow"
                  >
                    <Droplets className="w-3.5 h-3.5 text-teal-600" />
                  </motion.div>
                )}
                {mixFire && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 0.85 + (volFire / 100) * 0.3, 
                      opacity: 0.4 + (volFire / 100) * 0.6,
                      x: isPlaying ? [0, -3, 0] : 0
                    }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-2 right-6 bg-rose-50 dark:bg-rose-950/40 rounded-full p-1.5 border border-white/80 shadow"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Sliders mixers row */}
        <div className="relative z-10 w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CH1: Rain */}
          <div className={`glass-panel p-4 rounded-[24px] flex flex-col justify-between transition-all duration-300 ${
            mixRain 
              ? 'bg-white/85 dark:bg-[#1c233d]/70 shadow-[#4f6167]/10 shadow-lg border-[#4f6167]/40 ring-1 ring-[#4f6167]/20' 
              : 'bg-white/10 dark:bg-white/5 border-transparent opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${mixRain ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' : 'bg-slate-100/80 dark:bg-slate-800 text-slate-400'}`}>
                  <CloudRain className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#221b0b] dark:text-slate-100">雨声</p>
                  <p className="text-[9px] text-[#424849]/50 dark:text-slate-400 uppercase tracking-widest font-mono">RAIN</p>
                </div>
              </div>
              
              {/* Toggle switch */}
              <button
                onClick={() => setMixRain(!mixRain)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors relative flex items-center ${mixRain ? 'bg-[#4f6167]' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div
                  className={`w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${mixRain ? 'translate-x-4.5' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {/* Slider track */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono font-semibold">
                <span>VOLUME</span>
                <span>{mixRain ? `${volRain}%` : 'MUTED'}</span>
              </div>
              <div className="relative w-full h-1.5 bg-[#4f6167]/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full rounded-full transition-all duration-100 ${mixRain ? 'bg-sky-500' : 'bg-slate-300'}`}
                  style={{ width: `${mixRain ? volRain : 0}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixRain ? volRain : 0}
                  disabled={!mixRain}
                  onChange={(e) => setVolRain(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* CH2: Wind */}
          <div className={`glass-panel p-4 rounded-[24px] flex flex-col justify-between transition-all duration-300 ${
            mixWind 
              ? 'bg-white/85 dark:bg-[#1c233d]/70 shadow-[#4f6167]/10 shadow-lg border-[#4f6167]/40 ring-1 ring-[#4f6167]/20' 
              : 'bg-white/10 dark:bg-white/5 border-transparent opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${mixWind ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'bg-slate-100/80 dark:bg-slate-800 text-slate-400'}`}>
                  <Wind className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#221b0b] dark:text-slate-100">风息</p>
                  <p className="text-[9px] text-[#424849]/50 dark:text-slate-400 uppercase tracking-widest font-mono">WIND</p>
                </div>
              </div>
              
              {/* Toggle switch */}
              <button
                onClick={() => setMixWind(!mixWind)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors relative flex items-center ${mixWind ? 'bg-[#4f6167]' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div
                  className={`w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${mixWind ? 'translate-x-4.5' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {/* Slider track */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono font-semibold">
                <span>VOLUME</span>
                <span>{mixWind ? `${volWind}%` : 'MUTED'}</span>
              </div>
              <div className="relative w-full h-1.5 bg-[#4f6167]/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full rounded-full transition-all duration-100 ${mixWind ? 'bg-orange-500' : 'bg-slate-300'}`}
                  style={{ width: `${mixWind ? volWind : 0}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixWind ? volWind : 0}
                  disabled={!mixWind}
                  onChange={(e) => setVolWind(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* CH3: Droplets */}
          <div className={`glass-panel p-4 rounded-[24px] flex flex-col justify-between transition-all duration-300 ${
            mixDroplets 
              ? 'bg-white/85 dark:bg-[#1c233d]/70 shadow-[#4f6167]/10 shadow-lg border-[#4f6167]/40 ring-1 ring-[#4f6167]/20' 
              : 'bg-white/10 dark:bg-white/5 border-transparent opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${mixDroplets ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600' : 'bg-slate-100/80 dark:bg-slate-800 text-slate-400'}`}>
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#221b0b] dark:text-slate-100">水滴</p>
                  <p className="text-[9px] text-[#424849]/50 dark:text-slate-400 uppercase tracking-widest font-mono">DROPLETS</p>
                </div>
              </div>
              
              {/* Toggle switch */}
              <button
                onClick={() => setMixDroplets(!mixDroplets)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors relative flex items-center ${mixDroplets ? 'bg-[#4f6167]' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div
                  className={`w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${mixDroplets ? 'translate-x-4.5' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {/* Slider track */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono font-semibold">
                <span>VOLUME</span>
                <span>{mixDroplets ? `${volDroplets}%` : 'MUTED'}</span>
              </div>
              <div className="relative w-full h-1.5 bg-[#4f6167]/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full rounded-full transition-all duration-100 ${mixDroplets ? 'bg-teal-500' : 'bg-slate-300'}`}
                  style={{ width: `${mixDroplets ? volDroplets : 0}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixDroplets ? volDroplets : 0}
                  disabled={!mixDroplets}
                  onChange={(e) => setVolDroplets(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* CH4: Fire */}
          <div className={`glass-panel p-4 rounded-[24px] flex flex-col justify-between transition-all duration-300 ${
            mixFire 
              ? 'bg-white/85 dark:bg-[#1c233d]/70 shadow-[#4f6167]/10 shadow-lg border-[#4f6167]/40 ring-1 ring-[#4f6167]/20' 
              : 'bg-white/10 dark:bg-white/5 border-transparent opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${mixFire ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' : 'bg-slate-100/80 dark:bg-slate-800 text-slate-400'}`}>
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#221b0b] dark:text-slate-100">火鸣</p>
                  <p className="text-[9px] text-[#424849]/50 dark:text-slate-400 uppercase tracking-widest font-mono">FIRE</p>
                </div>
              </div>
              
              {/* Toggle switch */}
              <button
                onClick={() => setMixFire(!mixFire)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors relative flex items-center ${mixFire ? 'bg-[#4f6167]' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div
                  className={`w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${mixFire ? 'translate-x-4.5' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {/* Slider track */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono font-semibold">
                <span>VOLUME</span>
                <span>{mixFire ? `${volFire}%` : 'MUTED'}</span>
              </div>
              <div className="relative w-full h-1.5 bg-[#4f6167]/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full rounded-full transition-all duration-100 ${mixFire ? 'bg-rose-500' : 'bg-slate-300'}`}
                  style={{ width: `${mixFire ? volFire : 0}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixFire ? volFire : 0}
                  disabled={!mixFire}
                  onChange={(e) => setVolFire(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global mixer volume */}
        <div className="relative z-10 w-full max-w-sm flex items-center gap-3 pt-6 border-t border-[#c2c7c9]/30 mt-6">
          <VolumeX className="w-4 h-4 text-slate-400" />
          <div className="relative flex-grow h-1 bg-[#4f6167]/10 rounded-full cursor-pointer">
            <div style={{ width: `${mixVolume}%` }} className="absolute h-full bg-[#4f6167] rounded-full" />
            <input
              type="range"
              min="0"
              max="100"
              value={mixVolume}
              onChange={(e) => setMixVolume(Number(e.target.value))}
              className="w-full absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs font-semibold text-[#4f6167] w-12 text-right">{mixVolume}%</span>
        </div>
      </section>

      {/* SECTION 2: Curator Soundtrack package list (听觉圣殿) */}
      <section className="space-y-6">
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/50">
            精选正念声景
          </span>
          <h3 className="text-xl font-medium tracking-wide text-[#221b0b]">听觉圣殿</h3>
          <p className="text-xs text-[#424849]/70 leading-relaxed font-light">针对特定心理和专注度状态精选的声景，点击激活声频。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main feature Card: Kyoto Zen circles raked gravel */}
          <div
            onClick={() => {
              setActiveScene({
                id: 'kyoto',
                title: '京都回响',
                englishTitle: 'KYOTO ECHOES',
                mix: '松针磐音 + 冥想音波',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAORTTe40wmo9-I5gqxHQ_Y-80Ohuvjvv5HxLIhKa3H0el1VodUj64ui2riZQn5JGor2-hoLyDO19ddzk0S2-i5Vguei9kggJ25EQ9dUxHUY-52UJlOPIUheqxRio7WAPflfTSvjl4UzF2hi85eyMQzAi0K-aOHf-cmNuRkdLzl-Z3OBCHHONHTBdPFKdOFFY1xtKfH_WQlAgy2nTddeNILrLDumc1MuaIY6djUg2Tbf9FgdLe8icn8gtxk14pQtNO9Lx5XYuYyHEqD',
                imageAlt: 'Kyoto Zen Garden dawn basalt stone'
              });
              setIsPlaying(true);
            }}
            className={`cursor-pointer rounded-[28px] overflow-hidden relative min-h-[220px] p-6 flex flex-col justify-end transition-all ${
              activeScene.title === '京都回响'
                ? 'ring-2 ring-[#4f6167] shadow-xl'
                : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
            }`}
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAORTTe40wmo9-I5gqxHQ_Y-80Ohuvjvv5HxLIhKa3H0el1VodUj64ui2riZQn5JGor2-hoLyDO19ddzk0S2-i5Vguei9kggJ25EQ9dUxHUY-52UJlOPIUheqxRio7WAPflfTSvjl4UzF2hi85eyMQzAi0K-aOHf-cmNuRkdLzl-Z3OBCHHONHTBdPFKdOFFY1xtKfH_WQlAgy2nTddeNILrLDumc1MuaIY6djUg2Tbf9FgdLe8icn8gtxk14pQtNO9Lx5XYuYyHEqD"
              alt="Kyoto zen garden"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
            <div className="relative z-10 text-left">
              <span className="text-[10px] font-bold tracking-widest text-[#424849]/70 block mb-1">DEPTH WORK · 深度工作</span>
              <h4 className="text-xl font-bold text-[#4f6167]">京都回响</h4>
              <p className="text-xs text-[#221b0b]/80 mt-1">禅堂微风 · 激发无尽的心智心电专注</p>
            </div>
          </div>

          {/* Sub entries */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ether Sleep */}
            <div
              onClick={() => {
                setActiveScene({
                  id: 'ether-sleep',
                  title: '以太之眠',
                  englishTitle: 'ETHER SLEEP',
                  mix: '柔和环境潮汐 + 528Hz 黄金催眠',
                  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3OdN2GqAbQReC8GnfryVnF00M_4wsFsXVKNeL45co124Jh55fDBPHvpyrBwLDrssbN89lxRuQqajxCWNZ6cFGeJ96wVfo7z5maMveL0wz4NH5eWn30s85uwafs7vMOvEBVMJJ8SF5N675lJx9YnkCuKw3E2wJcQG4K8w5vhgfmubNwdMCzSU3A8b6FMRCNsHE8ZO5OEWydxRpaq3smoTo-E2nbr0lTjjFsEUw261gvRaRoy0SOH9sv7QXiPCcPP8YEJ46oxCS1Su0',
                  imageAlt: 'peaceful sunset ocean'
                });
                setIsPlaying(true);
              }}
              className={`cursor-pointer rounded-2xl overflow-hidden relative p-4 flex flex-col justify-end min-h-[102px] text-left transition-all ${
                activeScene.title === '以太之眠'
                  ? 'ring-2 ring-[#4f6167] bg-white'
                  : 'glass-panel opacity-90 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-25"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3OdN2GqAbQReC8GnfryVnF00M_4wsFsXVKNeL45co124Jh55fDBPHvpyrBwLDrssbN89lxRuQqajxCWNZ6cFGeJ96wVfo7z5maMveL0wz4NH5eWn30s85uwafs7vMOvEBVMJJ8SF5N675lJx9YnkCuKw3E2wJcQG4K8w5vhgfmubNwdMCzSU3A8b6FMRCNsHE8ZO5OEWydxRpaq3smoTo-E2nbr0lTjjFsEUw261gvRaRoy0SOH9sv7QXiPCcPP8YEJ46oxCS1Su0"
                alt="calm orange peach sunset"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10">
                <h5 className="text-sm font-semibold text-[#221b0b]">以太之眠</h5>
                <p className="text-[10px] text-slate-500 mt-1">40 分钟 · 528Hz 催眠韵波</p>
              </div>
            </div>

            {/* Velvet Dusk */}
            <div
              onClick={() => {
                setActiveScene({
                  id: 'velvet-dusk',
                  title: '天鹅绒黄昏',
                  englishTitle: 'VELVET DUSK',
                  mix: '柔和乐带 lo-fi 唱片伴唱',
                  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8l6McPcZKNLCnzTuSrR1nDjJXUY-wFiIvTMuG3czNoSQ-smNbiQLjZ9_kWfLootzP3FThgHpZlOi_wNFlnyFkCosg-Mg5mtYarpTW66KFX40XN96cnGixROs_edF87XXMDqZU6_QMJIQg0XqhLh4QvLD4oSbIwqVk-KKMV4J54YW4YRXqyd2aDhgM1tf7Ox6SgzwHicCGlPz43jQr9am-e9CjOVFBSNSNil5VgOvUQIkg2JNDtT1_gtcJgLB4ve9JVLrPBsKha2Ol',
                  imageAlt: 'fluid soft materials warm clay'
                });
                setIsPlaying(true);
              }}
              className={`cursor-pointer rounded-2xl overflow-hidden relative p-4 flex flex-col justify-end min-h-[102px] text-left transition-all ${
                activeScene.title === '天鹅绒黄昏'
                  ? 'ring-2 ring-[#4f6167] bg-white shadow-md'
                  : 'glass-panel opacity-90 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-25"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8l6McPcZKNLCnzTuSrR1nDjJXUY-wFiIvTMuG3czNoSQ-smNbiQLjZ9_kWfLootzP3FThgHpZlOi_wNFlnyFkCosg-Mg5mtYarpTW66KFX40XN96cnGixROs_edF87XXMDqZU6_QMJIQg0XqhLh4QvLD4oSbIwqVk-KKMV4J54YW4YRXqyd2aDhgM1tf7Ox6SgzwHicCGlPz43jQr9am-e9CjOVFBSNSNil5VgOvUQIkg2JNDtT1_gtcJgLB4ve9JVLrPBsKha2Ol"
                alt="fluid peach fabrics"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10">
                <h5 className="text-sm font-semibold text-[#221b0b]">天鹅绒黄昏</h5>
                <p className="text-[10px] text-slate-500 mt-1">25 分钟 · LO-FI 正念放松</p>
              </div>
            </div>

            {/* Morning Dew */}
            <div
              onClick={() => {
                setActiveScene({
                  id: 'morning-dew',
                  title: '朝晖晨雾',
                  englishTitle: 'MORNING DEW',
                  mix: '柔和鸟鸣水花 + 轻盈竖琴律音',
                  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS0yzbmy6us6TDp2RFgsGecKmUbMmmXVK1PRr0o-WTtABCtY02S5B2kS9mE0A1BlMBc807TW0rWlxBPpXtT6RLSYcto4XC0GzzEAKk3ywqrIFD3oPSD9TzYoF9_X7NeiHqdZU8ST9iWxMMJ2I3XuHxf4YJB4xddF5yKafCSBI1zsmJXKPli-n9N0PosDNeikSefMnNDN_WNFtzeVMPNRAZPc4B98gsqSt7gwkjqxSd05l7zKvKQwS7ABEHZAsG1pJd69blsH50h4jw',
                  imageAlt: 'morning dew crystal water droplet'
                });
                setIsPlaying(true);
              }}
              className={`cursor-pointer rounded-2xl overflow-hidden relative p-4 flex flex-col justify-end min-h-[102px] text-left transition-all ${
                activeScene.title === '朝晖晨雾'
                  ? 'ring-2 ring-[#4f6167] bg-white shadow-md'
                  : 'glass-panel opacity-90 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-25"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS0yzbmy6us6TDp2RFgsGecKmUbMmmXVK1PRr0o-WTtABCtY02S5B2kS9mE0A1BlMBc807TW0rWlxBPpXtT6RLSYcto4XC0GzzEAKk3ywqrIFD3oPSD9TzYoF9_X7NeiHqdZU8ST9iWxMMJ2I3XuHxf4YJB4xddF5yKafCSBI1zsmJXKPli-n9N0PosDNeikSefMnNDN_WNFtzeVMPNRAZPc4B98gsqSt7gwkjqxSd05l7zKvKQwS7ABEHZAsG1pJd69blsH50h4jw"
                alt="crystal morning water droplet"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10">
                <h5 className="text-sm font-semibold text-[#221b0b]">朝晖晨雾</h5>
                <p className="text-[10px] text-slate-500 mt-1">11 首 · 自主神经唤醒</p>
              </div>
            </div>

            {/* Custom Scene list */}
            {SOUND_SCENES.map((scene) => {
              if (scene.id === 'ocean' || scene.id === 'rain') return null; // Avoid duplicate listings
              return (
                <div
                  key={scene.id}
                  onClick={() => {
                    setActiveScene(scene);
                    setIsPlaying(true);
                  }}
                  className={`cursor-pointer rounded-2xl overflow-hidden relative p-4 flex flex-col justify-end min-h-[102px] text-left transition-all ${
                    activeScene.id === scene.id
                      ? 'ring-2 ring-[#4f6167] bg-white shadow-md'
                      : 'glass-panel opacity-90 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                    src={scene.imageUrl}
                    alt={scene.imageAlt}
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative z-10">
                    <h5 className="text-sm font-semibold text-[#221b0b]">{scene.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-1">{scene.mix || '正念疗愈调性'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Persistent Audio player sticky widget at the bottom */}
      <div className="fixed bottom-24 left-4 right-4 md:left-[30px] md:right-[30px] z-45 max-w-4xl mx-auto shadow-2xl">
        <div className="glass-panel rounded-full p-2 pl-6 pr-4 flex items-center justify-between border-white/60">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Tiny rotating rotating cover */}
            <div className={`w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border bg-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '20s' }}>
              <img
                className="w-full h-full object-cover"
                src={activeScene.imageUrl}
                alt="album rotation"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-[#221b0b] truncate">{activeScene.title}</p>
              <p className="text-[10px] text-[#424849]/70 uppercase tracking-widest truncate font-medium">
                {activeScene.mix || '海浪与深度环境钢琴'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handlePrevTrack}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 transition-all text-slate-600"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={handleToggleScenePlay}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-[#4f6167] text-white hover:bg-[#35474c] active:scale-90 transition-all shadow-md"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>
            <button
              onClick={handleNextTrack}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 transition-all text-slate-600"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
