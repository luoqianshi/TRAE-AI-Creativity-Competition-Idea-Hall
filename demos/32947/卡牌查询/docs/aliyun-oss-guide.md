# 阿里云 OSS 申请与配置指南

> 总耗时:**15-20 分钟**(一次性)
> 完成后,本项目所有图片自动上传到阿里云 OSS,本机 / 阿里云 ECS 均可访问。

---

## 步骤 1:开通 OSS 服务(2 分钟)

1. 登录 [阿里云控制台](https://console.aliyun.com)
2. 顶部搜索框输入 `对象存储 OSS` → 进入产品页
3. 同意服务协议 → **立即开通** → 0 元试用 1 年

> 已开通过可跳过。

---

## 步骤 2:创建存储桶 Bucket(3 分钟)

1. 进入 [OSS 控制台](https://oss.console.aliyun.com/bucket)
2. 点击 **创建 Bucket**
3. 填写表单:

| 字段 | 推荐值 | 说明 |
|---|---|---|
| Bucket 名称 | `agc-card-grading` (随便起) | 全局唯一,创建后不可改 |
| 地域 | **华东1(杭州)** `oss-cn-hangzhou` | 选离 ECS 最近的地域,节省内网带宽 |
| 存储类型 | **标准存储** | 高频访问 |
| 访问权限 | **公共读** | C 端要直接访问图片 URL |
| 版本控制 | 暂不开启 | 节省成本 |
| 实时日志查询 | 暂不开启 | 节省成本 |

4. 点击 **确定创建** → 列表中出现新 Bucket

> 地域代码记录下来,后面要用。  
> 杭州 = `oss-cn-hangzhou`  
> 北京 = `oss-cn-beijing`  
> 上海 = `oss-cn-shanghai`  
> 深圳 = `oss-cn-shenzhen`

---

## 步骤 3:创建 RAM 子账号 + AccessKey(5 分钟)

> ⚠️ **不要用主账号 AccessKey!** 权限太大,泄露后整个阿里云账号都被控制。

1. 进入 [RAM 控制台](https://ram.console.aliyun.com/users)
2. 左侧 **用户** → **创建用户**
3. 登录名称:`agc-oss-user`,显示名称:`AGC OSS 服务账号`
4. 访问方式:**勾选 "OpenAPI 调用访问"**
5. 创建成功后,**务必复制保存**:
   - `AccessKey ID`(形如 `LTAI5txxxxxxxxxxxxx`)
   - `AccessKey Secret`(只显示一次!)

---

## 步骤 4:给 RAM 用户授权 OSS 权限(2 分钟)

1. 在用户列表,找到刚创建的 `agc-oss-user`
2. 右侧 **添加权限**
3. 选择 **系统策略** → 搜索 `AliyunOSSFullAccess`
4. 勾选 → **确定**

> 该权限允许该用户读写你账号下所有 Bucket 的对象。  
> 如果想更严格,可以创建自定义策略只授权单个 Bucket,本项目用全权限即可。

---

## 步骤 5:配置 CORS(1 分钟)

C 端 H5 在浏览器直接请求 OSS 图片 URL,需要 OSS 支持跨域。

1. 回到 [OSS 控制台](https://oss.console.aliyun.com/bucket)
2. 进入你创建的 Bucket
3. 左侧 **数据安全** → **跨域设置** → **创建规则**
4. 填写:

| 字段 | 值 |
|---|---|
| 来源 | `*` (或你的域名,如 `https://your-domain.com`) |
| 允许 Methods | 全选 (GET / POST / PUT / DELETE / HEAD) |
| 允许 Headers | `*` |
| 暴露 Headers | `ETag / x-oss-request-id` |
| 缓存时间(秒) | `600` |

5. **确定**

---

## 步骤 6:填入项目配置(1 分钟)

打开 [config.local.js](../config.local.js),修改 `aliyunOSS` 段:

```javascript
aliyunOSS: {
  accessKeyId:     'LTAI5txxxxxxxxxxxxx',     // ← 步骤 3 拿到的 ID
  accessKeySecret: 'xxxxxxxxxxxxxxxxxxxxxx',   // ← 步骤 3 拿到的 Secret
  bucket:          'agc-card-grading',         // ← 步骤 2 填的 Bucket 名(不含 -oss 后缀)
  region:          'oss-cn-hangzhou',          // ← 步骤 2 选定的地域代码
  endpoint:        '',                         // 留空即可
  cdnDomain:       '',                         // 留空即可(暂时用 OSS 默认域名,后续要 CDN 再填)
  secure:          true,                       // HTTPS
  keyPrefix:       'card-grading/'             // 文件名前缀,留默认即可
},
```

保存后,**重启服务** `node server.js`,日志应显示:

```
卡牌评级查询系统已启动
  OSS:阿里云对象存储  ·  DB:Supabase PostgreSQL
```

---

## 步骤 7:验证上传(2 分钟)

1. 浏览器打开 B 端 `http://localhost:3000/admin/`
2. 填入一条卡牌,上传正反面图,确认录入
3. 打开 [OSS 控制台](https://oss.console.aliyun.com/bucket) → 进入 Bucket → **文件管理** → `card-grading/` 目录
4. 应能看到刚刚上传的图片 ✓

---

## 🆘 常见问题

### Q1:重启后日志还是显示 "OSS:本地磁盘"
- 检查 `config.local.js` 是否保存成功(不要有注释在前一行被切断)
- 检查字段名是否拼写正确(accessKeyId 不是 AccessKeyId)
- 全部 4 个必填项(accessKeyId/accessKeySecret/bucket/region)必须非空

### Q2:上传报 403 SignatureDoesNotMatch
- AccessKey ID 或 Secret 复制错了,重新核对
- 重新生成一对新的 AccessKey,粘贴进 config.local.js

### Q3:上传成功但浏览器访问图片 403
- 检查 Bucket 访问权限,必须是 **公共读**
- 步骤 5 CORS 没配

### Q4:C 端访问图片 504 网关超时
- OSS 是海外地域(如美西),改选离你最近的地域
- 启用 CDN 加速(后续可加 cdnDomain 配置项)

---

## 💰 费用预估(参考)

| 项 | 费用 |
|---|---|
| 标准存储 | 0.12 元/GB/月 |
| 公网流出流量(OSS 默认域名访问) | 0.50 元/GB |
| CDN 回源流量(走 CDN 后) | 0.15 元/GB |
| 请求次数 | 0.01 元/万次 |

小项目月流量 10GB 以内,**月成本 < 5 元**。

> 进阶省钱:用 CDN 域名(填 `cdnDomain` 配置项),流量单价降低 70%。
