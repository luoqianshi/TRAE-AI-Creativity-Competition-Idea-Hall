import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { ExamCategory } from '@/types';

interface CategoryCardProps {
  category: ExamCategory;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const progress = Math.round(
    (category.subjects.reduce((acc, s) => acc + s.completedQuestions, 0) /
      category.subjects.reduce((acc, s) => acc + s.totalQuestions, 0)) *
      100
  );

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.icon} style={{ backgroundColor: `${category.color}20` }}>
          <Text className={styles.iconText}>{category.icon}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{category.name}</Text>
          <Text className={styles.desc}>{category.description}</Text>
        </View>
      </View>
      <View className={styles.progress}>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progress}%`, backgroundColor: category.color }} />
        </View>
        <Text className={styles.progressText}>学习进度 {progress}%</Text>
      </View>
    </View>
  );
};

export default CategoryCard;