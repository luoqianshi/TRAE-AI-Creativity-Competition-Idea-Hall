export default function ProgressBar({ current, total, items }) {
  if (!total || total === 0) return null;
  const pct = Math.round((current / total) * 100);
  const segments = items || [];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>{current} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
        {segments.length > 0 ? (
          segments.map((seg, i) => {
            const widthPct = (1 / total) * 100;
            let bg = 'bg-slate-100';
            if (seg.status === 'assessed' || seg.status === 'completed') bg = 'bg-green-500';
            else if (seg.status === 'skipped') bg = 'bg-slate-300';
            else if (seg.status === 'recording') bg = 'bg-blue-500 progress-pulse';
            return (
              <div key={i} className={`${bg} h-full`} style={{ width: `${widthPct}%` }} />
            );
          })
        ) : (
          <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}
