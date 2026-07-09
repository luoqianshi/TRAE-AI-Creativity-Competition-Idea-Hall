/**
 * @file MCP 服务器
 * @description 实现轻量级的 Model Context Protocol (MCP) 服务器，
 *   通过标准输入输出（stdio）与 AI 平台通信。
 *
 *   实现方式：
 *   不引入外部 MCP 库依赖，自行实现 JSON-RPC 2.0 协议的子集。
 *   支持 tools/list 和 tools/call 两个核心方法。
 *
 *   通信协议：
 *   - 使用 stdio 进行 JSON-RPC 2.0 双向通信
 *   - 每个请求和响应都是单行 JSON
 *   - 支持 methods: tools/list, tools/call
 *
 * @package project-mind
 */

import * as readline from 'readline';
import {MCPResponse, MCPToolCallRequest} from '../types';
import {TOOL_DEFINITIONS, getToolDefinition} from './tools';
import {ContextManager} from '../core/context-manager';

/**
 * MCP 服务器
 *
 * 管理 MCP 协议的生命周期，处理来自 AI 平台的 JSON-RPC 请求。
 */
export class MCPServer {
  /** 上下文管理器实例 */
  private contextManager: ContextManager | null = null;

  /** 服务器是否正在运行 */
  private isRunning = false;

  /** readline 接口，用于从 stdin 读取 */
  private rl: readline.Interface | null = null;

