import { Search, Mic } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="relative flex items-center bg-white rounded-full shadow-sm border border-gray-100 px-4 py-3">
      <Search className="w-5 h-5 text-gray-400 mr-3" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索技能、服务..."
        className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
      />
      <button className="ml-2 p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
        <Mic className="w-4 h-4 text-primary" />
      </button>
    </div>
  );
}