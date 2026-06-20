import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface Props {
  title: string;
  value: number | string;
  unit?: string;
  color: 'primary' | 'success' | 'warning' | 'error';
}

export default function StatCard({ title, value, unit, color }: Props) {
  const colorClass = `color${color.charAt(0).toUpperCase() + color.slice(1)}`;
  
  return (
    <View className={styles.card}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.valueWrap}>
        <Text className={`${styles.value} ${styles[colorClass]}`}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}