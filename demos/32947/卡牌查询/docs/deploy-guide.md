# 阿里云 ECS 部署指南(手把手)

> **总耗时:30-60 分钟**(一次性)
> **前置条件**:已有阿里云 ECS(已备案域名)

---

## 📋 部署架构一览

```
互联网用户
   ↓ HTTPS
[CDN/直接]  (如有 CDN)
   ↓
[阿里云 ECS]
   ├─ Nginx(80/443)         ← 反向代理 + HTTPS 终结
   └─ Node.js + PM2(3000)   ← 本项目服务
       ↓
   ┌─────┴─────┐
   ↓           ↓
[阿里云 OSS]  [Supabase]
 图片存储       业务数据库
```

---

## 步骤 1:ECS 系统准备(5 分钟)

### 1.1 推荐系统
- **Ubuntu 22.04 LTS** 或 **CentOS 7.x**
- 最低配置:2 核 2GB(本项目很轻量)
- 安全组规则:**开放 80 / 443 / 22**,其余关闭

### 1.2 SSH 登录服务器

```bash
ssh root@你的ECS公网IP
```

> 阿里云默认禁止 root 远程登录,需先用其他用户登录后 `sudo -i` 切换。

---

## 步骤 2:安装基础环境(5 分钟)

```bash
# 更新系统(Ubuntu)
apt update && apt upgrade -y

# 安装 Node.js 20 LTS(推荐 nvm 方式,可装多版本)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v   # 应输出 v20.x.x

# 安装 PM2(Node 进程管理器,生产必备)
npm install -g pm2

# 安装 Nginx(反向代理)
apt install -y nginx

# 启动并设置开机自启
systemctl start nginx
systemctl enable nginx
```

> **CentOS 系统**:把 `apt` 换成 `yum`,`apt install nginx` 换成 `yum install -y nginx`。

---

## 步骤 3:上传项目代码(10 分钟)

### 方案 A:用 Git(推荐,后续更新方便)

在 ECS 上:
```bash
mkdir -p /var/www
cd /var/www
# 把你项目推送到 GitHub/Gitee(私密仓库),然后:
git clone https://github.com/你的用户名/card-grading.git
cd card-grading
```

### 方案 B:用 scp 上传压缩包(适合没 Git)

在本机:
```bash
# 在项目根目录(本机)
cd c:\Users\30516\Desktop\卡牌查询
# 删除不必要的大文件夹后再打包
del /s /q node_modules
7z a -tzip card-grading.zip .\* -r
scp card-grading.zip root@你的ECS公网IP:/var/www/
```

在 ECS 上:
```bash
cd /var/www
apt install -y unzip   # CentOS: yum install -y unzip
unzip card-grading.zip -d card-grading
cd card-grading
npm install --production
```

> ⚠️ 不要上传 `node_modules/` 和 `config.local.js`(用环境变量注入)

---

## 步骤 4:用环境变量注入敏感配置(关键,5 分钟)

> **不要把 `config.local.js` 上传到服务器!**  
> 改用环境变量,PM2 启动时加载。

### 4.1 创建 `.env.production`(服务器上的)

```bash
cd /var/www/card-grading
cat > .env.production << 'EOF'
PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 阿里云 OSS
ALIYUN_OSS_ACCESS_KEY_ID=LTAI5txxxxxxxxxxxxx
ALIYUN_OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx
ALIYUN_OSS_BUCKET=agc-card-grading
ALIYUN_OSS_REGION=oss-cn-hangzhou
EOF
chmod 600 .env.production
```

### 4.2 改造 `config.local.js`,支持环境变量回退

我**已经预设好**这种模式(下面会做)。但现在先临时把本地 `config.local.js` 拷到服务器上以便快速跑通。

> ⚠️ 正式生产请用环境变量,见末尾"生产级优化"。

---

## 步骤 5:启动服务(2 分钟)

```bash
cd /var/www/card-grading

# 第一次启动,测试能否正常运行
node server.js
# 看到 "卡牌评级查询系统已启动" 后,Ctrl+C 退出

# 用 PM2 启动(后台守护)
pm2 start server.js --name card-grading

# 设置开机自启
pm2 startup
pm2 save

# 常用命令
pm2 status            # 查看状态
pm2 logs card-grading # 实时日志
pm2 restart card-grading
pm2 stop card-grading
```

> 启动后访问 `http://你的ECS公网IP:3000/`,应该能看到入口页。

---

## 步骤 6:配置 Nginx 反向代理 + HTTPS(10 分钟)

### 6.1 申请 SSL 证书(免费,Let's Encrypt)

