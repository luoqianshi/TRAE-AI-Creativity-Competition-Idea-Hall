import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2, Wand2 } from 'lucide-react';
import { simulateTranscription, createCapsuleFromTranscript } from '@/utils/mockAi';
import { useCapsuleStore } from '@/store/capsuleStore';

export default function Recorder() {
  const addCapsule = useCapsuleStore((state) => state.addCapsule);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [waveBars, setWaveBars] = useState<number[]>(new Array(24).fill(4));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setTranscript('');
    setDuration(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    waveIntervalRef.current = setInterval(() => {
      setWaveBars((prev) =>
        prev.map(() => Math.floor(Math.random() * 36) + 4)
      );
    }, 120);
  }, []);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    setIsProcessing(true);

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    setWaveBars(new Array(24).fill(4));

    const recordedDuration = Math.floor((Date.now() - startTimeRef.current) / 1000) || 1;
    const text = await simulateTranscription();
    setTranscript(text);
    setIsProcessing(false);
    setDuration(recordedDuration);
  }, []);

  const saveCapsule = useCallback(() => {
    if (!transcript) return;
    const capsule = createCapsuleFromTranscript(transcript, duration);
    addCapsule(capsule);
    setTranscript('');
    setDuration(0);
  }, [transcript, duration, addCapsule]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative flex h-48 items-center justify-center gap-1 sm:h-56">
        {waveBars.map((height, index) => (
          <div
            key={index}
            className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all duration-150"
            style={{ height: `${height}px` }}
          />
        ))}
        {isRecording && (
          <>
            <span className="absolute left-1/2 top-0 -translate-x-1/2 text-sm font-medium text-cyan-300">
              {formatDuration(duration)}
            </span>
            <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-indigo-500/20" />
          </>
        )}
      </div>

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={isProcessing}
        className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 active:scale-95 ${
          isRecording
            ? 'bg-red-500 shadow-red-500/50'
            : 'bg-gradient-to-br from-indigo-500 to-violet-500 shadow-indigo-500/50 hover:scale-110'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={32} />
        ) : isRecording ? (
          <Square size={28} />
        ) : (
          <Mic size={32} />
        )}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
            <span className="absolute -inset-4 rounded-full border border-red-400/30 animate-pulse" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-indigo-200/60">
        {isRecording ? '松开结束录音' : isProcessing ? 'AI 正在整理思绪…' : '按住按钮开始录音'}
      </p>

      {transcript && !isProcessing && (
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="mb-4 leading-relaxed text-white">{transcript}</p>
          <button
            onClick={saveCapsule}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            <Wand2 size={18} />
            生成知识卡片
          </button>
        </div>
      )}
    </div>
  );
}
