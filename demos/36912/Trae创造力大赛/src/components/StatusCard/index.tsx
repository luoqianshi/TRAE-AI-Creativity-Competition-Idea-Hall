import React from 'react';
import { View, Text } from '@tarojs/components';
import type { RobotStatus, ConnectionStatus } from '@/types/robot';
import styles from './index.module.scss';

interface StatusCardProps {
  status: RobotStatus | null;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({
  status,
  onConnect,
  onDisconnect,
  isConnecting
}) => {
  const getConnectionText = (connectionStatus: ConnectionStatus): string => {
    const statusMap: Record<ConnectionStatus, string> = {
      disconnected: '未连接',
      connecting: '连接中...',
      connected: '已连接',
      error: '连接错误'
    };
    return statusMap[connectionStatus] || '未知状态';
  };

  const getConnectionColor = (connectionStatus: ConnectionStatus): string => {
    const colorMap: Record<ConnectionStatus, string> = {
      disconnected: '#718096',
      connecting: '#0066ff',
      connected: '#00d4aa',
      error: '#ff4757'
    };
    return colorMap[connectionStatus] || '#718096';
  };

  const isConnected = status?.connectionStatus === 'connected';

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>机器人状态</Text>
          <View 
            className={styles.statusBadge}
            style={{ backgroundColor: getConnectionColor(status?.connectionStatus || 'disconnected') }}
          >
            <Text className={styles.statusText}>
              {getConnectionText(status?.connectionStatus || 'disconnected')}
            </Text>
          </View>
        </View>
      </View>

      {isConnected && status && (
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>电量</Text>
            <Text className={styles.infoValue}>{status.batteryLevel}%</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>温度</Text>
            <Text className={styles.infoValue}>{status.temperature}°C</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>运动状态</Text>
            <Text className={styles.infoValue}>{status.isMoving ? '运动中' : '静止'}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>夹爪状态</Text>
            <Text className={styles.infoValue}>
              {status.gripperState === 'open' ? '张开' : status.gripperState === 'closed' ? '闭合' : '移动中'}
            </Text>
          </View>
        </View>
      )}

      <View className={styles.actionRow}>
        {isConnected ? (
          <View className={styles.disconnectBtn} onClick={onDisconnect}>
            <Text className={styles.disconnectBtnText}>断开连接</Text>
          </View>
        ) : (
          <View 
            className={`${styles.connectBtn} ${isConnecting ? styles.connecting : ''}`}
            onClick={isConnecting ? undefined : onConnect}
          >
            <Text className={styles.connectBtnText}>
              {isConnecting ? '连接中...' : '连接机器人'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default StatusCard;