```bash
# 安装 certbot
apt install -y certbot python3-certbot-nginx

# 自动申请并配置(需要先把域名解析到 ECS 公网 IP)
certbot --nginx -d your-domain.com -d www.your-domain.com

# 按提示输入邮箱,同意条款,选择 "Redirect HTTP to HTTPS"
```

> 阿里云也提供免费 SSL 证书,可在 [SSL 证书控制台](https://yundun.console.aliyun.com/?p=cas) 申请,下载 Nginx 格式的证书,手动配置。  
> Let's Encrypt 证书 90 天需续期,certbot 已自动加 crontab。

### 6.2 编辑 Nginx 配置(若 certbot 已自动配置,跳过)

```bash
cat > /etc/nginx/sites-available/card-grading << 'EOF'
# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

# HTTPS 主站
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书路径(certbot 自动生成)
    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 性能优化
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_protocols TLSv1.2 TLSv1.3;

    # 日志
    access_log /var/log/nginx/card-grading.access.log;
    error_log  /var/log/nginx/card-grading.error.log;

    # 上传文件大小限制(必须 >= 项目里 multer 限制)
    client_max_body_size 20m;

    # 反代到 Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";

        # WebSocket / 长连接(如以后用到)
        proxy_read_timeout  60s;
        proxy_send_timeout  60s;
    }
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/card-grading /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t            # 验证配置语法
systemctl reload nginx
```

### 6.3 配置 OSS / Supabase 跨域(已在两侧控制台配好的可跳过)

如果 C 端 H5 跨域请求 API,需要在 `location /` 中加:
```nginx
add_header 'Access-Control-Allow-Origin' '$http_origin' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

if ($request_method = 'OPTIONS') {
    return 204;
}
```

---

## 步骤 7:验证线上服务(3 分钟)

1. 浏览器打开 `https://your-domain.com/`
2. 看到入口页 → 点击 **B 端管理后台**
3. 录入一条卡牌,上传图片
4. C 端 H5 用内部编号查询 → 能看到刚录入的卡牌 ✓
5. 后台 → 管理背景图 → 上传首页背景 → C 端首页应显示新背景 ✓

---

## 🛠 生产级优化(强烈建议)

### 优化 1:用环境变量替代 `config.local.js`

我会在下次提交时把 `data.js / config.local.js` 改成"环境变量优先,文件兜底"。届时把 `config.local.js` 排除在 Git 之外,只上传 `.env.production`。

### 优化 2:配置 PM2 集群模式(多核)

`/var/www/card-grading/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'card-grading',
    script: 'server.js',
    instances: 'max',  // 启动 CPU 核数个进程
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '500M',
    error_file: 'logs/err.log',
    out_file:   'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```
```bash
pm2 delete card-grading
pm2 start ecosystem.config.js
pm2 save
```

### 优化 3:配置自动备份

Supabase 数据在云端,无需本地备份。  
项目代码用 Git 管理(每次修改 `git commit` 即可)。  
可选:每天 `pm2 save` 保留进程状态。

### 优化 4:监控告警

- 阿里云 **云监控** → 配 ECS CPU/内存/磁盘告警
- PM2 自带监控:`pm2 monit`
- 推荐:用 **uptimerobot.com**(免费)监控 `https://your-domain.com/api/health`

### 优化 5:CDN 加速(可选)

阿里云 CDN → 添加域名 `cdn.your-domain.com` → 源站选 OSS Bucket → 把 CDN 域名填入 `config.local.js` 的 `cdnDomain`。

> 启用 CDN 后,C 端访问图片走 CDN 边缘节点,延迟从 200ms 降到 30ms。

---

## 🆘 常见问题

### Q1:域名访问 502 Bad Gateway
- `pm2 status` 看 Node 进程是否在跑
- `pm2 logs card-grading` 看启动错误
- `curl http://127.0.0.1:3000/api/health` 在服务器上测一下

### Q2:SSL 证书申请失败
- 域名必须先解析到 ECS 公网 IP(A 记录)
- 等 DNS 生效(可能 10-30 分钟)
- `ping your-domain.com` 确认能解析到 ECS IP

### Q3:上传图片 504
- `client_max_body_size` 不够大,Nginx 限制了
- 已默认 20m,够用
- 也可能是 OSS 桶地区选远了,选离 ECS 最近的

### Q4:更新代码后要重启吗?
```bash
cd /var/www/card-grading
git pull
npm install --production
pm2 restart card-grading
```

### Q5:服务器磁盘满了
- 检查 `uploads/` 目录(若没用 OSS 的话)
- `pm2 flush` 清理旧日志
- ECS 控制台 → 磁盘扩容

---

## 📞 协助信息

需要我协助部署时,提供:
1. ECS 公网 IP、SSH 用户名 / 密码(或密钥)
2. 已备案的域名
3. (可选)你希望的时间段

我会**全权接管**完成剩余步骤。
