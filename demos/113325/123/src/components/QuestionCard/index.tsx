import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import OptionSelector from '../OptionSelector';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  selectedAnswers?: string[];
  onSelect?: (answers: string[]) => void;
  showResult?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedAnswers = [], onSelect, showResult = false }) => {
  const difficultyText = ['', '简单', '中等', '困难'][question.difficulty];
  const difficultyColor = ['', '#00B42A', '#FF7D00', '#F53F3F'][question.difficulty];

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.type}>
          {question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : '判断题'}
        </Text>
        <Text className={styles.difficulty} style={{ color: difficultyColor }}>
          {difficultyText}
        </Text>
      </View>
      
      <Text className={styles.content}>{question.content}</Text>
      
      <OptionSelector
        options={question.options}
        value={selectedAnswers}
        onChange={onSelect}
        disabled={showResult}
        showResult={showResult}
        correctAnswers={question.answer}
      />

      {showResult && (
        <View className={styles.explanation}>
          <Text className={styles.explanationTitle}>解析：</Text>
          <Text className={styles.explanationContent}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
};

export default QuestionCard;