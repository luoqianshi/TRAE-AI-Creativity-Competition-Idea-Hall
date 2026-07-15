import { Animal } from '../types';
import { animalColors } from '../data/animals';

interface AnimalCardProps {
  animal: Animal;
  isSelected: boolean;
  onClick: () => void;
}

export const AnimalCard = ({ animal, isSelected, onClick }: AnimalCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`animal-card ${animalColors[animal.type]} ${isSelected ? 'selected' : ''}`}
    >
      <span className="animate-float">{animal.emoji}</span>
    </div>
  );
};
