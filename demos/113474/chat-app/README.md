# IM 聊天应用

一个自托管、零外部依赖的独立 IM 聊天软件，支持手机与电脑双端互通，并内置 AI 机器人自动回复能力。

## 功能概览

1. **加好友 / 互发消息图片**：注册账号后搜索用户名加好友，双向实时收发文本与图片。
2. **接入云端 API 全自动对话**：支持任何 OpenAI 兼容的云端接口（如 DeepSeek），AI bot 自动回复消息并按需生成图片。
3. **接入本地模型全自动对话**：支持 llama.cpp 的 llama-server（OpenAI 兼容协议），完全离线、零 token 消耗。
4. **双端互通**：电脑与手机同时登录同一账号可多端同步收消息。

## 环境要求

- **操作系统**：Windows 10/11
- **Python**：3.11 或更高版本（需加入 PATH）
- **浏览器**：现代浏览器（Chrome / Edge / Safari）
- **本地模型（可选）**：llama.cpp server，需自行启动并暴露 OpenAI 兼容端口

## 快速启动

### 方式一：一键脚本（推荐）

双击 `start.bat`。首次运行会自动安装依赖（`pip install -r requirements.txt`），完成后自动启动服务，窗口会打印本机局域网 IP 供手机访问。

### 方式二：手动启动

```bat
cd d:\测试1\chat-app
pip install -r requirements.txt
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

## 访问方式

| 设备 | 地址 | 说明 |
|---|---|---|
| 电脑 | `http://localhost:8000` | 本机直接访问 |
| 手机 | `http://<本机IP>:8000` | 需与电脑连接同一 WiFi，且电脑防火墙放行 8000 端口 |

启动后终端会打印本机所有 IPv4 地址，任选一个在手机浏览器打开即可。

## 首次使用流程

1. 打开浏览器访问应用首页，进入登录页。
2. 切换到「注册」标签，输入用户名（≥2 位）、密码（≥6 位）、可选昵称，注册成功后自动登录。
3. 点击左侧「好友」标签，在搜索框输入对方用户名（默认可搜 `ai_assistant` 这个系统内置 AI bot），点「加好友」。
4. 被请求方登录后会收到好友请求通知，在「好友」页点「接受」即可。
5. 回到「聊天」标签，点击好友会话，开始发消息或图片。

## AI 机器人配置

进入「设置」标签可管理 AI 机器人。系统启动时已自动创建一个默认 bot「AI助手」（用户名 `ai_assistant`），可直接加为好友测试。

### 使用本地模型（零成本）

1. 启动 llama.cpp 的 OpenAI 兼容服务，例如：
   ```bat
   llama-server -m qwen2.5-7b-instruct.gguf --port 11434
   ```
2. 在设置页保持默认配置：
   - 服务提供商：`local`
   - API 端点：`http://127.0.0.1:11434/v1`
   - API Key：`local`
   - 模型名：`qwen2.5`（按实际模型填）
3. 保存后向该 bot 发消息即可。

### 使用云端 API（DeepSeek / OpenAI）

1. 在设置页修改对应 bot：
   - 服务提供商：`deepseek` 或 `openai`
   - API 端点：`https://api.deepseek.com/v1`（DeepSeek）或 `https://api.openai.com/v1`
   - API Key：填你的密钥（`sk-xxx`）
   - 模型名：`deepseek-chat` / `gpt-4o-mini` 等
2. 保存配置（注意：API Key 留空保存时不会清空已有 key）。
3. 向该 bot 发消息验证。

### AI 发图

默认 bot 已开启「图片生成」。当用户对 bot 说「画一张猫」之类请求时，AI 若在回复中输出 `[IMAGE:图片描述]` 标记，系统会自动生成图片并发送。默认使用 PIL 占位图（离线免费），可在 `config.yaml` 中切换为 DALL-E 等真实文生图服务。

## 目录结构

```
chat-app/
├── app/            # 配置、安全、日志、启动初始化
├── api/            # FastAPI 路由（认证/好友/消息/bot/WS/主入口）
├── core/           # 连接管理、消息路由、AI 回复处理器
├── ai/             # LLM 引擎 + 文生图服务
├── db/             # SQLAlchemy 模型、会话、CRUD
├── static/         # 前端 SPA（HTML/CSS/JS，无构建工具）
│   └── js/
│       ├── api.js  # HTTP 请求封装
│       ├── ws.js   # WebSocket 客户端
│       ├── ui.js   # DOM 渲染
│       └── app.js  # 状态管理与事件编排
├── data/           # SQLite 数据库（自动生成）
├── media/          # 上传与生成的图片（自动生成）
├── config.yaml     # 服务与默认 bot 配置
├── requirements.txt
└── start.bat       # 一键启动脚本
```

## 常见问题

**Q：向 AI 发消息后只收到「AI 服务暂时不可用」？**
A：检查设置页的 API 端点是否可达。本地模型需先启动 llama-server；云端 API 检查 key 是否有效、账户余额是否充足（错误提示会说明原因）。

**Q：手机打不开页面？**
A：确认手机与电脑在同一 WiFi；在电脑防火墙中放行 8000 端口入站规则；用启动脚本打印的 IP 而非 `localhost`。

**Q：刷新页面后会话丢失吗？**
A：不会。消息与好友关系持久化在 `data/chat.db`，刷新后自动重新登录并加载历史。Token 有效期默认 7 天。

**Q：如何多端同时在线？**
A：同一账号在电脑和手机分别登录即可，两端都会实时收到消息推送。

**Q：重启服务后数据还在吗？**
A：在。所有数据存储在 `data/chat.db` 文件中，重启不影响。

## 配置说明

`config.yaml` 可调整：

- `server.host` / `server.port`：监听地址与端口
- `jwt.secret`：JWT 签名密钥（生产环境务必修改为随机字符串）
- `jwt.expire_days`：Token 有效期
- `default_bot`：启动时自动创建的默认 AI bot 配置
- `image_gen.provider`：图片生成方案（`stub` 占位图 / `dall_e`）
