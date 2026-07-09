/**
 * @file review 命令
 * @description 生成 AI 对话开始时的"复盘上下文"。输出到 stdout，
 *   可被 AI 直接读取以快速恢复项目状态。包含项目概览、待办事项、
 *   最近活动、失败经验等关键信息。
 *
 *   使用场景：
 *   1. AI 在每次对话开始时执行 pmd review
 *   2. 输出内容直接作为 AI 的上下文输入
 *   3. 确保 AI 理解项目当前状态和历史
 *
 * @package project-mind
 */

import {ContextManager} from '../core/context-manager';

/**
 * 执行 review 命令
 *
 * 生成复盘上下文并输出到 stdout。如果指定 --save 选项，
 * 同时保存到 .pmd/review.md 文件。
 *
 * @param options - 命令行选项
 */
export async function execute(
  options: {
    save?: boolean;
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

  // 获取快照和摘要
  const [snapshot, summary] = await Promise.all([
    cm.getSnapshot(),
    cm.getAISummary(),
  ]);

  // 生成复盘上下文
  const summaryEngine = cm.getSummaryEngine();
  const reviewContext = summaryEngine.generateReviewContext(
    snapshot,
    summary
  );

  // 输出到 stdout
  console.log(reviewContext);

  // 如果指定 --save，保存到文件
  if (options.save) {
    const fs = await import('fs');
    const path = await import('path');
    const reviewPath = path.join(cm.getPmdDir(), 'review.md');
    fs.writeFileSync(reviewPath, reviewContext, 'utf-8');
    console.error(`\n📁 复盘上下文已保存到: ${reviewPath}`);
  }
}