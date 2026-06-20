import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronRight, CheckCircle, VolumeX, Volume2, Share2, Compass, RefreshCw, AlertCircle, Sparkles, Sliders, Wind, CloudRain, Droplets, Flame, Music, X } from 'lucide-react';
import { BREATHING_PATTERNS, MOOD_STYLE_MAP } from '../data';
import { BreathingPattern, MoodType, SavedArtwork } from '../types';
import { ambientAudioEngine } from '../utils/audioEngine';

interface BreathViewProps {
  onAddArtwork: (art: SavedArtwork) => void;
  onNavigateToIsland: () => void;
}

type StepType = 'mood' | 'color' | 'pattern' | 'active' | 'completed';

export default function BreathView({ onAddArtwork, onNavigateToIsland }: BreathViewProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('mood');
  const [selectedMood, setSelectedMood] = useState<MoodType>('calm');
  const [selectedColor, setSelectedColor] = useState<string>('#B8A398');
  const [rhythmPattern, setRhythmPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[1]); // Class 4-7-8 default
  const [ambientSound, setAmbientSound] = useState<'none' | 'waves' | 'rainy' | 'wind'>('waves');
  const [volume, setVolume] = useState<number>(50);

  // Real-time Sound Companion Volumes inside active page
  const [showMixerPanel, setShowMixerPanel] = useState<boolean>(false);
  const [breathSceneVol, setBreathSceneVol] = useState<number>(50);
  const [breathRainVol, setBreathRainVol] = useState<number>(30);
  const [breathWindVol, setBreathWindVol] = useState<number>(20);
  const [breathDropletsVol, setBreathDropletsVol] = useState<number>(15);
  const [breathFireVol, setBreathFireVol] = useState<number>(10);

  // Active breath state trackers
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [isBreathPaused, setIsBreathPaused] = useState<boolean>(false);
  const [totalCycleCompleted, setTotalCycleCompleted] = useState<number>(0);
  const [customArtworkId, setCustomArtworkId] = useState<string>('');

  // Microphone Biosensing & Audio Connections
  const [isMicConnected, setIsMicConnected] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const stopListeningToMic = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    micAnalyserRef.current = null;
    setIsMicConnected(false);
    setMicLevel(0);
  };

  const toggleMic = async () => {
    if (isMicConnected) {
      stopListeningToMic();
    } else {
      try {
        setMicError('');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        micStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        micAnalyserRef.current = analyser;

        setIsMicConnected(true);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
          if (!micAnalyserRef.current) return;
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          const normalized = Math.min(1, average / 110);

          setMicLevel(normalized);
          animationFrameIdRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err: any) {
        console.error('Error accessing microphone:', err);
        setMicError('无法访问麦克风。请确保在权限提示中允许麦克风访问，并连接手机或耳机感应器。');
      }
    }
  };

  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Recommended colors mapping
  const morandiColors = [
    { name: 'Warm Clay', hex: '#b8a398' },
    { name: 'Sage Green', hex: '#c0c9b7' },
    { name: 'Dusty Rose', hex: '#d9c2b6' },
    { name: 'Misty Blue', hex: '#bbc8d1' },
    { name: 'Soft Cream', hex: '#e5e2dc' },
    { name: 'Teal Blue', hex: '#9ca9b1' }
  ];

  // Map slider value (0-100) to colors
  const handleSliderColor = (val: number) => {
    const index = Math.min(Math.floor((val / 100) * morandiColors.length), morandiColors.length - 1);
    setSelectedColor(morandiColors[index].hex);
  };

  // Sound scenes triggers helper
  const soundIcons = {
    none: 'VolumeX',
    waves: 'waves',
    rainy: 'cloud-rain',
    wind: 'wind'
  };

  // Run Breathing Cycle logic
  useEffect(() => {
    if (currentStep !== 'active' || isBreathPaused) {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }

    setPhaseSecondsLeft(rhythmPattern.inhale);
    setBreathPhase('inhale');

    breathTimerRef.current = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch phase
          let nextPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
          let nextSeconds = rhythmPattern.inhale;

          setBreathPhase((currPhase) => {
            if (currPhase === 'inhale') {
              if (rhythmPattern.hold > 0) {
                nextPhase = 'hold';
                nextSeconds = rhythmPattern.hold;
              } else {
                nextPhase = 'exhale';
                nextSeconds = rhythmPattern.exhale;
              }
            } else if (currPhase === 'hold') {
              nextPhase = 'exhale';
              nextSeconds = rhythmPattern.exhale;
            } else {
              nextPhase = 'inhale';
              nextSeconds = rhythmPattern.inhale;
              setTotalCycleCompleted((c) => c + 1);
            }
            return nextPhase;
          });

          return nextSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [currentStep, isBreathPaused, rhythmPattern]);

  // Synchronize immersive breathing soundscape with dynamic Web Audio
  useEffect(() => {
    if (currentStep !== 'active') {
      if (['completed', 'mood', 'color', 'pattern'].includes(currentStep)) {
        ambientAudioEngine.stop();
      }
      return;
    }

    if (isBreathPaused) {
      ambientAudioEngine.stop();
    } else {
      ambientAudioEngine.start();
      
      // Determine base scene based on chosen preset sound
      let targetSceneId = 'ether-sleep'; // default for nice relaxation
      if (ambientSound === 'waves') targetSceneId = 'ocean';
      else if (ambientSound === 'rainy') targetSceneId = 'rain';
      else if (ambientSound === 'wind') targetSceneId = 'moonlight';

      ambientAudioEngine.transitionToScene(targetSceneId);

      // Apply master / channel configurations
      ambientAudioEngine.setMasterVolume(volume);

      // Active states mapping
      ambientAudioEngine.setChannelVolume('scene', breathSceneVol, ambientSound !== 'none');
      ambientAudioEngine.setChannelVolume('rain', breathRainVol, ambientSound === 'rainy' || breathRainVol > 0);
      ambientAudioEngine.setChannelVolume('wind', breathWindVol, ambientSound === 'wind' || breathWindVol > 0);
      ambientAudioEngine.setChannelVolume('droplet', breathDropletsVol, breathDropletsVol > 0);
      ambientAudioEngine.setChannelVolume('fire', breathFireVol, breathFireVol > 0);
    }
  }, [currentStep, isBreathPaused, ambientSound]);

  useEffect(() => {
    if (currentStep === 'active' && !isBreathPaused) {
      ambientAudioEngine.setMasterVolume(volume);
    }
  }, [volume, currentStep, isBreathPaused]);

  useEffect(() => {
    if (currentStep === 'active' && !isBreathPaused) {
      ambientAudioEngine.setChannelVolume('scene', breathSceneVol, ambientSound !== 'none');
    }
  }, [breathSceneVol, ambientSound, currentStep, isBreathPaused]);

  useEffect(() => {
    if (currentStep === 'active' && !isBreathPaused) {
      ambientAudioEngine.setChannelVolume('rain', breathRainVol, breathRainVol > 0);
    }
  }, [breathRainVol, currentStep, isBreathPaused]);

  useEffect(() => {
    if (currentStep === 'active' && !isBreathPaused) {
      ambientAudioEngine.setChannelVolume('wind', breathWindVol, breathWindVol > 0);
    }
  }, [breathWindVol, currentStep, isBreathPaused]);

  useEffect(() => {
    if (currentStep === 'active' && !isBreathPaused) {
      ambientAudioEngine.setChannelVolume('droplet', breathDropletsVol, breathDropletsVol > 0);
    }
  }, [breathDropletsVol, currentStep, isBreathPaused]);

  useEffect(() => {
    if (currentStep === 'active' && !isBreathPaused) {
      ambientAudioEngine.setChannelVolume('fire', breathFireVol, breathFireVol > 0);
    }
  }, [breathFireVol, currentStep, isBreathPaused]);

  useEffect(() => {
    if (currentStep !== 'active') {
      stopListeningToMic();
    }
  }, [currentStep]);

  useEffect(() => {
    return () => {
      ambientAudioEngine.stop();
      stopListeningToMic();
    };
  }, []);

  // Generative paint algorithm on finish
  const handleCompletePractice = () => {
    if (breathTimerRef.current) clearInterval(breathTimerRef.current);

    // List of gorgeous high-end generative paintings reflecting selected colors
    const artworkPools = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6zRYGIw1RCW7xcYA6Vn_i0kvXl01fWOSFV9MOMDenrJ09vKzuZJQlRow8CLsxupofV_Rb_3JkOQbEnq-PGNBd0KLGl6CIVpDVrXlh_IwnDfeWeirDmORDbNxahN8EWiGVHHtdNxzQiwLc4L9tT7NPf-1IUkCzA8Ys-WroulgMJcItzx0-YbgHtx9egvz04VLzIZQ2XbtSiwIG9ot24NTKMIjV6uLDaxvibqXI5Gkm-sEfFzJAMRui-QfrewV6xTcdp1YIsx4QBTW3',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvFv-GJwk0S6yW2het-vq_oLO08DHK3EOXE-eSS2per1ZYVaWpNvBOToJea3QN3_2DcwMmMhfAu5UTDXEV2QfL-4B-5aC-qaK7jB5OBxGh_93u-cUalQqpKZ9y5nrgnQiZC_Pluksv6biVVjo7R4nRXobBEIot4lZQtnOulNvJ1vN2lBNH-SyvoX_2mm2laJUHOzuN_s4aKPw_Vbl4D0OFroz5PQNDdjGxrzU5djNaNgQfEtQVjz7Uv8WR3aiYEd229bnXcxgqGNu7',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBo0X3LS9Xe2F1EFvF8a7pHq7DZSXKgAW58Icsmt84h7HFy2ZyAG8tA1elCtrcDNpK9BNgUhR8NM6rpMswxmPtqM8juOn01Z6LPxgdeBpgh0T_RKWFDJHdUSXPqGsTtOuSOFM7mprlox1OZgpdskd91TERpB9HRLN83REe461XEzvPQX2fo5aFhkz2hxfEuz577fa3aapingm5RBVyRmTLC0dAO1APUgG6r1mp8DM3UvjTddmlKQPKEr6af9KU6lrl0jOGbwRgW22M_'
    ];

    const randomArtUrl = artworkPools[Math.floor(Math.random() * artworkPools.length)];
    const dateFormatted = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.');

    const newArtwork: SavedArtwork = {
      id: `generated-${Date.now()}`,
      title: `${MOOD_STYLE_MAP[selectedMood].chinese}生画 - ${rhythmPattern.name} 律动`,
      imageUrl: randomArtUrl,
      imageAlt: 'Procedural breathing art',
      date: dateFormatted,
      category: 'recent'
    };

    onAddArtwork(newArtwork);
    setCustomArtworkId(newArtwork.id);
    setCurrentStep('completed');
  };

  // Copy share feedback
  const [copiedNotification, setCopiedNotification] = useState(false);
  const handleShare = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-between">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: Choose mood / 选择此刻的你 */}
        {currentStep === 'mood' && (
          <motion.div
            key="mood-step"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow flex flex-col justify-between items-center text-center space-y-8"
          >
            <div className="space-y-2 mt-4">
              <h2 className="text-3xl font-light tracking-wide text-[#221b0b]">选择此刻的你</h2>
              <p className="text-sm text-[#424849]/70 font-light">选择一个更贴近你当前心理状态的底色</p>
            </div>

            {/* Glowing Mood Sphere */}
            <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 my-4">
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  backgroundColor: MOOD_STYLE_MAP[selectedMood].orbColor,
                  boxShadow: `0 0 60px 15px ${MOOD_STYLE_MAP[selectedMood].glowColor}`
                }}
                className="w-48 h-48 md:w-60 md:h-60 rounded-full border border-white/40 flex items-center justify-center glow-sphere relative overflow-hidden"
              >
                <div
                  style={{ background: MOOD_STYLE_MAP[selectedMood].bgGradient }}
                  className="absolute inset-0 opacity-50"
                />
                
                {/* Micro floating stars */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-1.5 h-1.5 bg-white rounded-full blur-[1px] absolute top-10 left-16 animate-pulse" />
                  <div className="w-2.5 h-2.5 bg-white rounded-full blur-[2px] absolute bottom-12 right-20 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative z-10 text-center space-y-1">
                  <span className="text-3xl">
                    {selectedMood === 'calm' ? '😊' : selectedMood === 'anxious' ? '⚡' : selectedMood === 'tired' ? '💤' : selectedMood === 'irritated' ? '💢' : '💧'}
                  </span>
                  <p className="text-sm font-semibold tracking-widest text-[#221b0b]">
                    {MOOD_STYLE_MAP[selectedMood].chinese}
                  </p>
                  <p className="text-[10px] uppercase text-[#424849]/60 tracking-wider">
                    {MOOD_STYLE_MAP[selectedMood].label}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Description card */}
            <p className="max-w-xs text-xs text-balance text-[#424849]/80 font-light italic leading-relaxed">
              &ldquo;{MOOD_STYLE_MAP[selectedMood].description}&rdquo;
            </p>

            {/* Mood selector list */}
            <div className="w-full overflow-x-auto no-scrollbar py-3">
              <div className="flex justify-center gap-3 px-6 min-w-max">
                {(Object.keys(MOOD_STYLE_MAP) as MoodType[]).map((type) => {
                  const m = MOOD_STYLE_MAP[type];
                  const isActive = selectedMood === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedMood(type)}
                      className={`flex flex-col items-center gap-2 p-4 min-w-[80px] rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-white shadow-md border-b-2 border-[#4f6167] scale-105'
                          : 'bg-white/40 border border-transparent'
                      }`}
                    >
                      <span className="text-2xl">
                        {type === 'calm' ? '😊' : type === 'anxious' ? '⚡' : type === 'tired' ? '💤' : type === 'irritated' ? '💢' : '💧'}
                      </span>
                      <span className="text-xs font-semibold text-[#221b0b]">{m.chinese}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={() => setCurrentStep('color')}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#4f6167] to-[#a2b5bb] text-white font-medium shadow-md shadow-[#4f6167]/15 active:scale-95 duration-200 transition-transform"
            >
              确认
            </button>
          </motion.div>
        )}

        {/* STEP 2: Color Wheel Selector / 选择画布色彩 */}
        {currentStep === 'color' && (
          <motion.div
            key="color-step"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow flex flex-col justify-between items-center text-center space-y-8"
          >
            <div className="space-y-2 mt-4">
              <h2 className="text-3xl font-light tracking-wide text-[#221b0b]">选择画布色彩</h2>
              <p className="text-sm text-[#424849]/70 font-light">你的指尖抉择，将化作呼吸中凝聚成的色彩底料</p>
            </div>

            {/* Simulated Color Wheel */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 my-4 flex items-center justify-center">
              {/* Outer Glow dynamic background */}
              <div
                style={{
                  background: `radial-gradient(circle, ${selectedColor} 0%, transparent 70%)`
                }}
                className="absolute inset-[-30px] opacity-25 pointer-events-none transition-all duration-500"
              />

              {/* Conic Gradient Circle */}
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-conic-glow p-1 hover:scale-101 transition-transform duration-300 shadow-xl relative">
                <div
                  className="w-full h-full rounded-full saturate-[0.7] brightness-[1.05]"
                  style={{
                    background: 'conic-gradient(from 0deg, #b8a398, #c0c9b7, #bbc8d1, #dde6d2, #fed4c8, #b8a398)'
                  }}
                />
                
                {/* High contrast inner filter blur */}
                <div className="absolute inset-[20%] bg-[#fff8f2] rounded-full filter blur-[20px] opacity-80" />

                {/* Moving Marker Handle */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ borderColor: selectedColor }}
                  className="absolute w-8 h-8 rounded-full bg-white shadow-lg border-2 flex items-center justify-center top-[70%] left-[81%] cursor-pointer z-20"
                >
                  <div style={{ backgroundColor: selectedColor }} className="w-4 h-4 rounded-full" />
                </motion.div>
              </div>
            </div>

            {/* SWATCH ROW */}
            <div className="w-full space-y-2.5">
              <p className="text-left text-xs font-semibold text-[#424849]/50 px-2 tracking-wider">推荐经典莫兰迪雅色 (Morandi Swatch)</p>
              <div className="flex justify-between gap-2.5">
                {morandiColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className={`w-11 h-11 rounded-full border-2 transition-transform duration-300 hover:scale-110 active:scale-95 shadow-sm ${
                      selectedColor.toLowerCase() === color.hex.toLowerCase()
                        ? 'border-[#221b0b] scale-110 ring-2 ring-white/60'
                        : 'border-white'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Customized Hue slider */}
            <div className="w-full glass-panel rounded-2xl p-5 border border-white/40">
              <div className="flex justify-between items-center mb-2.5 text-xs text-[#424849]/80 font-medium">
                <span>自定义色彩微调 slider</span>
                <span className="font-mono tracking-widest uppercase font-semibold text-[#4f6167]">
                  {selectedColor}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="45"
                onChange={(e) => handleSliderColor(Number(e.target.value))}
                className="w-full h-1 bg-[#4f6167]/10 rounded-full appearance-none cursor-pointer accent-[#4f6167]"
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setCurrentStep('mood')}
                className="flex-1 py-4 border border-[#c2c7c9] hover:bg-slate-100/30 text-slate-700 font-medium rounded-full transition-colors active:scale-95"
              >
                上一步
              </button>
              <button
                onClick={() => setCurrentStep('pattern')}
                className="flex-1 py-4 rounded-full bg-[#4f6167] text-white font-medium hover:bg-[#35474c] active:scale-95 duration-200 transition-transform"
              >
                下一步
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Breathing Pattern and Ambient settings / 呼吸设置 */}
        {currentStep === 'pattern' && (
          <motion.div
            key="pattern-step"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow flex flex-col justify-between items-center space-y-8 text-left"
          >
            <div className="space-y-2 mt-4 text-center w-full">
              <h2 className="text-3xl font-light tracking-wide text-[#221b0b]">呼吸设置</h2>
              <p className="text-sm text-[#424849]/70 font-light">调整您的呼吸节奏与伴随声息</p>
            </div>

            {/* Pattern preset selector */}
            <div className="w-full space-y-3">
              <p className="text-xs font-semibold text-[#424849]/50 tracking-wider pl-1 uppercase">
                选择呼吸节奏律动
              </p>
              
              <div className="space-y-3">
                {BREATHING_PATTERNS.map((pattern) => {
                  const isPatternActive = rhythmPattern.id === pattern.id;
                  return (
                    <div
                      key={pattern.id}
                      onClick={() => setRhythmPattern(pattern)}
                      className={`glass-panel rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                        isPatternActive
                          ? 'ring-2 ring-[#4f6167]/30 border-l-4 border-l-[#4f6167] bg-white/70'
                          : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <p className={`text-lg font-semibold ${isPatternActive ? 'text-[#4f6167]' : 'text-slate-800'}`}>
                          {pattern.name}
                        </p>
                        <p className="text-xs text-slate-500/80 mt-1">{pattern.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isPatternActive ? 'border-[#4f6167]' : 'border-slate-300'
                      }`}>
                        {isPatternActive && <div className="w-2.5 h-2.5 bg-[#4f6167] rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ambient Toggle selector */}
            <div className="w-full space-y-3">
              <p className="text-xs font-semibold text-[#424849]/50 tracking-wider pl-1 uppercase">
                环境伴随声息
              </p>
              
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'none', label: '无声', icon: '🔇' },
                  { id: 'waves', label: '海浪', icon: '🌊' },
                  { id: 'rainy', label: '雨声', icon: '🌧️' },
                  { id: 'wind', label: '风息', icon: '🌬️' }
                ].map((sound) => {
                  const isSoundActive = ambientSound === sound.id;
                  return (
                    <button
                      key={sound.id}
                      onClick={() => setAmbientSound(sound.id as any)}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl glass-panel text-center transition-all ${
                        isSoundActive
                          ? 'bg-[#4f6167]/15 ring-1 ring-[#4f6167]/20 text-[#4f6167] font-semibold scale-102 shadow-sm'
                          : 'opacity-70 hover:opacity-100 text-slate-600'
                      }`}
                    >
                      <span className="text-xl">{sound.icon}</span>
                      <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{sound.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Soundtrack Vol slider */}
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center px-1 text-xs text-[#424849]/60 font-semibold uppercase tracking-wider">
                <span>白噪环境音量</span>
                <span className="text-[#4f6167] font-bold">{volume}%</span>
              </div>
              <div className="glass-panel rounded-2xl p-5 flex items-center justify-between gap-4">
                <VolumeX className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-1 bg-[#4f6167]/10 rounded-full appearance-none cursor-pointer accent-[#4f6167]"
                />
                <Volume2 className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Back & Next Navigation triggers */}
            <div className="flex gap-4 w-full pt-4">
              <button
                onClick={() => setCurrentStep('color')}
                className="flex-1 py-4 border border-[#c2c7c9] hover:bg-slate-100/30 text-slate-700 font-medium rounded-full transition-colors active:scale-95"
              >
                上一步
              </button>
              <button
                onClick={() => {
                  setTotalCycleCompleted(0);
                  setIsBreathPaused(false);
                  setCurrentStep('active');
                }}
                className="flex-1 py-4 rounded-full bg-[#4f6167] text-white font-medium hover:bg-[#35474c] active:scale-95 duration-200 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#4f6167]/10"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>开始练习</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Immersive Breathing session / Active flow */}
        {currentStep === 'active' && (
          <motion.div
            key="active-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#161a29] text-white flex flex-col justify-between items-center p-6 md:p-12 select-none overflow-hidden"
          >
            {/* Ambient Background Nebulas & Gradients */}
            <div className="absolute inset-0 z-0 bg-radial-cosmic">
              <div className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] filter blur-[80px] animate-nebula bg-nebula-clouds opacity-40 pointer-events-none" />
              {/* Layer texture overlay */}
              <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuABMY0R74WrBAqfZH3lBBWCFHg296zQovhNEnm_3FkMEJJQ69VBqqFiEDGZa2VEm0ng8bL9tTjme2O4Y_XvTaBQgJ_U1zZWzeFB8bQKKHNZyFaVTTudgiNNIO68ptEpS81EvSyH_VwAlfDpzQcIvc7DzgJkUYRop4wf0ue7NuyrWsYGv7zT7aXqJTV3CV0Q1CYIZ5z3gpho5H6DIrPAwMW_AUTqLGihGtgLl7uAIEzQvgu7ux5mvjWaYesFesKx_Idmi3YPo1jYIGuO"
                  alt="grain overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Glowing active colors orbs reflecting chosen configurations */}
            <div
              style={{
                background: `radial-gradient(circle, ${selectedColor}30 0%, transparent 60%)`,
                transform: 'translate(-50%, -50%)',
                animationDuration: '10s'
              }}
              className="absolute left-1/2 top-1/2 w-[550px] h-[550px] animate-pulse-glow z-1 pointer-events-none"
            />

            {/* Sub navigation header */}
            <header className="relative z-10 w-full flex justify-between items-center max-w-xl">
              <button
                onClick={() => {
                  if (breathTimerRef.current) clearInterval(breathTimerRef.current);
                  setCurrentStep('pattern');
                }}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 active:scale-95 transition-all text-white hover:bg-white/25"
              >
                &larr;
              </button>
              <div className="text-center">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50 block">CONSCIOUS BREATHING</span>
                <p className="text-sm font-semibold tracking-wide text-white/90">正在进行正念创作...</p>
              </div>
              <button
                onClick={() => setShowMixerPanel(!showMixerPanel)}
                className={`w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md border active:scale-95 transition-all ${
                  showMixerPanel 
                    ? 'bg-emerald-500/35 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-white/10 border-white/20 text-indigo-200 hover:bg-white/25'
                }`}
                title="调整伴随音量配比"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </header>

            {/* CENTER ROTATING CORE */}
            <section className="relative z-10 flex-grow flex flex-col justify-center items-center">
              {/* Outer wave halo ring */}
              <div
                className={`relative rounded-full border border-white/15 flex items-center justify-center shadow-lg select-none duration-[4000ms] ${
                  isBreathPaused
                    ? 'scale-100 opacity-60'
                    : breathPhase === 'inhale'
                    ? 'scale-125 bg-white/5 md:bg-white/[0.08] shadow-[0_0_50px_rgba(255,255,255,0.15)] ring-4 ring-white/10'
                    : breathPhase === 'hold'
                    ? 'scale-120 bg-emerald-500/5 md:bg-emerald-500/[0.07] ring-4 ring-emerald-500/10'
                    : 'scale-95 bg-transparent'
                }`}
                style={{
                  width: '260px',
                  height: '260px',
                  transform: isMicConnected ? `scale(${1 + micLevel * 0.28})` : undefined,
                  transition: isMicConnected ? 'transform 0.08s ease-out' : `transform ${
                    breathPhase === 'inhale'
                      ? rhythmPattern.inhale
                      : breathPhase === 'hold'
                      ? rhythmPattern.hold
                      : rhythmPattern.exhale
                  }s cubic-bezier(0.4, 0, 0.2, 1)`,
                }}
              >
                {/* Secondary expanding circular frame wave */}
                {!isBreathPaused && (
                  <div className="absolute inset-[-12px] border border-white/30 rounded-full animate-ping duration-1000 opacity-20 pointer-events-none" />
                )}

                {/* Main text prompt overlay */}
                <div className="text-center space-y-2">
                  <motion.p
                    key={breathPhase}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-white text-3xl font-light tracking-[0.25em] whitespace-nowrap"
                  >
                    {breathPhase === 'inhale' ? '吸气 Inhale' : breathPhase === 'hold' ? '保持 Hold' : '呼气 Exhale'}
                  </motion.p>
                  
                  <span className="text-xs tracking-[0.1em] text-white/50 block font-mono font-bold">
                    已累计 {totalCycleCompleted} 轮循环
                  </span>
                  
                  <div className="text-[10px] uppercase font-semibold text-teal-400 pt-2 opacity-80 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-violet-300 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>{isMicConnected ? '语音/微息实时共鸣中...' : '生理光影转化中...'}</span>
                  </div>
                </div>
              </div>

              {/* Pulsing wave bars simulation */}
              <div className="mt-16 w-full max-w-xs flex flex-col items-center">
                <div className="flex items-end justify-center gap-1.5 h-10 w-full px-8 pointer-events-none">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-white/35"
                      animate={{
                        height: isBreathPaused
                          ? [6, 6]
                          : breathPhase === 'inhale'
                          ? [6, 24 + Math.random() * 12 + (isMicConnected ? micLevel * 24 : 0), 6]
                          : breathPhase === 'hold'
                          ? [14 + (isMicConnected ? micLevel * 16 : 0), 16 + (isMicConnected ? micLevel * 16 : 0), 14 + (isMicConnected ? micLevel * 16 : 0)]
                          : [6, 16 + Math.random() * 8 + (isMicConnected ? micLevel * 20 : 0), 6],
                      }}
                      transition={{
                        duration: 1.2 + Math.random() * 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.04,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm font-light tracking-wider text-center text-white/50 mt-6 max-w-[200px] leading-relaxed">
                  闭上双眼，调匀深息，让心中浊气流出。
                </p>
              </div>
            </section>

            {/* REAL-TIME VOLUME MIXER POPUP PANEL */}
            <AnimatePresence>
              {showMixerPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md bg-[#161a29]/95 backdrop-blur-2xl border border-white/10 px-5 py-4 rounded-[28px] shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      <p className="text-xs font-bold tracking-wider text-slate-200">环境伴随声息实时配比</p>
                    </div>
                    <button
                      onClick={() => setShowMixerPanel(false)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Master Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-350 font-semibold tracking-wide">
                        <span className="flex items-center gap-1">
                          <Music className="w-3.5 h-3.5 text-indigo-400" />
                          <span>主声场强度</span>
                        </span>
                        <span className="font-mono text-emerald-300">{volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Scene Base Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-350 font-semibold tracking-wide">
                        <span className="flex items-center gap-1 mb-1">
                          <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '12s' }} />
                          <span>常驻背景颂钵</span>
                        </span>
                        <span className="font-mono text-emerald-300">{breathSceneVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={breathSceneVol}
                        onChange={(e) => setBreathSceneVol(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Rain Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-350 font-semibold tracking-wide">
                        <span className="flex items-center gap-1 mb-1">
                          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                          <span>细雨密林</span>
                        </span>
                        <span className="font-mono text-emerald-300">{breathRainVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={breathRainVol}
                        onChange={(e) => setBreathRainVol(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Wind Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-350 font-semibold tracking-wide">
                        <span className="flex items-center gap-1 mb-1">
                          <Wind className="w-3.5 h-3.5 text-emerald-400" />
                          <span>晨风拂叶</span>
                        </span>
                        <span className="font-mono text-emerald-300">{breathWindVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={breathWindVol}
                        onChange={(e) => setBreathWindVol(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Droplets Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-350 font-semibold tracking-wide">
                        <span className="flex items-center gap-1 mb-1">
                          <Droplets className="w-3.5 h-3.5 text-sky-400" />
                          <span>幽谷滴露</span>
                        </span>
                        <span className="font-mono text-emerald-300">{breathDropletsVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={breathDropletsVol}
                        onChange={(e) => setBreathDropletsVol(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Fire Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-350 font-semibold tracking-wide">
                        <span className="flex items-center gap-1 mb-1">
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                          <span>壁炉柴薪</span>
                        </span>
                        <span className="font-mono text-emerald-300">{breathFireVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={breathFireVol}
                        onChange={(e) => setBreathFireVol(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Microphone Biosensing Integration Options */}
                    <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-355 font-bold tracking-wider">
                          <Sparkles className={`w-3.5 h-3.5 ${isMicConnected ? 'text-teal-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '6s' }} />
                          <span>手机/耳机麦克风生物感应</span>
                        </div>
                        <button
                          onClick={toggleMic}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                            isMicConnected
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          }`}
                        >
                          {isMicConnected ? '断开传感' : '激活麦克风'}
                        </button>
                      </div>

                      {micError && (
                        <p className="text-[9px] text-rose-300 leading-normal bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/25">{micError}</p>
                      )}

                      {isMicConnected ? (
                        <div className="bg-black/35 p-2.5 rounded-xl border border-white/5 space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400">
                            <span>微息/叹息实时感应频率</span>
                            <span className="font-mono text-emerald-400">{(micLevel * 100).toFixed(0)}%</span>
                          </div>
                          {/* Live responsive equalizer bars */}
                          <div className="h-4 flex items-center gap-0.5 justify-center">
                            {[...Array(12)].map((_, i) => {
                              const baseHeight = 3 + Math.sin(i * 0.5) * 2;
                              const dynamicHeight = isBreathPaused ? 0 : micLevel * 14;
                              return (
                                <div
                                  key={i}
                                  className="w-1 rounded-full bg-emerald-400/80 transition-all duration-75"
                                  style={{
                                    height: `${Math.max(3, baseHeight + dynamicHeight)}px`
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[9px] text-slate-400 leading-relaxed bg-black/10 p-2.5 rounded-xl border border-white/5">
                          💡 <b>使用技巧 & 连接提示</b>：连接有线耳机线控麦克风或手机内置麦克风。推荐配合耳机进行，耳机能自动消除外部啸叫，让您的真实吸气、叹息与心流频率在光圈与声浪中获得高保真共鸣！
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center font-normal pt-1">
                    系统智能伴随：调息过程将深度融合音频声学重置
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Play controls row */}
            <footer className="relative z-10 w-full max-w-sm grid grid-cols-2 gap-4 my-4">
              <button
                onClick={() => setIsBreathPaused(!isBreathPaused)}
                className="py-4.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 text-white font-medium"
              >
                {isBreathPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                <span>{isBreathPaused ? '继续' : '暂停'}</span>
              </button>
              <button
                onClick={handleCompletePractice}
                className="py-4.5 rounded-full bg-white text-slate-900 font-semibold shadow-lg shadow-white/15 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-[#4f6167]" />
                <span>结束练习</span>
              </button>
            </footer>
          </motion.div>
        )}

        {/* STEP 5: Breathing Completed summary / 宁静已回归 */}
        {currentStep === 'completed' && (
          <motion.div
            key="completed-step"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow flex flex-col justify-between items-center text-center space-y-8"
          >
            {/* Splash check indicator */}
            <div className="flex flex-col items-center mt-6 space-y-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#4f6167]/10 rounded-full animate-ping opacity-25" />
                <div className="relative w-20 h-20 bg-white rounded-full shadow-lg border border-teal-500/10 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-[#4f6167]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-3xl font-light tracking-wide text-[#221b0b]">宁静已回归</h2>
                <p className="text-xs text-[#424849]/60">Breath Completed Successfully</p>
              </div>
            </div>

            <p className="text-sm font-light text-[#424849] max-w-sm leading-relaxed px-4">
              您已成功完成了本次正念调息。请静候片刻，感受您所亲手创造的这份身心安宁。以下是您的实时生理契合度统计指标：
            </p>

            {/* Bento Grid Analytics box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full">
              {/* Left bento panel: Consistent level */}
              <div className="md:col-span-8 glass-panel p-6 rounded-[28px] overflow-hidden relative text-left h-[180px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#4f6167] uppercase">今日专注</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-4xl font-light text-[#4f6167]">15</span>
                    <span className="text-xs font-semibold text-[#424849]/70">分钟</span>
                  </div>
                </div>
                <p className="text-xs text-[#424849] leading-relaxed max-w-[260px] font-light">
                  您今天的呼吸节奏一致性高达 <span className="font-semibold text-teal-700">92%</span>。这种平衡的一致率能激活副交感神经，极大地疏解心率变异率。
                </p>
                {/* Embedded dynamic wave illustration */}
                <div className="absolute right-0 bottom-0 top-0 w-28 opacity-[0.25] pointer-events-none p-4 flex items-center">
                  <img
                    className="w-full h-full object-contain mix-blend-overlay rounded-full"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBihcA8-ZPUneoLKzp3XU7kkVmUTyZYUc8oGESZhZhk9wIA2UXOXbyJ2TnuCb3dratjoRUgPBcSTy-p1cYqnrSYtGacszV7eqdIEkmzY2IYibUQ3Omaa519Nh5UYf7WibzM1bRsZ1uEN1zcBngqA75GwCNDnB9lRQEYB-YLIW5C7QbYDFzFBV5K8Klm3saLx44LmOWCYcl1tL33F4qfjiLfWLsemcu1qdgQxUntofWfvED5i4eyHzRsZhjPsJPGEzCEDegLwTCwfT1a"
                    alt="abstract 3d mesh waves shape"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Right statistics tags */}
              <div className="md:col-span-4 flex gap-4 md:flex-col">
                <div className="flex-1 glass-panel p-5 rounded-[24px] flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-semibold text-slate-500/70 uppercase tracking-widest mb-1">平均心率</span>
                  <p className="text-3xl font-light text-[#795950] font-sans">64 <span className="text-xs font-semibold">bpm</span></p>
                </div>
                <div className="flex-1 glass-panel p-5 rounded-[24px] flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-semibold text-slate-500/70 uppercase tracking-widest mb-1">正念状态</span>
                  <p className="text-lg font-bold text-[#4f6167]">第 4 级</p>
                </div>
              </div>
            </div>

            {/* Landscape Daily reminder Quote */}
            <div className="w-full glass-panel rounded-[28px] p-6 text-left border border-white/40">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcHYGnJRJfyJRklzXvQH1fxNJYEhBxQFYYwQ8_HB6c_779yHrT_ZS7LRdnkIAdzosqurI0ozqp97EsjparCviX1XkGjZvJ-w_z-me2x0wknZsknk6mLa6l-RRlUSfQ0v1cO_2injsEWS0HCJR2DZjX_3O0jE6F1Tuo-Fczq_iK1vWoQd1trgVT35EkWTlugzEbGGXob1Z0KseDmTi49B8r-g0SbX7ocKzqEestW7q0odxtjfmTH1CLpuuO4QeAtt-jVndkzbRzSKIe"
                    alt="daily sunset landscape therapeutic"
                  />
                </div>
                <div className="space-y-1.5 flex-grow">
                  <span className="text-[9px] font-bold text-amber-700/80 bg-amber-50 px-2 py-0.5 rounded-md uppercase border border-amber-200/50">
                    心灵守望温馨提醒
                  </span>
                  <p className="text-xs text-[#221b0b]/95 leading-relaxed font-light italic">
                    &ldquo;你现在正感受到的这一份呼吸宁静，其实一直存在于你的心中。你无需向外苦苦寻找；你只需要停下来，留出足够长的呼吸瞬间，就能重新感知它。&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Action options */}
            <div className="w-full space-y-4 pt-2">
              <button
                onClick={handleShare}
                className="w-full py-4.5 rounded-full bg-[#4f6167] text-white hover:bg-[#35474c] font-medium shadow-md shadow-[#4f6167]/15 active:scale-95 duration-200 transition-transform flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>分享这次呼吸创作进度</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentStep('mood');
                }}
                className="w-full py-4.5 rounded-full border border-[#4f6167]/20 hover:bg-slate-100/50 text-[#4f6167] font-medium rounded-full bg-white/40 active:scale-92 duration-200 transition-transform text-center font-sans"
              >
                回到呼吸设置
              </button>

              <button
                onClick={onNavigateToIsland}
                className="w-full text-xs font-semibold text-[#424849]/50 tracking-[0.2em] uppercase hover:underline py-1.5 block"
              >
                进入静谧岛查看我的生成画
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Sharing copy callback pop up */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-6 right-6 md:left-auto md:right-12 z-50 p-4.5 rounded-2xl bg-[#382f1e]/85 backdrop-blur-md text-white border border-white/10 text-xs shadow-2xl flex items-center gap-2.5 max-w-sm"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span className="font-light">正念作品已编入浮光链，分享卡片和链接已成功复制到剪粘板！</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
