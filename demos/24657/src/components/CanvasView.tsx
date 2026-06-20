import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Trash2, Save, Sparkles, Wind, Play, Pause, Compass, RefreshCw, Mic, MicOff } from 'lucide-react';
import { SavedArtwork } from '../types';

interface CanvasViewProps {
  onAddArtwork: (art: SavedArtwork) => void;
  onNavigateToIsland: () => void;
}

export default function CanvasView({ onAddArtwork, onNavigateToIsland }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // General drawing settings
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushWidth, setBrushWidth] = useState(6);
  const [brushStyle, setBrushStyle] = useState<'solid' | 'neon' | 'dust'>('neon');

  const [showSavedToast, setShowSavedToast] = useState(false);
  const [lastSavedUrl, setLastSavedUrl] = useState('');

  // Breathing Creative Mode variables
  const [creationMode, setCreationMode] = useState<'free' | 'breath'>('free');
  const [isBreathDrawing, setIsBreathDrawing] = useState(true);
  const [enableColorResonance, setEnableColorResonance] = useState(true);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [practiceCycles, setPracticeCycles] = useState(0);

  // Microphone Connections for Canvas View Biosensing
  const [isMicConnected, setIsMicConnected] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const micLevelRef = useRef<number>(0);
  const isMicConnectedRef = useRef<boolean>(false);

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
    isMicConnectedRef.current = false;
    setMicLevel(0);
    micLevelRef.current = 0;
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
        isMicConnectedRef.current = true;

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
          micLevelRef.current = normalized;
          animationFrameIdRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err: any) {
        console.error('Error accessing microphone for canvas:', err);
        setMicError('无法访问麦克风。请确保在权限提示中允许麦克风访问，并连接手机或耳机感应器。');
      }
    }
  };

  // References for continuous mathematical calculations (60fps)
  const elapsedRef = useRef<number>(0);
  const angleRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const mandalaCenterRef = useRef<{ x: number; y: number } | null>(null);
  const requestRef = useRef<number | null>(null);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [activePalette, setActivePalette] = useState<'dawn' | 'cosmic' | 'zen' | 'neon'>('dawn');

  const colorPalettes = {
    dawn: [
      { name: '纯白辉光 Pure Glow', hex: '#ffffff' },
      { name: '柔和蜜桃 Soft Peach', hex: '#f6ded2' },
      { name: '温润杏仁 Warm Almond', hex: '#fed4c8' },
      { name: '晨曦暖阳 Amber Dawn', hex: '#fcebb6' },
      { name: '奶油凝脂 Creamy Star', hex: '#fff8e7' }
    ],
    cosmic: [
      { name: '极光之瞳 Aurora Iris', hex: '#dbcdfe' },
      { name: '深海浅汐 Ocean Aqua', hex: '#bbc8d1' },
      { name: '冰川寒息 Ice Breeze', hex: '#a2d2df' },
      { name: '澄澈冷翠 Crystal Teal', hex: '#4fd3c4' },
      { name: '幻夜星渊 Midnight Blue', hex: '#6373b3' }
    ],
    zen: [
      { name: '贤人鼠尾 Sage Mint', hex: '#c0c9b7' },
      { name: '大地碧玉 Earthy Jade', hex: '#a3e4d7' },
      { name: '浅空暮岚 Lilac Dream', hex: '#c7ceea' },
      { name: '薄荷冰沙 Mint Sorbet', hex: '#b5ead7' },
      { name: '幽谷清潭 Forest Lake', hex: '#88b04b' }
    ],
    neon: [
      { name: '落日晚霞 Coral Sun', hex: '#ffb7b2' },
      { name: '蜜瓜轻暖 Mellow Melon', hex: '#ffdac1' },
      { name: '柠檬晶莹 Lime Glow', hex: '#e2f0cb' },
      { name: '幻紫流沙 Magic Lilac', hex: '#b19ffb' },
      { name: '朝气珊瑚 Active Rose', hex: '#ff6b6b' }
    ]
  };

  // Auto-resize viewport size & initial black-blue base texture
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const tempImage = canvas.toDataURL(); // Persist draw states across rotation Resizes
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Reprint background texture
          ctx.fillStyle = '#14182c';
          ctx.fillRect(0, 0, width, height);

          // Restore drawing
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = tempImage;
        }
      }
    });

    resizeObserver.observe(container);

    // Initial fill background on first render
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#14182c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Breathing Countdown Clock (Handles transitions for UI panels)
  useEffect(() => {
    if (creationMode !== 'breath' || !isBreathDrawing) {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }

    setCountdown(4);
    setBreathPhase('inhale');

    breathTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          let nextPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
          let nextSeconds = 4;

          setBreathPhase((currPhase) => {
            if (currPhase === 'inhale') {
              nextPhase = 'hold';
              nextSeconds = 2;
            } else if (currPhase === 'hold') {
              nextPhase = 'exhale';
              nextSeconds = 4;
            } else {
              nextPhase = 'inhale';
              nextSeconds = 4;
              setPracticeCycles((c) => c + 1);
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
  }, [creationMode, isBreathDrawing]);

  useEffect(() => {
    if (creationMode !== 'breath') {
      stopListeningToMic();
    }
  }, [creationMode]);

  useEffect(() => {
    return () => {
      stopListeningToMic();
    };
  }, []);

  // Helper to dynamically calibrate drawing color based on breathing phase and ratio
  const getPhaseCalibratedColor = (baseHex: string, phase: 'inhale' | 'hold' | 'exhale', ratio: number, elapsed: number) => {
    let hex = baseHex.trim().replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 1;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 1;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    let hDeg = Math.round(h * 360);
    let sPct = Math.round(s * 100);
    let lPct = Math.round(l * 100);

    // Give pure white or extremely dim grays a nicely saturated sky-ocean base so the phase shifts are mesmerizing and visible
    if (sPct < 10) {
      hDeg = 205; // Sky/ocean gradient base hue
      sPct = 65;
      lPct = Math.max(45, Math.min(lPct, 80));
    }

    if (phase === 'inhale') {
      // Inhale represents rising energy: shift hue towards celestial purple/blue, slightly brighter & vibrant
      hDeg = (hDeg + Math.round(ratio * 38)) % 360;
      lPct = Math.min(94, lPct + Math.round(ratio * 15));
      sPct = Math.min(100, sPct + Math.round(ratio * 15));
    } else if (phase === 'hold') {
      // Hold represents ultimate peace & stillness: peak shift, gentle shimmering glow
      hDeg = (hDeg + 48) % 360;
      const shm = Math.sin(elapsed * 4) * 4; // micro sparkling wave
      lPct = Math.max(25, Math.min(94, lPct + 18 + Math.round(shm)));
      sPct = Math.min(100, sPct + 22);
    } else if (phase === 'exhale') {
      // Exhale is grounding & releasing warm tension: sunset coral/peach shifts
      hDeg = (hDeg - Math.round(ratio * 32) + 360) % 360;
      lPct = Math.max(15, lPct - Math.round(ratio * 12));
      sPct = Math.max(15, sPct - Math.round(ratio * 10));
    }

    return `hsla(${hDeg}, ${sPct}%, ${lPct}%, 0.9)`;
  };

  // High-performance 60fps breathing mandala painting engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || creationMode !== 'breath' || !isBreathDrawing) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize/sync timestamp reference
    lastTimeRef.current = performance.now();
    
    // Default to canvas middle
    if (!mandalaCenterRef.current) {
      mandalaCenterRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    }

    const drawFrame = (timestamp: number) => {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;
      const currentCtx = currentCanvas.getContext('2d');
      if (!currentCtx) return;

      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Accumulate 10-second breath cycle
      elapsedRef.current = (elapsedRef.current + delta) % 10;
      
      const speed = 0.65 * delta; // rotational speed
      const prevAngle = angleRef.current;
      angleRef.current = prevAngle + speed;
      const currentAngle = angleRef.current;

      // Function to help find exact ratio & phase at any elapsed seconds
      const getRatioAndPhase = (t: number) => {
        let r = 0;
        let p: 'inhale' | 'hold' | 'exhale' = 'inhale';
        if (t < 4) {
          p = 'inhale';
          r = t / 4;
        } else if (t < 6) {
          p = 'hold';
          r = 1.0;
        } else {
          p = 'exhale';
          r = 1.0 - (t - 6) / 4;
        }
        return { ratio: r, phase: p };
      };

      const prevTime = (elapsedRef.current - delta + 10) % 10;
      const t1 = getRatioAndPhase(prevTime);
      const prevRatio = t1.ratio;
      const prevPhase = t1.phase;

      const t2 = getRatioAndPhase(elapsedRef.current);
      const currentRatio = t2.ratio;
      const currentPhase = t2.phase;

      // Center parameters
      const width = currentCanvas.width;
      const height = currentCanvas.height;
      const { x: cx, y: cy } = mandalaCenterRef.current || { x: width / 2, y: height / 2 };

      // Dynamically calibrate colors based on breathing phase
      const targetColor = enableColorResonance
        ? getPhaseCalibratedColor(brushColor, currentPhase, currentRatio, elapsedRef.current)
        : brushColor;

      // Stroke rendering configurations
      currentCtx.strokeStyle = targetColor;
      currentCtx.shadowColor = targetColor;
      currentCtx.lineCap = 'round';
      currentCtx.lineJoin = 'round';

      // Width expands organically with breath + mic level boost for real-time resonance
      const micWidthBoost = isMicConnectedRef.current ? micLevelRef.current * 20 : 0;
      const dynamicWidth = (brushWidth * (0.4 + currentRatio * 0.9)) + micWidthBoost;
      currentCtx.lineWidth = dynamicWidth;

      if (brushStyle === 'neon') {
        currentCtx.shadowBlur = dynamicWidth * 1.8 * (0.6 + currentRatio * 1.4);
        currentCtx.setLineDash([]);
      } else if (brushStyle === 'dust') {
        currentCtx.shadowBlur = 0;
        // Dash frequency correlates inversely to breathing tightness
        currentCtx.setLineDash([1, (5.2 - currentRatio * 3.8) * brushWidth]);
      } else {
        currentCtx.shadowBlur = 0;
        currentCtx.setLineDash([]);
      }

      // Procedural mathematical vertex calculations 
      const getMandalaPoint = (angle: number, ratio: number, phase: string) => {
        const baseDim = Math.min(width, height);
        const baseRadius = baseDim * 0.08;
        const maxExpansion = baseDim * 0.22;
        
        // Connect mic signal to base radius expansion dynamically
        const micExpansion = isMicConnectedRef.current ? micLevelRef.current * (baseDim * 0.16) : 0;
        const breathRadius = baseRadius + ratio * maxExpansion + micExpansion;

        // Symmetric frequency of petals: 6 petals
        const lobes = 6;
        const micPetalBoost = isMicConnectedRef.current ? micLevelRef.current * 36 : 0;
        const petalIntensity = 10 + ratio * 24 + micPetalBoost;
        const petalOffset = Math.sin(angle * lobes) * petalIntensity;

        // Fine harmonic wave noise representing secondary neural calmness
        const fineOscillation = phase === 'hold' 
          ? Math.cos(angle * 18) * 3 
          : Math.sin(angle * 10) * (1.5 + ratio * 4);

        const radius = breathRadius + petalOffset + fineOscillation;

        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
      };

      // Apply 6-fold symmetry for visual geometry
      const symmetrySlices = 6;
      for (let i = 0; i < symmetrySlices; i++) {
        const offsetAngle = i * (2 * Math.PI / symmetrySlices);

        // Previous point positioning
        const p1 = getMandalaPoint(prevAngle, prevRatio, prevPhase);
        const x1 = cx + p1.x * Math.cos(offsetAngle) - p1.y * Math.sin(offsetAngle);
        const y1 = cy + p1.x * Math.sin(offsetAngle) + p1.y * Math.cos(offsetAngle);

        // Current point positioning
        const p2 = getMandalaPoint(currentAngle, currentRatio, currentPhase);
        const x2 = cx + p2.x * Math.cos(offsetAngle) - p2.y * Math.sin(offsetAngle);
        const y2 = cy + p2.x * Math.sin(offsetAngle) + p2.y * Math.cos(offsetAngle);

        currentCtx.beginPath();
        currentCtx.moveTo(x1, y1);
        currentCtx.lineTo(x2, y2);
        currentCtx.stroke();
      }

      requestRef.current = requestAnimationFrame(drawFrame);
    };

    requestRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [creationMode, isBreathDrawing, enableColorResonance, brushColor, brushWidth, brushStyle]);

  // Painting handlers (Mouse or Touch interactions)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (creationMode === 'breath') {
      const pos = getCoordinates(e, canvas);
      mandalaCenterRef.current = pos;
      if (!isBreathDrawing) {
        setIsBreathDrawing(true);
      }
      return;
    }

    setIsDrawing(true);

    const pos = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.shadowColor = brushColor;
    
    if (brushStyle === 'neon') {
      ctx.shadowBlur = brushWidth * 1.8;
    } else if (brushStyle === 'dust') {
      ctx.shadowBlur = 0;
      ctx.setLineDash([1, brushWidth * 1.5]);
    } else {
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (creationMode === 'breath') {
      if ('touches' in e || (e.buttons > 0)) {
        const pos = getCoordinates(e, canvas);
        mandalaCenterRef.current = pos;
      }
      return;
    }

    if (!isDrawing) return;
    
    e.preventDefault();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCoordinates(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (creationMode !== 'breath') {
      setIsDrawing(false);
    }
  };

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Utility actions
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#14182c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const dateFormatted = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.');

    const modeLabel = creationMode === 'breath' ? '呼吸共振' : '心灵流迹';
    const newArt: SavedArtwork = {
      id: `canvas-${Date.now()}`,
      title: `${modeLabel}生画 - ${Math.floor(Math.random() * 90) + 10} 律动`,
      imageUrl: dataUrl,
      imageAlt: 'Custom drawing from user',
      date: dateFormatted,
      category: 'all'
    };

    onAddArtwork(newArt);
    setLastSavedUrl(dataUrl);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 2800);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-left">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-violet-800 bg-violet-100 rounded-md px-2.5 py-0.5 border border-violet-200 uppercase tracking-widest inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-violet-700 animate-pulse" />
          <span>追随心灵印记</span>
        </span>
        <h2 className="text-2xl font-light text-[#221b0b]">创意静安画布</h2>
        <p className="text-xs text-[#424849]/60 leading-relaxed font-light">
          追随光迹律动，释放内心深处的紧绷思绪。指尖在黑夜中与你的呼吸节奏滑过，即成一抹斑驳的曼陀罗画卷：
        </p>
      </div>

      {/* MODE SELECTOR */}
      <div className="flex gap-1.5 p-1 bg-[#4f6167]/5 rounded-2xl max-w-sm">
        <button
          onClick={() => {
            setCreationMode('free');
            setIsBreathDrawing(false);
          }}
          className={`flex-grow py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            creationMode === 'free'
              ? 'bg-[#4f6167] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>自由创作模式</span>
        </button>
        <button
          onClick={() => {
            setCreationMode('breath');
            setIsBreathDrawing(true);
          }}
          className={`flex-grow py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            creationMode === 'breath'
              ? 'bg-[#4f6167] text-white shadow'
              : 'text-[#4f6167] hover:text-slate-900 hover:bg-[#4f6167]/5'
          }`}
        >
          <Wind className="w-3.5 h-3.5 animate-pulse" />
          <span>呼吸共振模式</span>
        </button>
      </div>

      {/* Canvas container frame */}
      <div
        ref={containerRef}
        className="w-full h-[400px] border border-white/60 rounded-[32px] overflow-hidden shadow-inner relative select-none"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 cursor-crosshair"
        />

        {/* Floating Tool Indicator box */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none glass-panel-dark px-3 py-1.5 rounded-full border border-white/10 text-[9px] text-white/80 font-mono tracking-widest scale-90">
          MODE: {brushStyle.toUpperCase()} · {creationMode.toUpperCase()}
        </div>

        {/* Breathing HUD Indicator Overlay */}
        {creationMode === 'breath' && (
          <>
            <div className="absolute inset-x-0 bottom-0 top-1/2 pointer-events-none bg-gradient-to-t from-black/25 via-transparent to-transparent z-10 animate-fade-in" />
            
            {/* Phase and Countdown HUD */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5 bg-black/50 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-2xl text-xs select-none shadow">
              <div className="relative w-2 h-2">
                {isBreathDrawing && (
                  <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                    breathPhase === 'inhale' ? 'bg-sky-400' : breathPhase === 'hold' ? 'bg-emerald-400' : 'bg-rose-455'
                  }`} />
                )}
                <div className={`w-2 h-2 rounded-full ${
                  breathPhase === 'inhale' ? 'bg-sky-400' : breathPhase === 'hold' ? 'bg-emerald-450' : 'bg-rose-400'
                }`} />
              </div>
              <p className="font-sans font-semibold tracking-wide flex items-center gap-1.5 text-white">
                <span className={`text-[10px] uppercase font-mono font-bold ${
                  breathPhase === 'inhale' ? 'text-sky-300' : breathPhase === 'hold' ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  {breathPhase === 'inhale' ? '吸气 Inhale' : breathPhase === 'hold' ? '屏息 Hold' : '呼气 Exhale'}
                </span>
                <span className="font-mono text-white/90">{countdown}s</span>
              </p>
            </div>

            {/* Instruction Footer Sticker */}
            <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-center text-center animate-fade-in">
              <span className="glass-panel-dark text-[9px] text-white/80 px-3.5 py-1.5 rounded-full border border-white/10 shadow bg-black/40 backdrop-blur-sm tracking-wider">
                💡 轻触或移动指尖，可在任意位置凝聚呼吸共振波形重心
              </span>
            </div>
          </>
        )}
      </div>

      {/* Control console for Breathing Drawing Mode */}
      {creationMode === 'breath' && (
        <div className="space-y-3 animate-fade-in text-left">
          <div className="glass-panel p-5 rounded-[28px] border border-white/40 flex flex-col xl:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left w-full xl:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4f6167]/10 text-[#4f6167] flex items-center justify-center animate-pulse z-0 relative">
                  <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">呼吸气流共振状态</h4>
                  <p className="text-xs text-slate-500/80 mt-0.5">已累积: {practiceCycles} 次呼吸循环韵律</p>
                </div>
              </div>

              {/* Dynamic color mapping toggle switch */}
              <label className="flex items-center gap-2 bg-[#4f6167]/5 hover:bg-[#4f6167]/10 border border-[#4f6167]/10 py-2 px-3.5 rounded-2xl cursor-pointer transition-all self-start sm:self-auto select-none">
                <input
                  type="checkbox"
                  checked={enableColorResonance}
                  onChange={(e) => setEnableColorResonance(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4f6167] focus:ring-[#4f6167] border-slate-300"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>色彩随呼吸律动</span>
                    {enableColorResonance && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </p>
                  <p className="text-[9px] text-slate-400 font-light font-mono">Dynamic Hue Shift</p>
                </div>
              </label>

              {/* Microphone Biosensing Input Switch */}
              <button
                onClick={toggleMic}
                className={`flex items-center gap-2 border py-2 px-3.5 rounded-2xl cursor-pointer transition-all active:scale-95 text-left self-start sm:self-auto select-none ${
                  isMicConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800'
                    : 'bg-[#4f6167]/5 hover:bg-[#4f6167]/10 border-[#4f6167]/10 text-slate-700'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {isMicConnected ? (
                    <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />
                  ) : (
                    <MicOff className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <span>调息麦克风传感</span>
                    {isMicConnected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </p>
                  <p className="text-[9px] text-slate-400 font-light font-mono">
                    {isMicConnected ? `已传感 / 能量 ${(micLevel * 100).toFixed(0)}%` : '点击开启呼气传感'}
                  </p>
                </div>
              </button>
            </div>

            <div className="flex gap-2.5 w-full xl:w-auto">
              <button
                onClick={() => setIsBreathDrawing(!isBreathDrawing)}
                className={`flex-1 xl:flex-initial px-4.5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  isBreathDrawing
                    ? 'bg-[#4f6167] text-white'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border'
                }`}
              >
                {isBreathDrawing ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isBreathDrawing ? '暂停气流' : '开启气流'}</span>
              </button>
              <button
                onClick={() => {
                  const currentCanvas = canvasRef.current;
                  if (currentCanvas) {
                    mandalaCenterRef.current = { x: currentCanvas.width / 2, y: currentCanvas.height / 2 };
                  }
                }}
                className="flex-1 xl:flex-initial px-4.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>重置重心</span>
              </button>
            </div>
          </div>

          {/* Microphone Sensor Status Detail Overlay */}
          {micError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs animate-fade-in flex items-center gap-2">
              <span className="font-semibold text-rose-600">无法启动传感：</span>
              <span>{micError}</span>
            </div>
          )}

          {isMicConnected && (
            <div className="bg-[#14182c]/95 border border-white/10 p-3.5 rounded-3xl animate-fade-in shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <div className="text-left space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider block">MIC RESONANCE SENSOR LIVE</span>
                <p className="text-xs text-white/80 font-light">您的呼气及声波共震将实时影响画笔径宽和曼陀罗盛开的饱满度。</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400">实时振幅频率</p>
                  <p className="font-mono text-emerald-400 text-xs font-bold font-black mt-0.5">{(micLevel * 100).toFixed(1)}%</p>
                </div>
                {/* Dynamically scaling real-time mini-bar visualizer */}
                <div className="h-5 flex items-center gap-0.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                  {[...Array(8)].map((_, idx) => {
                    const baseHeight = 3 + Math.sin(idx * 0.7) * 2;
                    const val = micLevel * 16;
                    return (
                      <div
                        key={idx}
                        className="w-0.5 rounded-full bg-emerald-400 transition-all duration-75"
                        style={{ height: `${Math.max(2, baseHeight + val)}px` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tooling configuration center */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Brush color picker widget */}
        <div className="md:col-span-8 glass-panel p-6 rounded-[28px] border border-white/40 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
            <p className="text-xs font-bold text-slate-500/80 tracking-wider flex items-center gap-1.5 uppercase">
              <Palette className="w-4 h-4 text-[#4f6167]" />
              <span>选择绘制色彩底料</span>
            </p>
            {/* Subtabs for palettes */}
            <div className="flex gap-1 bg-[#4f6167]/5 p-0.5 rounded-lg text-[10px] self-start sm:self-auto font-medium">
              {[
                { id: 'dawn', label: '晨曦治愈' },
                { id: 'cosmic', label: '静海星空' },
                { id: 'zen', label: '草木万物' },
                { id: 'neon', label: '极光幻彩' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePalette(tab.id as any)}
                  className={`px-2 py-0.5 rounded transition-all text-[10px] ${
                    activePalette === tab.id
                      ? 'bg-[#4f6167] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {/* Preset Colors */}
            {colorPalettes[activePalette].map((color) => {
              const isActive = brushColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.hex}
                  onClick={() => setBrushColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm relative ${
                    isActive
                      ? 'ring-2 ring-[#4f6167] ring-offset-2 dark:ring-offset-slate-900 scale-105'
                      : ''
                  }`}
                  title={color.name}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-800 font-bold drop-shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200/60 dark:bg-slate-700/60 mx-1 hidden sm:block" />

            {/* Custom Color Selector Container */}
            <div className="relative flex items-center gap-2.5 bg-[#4f6167]/5 p-1.5 pr-3 rounded-2xl border border-slate-200/40">
              <label 
                className={`w-8 h-8 rounded-xl border border-dashed border-slate-400 flex items-center justify-center cursor-pointer hover:border-slate-600 transition-colors bg-white dark:bg-slate-800 shadow-sm relative ${
                  !Object.values(colorPalettes).flat().some(c => c.hex.toLowerCase() === brushColor.toLowerCase())
                    ? 'ring-2 ring-indigo-500/40 border-solid'
                    : ''
                }`}
                style={{ 
                  backgroundColor: !Object.values(colorPalettes).flat().some(c => c.hex.toLowerCase() === brushColor.toLowerCase()) ? brushColor : undefined 
                }}
                title="选择自定义色彩"
              >
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                {!Object.values(colorPalettes).flat().some(c => c.hex.toLowerCase() === brushColor.toLowerCase()) ? (
                  <span className="text-[10px] text-white mix-blend-difference font-bold">✓</span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">+</span>
                )}
              </label>
              <div className="text-left leading-none">
                <p className="text-[9px] font-bold text-slate-400">自定义调色板</p>
                <p className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wide">
                  {brushColor}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brush style preset toggler */}
        <div className="md:col-span-4 glass-panel p-6 rounded-[28px] border border-white/40 space-y-3 flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#424849]/70 tracking-wider uppercase">笔触光照效果</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'solid', label: '实线', icon: '✏️' },
              { id: 'neon', label: '微光', icon: '✨' },
              { id: 'dust', label: '星屑', icon: '🌌' }
            ].map((style) => {
              const active = brushStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setBrushStyle(style.id as any)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                    active
                      ? 'bg-[#4f6167] text-white font-semibold'
                      : 'bg-white/40 hover:bg-white text-slate-700'
                  }`}
                >
                  <span className="text-base">{style.icon}</span>
                  <span className="text-[10px]">{style.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Adjust Stroke widths & actions box */}
      <div className="glass-panel p-6 rounded-[28px] border border-white/40 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Stroke width */}
        <div className="space-y-2 col-span-2">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-[#424849]/60 tracking-wider">
            <span>调节笔触径宽</span>
            <span className="font-mono text-[#4f6167]">{brushWidth}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400">细</span>
            <input
              type="range"
              min="2"
              max="40"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="w-full h-1 bg-[#4f6167]/10 rounded-full appearance-none cursor-pointer accent-[#4f6167]"
            />
            <span className="text-xs text-slate-500">粗</span>
          </div>
        </div>

        {/* Core Actions row */}
        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={handleClearCanvas}
            className="flex-1 py-3.5 rounded-2xl bg-white/40 border border-[#c2c7c9]/30 hover:bg-slate-150 text-slate-700 hover:text-red-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空画布</span>
          </button>
          
          <button
            onClick={handleSaveToGallery}
            className="flex-1 py-3.5 rounded-2xl bg-[#4f6167] text-white hover:bg-[#35474c] transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-[#4f6167]/15"
          >
            <Save className="w-4 h-4" />
            <span>保存作品</span>
          </button>
        </div>
      </div>

      {/* Drawing Success Toast */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-28 left-6 right-6 md:left-auto md:right-12 z-50 p-5 rounded-2xl bg-[#14182c]/95 backdrop-blur-md text-white border border-white/10 text-xs shadow-2xl flex items-center justify-between gap-4 max-w-sm"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                <img className="w-full h-full object-cover" src={lastSavedUrl} alt="recent drawing" />
              </div>
              <div>
                <p className="font-semibold text-emerald-300">🎉 画作保存成功！</p>
                <p className="text-white/70 text-[10px] mt-0.5">该作品已录入您的静谧岛画册</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSavedToast(false);
                onNavigateToIsland();
              }}
              className="text-indigo-300 font-bold hover:underline focus:outline-none whitespace-nowrap"
            >
              去查看
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
