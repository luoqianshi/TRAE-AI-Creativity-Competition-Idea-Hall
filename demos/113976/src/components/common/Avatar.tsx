// 头像组件
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplayName } from '@/utils/helpers';
import type { Person } from '@/types';

interface AvatarProps {
  person: Person;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

export function Avatar({ person, size = 'md', className }: AvatarProps) {
  const name = getDisplayName(person);

  // 取姓名第一个字作为占位字符
  const placeholder = name === '待完善' ? '' : name[0] || '';

  // 背景色根据性别
  const bgColor =
    person.gender === 'male'
      ? 'bg-bamboo-100 text-bamboo-700'
      : person.gender === 'female'
        ? 'bg-cinnabar-100 text-cinnabar-600'
        : 'bg-xuan-200 text-ink-600';

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center font-serif font-medium shrink-0',
        sizeMap[size],
        bgColor,
        className,
      )}
    >
      {person.avatar ? (
        <img src={person.avatar} alt={name} className="w-full h-full object-cover" />
      ) : placeholder ? (
        <span className={textSizeMap[size]}>{placeholder}</span>
      ) : (
        <User size={size === 'sm' ? 16 : size === 'xl' ? 32 : 20} strokeWidth={1.5} />
      )}
    </div>
  );
}
