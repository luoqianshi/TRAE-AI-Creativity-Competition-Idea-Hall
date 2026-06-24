'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { formatSeconds } from '@/utils/format';
import { cn } from '@/utils/format';
import { useAmbientNoise } from '@/lib/useAmbientNoise';

export interface AudioPlayerProps {
  src: string | null;
  fallbackText?: string;
  onComplete?: () => void;
  onProgress?: (current: number, duration: number) => void;
  onTimeUpdate?: (current: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  initialVolume?: number;
  className?: string;
  enableAmbient?: boolean;
  ambientVolume?: number;
}

export function AudioPlayer({
  src,
  fallbackText,
  onComplete,
  onTimeUpdate,
  onPlayStateChange,
  initialVolume = 0.7,
  className,
  enableAmbient = true,
  ambientVolume = 0.04,
}: AudioPlayerProps) {
  // 关键修复：useFallback 初始值直接由 src 决定（null → true），
  // 避免"src 为 null 的第一帧渲染了 <audio> 元素但 src 是空"的歧义状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState<boolean>(!src);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambient = useAmbientNoise({
    volume: ambientVolume,
    fadeInMs: 900,
    fadeOutMs: 500,
  });
  // 用 ref 保存最新的回调，避免 useEffect 依赖频繁变化导致 effect 重跑
  const cbRef = useRef({ onComplete, onTimeUpdate, onPlayStateChange, enableAmbient, ambient });
  useEffect(() => {
    cbRef.current = { onComplete, onTimeUpdate, onPlayStateChange, enableAmbient, ambient };
  }, [onComplete, onTimeUpdate, onPlayStateChange, enableAmbient, ambient]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = initialVolume;
    }
  }, [initialVolume]);

  // src 变化时重置状态。**这里不依赖 useFallback**，避免循环
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setUseFallback(!src);
    // 让 audio 元素重新加载新 src
    const a = audioRef.current;
    if (a) {
      try { a.pause(); } catch {}
      if (src) {
        a.src = src;
        a.load();
      } else {
        a.removeAttribute('src');
        a.load();
      }
    }
  }, [src]);

  // 用 callback ref 挂载事件监听器 —— 这是核心修复：
  // 之前 useEffect 的依赖里没有 src/audioRef，所以新 audio 元素挂载后
  // 监听器永远挂不上，play() 之后没有任何回调。
  const attachAudioRef = useCallback((node: HTMLAudioElement | null) => {
    // 清理旧节点
    const prev = audioRef.current;
    if (prev && prev !== node) {
      prev.pause();
    }
    audioRef.current = node;
    if (!node) return;

    const onPlay = () => {
      setIsPlaying(true);
      cbRef.current.onPlayStateChange?.(true);
      setIsLoading(false);
      if (cbRef.current.enableAmbient) cbRef.current.ambient.start();
    };
    const onPause = () => {
      setIsPlaying(false);
      cbRef.current.onPlayStateChange?.(false);
      if (cbRef.current.enableAmbient) cbRef.current.ambient.stop();
    };
    const onTime = () => {
      setCurrentTime(node.currentTime);
      cbRef.current.onTimeUpdate?.(node.currentTime);
    };
    const onLoaded = () => {
      setDuration(node.duration || 0);
      setIsLoading(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onEnded = () => {
      setIsPlaying(false);
      cbRef.current.onPlayStateChange?.(false);
      if (cbRef.current.enableAmbient) cbRef.current.ambient.stop();
      cbRef.current.onComplete?.();
    };
    const onError = () => {
      console.warn('audio error, fallback to browser TTS');
      if (cbRef.current.enableAmbient) cbRef.current.ambient.stop();
      setUseFallback(true);
    };

    node.addEventListener('play', onPlay);
    node.addEventListener('pause', onPause);
    node.addEventListener('timeupdate', onTime);
    node.addEventListener('loadedmetadata', onLoaded);
    node.addEventListener('loadeddata', onLoaded);
    node.addEventListener('waiting', onWaiting);
    node.addEventListener('ended', onEnded);
    node.addEventListener('error', onError);

    // 把清理函数挂到节点上，供下次 ref 变化时调用
    (node as unknown as { __cleanup?: () => void }).__cleanup = () => {
      node.removeEventListener('play', onPlay);
      node.removeEventListener('pause', onPause);
      node.removeEventListener('timeupdate', onTime);
      node.removeEventListener('loadedmetadata', onLoaded);
      node.removeEventListener('loadeddata', onLoaded);
      node.removeEventListener('waiting', onWaiting);
      node.removeEventListener('ended', onEnded);
      node.removeEventListener('error', onError);
    };
  }, []);

  // 组件卸载时停止 TTS 和 ambient。
  // 关键：依赖列表必须稳定（只用 isMounted 这种不会变的东西或者用 ref），
  // 之前依赖 [ambient]，useAmbientNoise 每次 render 返回新对象导致 cleanup 反复执行，
  // 把刚启动的 TTS 立刻 cancel() 掉 → 用户听到完全无声。
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggle() {
    // 每次重新尝试播放时清掉上次的错误提示
    setError(null);
    if (useFallback) {
      toggleBrowserTTS();
      return;
    }
    const audio = audioRef.current;
    if (!audio) {
      // 极端情况：src 存在但 audio 元素未挂载
      console.warn('audio element not mounted, fallback to browser TTS');
      setUseFallback(true);
      toggleBrowserTTS();
      return;
    }
    if (audio.paused) {
      audio.play().catch((err) => {
        console.warn('audio play failed', err);
        setUseFallback(true);
        toggleBrowserTTS();
      });
    } else {
      audio.pause();
    }
  }

  function toggleBrowserTTS() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('当前浏览器不支持语音');
      return;
    }
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      if (enableAmbient) ambient.stop();
      return;
    }
    if (!fallbackText) {
      setError('没有可朗读的文字');
      return;
    }
    // 分段朗读，避免一次性传入太长文本被某些浏览器截断
    const utter = new SpeechSynthesisUtterance(fallbackText);
    utter.lang = 'zh-CN';
    utter.rate = 0.82;
    utter.pitch = 1.12;
    utter.volume = initialVolume;

    const voices = synth.getVoices();
    const cnVoices = voices.filter((v) => v.lang.startsWith('zh'));
    const preferred = cnVoices.find((v) => /microsoft|google|yunyang|xiaoxiao|yunxi|hanhan|kangkang/i.test(v.name))
      || cnVoices.find((v) => /female|woman|女/i.test(v.name))
      || cnVoices[0];
    if (preferred) utter.voice = preferred;

    // 若系统完全没有中文语音，主动显示提示（不要等用户听不见才报错）
    const hasChineseVoice = cnVoices.length > 0;
    if (!hasChineseVoice) {
      console.warn('[tts] 系统中没有可用的中文语音');
      setError('当前设备没有中文语音包（Windows 可在 设置-时间和语言-语言-中文-语音 中下载）');
    }

    // 3 秒兜底：如果 onstart 一直不触发（Chrome 偶发的 speak() 卡死），
    // 主动切到错误态提示用户点击重试
    const startTimeout = window.setTimeout(() => {
      if (!window.speechSynthesis.speaking) {
        setError('浏览器语音启动超时，请再点一次播放');
        setIsPlaying(false);
      }
    }, 3000);

    utter.onstart = () => {
      window.clearTimeout(startTimeout);
      setIsPlaying(true);
      onPlayStateChange?.(true);
      if (enableAmbient) ambient.start();
    };
    utter.onend = () => {
      window.clearTimeout(startTimeout);
      setIsPlaying(false);
      onPlayStateChange?.(false);
      if (enableAmbient) ambient.stop();
      onComplete?.();
    };
    utter.onerror = (e) => {
      window.clearTimeout(startTimeout);
      // SpeechSynthesis 错误类型：
      //   - 'interrupted' / 'canceled' : 用户主动 cancel()，是正常流程，不要报错
      //   - 'synthesis-failed'        : TTS 引擎真失败
      //   - 'audio-busy' / 'audio-hardware' : 系统音频问题
      //   - 'not-allowed'             : 权限被拒（需要用户手势）
      const errCode = (e as SpeechSynthesisErrorEvent).error || '';
      if (errCode === 'interrupted' || errCode === 'canceled') {
        // 正常中断，静默即可
        return;
      }
      console.warn('speechSynthesis error', e);
      setIsPlaying(false);
      onPlayStateChange?.(false);
      if (enableAmbient) ambient.stop();
      setError(
        errCode === 'not-allowed'
          ? '浏览器需要点击后才能播放语音，请先点一下页面'
          : '浏览器语音不可用，请检查系统是否安装了中文语音包',
      );
    };
    synth.speak(utter);
  }

  function onProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (useFallback) return;
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = ratio * duration;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = Math.max(0, duration - currentTime);

  return (
    <div className={cn('flex flex-col items-stretch gap-3 w-full', className)}>
      {/*
        关键修复：audio 元素始终渲染（带 key=src 强制在 src 变化时重建），
        这样 callback ref 一定会被调用，事件监听器一定会被挂上。
        不再用 src && !useFallback 的条件渲染，避免了 ref 失效的歧义状态。

        另：不再用 display:none —— 某些浏览器（Safari、部分 Android 浏览器）
        会因 display:none 而拒绝播放音频。这里用 sr-only（屏幕阅读器可见），
        视觉上不可见但能正常播放。
      */}
      <audio
        ref={attachAudioRef}
        key={src || 'no-src'}
        preload="metadata"
        className="sr-only"
      />

      {/* 进度条 */}
      <div
        className={cn(
          'relative h-2.5 rounded-full cursor-pointer',
          useFallback ? 'bg-[var(--color-divider)]/40' : 'bg-[var(--color-divider)]'
        )}
        onClick={onProgressClick}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration || 0}
        aria-valuenow={currentTime}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-accent)] transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
        {!useFallback && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-accent)] shadow-soft border-2 border-white"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        )}
      </div>

      {/* 控制行 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium tabular-nums text-[var(--color-muted)] w-12 text-left">
          {useFallback ? '--:--' : formatSeconds(currentTime)}
        </span>

        <button
          type="button"
          onClick={toggle}
          disabled={isLoading && !useFallback}
          aria-label={isPlaying ? '暂停' : '播放'}
          className="w-16 h-16 rounded-full btn-cta flex items-center justify-center"
        >
          {isLoading && !useFallback ? (
            <span className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-7 h-7" strokeWidth={2.4} />
          ) : (
            <Play className="w-7 h-7 translate-x-[1px]" strokeWidth={2.4} fill="currentColor" />
          )}
        </button>

        <span className="text-sm font-medium tabular-nums text-[var(--color-muted)] w-12 text-right">
          {useFallback ? '--:--' : `-${formatSeconds(remaining)}`}
        </span>
      </div>

      {/* 状态/降级提示 */}
      {useFallback && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] justify-center">
          <Volume2 className="w-3.5 h-3.5" />
          <span>正在使用浏览器内置温柔女声</span>
        </div>
      )}
      {error && (
        <div className="text-xs text-[var(--color-accent)] text-center">{error}</div>
      )}
    </div>
  );
}
