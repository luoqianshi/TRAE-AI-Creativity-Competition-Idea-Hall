import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: '安心回家',
  slug: 'peace-home-guardian',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'peace-home-guardian',
  plugins: [
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          '允许安心回家在使用期间访问您的位置，用于显示实时位置、导航回家和安全围栏提醒。',
        locationAlwaysAndWhenInUsePermission:
          '允许安心回家持续访问您的位置，用于后台守护、围栏告警和走失协查。',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
  ],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
};

export default config;
