import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import CategoryCard from '@/components/CategoryCard';
import { examCategories } from '@/data/categories';
import { useAppStore } from '@/store/appStore';

const HomePage: React.FC = () => {
  const { user, checkIn } = useAppStore();
  const [checkedIn, setCheckedIn] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleCheckIn = () => {
    if (checkedIn) return;
    checkIn();
    setCheckedIn(true);
    Taro.showToast({ title: '打卡成功！', icon: 'success' });
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      Taro.showToast({ title: `搜索: ${searchValue}`, icon: 'none' });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    Taro.navigateTo({
      url: `/pages/question/index?categoryId=${categoryId}`
    });
  };

  const featureCards = [
    { id: '1', icon: '📋', title: '考情百科', desc: '最新考试资讯', color: '#5B7FFF', path: '/pages/question/index' },
    { id: '2', icon: '📅', title: '学习计划', desc: 'AI智能规划', color: '#00B42A', path: '/pages/plan/index' },
    { id: '3', icon: '📝', title: '题库刷题', desc: '海量真题练习', color: '#FF7D00', path: '/pages/question/index' },
    { id: '4', icon: '🎯', title: '全真模考', desc: '模拟真实考场', color: '#F53F3F', path: '/pages/mine/index' }
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.topBar}>
          <View className={styles.logo}>
            <Text className={styles.logoIcon}>📚</Text>
            <Text className={styles.logoText}>备考助手</Text>
          </View>
          <View className={styles.searchBox}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder="搜索考试科目..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.detail.value)}
              onConfirm={handleSearch}
            />
          </View>
          <View className={styles.avatar} onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}>
            <Text className={styles.avatarText}>👤</Text>
          </View>
        </View>

        <View className={styles.progressCard}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressTitle}>📊 备考进度</Text>
            <Text className={styles.progressDays}>第 {user.studyStats.consecutiveDays} 天</Text>
          </View>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${user.studyStats.correctRate}%` }} />
          </View>
          <View className={styles.progressStats}>
            <View className={styles.progressStat}>
              <Text className={styles.statValue}>{user.studyStats.totalQuestions}</Text>
              <Text className={styles.statLabel}>已刷题</Text>
            </View>
            <View className={styles.progressStat}>
              <Text className={styles.statValue}>{user.studyStats.correctRate}%</Text>
              <Text className={styles.statLabel}>正确率</Text>
            </View>
            <View className={styles.progressStat}>
              <Text className={styles.statValue}>{user.studyStats.studyHours}h</Text>
              <Text className={styles.statLabel}>学习时长</Text>
            </View>
          </View>
          <View className={styles.checkInBtn} onClick={handleCheckIn}>
            <Text className={styles.checkInText}>{checkedIn ? '今日已打卡 ✓' : '立即打卡'}</Text>
          </View>
        </View>

        <View className={styles.featureGrid}>
          {featureCards.map((card) => (
            <View
              key={card.id}
              className={styles.featureCard}
              onClick={() => {
                if (card.path === '/pages/mine/index' || card.path === '/pages/plan/index') {
                  Taro.switchTab({ url: card.path });
                } else {
                  Taro.navigateTo({ url: card.path });
                }
              }}
            >
              <View className={styles.featureIcon} style={{ backgroundColor: `${card.color}20` }}>
                <Text style={{ color: card.color }}>{card.icon}</Text>
              </View>
              <Text className={styles.featureTitle}>{card.title}</Text>
              <Text className={styles.featureDesc}>{card.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📖</Text>
          考试分类
        </Text>
        <View className={styles.categoryList}>
          {examCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;