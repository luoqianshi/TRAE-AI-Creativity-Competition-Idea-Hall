interface StatCardProps {
  label: string;
  amount: number;
  count: string;
  type: "income" | "expense";
  onClick?: () => void;
}

/**
 * 统计卡：标签 + 大号金额 + 笔数说明。
 */
export default function StatCard({
  label,
  amount,
  count,
  type,
  onClick,
}: StatCardProps) {
  const sign = type === "income" ? "+" : "-";
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-borderbase bg-bgcard p-4 text-left active:opacity-80"
      style={{ transition: "opacity 120ms cubic-bezier(.2,.8,.2,1)" }}
    >
      <div className="text-caption text-text3 mb-1">{label}</div>
      <div
        className="tnum text-[28px] font-extrabold leading-tight"
        style={{ color: type === "income" ? "var(--income)" : "var(--expense)" }}
      >
        {sign}
        {amount.toLocaleString()}
      </div>
      <div className="mt-1 text-mini text-text3">{count}</div>
    </button>
  );
}