  /**
   * 启动 MCP 服务器
   *
   * 监听标准输入的 JSON-RPC 请求，处理后输出到标准输出。
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    // 处理每行输入（每个 JSON-RPC 请求占一行）
    this.rl.on('line', (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      try {
        const request = JSON.parse(trimmed);
        this.handleRequest(request).then((response) => {
          process.stdout.write(JSON.stringify(response) + '\n');
        });
      } catch (error) {
        // 返回 JSON-RPC 解析错误
        const errorResponse: MCPResponse = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: `JSON 解析错误: ${(error as Error).message}`,
          },
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    });

    // 输出服务器启动通知
    const initNotification = {
      jsonrpc: '2.0',
      method: 'server/started',
      params: {
        version: '0.1.0',
        tools: TOOL_DEFINITIONS.map((t) => ({
          name: t.name,
          description: t.description,
        })),
      },
    };
    process.stdout.write(JSON.stringify(initNotification) + '\n');
  }

  /**
   * 停止 MCP 服务器
   */
  stop(): void {
    this.isRunning = false;
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * 处理 JSON-RPC 请求
   *
   * @param request - JSON-RPC 请求对象
   * @returns JSON-RPC 响应对象
   */
  private async handleRequest(request: {
    jsonrpc: string;
    id: string | number;
    method: string;
    params?: Record<string, unknown>;
  }): Promise<MCPResponse> {
    const {jsonrpc, id, method, params} = request;

    switch (method) {
      case 'tools/list':
        return this.handleToolsList(jsonrpc, id);

      case 'tools/call':
        return await this.handleToolsCall(
          jsonrpc,
          id,
          params as unknown as MCPToolCallRequest
        );

      default:
        return {
          jsonrpc,
          id,
          error: {
            code: -32601,
            message: `不支持的方法: ${method}`,
          },
        };
    }
  }

  /**
   * 处理 tools/list 请求
   *
   * 返回所有可用工具的定义列表。
   */
  private handleToolsList(
    jsonrpc: string,
    id: string | number
  ): MCPResponse {
    return {
      jsonrpc,
      id,
      result: {
        tools: TOOL_DEFINITIONS,
      },
    };
  }

  /**
   * 处理 tools/call 请求
   *
   * 根据工具名称调用对应的功能。
   */
  private async handleToolsCall(
    jsonrpc: string,
    id: string | number,
    params?: MCPToolCallRequest
  ): Promise<MCPResponse> {
    if (!params || !params.name) {
      return {
        jsonrpc,
        id,
        error: {
          code: -32602,
          message: '缺少工具名称参数',
        },
      };
    }

    const toolName = params.name;
    const args = params.arguments ?? {};

    // 查找工具定义
    const toolDef = getToolDefinition(toolName);
    if (!toolDef) {
      return {
        jsonrpc,
        id,
        error: {
          code: -32602,
          message: `未知的工具: ${toolName}`,
        },
      };
    }

    try {
      // 根据工具名称分发到对应处理函数
      let result: unknown;
      switch (toolName) {
        case 'get_context':
          result = await this.handleGetContext(args as {projectPath?: string});
          break;

        case 'get_summary':
          result = await this.handleGetSummary(
            args as {projectPath?: string; detailed?: boolean}
          );
          break;

        case 'record_event':
          result = await this.handleRecordEvent(
            args as {
              projectPath?: string;
              type: string;
              title: string;
              description: string;
              location?: string;
              tags?: string[];
              outcome?: string;
              relatedEvents?: string[];
            }
          );
          break;

        case 'check_action':
          result = await this.handleCheckAction(
            args as {projectPath?: string; action: string}
          );
          break;

        case 'pack_context':
          result = await this.handlePackContext(
            args as {
              projectPath?: string;
              format?: string;
              output?: string;
            }
          );
          break;

        default:
          return {
            jsonrpc,
            id,
            error: {
              code: -32602,
              message: `未实现的工具处理: ${toolName}`,
            },
          };
      }

      return {
        jsonrpc,
        id,
        result,
      };
    } catch (error) {
      return {
        jsonrpc,
        id,
        error: {
          code: -32000,
          message: `工具执行错误: ${(error as Error).message}`,
        },
      };
    }
  }

  /**
   * 初始化 ContextManager（如尚未初始化）
   *
   * @param projectPath - 项目路径（默认为当前工作目录）
   */
  private async ensureContextManager(
    projectPath?: string
  ): Promise<ContextManager> {
    const root = projectPath || process.cwd();
    if (!this.contextManager) {
      this.contextManager = new ContextManager(root);
      // 尝试加载已有项目上下文
      try {
        await this.contextManager.load();
      } catch {
        // 项目尚未初始化，创建新上下文
        await this.contextManager.init('unnamed');
      }
    }
    return this.contextManager;
  }

  /**
   * 处理 get_context 工具调用
   */
  private async handleGetContext(args: {
    projectPath?: string;
  }): Promise<unknown> {
    const cm = await this.ensureContextManager(args.projectPath);
    const snapshot = await cm.getSnapshot();
    return {snapshot};
  }

  /**
   * 处理 get_summary 工具调用
   */
  private async handleGetSummary(args: {
    projectPath?: string;
    detailed?: boolean;
  }): Promise<unknown> {
    const cm = await this.ensureContextManager(args.projectPath);
    const summary = await cm.getAISummary();
    return {summary};
  }

  /**
   * 处理 record_event 工具调用
   */
  private async handleRecordEvent(args: {
    projectPath?: string;
    type: string;
    title: string;
    description: string;
    location?: string;
    tags?: string[];
    outcome?: string;
    relatedEvents?: string[];
  }): Promise<unknown> {
    const cm = await this.ensureContextManager(args.projectPath);

    const event = await cm.recordEvent({
      type: args.type as never,
      title: args.title,
      description: args.description,
      location: args.location,
      tags: args.tags ?? [],
      outcome: args.outcome as never,
      relatedEvents: args.relatedEvents ?? [],
      metadata: {},
    });

    return {event};
  }

  /**
   * 处理 check_action 工具调用
   */
  private async handleCheckAction(args: {
    projectPath?: string;
    action: string;
  }): Promise<unknown> {
    const cm = await this.ensureContextManager(args.projectPath);
    const gate = cm.getJudgmentGate();
    const result = await gate.checkBeforeAction(args.action);
    return {checkResult: result};
  }

  /**
   * 处理 pack_context 工具调用
   */
  private async handlePackContext(args: {
    projectPath?: string;
    format?: string;
    output?: string;
  }): Promise<unknown> {
    const cm = await this.ensureContextManager(args.projectPath);
    const pkg = await cm.getContextPackage();

    if (args.format === 'markdown') {
      const markdown = this.convertToMarkdown(pkg);
      return {format: 'markdown', content: markdown};
    }

    return {format: 'json', content: pkg};
  }

  /**
   * 将上下文包转换为 Markdown 格式
   *
   * @param pkg - 上下文包
   * @returns Markdown 文本
   */
  private convertToMarkdown(pkg: unknown): string {
    const p = pkg as Record<string, unknown>;
    const lines: string[] = [
      '# 项目上下文包',
      '',
      `> 导出时间: ${new Date().toISOString()}`,
      '',
      '---',
      '',
    ];

    // 快照部分
    if (p.snapshot) {
      const s = p.snapshot as Record<string, unknown>;
      lines.push('## 项目快照', '');
      for (const [key, value] of Object.entries(s)) {
        if (Array.isArray(value)) {
          lines.push(`- **${key}**:`);
          for (const item of value) {
            lines.push(`  - ${item}`);
          }
        } else {
          lines.push(`- **${key}**: ${String(value)}`);
        }
      }
      lines.push('');
    }

    // 摘要部分
    if (p.summary) {
      const s = p.summary as Record<string, unknown>;
      lines.push('## AI 复盘摘要', '');
      for (const [key, value] of Object.entries(s)) {
        if (Array.isArray(value)) {
          lines.push(`### ${key}`, '');
          for (const item of value) {
            lines.push(`- ${item}`);
          }
          lines.push('');
        } else {
          lines.push(`### ${key}`, '');
          lines.push(`${String(value)}`, '');
        }
      }
    }

    return lines.join('\n');
  }
}