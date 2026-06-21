import React, { useState, useEffect } from 'react';
import { View, Text, Input, Switch, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { RobotConfig } from '@/types/robot';
import styles from './index.module.scss';

const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<RobotConfig>({
    name: 'My Robot',
    ip: '192.168.1.100',
    port: 8080,
    autoConnect: false
  });

  useEffect(() => {
    // 加载保存的配置
    const savedConfig = Taro.getStorageSync('robotConfig');
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, []);

  const handleSave = () => {
    // 保存配置到本地存储
    Taro.setStorageSync('robotConfig', config);
    Taro.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    });
  };

  const handleReset = () => {
    const defaultConfig: RobotConfig = {
      name: 'My Robot',
      ip: '192.168.1.100',
      port: 8080,
      autoConnect: false
    };
    setConfig(defaultConfig);
    Taro.showToast({
      title: '已重置',
      icon: 'success',
      duration: 2000
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>机器人配置</Text>
        
        <View className={styles.formItem}>
          <Text className={styles.label}>机器人名称</Text>
          <Input
            className={styles.input}
            value={config.name}
            placeholder="请输入机器人名称"
            onInput={(e) => setConfig({ ...config, name: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>IP 地址</Text>
          <Input
            className={styles.input}
            value={config.ip}
            placeholder="请输入 IP 地址"
            onInput={(e) => setConfig({ ...config, ip: e.detail.value })}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>端口</Text>
          <Input
            className={styles.input}
            type="number"
            value={String(config.port)}
            placeholder="请输入端口号"
            onInput={(e) => setConfig({ ...config, port: Number(e.detail.value) || 8080 })}
          />
        </View>

        <View className={styles.formItem}>
          <View className={styles.switchRow}>
            <Text className={styles.label}>自动连接</Text>
            <Switch
              checked={config.autoConnect}
              onChange={(e) => setConfig({ ...config, autoConnect: e.detail.value })}
              color="#0066ff"
            />
          </View>
          <Text className={styles.hint}>开启后，进入控制台时自动连接机器人</Text>
        </View>
      </View>

      <View className={styles.buttonGroup}>
        <Button className={styles.saveBtn} onClick={handleSave}>
          保存配置
        </Button>
        <Button className={styles.resetBtn} onClick={handleReset}>
          重置默认
        </Button>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>SDK 信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>SDK 版本</Text>
            <Text className={styles.infoValue}>占位符 v1.0.0</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>API 地址</Text>
            <Text className={styles.infoValue}>http://localhost:8000</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;
