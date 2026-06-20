# 桌面恋人 (AiCompanion)

一款 Windows 桌面 AI 伴侣应用——以动画角色形式常驻桌面，可监控用户前台行为，通过大语言模型实现自然对话交互。

## 技术栈

- **框架**: C# WPF (.NET 8)
- **UI 架构**: MVVM (CommunityToolkit.Mvvm)
- **AI 后端**: Ollama 本地 + OpenAI 兼容 API 双模式
- **动画**: Lottie 矢量动画（降级方案：序列帧/静态图）
- **本地存储**: JSON 文件持久化

## 快速开始

### 前置要求

1. 安装 [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
2. （可选）安装 [Ollama](https://ollama.com) 用于本地 AI 模式

### 编译运行

```bash
cd AiCompanion
dotnet restore
dotnet build
dotnet run --project src/AiCompanion.App
```

### 使用 Ollama 本地模型

```bash
# 下载推荐模型（中文对话）
ollama pull qwen2.5:7b

# 启动应用
dotnet run --project src/AiCompanion.App
```

## 功能

- ✅ 桌面悬浮角色窗口（透明、鼠标穿透、可拖拽）
- ✅ AI 对话（文字输入 + 流式回复）
- ✅ 角色随机生成 + 预设角色库
- ✅ 前台窗口监控（进程/窗口标题检测）
- ✅ 主动对话调度（发呆/深夜/游戏后触发）
- ✅ 游戏事件联动（LOL 五杀/超神等）
- ✅ 开机自启（注册表）
- ✅ 用户隐私保护（窗口数据仅内存，不落盘不上传）

## 项目结构

```
AiCompanion/
├── src/
│   ├── AiCompanion.App/           # WPF 主应用
│   ├── AiCompanion.Core/          # 核心业务逻辑
│   ├── AiCompanion.Infrastructure/ # 基础设施（Win32/存储/启动）
│   └── AiCompanion.Animation/     # 动画子系统
├── data/                          # 运行时配置
│   ├── game_config.json           # 游戏检测配置
│   └── character_templates.json   # 角色预设模板
└── tests/                         # 单元测试
```

## 隐私说明

- 窗口监控数据仅存于内存，**不落盘、不上传、不序列化**
- 仅提取进程名和窗口标题供行为匹配
- 使用本地 Ollama 模型时完全离线
- 无数据埋点、无遥测

## License

MIT
