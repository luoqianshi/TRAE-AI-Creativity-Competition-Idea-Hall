const TRIAL_BUTTONS = [
  { value: '+', label: '+', color: 'bg-green-500 hover:bg-green-600 text-white', desc: '独立正确' },
  { value: '-', label: '-', color: 'bg-red-500 hover:bg-red-600 text-white', desc: '错误' },
  { value: 'P+', label: 'P+', color: 'bg-blue-500 hover:bg-blue-600 text-white', desc: '提示正确' },
  { value: 'P-', label: 'P-', color: 'bg-orange-500 hover:bg-orange-600 text-white', desc: '提示错误' },
];

export default function TrialInputPad({ onInput, disabled, trialCount, maxTrials = 10 }) {
  const isFull = trialCount >= maxTrials;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {TRIAL_BUTTONS.map(btn => (
          <button
            key={btn.value}
            type="button"
            disabled={disabled || isFull}
            onClick={() => onInput(btn.value)}
            className={`py-4 rounded-xl text-xl font-bold transition-all duration-100 active:scale-95 ${btn.color} ${
              (disabled || isFull) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div className="text-center text-xs text-slate-500">
        第 {trialCount}/{maxTrials} 回合
        {isFull && ' (已完成)'}
      </div>
    </div>
  );
}

export { TRIAL_BUTTONS };
