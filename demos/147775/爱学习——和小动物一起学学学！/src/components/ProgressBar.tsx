interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
}

export const ProgressBar = ({ progress, label, color = 'from-pink-400 via-orange-400 to-yellow-400' }: ProgressBarProps) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="text-gray-600">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out bg-gradient-to-r ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
