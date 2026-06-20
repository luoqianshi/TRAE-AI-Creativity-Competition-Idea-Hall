export function renderDiff(current: number, prev: number | null) {
  if (!prev)
    return (
      <span className="text-zinc-400 text-xs font-mono ml-2">-</span>
    );
  const diff = current - prev;
  if (prev === 0)
    return (
      <span className="text-zinc-400 text-xs font-mono ml-2">-</span>
    );
  const percent = ((Math.abs(diff) / prev) * 100).toFixed(1);
  if (diff > 0) {
    return (
      <div className="flex items-center text-red-500 text-xs font-bold font-mono ml-2 bg-red-50 px-1.5 py-0.5 rounded-md">
        ↑ {percent}%
      </div>
    );
  } else if (diff < 0) {
    return (
      <div className="flex items-center text-emerald-600 text-xs font-bold font-mono ml-2 bg-emerald-50 px-1.5 py-0.5 rounded-md">
        ↓ {percent}%
      </div>
    );
  }
  return (
    <span className="text-zinc-400 text-xs font-mono ml-2">-</span>
  );
}
