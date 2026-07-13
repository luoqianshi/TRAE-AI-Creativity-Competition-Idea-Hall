import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface Task {
  id: string;
  content: string;
  time: string;
  completed: boolean;
}

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const PlanPage: React.FC = () => {
  const [activeWeek, setActiveWeek] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', content: '完成阅读理解章节练习', time: '09:00', completed: true },
    { id: '2', content: '背诵50个核心词汇', time: '10:30', completed: true },
    { id: '3', content: '听力模拟题一套', time: '14:00', completed: false },
    { id: '4', content: '复习错题本', time: '16:00', completed: false },
    { id: '5', content: '写作模板练习', time: '19:00', completed: false }
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const handleRegenerate = () => {
    Taro.showToast({ title: 'AI计划生成中...', icon: 'loading' });
    setTimeout(() => {
      Taro.showToast({ title: '计划已更新', icon: 'success' });
    }, 1500);
  };

  const handleExport = () => {
    Taro.showToast({ title: '已导出计划清单', icon: 'success' });
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.certInfo}>
          <Text className={styles.certIcon}>📚</Text>
          <Text className={styles.certName}>英语四级</Text>
        </View>
        <View className={styles.progressSection}>
          <View className={styles.progressRing}>
            <View className={styles.ringBg} />
            <View className={styles.ringFill} />
            <View className={styles.ringText}>
              <Text className={styles.ringPercent}>{progress}%</Text>
              <Text className={styles.ringLabel}>完成度</Text>
            </View>
          </View>
          <View className={styles.progressDetail}>
            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>备考时长</Text>
              <Text className={styles.detailValue}>28天</Text>
            </View>
            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>每日目标</Text>
              <Text className={styles.detailValue}>5项任务</Text>
            </View>
            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>已完成</Text>
              <Text className={styles.detailValue}>{completedCount}/{tasks.length}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.weekTabs}>
        {weekDays.map((day, index) => (
          <Text
            key={index}
            className={`${styles.weekTab} ${activeWeek === index ? styles.active : ''}`}
            onClick={() => setActiveWeek(index)}
          >
            {day}
          </Text>
        ))}
      </View>

      <View className={styles.content}>
        <Text className={styles.sectionTitle}>今日任务</Text>
        {tasks.map((task) => (
          <View key={task.id} className={styles.taskItem} onClick={() => toggleTask(task.id)}>
            <View className={`${styles.taskCheckbox} ${task.completed ? styles.checked : ''}`}>
              {task.completed && <Text className={styles.checkIcon}>✓</Text>}
            </View>
            <View className={styles.taskContent}>
              <Text>{task.content}</Text>
            </View>
            <Text className={styles.taskTime}>{task.time}</Text>
          </View>
        ))}
      </View>

      <View className={styles.footer}>
        <Text className={`${styles.footerBtn} ${styles.secondary}`} onClick={handleRegenerate}>
          重新生成AI计划
        </Text>
        <Text className={`${styles.footerBtn} ${styles.primary}`} onClick={handleExport}>
          导出计划清单
        </Text>
      </View>
    </ScrollView>
  );
};

export default PlanPage;