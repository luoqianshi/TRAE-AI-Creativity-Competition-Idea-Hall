/**
 * @file pack 命令
 * @description 打包所有项目上下文为单个文件。支持 JSON 和 Markdown 两种格式。
 *   打包后的文件可以跨平台、跨 AI 共享，方便将完整的项目上下文迁移到
 *   其他开发环境或 AI 平台。
 *
 * @package project-mind
 */

import * as path from 'path';
import * as fs from 'fs';
import {ContextManager} from '../core/context-manager';
import {ContextPackage} from '../types';

/**
 * 执行 pack 命令
 *
 * @param options - 命令行选项
 */
export async function execute(
  options: {
    format?: string;
    output?: string;
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

  // 获取格式
  const format = (options.format || 'json').toLowerCase();
  if (format !== 'json' && format !== 'markdown') {
    console.error(`❌ 不支持的格式: "${format}"。支持: json, markdown`);
    process.exit(1);
  }

  console.log(`📦 正在打包项目上下文 (格式: ${format})...`);

  // 获取上下文包
  const pkg = await cm.getContextPackage();

  // 根据格式生成输出
  let outputContent: string;
  let outputPath: string;

  if (format === 'json') {
    outputContent = JSON.stringify(pkg, null, 2);
    outputPath =
      options.output || path.join(projectRoot, 'project-context.json');
  } else {
    outputContent = convertToMarkdown(pkg);
    outputPath =
      options.output || path.join(projectRoot, 'project-context.md');
  }

  // 写入文件（如果指定了 --output，则写入文件；否则输出到 stdout）
  if (options.output) {
    fs.writeFileSync(outputPath, outputContent, 'utf-8');
    console.log(`✅ 上下文已导出到: ${outputPath}`);
  } else {
    // 默认为输出到控制台
    console.log('\n' + '='.repeat(60));
    console.log('项目上下文包:');
    console.log('='.repeat(60));
    console.log(outputContent);
    console.log('='.repeat(60));
    console.log(
      `\n💡 使用 --output <path> 参数可保存到文件。`
    );

    // 同时默认保存到文件方便查看
    const defaultPath = path.join(
      cm.getPmdDir(),
      format === 'json' ? 'context.json' : 'context.md'
    );
    fs.writeFileSync(defaultPath, outputContent, 'utf-8');
    console.log(`📁 已同时保存到: ${defaultPath}`);
  }
}

/**
 * 将上下文包转换为 Markdown 格式
 *
 * @param pkg - 上下文包
 * @returns Markdown 文本
 */
function convertToMarkdown(pkg: ContextPackage): string {
  const lines: string[] = [
    '# 项目上下文包',
    '',
    `> **项目名称**: ${pkg.snapshot.name}`,
    `> **版本**: ${pkg.snapshot.version}`,
    `> **导出时间**: ${new Date().toISOString()}`,
    `> **事件总数**: ${pkg.snapshot.eventCount}`,
    '',
    '---',
    '',
    '## 1. 项目快照',
    '',
    `- **名称**: ${pkg.snapshot.name}`,
    `- **版本**: ${pkg.snapshot.version}`,
    `- **描述**: ${pkg.snapshot.description}`,
    `- **技术栈**: ${pkg.snapshot.techStack.join(', ') || '未配置'}`,
    `- **最后更新**: ${pkg.snapshot.lastUpdated}`,
    '',
    '### 架构',
    '',
    pkg.snapshot.architecture || '暂无架构记录。',
    '',
    '### 关键决策',
    '',
  ];

  if (pkg.snapshot.decisions.length > 0) {
    for (const decision of pkg.snapshot.decisions) {
      lines.push(`- ${decision}`);
    }
  } else {
    lines.push('暂无决策记录。');
  }
  lines.push('');

  if (pkg.snapshot.activeBugs.length > 0) {
    lines.push('### 活跃 Bug', '');
    for (const bug of pkg.snapshot.activeBugs) {
      lines.push(`- ⚠️ ${bug}`);
    }
    lines.push('');
  }

  if (pkg.snapshot.recentFeatures.length > 0) {
    lines.push('### 最近完成的功能', '');
    for (const feature of pkg.snapshot.recentFeatures) {
      lines.push(`- ✅ ${feature}`);
    }
    lines.push('');
  }

  lines.push('---', '', '## 2. AI 复盘摘要', '');

  const summary = pkg.summary;
  lines.push('### 项目状态', '', summary.projectState, '');
  lines.push('### 最近活动', '', summary.recentActivity, '');

  if (summary.unresolvedIssues.length > 0) {
    lines.push('### 未解决的问题', '');
    for (const issue of summary.unresolvedIssues) {
      lines.push(`- ⚠️ ${issue}`);
    }
    lines.push('');
  }

  if (summary.pendingDecisions.length > 0) {
    lines.push('### 待处理的决策', '');
    for (const decision of summary.pendingDecisions) {
      lines.push(`- ❓ ${decision}`);
    }
    lines.push('');
  }

  if (summary.lessonsLearned.length > 0) {
    lines.push('### 经验教训', '');
    for (const lesson of summary.lessonsLearned) {
      lines.push(`- 💡 ${lesson}`);
    }
    lines.push('');
  }

  if (summary.fragileAreas.length > 0) {
    lines.push('### 脆弱区域', '');
    for (const area of summary.fragileAreas) {
      lines.push(`- 🔴 ${area}`);
    }
    lines.push('');
  }

  if (summary.failedAttempts.length > 0) {
    lines.push('### 失败的尝试', '');
    for (const attempt of summary.failedAttempts) {
      lines.push(`- ❌ ${attempt}`);
    }
    lines.push('');
  }

  lines.push('### 下一步建议', '', summary.nextSuggestedAction, '');
  lines.push('---', '', '## 3. 配置信息', '');
  lines.push('```json');
  lines.push(
    JSON.stringify(
      {
        name: pkg.config.name,
        version: pkg.config.version,
        rules: pkg.config.rules,
        maxEventsBeforeSummarize: pkg.config.maxEventsBeforeSummarize,
      },
      null,
      2
    )
  );
  lines.push('```');

  if (pkg.events.length > 0) {
    lines.push('', '---', '', '## 4. 事件日志', '');
    lines.push(
      `> 共 ${pkg.events.length} 个事件（仅显示前 20 条）`,
      ''
    );

    const displayEvents = pkg.events.slice(0, 20);
    for (const event of displayEvents) {
      lines.push(
        `- **[${event.timestamp}] [${event.type}]** ${event.title} ` +
          `(${event.outcome ?? '无状态'})`
      );
    }

    if (pkg.events.length > 20) {
      lines.push(
        `- ... 还有 ${pkg.events.length - 20} 个事件未显示`
      );
    }
  }

  return lines.join('\n');
}