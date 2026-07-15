# 🛰️ Claude 指挥中心 (Claude Mission Control)

在**手机或电脑**上远程监控与操控本机所有 Claude Code 会话：实时查看它干到哪一步了（思考、工具调用、回复），随时下达下一步指令，也能一键新建会话。

![responsive](https://img.shields.io/badge/UI-移动端%20%26%20桌面端-d97757)

## 功能

- **监控全部会话** — 自动发现 `~/.claude/projects` 下所有 Claude Code 会话（无论是终端里跑的还是本工具创建的），实时展示。
- **实时消息流** — 用聊天式界面呈现用户输入、Claude 的思考、每一次工具调用（Bash / Read / Edit / Grep …）与结果、最终回复。
- **远程下指令** — 在手机或网页里直接给任意会话发消息，让 Claude 继续干活。
- **新建会话** — 选定工作目录 + 首条指令，一键在本机拉起一个新的 Claude Code 会话。
- **精美响应式界面** — 深色主题，手机端单栏滑动、桌面端双栏，运行状态脉冲提示、未读提醒、断线自动重连。

## 架构

```
手机/浏览器  ──WebSocket──▶  Node 服务  ──▶  claude CLI 子进程 (stream-json)   [控制/下指令]
                                       └──▶  tail ~/.claude/projects/*.jsonl   [监控/读内容]
```

- **监控层**：直接 tail 会话的 JSONL 转录文件——这是消息内容的唯一真源，所以终端里手动开的会话也能被监控。
- **控制层**：用 `claude -p --input-format stream-json --output-format stream-json --resume/--session-id` 拉起并复用子进程来发消息、续接、新建会话。

## 快速开始

```bash
cd ~/Desktop/claude-mission-control
./start.sh
```

启动后终端会打印本机地址、局域网地址和**访问密钥**：

- 本机浏览器：`http://localhost:4600/?key=<你的密钥>`
- **手机（同一 WiFi）**：用打印出的 `http://192.168.x.x:4600` 访问，首次会要求输入访问密钥。

### 📱 手机在任意网络访问（公网隧道）

如果手机连不上局域网地址（不同 WiFi / 蜂窝网络），用内置的 cloudflared 隧道一键暴露到公网：

```bash
brew install cloudflared      # 仅首次
./tunnel.sh
```

脚本会自动启动服务 + 隧道，并打印一个**含密钥的公网链接**，例如：

```
https://xxxx-yyyy-zzzz.trycloudflare.com/?key=868ee485971d
```

手机浏览器直接打开即可。按 `Ctrl+C` 关闭。

> ⚠️ 该临时地址每次启动都会变化，进程关闭即失效（trycloudflare 免费快速隧道特性）。

### 🔒 访问密钥

`config.json` 里的 `accessKey` 是访问口令：所有控制通道（WebSocket）和 `/api` 都需要它，密钥错误会被拒绝。留空则不鉴权（仅建议纯局域网使用）。公网暴露前**务必设置**。

## 配置

编辑 `config.json`：

```json
{
  "port": 4600,
  "defaultModel": "opus",
  "accessKey": "868ee485971d",
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "sk-...",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]"
  }
}
```

- `env` 里的变量会注入到 `claude` 子进程，因此这里用 DeepSeek 的 Anthropic 兼容端点驱动 Claude Code。
- 端口可用环境变量覆盖：`PORT=8080 ./start.sh`。

## 说明与安全

- 子进程以 `--dangerously-skip-permissions` 运行，使工具（Bash/Edit 等）无需交互确认即可执行——这是无人值守远程操控所必需的。这也意味着**任何拿到公网链接+密钥的人都能在你电脑上执行任意命令**。
- 因此暴露到公网时**必须**保留 `accessKey`（本项目已内置密钥校验）。请把链接和密钥当作密码保管，不要发到公开群/截图里。
- `config.json` 内含 DeepSeek API Token，注意不要连同项目一起外泄（例如推到公开 Git 仓库）。比赛演示后建议轮换该 Token。
- 定位为个人本机/内网工具；如需长期公网服务，请自建带账号体系的反向代理。

## 目录结构

```
claude-mission-control/
├── config.json          # 端口、模型、访问密钥、注入子进程的环境变量
├── start.sh             # 一键启动（本地/局域网）
├── tunnel.sh            # 一键公网隧道（cloudflared）
├── server/
│   ├── index.js         # HTTP 静态服务 + WebSocket 实时中枢
│   └── lib/
│       ├── store.js     # 扫描 / 解析 / tail 会话转录（监控层）
│       └── manager.js   # claude 子进程管理（控制层）
└── public/
    ├── index.html       # 界面结构
    ├── styles.css       # 响应式精美样式
    └── app.js           # 前端逻辑（WS、渲染、交互）
```
