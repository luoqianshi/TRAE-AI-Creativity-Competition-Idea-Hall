import { X, Trash2 } from 'lucide-react';
import { useCapsuleStore } from '@/store/capsuleStore';
import type { MindCapsule } from '@/types/capsule';

interface CapsuleDetailProps {
  capsule: MindCapsule;
  onClose: () => void;
}

export default function CapsuleDetail({ capsule, onClose }: CapsuleDetailProps) {
  const removeCapsule = useCapsuleStore((state) => state.removeCapsule);

  const handleDelete = () => {
    removeCapsule(capsule.id);
    onClose();
  };

  const date = new Date(capsule.createdAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg animate-in zoom-in-95 rounded-3xl border border-white/10 bg-[#1f1f35] p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{capsule.title}</h2>
            <p className="mt-1 text-sm text-indigo-200/50">{date}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-indigo-200/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {capsule.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-cyan-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="mb-3 text-sm font-semibold text-cyan-300">AI 摘要</p>
          <p className="text-indigo-100/80">{capsule.summary}</p>
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="mb-3 text-sm font-semibold text-indigo-200/60">完整内容</p>
          <p className="leading-relaxed text-white">{capsule.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-indigo-200/40">音频时长：{capsule.audioDuration}s</span>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
          >
            <Trash2 size={16} />
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
