# demos.json 与 demos.min.js 的区别

## 概览对比

| 维度 | `demos.json` | `demos.min.js` |
|---|---|---|
| **用途** | 爬虫后端的数据库/数据源 | 浏览器前端直接加载的数据文件 |
| **格式** | 标准 JSON，带缩进和换行 | JavaScript 变量赋值：`window.DEMOS_DATA = [...]` |
| **大小** | 14.5MB（含缩进） | 4.8MB（minified，无空格） |
| **字段数量** | 16 个字段 | 13 个字段 |
| **Top-level 结构** | 包含 `last_updated`、`total_count`、`approved_count` 等元数据 | 仅数组，无元数据包装 |

## demos.json 有但 demos.min.js 没有的字段

| 字段 | 说明 | 前端不需要的原因 |
|---|---|---|
| `forum_url` | 社区原帖链接 | 前端动态拼接 `https://forum.trae.cn/t/topic/{topic_id}` |
| `cover_image` | 封面图 URL | 前端未使用封面图展示 |
| `demo_type` | `attachment`/`external`/`null` | 前端通过 `has_demo` + `demo_url`/`external_url` 即可判断 |
| `demo_file` | 本地绝对路径 | 仅爬虫内部下载管理使用 |
| `approved_source` | `lark_bitable` 或 null | 前端只关心 `approved` 布尔值 |
| `archived` | 归档标记 | 渲染时已在 `get_active_demos()` 中过滤 |

## demos.min.js 的字段列表

```json
{
  "topic_id": 34392,
  "title": "...",
  "excerpt": "...",
  "insight": "...",
  "tags": ["生活娱乐"],
  "views": 128,
  "like_count": 5,
  "author": "username",
  "created_at": "2026-06-19T09:16:36.232Z",
  "demo_url": "demos/34392/demo.html",
  "external_url": null,
  "has_demo": true,
  "approved": false
}
```

## 设计原理

**`demos.json` 是"全量数据库"** —— 爬虫读写、数据管理、后续分析都依赖它。保留所有字段是为了灵活性和可追溯性。

**`demos.min.js` 是"前端视图模型"** —— 只包含渲染卡片所需的最小字段集，minified 后体积减少 67%（14.5MB → 4.8MB），浏览器加载更快。

**关键设计决策**：数据在 `render()` 阶段从"全量"转换为"视图"，而不是让前端处理多余字段。这是 SSG（静态站点生成）架构中典型的"构建时裁剪"策略。
