# TRAE AI 创造力大赛 Demo Hall — 问题与解决方案总结

> 本文档汇总了项目开发与日常运维中遇到的各类问题、根因分析及最终采取的解决方案，按类别归档，供后续维护参考。

---

## 一、环境与基础设施

### 1.1 TRAE 沙箱环境中 `gh` CLI 未安装

**现象**：上一次会话中通过 `apt install gh` 安装过 `gh`，但在新的沙箱会话中该包不存在（`dpkg -L gh` 报错）。

**根因**：TRAE 沙箱环境不保证跨会话的包安装持久化，每次新会话都是干净环境。

**解决方案**：不依赖 `gh` CLI，改用 `git remote set-url origin https://<TOKEN>@github.com/...` 直接配置 remote URL 完成推送。每次新会话需重新配置 Git 用户信息和 remote URL。

### 1.2 lark-cli 认证不支持交互式管理

**现象**：运行 `lark-cli auth status` 返回错误：`"auth" is not supported: credentials are provided externally and do not support interactive management`。

**根因**：lark-cli 在 TRAE 沙箱环境中凭证由外部注入，不支持手动登录/切换。

**解决方案**：无实际影响，直接调用 `lark-cli docs +fetch` 和 `lark-cli base +record-list` 等 API 命令即可正常工作，无需也不支持手动认证管理。

### 1.3 Python 依赖缺失（jinja2）

**现象**：运行 `daily_update.py` 时报 `No module named 'jinja2'`。

**根因**：沙箱环境每次新会话重置，之前安装的 Python 包不持久化。

**解决方案**：每次新会话执行 `pip install -r crawler/requirements.txt --break-system-packages` 重新安装依赖。关键依赖包括 `requests`、`beautifulsoup4`、`jinja2`、`playwright`。

---

## 二、飞书数据同步

### 2.1 审核名单已存在但 demos.json 未标记 approved

**现象**：飞书 Wiki 获取到 13,641 条唯一审核记录，但 `demos.json` 中 `approved_count` 仅为 12,524，存在约 600+ 条记录在飞书审核名单中但 `approved` 仍为 `false`。

**根因**：`approved_projects.json` 的数据写入与 `demos.json` 的 `approved` 字段更新是两个独立步骤，之前的流程只更新了前者而遗漏了后者。

**解决方案**：在飞书数据同步后增加**第三步交叉比对**——遍历 `demos.json` 中所有记录，将飞书审核名单中的 `topic_id` 与之匹配，遗漏的 `approved` 字段统一补上。该步骤已集成到 `daily_update.py` 的 `update_demos_json_approved()` 函数中。

### 2.2 Bitable 字段顺序不一致

**现象**：不同批次的 Bitable 表格字段顺序和名称不同：
- 6月26日批次：`["社区昵称", "报名帖标题", "链接"]`（昵称→标题→链接）
- 6月16日批次：`["社区昵称", "创意帖链接", "创意帖标题"]`（昵称→链接→标题）

**根因**：飞书多维表格由不同人员在不同时间创建，字段排列顺序无统一规范。

**解决方案**：放弃固定列索引解析，改为**先读取 `fields` 数组，通过字段名关键词匹配**（"昵称"→昵称列、"标题"→标题列、"链接"/"url"→链接列）定位实际索引，再按索引提取数据。

### 2.3 Bitable 链接字段为非字符串类型

**现象**：`fetch_bitable_records` 出现 `TypeError: expected string or bytes-like object`，某些行的链接字段为 `null`、列表或字典。

**根因**：飞书 Bitable 的字段类型多样，链接字段可能为空值或复杂对象。

**解决方案**：对 `link_field`、`nickname`、`title` 三个字段统一做类型检查——非字符串时调用 `str()` 转换或赋空字符串 `''`。

### 2.4 部分批次获取失败导致数据丢失

**现象**：`daily_update.py` 最初采用"Wiki 数据全量覆盖"策略，当某批次获取失败（如返回空 JSON）时，该批次的所有记录（如 1286 条）会从 `approved_projects.json` 中丢失。

**根因**：全量覆盖策略下，失败批次等于"零数据"覆盖了原有数据。

**解决方案**：改为**"已有记录为基础，合并 Wiki 新数据"**策略——先加载本地 `approved_projects.json` 作为 baseline，再将成功获取的 Wiki 记录合并覆盖进去，失败批次的旧数据得以保留。

### 2.5 飞书 Wiki 审核名单总数与本地不一致

**现象**：`approved_projects.json` 中 `total` 为 13,144，但飞书 Wiki 实际有 13,641 条唯一审核记录，差异来自新增批次。

