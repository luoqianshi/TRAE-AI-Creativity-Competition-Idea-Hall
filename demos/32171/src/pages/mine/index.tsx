import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import StatCard from '@/components/StatCard';
import { mockStudyStats, mockUserInfo, mockKnowledgePoints } from '@/data/mock';
import styles from './index.module.scss';

export default function MinePage() {
  const handleMenuClick = (menu: string) => {
    Taro.showToast({ title: `${menu}功能开发中`, icon: 'none' });
  };

  const handleGeneratePaper = () => {
    Taro.navigateTo({
      url: '/pages/practice/index'
    });
  };

  const getBarHeight = (count: number) => {
    const maxCount = Math.max(...mockStudyStats.weeklyData.map(d => d.count));
    return `${(count / maxCount) * 100}%`;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <Image 
            className={styles.avatar} 
            src={mockUserInfo.avatar} 
            mode="aspectFill"
            onError={(e) => console.error('[Mine] Avatar load error:', e)}
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{mockUserInfo.name}</Text>
            <Text className={styles.userDesc}>{mockUserInfo.grade} · {mockUserInfo.subject}</Text>
          </View>
          <View className={styles.streakBadge}>
            🔥 {mockStudyStats.streakDays}天连续学习
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{mockStudyStats.totalQuestions}</Text>
          <Text className={styles.statLabel}>总错题</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{mockStudyStats.masteredQuestions}</Text>
          <Text className={styles.statLabel}>已掌握</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{mockStudyStats.todayAdded}</Text>
          <Text className={styles.statLabel}>今日新增</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{mockUserInfo.studyDays}</Text>
          <Text className={styles.statLabel}>学习天数</Text>
        </View>
      </View>

      <View className={styles.chartSection}>
        <Text className={styles.chartTitle}>📊 本周错题统计</Text>
        <View className={styles.chartBar}>
          {mockStudyStats.weeklyData.map((item, index) => (
            <View key={index} className={styles.barItem}>
              <View className={styles.barValue} style={{ height: getBarHeight(item.count) }} />
              <Text className={styles.barLabel}>{item.day.slice(1)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.knowledgeSection}>
        <Text className={styles.knowledgeTitle}>🎯 薄弱知识点</Text>
        <View className={styles.knowledgeList}>
          {mockKnowledgePoints.slice(0, 5).map(point => (
            <View key={point.id} className={styles.knowledgeItem}>
              <Text className={styles.knowledgeName}>{point.name}</Text>
              <View className={styles.knowledgeProgress}>
                <View className={styles.knowledgeFill} style={{ width: `${point.mastery}%` }} />
              </View>
              <Text className={styles.knowledgePercent}>{point.mastery}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>功能菜单</Text>
        <View className={styles.menuList}>
          <View className={styles.menuItem} onClick={() => handleMenuClick('错题导出')}>
            <Text className={styles.menuIcon}>📤</Text>
            <Text className={styles.menuText}>错题导出</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('学习报告')}>
            <Text className={styles.menuIcon}>📈</Text>
            <Text className={styles.menuText}>学习报告</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('学科设置')}>
            <Text className={styles.menuIcon}>⚙️</Text>
            <Text className={styles.menuText}>学科设置</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('关于我们')}>
            <Text className={styles.menuIcon}>ℹ️</Text>
            <Text className={styles.menuText}>关于我们</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.generateBtn} onClick={handleGeneratePaper}>
          🎯 生成个性化复习卷
        </Button>
      </View>
    </View>
  );
}