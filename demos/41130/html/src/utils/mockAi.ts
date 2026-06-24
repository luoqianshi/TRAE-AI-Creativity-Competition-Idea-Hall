import type { MindCapsule } from '@/types/capsule';

const SAMPLE_TRANSCRIPTS = [
  '今天看了一篇关于深度学习的论文，提到 Transformer 的注意力机制可以类比人类阅读时的聚焦过程，值得后面做一个类比图帮助理解。',
  '下班路上想到，做一个提醒喝水的小组件，结合番茄钟，每 25 分钟提醒起身和补水，界面用玻璃拟态应该不错。',
  '组会记录：下周三要提交原型图，小李负责用户调研，我负责交互流程，记得把 Figma 链接同步到群里。',
  '短视频选题：AI 辅助代码审查的利与弊，重点讲如何保持人的判断力，不要变成完全依赖工具。',
  '读书笔记：习惯的力量在于触发器，设计产品时应该把核心动作放在用户已有习惯之后，降低启动成本。',
];

const TAG_POOL = ['灵感', '学习', '工作', '产品', '设计', '技术', '读书', '健康', '选题', '会议'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractTags(text: string): string[] {
  const tags = TAG_POOL.filter((tag) => text.includes(tag));
  if (tags.length === 0) {
    tags.push(pickRandom(TAG_POOL));
  }
  if (tags.length < 2) {
    const extra = pickRandom(TAG_POOL.filter((t) => !tags.includes(t)));
    tags.push(extra);
  }
  return tags.slice(0, 3);
}

function generateTitle(text: string): string {
  const phrases = text.split(/[，。；]/);
  const first = phrases[0].trim();
  return first.length > 20 ? `${first.slice(0, 18)}…` : first;
}

function generateSummary(text: string): string {
  return text.length > 60 ? `${text.slice(0, 58)}…` : text;
}

export function simulateTranscription(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(pickRandom(SAMPLE_TRANSCRIPTS));
    }, 1800);
  });
}

export function createCapsuleFromTranscript(
  transcript: string,
  duration: number
): MindCapsule {
  return {
    id: generateId(),
    title: generateTitle(transcript),
    content: transcript,
    summary: generateSummary(transcript),
    tags: extractTags(transcript),
    createdAt: Date.now(),
    audioDuration: duration,
  };
}
