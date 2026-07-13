import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface WrongQuestion {
  id: string;
  content: string;
  tag: string;
  type: string;
  wrongAnswer: string;
  correctAnswer: string;
}

const tags = ['全部', '阅读理解', '听力理解', '词汇语法', '写作翻译', '计算机基础', 'Office操作'];

const WrongPage: React.FC = () => {
  const [activeTag, setActiveTag] = useState(0);
  const [wrongQuestions] = useState<WrongQuestion[]>([
    {
      id: '1',
      content: 'According to the passage, what is the main cause of climate change?',
      tag: '阅读理解',
      type: '单选题',
      wrongAnswer: 'A. Natural disasters',
      correctAnswer: 'B. Human activities'
    },
    {
      id: '2',
      content: '在Excel中，公式"=SUM(A1:A10)"的作用是什么？',
      tag: 'Office操作',
      type: '单选题',
      wrongAnswer: 'A. 计算平均值',
      correctAnswer: 'B. 计算总和'
    },
    {
      id: '3',
      content: 'Python中，以下哪个是正确的变量命名？',
      tag: '计算机基础',
      type: '单选题',
      wrongAnswer: 'A. 1name',
      correctAnswer: 'C. my_name'
    },
    {
      id: '4',
      content: '素质教育的核心是什么？',
      tag: '教育知识',
      type: '单选题',
      wrongAnswer: 'A. 提高升学率',
      correctAnswer: 'B. 培养创新精神'
    }
  ]);

  const handleRetry = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?questionId=${id}` });
  };

  const handleMaster = (id: string) => {
    Taro.showToast({ title: '已归档掌握', icon: 'success' });
  };

  const filteredQuestions = activeTag === 0
    ? wrongQuestions
    : wrongQuestions.filter(q => q.tag === tags[activeTag]);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>12</Text>
            <Text className={styles.statLabel}>错题总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>3</Text>
            <Text className={styles.statLabel}>待复习</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>28%</Text>
            <Text className={styles.statLabel}>错误率</Text>
          </View>
        </View>
      </View>

      <View className={styles.forgotSection}>
        <View className={styles.forgotHeader}>
          <Text className={styles.forgotIcon}>💡</Text>
          <Text className={styles.forgotTitle}>今日遗忘曲线复习</Text>
          <Text className={styles.forgotCount}>3题待复习</Text>
        </View>
        {wrongQuestions.slice(0, 3).map((item) => (
          <View key={item.id} className={styles.forgotItem}>
            <View className={styles.forgotCheckbox} />
            <Text className={styles.forgotContent}>{item.content}</Text>
          </View>
        ))}
      </View>

      <View className={styles.tagTabs}>
        {tags.map((tag, index) => (
          <Text
            key={index}
            className={`${styles.tagTab} ${activeTag === index ? styles.active : ''}`}
            onClick={() => setActiveTag(index)}
          >
            {tag}
          </Text>
        ))}
      </View>

      <View className={styles.content}>
        {filteredQuestions.map((item) => (
          <View key={item.id} className={styles.wrongItem}>
            <View className={styles.wrongHeader}>
              <Text className={styles.wrongTag}>{item.tag}</Text>
              <Text className={styles.wrongType}>{item.type}</Text>
            </View>
            <Text className={styles.wrongContent}>{item.content}</Text>
            <View className={styles.wrongAnswer}>
              <Text className={styles.answerLabel}>你的答案</Text>
              <Text className={styles.answerValue}>{item.wrongAnswer}</Text>
            </View>
            <View className={styles.correctAnswer}>
              <Text className={styles.answerLabel}>正确答案</Text>
              <Text className={styles.correctValue}>{item.correctAnswer}</Text>
            </View>
            <View className={styles.wrongActions}>
              <Text className={`${styles.actionBtn} ${styles.secondary}`} onClick={() => handleRetry(item.id)}>
                立即重做
              </Text>
              <Text className={`${styles.actionBtn} ${styles.primary}`} onClick={() => handleMaster(item.id)}>
                归档掌握
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default WrongPage;