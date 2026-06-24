# 🌟 星星的孩子（StarTalk）

> AI情绪表达与社交训练公益助手 · 为孤独症儿童设计

---

## 项目简介

"星星的孩子"是一个面向 6~12 岁孤独症（ASD）儿童的 AI 公益陪伴工具。  
通过情绪表达、社交训练、表情游戏和 AI 绘本，帮助孩子学习理解和表达情感。

**不提供** 医疗诊断 / 心理治疗  
**提供** 温柔陪伴 / 情绪引导 / 社交训练 / 家长报告

---

## 功能模块

| 模块 | 说明 |
|------|------|
| 😊 今日心情 | 选择情绪 → AI星宝温柔回应 → 引导表达 |
| 💬 星宝聊天 | 与 AI 星宝进行多轮对话陪伴 |
| 🎭 社交训练 | 模拟真实情景，学习正确沟通方式 |
| 🎮 表情游戏 | 表情认知问答，答对获得星星 |
| 📖 AI 绘本 | 选择主题，AI 实时生成疗愈故事 |
| ⭐ 星星墙 | 成长里程碑，游戏化激励机制 |
| 📊 家长报告 | 本周情绪分布 + 训练统计 |

---

## 快速开始

### 方式一：直接打开（推荐）

```bash
# 用浏览器直接打开 index.html
open index.html
```

> ⚠️ 由于浏览器跨域限制，建议用本地服务器打开：

```bash
# 方式二：使用 Python 本地服务器
cd startalk
python3 -m http.server 3000
# 然后访问 http://localhost:3000
```

```bash
# 方式三：使用 Node.js serve
npx serve .
```

### 获取 API Key

1. 访问 [https://console.anthropic.com](https://console.anthropic.com)
2. 注册并创建 API Key
3. 在应用首页输入 API Key 即可开始使用

> API Key 仅存储在本地浏览器（localStorage），不会上传到任何服务器。

---

## 项目结构

```
startalk/
├── index.html              # 主入口
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── stars-bg.js         # 星空背景动画
│   ├── data.js             # 全局数据状态
│   ├── api.js              # Claude API 封装
│   ├── app.js              # 主控制器
│   ├── report.js           # 家长报告
│   └── tabs/
│       ├── mood.js         # 今日心情
│       ├── chat.js         # 星宝聊天
│       ├── social.js       # 社交训练
│       ├── game.js         # 表情游戏
│       ├── story.js        # AI 绘本
│       └── wall.js         # 星星墙
└── README.md
```

---

## 技术栈

- **前端**：原生 HTML / CSS / JavaScript（无框架依赖）
- **AI**：Claude Sonnet（claude-sonnet-4-6）
- **字体**：Google Fonts（Ma Shan Zheng + Nunito）
- **数据**：localStorage（本地持久化）
- **部署**：任意静态托管（Vercel / GitHub Pages / Netlify）

---

## 部署到 Vercel

```bash
npm i -g vercel
cd startalk
vercel --prod
```

---

## 扩展方向

- [ ] 儿童画情绪识别（上传图片 → AI 分析色彩情绪）
- [ ] 语音输入（让不善打字的孩子也能使用）
- [ ] 多语言支持（普通话 / 英语）
- [ ] 后端数据库（MongoDB，支持多设备同步）
- [ ] 家长端独立界面

---

## 公益声明

本项目为公益性质，代码开源，欢迎所有人参与贡献。  
每一个孩子都是夜空中独一无二的星星 ⭐

---

*由 AI 辅助构建，基于 StarTalk 项目设计方案*
