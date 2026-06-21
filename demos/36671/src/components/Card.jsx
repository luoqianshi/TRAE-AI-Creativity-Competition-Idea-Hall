export default function Card({ children, className = '', onClick, glass = true }) {
  return (
    <div
      className={`${glass ? 'glass-card' : 'bg-white/80'} p-5 shrink-0 ${onClick ? 'tap-active cursor-pointer glass-card-hover' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base font-bold text-text">{title}</h3>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardGroup({ children, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {children}
    </div>
  );
}
