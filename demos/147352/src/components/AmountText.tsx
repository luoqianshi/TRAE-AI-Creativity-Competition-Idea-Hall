interface AmountTextProps {
  amount: number;
  type: "income" | "expense";
  size?: number;
  showSign?: boolean;
  prefix?: string;
}

/**
 * 金额文本：红正/灰负，等宽数字。
 */
export default function AmountText({
  amount,
  type,
  size = 18,
  showSign = true,
  prefix = "",
}: AmountTextProps) {
  const sign = showSign ? (type === "income" ? "+" : "-") : "";
  return (
    <span
      className="tnum whitespace-nowrap font-bold"
      style={{
        fontSize: size,
        color: type === "income" ? "var(--income)" : "var(--expense)",
      }}
    >
      {prefix}
      {sign}
      {Math.abs(amount).toLocaleString()}
    </span>
  );
}
