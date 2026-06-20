import { 
  Wrench, 
  Smartphone, 
  Scissors, 
  BookOpen, 
  Running, 
  Palette, 
  Cat, 
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
import { Category } from '@/types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Wrench,
  Smartphone,
  Scissors,
  BookOpen,
  Running,
  Palette,
  Cat,
  MoreHorizontal,
};

export default function CategoryNav({ categories, selectedCategory, onSelect }: CategoryNavProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="grid grid-cols-4 gap-4">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon] || MoreHorizontal;
          const isSelected = selectedCategory === category.name;
          
          return (
            <button
              key={category.id}
              onClick={() => onSelect(isSelected ? null : category.name)}
              className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                isSelected 
                  ? 'bg-primary/10 scale-105' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isSelected 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium ${
                isSelected ? 'text-primary' : 'text-gray-600'
              }`}>
                {category.name}
              </span>
              {category.count > 0 && (
                <span className="text-xs text-gray-400">
                  {category.count}项
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}