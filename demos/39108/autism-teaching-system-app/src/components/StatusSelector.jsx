const STATUS_OPTIONS = [
  { value: 'not_mastered', score: 0, label: '未掌握', color: 'bg-red-100 border-red-400 text-red-700', activeColor: 'bg-red-500 border-red-600 text-white' },
  { value: 'partial', score: 0.5, label: '部分掌握', color: 'bg-amber-100 border-amber-400 text-amber-700', activeColor: 'bg-amber-500 border-amber-600 text-white' },
  { value: 'mastered', score: 1, label: '已掌握', color: 'bg-green-100 border-green-400 text-green-700', activeColor: 'bg-green-500 border-green-600 text-white' },
  { value: 'generalized', score: 1.5, label: '已泛化', color: 'bg-blue-100 border-blue-400 text-blue-700', activeColor: 'bg-blue-500 border-blue-600 text-white' },
];

export default function StatusSelector({ value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      {STATUS_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`w-full py-4 rounded-xl border-2 text-base font-semibold transition-all duration-150 active:scale-[0.98] ${
            value === opt.value ? opt.activeColor : opt.color
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export { STATUS_OPTIONS };
