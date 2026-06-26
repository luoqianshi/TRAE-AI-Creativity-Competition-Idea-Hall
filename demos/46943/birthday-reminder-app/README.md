# 全方位生日提醒小程序

## 项目结构

```
birthday-reminder-app/
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式
├── sitemap.json            # 站点地图
├── project.config.json     # 项目配置
├── utils/
│   └── lunar.js            # 农历公历转换工具
├── pages/
│   ├── index/              # 首页（统计 + 今日/近期生日）
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.js
│   ├── addBirthday/        # 添加生日页面
│   │   ├── addBirthday.wxml
│   │   ├── addBirthday.wxss
│   │   └── addBirthday.js
│   └── birthdayList/       # 生日列表页面
│       ├── birthdayList.wxml
│       ├── birthdayList.wxss
│       └── birthdayList.js
└── cloudfunctions/         # 云函数
    ├── getOpenId/          # 获取用户OpenID
    ├── reminderScheduler/  # 定时调度提醒任务
    └── sendReminder/       # 发送多渠道提醒
```

## 快速开始

### 1. 环境准备

- 注册 [微信公众平台](https://mp.weixin.qq.com/) 小程序账号
- 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 开通云开发（在开发者工具中点击"云开发"按钮）

### 2. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择本项目目录
4. 填入你的 AppID
5. 勾选"使用云服务"

### 3. 配置云开发

修改 `app.js` 中的云开发环境ID：

```javascript
wx.cloud.init({
  env: 'your-env-id', // 替换为你的云开发环境ID
  traceUser: true
})
```

### 4. 创建数据库集合

在云开发控制台的数据库中创建两个集合：

- `birthdays` — 生日记录
- `reminder_logs` — 提醒日志

### 5. 部署云函数

在微信开发者工具中：

1. 右键 `cloudfunctions/getOpenId` → "创建并部署：云端安装依赖"
2. 右键 `cloudfunctions/reminderScheduler` → "创建并部署：云端安装依赖"
3. 右键 `cloudfunctions/sendReminder` → "创建并部署：云端安装依赖"

### 6. 配置订阅消息模板

1. 登录微信公众平台
2. 进入"功能" → "订阅消息"
3. 搜索并添加合适的模板（如"生日提醒"类模板）
4. 将模板ID填入 `sendReminder/index.js` 中的 `YOUR_TEMPLATE_ID`

### 7. 配置邮件服务（可选）

如需邮件提醒：
- 注册 [SendGrid](https://sendgrid.com/) 或其他邮件服务
- 按 `sendReminder/index.js` 中的注释配置参数

### 8. 编译运行

点击微信开发者工具的"编译"按钮，即可在模拟器中预览。

## 核心功能

- 公历/农历双轨生日录入与自动换算
- 微信订阅消息 + 邮件双通道提醒
- 按关系分类（家人/朋友/同事/其他）
- 生日倒计时与今日高亮
- 祝福语一键复制
- 支持多条提醒设置：当天/提前1天/提前7天/提前30天，通知方式支持微信、邮件、微信+邮件

## 定时任务说明

| 云函数 | 触发时间 | 功能 |
|--------|---------|------|
| reminderScheduler | 每天凌晨 1:00 | 扫描所有生日，生成当天待发送的提醒任务 |
| sendReminder | 每小时 | 执行已到时间的 pending 状态提醒，发送到对应渠道 |

## HTML 原型迁移说明

- 当前包已改成以 `最终_已修改.html` 为参考的原型测试版。
- 首页、添加/编辑页、生日提醒、事件提醒、列表页、我的页、主题弹层、提醒设置都已放进小程序主页面。
- 该版本方便先在微信开发者工具里测试页面流程和视觉效果。
- 真正上线前仍需要配置云开发环境 ID、订阅消息模板 ID、邮件服务，并在真机里测试授权和消息发送。

## 本次修改说明

- 添加生日页的提醒设置已改为多条提醒。
- 点 `+` 新增提醒时，生日提醒和事件提醒应使用同一套规则：当天先新增提前1天；已有提前1天后，当天提醒继续加1小时；提前提醒按 1 → 7 → 30 → +30 天递增。
- 通知方式只保留微信、邮件、微信+邮件。
- 保存到数据库时使用 `remindStrategy` 字段，云函数也按这个字段生成提醒任务。

## 注意事项

1. 微信订阅消息需要用户主动授权，建议在添加生日时引导用户授权
2. 邮件服务需要额外申请和配置，可能会产生费用
3. 农历转换支持 1900-2100 年
4. 云开发有免费额度限制，超出后需要付费
