/**
 * @file 摘要生成引擎
 * @description 从事件日志中智能分析并生成结构化的 AI 复盘摘要。
 *   核心能力包括：
 *   - 从事件流中提取项目的整体状态描述
 *   - 识别最近活动的模式和趋势
 *   - 检测重复错误和高频修改区域
 *   - 按优先级排列待处理问题
 *   - 生成可供 AI 下一轮对话使用的"复盘上下文"
 *
 * @package project-mind
 */

import {
  ProjectEvent,
  EventType,
  AISummary,
  ProjectSnapshot,
} from '../types';

/**
 * 摘要生成引擎
 *
 * 分析事件日志并提供结构化的分析摘要。当事件数量超过阈值时，
 * 自动触发摘要生成以压缩和提炼关键信息。
 */
export class SummaryEngine {
  /**
   * 从事件列表生成 AI 复盘摘要
   *
   * @param events - 项目事件列表
   * @returns 结构化的 AI 复盘摘要
   */
  generateSummary(events: ProjectEvent[]): AISummary {
    // 按时间排序事件
    const sortedEvents = [...events].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 提取最近的事件（最新的 10 条）
    const recentEvents = sortedEvents.slice(-10).reverse();

    // 提取各类事件用于分析
    const failedEvents = events.filter((e) => e.outcome === 'failed');
    const pendingEvents = events.filter((e) => e.outcome === 'pending');
    const bugEvents = events.filter((e) => e.type === EventType.BUG);
    const decisionEvents = events.filter(
      (e) =>
        e.type === EventType.DECISION || e.type === EventType.ARCHITECTURE
    );

    // 检测模式：高频修改的文件
    const fileModificationCount = new Map<string, number>();
    for (const event of events) {
      if (event.location) {
        const count = fileModificationCount.get(event.location) ?? 0;
        fileModificationCount.set(event.location, count + 1);
      }
    }

    // 找出修改次数最多的文件（脆弱区域候选）
    const fragileAreas = [...fileModificationCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([file, count]) => `${file} (修改 ${count} 次)`);

    // 检测重复模式：相同或相似标题的失败事件
    const failedAttempts = this.detectFailedPatterns(failedEvents);

    // 检测未解决的问题
    const unresolvedIssues = this.detectUnresolvedIssues(
      bugEvents,
      pendingEvents
    );

    // 待处理的决策
    const pendingDecisions = decisionEvents
      .filter((e) => e.outcome === 'pending' || !e.outcome)
      .map((e) => `[${e.type}] ${e.title}: ${e.description}`);

    // 经验教训：从失败事件和复盘事件中提取
    const lessonsLearned = this.extractLessons(events);

    // 项目状态描述
    const projectState = this.describeProjectState(events);

    // 最近活动描述
    const recentActivity = this.describeRecentActivity(recentEvents);

    // 建议下一步操作
    const nextSuggestedAction = this.suggestNextAction(
      pendingEvents,
      bugEvents,
      failedEvents
    );

    return {
      projectState,
      recentActivity,
      unresolvedIssues,
      pendingDecisions,
      lessonsLearned,
      fragileAreas,
      failedAttempts,
      nextSuggestedAction,
    };
  }

  /**
   * 生成 Review 上下文
   *
   * 用于 AI 对话开始时的"复盘上下文"。包含项目状态概览、
   * 待办事项和失败经验。
   *
   * @param snapshot - 项目快照
   * @param summary - AI 复盘摘要
   * @returns Markdown 格式的 review 上下文文本
   */
  generateReviewContext(
    snapshot: ProjectSnapshot,
    summary: AISummary
  ): string {
    const lines: string[] = [
      `# 项目复盘上下文 - ${snapshot.name}`,
      '',
      `> 生成时间: ${snapshot.lastUpdated}`,
      `> 事件总数: ${snapshot.eventCount}`,
      '',
      '---',
      '',
      '## 项目概述',
      '',
      `- **项目名称**: ${snapshot.name}`,
      `- **版本**: ${snapshot.version}`,
      `- **技术栈**: ${snapshot.techStack.join(', ') || '未配置'}`,
      '',
      '## 当前状态',
      '',
      summary.projectState,
      '',
      '## 最近活动',
      '',
      summary.recentActivity,
      '',
    ];

    if (summary.unresolvedIssues.length > 0) {
      lines.push('## 未解决的问题', '');
      for (const issue of summary.unresolvedIssues) {
        lines.push(`- ⚠️ ${issue}`);
      }
      lines.push('');
    }

    if (summary.pendingDecisions.length > 0) {
      lines.push('## 待处理的决策', '');
      for (const decision of summary.pendingDecisions) {
        lines.push(`- ❓ ${decision}`);
      }
      lines.push('');
    }

    if (summary.lessonsLearned.length > 0) {
      lines.push('## 经验教训', '');
      for (const lesson of summary.lessonsLearned) {
        lines.push(`- 💡 ${lesson}`);
      }
      lines.push('');
    }

    if (summary.failedAttempts.length > 0) {
      lines.push('## 失败的尝试（避免重复）', '');
      for (const attempt of summary.failedAttempts) {
        lines.push(`- ❌ ${attempt}`);
      }
      lines.push('');
    }

    if (summary.fragileAreas.length > 0) {
      lines.push('## 脆弱区域', '');
      for (const area of summary.fragileAreas) {
        lines.push(`- 🔴 ${area}`);
      }
      lines.push('');
    }

    lines.push('## 下一步建议', '');
    lines.push(summary.nextSuggestedAction);
    lines.push('');
    lines.push('---');
    lines.push(
      '> 此上下文由 ProjectMind 自动生成，用于 AI 快速恢复项目状态。'
    );

    return lines.join('\n');
  }

