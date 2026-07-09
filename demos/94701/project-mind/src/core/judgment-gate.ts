/**
 * @file 预操作判断门
 * @description 在执行操作前进行检查，避免 AI 重复之前已经失败过的方案。
 *   核心价值：通过分析历史失败记录，在 AI 走弯路之前及时提醒并阻止。
 *
 *   判断逻辑：
 *   1. 检查当前操作是否与历史失败尝试相似
 *   2. 检查操作涉及的文件是否是已知的脆弱区域
 *   3. 聚合所有相关警告返回给调用方
 *
 * @package project-mind
 */

import {ProjectEvent, ActionCheckResult} from '../types';
import {EventSourcing} from './event-sourcing';

/**
 * 预操作判断门
 *
 * 在 AI 执行操作前进行智能检查，防止重复已失败的方案，
 * 避免触碰已知的脆弱区域。
 */
export class JudgmentGate {
  /** 事件溯源引擎，用于查询历史事件 */
  private readonly eventSourcing: EventSourcing;

  /**
   * @param eventSourcing - 事件溯源引擎实例
   */
  constructor(eventSourcing: EventSourcing) {
    this.eventSourcing = eventSourcing;
  }

  /**
   * 在执行操作前检查是否应阻止
   *
   * 综合检查操作内容是否与历史失败记录重复、是否涉及脆弱区域。
   *
   * @param action - 要执行的操作描述
   * @returns 检查结果，包含是否允许执行及相关警告
   */
  async checkBeforeAction(action: string): Promise<ActionCheckResult> {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 1. 检查是否在重复之前的失败方案
    const duplicateCheck = this.checkDuplicateAction(action);
    if (duplicateCheck.duplicate) {
      warnings.push(
        `检测到与历史失败操作相似的操作: "${duplicateCheck.matchedEvent?.title}"`
      );
      suggestions.push(
        `建议查阅历史失败事件 (ID: ${duplicateCheck.matchedEvent?.id}) ` +
          `了解上次失败的原因后再决定是否继续`
      );
    }

    // 2. 检查涉及的文件是否是脆弱区域
    const filePath = this.extractFilePath(action);
    if (filePath) {
      const fragileCheck = this.checkFragileFile(filePath);
      if (fragileCheck.isFragile) {
        warnings.push(
          `文件 "${filePath}" 被标记为脆弱区域，修改 ${fragileCheck.modificationCount} 次`
        );
        suggestions.push(
          `修改 "${filePath}" 时需要格外小心，建议先了解其完整上下文`
        );
      }
    }

    // 3. 检查是否有相关的待处理决策
    const pendingDecisions = this.eventSourcing.query({
      outcome: 'pending',
    });
    const relatedDecisions = pendingDecisions.filter(
      (e) =>
        action.includes(e.title) ||
        e.title.includes(action.slice(0, 20))
    );
    for (const decision of relatedDecisions) {
      warnings.push(
        `存在相关的待处理决策: "${decision.title}"`
      );
    }

    // 决定是否允许操作
    const allowed = warnings.length === 0;
    if (!allowed) {
      suggestions.push(
        '如果确认需要执行此操作，请在记录事件时关联相关历史事件'
      );
    }

    return {
      allowed,
      reason: allowed
        ? undefined
        : '操作触发了预检查警告，请确认是否确实需要执行',
      warnings,
      suggestions,
    };
  }

  /**
   * 检查修复描述是否与历史失败的修复重复
   *
   * @param fixDescription - 修复方案描述
   * @returns 检查结果
   */
  checkDuplicateFix(fixDescription: string): ActionCheckResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const failedEvents = this.eventSourcing.getFailedAttempts();
    const fixKeywords = this.extractKeywords(fixDescription);

    for (const failedEvent of failedEvents) {
      const failedKeywords = this.extractKeywords(
        `${failedEvent.title} ${failedEvent.description}`
      );

      // 计算关键词重合度
      const overlap = fixKeywords.filter((kw) =>
        failedKeywords.includes(kw)
      );

      if (overlap.length >= 3) {
        warnings.push(
          `修复方案与失败的尝试 "${failedEvent.title}" 相似度较高 ` +
            `(匹配关键词: ${overlap.join(', ')})`
        );
        suggestions.push(
          `建议先审查事件 ${failedEvent.id} 的失败原因，` +
            `避免重复相同的错误`
        );
      }
    }

