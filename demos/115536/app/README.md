# 安心回家

面向早期阿尔茨海默病患者的极简防走失手机应用真机测试版，目标是打造“老人零操作、子女全掌控”的守护体验。

## 当前版本能力

- 老人端超大“回家”按钮，真机点击后拉起外部步行导航
- SOS 长按触发系统拨号，直接联系紧急联系人
- 子女端真实地图、实时定位、围栏圆形区域和轨迹折线
- 前台实时位置追踪，后台位置守护入口与任务定义
- 一键将当前真机位置设为“家”，方便任何地点现场测试
- 真实位置生成寻人卡摘要，自动带入最近坐标和时间

## 技术栈

- Expo SDK 56
- React Native
- TypeScript
- `expo-location`
- `expo-task-manager`
- `react-native-maps`
- `@react-native-async-storage/async-storage`

## 安装与启动

```bash
cd /workspace/app
npm install
npm start
```

## 真机测试

### 1. 前台定位与地图

前台定位和地图可直接在真机中体验：

```bash
cd /workspace/app
npm start
```

然后用真机扫码打开项目，进入子女端后点击“开启前台定位”。

### 2. 后台守护

后台守护需要使用 Development Build，Expo Go 不能完整验证：

```bash
cd /workspace/app
npx expo run:android
# 或
npx expo run:ios
```

安装开发构建后，在应用中点击“开启后台守护”，并按系统提示授予“始终允许”定位权限。

### 3. Google Maps API Key

如果你要在原生构建中显式配置 Google Maps Key，可在启动前设置：

```bash
export EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=你的Key
```

项目已改为 `app.config.ts`，会自动读取该环境变量并注入 `react-native-maps` 插件配置。

## 权限与限制

- 前台定位：已接入 `Location.requestForegroundPermissionsAsync()`
- 后台定位：已接入 `Location.requestBackgroundPermissionsAsync()` 和 `startLocationUpdatesAsync()`
- iOS 后台定位：需要开发构建，不支持在 Expo Go 中完整测试
- Android 后台守护：需要开发构建，系统会展示前台服务通知
- 自动接听与语音播报：当前仍是规则展示，后续需接 Android 原生能力
- 寻人平台、社区联动和警务接口：当前仍需后端接入

## 目录结构

```text
app
├── App.tsx
├── app.config.ts
└── src
    ├── data
    │   └── demoData.ts
    ├── hooks
    │   └── useLiveLocation.ts
    ├── screens
    │   └── GuardianPrototype.tsx
    ├── services
    │   ├── backgroundLocationTask.ts
    │   └── locationStorage.ts
    └── types.ts
```
