import React, { useCallback } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useRobot } from '@/hooks/useRobot';
import StatusCard from '@/components/StatusCard';
import Joystick from '@/components/Joystick';
import GripperControl from '@/components/GripperControl';
import styles from './index.module.scss';

const ControlPage: React.FC = () => {
  const {
    status,
    isConnecting,
    connect,
    disconnect,
    controlMotion,
    controlGripper
  } = useRobot();

  // 页面显示时刷新状态
  useDidShow(() => {
    // 可以在这里刷新状态
  });

  const handleConnect = useCallback(async () => {
    // 从本地存储获取配置
    const config = Taro.getStorageSync('robotConfig');
    await connect(config);
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  const handleMotion = useCallback(async (direction: 'forward' | 'backward' | 'left' | 'right' | 'stop') => {
    if (status?.connectionStatus !== 'connected') {
      Taro.showToast({
        title: '请先连接机器人',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    await controlMotion({
      direction,
      speed: 50,
      angle: direction === 'left' || direction === 'right' ? 15 : 0
    });
  }, [status?.connectionStatus, controlMotion]);

  const handleGripperOpen = useCallback(async () => {
    if (status?.connectionStatus !== 'connected') {
      Taro.showToast({
        title: '请先连接机器人',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    await controlGripper({ action: 'open' });
  }, [status?.connectionStatus, controlGripper]);

  const handleGripperClose = useCallback(async () => {
    if (status?.connectionStatus !== 'connected') {
      Taro.showToast({
        title: '请先连接机器人',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    await controlGripper({ action: 'close' });
  }, [status?.connectionStatus, controlGripper]);

  const isConnected = status?.connectionStatus === 'connected';

  return (
    <View className={styles.container}>
      <ScrollView 
        className={styles.scrollView}
        scrollY
        enhanced
        showScrollbar={false}
      >
        <View className={styles.content}>
          {/* 状态卡片 */}
          <StatusCard
            status={status}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnecting={isConnecting}
          />

          {/* 运动控制 */}
          <Joystick
            disabled={!isConnected}
            onMove={handleMotion}
          />

          {/* 夹爪控制 */}
          <GripperControl
            disabled={!isConnected}
            gripperState={status?.gripperState || 'open'}
            onOpen={handleGripperOpen}
            onClose={handleGripperClose}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ControlPage;
