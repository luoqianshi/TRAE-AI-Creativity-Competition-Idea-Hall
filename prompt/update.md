# TRAE AI 创造力大赛 Demo Hall - 自动更新任务

你是一个自动化数据更新助手。请严格按照以下步骤执行，完成从飞书审核名单同步、数据爬取、静态站点渲染到 Git 推送部署的完整流程。

---

## 第零步：环境准备

1. 确认当前工作目录为项目根目录（包含 `crawler/`、`data/`、`templates/` 等子目录）。
2. 确认 Python 依赖已安装：

```bash
pip install -r crawler/requirements.txt --break-system-packages
```

3. 确认 Git 已配置用户信息（若未配置，使用仓库历史中的作者信息）：

```bash
git log -1 --format='%an <%ae>'
# 如果返回为空或报错，执行：
git config user.name "TRAE Bot"
git config user.email "trae-bot@example.com"
```

---

## 第一步：从飞书 Wiki 获取最新审核名单

飞书知识库文档地址：`https://bytedance.larkoffice.com/wiki/WN1CwOygLiyM7BkW8X3cMgh7nob`

该文档标题为「TRAE AI 创造力大赛晋级&获奖公示」，其中「报名通过公示」下包含多个批次的多维表格（Bitable）。

### 1.1 获取文档大纲

使用 lark-cli 获取文档结构，定位所有审核批次章节：

```bash
lark-cli docs +fetch --api-version v2 \
  --doc "https://bytedance.larkoffice.com/wiki/WN1CwOygLiyM7BkW8X3cMgh7nob" \
  --scope outline --max-depth 3
```

从返回的 XML 中提取所有 `<h2>` 标签的 `id`，每个 `<h2>` 对应一个审核批次。

### 1.2 获取每个批次的 Bitable 信息

对每个 `<h2>` 的 `id`，使用 `section` 范围读取：

```bash
lark-cli docs +fetch --api-version v2 \
  --doc "https://bytedance.larkoffice.com/wiki/WN1CwOygLiyM7BkW8X3cMgh7nob" \
  --scope section --start-block-id <h2的id> --detail with-ids --max-depth 2
```

从返回的 XML 中提取 `<bitable>` 标签的 `token` 和 `table-id` 属性。

**重要提示**：所有批次的 Bitable 共享同一个 `app_token`，但 `table-id` 不同。每次运行时必须重新获取大纲，因为官方可能新增批次。

### 1.3 读取 Bitable 字段结构

先读取第一个表格的字段名（不同批次的字段名可能不同）：

```bash
lark-cli base +field-list \
  --base-token <app_token> \
  --table-id <table_id>
```

从返回结果中识别三个关键字段：
- **昵称字段**（通常叫「社区昵称」）
- **标题字段**（可能叫「帖子标题」或「创意帖标题」）
- **链接字段**（可能叫「报名帖链接」或「创意帖链接」或「文本 3」）

### 1.4 分页读取所有记录

使用 offset 分页（每页最多 200 条）：

```bash
lark-cli base +record-list \
  --base-token <app_token> \
  --table-id <table_id> \
  --limit 200 --offset 0 --format json
```

返回的 JSON 结构为：
```json
{
  "ok": true,
  "data": {
    "data": [["昵称值", "标题值", "[链接](链接)"], ...],
    "fields": ["社区昵称", "帖子标题", "报名帖链接"],
    "has_more": true
  }
}
```

从每行数据中：
1. 根据 `fields` 数组的顺序定位昵称、标题、链接列
2. 从链接字段提取 URL（格式为 `[url](url)` 的 Markdown，取第一个方括号内的内容）
3. 从 URL 中用正则 `/topic/(\d+)` 提取 `topic_id`
4. 从 `<h2>` 标题中提取批次日期（如「6月25日」）

重复读取直到 `has_more` 为 `false`，offset 每次加上已读取行数。

### 1.5 与本地数据比对

读取本地 `data/approved_projects.json`，提取所有已有的 `topic_id` 集合：

```python
import json
with open('data/approved_projects.json', 'r') as f:
    data = json.load(f)
existing_ids = {r["topic_id"] for r in data["records"] if r.get("topic_id")}
```

从飞书获取的所有 `topic_id` 中，筛选出不在 `existing_ids` 中的新记录。

