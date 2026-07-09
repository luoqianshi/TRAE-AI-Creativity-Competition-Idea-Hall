/**
 * @file 事件溯源引擎
 * @description 实现基于事件溯源（Event Sourcing）的模式，将所有项目事件
 *   以不可变日志的形式持久化存储。支持事件的追加、查询、重放和失败分析。
 *
 *   核心思想：
 *   - 事件日志是不可变的（只能追加，不能修改或删除）
 *   - 通过重放事件流可以重建任意时刻的项目状态
 *   - 失败事件的聚合分析用于"预操作判断"（Judgment Gate）
 *
 * @package project-mind
 */

import * as crypto from 'crypto';
import {
  ProjectEvent,
  EventType,
  EventFilter,
} from '../types';
import {FileStore} from '../storage/file-store';

/**
 * 事件溯源引擎
 *
 * 管理项目事件的完整生命周期：追加、查询、重放和分析。
 */
export class EventSourcing {
  /** 文件存储实例，负责事件的持久化 */
  private readonly store: FileStore;

  /** 内存中的事件缓存，加速查询 */
  private events: ProjectEvent[] = [];

  /**
   * @param store - 文件存储实例
   */
  constructor(store: FileStore) {
    this.store = store;
  }

  /**
   * 初始化事件日志
   *
   * 创建空的事件存储，并在首次运行时写入初始事件。
   *
   * @param projectName - 项目名称
   */
  async initialize(projectName: string): Promise<void> {
    // 创建项目初始化事件
    const initEvent: ProjectEvent = {
      id: crypto.randomUUID(),
      type: EventType.PROJECT_INIT,
      timestamp: new Date().toISOString(),
      title: `项目 ${projectName} 初始化`,
      description: `ProjectMind 上下文管理系统已为项目 "${projectName}" 初始化。`,
      tags: ['初始化'],
      relatedEvents: [],
      metadata: {
        projectName,
      },
    };

    this.events = [initEvent];
    await this.store.save(initEvent);
  }

  /**
   * 追加新事件到不可变日志
   *
   * 生成唯一 ID 和时间戳，写入存储并更新内存缓存。
   *
   * @param event - 待追加的事件（不含 id 和 timestamp）
   * @returns 保存后完整的事件对象
   */
  async append(
    event: Omit<ProjectEvent, 'id' | 'timestamp'>
  ): Promise<ProjectEvent> {
    const newEvent: ProjectEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.events.push(newEvent);
    await this.store.save(newEvent);

    return newEvent;
  }

  /**
   * 从持久化存储重新加载所有事件到内存
   *
   * 通常在启动时调用，确保内存缓存与文件存储同步。
   */
  async replay(): Promise<ProjectEvent[]> {
    this.events = await this.store.loadAll();
    return this.events;
  }

  /**
   * 按条件查询事件
   *
   * 支持按类型、时间范围、标签、结果状态和关键词过滤。
   *
   * @param filter - 查询过滤条件
   * @returns 匹配条件的事件列表
   */
  query(filter?: EventFilter): ProjectEvent[] {
    let results = [...this.events];

    if (!filter) {
      return results;
    }

    // 按事件类型过滤
    if (filter.types && filter.types.length > 0) {
      results = results.filter((e) => filter.types!.includes(e.type));
    }

    // 按时间范围起始过滤
    if (filter.startTime) {
      const start = new Date(filter.startTime).getTime();
      results = results.filter(
        (e) => new Date(e.timestamp).getTime() >= start
      );
    }

    // 按时间范围结束过滤
    if (filter.endTime) {
      const end = new Date(filter.endTime).getTime();
      results = results.filter(
        (e) => new Date(e.timestamp).getTime() <= end
      );
    }

    // 按标签过滤（只要匹配任一标签即可）
    if (filter.tags && filter.tags.length > 0) {
      results = results.filter((e) =>
        filter.tags!.some((tag) => e.tags.includes(tag))
      );
    }

    // 按结果状态过滤
    if (filter.outcome) {
      results = results.filter((e) => e.outcome === filter.outcome);
    }

    // 按关键词搜索标题和描述
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(keyword) ||
          e.description.toLowerCase().includes(keyword)
      );
    }

    return results;
  }

  /**
   * 获取所有失败尝试
   *
   * 用于"预操作判断门"（JudgmentGate），避免重复已失败的方案。
   *
   * @returns 所有状态为 failed 的事件
   */
  getFailedAttempts(): ProjectEvent[] {
    return this.events.filter(
      (e) => e.outcome === 'failed'
    );
  }

  /**
   * 按事件 ID 获取单个事件
   *
   * @param id - 事件 ID
   * @returns 匹配的事件，未找到时返回 undefined
   */
  getById(id: string): ProjectEvent | undefined {
    return this.events.find((e) => e.id === id);
  }

  /**
   * 获取指定类型的最新事件
   *
   * @param type - 事件类型
   * @param count - 返回数量（默认 5）
   * @returns 最新的事件列表
   */
  getLatestByType(type: EventType, count: number = 5): ProjectEvent[] {
    return this.events
      .filter((e) => e.type === type)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, count);
  }

  /**
   * 获取所有已记录的事件
   *
   * @returns 完整事件列表
   */
  getAll(): ProjectEvent[] {
    return [...this.events];
  }

  /**
   * 获取事件总数
   *
   * @returns 事件数量
   */
  getCount(): number {
    return this.events.length;
  }

  /**
   * 获取关联事件链
   *
   * 从指定事件出发，递归查找所有关联事件，形成事件关系图。
   *
   * @param eventId - 起始事件 ID
   * @returns 关联事件列表（含起始事件）
   */
  getRelatedChain(eventId: string): ProjectEvent[] {
    const visited = new Set<string>();
    const result: ProjectEvent[] = [];
    const queue: string[] = [eventId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const event = this.getById(currentId);
      if (event) {
        result.push(event);
        for (const relatedId of event.relatedEvents) {
          if (!visited.has(relatedId)) {
            queue.push(relatedId);
          }
        }
      }
    }

    return result;
  }
}