import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Question } from '@/types';
import styles from './index.module.scss';

interface Props {
  question: Question;
  onMaster?: () => void;
  onDetail?: () => void;
}

export default function QuestionCard({ question, onMaster, onDetail }: Props) {
  const handleTap = () => {
    if (onDetail) {
      onDetail();
    }
  };

  const handleMaster = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (onMaster) {
      onMaster();
    }
  };

  return (
    <View className={styles.card} onClick={handleTap}>
      <View className={styles.header}>
        <View className={styles.tagSubject}>{question.subject}</View>
        <View className={styles.tagGrade}>{question.grade}</View>
        <View className={question.mastered ? styles.tagMastered : styles.tagUnmastered}>
          {question.mastered ? '已掌握' : '待复习'}
        </View>
      </View>

      <View className={styles.content}>
        {question.imageUrl && (
          <Image src={question.imageUrl} mode="widthFix" className={styles.image} />
        )}
        <Text className={styles.text}>{question.content}</Text>
      </View>

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

      <View className={styles.footer}>
        <View className={styles.knowledgeTags}>
          {question.knowledgePoints.slice(0, 2).map((kp, index) => (
            <View key={index} className={styles.knowledgeTag}>
              {kp}
            </View>
          ))}
          {question.knowledgePoints.length > 2 && (
            <Text className={styles.moreTags}>+{question.knowledgePoints.length - 2}</Text>
          )}
        </View>
        <View className={styles.actions}>
          <Text className={styles.reviewCount}>复习{question.reviewCount}次</Text>
          <Button
            className={question.mastered ? styles.btnUnmaster : styles.btnMaster}
            onClick={handleMaster}
          >
            {question.mastered ? '取消掌握' : '标记掌握'}
          </Button>
        </View>
      </View>
    </View>
  );
}