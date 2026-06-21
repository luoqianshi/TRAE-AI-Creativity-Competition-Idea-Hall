import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const handleItemClick = (type: string) => {
    switch (type) {
      case 'help':
        Taro.showModal({
          title: '使用帮助',
          content: '1. 在设置页面配置机器人IP和端口\n2. 返回控制台点击连接\n3. 连接成功后即可控制机器人运动和夹爪',
          showCancel: false
        });
        break;
      case 'about':
        Taro.showModal({
          title: '关于',
          content: '机器人远程控制小程序\n版本：1.0.0\n用于替代VR设备远程操控机器人',
          showCancel: false
        });
        break;
      case 'feedback':
        Taro.showToast({
          title: '功能开发中',
          icon: 'none',
          duration: 2000
        });
        break;
    }
  };

  return (
    <View className={styles.container}>
      {/* 用户信息卡片 */}
      <View className={styles.userCard}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>R</Text>
        </View>
        <View className={styles.userInfo}>
          <Text className={styles.userName}>机器人控制者</Text>
          <Text className={styles.userDesc}>远程操控，随时随地</Text>
        </View>
      </View>

      {/* 功能列表 */}
      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => handleItemClick('help')}>
          <Text className={styles.menuText}>使用帮助</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        <View className={styles.menuItem} onClick={() => handleItemClick('feedback')}>
          <Text className={styles.menuText}>意见反馈</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        <View className={styles.menuItem} onClick={() => handleItemClick('about')}>
          <Text className={styles.menuText}>关于</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      {/* 版本信息 */}
      <View className={styles.versionInfo}>
        <Text className={styles.versionText}>版本 1.0.0</Text>
      </View>
    </View>
  );
};

export default MinePage;
