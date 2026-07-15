interface StatCardProps {
  title: string;
  value: string | number;
  emoji: string;
  color: string;
}

export const StatCard = ({ title, value, emoji, color }: StatCardProps) => {
  return (
    <div className={`stat-card border-l-4 ${color}`}>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{emoji}</span>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};
