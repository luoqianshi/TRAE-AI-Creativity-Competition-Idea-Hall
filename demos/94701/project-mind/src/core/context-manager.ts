/**
 * @file 上下文管理器
 * @description 项目上下文的中央管理模块，协调事件溯源、摘要生成、
 *   预操作判断等子模块。对外提供统一的项目上下文生命周期管理 API。
 *
 *   核心职责：
 *   - 初始化项目上下文环境
 *   - 记录和查询事件
 *   - 生成项目状态快照
 *   - 协调 AI 复盘摘要生成
 *   - 管理项目规则/约定
 *
 * @package project-mind
 */

import * as path from 'path';
import * as fs from 'fs';
import {
  EventType,
  ProjectEvent,
  ProjectSnapshot,
  AISummary,
  ContextPackage,
  ProjectMindConfig,
} from '../types';
import {EventSourcing} from './event-sourcing';
import {SummaryEngine} from './summary-engine';
import {JudgmentGate} from './judgment-gate';
import {FileStore} from '../storage/file-store';
import {MemoryStore} from '../storage/memory-store';

/**
 * 默认项目配置
 */
const DEFAULT_CONFIG: Omit<ProjectMindConfig, 'name' | 'description'> = {
  version: '0.1.0',
  techStack: [],
  rules: [],
  maxEventsBeforeSummarize: 100,
};

/**
 * 上下文管理器
 *
 * 项目上下文生命周期的核心控制器，聚合所有子模块功能。
 */
export class ContextManager {
  /** 项目根目录路径 */
  readonly projectRoot: string;

  /** .pmd 数据目录路径 */
  private readonly pmdDir: string;

  /** 事件溯源引擎 */
  private readonly eventSourcing: EventSourcing;

  /** 摘要生成引擎 */
  private readonly summaryEngine: SummaryEngine;

  /** 预操作判断门 */
  private readonly judgmentGate: JudgmentGate;

  /** 文件存储 */
  private readonly fileStore: FileStore;

  /** 内存缓存 */
  private readonly memoryStore: MemoryStore;

  /** 项目配置 */
  private config!: ProjectMindConfig;

