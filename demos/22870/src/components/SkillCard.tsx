import { Star, MapPin } from 'lucide-react';
import { Skill } from '@/types';
import { formatDistance, formatPrice } from '@/utils/helpers';

interface SkillCardProps {
  skill: Skill;
  onClick?: () => void;
}

export default function SkillCard({ skill, onClick }: SkillCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
    >
      <div className="relative h-32">
        <img 
          src={skill.images[0]} 
          alt={skill.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-primary">
          {formatPrice(skill.price, skill.priceUnit)}
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <img 
            src={skill.user.avatar} 
            alt={skill.user.nickname}
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800 truncate">
              {skill.title}
            </h3>
            <p className="text-xs text-gray-500">
              {skill.user.nickname}
              {skill.user.isVerified && (
                <span className="ml-1 text-secondary">✓已认证</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-700">{skill.rating}</span>
            <span className="text-gray-400">({skill.serviceCount}次)</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{formatDistance(skill.distance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}