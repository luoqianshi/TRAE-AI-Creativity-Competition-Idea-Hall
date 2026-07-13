import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { examCategories, getCategoryById } from '@/data/categories';

const QuestionPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'practice' | 'mock'>('practice');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [categories, setCategories] = useState(examCategories);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};
    
    if (options.categoryId) {
      setActiveCategory(options.categoryId);
    } else if (categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, []);

  const currentCategory = getCategoryById(activeCategory);

  const handleChapterClick = (subjectId: string, chapterId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?subjectId=${subjectId}&chapterId=${chapterId}`
    });
  };

  const handleStartPractice = (subjectId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?subjectId=${subjectId}`
    });
  };

  const modes = [
    { id: 'practice', label: '刷题模式' },
    { id: 'mock', label: '模拟考试' }
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.modeTabs}>
        {modes.map((mode) => (
          <Text
            key={mode.id}
            className={`${styles.modeTab} ${activeMode === mode.id ? styles.active : ''}`}
            onClick={() => setActiveMode(mode.id as 'practice' | 'mock')}
          >
            {mode.label}
          </Text>
        ))}
      </View>

      <View className={styles.categoryTabs}>
        {categories.map((category) => (
          <Text
            key={category.id}
            className={`${styles.categoryTab} ${activeCategory === category.id ? styles.active : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </Text>
        ))}
      </View>

      <View className={styles.content}>
        {currentCategory?.subjects.map((subject) => {
          const progress = Math.round((subject.completedQuestions / subject.totalQuestions) * 100);
          
          return (
            <View key={subject.id} className={styles.subjectCard}>
              <View className={styles.subjectHeader}>
                <Text className={styles.subjectName}>{subject.name}</Text>
                <Text className={styles.subjectProgress}>
                  {subject.completedQuestions}/{subject.totalQuestions}
                </Text>
              </View>
              <View className={styles.progressBar}>
                <View className={styles.progressFill} style={{ width: `${progress}%` }} />
              </View>
              <View className={styles.chapterList}>
                {subject.chapters.map((chapter) => (
                  <View
                    key={chapter.id}
                    className={styles.chapterItem}
                    onClick={() => handleChapterClick(subject.id, chapter.id)}
                  >
                    <Text className={styles.chapterName}>{chapter.name}</Text>
                    <Text className={styles.chapterCount}>{chapter.questionCount}题</Text>
                  </View>
                ))}
              </View>
              <View className={styles.startBtn} onClick={() => handleStartPractice(subject.id)}>
                <Text>开始练习</Text>
              </View>
            </View>
          );
        })}

        {!currentCategory && (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📚</Text>
            <Text className={styles.emptyText}>暂无考试分类</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default QuestionPage;