  /**
   * @param projectRoot - 项目根目录路径
   */
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.pmdDir = path.join(projectRoot, '.pmd');
    this.fileStore = new FileStore(this.pmdDir);
    this.memoryStore = new MemoryStore();
    this.eventSourcing = new EventSourcing(this.fileStore);
    this.summaryEngine = new SummaryEngine();
    this.judgmentGate = new JudgmentGate(this.eventSourcing);
  }

  /**
   * 初始化项目上下文
   *
   * 创建 .pmd 数据目录、初始化事件日志、创建配置文件。
   *
   * @param name - 项目名称
   * @param config - 项目配置（可选）
   */
  async init(
    name: string,
    config?: Partial<ProjectMindConfig>
  ): Promise<void> {
    // 合并默认配置和用户提供的配置
    this.config = {
      ...DEFAULT_CONFIG,
      name,
      description: config?.description ?? '',
      ...config,
      // 确保 version 和 techStack 等字段有默认值
      version: config?.version ?? DEFAULT_CONFIG.version,
      techStack: config?.techStack ?? DEFAULT_CONFIG.techStack,
      rules: config?.rules ?? DEFAULT_CONFIG.rules,
      maxEventsBeforeSummarize:
        config?.maxEventsBeforeSummarize ??
        DEFAULT_CONFIG.maxEventsBeforeSummarize,
    } as ProjectMindConfig;

    // 创建 .pmd 目录（如果不存在）
    if (!fs.existsSync(this.pmdDir)) {
      fs.mkdirSync(this.pmdDir, {recursive: true});
    }

    // 保存配置文件
    await this.fileStore.saveConfig(this.config);

    // 初始化事件日志
    await this.eventSourcing.initialize(name);

    // 将配置写入内存缓存
    this.memoryStore.set('config', this.config);
    this.memoryStore.set('projectName', name);
  }

  /**
   * 加载已有项目的上下文
   *
   * 从 .pmd 目录读取配置并重放事件日志，恢复项目状态。
   */
  async load(): Promise<void> {
    // 加载配置
    this.config = await this.fileStore.loadConfig();

    // 重放所有事件到内存
    const events = await this.eventSourcing.replay();

    // 初始化内存缓存
    this.memoryStore.set('config', this.config);
    this.memoryStore.set('projectName', this.config.name);

    // 缓存最近事件
    for (const event of events) {
      this.memoryStore.set(`event:${event.id}`, event);
    }
  }

  /**
   * 记录新事件
   *
   * @param event - 待记录的事件
   * @returns 保存后的完整事件对象
   */
  async recordEvent(
    event: Omit<ProjectEvent, 'id' | 'timestamp'>
  ): Promise<ProjectEvent> {
    const savedEvent = await this.eventSourcing.append(event);

    // 更新内存缓存
    this.memoryStore.set(`event:${savedEvent.id}`, savedEvent);

    // 检查是否需要自动生成摘要
    const eventCount = this.eventSourcing.getCount();
    if (eventCount >= this.config.maxEventsBeforeSummarize) {
      await this.generateAndSaveSummary();
    }

    return savedEvent;
  }

  /**
   * 生成项目当前状态快照
   *
   * @returns 项目快照对象
   */
  async getSnapshot(): Promise<ProjectSnapshot> {
    const events = this.eventSourcing.getAll();

    // 提取各类事件的摘要信息
    const decisions = this.eventSourcing
      .query({types: [EventType.DECISION, EventType.ARCHITECTURE]})
      .map((e) => `[${e.timestamp}] ${e.title}: ${e.description}`);

    const activeBugs = this.eventSourcing
      .query({types: [EventType.BUG], outcome: 'pending'})
      .map((e) => `[${e.timestamp}] ${e.title}`);

    const recentFeatures = this.eventSourcing
      .query({types: [EventType.FEATURE_DONE]})
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10)
      .map((e) => `[${e.timestamp}] ${e.title}`);

    return {
      name: this.config.name,
      version: this.config.version,
      lastUpdated: new Date().toISOString(),
      description: this.config.description,
      techStack: this.config.techStack,
      architecture: events
        .filter((e) => e.type === 'architecture')
        .map((e) => e.description)
        .join('\n'),
      decisions,
      activeBugs,
      recentFeatures,
      eventCount: this.eventSourcing.getCount(),
    };
  }

  /**
   * 生成 AI 复盘摘要
   *
   * 基于事件日志，由摘要引擎生成结构化的 AI 复盘信息。
   *
   * @returns AI 复盘摘要
   */
  async getAISummary(): Promise<AISummary> {
    const events = this.eventSourcing.getAll();
    return this.summaryEngine.generateSummary(events);
  }

  /**
   * 打包完整的上下文信息
   *
   * 包含项目快照、AI 摘要、事件日志和配置，可用于跨平台共享。
   *
   * @returns 完整的上下文包
   */
  async getContextPackage(): Promise<ContextPackage> {
    const [snapshot, summary] = await Promise.all([
      this.getSnapshot(),
      this.getAISummary(),
    ]);

    return {
      snapshot,
      summary,
      events: this.eventSourcing.getAll(),
      config: this.config,
    };
  }

  /**
   * 添加项目规则/约定
   *
   * @param rule - 规则描述文本
   */
  async addRule(rule: string): Promise<void> {
    // 检查是否已存在相同的规则
    if (this.config.rules.includes(rule)) {
      return;
    }

    this.config.rules.push(rule);
    await this.fileStore.saveConfig(this.config);
    this.memoryStore.set('config', this.config);
  }

  /**
   * 获取事件溯源引擎实例
   *
   * @returns EventSourcing 实例
   */
  getEventSourcing(): EventSourcing {
    return this.eventSourcing;
  }

  /**
   * 获取摘要引擎实例
   *
   * @returns SummaryEngine 实例
   */
  getSummaryEngine(): SummaryEngine {
    return this.summaryEngine;
  }

  /**
   * 获取预操作判断门实例
   *
   * @returns JudgmentGate 实例
   */
  getJudgmentGate(): JudgmentGate {
    return this.judgmentGate;
  }

  /**
   * 获取项目配置
   *
   * @returns 项目配置
   */
  getConfig(): ProjectMindConfig {
    return {...this.config};
  }

  /**
   * 获取 .pmd 目录路径
   *
   * @returns .pmd 目录绝对路径
   */
  getPmdDir(): string {
    return this.pmdDir;
  }

  /**
   * 自动生成摘要并保存到文件
   */
  private async generateAndSaveSummary(): Promise<void> {
    const summary = await this.getAISummary();
    const summaryPath = path.join(this.pmdDir, 'summary.md');
    const content = [
      `# AI 复盘摘要 - ${this.config.name}`,
      '',
      `> 生成时间: ${new Date().toISOString()}`,
      '',
      '## 项目状态',
      '',
      summary.projectState,
      '',
      '## 最近活动',
      '',
      summary.recentActivity,
      '',
      '## 未解决问题',
      '',
      ...summary.unresolvedIssues.map((i) => `- ${i}`),
      '',
      '## 待处理决策',
      '',
      ...summary.pendingDecisions.map((d) => `- ${d}`),
      '',
      '## 经验教训',
      '',
      ...summary.lessonsLearned.map((l) => `- ${l}`),
      '',
      '## 脆弱区域',
      '',
      ...summary.fragileAreas.map((a) => `- ${a}`),
      '',
      '## 失败的尝试',
      '',
      ...summary.failedAttempts.map((a) => `- ${a}`),
      '',
      '## 下一步建议',
      '',
      summary.nextSuggestedAction,
    ].join('\n');

    fs.writeFileSync(summaryPath, content, 'utf-8');
  }
}