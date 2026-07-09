/**
 * @file summarize 命令
 * @description 从事件日志生成 AI 复盘摘要。摘要包含项目状态概览、
 *   最近活动、未解决问题、待处理决策、经验教训、脆弱区域和失败尝试。
 *   输出到 .pmd/summary.md 文件，同时生成 review.md 供 AI 对话使用。
 *
 * @package project-mind
 */

import * as path from 'path';
import * as fs from 'fs';
import {ContextManager} from '../core/context-manager';

/**
 * 执行 summarize 命令
 *
 * @param options - 命令行选项
 */
export async function execute(
  options: {
    output?: string;
  } = {}
): Promise<void> {
  const projectRoot = process.cwd();
  const cm = new ContextManager(projectRoot);

  // 加载项目上下文
  try {
    await cm.load();
  } catch (error) {
    console.error(
      '❌ 无法加载项目上下文。请确保已在项目根目录运行 pmd init。'
    );
    console.error(`   原因: ${(error as Error).message}`);
    process.exit(1);
  }

  console.log('📊 正在生成 AI 复盘摘要...');

  // 获取项目快照和 AI 摘要
  const [snapshot, summary] = await Promise.all([
    cm.getSnapshot(),
    cm.getAISummary(),
  ]);

  // 设置输出路径（默认 .pmd/summary.md）
  const pmdDir = cm.getPmdDir();
  const summaryPath = options.output || path.join(pmdDir, 'summary.md');

  // 生成 Markdown 格式的摘要
  const markdown = generateSummaryMarkdown(snapshot, summary);

  // 写入文件
  fs.writeFileSync(summaryPath, markdown, 'utf-8');
  console.log(`✅ 复盘摘要已生成: ${summaryPath}`);

  // 同时生成 review.md
  const summaryEngine = cm.getSummaryEngine();
  const reviewContext = summaryEngine.generateReviewContext(snapshot, summary);
  const reviewPath = path.join(pmdDir, 'review.md');
  fs.writeFileSync(reviewPath, reviewContext, 'utf-8');
  console.log(`✅ 复盘上下文已生成: ${reviewPath}`);

  // 输出摘要概览到控制台
  console.log('\n📋 摘要概览:');
  console.log(`   项目状态: ${summary.projectState}`);
  console.log(`   未解决问题: ${summary.unresolvedIssues.length} 个`);
  console.log(`   待处理决策: ${summary.pendingDecisions.length} 项`);
  console.log(`   经验教训: ${summary.lessonsLearned.length} 条`);
  console.log(`   脆弱区域: ${summary.fragileAreas.length} 处`);
  console.log(`   失败尝试: ${summary.failedAttempts.length} 次`);
  console.log(`\n💡 下一步建议: ${summary.nextSuggestedAction}`);
}

/**
 * 生成 Markdown 格式的复盘摘要
 *
 * @param snapshot - 项目快照
 * @param summary - AI 复盘摘要
 * @returns Markdown 文本
 */
function generateSummaryMarkdown(
  snapshot: {name: string; version: string; lastUpdated: string; eventCount: number},
  summary: {
    projectState: string;
    recentActivity: string;
    unresolvedIssues: string[];
    pendingDecisions: string[];
    lessonsLearned: string[];
    fragileAreas: string[];
    failedAttempts: string[];
    nextSuggestedAction: string;
  }
): string {
  const lines: string[] = [
    `# AI 复盘摘要 - ${snapshot.name}`,
    '',
    `> **生成时间**: ${snapshot.lastUpdated}`,
    `> **项目版本**: ${snapshot.version}`,
    `> **事件总数**: ${snapshot.eventCount}`,
    '',
    '---',
    '',
    '## 项目状态',
    '',
    summary.projectState,
    '',
    '---',
    '',
    '## 最近活动',
    '',
    summary.recentActivity,
    '',
    '---',
    '',
  ];

  if (summary.unresolvedIssues.length > 0) {
    lines.push('## 未解决的问题', '');
    for (const issue of summary.unresolvedIssues) {
      lines.push(`- ⚠️ ${issue}`);
    }
    lines.push('', '---', '');
  }

  if (summary.pendingDecisions.length > 0) {
    lines.push('## 待处理的决策', '');
    for (const decision of summary.pendingDecisions) {
      lines.push(`- ❓ ${decision}`);
    }
    lines.push('', '---', '');
  }

  if (summary.lessonsLearned.length > 0) {
    lines.push('## 经验教训', '');
    for (const lesson of summary.lessonsLearned) {
      lines.push(`- 💡 ${lesson}`);
    }
    lines.push('', '---', '');
  }

  if (summary.fragileAreas.length > 0) {
    lines.push('## 脆弱区域', '');
    for (const area of summary.fragileAreas) {
      lines.push(`- 🔴 ${area}`);
    }
    lines.push('', '---', '');
  }

  if (summary.failedAttempts.length > 0) {
    lines.push('## 失败的尝试', '');
    lines.push('> 以下方案已尝试但失败，请 AI 避免重复尝试。', '');
    for (const attempt of summary.failedAttempts) {
      lines.push(`- ❌ ${attempt}`);
    }
    lines.push('', '---', '');
  }

  lines.push('## 下一步建议', '');
  lines.push(summary.nextSuggestedAction);
  lines.push('');
  lines.push('---');
  lines.push(
    '> 此摘要由 ProjectMind 自动生成。运行 `pmd summarize` 更新。'
  );

  return lines.join('\n');
}