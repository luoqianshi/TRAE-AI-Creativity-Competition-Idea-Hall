# 本地部署指南

## 方式一：直接下载运行（最简单）

### 1. 下载项目代码
将 `/workspace/autism-teaching-system-app` 整个文件夹下载到本地电脑。

### 2. 安装 Node.js
确保本地已安装 Node.js 18+：
```bash
node -v
```
如果没有安装，去 https://nodejs.org 下载 LTS 版本。

### 3. 安装依赖并启动
```bash
cd autism-teaching-system-app
npm install
npm run dev
```

浏览器会自动打开 `http://localhost:5173`，即可使用。

---

## 方式二：打包成静态文件（用于任何服务器）

### 1. 构建生产包
```bash
cd autism-teaching-system-app
npm install
npm run build
```

### 2. 构建完成后
会生成 `dist` 文件夹，里面包含所有静态文件（HTML、CSS、JS）。

### 3. 部署方式
- **本地直接打开**：用浏览器打开 `dist/index.html`（部分功能可能受限）
- **Nginx/Apache**：将 `dist` 目录内容放到网站根目录
- **Vercel/Netlify**：直接上传 `dist` 文件夹
- **内网服务器**：将 `dist` 复制到服务器任意目录，用 Nginx 托管

---

## 方式三：使用 VS Code + Live Server（最推荐开发调试）

### 1. 安装 VS Code
下载 https://code.visualstudio.com/

### 2. 安装 Live Server 插件
在 VS Code 扩展商店搜索 "Live Server" 并安装。

### 3. 打开项目
```bash
code autism-teaching-system-app
```

### 4. 启动开发服务器
按 `Ctrl + ~` 打开终端，运行：
```bash
npm install
npm run dev
```

---

## 数据说明

- 所有数据保存在浏览器 LocalStorage 中
- 不同电脑/浏览器之间的数据不互通
- 清除浏览器缓存会丢失数据
- 如需多人共享数据，需要搭建后端服务器（见 DEPLOY.md）

## 演示账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 管理员 | 18888888888 | 123456 |
| 陈督导 | 13000000001 | 123456 |
| 张老师 | 13812341234 | 123456 |
| 王助教 | 13790129012 | 123456 |
