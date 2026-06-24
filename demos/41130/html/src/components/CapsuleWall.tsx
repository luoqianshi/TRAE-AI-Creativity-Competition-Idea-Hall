import { useState } from 'react';
import { Search, Tag, X } from 'lucide-react';
import { useCapsuleStore } from '@/store/capsuleStore';
import CapsuleCard from './CapsuleCard';
import CapsuleDetail from './CapsuleDetail';
import type { MindCapsule } from '@/types/capsule';

export default function CapsuleWall() {
  const capsules = useCapsuleStore((state) => state.capsules);
  const filterTag = useCapsuleStore((state) => state.filterTag);
  const setFilterTag = useCapsuleStore((state) => state.setFilterTag);
  const searchQuery = useCapsuleStore((state) => state.searchQuery);
  const setSearchQuery = useCapsuleStore((state) => state.setSearchQuery);
  const [selectedCapsule, setSelectedCapsule] = useState<MindCapsule | null>(null);

  const allTags = Array.from(new Set(capsules.flatMap((c) => c.tags)));

  const filteredCapsules = capsules.filter((capsule) => {
    const matchesTag = filterTag ? capsule.tags.includes(filterTag) : true;
    const matchesSearch =
      !searchQuery ||
      capsule.title.includes(searchQuery) ||
      capsule.content.includes(searchQuery) ||
      capsule.tags.some((tag) => tag.includes(searchQuery));
    return matchesTag && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1a1a2e]/90 p-4 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200/40" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索标题、内容或标签…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-white placeholder:text-indigo-200/40 focus:border-indigo-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200/60 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Tag size={16} className="shrink-0 text-indigo-200/50" />
            <button
              onClick={() => setFilterTag(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterTag === null
                  ? 'bg-indigo-500 text-white'
                  : 'border border-white/10 bg-white/5 text-indigo-100/70 hover:bg-white/10'
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterTag === tag
                    ? 'bg-cyan-500 text-white'
                    : 'border border-white/10 bg-white/5 text-indigo-100/70 hover:bg-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredCapsules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-20 text-center">
          <p className="text-lg font-medium text-white">还没有胶囊</p>
          <p className="mt-2 text-sm text-indigo-200/60">
            {capsules.length === 0 ? '在左侧按住录音按钮，封存你的第一条灵感吧' : '没有符合筛选条件的胶囊'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCapsules.map((capsule) => (
            <CapsuleCard
              key={capsule.id}
              capsule={capsule}
              onClick={() => setSelectedCapsule(capsule)}
            />
          ))}
        </div>
      )}

      {selectedCapsule && (
        <CapsuleDetail
          capsule={selectedCapsule}
          onClose={() => setSelectedCapsule(null)}
        />
      )}
    </div>
  );
}
