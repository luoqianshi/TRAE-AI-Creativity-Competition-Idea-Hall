interface GameOptionProps {
  option: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const GameOption = ({
  option,
  isSelected,
  isCorrect,
  isIncorrect,
  onClick,
  disabled = false,
}: GameOptionProps) => {
  const getOptionStyle = () => {
    if (isCorrect) return 'game-option correct';
    if (isIncorrect) return 'game-option incorrect';
    if (isSelected) return 'game-option bg-gray-200 selected';
    return 'game-option bg-white text-gray-700 hover:bg-gray-100';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getOptionStyle()} ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span className="flex items-center justify-center gap-2">
        {isCorrect && <span className="text-2xl">✅</span>}
        {isIncorrect && <span className="text-2xl">❌</span>}
        <span>{option}</span>
      </span>
    </button>
  );
};