**如果新记录数为 0，跳到第三步**（但仍需检查 demos.json 中是否有已审核但未标记的记录）。

---

## 第二步：爬取新审核项目的 Demo 数据

对于第一步中发现的每一条新审核记录：

### 2.1 通过 Discourse API 补充元数据

```python
# 调用论坛 API 获取帖子详情
response = requests.get(f"https://forum.trae.cn/t/{topic_id}.json")
topic_detail = response.json()
```

从返回数据中提取：`views`、`like_count`、`tags`、`created_at`、`excerpt`、`image_url`。

### 2.2 提取 Demo 资源

从帖子正文的 `cooked` HTML 中按四层优先级策略提取 Demo：

| 优先级 | 策略 | 实现方式 |
|---|---|---|
| 1 | HTML 附件 | 查找 `<a class="attachment">` 中 `.html/.htm` 后缀的链接 |
| 1b | ZIP 附件 | 查找 `<a class="attachment">` 中 `.zip` 后缀的链接，下载后解压找 HTML |
| 2 | Onebox 链接 | 查找 `<aside class="onebox">` 中的外部链接 |
| 3 | 关键词兜底 | 查找包含 demo/体验/预览/产物/在线 的外部链接 |

排除域名：`github.com`、`bilibili.com`、`forum.trae.cn`、`trae-forum-cdn.trae.com.cn`

### 2.3 下载 Demo 文件

- **HTML 附件**：直接下载到 `demos/{topic_id}/` 目录
- **ZIP 附件**：下载到 `demos/{topic_id}/`，解压后删除 ZIP，查找 HTML 文件（优先 `index.html`）

文件大小限制：HTML 5MB，ZIP 10MB。

### 2.4 更新 demos.json

构建完整的 demo 记录并写入 `data/demos.json`：

```python
record = {
    "topic_id": topic_id,
    "title": title,
    "forum_url": forum_url,
    "author": nickname,
    "approved": True,
    "approved_source": "lark_bitable",
    "created_at": "...",
    "tags": [...],
    "views": 0,
    "like_count": 0,
    "excerpt": "...",
    "cover_image": None,
    "demo_type": "attachment" / "external" / None,
    "demo_file": "demos/32760/xxx.html" / None,
    "demo_url": "demos/32760/xxx.html" / None,
    "external_url": "https://..." / None,
    "has_demo": True / False,
    "archived": False
}
```

使用 `add_or_update` 合并逻辑：如果 `topic_id` 已存在，只覆盖非 None 的新字段（保留已有的 demo 下载信息）。

**已跳过优化**：如果新记录的 `topic_id` 已存在于 `demos.json` 中（只是之前未标记为审核通过），仅需更新 `approved=True` 和 `approved_source="lark_bitable"`，无需重新爬取 Demo。

### 2.5 更新 approved_projects.json

将所有从飞书获取的审核记录（含已有的和新增的）写入 `data/approved_projects.json`：

```python
{
    "last_synced": "2026-06-25",  # 当天日期
    "total": 13144,
    "records": [
        {"topic_id": "44209", "title": "...", "forum_url": "...", "nickname": "...", "date": "6月25日"},
        ...
    ]
}
```

---

## 第三步：检查已有数据中的审核状态遗漏

即使在第一步中没有发现新记录，也需执行此检查：

```python
# 从飞书获取的所有 topic_id 集合
wiki_approved_ids = {所有从飞书获取的 topic_id}

# 检查 demos.json 中 approved=False 但在飞书审核名单中的记录
for demo in demos_data["demos"]:
    if str(demo["topic_id"]) in wiki_approved_ids and not demo.get("approved", False):
        demo["approved"] = True
        demo["approved_source"] = "lark_bitable"
```

---

## 第四步：重新计算统计并渲染

### 4.1 更新 demos.json 统计

```python
active = [d for d in demos["demos"] if not d.get("archived", False)]
demos["total_count"] = len(active)
demos["approved_count"] = sum(1 for d in active if d.get("approved", False))
demos["unapproved_count"] = sum(1 for d in active if not d.get("approved", False))
demos["last_updated"] = datetime.now(timezone.utc).isoformat()
```

### 4.2 生成 demos.min.js

从 `demos.json` 中的活跃记录生成前端数据文件 `data/demos.min.js`：

