#!/usr/bin/env node

/**
 * @file CLI 主入口
 * @description ProjectMind 的命令行界面入口。使用 commander 库实现
 *   子命令解析和参数处理。提供以下命令：
 *
 *   pmd init      - 初始化项目上下文
 *   pmd log       - 记录事件
 *   pmd summarize - 生成 AI 复盘摘要
 *   pmd review    - 生成复盘上下文
 *   pmd pack      - 打包导出上下文
 *
 *   pmd mcp       - 启动 MCP 服务器（用于 AI 平台集成）
 *
 * @package project-mind
 */

import {Command} from 'commander';
import * as path from 'path';

// 导入命令模块
import * as initCommand from './commands/init';
import * as logCommand from './commands/log';
import * as summarizeCommand from './commands/summarize';
import * as reviewCommand from './commands/review';
import * as packCommand from './commands/pack';
import {MCPServer} from './mcp/server';

/**
 * 读取 package.json 获取版本号
 */
function getVersion(): string {
  try {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkg = require(pkgPath);
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * 程序入口
 *
 * 配置 commander 并注册所有子命令。
 */
async function main(): Promise<void> {
  const program = new Command();
  const version = getVersion();

  program
    .name('pmd')
    .description('ProjectMind - 项目全生命周期 AI 上下文管理系统')
    .version(version, '-v, --version', '显示版本号');

  // =========================================================================
  // 命令: init
  // 描述: 初始化项目上下文环境
  // =========================================================================
  program
    .command('init')
    .description('初始化项目上下文环境')
    .argument('<name>', '项目名称')
    .option('-d, --description <desc>', '项目描述')
    .option('-t, --template-dir <dir>', '模板目录路径')
    .action(async (name: string, options: Record<string,string>) => {
      try {
        await initCommand.execute(name, {
          description: options.description,
          templateDir: options.templateDir,
        });
      } catch (error) {
        console.error('❌ 初始化失败:', (error as Error).message);
        process.exit(1);
      }
    });

  // =========================================================================
  // 命令: log
  // 描述: 记录新事件到上下文日志
  // =========================================================================
  program
    .command('log')
    .description('记录新事件到上下文日志')
    .argument('<type>', '事件类型（project_init, architecture, decision, bug, bug_fix, feature, feature_done, perf_issue, perf_optimization, review, note）')
    .argument('<title>', '事件标题')
    .option('-d, --description <desc>', '事件详细描述')
    .option('-l, --location <path>', '关联文件路径')
    .option('-t, --tags <tags>', '标签列表（逗号分隔）')
    .option('-o, --outcome <status>', '结果状态（success, failed, partial, pending）')
    .option('-i, --interactive', '交互式输入模式')
    .action(async (type: string, title: string, options: Record<string,string|boolean>) => {
      try {
        await logCommand.execute(type, title, {
          description: options.description as string,
          location: options.location as string,
          tags: options.tags as string,
          outcome: options.outcome as string,
          interactive: options.interactive as boolean,
        });
      } catch (error) {
        console.error('❌ 记录事件失败:', (error as Error).message);
        process.exit(1);
      }
    });

  // =========================================================================
  // 命令: summarize
  // 描述: 生成 AI 复盘摘要
  // =========================================================================
  program
    .command('summarize')
    .description('生成 AI 复盘摘要')
    .option('-o, --output <path>', '输出文件路径（默认 .pmd/summary.md）')
    .action(async (options: Record<string,string>) => {
      try {
        await summarizeCommand.execute({
          output: options.output,
        });
      } catch (error) {
        console.error('❌ 生成摘要失败:', (error as Error).message);
        process.exit(1);
      }
    });

  // =========================================================================
  // 命令: review
  // 描述: 生成 AI 复盘上下文（用于对话开始时的重置）
  // =========================================================================
  program
    .command('review')
    .description('生成 AI 复盘上下文（输出到 stdout，可被 AI 读取）')
    .option('-s, --save', '同时保存到 .pmd/review.md')
    .action(async (options: Record<string,boolean>) => {
      try {
        await reviewCommand.execute({
          save: options.save,
        });
      } catch (error) {
        console.error('❌ 生成复盘上下文失败:', (error as Error).message);
        process.exit(1);
      }
    });

  // =========================================================================
  // 命令: pack
  // 描述: 打包导出项目上下文
  // =========================================================================
  program
    .command('pack')
    .description('打包导出项目上下文')
    .option('-f, --format <format>', '输出格式（json, markdown，默认 json）')
    .option('-o, --output <path>', '输出文件路径')
    .action(async (options: Record<string,string>) => {
      try {
        await packCommand.execute({
          format: options.format,
          output: options.output,
        });
      } catch (error) {
        console.error('❌ 打包失败:', (error as Error).message);
        process.exit(1);
      }
    });

  // =========================================================================
  // 命令: mcp
  // 描述: 启动 MCP 服务器（通过 stdio 与 AI 平台通信）
  // =========================================================================
  program
    .command('mcp')
    .description('启动 MCP 服务器（通过 stdio 与 AI 平台通信）')
    .action(async () => {
      try {
        const server = new MCPServer();
        console.error('🚀 MCP 服务器已启动，等待 JSON-RPC 请求...');
        server.start();
      } catch (error) {
        console.error('❌ MCP 服务器启动失败:', (error as Error).message);
        process.exit(1);
      }
    });

  // 解析命令行参数
  await program.parseAsync(process.argv);
}

// 执行主函数
main().catch((error) => {
  console.error('❌ 程序执行失败:', error.message);
  process.exit(1);
});