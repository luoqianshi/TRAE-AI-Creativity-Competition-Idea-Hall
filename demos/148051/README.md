# 巷食札记 · 附近小吃摊收录

一款面向「好吃嘴」群体的本地化美食地摊信息聚合 demo。
记录身边小吃摊的位置、营业时间、排队热度与招牌菜，做一个不踩雷的寻味地图。

## 快速开始

### 方式 1：双击打开
直接双击 `index.html`，即可在浏览器中查看。

### 方式 2：本地起服务（推荐）
```bash
node server.js
```
然后访问 http://localhost:8765

### 方式 3：Python / 其它静态服务器
```bash
python -m http.server 8765
# 或
npx serve .
```

## 功能

- **寻味首页**：巨幅标题 + 街巷地图（含打孔 pin） + 杂志式卡片错落排版
- **分类筛选**：早餐 / 正餐 / 夜宵 / 甜品 / 饮品
- **关键词搜索**：搜摊位名 / 招牌菜 / 街道
- **摊位详情**：营业时间、排队热度、人均价、招牌菜、好吃嘴打卡
- **收录新摊**：表单录入，提交后即时出现在首页
- **个人中心**：探店勋章、我的收藏

## 设计风格

- 夜市霓虹 + 复古杂志：墨色背景 / 灯笼红 / 琥珀金 / 米白
- 中文字体：ZCOOL XiaoWei + Noto Serif SC + Long Cang 手写体
- 颗粒噪点背景 + 灯笼光晕，烟火气十足

## 技术栈

- 单文件 HTML + 内联 CSS + 原生 JavaScript
- Lucide Icons（CDN）
- Google Fonts（CDN）
- Unsplash 图床（仅作 demo 占位）

## 文件结构

```
.
├── index.html              # 主入口（包含全部 HTML/CSS/JS）
├── server.js               # 本地起服务脚本（Node.js）
├── .trae/documents/
│   ├── PRD.md              # 产品需求文档
│   └── Technical-Architecture.md   # 技术架构文档
└── README.md
```

## 后续扩展

- 接入真实地图 SDK（高德 / 百度 / Mapbox）显示真实坐标
- 后端 API + 数据库（Node.js / Express + SQLite）
- 用户体系（登录、探店积分、勋章成就）
- 实时排队上报（社区协作）
