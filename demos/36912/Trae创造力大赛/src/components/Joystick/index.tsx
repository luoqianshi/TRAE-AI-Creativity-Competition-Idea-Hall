import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface JoystickProps {
  disabled?: boolean;
  onMove: (direction: 'forward' | 'backward' | 'left' | 'right' | 'stop') => void;
}

const Joystick: React.FC<JoystickProps> = ({ disabled = false, onMove }) => {
  const handlePress = (direction: 'forward' | 'backward' | 'left' | 'right') => {
    if (!disabled) {
      onMove(direction);
    }
  };

  const handleRelease = () => {
    if (!disabled) {
      onMove('stop');
    }
  };

  return (
    <View className={styles.container}>
      <Text className={styles.title}>运动控制</Text>
      
      <View className={styles.joystickArea}>
        {/* 上方向 */}
        <View 
          className={`${styles.controlBtn} ${styles.forward} ${disabled ? styles.disabled : ''}`}
          onTouchStart={() => handlePress('forward')}
          onTouchEnd={handleRelease}
        >
          <Text className={styles.btnText}>前进</Text>
        </View>

        {/* 中间行 */}
        <View className={styles.middleRow}>
          <View 
            className={`${styles.controlBtn} ${styles.left} ${disabled ? styles.disabled : ''}`}
            onTouchStart={() => handlePress('left')}
            onTouchEnd={handleRelease}
          >
            <Text className={styles.btnText}>左转</Text>
          </View>

          <View className={styles.centerIndicator}>
            <View className={styles.centerDot} />
          </View>

          <View 
            className={`${styles.controlBtn} ${styles.right} ${disabled ? styles.disabled : ''}`}
            onTouchStart={() => handlePress('right')}
            onTouchEnd={handleRelease}
          >
            <Text className={styles.btnText}>右转</Text>
          </View>
        </View>

        {/* 下方向 */}
        <View 
          className={`${styles.controlBtn} ${styles.backward} ${disabled ? styles.disabled : ''}`}
          onTouchStart={() => handlePress('backward')}
          onTouchEnd={handleRelease}
        >
          <Text className={styles.btnText}>后退</Text>
        </View>
      </View>

      {disabled && (
        <Text className={styles.hint}>请先连接机器人</Text>
      )}
    </View>
  );
};

export default Joystick;
