# 故障排除指南

## 问题：Vite 模块未找到错误

如果遇到以下错误：
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite'
```

### 解决方案

#### 方法1：使用安装脚本（推荐）
```bash
install.bat
```

#### 方法2：手动清理并重新安装
```bash
# 清理旧文件
rmdir /s /q node_modules
del /f /q package-lock.json

# 重新安装
npm install
```

#### 方法3：强制安装
```bash
npm install --force
```

#### 方法4：使用npx直接运行（无需安装）
```bash
npx vite
```

## 常见问题

### 1. PowerShell 执行策略错误
如果看到：
```
无法加载文件 npm.ps1，因为在此系统上禁止运行脚本
```

**解决方案：** 使用 `npm.cmd` 而不是 `npm`
```bash
npm.cmd install
npm.cmd run dev
```

### 2. 端口被占用
如果端口5173被占用，可以指定其他端口：
```bash
npx vite --port 3000
```

### 3. 依赖冲突
如果遇到依赖冲突，使用：
```bash
npm install --legacy-peer-deps
```

### 4. 构建失败
如果构建失败，尝试：
```bash
npm run build
# 或者使用npx
npx vite build
```

## 验证安装

安装完成后，检查以下文件是否存在：
- `node_modules/vite/` 目录
- `node_modules/vue/` 目录
- `node_modules/chart.js/` 目录

## 快速启动

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 浏览器访问

启动后访问：
- 本地：http://localhost:5173/
- 如果指定端口：http://localhost:端口号/

## 获取帮助

如果问题仍然存在，请检查：
1. Node.js 版本（建议 v16+）
2. npm 版本（建议 v8+）
3. 网络连接（需要访问 npm 仓库）