  /**
   * 检测事件中的模式
   *
   * 识别重复错误、高频修改文件等模式。
   *
   * @param events - 事件列表
   * @returns 检测到的模式列表
   */
  detectPatterns(events: ProjectEvent[]): string[] {
    const patterns: string[] = [];

    // 检测失败事件中的重复模式
    const failedEvents = events.filter((e) => e.outcome === 'failed');
    const failedTitleCount = new Map<string, number>();
    for (const event of failedEvents) {
      // 提取核心关键词（移除时间戳等动态部分）
      const key = event.title.replace(/\[\d{4}-\d{2}-\d{2}\]/g, '').trim();
      const count = failedTitleCount.get(key) ?? 0;
      failedTitleCount.set(key, count + 1);
    }

    for (const [title, count] of failedTitleCount) {
      if (count > 1) {
        patterns.push(
          `重复失败模式: "${title}" 失败了 ${count} 次`
        );
      }
    }

    // 检测高频修改的文件
    const fileCount = new Map<string, number>();
    for (const event of events) {
      if (event.location) {
        const count = fileCount.get(event.location) ?? 0;
        fileCount.set(event.location, count + 1);
      }
    }

    for (const [file, count] of fileCount) {
      if (count > 3) {
        patterns.push(
          `高频修改文件: ${file} 被修改了 ${count} 次，可能是脆弱区域`
        );
      }
    }

    return patterns;
  }

  /**
   * 按优先级排列问题
   *
   * @param events - 事件列表
   * @returns 按优先级排序的问题列表（高优先级在前）
   */
  prioritizeIssues(events: ProjectEvent[]): string[] {
    const prioritized: string[] = [];

    // 1. 高优先级：活跃的 Bug
    const activeBugs = events.filter(
      (e) =>
        e.type === EventType.BUG &&
        (e.outcome === 'pending' || e.outcome === 'failed')
    );
    for (const bug of activeBugs) {
      prioritized.push(`[高优先级] Bug: ${bug.title}`);
    }

    // 2. 中优先级：待处理的决策和性能问题
    const pendingDecisions = events.filter(
      (e) =>
        (e.type === EventType.DECISION || e.type === EventType.ARCHITECTURE) &&
        e.outcome === 'pending'
    );
    for (const decision of pendingDecisions) {
      prioritized.push(`[中优先级] 待决策: ${decision.title}`);
    }

    const perfIssues = events.filter(
      (e) =>
        e.type === EventType.PERF_ISSUE &&
        (e.outcome === 'pending' || e.outcome === 'partial')
    );
    for (const perf of perfIssues) {
      prioritized.push(`[中优先级] 性能问题: ${perf.title}`);
    }

    // 3. 低优先级：待处理的功能开发
    const pendingFeatures = events.filter(
      (e) =>
        e.type === EventType.FEATURE && e.outcome === 'pending'
    );
    for (const feature of pendingFeatures) {
      prioritized.push(`[低优先级] 待开发: ${feature.title}`);
    }

    return prioritized;
  }

  /**
   * 检测失败事件的重复模式
   *
   * @param failedEvents - 所有失败事件
   * @returns 去重后的失败尝试描述列表
   */
  private detectFailedPatterns(failedEvents: ProjectEvent[]): string[] {
    const seen = new Set<string>();
    const attempts: string[] = [];

    for (const event of failedEvents) {
      // 用标题去重，避免重复报告相同的失败
      const key = event.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        attempts.push(`${event.title}: ${event.description}`);
      }
    }

