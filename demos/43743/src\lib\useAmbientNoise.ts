'use client';

// 暖室底噪 — 通过 Web Audio API 程序化生成
// 不依赖任何音频文件，按需合成"粉色噪声 + 低频隆隆声"，
// 音量极低（默认 0.04），给 TTS 朗读披上一层"在温暖的卧室里"的环境感
//
// 用法：
//   const ambient = useAmbientNoise({ volume: 0.04 });
//   ambient.start();   // 开始（需在用户手势中调用）
//   ambient.stop();    // 停止
//   ambient.fadeIn();  // 缓入
//   ambient.fadeOut(); // 缓出
//
// 实现：粉噪（Paul Kellet 算法）+ 低通滤波 → 主输出
//       棕色噪（深频）→ 通过独立低增益混入（让底噪更"暖"）

import { useEffect, useMemo, useRef } from 'react';

export interface AmbientControls {
  start: () => void;
  stop: () => void;
  fadeIn: (durationMs?: number) => Promise<void>;
  fadeOut: (durationMs?: number) => Promise<void>;
  setVolume: (v: number) => void;
  isActive: () => boolean;
}

export interface AmbientOptions {
  volume?: number;        // 0..1，推荐 0.03~0.06
  fadeInMs?: number;      // 渐入毫秒
  fadeOutMs?: number;     // 渐出毫秒
  brownVolume?: number;   // 棕噪比例，默认 0.4
  cutOffHz?: number;      // 低通截止频率，让噪声更"闷"更"暖"
}

function createPinkNoiseBuffer(audioCtx: AudioContext, seconds = 2): AudioBuffer {
  const sampleRate = audioCtx.sampleRate;
  const length = Math.floor(sampleRate * seconds);
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Paul Kellet 的粉噪近似算法
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    data[i] = pink * 0.11;
  }
  return buffer;
}

function createBrownNoiseBuffer(audioCtx: AudioContext, seconds = 4): AudioBuffer {
  const sampleRate = audioCtx.sampleRate;
  const length = Math.floor(sampleRate * seconds);
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

export function useAmbientNoise(opts: AmbientOptions = {}): AmbientControls {
  const {
    volume = 0.04,
    fadeInMs = 800,
    fadeOutMs = 600,
    brownVolume = 0.4,
    cutOffHz = 800,
  } = opts;

  const ctxRef = useRef<AudioContext | null>(null);
  const pinkSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const brownSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const targetVolumeRef = useRef<number>(volume);

  useEffect(() => {
    targetVolumeRef.current = volume;
    if (gainRef.current) {
      // 平滑过渡到新音量
      const ctx = ctxRef.current;
      if (ctx) {
        gainRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.3);
      }
    }
  }, [volume]);

  function ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (ctxRef.current) return ctxRef.current;
    try {
      const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      if (!Ctor) return null;
      const ctx = new Ctor();
      ctxRef.current = ctx;

      // 主输出 → 低通滤波 → 增益
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutOffHz;
      filter.Q.value = 0.5;
      filterRef.current = filter;

      const gain = ctx.createGain();
      gain.gain.value = 0; // 初始为 0，由 fadeIn 渐入
      gainRef.current = gain;

      filter.connect(gain);
      gain.connect(ctx.destination);

      return ctx;
    } catch (err) {
      console.warn('[ambient] create AudioContext failed', err);
      return null;
    }
  }

  function buildGraph() {
    const ctx = ensureContext();
    if (!ctx || !filterRef.current) return;
    if (pinkSourceRef.current) return; // 已存在

    // 粉噪
    const pinkBuffer = createPinkNoiseBuffer(ctx, 2);
    const pink = ctx.createBufferSource();
    pink.buffer = pinkBuffer;
    pink.loop = true;
    pink.connect(filterRef.current);
    pink.start();
    pinkSourceRef.current = pink;

    // 棕噪（更深的低频隆隆声，独立低增益）
    const brownBuffer = createBrownNoiseBuffer(ctx, 4);
    const brown = ctx.createBufferSource();
    brown.buffer = brownBuffer;
    brown.loop = true;
    const brownGain = ctx.createGain();
    brownGain.gain.value = brownVolume;
    brown.connect(brownGain);
    brownGain.connect(filterRef.current);
    brown.start();
    brownSourceRef.current = brown;
  }

  function start() {
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    buildGraph();
    fadeIn(fadeInMs).catch(() => {});
  }

  function stop() {
    fadeOut(fadeOutMs)
      .catch(() => {})
      .finally(() => {
        try {
          pinkSourceRef.current?.stop();
        } catch {}
        try {
          brownSourceRef.current?.stop();
        } catch {}
        pinkSourceRef.current = null;
        brownSourceRef.current = null;
      });
  }

  function fadeIn(durationMs = fadeInMs): Promise<void> {
    return new Promise((resolve) => {
      const ctx = ctxRef.current;
      const gain = gainRef.current;
      if (!ctx || !gain) {
        resolve();
        return;
      }
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(targetVolumeRef.current, now + durationMs / 1000);
      setTimeout(resolve, durationMs);
    });
  }

  function fadeOut(durationMs = fadeOutMs): Promise<void> {
    return new Promise((resolve) => {
      const ctx = ctxRef.current;
      const gain = gainRef.current;
      if (!ctx || !gain) {
        resolve();
        return;
      }
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
      setTimeout(resolve, durationMs);
    });
  }

  function setVolume(v: number) {
    targetVolumeRef.current = v;
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (ctx && gain) {
      gain.gain.setTargetAtTime(v, ctx.currentTime, 0.3);
    }
  }

  function isActive(): boolean {
    return !!(ctxRef.current && pinkSourceRef.current);
  }

  useEffect(() => {
    return () => {
      try {
        pinkSourceRef.current?.stop();
      } catch {}
      try {
        brownSourceRef.current?.stop();
      } catch {}
      try {
        ctxRef.current?.close();
      } catch {}
    };
  }, []);

  // 关键修复：用 useMemo 锁定返回对象，避免每次 render 返回新对象。
  // 否则依赖了这个对象引用的 useEffect cleanup 会反复触发，
  // 把刚启动的 TTS speechSynthesis.cancel() 掉 → 完全没声音。
  return useMemo(
    () => ({ start, stop, fadeIn, fadeOut, setVolume, isActive }),
    // 函数引用稳定（hook 内层用 useRef 闭包），所以这里依赖列表可以为空
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}
