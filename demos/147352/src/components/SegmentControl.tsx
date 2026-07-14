interface SegmentControlProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

/**
 * 分段控件：填充背景 + 选中态白卡/品牌色。
 */
export default function SegmentControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentControlProps<T>) {
  return (
    <div
      className="flex overflow-hidden rounded-sm p-[3px]"
      style={{ background: "var(--fill)" }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-1 whitespace-nowrap rounded-[6px] py-[6px] text-center text-body active:opacity-80"
            style={{
              background: active ? "var(--bg-card)" : "transparent",
              color: active ? "var(--brand)" : "var(--text-2)",
              fontWeight: active ? 600 : 500,
              boxShadow: active ? "var(--shadow-1)" : "none",
              transition: "all 160ms cubic-bezier(.2,.8,.2,1)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
