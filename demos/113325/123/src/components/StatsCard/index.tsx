import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, color = '#5B7FFF' }) => {
  return (
    <View className={styles.card}>
      <View className={styles.icon} style={{ backgroundColor: `${color}20` }}>
        <Text style={{ color }}>{icon}</Text>
      </View>
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatsCard;