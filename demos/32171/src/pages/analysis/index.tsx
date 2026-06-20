import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { mockQuestions, mockKnowledgePoints } from '@/data/mock';
import type { Question, KnowledgePoint } from '@/types';
import styles from './index.module.scss';

export default function AnalysisPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [relatedPoints, setRelatedPoints] = useState<KnowledgePoint[]>([]);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1] as { options?: { id?: string } };
    const id = currentPage.options?.id || '1';
    
    const foundQuestion = mockQuestions.find(q => q.id === id);
    if (foundQuestion) {
      setQuestion(foundQuestion);
      
      const points = mockKnowledgePoints.filter(kp => 
        foundQuestion!.knowledgePoints.some(qkp => qkp.includes(kp.name))
      );
      setRelatedPoints(points);
    }
  }, []);

  const handleMarkMaster = () => {
    if (question) {
      Taro.showToast({ title: '已标记为掌握', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }
  };

  const handlePractice = () => {
    Taro.navigateTo({
      url: '/pages/practice/index'
    });
  };

  if (!question) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.tagSubject}>{question.subject}</View>
          <View className={styles.tagGrade}>{question.grade}</View>
          <View className={question.mastered ? styles.tagMastered : styles.tagUnmastered}>
            {question.mastered ? '已掌握' : '待复习'}
          </View>
        </View>
        
        <Text className={styles.content}>{question.content}</Text>

        {question.options && question.options.length > 0 && (
          <View className={styles.options}>
            {question.options.map((option, index) => (
              <View
                key={index}
                className={`${styles.option} ${option.startsWith(question.correctAnswer) ? styles.correct : ''} ${option.startsWith(question.userAnswer) && option !== question.correctAnswer ? styles.wrong : ''}`}
              >
                <Text>{option}</Text>
              </View>
            ))}
          </View>
        )}

        <View className={styles.answerRow}>
          <Text className={styles.answerLabel}>正确答案</Text>
          <Text className={`${styles.answerValue} ${styles.answerCorrect}`}>{question.correctAnswer}</Text>
        </View>
        
        {question.userAnswer && question.userAnswer !== question.correctAnswer && (
          <View className={styles.answerRow}>
            <Text className={styles.answerLabel}>我的答案</Text>
            <Text className={`${styles.answerValue} ${styles.answerWrong}`}>{question.userAnswer}</Text>
          </View>
        )}
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>📚 知识点标签</Text>
        <View className={styles.knowledgePoints}>
          {question.knowledgePoints.map((kp, index) => (
            <View key={index} className={styles.knowledgeTag}>
              {kp}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>💡 AI解析</Text>
        <Text className={styles.analysisContent}>{question.analysis}</Text>
        
        {question.errorReason && (
          <View className={styles.errorReason}>
            <Text className={styles.errorTitle}>❌ 错误原因分析</Text>
            <Text className={styles.errorText}>{question.errorReason}</Text>
          </View>
        )}
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>🎯 同类变式题推荐</Text>
        <View className={styles.recommendList}>
          <View className={styles.recommendItem}>
            <Text className={styles.recommendSubject}>数学 - 二次函数</Text>
            <Text className={styles.recommendContent}>已知函数 f(x) = 2x² - 4x + 3，求 f(x) 在区间 [0, 3] 上的最大值和最小值。</Text>
          </View>
          <View className={styles.recommendItem}>
            <Text className={styles.recommendSubject}>数学 - 配方法</Text>
            <Text className={styles.recommendContent}>用配方法解方程：x² + 6x - 7 = 0</Text>
          </View>
          <View className={styles.recommendItem}>
            <Text className={styles.recommendSubject}>数学 - 函数最值</Text>
            <Text className={styles.recommendContent}>设函数 f(x) = x² - 2ax + a 在区间 [0, 1] 上的最小值为 g(a)，求 g(a) 的表达式。</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.btnSecondary} onClick={() => Taro.navigateBack()}>
          返回错题本
        </Button>
        <Button className={styles.btnPrimary} onClick={handlePractice}>
          开始刷题
        </Button>
      </View>
    </View>
  );
}