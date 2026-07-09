/**
 * @file ProjectMind 核心类型定义
 * @description 定义项目全生命周期 AI 上下文管理系统的所有类型、
 *   枚举和接口。所有模块共享这些类型定义，确保类型安全。
 *
 * @package project-mind
 */

// =============================================================================
// 事件系统
// =============================================================================

/**
 * 事件类型枚举
 *
 * 覆盖项目全生命周期的所有关键节点。每个事件类型对应一种
 * 特定语境下的 AI 上下文记录需求。
 */
export enum EventType {
  /** 项目初始化：新项目建立时的基础上下文记录 */
  PROJECT_INIT = 'project_init',
  /** 架构设计：记录架构决策、设计方案及其变更 */
  ARCHITECTURE = 'architecture',
  /** 决策记录：记录技术选型、方案权衡等关键决策 */
  DECISION = 'decision',
  /** Bug 报告：记录发现的缺陷及其复现步骤 */
  BUG = 'bug',
  /** Bug 修复：记录缺陷的修复方案和验证结果 */
  BUG_FIX = 'bug_fix',
  /** 功能开发：记录新功能的开发进展 */
  FEATURE = 'feature',
  /** 功能完成：标记功能开发完成并通过验证 */
  FEATURE_DONE = 'feature_done',
  /** 性能问题：记录识别到的性能瓶颈 */
  PERF_ISSUE = 'perf_issue',
  /** 性能优化：记录性能优化措施和效果 */
  PERF_OPT = 'perf_optimization',
  /** 复盘总结：记录阶段性的复盘回顾 */
  REVIEW = 'review',
  /** 笔记：记录其他任何需要保留的上下文信息 */
  NOTE = 'note',
}

/**
 * 事件执行结果状态
 */
export type EventOutcome = 'success' | 'failed' | 'partial' | 'pending';

/**
 * 项目事件条目
 *
 * 代表项目生命周期中的一个原子事件。每个事件都被持久化到
 * 事件日志中，形成不可变的事件流，用于状态重建和 AI 分析。
 */
export interface ProjectEvent {
  /** 事件唯一标识符（UUID v4） */
  id: string;
  /** 事件类型 */
  type: EventType;
  /** ISO 8601 格式的时间戳 */
  timestamp: string;
  /** 事件简述标题 */
  title: string;
  /** 事件详细描述 */
  description: string;
  /** 关联的文件路径（可选） */
  location?: string;
  /** 标签列表，用于分类和检索 */
  tags: string[];
  /** 操作结果状态 */
  outcome?: EventOutcome;
  /** 关联事件的 ID 列表，用于构建事件关系图 */
  relatedEvents: string[];
  /** 扩展元数据，用于存储事件特定的附加信息 */
  metadata: Record<string, string>;
}

// =============================================================================
// 项目上下文快照
// =============================================================================

/**
 * 项目上下文快照
 *
 * 在某一时刻捕获的项目完整状态。用于 AI 快速了解项目的
 * 当前全貌，无需从零开始分析事件日志。
 */
export interface ProjectSnapshot {
  /** 项目名称 */
  name: string;
  /** 项目版本号 */
  version: string;
  /** 快照最后更新时间（ISO 8601） */
  lastUpdated: string;
  /** 项目描述 */
  description: string;
  /** 技术栈列表 */
  techStack: string[];
  /** 架构要点描述 */
  architecture: string;
  /** 关键决策列表 */
  decisions: string[];
  /** 当前活跃的 Bug 列表 */
  activeBugs: string[];
  /** 最近完成的功能列表 */
  recentFeatures: string[];
  /** 事件总数 */
  eventCount: number;
}

// =============================================================================
// AI 复盘摘要
// =============================================================================

/**
 * AI 复盘摘要
 *
 * 由摘要引擎从事件日志分析生成的智能摘要，包含 AI 持续工作
 * 所需的全部上下文信息。
 */
export interface AISummary {
  /** 项目当前状态概述 */
  projectState: string;
  /** 最近活动描述 */
  recentActivity: string;
  /** 未解决的问题列表 */
  unresolvedIssues: string[];
  /** 待处理的决策列表 */
  pendingDecisions: string[];
  /** 经验教训列表（已犯过的错误） */
  lessonsLearned: string[];
  /** 易出问题的脆弱区域 */
  fragileAreas: string[];
  /** 尝试过但失败的方案列表 */
  failedAttempts: string[];
  /** AI 下一步建议的操作 */
  nextSuggestedAction: string;
}

// =============================================================================
// MCP 上下文包
// =============================================================================

/**
 * MCP 上下文包
 *
 * 完整的项目上下文信息打包，用于跨平台/跨 AI 共享。
 * 包含快照、摘要、事件日志和配置。
 */
export interface ContextPackage {
  /** 项目状态快照 */
  snapshot: ProjectSnapshot;
  /** AI 复盘摘要 */
  summary: AISummary;
  /** 事件日志列表 */
  events: ProjectEvent[];
  /** 项目配置 */
  config: ProjectMindConfig;
}

// =============================================================================
// 项目配置
// =============================================================================

/**
 * ProjectMind 项目配置
 *
 * 定义项目的核心配置项，存储在项目根目录下的 .pmd/config.json 中。
 */
export interface ProjectMindConfig {
  /** 项目名称 */
  name: string;
  /** 项目版本 */
  version: string;
  /** 项目描述 */
  description: string;
  /** 技术栈列表 */
  techStack: string[];
  /** 项目规则/约定列表 */
  rules: string[];
  /** 最大备份事件数，超过此数量将触发摘要压缩 */
  maxEventsBeforeSummarize: number;
}

/**
 * 事件过滤器
 *
 * 用于查询事件日志的过滤条件。
 */
export interface EventFilter {
  /** 按事件类型过滤 */
  types?: EventType[];
  /** 按时间范围起始过滤 */
  startTime?: string;
  /** 按时间范围结束过滤 */
  endTime?: string;
  /** 按标签过滤 */
  tags?: string[];
  /** 按结果状态过滤 */
  outcome?: EventOutcome;
  /** 按关键词搜索标题和描述 */
  keyword?: string;
}

/**
 * MCP 工具调用请求
 */
export interface MCPToolCallRequest {
  /** 工具名称 */
  name: string;
  /** 工具参数 */
  arguments: Record<string, unknown>;
}

/**
 * MCP 工具定义
 */
export interface MCPToolDefinition {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 输入参数 JSON Schema */
  inputSchema: Record<string, unknown>;
}

/**
 * MCP JSON-RPC 响应
 */
export interface MCPResponse {
  /** JSON-RPC 版本 */
  jsonrpc: string;
  /** 请求 ID（JSON-RPC 允许 null，如解析错误时） */
  id: string | number | null;
  /** 响应结果 */
  result?: unknown;
  /** 错误信息 */
  error?: {
    code: number;
    message: string;
  };
}

/**
 * 操作检查结果
 */
export interface ActionCheckResult {
  /** 是否允许执行操作 */
  allowed: boolean;
  /** 阻止原因（当 allowed 为 false 时） */
  reason?: string;
  /** 警告信息列表 */
  warnings: string[];
  /** 建议的替代方案 */
  suggestions: string[];
}