```javascript
window.DEMOS_DATA = [{"topic_id":123,"title":"...","insight":"...","tags":[...],"views":0,"like_count":0,"author":"...","created_at":"...","demo_url":"...","external_url":null,"has_demo":true,"approved":true},...];
```

每个记录只保留前端渲染所需的字段。`insight` 字段使用规则引擎生成（基于 title + excerpt，无需外部 API），规则如下：
1. 提取「想解决什么问题」后的核心描述
2. 提取「创意介绍」后的项目说明
3. 取 excerpt 中第一个有意义的句子
4. 从 title 中提取副标题（`——` 后的部分）或整个标题
5. 兜底返回「暂无简介」

使用 JSON 紧凑格式（无空格）以减小文件体积。

### 4.3 渲染 index.html

使用 Jinja2 模板引擎渲染 `templates/index.html.j2`，传入统计数据。

---

## 第五步：更新 README.md

### 5.1 更新「当前数据」表格

从 `demos.json` 的统计数据更新 README.md 中「当前数据」部分：

```markdown
| 维度 | 数量 |
|---|---|
| 总报名帖 | **{total_count}** |
| 含 HTML Demo | **{with_demo_count}** |
| 官方审核通过 | **{approved_count}** |
| 暂无 Demo / 未审核 | **{unapproved_count}** |
| 学习工作 | {学习工作赛道数量} |
| 生活娱乐 | {生活娱乐赛道数量} |
| 社会服务 | {社会服务赛道数量} |
| 社会公益 | {社会公益赛道数量} |
| 硬件交互 | {硬件交互赛道数量} |
| 野蛮生长（未分类） | {未分类数量} |
| 已生成 Insight 洞见 | {total_count} |
```

各赛道数量通过统计 `tags` 字段计算。

### 5.2 更新数据更新时间和来源

更新 README.md 底部的更新时间提示行：

```markdown
> 数据更新时间：{今天的日期，格式 YYYY-MM-DD} · 来源：[forum.trae.cn 大赛报名专区](https://forum.trae.cn/c/38-category/40-category/40) + 飞书官方审核名单（{所有批次日期，用 + 连接}）
```

批次日期来源于飞书 Wiki 中每个 `<h2>` 标题提取的日期。

---

## 第六步：提交并推送到 GitHub

### 6.1 Git 提交

```bash
git add data/approved_projects.json data/demos.json data/demos.min.js index.html README.md demos/

# 如果有新的 demo 文件下载，也加入 demos/ 目录
git add demos/
```

使用 Conventional Commits 格式提交：

```bash
git commit -m "data: sync approved list from wiki ({YYYY-MM-DD})

- Add {新增审核数量} new approved entries from {批次日期} batch
- Update approved status in demos.json ({更新数量} records)
- Regenerate demos.min.js ({总记录数} records)
- Update README.md stats and data source date"
```

### 6.2 推送到 main 分支

```bash
git push origin main
```

推送后，GitHub Actions 会自动部署到 GitHub Pages。

---

## 关键文件说明

| 文件 | 用途 | 修改频率 |
|---|---|---|
| `data/approved_projects.json` | 飞书审核名单（主数据源） | 每次更新 |
| `data/demos.json` | 全量 demo 数据（含审核状态、Demo 下载信息） | 每次更新 |
| `data/demos.min.js` | 前端数据文件（仅渲染所需字段，紧凑 JSON） | 每次更新 |
| `index.html` | 静态站点骨架 HTML | 每次更新 |
| `README.md` | 项目说明文档（含统计表格） | 每次更新 |
| `crawler/config.json` | 爬虫配置（API 地址、分类 ID、限速参数等） | 极少修改 |
| `crawler/crawler_v2.py` | 爬虫主程序（v2 双数据源策略） | 极少修改 |
| `templates/index.html.j2` | Jinja2 模板 | 极少修改 |

---

## 已知问题与踩坑记录

> 以下问题在 2026-06-26 日的更新中实际遇到，后续执行时需特别注意。

### 问题 1：TRAE 沙箱环境中 `gh` CLI 未安装

**现象**：上一次会话中通过 `apt install gh` 安装过 `gh`，但在新的沙箱会话中该包不存在（`dpkg -L gh` 报错）。

**影响**：无法使用 `gh auth login` 进行 GitHub 认证。

