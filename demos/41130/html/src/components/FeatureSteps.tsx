import { Mic, Sparkles, Library } from 'lucide-react';

const steps = [
  {
    icon: Mic,
    title: '语音记录',
    desc: '长按录音按钮，用最自然的方式说出灵感、课堂重点或会议随想。',
  },
  {
    icon: Sparkles,
    title: 'AI 整理',
    desc: '自动转写文本，提取关键词，生成摘要，将碎片信息结构化。',
  },
  {
    icon: Library,
    title: '卡片复习',
    desc: '在知识卡片墙中通过标签与搜索快速回顾，让灵感不再沉睡。',
  },
];

export default function FeatureSteps() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
      <h2 className="mb-14 text-center text-3xl font-bold text-white">三步封存灵感</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
              <step.icon size={28} />
            </div>
            <div className="absolute right-4 top-4 text-6xl font-black text-white/5 transition-colors group-hover:text-white/10">
              0{index + 1}
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
            <p className="text-indigo-100/70">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
