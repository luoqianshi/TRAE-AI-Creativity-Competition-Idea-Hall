# AI剪视频 - 智能视频剪辑助手

一款基于AI的智能视频剪辑工具，用户可以通过自然语言描述需求，AI自动完成视频剪辑。

## 功能特点

- 🔌 **灵活API配置**: 支持接入主流AI大模型API（OpenAI、Azure等）
- 📁 **素材管理**: 批量上传视频素材，智能识别素材信息
- ✨ **智能剪辑**: 自然语言描述需求，AI自动理解并执行
- 🎯 **精准控制**: 支持时长、转场、音乐等多种剪辑操作
- ⚡ **高效导出**: 一键生成并导出成品视频

## 系统要求

- Python 3.8+
- FFmpeg（必须安装并添加到系统环境变量）

## 快速开始

### 1. 安装FFmpeg

**Windows:**
```bash
# 使用winget安装
winget install FFmpeg

# 或者从官网下载: https://ffmpeg.org/download.html
# 下载后解压并将bin目录添加到系统PATH
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置API

创建 `.env` 文件（可选）:
```
AI_API_KEY=your-api-key-here
AI_API_BASE=https://api.openai.com/v1
AI_MODEL=gpt-4o
```

或者在Web界面中配置。

### 4. 运行程序

```bash
python app.py
```

访问 http://localhost:5000 即可使用。

## 使用方法

1. **配置API**: 点击右上角输入您的AI API密钥
2. **上传素材**: 拖拽或点击上传视频文件
3. **描述需求**: 在对话框中输入剪辑需求
4. **生成视频**: 点击"开始生成"按钮

## 示例对话

- "帮我把这些视频合并成一个30秒的短片"
- "提取每个视频的精彩片段，总时长控制在1分钟"
- "把第一个视频裁剪10-20秒的部分，然后添加淡入淡出效果"
- "生成一个1分钟的短视频，配上欢快的背景音乐"

## 项目结构

```
AIEditor/
├── app.py              # Flask主应用
├── ai_service.py       # AI服务模块
├── video_service.py    # 视频处理模块
├── config.py           # 配置文件
├── requirements.txt    # 依赖列表
├── templates/
│   └── index.html      # Web界面
├── uploads/            # 上传文件存储
└── outputs/            # 生成文件存储
```

## 技术栈

- **后端**: Python, Flask
- **前端**: HTML5, CSS3, JavaScript
- **视频处理**: FFmpeg, MoviePy
- **AI**: OpenAI API (兼容多种大模型)

## 注意事项

- 请确保安装FFmpeg并正确配置环境变量
- 支持的视频格式: MP4, AVI, MOV, MKV, WebM, FLV, WMV
- 最大上传文件大小: 500MB
- 建议使用Chrome或Firefox浏览器

## 许可证

MIT License