**解决方案**：沙箱环境不保证跨会话持久化，**每次新会话都必须重新安装 `gh`**。替代方案是直接用 `git remote set-url origin https://<TOKEN>@github.com/...` 配置 remote URL 来完成推送。

### 问题 2：飞书审核名单中有大量已存在于 demos.json 但未标记 approved 的记录

**现象**：2026-06-26 运行时，飞书 Wiki 获取到 13,641 条唯一审核记录，本地 `approved_projects.json` 仅有 13,144 条，但 `demos.json` 中的已通过数（`approved_count`）仍为 12,524。存在约 600+ 条记录在飞书审核名单中，但 demos.json 中 `approved` 仍为 `false`。

**原因**：`approved_projects.json` 的数据写入与 `demos.json` 的 `approved` 字段更新是两个独立步骤。之前的更新流程在写入 `approved_projects.json` 时直接全量覆盖，但未能将 demos.json 中对应的记录标记为 `approved=True`。

**解决方案**：在执行完飞书数据同步后，**必须**执行第三步（检查已有数据中的审核状态遗漏），将飞书审核名单中的所有 topic_id 与 demos.json 中的记录做交叉比对，把遗漏的 `approved` 字段补上。

### 问题 3：lark-cli 认证不支持交互式管理

**现象**：运行 `lark-cli auth status` 返回错误：`"auth" is not supported: credentials are provided externally and do not support interactive management`。

**影响**：无实际影响，lark-cli 在沙箱环境中凭证由外部注入，直接调用 API 命令即可正常工作，不需要也不支持手动登录/切换。

### 问题 4：飞书 Bitable 字段顺序不一致

**现象**：不同批次的 Bitable 表格，字段顺序和名称不同：
- **6月26日批次**：`["社区昵称", "报名帖标题", "链接"]`（字段顺序为 昵称→标题→链接）
- **6月16日批次**：`["社区昵称", "创意帖链接", "创意帖标题"]`（字段顺序为 昵称→链接→标题）

**影响**：如果按固定列索引（如始终取第 2 列为标题、第 3 列为链接）解析数据，会导致字段张冠李戴。

**解决方案**：**必须**先读取每个批次的 `fields` 数组，通过字段名（而非列索引）定位昵称、标题、链接列，再按实际索引提取数据。参考 1.3 节。

### 问题 5：飞书 Wiki 审核名单总数与 approved_projects.json 不一致

**现象**：`approved_projects.json` 中 `total` 字段为 13,144，但飞书 Wiki 实际有 13,641 条唯一审核记录。差异约 497 条来自新增的 6月26日批次。

**解决方案**：每次同步时以飞书 Wiki 为准，全量覆盖 `approved_projects.json`。但如果只是同步了 approved_projects.json 而没有执行第三步的 demos.json 交叉比对，demos.min.js 中的 approved 数量不会自动更新。

### 问题 6：crawelr_v2.py 处理约 500 条新记录耗时极长（>10 分钟）

**现象**：运行 `crawler_v2.py` 处理 6月26日批次新增的约 498 条审核记录时，每条记录需调用 Discourse API 获取帖子详情、下载附件、解压 ZIP 等，总计耗时超过 10 分钟。

**影响**：如果当前会话有超时限制，可能会被中断。

**解决方案**：
1. 在 TRAE 定时任务中，确保超时配置足够长（建议 30 分钟以上）。
2. 如果只更新审核状态（approved flag），可以跳过 Demo 下载步骤，仅运行 `daily_update.py` 脚本中的审核状态同步部分。

### 问题 7：ZIP 解压后文件名乱码

**现象**：部分 ZIP 附件解压后，HTML 文件名为乱码（如 `╓░│í┤φ╩┬▒╛.html`），这是因为原 ZIP 使用了 GBK/GB2312 编码。

**影响**：文件仍然可用，但文件名不可读。不影响功能，仅影响可维护性。

### 问题 8：部分 ZIP 附件解压后不含 HTML 文件

**现象**：多次出现 `WARNING: ZIP contained no HTML files` 的警告。

**原因**：部分参赛者上传的 ZIP 包中不含 HTML 文件（可能是源码压缩包、图片包等）。

**影响**：这些记录的 `has_demo` 保持为 `false`，卡片按钮置灰显示「暂无 Demo」。

