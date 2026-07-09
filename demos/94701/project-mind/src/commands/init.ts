/**
 * @file init 命令
 * @description 初始化项目上下文环境。创建 .pmd 数据目录、
 *   初始化事件日志、从模板复制初始文件，并生成 .pmdrules 文件。
 *
 *   .pmdrules 文件是 AI 规则文件，告诉 AI 在每次对话前必须执行的操作，
 *   包括项目技术栈、架构概要、重要约定和规则。
 *
 * @package project-mind
 */

import * as path from 'path';
import * as fs from 'fs';
import {ContextManager} from '../core/context-manager';
import {ProjectMindConfig} from '../types';

/**
 * 执行 init 命令
 *
 * @param name - 项目名称
 * @param options - 命令行选项
 * @param options.description - 项目描述
 * @param options.templateDir - 模板目录路径
 */
export async function execute(
  name: string,
  options: {
    description?: string;
    templateDir?: string;
  } = {}
): Promise<void> {
  const projectRoot = process.cwd();
  const pmdDir = path.join(projectRoot, '.pmd');
  const templateDir =
    options.templateDir || path.join(__dirname, '..', '..', 'templates');

  console.log(`🚀 正在初始化项目 "${name}"...`);
  console.log(`📁 项目根目录: ${projectRoot}`);

  // 1. 初始化 ContextManager
  const config: Partial<ProjectMindConfig> = {
    name,
    description: options.description || `${name} 项目`,
    techStack: [],
    rules: [],
  };

  const cm = new ContextManager(projectRoot);
  await cm.init(name, config);

  console.log(`✅ .pmd 目录已创建: ${pmdDir}`);

  // 2. 复制模板文件
  await copyTemplates(templateDir, pmdDir);

  // 3. 生成 .pmdrules 文件
  generatePmdRules(projectRoot, name, options.description);

  console.log(`
📋 项目 "${name}" 初始化完成！

下一步:
  - 使用 pmd log <type> <title> 记录事件
  - 使用 pmd summarize 生成 AI 复盘摘要
  - 使用 pmd review 生成复盘上下文
  - 使用 pmd pack 打包上下文

可用的事件类型:
  project_init, architecture, decision, bug, bug_fix,
  feature, feature_done, perf_issue, perf_optimization,
  review, note
`);
}

/**
 * 复制模板文件到 .pmd 目录
 *
 * @param templateDir - 模板目录
 * @param pmdDir - .pmd 目标目录
 */
async function copyTemplates(
  templateDir: string,
  pmdDir: string
): Promise<void> {
  if (!fs.existsSync(templateDir)) {
    console.warn(`⚠️  模板目录不存在: ${templateDir}，跳过模板复制`);
    return;
  }

  // 读取模板目录中的所有 .md 文件
  const files = fs
    .readdirSync(templateDir)
    .filter((f) => f.endsWith('.md'));

  if (files.length === 0) {
    console.warn('⚠️  模板目录中没有 .md 文件，跳过模板复制');
    return;
  }

  for (const file of files) {
    const sourcePath = path.join(templateDir, file);
    const targetPath = path.join(pmdDir, file);

    try {
      const content = fs.readFileSync(sourcePath, 'utf-8');
      // 替换模板中的占位符
      const processed = content.replace(
        /\{\{project_name\}\}/g,
        path.basename(pmdDir)
      );
      fs.writeFileSync(targetPath, processed, 'utf-8');
      console.log(`  📄 已复制模板: ${file}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ 复制模板失败 ${file}: ${message}`);
    }
  }
}

/**
 * 生成 .pmdrules 文件
 *
 * .pmdrules 是 AI 规则文件，包含：
 * - AI 在每次对话前必须执行的操作
 * - 项目的技术栈和架构概要
 * - 重要的约定和规则
 *
 * @param projectRoot - 项目根目录
 * @param projectName - 项目名称
 * @param description - 项目描述
 */
function generatePmdRules(
  projectRoot: string,
  projectName: string,
  description?: string
): void {
  const rulesPath = path.join(projectRoot, '.pmdrules');
  const content = `# =============================================================================
# .pmdrules — ProjectMind AI 规则文件
# 本文件定义了 AI 在处理此项目时必须遵守的规则和上下文。
# =============================================================================
# 项目名称: ${projectName}
# 描述: ${description || `${projectName} 项目`}
# 生成时间: ${new Date().toISOString()}
# =============================================================================

## 1. 每次对话前必须执行的操作

在每次与用户交互前，AI 必须执行以下步骤：

1. 检查 .pmd 目录是否存在:
   \`\`\`
   ls .pmd/
   \`\`\`

2. 运行 pmd review 获取项目上下文:
   \`\`\`
   npx pmd review
   \`\`\`

3. 阅读最新的复盘摘要（如果存在）:
   \`\`\`
   cat .pmd/summary.md
   \`\`\`

4. 检查项目规则和约定（阅读本文件）。

5. 在做出任何重要操作前，使用 Judgment Gate 检查:
   - 是否在重复之前失败的方案
   - 操作是否涉及到脆弱区域
   - 是否有相关的待处理决策

## 2. 项目技术栈和架构概要

> 请使用 pmd log architecture 记录架构决策。

当前技术栈:（初始化后请在此处填写）
- 等待配置...

## 3. 重要约定和规则

### 事件记录规则

- 每次修复 Bug 后，记录 bug_fix 事件并关联对应的 bug 事件
- 每次完成功能后，记录 feature_done 事件
- 遇到需要决策时，记录 decision 事件
- 遇到性能问题时，记录 perf_issue 事件

### 复盘摘要规则

- AI 在每次对话结束时，应该运行 pmd summarize 更新摘要
- 如果项目事件超过 100 条，默认自动生成摘要

### 预操作判断规则

- 在执行修复前，先检查是否有相同失败历史的记录
- 频繁修改的文件应标记为脆弱区域
- 重要决策需要记录理由和替代方案

---

> 此文件由 ProjectMind 自动生成。
> 编辑此文件以更新项目的 AI 规则和约定。
`;

  fs.writeFileSync(rulesPath, content, 'utf-8');
  console.log(`  📋 已生成规则文件: .pmdrules`);
}