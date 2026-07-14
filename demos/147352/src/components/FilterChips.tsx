interface FilterChipsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}

/**
 * 横向滚动筛选 chips，选中态品牌红实心。
 */
export default function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-caption active:opacity-80"
            style={{
              background: active ? "var(--brand)" : "var(--bg-card)",
              color: active ? "#fff" : "var(--text-2)",
              border: active ? "none" : "1px solid var(--border)",
              fontWeight: active ? 500 : 400,
              transition: "opacity 120ms cubic-bezier(.2,.8,.2,1)",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
