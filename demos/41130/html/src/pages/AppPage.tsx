import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Recorder from '@/components/Recorder';
import CapsuleWall from '@/components/CapsuleWall';

export default function AppPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#0f0f1a] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">录音工作台</h1>
            <p className="text-sm text-indigo-200/60">按住录音，AI 自动整理为知识卡片</p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
            <Recorder />
          </section>

          <section>
            <CapsuleWall />
          </section>
        </div>
      </div>
    </main>
  );
}
