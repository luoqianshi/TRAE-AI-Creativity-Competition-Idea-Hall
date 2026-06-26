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

## 注意事项

1. **增量更新原则**：只处理新增或变更的数据，已有数据不要重复爬取。判断依据是 `topic_id` 是否已在 `demos.json` 中存在。
2. **合并写入**：更新 `demos.json` 时使用合并模式，新数据只覆盖非 None 字段，保留已有字段（如已下载的 demo 文件路径）不被覆盖。
3. **Bitable 字段名不一致**：不同批次的表格字段名可能不同（「帖子标题」vs「创意帖标题」），每次运行时必须先读取字段结构再解析数据。
4. **飞书 API 限速**：lark-cli 调用有内置限速，不需要额外处理。Discourse API 请求间隔 1.5 秒。
5. **安全**：推送后确认 remote URL 中不包含 token。不要在代码或提交信息中暴露任何凭证。
6. **去重**：飞书 6月18日表格实际有 2612 条（标题显示 2607），可能存在少量重复 topic_id，需去重处理。
7. **跳过策略**：如果飞书 Wiki 中没有新增批次、且所有已有记录的审核状态均已正确标记，则本次更新可以只更新 `last_synced` 时间戳和 README 日期，无需重新爬取或渲染。
