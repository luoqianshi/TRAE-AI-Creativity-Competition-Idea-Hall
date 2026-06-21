import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface GripperControlProps {
  disabled?: boolean;
  gripperState: 'open' | 'closed' | 'moving';
  onOpen: () => void;
  onClose: () => void;
}

const GripperControl: React.FC<GripperControlProps> = ({
  disabled = false,
  gripperState,
  onOpen,
  onClose
}) => {
  return (
    <View className={styles.container}>
      <Text className={styles.title}>夹爪控制</Text>
      
      <View className={styles.statusRow}>
        <Text className={styles.statusLabel}>当前状态：</Text>
        <Text className={styles.statusValue}>
          {gripperState === 'open' ? '张开' : gripperState === 'closed' ? '闭合' : '移动中'}
        </Text>
      </View>

      <View className={styles.buttonRow}>
        <View 
          className={`${styles.actionBtn} ${styles.openBtn} ${disabled ? styles.disabled : ''} ${gripperState === 'open' ? styles.active : ''}`}
          onClick={disabled ? undefined : onOpen}
        >
          <Text className={styles.actionBtnText}>张开</Text>
        </View>

        <View 
          className={`${styles.actionBtn} ${styles.closeBtn} ${disabled ? styles.disabled : ''} ${gripperState === 'closed' ? styles.active : ''}`}
          onClick={disabled ? undefined : onClose}
        >
          <Text className={styles.actionBtnText}>闭合</Text>
        </View>
      </View>

      {disabled && (
        <Text className={styles.hint}>请先连接机器人</Text>
      )}
    </View>
  );
};

export default GripperControl;
