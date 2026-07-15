import { Animal } from '../types';
import { Star, Zap } from 'lucide-react';

interface AnimalStatusProps {
  animal: Animal;
}

export const AnimalStatus = ({ animal }: AnimalStatusProps) => {
  const expProgress = (animal.exp / animal.maxExp) * 100;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-6xl animate-bounce-slow">{animal.emoji}</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{animal.name}</h2>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-sunny-yellow fill-sunny-yellow" />
            <span className="text-lg text-gray-700">等级 {animal.level}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-2 flex justify-between text-sm">
        <span className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-orange-500" />
          经验值
        </span>
        <span>{animal.exp} / {animal.maxExp}</span>
      </div>
      
      <div className="progress-bar bg-gray-200">
        <div
          className="progress-fill"
          style={{ width: `${expProgress}%` }}
        />
      </div>

      {animal.rewards.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">已获得奖励：</p>
          <div className="flex gap-2 flex-wrap">
            {animal.rewards.map((reward, index) => (
              <span
                key={index}
                className="text-2xl animate-sparkle"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {reward}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