---

### 自动记录问题（2026-06-29）

- Failed to fetch batch '6月24日（截至6.24 08:00）通过1286个': Expecting value: line 1 column 1 (char 0)

### 问题 9：Bitable 链接字段可能为非字符串类型（2026-06-29 发现）

**现象**：运行 `fetch_bitable_records` 时出现 `TypeError: expected string or bytes-like object`，原因是某些行的链接字段不是字符串（可能是 `null`、列表或字典）。

**解决方案**：在 `scripts/daily_update.py` 中对 `link_field`、`nickname`、`title` 字段进行类型检查，非字符串时转换为字符串或空字符串。已修复。

### 问题 10：部分批次获取失败会导致数据丢失（2026-06-29 发现）

**现象**：`daily_update.py` 最初的逻辑是：从 Wiki 获取所有批次记录后，直接以 Wiki 数据全量覆盖 `approved_projects.json`。如果某个批次获取失败（如 6月24日批次返回空 JSON），则该批次的所有记录会丢失（1286 条）。

**解决方案**：改为"已有记录为基础，合并 Wiki 新数据"的策略。即先加载本地 `approved_projects.json`，再将成功获取的 Wiki 记录合并覆盖进去，失败批次的旧数据得以保留。已修复。

### 问题 11：daily_update.py 不包含新记录爬取步骤（2026-06-29 发现）

**现象**：`scripts/daily_update.py` 只做了审核名单同步和 approved 状态标记，但没有调用 `crawler_v2.py` 来爬取新审核记录的 Demo 附件和元数据。新审核通过的记录如果不在 demos.json 中，就不会被添加。

**解决方案**：`daily_update.py` 完成审核名单同步后，需要调用 `crawler_v2.py` 的 `crawl()` 方法来爬取新记录，或者至少为缺失的审核记录创建最小条目（title、author、approved=True 等基础字段）。后续版本应集成完整爬取流程。

### 问题 12：爬虫处理大量新记录耗时极长（2026-06-29 验证）

**现象**：处理约 1,400 条新审核记录时，由于 Discourse API 限速 1.5 秒/请求 + Demo 附件下载，总耗时超过 30 分钟（在 30 分钟 timeout 内未能完成全部处理）。

**解决方案**：
1. 定时任务超时设置应不低于 45 分钟
2. `crawler_v2.py` 已有 checkpoint 机制（每 100 条保存一次），超时后重新运行会从断点继续
3. 可以考虑增加并发下载或适当减小限速

### 问题 13：部分 tags 字段存在异常值（2026-06-29 发现）

**现象**：tags 统计中出现了非标准标签名：`'标题】【学习工作': 2, '生活服务': 8, '互动娱乐': 1, '看病挂号': 1, 'featured': 1, '社会服务（社会公益）': 1, '工作学习': 1`。这些来自论坛帖子的原始标签，未经过标准化映射。

**影响**：赛道分类统计不准确。

**解决方案**：后续需在爬虫中增加标签标准化映射逻辑，将非标准标签映射到五大标准赛道（学习工作、生活娱乐、社会服务、社会公益、硬件交互）或"野蛮生长"。


## 注意事项

1. **增量更新原则**：只处理新增或变更的数据，已有数据不要重复爬取。判断依据是 `topic_id` 是否已在 `demos.json` 中存在。
2. **合并写入**：更新 `demos.json` 时使用合并模式，新数据只覆盖非 None 字段，保留已有字段（如已下载的 demo 文件路径）不被覆盖。
3. **Bitable 字段名不一致**：不同批次的表格字段名可能不同（「帖子标题」vs「创意帖标题」），每次运行时必须先读取字段结构再解析数据。
4. **飞书 API 限速**：lark-cli 调用有内置限速，不需要额外处理。Discourse API 请求间隔 1.5 秒。
5. **安全**：推送后确认 remote URL 中不包含 token。不要在代码或提交信息中暴露任何凭证。
6. **去重**：飞书 6月18日表格实际有 2612 条（标题显示 2607），可能存在少量重复 topic_id，需去重处理。
7. **跳过策略**：如果飞书 Wiki 中没有新增批次、且所有已有记录的审核状态均已正确标记，则本次更新可以只更新 `last_synced` 时间戳和 README 日期，无需重新爬取或渲染。
