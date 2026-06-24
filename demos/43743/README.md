# 奇想小剧场 (Fantasy Theater)

为 1-6 岁儿童设计的"家长输入关键词 -> AI 生成专属故事 -> 父母声音播讲"Web 应用。

## 技术栈
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- SQLite (Node 24 内置 node:sqlite)
- OpenAI GPT-4o-mini (故事生成)
- OpenAI TTS tts-1-hd (语音合成)
- 浏览器 SpeechSynthesis API (语音降级)

## 快速启动
1. 
pm install
2. 复制 .env.example 为 .env.local，填入 OPENAI_API_KEY
3. 
pm run migrate    初始化数据库
4. 
pm run seed       预置 6 个经典故事
5. 
pm run dev        启动开发服务器
6. 浏览器打开 http://localhost:3000
7. 体验账号: demo@fantasy.local / demo1234
8. 家长 PIN: 0000

## 文档
- [PRD](.trae/documents/PRD.md)
- [技术架构](.trae/documents/技术架构.md)

## 目录结构
- src/app         Next.js App Router 页面
- src/components  通用组件 (AudioPlayer / ChildLock / PinDialog 等)
- src/lib         业务库 (db / auth / openai / useAmbientNoise)
- src/store       Zustand 状态管理
- src/types       TypeScript 类型定义
- data/migrations 数据库迁移 SQL
- data/seed       种子数据
- scripts         维护脚本 (migrate / seed)
