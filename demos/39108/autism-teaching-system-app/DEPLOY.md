# 自闭症儿童教学管理系统 - 部署指南

## 方案一：Vercel（推荐）

### 前提条件
- 注册 [Vercel 账号](https://vercel.com)（支持 GitHub/GitLab 登录）

### 步骤

1. 将项目推送到 GitHub/GitLab 仓库：
```bash
cd /workspace/autism-teaching-system-app
git init
git add .
git commit -m "init: 自闭症儿童教学管理系统"
git remote add origin https://github.com/你的用户名/autism-teaching-system.git
git push -u origin main
```

2. 登录 [Vercel](https://vercel.com)，点击 "New Project"
3. 导入你的 GitHub 仓库
4. 框架预设选择 "Vite"，无需修改其他配置
5. 点击 "Deploy"，等待 1-2 分钟
6. 部署完成后会获得一个 `https://你的项目名.vercel.app` 的地址，分享给同事即可

### 后续更新
每次 `git push` 到 main 分支，Vercel 会自动重新部署。

---

## 方案二：Netlify

### 步骤

1. 同样先将代码推到 GitHub
2. 登录 [Netlify](https://netlify.com)
3. 点击 "Add new site" → "Import an existing project"
4. 选择你的 GitHub 仓库
5. 构建命令填 `npm run build`，发布目录填 `dist`
6. 点击 "Deploy site"

---

## 方案三：Cloudflare Pages（国内访问速度较好）

### 步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 "Pages" → "Create a project"
3. 连接 GitHub 仓库
4. 构建命令 `npm run build`，输出目录 `dist`
5. 部署完成后获得 `https://你的项目名.pages.dev` 地址

---

## 方案四：部署到国内云服务器（自有服务器）

如果你有阿里云/腾讯云的服务器（如 CentOS/Ubuntu）：

### 1. 构建项目
```bash
cd /workspace/autism-teaching-system-app
npm run build
```

### 2. 上传 dist 目录到服务器
```bash
scp -r dist/* root@你的服务器IP:/var/www/autism-teaching-system/
```

### 3. 配置 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/autism-teaching-system;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. 配置 HTTPS（可选，推荐）
```bash
# 使用 certbot 免费申请 Let's Encrypt 证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 重要说明

### 当前版本的数据限制
- 数据保存在每个用户的浏览器 LocalStorage 中
- 同事之间**无法共享数据**，每人看到的是自己录入的数据
- 清除浏览器缓存会导致数据丢失

### 如需多人协作（后续升级方向）
要让多位老师共享同一份学生数据，需要：
1. 搭建后端服务（Node.js / Python）
2. 接入数据库（PostgreSQL / MySQL）
3. 添加用户登录和权限管理
4. 将 LocalStorage 替换为 API 调用

### 快速搭建后端的推荐方案
- **Supabase**（免费）：提供 PostgreSQL 数据库 + API + 用户认证，无需自己写后端
- **Firebase**（免费额度）：Google 提供的 BaaS 服务
- **自建**：Node.js + Express + PostgreSQL，部署到云服务器
