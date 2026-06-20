import { Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';
import { usePlannerStore } from '@/store/plannerStore';

export default function ExportPanel() {
  const { scheduleResult } = usePlannerStore();
  const [copied, setCopied] = useState(false);

  if (!scheduleResult) return null;

  const generateText = () => {
    const lines = scheduleResult.blocks
      .filter((b) => b.taskId !== 'wakeup' && b.taskId !== 'sleep')
      .map((b) => {
        const prefix = b.completed ? '[x]' : '[ ]';
        return `${prefix} ${b.startTime}-${b.endTime} ${b.taskName}`;
      });
    return `AI日程计划表\n生成时间：${scheduleResult.createdAt}\n${'─'.repeat(30)}\n${lines.join('\n')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = generateText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    const scheduleEl = document.getElementById('schedule-preview');
    if (!scheduleEl) return;

    // Create a canvas-based export
    const canvas = document.createElement('canvas');
    const width = 600;
    const lineHeight = 36;
    const padding = 40;
    const taskBlocks = scheduleResult.blocks.filter(
      (b) => b.taskId !== 'wakeup' && b.taskId !== 'sleep'
    );
    const height = padding * 2 + taskBlocks.length * lineHeight + 60;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('AI日程计划表', padding, padding + 20);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(`生成时间：${scheduleResult.createdAt}`, padding, padding + 42);

    // Divider
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(padding, padding + 55);
    ctx.lineTo(width - padding, padding + 55);
    ctx.stroke();

    // Tasks
    taskBlocks.forEach((block, i) => {
      const y = padding + 70 + i * lineHeight;

      // Status circle
      ctx.fillStyle = block.completed ? '#10b981' : '#475569';
      ctx.beginPath();
      ctx.arc(padding + 6, y + 6, 6, 0, Math.PI * 2);
      ctx.fill();

      if (block.completed) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('✓', padding + 3, y + 9);
      }

      // Time
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText(`${block.startTime}-${block.endTime}`, padding + 20, y + 10);

      // Task name
      ctx.fillStyle = block.completed ? '#475569' : '#e2e8f0';
      ctx.font = `${block.completed ? '' : 'bold '}13px sans-serif`;
      ctx.fillText(block.taskName, padding + 140, y + 10);
    });

    // Download
    const link = document.createElement('a');
    link.download = `AI日程计划表_${new Date().toLocaleDateString('zh-CN')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-all duration-200"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        {copied ? '已复制' : '复制文本'}
      </button>
      <button
        onClick={handleDownloadImage}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-all duration-200"
      >
        <Download className="w-4 h-4" />
        导出图片
      </button>
    </div>
  );
}
