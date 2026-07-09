/**
 * @file log 命令
 * @description 记录新事件到项目上下文日志。支持交互式输入和参数输入两种模式。
 *   自动关联相关事件、更新索引缓存，并在必要时触发自动摘要生成。
 *
 * @package project-mind
 */

import * as readline from 'readline';
import {EventType, ProjectEvent} from '../types';
import {ContextManager} from '../core/context-manager';

/**
 * 可接受的事件类型列表（用于命令行补全和校验）
 */
const VALID_EVENT_TYPES = Object.values(EventType);

/**
 * 执行 log 命令
 *
 * @param type - 事件类型
 * @param title - 事件标题
 * @param options - 命令行选项
 */
export async function execute(
  type: string,
  title: string,
  options: {
    description?: string;
    location?: string;
    tags?: string;
    outcome?: string;
    interactive?: boolean;
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

  // 验证事件类型
  if (!VALID_EVENT_TYPES.includes(type as EventType)) {
    console.error(`❌ 无效的事件类型: "${type}"`);
    console.error(`   有效类型: ${VALID_EVENT_TYPES.join(', ')}`);
    process.exit(1);
  }

  // 交互式输入模式
  let description = options.description || '';
  let location = options.location;
  let tags: string[] = options.tags ? options.tags.split(',').map((t) => t.trim()) : [];
  let outcome = options.outcome as ProjectEvent['outcome'] | undefined;

  if (options.interactive) {
    const answers = await interactiveInput(type, title);
    description = answers.description;
    location = answers.location || undefined;
    tags = answers.tags;
    outcome = answers.outcome;
  }

  if (!description) {
    console.error('❌ 事件描述不能为空。使用 --description 或 -i 交互模式提供描述。');
    process.exit(1);
  }

  // 查找关联事件
  const eventSourcing = cm.getEventSourcing();
  const relatedEvents = findRelatedEvents(eventSourcing.getAll(), type, title, tags);

  // 记录事件
  const event = await cm.recordEvent({
    type: type as EventType,
    title,
    description,
    location,
    tags,
    outcome,
    relatedEvents,
    metadata: {},
  });

  console.log(`✅ 事件已记录:`);
  console.log(`   ID: ${event.id}`);
  console.log(`   类型: ${event.type}`);
  console.log(`   标题: ${event.title}`);
  console.log(`   时间: ${event.timestamp}`);

  if (relatedEvents.length > 0) {
    console.log(`   关联事件: ${relatedEvents.length} 个`);
  }

  // 使用 Judgment Gate 检查是否需要警告
  const gate = cm.getJudgmentGate();
  const warnings = gate.getWarnings(`${title} ${description}`);
  if (warnings.length > 0) {
    console.log('');
    console.warn('⚠️  预操作检查发现以下警告:');
    for (const warning of warnings) {
      console.warn(`   - ${warning}`);
    }
  }
}

/**
 * 交互式输入模式
 *
 * 提示用户输入事件的详细信息和属性。
 *
 * @param type - 事件类型
 * @param title - 事件标题
 * @returns 用户输入的额外属性
 */
async function interactiveInput(
  type: string,
  title: string
): Promise<{
  description: string;
  location: string;
  tags: string[];
  outcome: ProjectEvent['outcome'] | undefined;
}> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };

  console.log(`\n📝 记录新事件:`);
  console.log(`   类型: ${type}`);
  console.log(`   标题: ${title}\n`);

  const description = await ask('事件描述: ');
  const location = await ask('关联文件路径 (可选): ');
  const tagsInput = await ask('标签 (逗号分隔, 可选): ');
  const outcomeInput = await ask('结果状态 (success/failed/partial/pending, 可选): ');

  rl.close();

  const tags = tagsInput
    ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  let outcome: ProjectEvent['outcome'] | undefined;
  if (['success', 'failed', 'partial', 'pending'].includes(outcomeInput)) {
    outcome = outcomeInput as ProjectEvent['outcome'];
  }

  return {
    description,
    location,
    tags,
    outcome,
  };
}

/**
 * 查找与新事件关联的历史事件
 *
 * 根据事件类型、标题关键词和标签，自动匹配相关事件。
 *
 * @param events - 所有历史事件
 * @param type - 新事件类型
 * @param title - 新事件标题
 * @param tags - 新事件标签
 * @returns 关联事件 ID 列表
 */
function findRelatedEvents(
  events: ProjectEvent[],
  type: string,
  title: string,
  tags: string[]
): string[] {
  const related: string[] = [];
  const titleKeywords = title.toLowerCase().split(/\s+/);

  for (const event of events) {
    let score = 0;

    // 相同类型的事件加分
    if (event.type === type) {
      score += 2;
    }

    // 标题关键词匹配加分
    const eventKeywords = event.title.toLowerCase().split(/\s+/);
    const keywordOverlap = titleKeywords.filter((kw) =>
      eventKeywords.includes(kw)
    ).length;
    score += keywordOverlap;

    // 标签匹配加分
    const tagOverlap = tags.filter((t) => event.tags.includes(t)).length;
    score += tagOverlap * 3;

    // 超过阈值视为关联
    if (score >= 3) {
      related.push(event.id);
    }
  }

  // 最多返回 5 个关联事件
  return related.slice(0, 5);
}