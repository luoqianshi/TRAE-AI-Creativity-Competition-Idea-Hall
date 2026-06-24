import type { MindCapsule } from '@/types/capsule';

interface CapsuleCardProps {
  capsule: MindCapsule;
  onClick: () => void;
}

export default function CapsuleCard({ capsule, onClick }: CapsuleCardProps) {
  const date = new Date(capsule.createdAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl"
    >
      <h3 className="mb-2 text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
        {capsule.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-indigo-100/70">
        {capsule.summary}
      </p>
      <div className="flex flex-wrap gap-2">
        {capsule.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-indigo-200/40">
        <span>{date}</span>
        <span>{capsule.audioDuration}s</span>
      </div>
    </button>
  );
}