    return attempts;
  }

  /**
   * 检测未解决的问题
   *
   * @param bugEvents - Bug 事件
   * @param pendingEvents - 待处理事件
   * @returns 未解决问题描述列表
   */
  private detectUnresolvedIssues(
    bugEvents: ProjectEvent[],
    pendingEvents: ProjectEvent[]
  ): string[] {
    const issues: string[] = [];

    // 活跃的 Bug（未修复或修复失败的）
    const activeBugs = bugEvents.filter(
      (e) => e.outcome === 'pending' || e.outcome === 'failed'
    );
    for (const bug of activeBugs) {
      issues.push(`[Bug] ${bug.title} (${bug.outcome})`);
    }

    // 其他待处理事件（非 Bug 类的）
    const otherPending = pendingEvents.filter(
      (e) => e.type !== EventType.BUG
    );
    for (const event of otherPending) {
      issues.push(`[${event.type}] ${event.title}`);
    }

    return issues;
  }

  /**
   * 从事件中提取经验教训
   *
   * 主要从复盘事件（REVIEW）和失败事件的描述中提取。
   *
   * @param events - 所有事件
   * @returns 经验教训列表
   */
  private extractLessons(events: ProjectEvent[]): string[] {
    const lessons: string[] = [];

    // 从复盘事件中提取
    const reviewEvents = events.filter(
      (e) => e.type === EventType.REVIEW
    );
    for (const review of reviewEvents) {
      // 如果描述中明确包含"教训"或"经验"关键词，提取相关内容
      const lines = review.description.split('\n');
      for (const line of lines) {
        if (
          line.includes('教训') ||
          line.includes('经验') ||
          line.includes('lesson') ||
          line.includes('learn')
        ) {
          lessons.push(line.replace(/^[-*]\s*/, ''));
        }
      }
    }

    // 如果复盘事件中没有明确的教训，从失败事件中提炼
    if (lessons.length === 0) {
      const failedEvents = events.filter((e) => e.outcome === 'failed');
      for (const event of failedEvents.slice(0, 5)) {
        lessons.push(
          `${event.title} 失败: ${event.description}`
        );
      }
    }

    return lessons;
  }

  /**
   * 描述项目的整体状态
   *
   * @param events - 所有事件
   * @returns 项目状态描述文本
   */
  private describeProjectState(events: ProjectEvent[]): string {
    const bugCount = events.filter((e) => e.type === EventType.BUG).length;
    const featureCount = events.filter(
      (e) => e.type === EventType.FEATURE_DONE
    ).length;
    const decisionCount = events.filter(
      (e) => e.type === EventType.DECISION || e.type === EventType.ARCHITECTURE
    ).length;
    const failCount = events.filter((e) => e.outcome === 'failed').length;

    return [
      `项目共记录了 ${events.length} 个事件。`,
      `其中已完成 ${featureCount} 个功能，做出了 ${decisionCount} 个决策。`,
      `当前有 ${bugCount} 个 Bug 记录，${failCount} 次失败的尝试。`,
      `总体而言，项目处于${
        failCount > bugCount ? '需要重点关注' : '正常开发'
      }阶段。`,
    ].join(' ');
  }

  /**
   * 描述最近的活动
   *
   * @param recentEvents - 最新的事件列表
   * @returns 最近活动描述文本
   */
  private describeRecentActivity(recentEvents: ProjectEvent[]): string {
    if (recentEvents.length === 0) {
      return '暂无活动记录。';
    }

    const lines = recentEvents.map(
      (e, i) =>
        `${i + 1}. [${e.type}] ${e.title} (${
          e.outcome ?? '进行中'
        }) - ${e.timestamp}`
    );

    return `最近 ${recentEvents.length} 条活动记录：\n${lines.join('\n')}`;
  }

  /**
   * 建议下一步操作
   *
   * 根据当前项目状态，推荐 AI 接下来应该执行的操作。
   *
   * @param pendingEvents - 待处理事件
   * @param bugEvents - Bug 事件
   * @param failedEvents - 失败事件
   * @returns 建议操作描述
   */
  private suggestNextAction(
    pendingEvents: ProjectEvent[],
    bugEvents: ProjectEvent[],
    failedEvents: ProjectEvent[]
  ): string {
    // 优先处理未修复的 Bug
    const unresolvedBugs = bugEvents.filter(
      (e) => e.outcome === 'pending' || e.outcome === 'failed'
    );
    if (unresolvedBugs.length > 0) {
      return `优先处理 ${unresolvedBugs.length} 个未解决的 Bug，特别是: ${unresolvedBugs[0].title}`;
    }

    // 然后处理待决策项
    const pendingDecisions = pendingEvents.filter(
      (e) => e.type === EventType.DECISION || e.type === EventType.ARCHITECTURE
    );
    if (pendingDecisions.length > 0) {
      return `处理待决策项: ${pendingDecisions[0].title}`;
    }

    // 然后检查失败的尝试
    if (failedEvents.length > 0) {
      return `审查 ${failedEvents.length} 次失败的尝试，避免重复相同的错误方案`;
    }

    // 默认建议
    return '项目状态良好，可以继续推进功能开发或进行代码优化。';
  }
}