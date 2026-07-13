import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/appStore';

const MinePage: React.FC = () => {
  const { user } = useAppStore();
  const [activeExam, setActiveExam] = useState(0);

  const examList = [
    { id: '1', name: '英语四级', date: '2024年12月', duration: '130分钟', questionCount: 80 },
    { id: '2', name: '英语六级', date: '2024年12月', duration: '130分钟', questionCount: 80 },
    { id: '3', name: '计算机二级', date: '2024年9月', duration: '90分钟', questionCount: 40 },
    { id: '4', name: '教师资格证', date: '2024年11月', duration: '120分钟', questionCount: 50 }
  ];

  const historyRecords = [
    { id: '1', examName: '英语四级模拟', score: 520, date: '2024-07-08', duration: '125分钟' },
    { id: '2', examName: '计算机二级模拟', score: 85, date: '2024-07-05', duration: '85分钟' }
  ];

  const menuItems = [
    { icon: '📖', text: '学习记录', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '❤️', text: '收藏题目', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '🏆', text: '成就徽章', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '💬', text: '学习社区', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '❓', text: '常见问题', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) }
  ];

  const handleStartExam = () => {
    Taro.showToast({ title: '即将开始模拟考试', icon: 'loading' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.examSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>🎯 模考专区</Text>
        </View>
        
        <View className={styles.examTabs}>
          {examList.map((exam, index) => (
            <Text
              key={exam.id}
              className={`${styles.examTab} ${activeExam === index ? styles.active : ''}`}
              onClick={() => setActiveExam(index)}
            >
              {exam.name}
            </Text>
          ))}
        </View>

        <View className={styles.examCard}>
          <View className={styles.examInfo}>
            <Text className={styles.examName}>{examList[activeExam].name}</Text>
            <View className={styles.examMeta}>
              <Text className={styles.metaItem}>📅 {examList[activeExam].date}</Text>
              <Text className={styles.metaItem}>⏱️ {examList[activeExam].duration}</Text>
              <Text className={styles.metaItem}>📝 {examList[activeExam].questionCount}题</Text>
            </View>
          </View>
          <View className={styles.startExamBtn} onClick={handleStartExam}>
            <Text>开始模考</Text>
          </View>
        </View>

        <View className={styles.historySection}>
          <Text className={styles.historyTitle}>📊 历史成绩</Text>
          {historyRecords.map((record) => (
            <View key={record.id} className={styles.historyItem}>
              <View className={styles.historyInfo}>
                <Text className={styles.historyName}>{record.examName}</Text>
                <Text className={styles.historyDate}>{record.date}</Text>
              </View>
              <View className={styles.historyScore}>
                <Text className={styles.scoreValue}>{record.score}</Text>
                <Text className={styles.scoreDuration}>{record.duration}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.profileSection}>
        <View className={styles.header}>
          <View className={styles.userInfo}>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>👤</Text>
            </View>
            <View className={styles.userDetail}>
              <Text className={styles.nickname}>{user.nickname}</Text>
              <Text className={styles.level}>Lv.{Math.floor(user.studyStats.totalQuestions / 100) + 1} 备考新手</Text>
            </View>
            <Text className={styles.editBtn}>编辑</Text>
          </View>
        </View>

        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.studyStats.totalDays}</Text>
            <Text className={styles.statLabel}>学习天数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.studyStats.totalQuestions}</Text>
            <Text className={styles.statLabel}>做题数量</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.studyStats.correctRate}%</Text>
            <Text className={styles.statLabel}>正确率</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.studyStats.studyHours}h</Text>
            <Text className={styles.statLabel}>学习时长</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>学习</View>
          {menuItems.slice(0, 3).map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.onClick}>
              <View className={styles.menuLeft}>
                <Text className={styles.menuIcon}>{item.icon}</Text>
                <Text className={styles.menuText}>{item.text}</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>其他</View>
          {menuItems.slice(3).map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.onClick}>
              <View className={styles.menuLeft}>
                <Text className={styles.menuIcon}>{item.icon}</Text>
                <Text className={styles.menuText}>{item.text}</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.settingBtn} onClick={() => Taro.showToast({ title: '设置功能开发中', icon: 'none' })}>
          <Text className={styles.menuIcon}>⚙️</Text>
          <Text className={styles.menuText}>设置</Text>
        </View>

        <View className={styles.syncBtn} onClick={() => Taro.showToast({ title: '云端同步成功', icon: 'success' })}>
          <Text>☁️ 云端同步</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;