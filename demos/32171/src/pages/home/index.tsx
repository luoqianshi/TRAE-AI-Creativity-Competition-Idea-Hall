import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import QuestionCard from '@/components/QuestionCard';
import { mockQuestions } from '@/data/mock';
import type { Question } from '@/types';
import styles from './index.module.scss';

export default function HomePage() {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);

  const filteredQuestions = useMemo(() => {
    let result = questions;
    
    if (filter === 'unmastered') {
      result = result.filter(q => !q.mastered);
    } else if (filter === 'mastered') {
      result = result.filter(q => q.mastered);
    }
    
    if (searchText) {
      const keyword = searchText.toLowerCase();
      result = result.filter(q => 
        q.content.toLowerCase().includes(keyword) ||
        q.subject.toLowerCase().includes(keyword) ||
        q.knowledgePoints.some(kp => kp.toLowerCase().includes(keyword))
      );
    }
    
    return result;
  }, [questions, filter, searchText]);

  const handleMaster = (id: string) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === id ? { ...q, mastered: !q.mastered } : q
      )
    );
  };

  const handleDetail = (question: Question) => {
    Taro.navigateTo({
      url: `/pages/analysis/index?id=${question.id}`
    });
  };

  const handleGoCapture = () => {
    Taro.switchTab({
      url: '/pages/capture/index'
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>我的错题本</Text>
        <Text className={styles.headerSubtitle}>共 {questions.length} 道错题，{questions.filter(q => !q.mastered).length} 道待复习</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input 
            className={styles.searchInput}
            placeholder="搜索题目、知识点..."
            placeholderStyle="color: rgba(255,255,255,0.5)"
            value={searchText}
            onChange={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.filterBar}>
        <Button 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button 
          className={`${styles.filterBtn} ${filter === 'unmastered' ? styles.active : ''}`}
          onClick={() => setFilter('unmastered')}
        >
          待复习
        </Button>
        <Button 
          className={`${styles.filterBtn} ${filter === 'mastered' ? styles.active : ''}`}
          onClick={() => setFilter('mastered')}
        >
          已掌握
        </Button>
      </View>

      <View className={styles.content}>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              onMaster={() => handleMaster(question.id)}
              onDetail={() => handleDetail(question)}
            />
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📝</Text>
            <Text className={styles.emptyText}>暂无错题，快去拍照录入吧</Text>
            <Button className={styles.emptyBtn} onClick={handleGoCapture}>
              立即录入
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}