# 黑白棋游戏 - 静态空间部署指南

## 部署准备

本目录包含了黑白棋游戏的所有静态文件，可以直接部署到任何支持静态文件托管的平台。

## 部署到常见静态空间服务

### Vercel

1. 注册/登录 Vercel 账户 (https://vercel.com)
2. 点击 "New Project" 按钮
3. 选择 "Import Git Repository" 或 "Upload" 选项上传dist目录
4. 不需要额外配置，Vercel会自动识别静态网站
5. 点击 "Deploy" 按钮开始部署

### Netlify

1. 注册/登录 Netlify 账户 (https://www.netlify.com)
2. 点击 "New site from Git" 或 "Drag and drop" 上传dist目录
3. 基本配置保持默认
4. 点击 "Deploy site" 按钮

### GitHub Pages

1. 将dist目录内容推送到GitHub仓库
2. 进入仓库设置 > Pages
3. 源选择 "Branch: main" 或 "Branch: master"
4. 点击 "Save" 保存设置
5. 等待几分钟后，网站将部署完成

### 阿里云OSS

1. 登录阿里云OSS控制台
2. 创建一个新的存储空间，并设置为公共读
3. 上传dist目录中的所有文件
4. 配置静态网站托管功能
5. 设置默认首页为index.html

### 腾讯云COS

1. 登录腾讯云COS控制台
2. 创建一个新的存储桶，并设置访问权限为公共读
3. 打开存储桶，进入文件列表，上传dist目录中的所有文件
4. 配置静态网站功能
5. 设置索引文档为index.html

## 手动部署到Web服务器

将dist目录中的所有文件复制到Web服务器的网站根目录即可。

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 文件说明

- **index.html**: 游戏主页面
- **src/css/style.css**: 样式文件
- **src/js/**: JavaScript代码目录
- **README.md**: 项目说明文档
- **deploy-config.json**: 部署配置信息

## 验证部署

部署完成后，访问网站URL，检查以下功能是否正常工作：

1. 游戏棋盘是否正确显示
2. 黑白棋子能否正常落子
3. 游戏规则说明是否可查看
4. 人机对战模式是否正常运行
5. 游戏结束判定是否准确

如果遇到问题，请确保所有文件都已正确上传，并检查浏览器控制台是否有错误信息。
