/**
 * @file MCP 工具定义
 * @description 定义 Model Context Protocol (MCP) 工具的输入输出 Schema。
 *   每个工具的描述和参数结构在此定义，供 MCP 服务器注册使用。
 *
 *   MCP 协议允许 AI 平台（如 Claude, Cursor, Continue 等）
 *   通过标准化的工具调用接口与 ProjectMind 交互。
 *
 * @package project-mind
 */

import {MCPToolDefinition} from '../types';

/**
 * 所有 MCP 工具的定义列表
 *
 * 工具按功能分类：
 * - 上下文获取：get_context, get_summary
 * - 事件管理：record_event
 * - 预操作检查：check_action
 * - 打包导出：pack_context
 */
export const TOOL_DEFINITIONS: MCPToolDefinition[] = [
  // =========================================================================
  // 工具: get_context
  // 描述: 获取项目的完整上下文快照，包含项目状态、技术栈、架构等信息
  // =========================================================================
  {
    name: 'get_context',
    description: '获取项目当前的完整上下文快照，包括项目状态、技术栈、架构、活跃 Bug 等',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: '项目根目录路径（默认为当前工作目录）',
        },
      },
    },
  },

  // =========================================================================
  // 工具: get_summary
  // 描述: 获取 AI 复盘摘要，包含最近活动、未解决问题、经验教训等
  // =========================================================================
  {
    name: 'get_summary',
    description: '获取 AI 复盘摘要，包含最近活动、未解决问题、待处理决策和经验教训',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: '项目根目录路径（默认为当前工作目录）',
        },
        detailed: {
          type: 'boolean',
          description: '是否生成详细摘要（默认为 false）',
        },
      },
    },
  },

  // =========================================================================
  // 工具: record_event
  // 描述: 记录新的项目事件到上下文日志
  // =========================================================================
  {
    name: 'record_event',
    description: '记录新的项目事件（如 Bug、决策、功能开发等）到事件日志',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: '项目根目录路径（默认为当前工作目录）',
        },
        type: {
          type: 'string',
          description: '事件类型（project_init, architecture, decision, bug, bug_fix, feature, feature_done, perf_issue, perf_optimization, review, note）',
          enum: [
            'project_init',
            'architecture',
            'decision',
            'bug',
            'bug_fix',
            'feature',
            'feature_done',
            'perf_issue',
            'perf_optimization',
            'review',
            'note',
          ],
        },
        title: {
          type: 'string',
          description: '事件标题',
        },
        description: {
          type: 'string',
          description: '事件详细描述',
        },
        location: {
          type: 'string',
          description: '关联的文件路径（可选）',
        },
        tags: {
          type: 'array',
          items: {type: 'string'},
          description: '标签列表',
        },
        outcome: {
          type: 'string',
          description: '结果状态（success, failed, partial, pending）',
          enum: ['success', 'failed', 'partial', 'pending'],
        },
        relatedEvents: {
          type: 'array',
          items: {type: 'string'},
          description: '关联事件 ID 列表',
        },
      },
      required: ['type', 'title', 'description'],
    },
  },

  // =========================================================================
  // 工具: check_action
  // 描述: 在执行操作前进行检查，避免重复已失败的方案
  // =========================================================================
  {
    name: 'check_action',
    description: '预操作检查：在执行操作前检查是否会重复已失败的方案或触及脆弱区域',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: '项目根目录路径（默认为当前工作目录）',
        },
        action: {
          type: 'string',
          description: '要执行的操作描述',
        },
      },
      required: ['action'],
    },
  },

  // =========================================================================
  // 工具: pack_context
  // 描述: 打包完整的项目上下文信息为 JSON 或 Markdown 格式
  // =========================================================================
  {
    name: 'pack_context',
    description: '打包完整的项目上下文（快照 + 摘要 + 事件日志）为单个 JSON 或 Markdown 文件',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: '项目根目录路径（默认为当前工作目录）',
        },
        format: {
          type: 'string',
          description: '输出格式（json 或 markdown，默认为 json）',
          enum: ['json', 'markdown'],
        },
        output: {
          type: 'string',
          description: '输出文件路径（可选，默认输出到 stdout）',
        },
      },
    },
  },
];

/**
 * 根据工具名称获取工具定义
 *
 * @param name - 工具名称
 * @returns 工具定义，未找到时返回 undefined
 */
export function getToolDefinition(
  name: string
): MCPToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

/**
 * 获取工具名称列表
 *
 * @returns 工具名称数组
 */
export function getToolNames(): string[] {
  return TOOL_DEFINITIONS.map((tool) => tool.name);
}