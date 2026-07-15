import { useState, useEffect, useRef } from 'react';
import { Check, X, Lightbulb, RotateCcw } from 'lucide-react';

interface SpellInputProps {
  word: string;
  onCorrect: () => void;
  onWrong?: () => void;
}

export default function SpellInput({ word, onCorrect, onWrong }: SpellInputProps) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput('');
    setFeedback(null);
    setShowHint(false);
    setAttempts(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [word]);

  const handleCheck = () => {
    const correct = input.trim().toLowerCase() === word.toLowerCase();
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setTimeout(() => onCorrect(), 900);
    } else {
      setAttempts((a) => a + 1);
      onWrong?.();
      setTimeout(() => setFeedback(null), 900);
      if (attempts >= 1) setShowHint(true);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) handleCheck();
  };

  const hintDisplay = showHint
    ? word.split('').map((c, i) => i === 0 || i === word.length - 1 || i % 2 === 0 ? c.toUpperCase() : '_').join(' ')
    : word[0].toUpperCase() + ' _'.repeat(Math.max(1, word.length - 1));

  const correctClass = feedback === 'correct'
    ? 'border-kid-mint ring-4 ring-kid-mint/30 bg-green-50 animate-pop'
    : feedback === 'wrong'
    ? 'border-kid-coral ring-4 ring-kid-coral/30 bg-red-50 animate-shake'
    : '';

  return (
    <div className="card-kid border-4 border-kid-sky/30 space-y-4 bg-gradient-to-br from-kid-sky/5 via-white to-kid-mint/5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="title-kid text-lg md:text-xl text-kid-sky flex items-center gap-2">
          ✏️ 拼写练习
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHint((s) => !s)}
            className="tag-kid bg-kid-lemon/25 text-amber-700 hover:bg-kid-lemon/40 border border-kid-lemon/40 transition-all"
          >
            <Lightbulb size={16} />
            {showHint ? '隐藏提示' : '显示提示'}
          </button>
          <button
            onClick={() => {
              setInput('');
              setFeedback(null);
            }}
            className="tag-kid bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            <RotateCcw size={14} /> 清空
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-gradient-to-r from-kid-lemon/20 via-white to-kid-sky/20 border-2 border-dashed border-kid-lemon/60">
        <p className="font-kid text-sm text-kid-textLight mb-2">根据提示写出单词：</p>
        <p className="title-kid text-2xl md:text-3xl text-kid-text tracking-[0.3em] text-center py-2">
          {hintDisplay}
        </p>
        <p className="text-center text-xs font-kid text-kid-textLight mt-1">
          共 <span className="font-bold text-kid-coral">{word.length}</span> 个字母 · 尝试次数：{attempts}
        </p>
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="在这里输入单词..."
          className={`input-kid text-center !text-2xl md:!text-3xl !py-4 uppercase ${correctClass}`}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {feedback === 'correct' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute w-20 h-20 rounded-full bg-kid-mint/40 animate-star-burst" />
            <Check size={56} className="text-kid-mint relative z-10 animate-pop" strokeWidth={3.5} />
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <X size={44} className="text-kid-coral animate-pop" strokeWidth={3.5} />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          className="flex-1 btn-mint !text-base md:!text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Check size={20} /> 检查答案
        </button>
        {feedback === 'wrong' && attempts >= 2 && (
          <button
            onClick={() => {
              setInput(word);
              setFeedback('correct');
              setTimeout(() => onCorrect(), 900);
            }}
            className="btn-lavender"
          >
            看答案
          </button>
        )}
      </div>

      {feedback === 'correct' && (
        <p className="text-center font-kid text-lg text-kid-mint animate-pop">
          🎊 太棒了！拼写完全正确！你真厉害！
        </p>
      )}
      {feedback === 'wrong' && (
        <p className="text-center font-kid text-base text-kid-coral">
          🤔 再想想看，首字母是 <b>{word[0].toUpperCase()}</b> 哦～
        </p>
      )}
    </div>
  );
}