**解决方案**：每次同步以飞书 Wiki 为准，合并新数据到 `approved_projects.json`。同时确保执行第三步交叉比对，使 `demos.min.js` 中的 `approved` 数量同步更新。

---

## 三、爬虫与数据爬取

### 3.1 爬虫处理大量新记录耗时极长

**现象**：处理 500~1,400 条新记录时，由于 Discourse API 限速 1.5 秒/请求 + 附件下载，总耗时超过 30 分钟。

**根因**：串行处理，每条记录需 API 调用 + 网络 IO + 解压，累积耗时巨大。

**解决方案**：
1. 定时任务超时设置为不低于 45 分钟
2. `crawler_v2.py` 引入 **checkpoint 机制**（每 25 条保存一次），超时后重新运行从断点继续
3. `daily_update.py` 对已存在于 `demos.json` 中的记录跳过爬取，仅处理新增记录

### 3.2 `daily_update.py` 未集成 Demo 爬取步骤

**现象**：`daily_update.py` 只做了审核名单同步和 approved 状态标记，新审核记录以 `has_demo=False` 写入 `demos.json`，但后续爬虫因 `is_existing=True` 跳过它们，导致 Demo 永远无法被自动抓取。

**根因**：审核名单同步与 Demo 爬取是两个独立流程，中间缺少衔接。

**解决方案**：`daily_update.py` 在完成审核名单同步后，新增 `crawl_missing_demos()` 函数，对新增 approved 记录中 `has_demo=False` 的条目主动调用 `crawler_v2.py` 的 Discourse API 获取帖子详情并下载附件。

### 3.3 已下载 Demo 但 `has_demo=False`

**现象**：743 条 approved 记录显示「暂无 Demo」，但其中 403 条在 `demos/<topic_id>/` 目录中已存在 HTML 文件。

**根因**：爬虫 `_download_and_process_attachment()` 成功下载文件并修改了内存中的 `demo_record`，但在 `add_or_update()` + `save()` 执行前因超时中断。下次重启时 `is_existing=True` 导致该记录被跳过，`has_demo` 始终维持 `False`。

**解决方案**：
1. 编写一次性修复脚本扫描 `demos/` 磁盘目录，为 403 条记录补回 `has_demo=True`、`demo_file`、`demo_url`（commit ad71a11e）
2. `daily_update.py` 增加 `ensure_demo_dir_has_record()` 函数，每次运行时检查磁盘上已有 HTML 文件但 `has_demo=False` 的记录并自动修复

### 3.4 Extra topics 下载后从 demos.json 丢失

**现象**：254 个 `demos/` 文件夹（topic_id > 50000）对应的记录完全不在 `demos.json` 中，网站卡片不显示这些帖子。

**根因**：`_crawl_discourse_extra()` 方法遍历 Discourse API 获取不在 approved 列表中的新帖子，下载附件后调用 `add_or_update()`，但**该方法内没有任何 `save()` 调用**。爬虫在 Extra topics 阶段超时后，所有新增记录全部丢失。

**解决方案**：
1. 将 320 条磁盘记录反写回 `demos.json`
2. 在 `crawler_v2.py` 的 `_crawl_discourse_extra()` 中增加每 50 条 checkpoint save + 阶段结束最终 save（commit ad71a11e）

### 3.5 Checkpoint 间隔过大导致数据丢失

**现象**：approved 阶段每 100 条才 checkpoint 一次，处理时间远超 timeout 阈值。

**根因**：每条记录需下载 HTML/ZIP 附件（含网络 IO 和解压），100 条的处理时间常超过 15-20 分钟。timeout 30 分钟下，后半段的 save 可能无法执行。

**解决方案**：将 approved 阶段 checkpoint 间隔从 100 条降至 **25 条**（commit ad71a11e）。

---

## 四、数据质量

### 4.1 ZIP 解压后文件名乱码

**现象**：部分 ZIP 附件解压后 HTML 文件名为乱码（如 `╓░│í┤φ╩┬▒╛.html`），原 ZIP 使用了 GBK/GB2312 编码。

**影响**：文件仍然可用，不影响功能，仅影响可维护性。

**解决方案**：暂不处理，文件名乱码不影响 HTML 渲染和截图功能。后续可考虑在解压时统一转换为 UTF-8。

### 4.2 ZIP 附件不含 HTML 文件

**现象**：多次出现 `WARNING: ZIP contained no HTML files` 警告。

**根因**：部分参赛者上传的 ZIP 包中不含 HTML 文件（可能是源码压缩包、图片包等）。

**影响**：这些记录的 `has_demo` 保持为 `false`，卡片按钮置灰显示「暂无 Demo」。

