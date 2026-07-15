import { useCallback, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useSpeech() {
  const { settings } = useAppStore();
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, opts?: { rate?: number; lang?: string }) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!settings.soundEnabled) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = opts?.lang || 'en-US';
        u.rate = opts?.rate ?? settings.speechRate;
        u.pitch = 1.1;
        u.volume = 1;
        utterRef.current = u;
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn('speak failed', e);
      }
    },
    [settings.soundEnabled, settings.speechRate]
  );

  const speakWord = useCallback(
    (word: string) => {
      speak(word, { lang: 'en-US' });
    },
    [speak]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, speakWord, stop };
}
