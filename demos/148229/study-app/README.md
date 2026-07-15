# 智慧学习前后端部署版

这是一个可部署的前后端一体项目：

- 前端：`index.html` 单页应用
- 后端：`Node.js + Express`
- 数据：默认保存到服务器本地 `data/database.json`
- 支持：学生端、超级管理员端、班级管理、AI评语、本地兜底存储

## 本地运行

先安装依赖：

```bash
npm install
```

启动服务：

```bash
npm start
```

浏览器打开：

```text
http://localhost:3000
```

## 目录说明

```text
study-app/
├── index.html          # 前端页面
├── server.js           # 后端服务与 API
├── package.json        # 项目依赖与启动命令
├── data/               # 运行后自动创建，保存用户和学习数据
└── README.md           # 部署说明
```

## 后端接口

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/data/:role/:account
POST /api/data/:role/:account
POST /api/ai/chat
```

其中 `role` 支持：

```text
student
admin
```

## 部署到服务器

服务器需要安装 Node.js 18 或以上。

上传整个 `study-app` 文件夹后执行：

```bash
npm install
npm start
```

如果服务器使用 PM2：

```bash
npm install -g pm2
pm2 start server.js --name smart-study-app
pm2 save
```

## 部署到 Render / Railway

常用配置：

```text
Build Command: npm install
Start Command: npm start
Port: 自动读取环境变量 PORT
```

## 环境变量

建议线上设置：

```text
SESSION_SECRET=换成一个足够长的随机字符串
PORT=3000
```

## AI API 设置

前端内置了 `AI API 设置` 页面，支持 OpenAI 兼容格式：

```text
Base URL: https://api.openai.com/v1
API Key: sk-...
模型名称: gpt-4o-mini
Temperature: 0.7
Max Tokens: 800
```

兼容常见 OpenAI 风格接口，只要支持 `/chat/completions` 即可。前端会把参数发送到本项目后端的 `/api/ai/chat`，由后端代为请求模型接口，避免浏览器跨域问题。

可以接入 AI API 的功能包括：

```text
学生 AI 智能助手
成绩记录 AI 分析
错题登记 AI 分析
拍照搜题未作答检测
学习计划生成
任务拆解建议
管理员 AI 创建评语
管理员班级管理建议
学生不认真学习提醒话术
班会建议生成
```

当前已接入真实 API 调用的功能：

```text
学生 AI 智能助手
出题练习 AI 生成题目
管理员 AI 创建评语
管理员班级管理建议
学生提醒话术
```

未开启 AI API 或调用失败时，系统会自动回退到本地规则生成，不影响使用。

拍照搜题已加入“未作答拦截”逻辑：如果识别结果判断学生还没有作答，前端不会显示答案解析，也不会允许收入错题。当前演示版使用可扩展的前端检测函数，后续接入 OCR/视觉模型后，可以把图片识别结果接入该判断。

## 注意

当前版本使用服务器本地 JSON 文件保存数据，适合个人部署、演示和小规模使用。如果后续需要多人长期稳定使用，建议升级为数据库，例如 SQLite、MySQL、PostgreSQL 或 MongoDB。