**解决方案**：无法从用户上传内容中提取 Demo，保持 `has_demo=False` 为正确行为。前端正常显示占位状态。

### 4.3 Tags 字段存在异常值

**现象**：tags 统计中出现了非标准标签名：`'标题】【学习工作'`、`'生活服务'`、`'互动娱乐'`、`'看病挂号'`、`'featured'`、`'社会服务（社会公益）'`、`'工作学习'` 等，来自论坛帖子的原始标签。

**根因**：论坛用户手动添加的标签未经过标准化映射。

**解决方案**：在 `daily_update.py` 的 `infer_tags()` 函数中增加标签标准化映射逻辑，通过关键词匹配将非标准标签归入五大标准赛道（学习工作、生活娱乐、社会服务、社会公益、硬件交互）或"野蛮生长"。待进一步完善映射规则覆盖所有边缘情况。

---

## 五、截图生成

### 5.1 外部 URL 截图超时

**现象**：批量截图生成时，部分外部 URL（如 `trae.mobile.vololapp.com`、`8.222.216.189`）连接超时或被关闭，导致截图失败。

**根因**：外部托管的 demo 页面可能服务不稳定、网络不通或已下线。

**解决方案**：截图脚本设置 15 秒超时，失败时将 `screenshot` 字段设为 `null`，前端显示"暂无预览"占位图。不影响其他记录的截图生成。三轮批量截图共处理 19,000+ 张，错误率约 1.25%。

### 5.2 大规模截图任务性能优化

**现象**：单进程截图 13,000+ 张耗时过长。

**解决方案**：采用**分片并行策略**——将 topic_id 按 mod 3 分为三个分片，启动 3 个独立 worker 进程，每个运行自己的 Chromium 实例和 5 路并发页面，总吞吐量约 3.3 张/秒，13,259 张在 64 分钟内完成。

### 5.3 附件文件大小超限

**现象**：爬虫下载 HTML 附件时报 `File too large: 6913783 bytes > 5242880 bytes`。

**根因**：部分参赛者上传的 HTML 文件内嵌大量 base64 图片或内联 CSS，超过 5MB 限制。

**解决方案**：保持 5MB（HTML）/10MB（ZIP）大小限制，超限文件跳过下载，记录错误日志，`has_demo` 保持 `false`。

---

## 六、前端渲染

### 6.1 自动无限滚动"鬼畜"抖动

**现象**：自动无限滚动曾出现页面抖动问题。

**解决方案**：取消自动无限滚动，改为底部「加载更多」按钮手动触发，每批 50 张。同时实现 DOM 回收：超过 200 张时移除顶部批次，保留 150 张缓冲。

### 6.2 万级卡片渲染性能

**现象**：10,000+ 卡片直接渲染导致页面卡顿。

**解决方案**：
1. `content-visibility: auto` 跳过离屏卡片渲染
2. `contain-intrinsic-size` 预留空间避免布局抖动
3. transition 仅对 opacity/transform/border-color/box-shadow 启用
4. 所有筛选/搜索/排序在 JS 数组上完成（O(n) 不操作 DOM），搜索 300ms 防抖

---

## 七、运维与部署

### 7.1 Git 推送认证

**现象**：沙箱环境无 `gh` CLI，且 GitHub 密码认证已废弃。

**解决方案**：使用 Personal Access Token (PAT) 配置 remote URL：`git remote set-url origin https://<TOKEN>@github.com/...`。注意：推送后确认 remote URL 中不包含 token，不在代码或提交信息中暴露凭证。

### 7.2 定时任务超时配置

**现象**：每日更新任务在 30 分钟 timeout 内经常无法完成全部处理。

**解决方案**：
1. 定时任务超时设置为不低于 45 分钟
2. 爬虫 checkpoint 机制（每 25 条保存）确保超时后可断点续传
3. 增量更新原则——只处理新增或变更数据，已有数据不重复爬取

---

## 问题追踪统计

| 类别 | 问题数 | 已修复 | 待优化 |
|---|---|---|---|
| 环境与基础设施 | 3 | 3 | 0 |
| 飞书数据同步 | 5 | 5 | 0 |
| 爬虫与数据爬取 | 5 | 5 | 0 |
| 数据质量 | 3 | 1 | 2 |
| 截图生成 | 3 | 3 | 0 |
| 前端渲染 | 2 | 2 | 0 |
| 运维与部署 | 2 | 2 | 0 |
| **合计** | **23** | **21** | **2** |

> 待优化项：ZIP 文件名乱码（影响可维护性）、Tags 标准化映射规则待完善。
