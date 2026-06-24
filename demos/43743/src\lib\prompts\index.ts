// 按年龄段加载 prompt
import { AGE_1_3_SYSTEM } from './age-1-3';
import { AGE_3_4_SYSTEM } from './age-3-4';
import { AGE_4_6_SYSTEM } from './age-4-6';
import type { AgeGroup } from '@/types/story';

export const AGE_PROMPTS: Record<AgeGroup, string> = {
  '1-3': AGE_1_3_SYSTEM,
  '3-4': AGE_3_4_SYSTEM,
  '4-6': AGE_4_6_SYSTEM,
};

export function buildUserPrompt(theme: string, customPrompt?: string): string {
  if (customPrompt && customPrompt.trim().length > 0) {
    return `请围绕以下关键词创作一个儿童故事：${customPrompt.trim()}\n主题可参考：${theme || '不限'}。`;
  }
  if (theme) {
    return `请创作一个主题为"${theme}"的儿童故事。`;
  }
  return '请创作一个温柔的儿童故事，主题由你自由选择，但必须是孩子喜欢的小动物或日常场景。';
}