    return {
      allowed: warnings.length === 0,
      reason:
        warnings.length > 0
          ? '检测到与历史失败修复相似的方案'
          : undefined,
      warnings,
      suggestions,
    };
  }

  /**
   * 检查文件是否是已知的脆弱区域
   *
   * 如果文件被高频修改或曾被标记为脆弱区域，则返回警告。
   *
   * @param filePath - 文件路径
   * @returns 检查结果
   */
  checkFragileFile(filePath: string): {
    isFragile: boolean;
    modificationCount: number;
  } {
    const allEvents = this.eventSourcing.getAll();

    // 统计对该文件的修改次数
    const modificationCount = allEvents.filter(
      (e) => e.location === filePath
    ).length;

    // 阈值：修改超过 5 次视为脆弱区域
    const isFragile = modificationCount >= 5;

    return {
      isFragile,
      modificationCount,
    };
  }

  /**
   * 获取与指定操作相关的所有警告
   *
   * @param action - 操作描述
   * @returns 警告列表
   */
  getWarnings(action: string): string[] {
    const warnings: string[] = [];

    // 检查失败历史
    const failedAttempts = this.eventSourcing.getFailedAttempts();
    for (const attempt of failedAttempts) {
      const similarity = this.calculateSimilarity(
        action,
        `${attempt.title} ${attempt.description}`
      );
      if (similarity > 0.5) {
        warnings.push(
          `警告: 当前操作与失败的尝试 "${attempt.title}" ` +
            `相似度 ${(similarity * 100).toFixed(0)}%`
        );
      }
    }

    return warnings;
  }

  /**
   * 检查操作是否与历史失败重复
   *
   * @param action - 操作描述
   * @returns 重复检查结果
   */
  private checkDuplicateAction(action: string): {
    duplicate: boolean;
    matchedEvent?: ProjectEvent;
  } {
    const failedEvents = this.eventSourcing.getFailedAttempts();
    const actionKeywords = this.extractKeywords(action);

    for (const failedEvent of failedEvents) {
      const eventText = `${failedEvent.title} ${failedEvent.description}`;
      const eventKeywords = this.extractKeywords(eventText);

      // 计算关键词重合度
      const overlap = actionKeywords.filter((kw) =>
        eventKeywords.includes(kw)
      );

      // 如果重合超过 3 个关键词，视为重复
      if (overlap.length >= 3) {
        return {
          duplicate: true,
          matchedEvent: failedEvent,
        };
      }
    }

    return {duplicate: false};
  }

  /**
   * 从操作描述中提取文件路径
   *
   * @param text - 操作描述文本
   * @returns 提取到的文件路径，未找到时返回 undefined
   */
  private extractFilePath(text: string): string | undefined {
    // 匹配常见的文件路径模式
    const patterns = [
      /["']([^"']+\.[a-zA-Z]+)["']/g,     // "path/to/file.ts"
      /[`]([^`]+\.[a-zA-Z]+)[`]/g,           // `path/to/file.ts`
      /\b(src\/[^\s,]+)\b/g,                 // src/path/to/file.ts
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * 从文本中提取关键词
   *
   * @param text - 输入文本
   * @returns 关键词列表
   */
  private extractKeywords(text: string): string[] {
    // 分词、转小写、去停用词
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were',
      'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'and', 'or', 'but', 'not', 'this', 'that',
      'it', 'its', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might',
      '的', '了', '在', '是', '我', '有', '和',
      '就', '不', '人', '都', '一', '一个', '上',
      '也', '很', '到', '说', '要', '去', '你',
      '会', '着', '没有', '看', '好', '自己', '这',
    ]);

    return text
      .toLowerCase()
      .split(/[\s,，。；;：:！!？?()（）\[\]【】{}、/\\]+/)
      .filter(
        (word) =>
          word.length > 1 && !stopWords.has(word)
      );
  }

  /**
   * 计算两个字符串的文本相似度（基于关键词交集）
   *
   * @param text1 - 文本 1
   * @param text2 - 文本 2
   * @returns 相似度值（0-1）
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const keywords1 = new Set(this.extractKeywords(text1));
    const keywords2 = new Set(this.extractKeywords(text2));

    if (keywords1.size === 0 || keywords2.size === 0) {
      return 0;
    }

    let overlap = 0;
    for (const kw of keywords1) {
      if (keywords2.has(kw)) {
        overlap++;
      }
    }

    // 使用 Dice 系数计算相似度
    return (2 * overlap) / (keywords1.size + keywords2.size);
  }
}