import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Clock, Target, CheckCircle, XCircle, Lightbulb, Send, ListChecks, PenLine } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ChoiceOption from '../components/ChoiceOption/ChoiceOption';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import { GRADE_LABELS, type GradeCategory, type ChoiceQuestion, type FillQuestion, type TestQuestion } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import StarRating from '../components/StarRating/StarRating';

export default function TestPage() {
  const navigate = useNavigate();
  const { currentTestSession, generateTest, answerQuestion, finishTest, settings, setSelectedGrade, setLastResultId } = useAppStore();
  const { speakWord } = useSpeech();

  const [feedbackStates, setFeedbackStates] = useState<Record<number, Record<number, 'idle' | 'correct' | 'wrong' | 'selected'>>>({});
  const [fillInput, setFillInput] = useState('');
  const [fillChecked, setFillChecked] = useState<null | { correct: boolean; correctAnswer: string }>(null);
  const [showFillHint, setShowFillHint] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // 如果没有session，显示测试配置
  const isConfigure = !currentTestSession;

  // 计时
  useEffect(() => {
    if (isConfigure) return;
    const start = Date.now();
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [isConfigure]);

  const questions: TestQuestion[] = currentTestSession?.questions || [];
  const currentIndex = currentTestSession?.currentIndex ?? 0;
  const q = questions[currentIndex];

  const correctCount = currentTestSession?.results.filter(Boolean).length ?? 0;

  const handleSelect = (optionIndex: number) => {
    if (!q || q.type !== 'choice') return;
    const prevStates = feedbackStates[currentIndex] || {};
    if (prevStates[optionIndex]) return;
    const { correct, correctAnswer } = answerQuestion(currentIndex, optionIndex);
    const states: Record<number, 'idle' | 'correct' | 'wrong' | 'selected'> = {};
    q.options.forEach((_, i) => {
      if (i === optionIndex) {
        states[i] = correct ? 'correct' : 'wrong';
      } else if (i === (correctAnswer as number)) {
        states[i] = correct ? 'idle' : 'correct';
      } else {
        states[i] = 'idle';
      }
    });
    setFeedbackStates((s) => ({ ...s, [currentIndex]: states }));
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        handleFinish();
      }
    }, 1300);
  };

  const handleFillCheck = () => {
    if (!q || q.type !== 'fill' || !fillInput.trim()) return;
    const { correct, correctAnswer } = answerQuestion(currentIndex, fillInput);
    setFillChecked({ correct, correctAnswer: correctAnswer as string });
    setTimeout(() => {
      setFillInput('');
      setFillChecked(null);
      setShowFillHint(false);
      if (currentIndex + 1 >= questions.length) {
        handleFinish();
      }
    }, 1500);
  };

  const handleFinish = () => {
    const record = finishTest();
    if (record) {
      navigate(`/test/result?id=${record.id}`);
    }
  };

  const handleStart = (type: 'choice' | 'fill', count: number) => {
    const ok = generateTest(type, count, settings.selectedGrade);
    if (!ok) {
      alert('单词量不足，请先添加更多单词或选择其他年级～');
    }
    setLastResultId(null);
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  // 配置界面
  if (isConfigure) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-kid font-kid font-bold text-sm text-kid-text hover:scale-105 transition-all"
          >
            <ArrowLeft size={18} /> 返回首页
          </button>
        </div>

        <div className="card-gradient bg-gradient-to-br from-kid-coral via-kid-lemon to-kid-mint text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-stripes opacity-20" />
          <div className="absolute -right-10 -top-10 text-[140px] opacity-20 animate-float">🎯</div>
          <div className="relative py-4 md:py-6">
            <h2 className="title-kid text-3xl md:text-5xl text-stroke mb-2">准备好挑战了吗？🎮</h2>
            <p className="font-kid text-base md:text-lg opacity-95">选择测试类型和题目数量，看看你掌握了多少单词！</p>
          </div>
        </div>

        <div className="card-kid">
          <h3 className="title-kid text-xl mb-4 text-kid-sky flex items-center gap-2">
            <Target size={22} /> 选择年级范围
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] as const).map((g, i) => {
              const active = settings.selectedGrade === g;
              const gradients = [
                'from-gray-400 to-gray-500',
                'from-kid-sky to-blue-400',
                'from-kid-mint to-green-400',
                'from-kid-lemon to-yellow-400',
                'from-kid-coral to-orange-400',
                'from-kid-lavender to-purple-400',
                'from-kid-pink to-rose-400',
              ];
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-4 py-2.5 rounded-xl font-kid font-bold text-sm md:text-base transition-all ${
                    active
                      ? `bg-gradient-to-br ${gradients[i]} text-white shadow-kid scale-105`
                      : 'bg-gray-100 text-kid-text hover:bg-gray-200'
                  }`}
                >
                  {g === 'all' ? '🌟 全部年级' : GRADE_LABELS[g]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="card-gradient bg-gradient-to-br from-kid-sky via-blue-400 to-indigo-500 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 text-9xl opacity-20 animate-wiggle">🎯</div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-3xl shadow-kid">
                  <ListChecks size={28} />
                </div>
                <div>
                  <h3 className="title-kid text-2xl text-stroke">选择题</h3>
                  <p className="font-kid text-sm opacity-95">四选一，看单词选意思</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleStart('choice', n)}
                    className="px-4 py-2.5 rounded-xl bg-white text-kid-sky font-kid font-bold shadow-kid hover:scale-105 active:scale-95 transition-all"
                  >
                    {n} 题
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-gradient bg-gradient-to-br from-kid-mint via-green-400 to-teal-500 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 text-9xl opacity-20 animate-float">✏️</div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-3xl shadow-kid">
                  <PenLine size={28} />
                </div>
                <div>
                  <h3 className="title-kid text-2xl text-stroke">填空题</h3>
                  <p className="font-kid text-sm opacity-95">看中文释义拼写单词</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[5, 8, 10, 15].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleStart('fill', n)}
                    className="px-4 py-2.5 rounded-xl bg-white text-green-600 font-kid font-bold shadow-kid hover:scale-105 active:scale-95 transition-all"
                  >
                    {n} 题
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = questions.length === 0 ? 0 : Math.round((currentIndex / questions.length) * 100);

  return (
    <div className="space-y-5">
      <div className="card-kid py-3 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => {
            if (confirm('确定要退出当前测试吗？进度将不保存。')) {
              setLastResultId(null);
              // 清session通过finish一个新的
              finishTest();
              navigate('/test');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-kid font-bold text-sm text-kid-text transition-all"
        >
          <ArrowLeft size={18} /> 退出测试
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="tag-kid bg-kid-sky/20 text-kid-sky">
            <Target size={16} /> {currentTestSession.testType === 'choice' ? '选择题' : '填空题'}
          </span>
          <span className="tag-kid bg-kid-lemon/30 text-amber-700">
            <Clock size={16} /> {mm}:{ss}
          </span>
          <span className="tag-kid bg-kid-mint/25 text-green-700">
            <CheckCircle size={16} /> 答对 {correctCount}
          </span>
          <span className="tag-kid bg-kid-coral/25 text-kid-coral">
            <XCircle size={16} /> 答错 {currentIndex - correctCount}
          </span>
        </div>
      </div>

      <div className="card-kid py-3 space-y-2">
        <div className="flex items-center justify-between text-sm md:text-base font-kid">
          <span>题目进度</span>
          <span className="font-bold">{Math.min(currentIndex + 1, questions.length)} / {questions.length}</span>
        </div>
        <ProgressBar value={progressPct} color="coral" size="lg" />
      </div>

      {q && (
        <div key={currentIndex} className="animate-slide-in-right space-y-5">
          {q.type === 'choice' ? (
            <ChoiceRender
              q={q as ChoiceQuestion}
              states={feedbackStates[currentIndex] || {}}
              onSelect={handleSelect}
              onSpeak={() => speakWord(q.questionWord)}
            />
          ) : (
            <FillRender
              q={q as FillQuestion}
              value={fillInput}
              onChange={setFillInput}
              onSubmit={handleFillCheck}
              checked={fillChecked}
              showHint={showFillHint}
              toggleHint={() => setShowFillHint((s) => !s)}
              onKey={(e) => e.key === 'Enter' && handleFillCheck()}
            />
          )}
        </div>
      )}

      {/* 结束按钮 */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            if (confirm('确定要提前结束测试吗？')) handleFinish();
          }}
          className="btn-lavender"
        >
          提前交卷
        </button>
      </div>
    </div>
  );
}

function ChoiceRender({
  q,
  states,
  onSelect,
  onSpeak,
}: {
  q: ChoiceQuestion;
  states: Record<number, 'idle' | 'correct' | 'wrong' | 'selected'>;
  onSelect: (i: number) => void;
  onSpeak: () => void;
}) {
  const prefixes = ['A', 'B', 'C', 'D'];
  const hasAnswer = Object.values(states).some((v) => v === 'correct' || v === 'wrong');

  return (
    <>
      <div className="card-gradient bg-gradient-to-br from-kid-sky via-blue-300 to-kid-lavender text-white relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-stripes opacity-20" />
        <div className="absolute -right-4 top-4 text-8xl opacity-25 animate-float">💡</div>
        <div className="relative">
          <p className="font-kid text-sm md:text-base opacity-90 mb-3 flex items-center gap-2">
            🎯 第 {q.questionType === 'meaning' ? '1' : '2'} 类 · {q.questionType === 'meaning' ? '英→中' : '中→英'}
          </p>
          <div className="flex items-start md:items-center gap-4 flex-wrap">
            <h2 className="title-kid text-2xl md:text-4xl leading-snug">
              {q.question}
            </h2>
            {q.questionType === 'meaning' && (
              <button
                onClick={onSpeak}
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 shadow-kid hover:scale-110 active:scale-95 transition-all shrink-0"
                title="听单词发音"
              >
                <Volume2 size={26} strokeWidth={2.5} />
              </button>
            )}
          </div>
          {q.questionType === 'meaning' && (
            <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/30 backdrop-blur-sm border-2 border-white/50">
              <span className="text-4xl md:text-5xl animate-bounce-slow">{/* emoji placeholder */}📖</span>
              <span className="title-kid text-3xl md:text-5xl text-stroke">{q.questionWord}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {q.options.map((opt, i) => (
          <ChoiceOption
            key={i}
            index={i}
            label={opt}
            prefix={prefixes[i]}
            state={states[i] || 'idle'}
            disabled={hasAnswer}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>

      {hasAnswer && (
        <div className="text-center animate-pop">
          {Object.values(states).includes('correct') && !Object.values(states).includes('wrong') ? null : null}
        </div>
      )}
    </>
  );
}

function FillRender({
  q,
  value,
  onChange,
  onSubmit,
  checked,
  showHint,
  toggleHint,
  onKey,
}: {
  q: FillQuestion;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  checked: null | { correct: boolean; correctAnswer: string };
  showHint: boolean;
  toggleHint: () => void;
  onKey: (e: React.KeyboardEvent) => void;
}) {
  const disabled = checked !== null;

  return (
    <>
      <div className="card-gradient bg-gradient-to-br from-kid-mint via-green-300 to-kid-sky text-white relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-stripes opacity-20" />
        <div className="absolute -right-4 top-4 text-8xl opacity-25 animate-wiggle">✨</div>
        <div className="relative space-y-4">
          <p className="font-kid text-sm md:text-base opacity-90 flex items-center gap-2">
            ✏️ 填空题 · 请根据中文意思拼写单词
          </p>
          <h2 className="title-kid text-2xl md:text-4xl leading-snug flex items-center gap-3 flex-wrap">
            中文：
            <span className="inline-block px-5 py-2.5 rounded-2xl bg-white/30 backdrop-blur-sm border-2 border-white/50">
              {q.meaning}
            </span>
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-kid text-base md:text-lg">首字母提示：</span>
            <span className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/35 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center title-kid text-3xl md:text-4xl shadow-inner">
              {q.firstLetter}
            </span>
            <span className="font-kid opacity-90">共 {q.answer.length} 个字母</span>
          </div>
          {showHint && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-kid-lemon/40 text-amber-900 font-kid font-bold animate-pop border-2 border-kid-lemon/60">
              <Lightbulb size={18} />
              提示：{q.hint}
            </div>
          )}
        </div>
      </div>

      <div className="card-kid space-y-4">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          disabled={disabled}
          placeholder="在这里输入完整的英文单词..."
          className={`input-kid !text-2xl md:!text-3xl !text-center uppercase ${
            checked
              ? checked.correct
                ? '!border-kid-mint !ring-4 !ring-kid-mint/30 !bg-green-50 animate-pop'
                : '!border-kid-coral !ring-4 !ring-kid-coral/30 !bg-red-50 animate-shake'
              : ''
          }`}
          spellCheck={false}
        />
        {checked && (
          <div className={`p-4 rounded-2xl font-kid text-base md:text-lg flex items-center gap-3 animate-pop ${
            checked.correct ? 'bg-green-50 text-green-700 border-2 border-green-300' : 'bg-red-50 text-red-700 border-2 border-red-300'
          }`}>
            {checked.correct ? (
              <>
                <CheckCircle size={28} />
                <span>太棒了！拼写完全正确！🎉</span>
              </>
            ) : (
              <>
                <XCircle size={28} />
                <span>正确答案是：<b className="text-2xl">{checked.correctAnswer}</b>，下次加油哦～</span>
              </>
            )}
          </div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={toggleHint}
            disabled={disabled}
            className="tag-kid bg-kid-lemon/30 text-amber-700 hover:bg-kid-lemon/50 disabled:opacity-50 border border-kid-lemon/50"
          >
            <Lightbulb size={16} /> {showHint ? '隐藏提示' : '显示提示'}
          </button>
          <button
            onClick={onSubmit}
            disabled={!value.trim() || disabled}
            className="btn-mint !text-base md:!text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send size={20} /> 提交答案
          </button>
        </div>
      </div>
    </>
  );
}

// 静默导出StarRating防止打包警告
export { StarRating };
