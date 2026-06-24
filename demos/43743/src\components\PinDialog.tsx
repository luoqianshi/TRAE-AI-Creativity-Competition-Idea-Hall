'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Delete } from 'lucide-react';
import { cn } from '@/utils/format';

interface PinDialogProps {
  open: boolean;
  title?: string;
  expectedLength?: number;
  onClose?: () => void;
  onSubmit: (pin: string) => void | Promise<void>;
  errorMessage?: string;
}

export function PinDialog({
  open,
  title = '请输入家长 PIN 码',
  expectedLength = 4,
  onClose,
  onSubmit,
  errorMessage,
}: PinDialogProps) {
  const [digits, setDigits] = useState<string[]>(Array(expectedLength).fill(''));
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) {
      setDigits(Array(expectedLength).fill(''));
      setShake(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    }
  }, [open, expectedLength]);

  function setDigitAt(i: number, v: string) {
    const ch = v.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = ch;
      return next;
    });
    if (ch && i < expectedLength - 1) {
      inputRefs.current[i + 1]?.focus();
    }
    // 全部填满自动提交
    if (ch && i === expectedLength - 1) {
      const full = [...digits];
      full[i] = ch;
      if (full.every((d) => d.length === 1)) {
        handleSubmit(full.join(''));
      }
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[i - 1] = '';
        return next;
      });
    }
  }

  async function handleSubmit(pin: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(pin);
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setDigits(Array(expectedLength).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } finally {
      setSubmitting(false);
    }
  }

  function onClear() {
    setDigits(Array(expectedLength).fill(''));
    inputRefs.current[0]?.focus();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(42, 42, 42, 0.45)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-7 relative"
            style={{ background: '#FFFEFB' }}
          >
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-sand)] transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--color-sand)' }}>
                <Lock className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <h2 className="font-serif-cn text-2xl font-semibold text-[var(--color-ink)] mt-2">
                {title}
              </h2>
              <p className="text-sm text-[var(--color-muted)]">默认 0000，可在家长中心修改</p>
            </div>

            <motion.div
              animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center gap-3 mb-3"
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigitAt(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={cn(
                    'w-14 h-16 rounded-2xl text-center text-3xl font-semibold tabular-nums',
                    'border-2 transition-colors',
                    d
                      ? 'border-[var(--color-accent)] bg-white text-[var(--color-ink)]'
                      : 'border-[var(--color-divider)] bg-[var(--color-paper)] text-transparent',
                    shake && 'border-[var(--color-accent)]',
                  )}
                  style={{ caretColor: 'transparent' }}
                />
              ))}
            </motion.div>

            {errorMessage && (
              <p className="text-center text-sm text-[var(--color-accent)] mb-2">{errorMessage}</p>
            )}

            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={onClear}
                className="text-sm text-[var(--color-muted)] flex items-center gap-1 hover:text-[var(--color-accent)] transition px-3 py-1.5"
              >
                <Delete className="w-4 h-4" /> 清除
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
