import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface QuizQuestion {
  id: string;
  subject: string;
  content: string;
  options: string[];
  correctAnswer: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: '1',
    subject: '数学',
    content: '已知函数 f(x) = x² - 2x + 1，求 f(x) 的最小值及取得最小值时 x 的值。',
    options: ['最小值为0，x=1', '最小值为1，x=0', '最小值为-1，x=1', '最小值为0，x=-1'],
    correctAnswer: 'A'
  },
  {
    id: '2',
    subject: '物理',
    content: '一物体从高处自由下落，下落过程中重力做的功为 W，物体动能的增加量为 ΔEk，下列说法正确的是：',
    options: ['W > ΔEk', 'W < ΔEk', 'W = ΔEk', '无法确定'],
    correctAnswer: 'C'
  },
  {
    id: '3',
    subject: '英语',
    content: 'The book ______ I bought yesterday is very interesting.',
    options: ['who', 'which', 'what', 'whom'],
    correctAnswer: 'B'
  },
  {
    id: '4',
    subject: '化学',
    content: '下列物质中，属于电解质的是：',
    options: ['蔗糖', '氯化钠溶液', '氯化钠固体', '铜'],
    correctAnswer: 'C'
  },
  {
    id: '5',
    subject: '数学',
    content: '等差数列 {an} 中，a₁=2，d=3，求 a₁₀ 的值。',
    options: ['27', '29', '31', '33'],
    correctAnswer: 'B'
  }
];

type PageMode = 'start' | 'quiz' | 'result';

const modes = [
  { id: 'weak', name: '薄弱知识点', desc: '针对错题集中的薄弱点推送', icon: '🎯' },
  { id: 'mixed', name: '混合模式', desc: '综合复习已录入的所有错题', icon: '📚' },
  { id: 'timed', name: '限时挑战', desc: '在规定时间内完成答题', icon: '⏱️' }
];

export default function PracticePage() {
  const [pageMode, setPageMode] = useState<PageMode>('start');
  const [selectedMode, setSelectedMode] = useState('weak');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; correct: boolean }[]>([]);

  const currentQuestion = quizQuestions[currentIndex];
  const progress = ((currentIndex + 1) / quizQuestions.length) * 100;

  const handleStart = () => {
    setPageMode('quiz');
    setCurrentIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setCorrectCount(0);
    setAnswers([]);
  };

  const handleSelectOption = (option: string) => {
    if (showResult) return;
    setSelectedAnswer(option);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      Taro.showToast({ title: '请选择答案', icon: 'none' });
      return;
    }

    const isCorrect = selectedAnswer.startsWith(currentQuestion.correctAnswer);
    const newAnswers = [...answers, { questionId: currentQuestion.id, answer: selectedAnswer, correct: isCorrect }];
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    if (currentIndex < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer('');
        setShowResult(false);
      }, 500);
    } else {
      setTimeout(() => {
        setPageMode('result');
      }, 500);
    }

    setShowResult(true);
  };

  const handleRestart = () => {
    setPageMode('start');
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  if (pageMode === 'start') {
    return (
      <View className={styles.page}>
        <View className={styles.startPage}>
          <View className={styles.startCard}>
            <Text className={styles.startTitle}>🎯 智能刷题</Text>
            <Text className={styles.startDesc}>
              根据你的学习情况，AI 为你量身定制复习计划。通过针对性的练习，巩固薄弱知识点，提高学习效率。
            </Text>
          </View>

          <View className={styles.modeCard}>
            <Text className={styles.modeTitle}>选择练习模式</Text>
            <View className={styles.modeList}>
              {modes.map(mode => (
                <View
                  key={mode.id}
                  className={`${styles.modeItem} ${selectedMode === mode.id ? styles.active : ''}`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <Text className={styles.modeIcon}>{mode.icon}</Text>
                  <View className={styles.modeInfo}>
                    <Text className={styles.modeName}>{mode.name}</Text>
                    <Text className={styles.modeDesc}>{mode.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Button className={styles.startBtn} onClick={handleStart}>
            开始练习
          </Button>
        </View>
      </View>
    );
  }

  if (pageMode === 'result') {
    const score = Math.round((correctCount / quizQuestions.length) * 100);
    return (
      <View className={styles.page}>
        <View className={styles.resultPage}>
          <View className={styles.resultCard}>
            <Text className={styles.resultScore}>{score}</Text>
            <Text className={styles.resultLabel}>本次练习得分</Text>
            
            <View className={styles.resultStats}>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{correctCount}</Text>
                <Text className={styles.statLabel}>答对</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{quizQuestions.length - correctCount}</Text>
                <Text className={styles.statLabel}>答错</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{Math.round((correctCount / quizQuestions.length) * 100)}%</Text>
                <Text className={styles.statLabel}>正确率</Text>
              </View>
            </View>

            <View className={styles.resultActions}>
              <Button className={`${styles.resultBtn} ${styles.btnSecondary}`} onClick={handleBack}>
                返回
              </Button>
              <Button className={`${styles.resultBtn} ${styles.btnPrimary}`} onClick={handleRestart}>
                再练一次
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.quizPage}>
        <View className={styles.quizHeader}>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progress}%` }} />
          </View>
          <Text className={styles.progressText}>{currentIndex + 1}/{quizQuestions.length}</Text>
        </View>

        <View className={styles.quizCard}>
          <View className={styles.quizSubject}>{currentQuestion.subject}</View>
          <Text className={styles.quizContent}>{currentQuestion.content}</Text>

          <View className={styles.quizOptions}>
            {currentQuestion.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === option;
              const isCorrect = letter === currentQuestion.correctAnswer;
              
              let optionClass = styles.quizOption;
              if (showResult) {
                if (isCorrect) optionClass += ' ' + styles.correct;
                else if (isSelected) optionClass += ' ' + styles.wrong;
              } else if (isSelected) {
                optionClass += ' ' + styles.selected;
              }

              return (
                <View
                  key={index}
                  className={optionClass}
                  onClick={() => handleSelectOption(option)}
                >
                  <Text className={styles.optionLetter}>{letter}</Text>
                  <Text className={styles.optionContent}>{option}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View className={styles.quizBottomBar}>
        <Button 
          className={`${styles.quizBtn} ${!selectedAnswer ? styles.disabled : ''}`}
          onClick={handleNext}
        >
          {currentIndex < quizQuestions.length - 1 ? '下一题' : '查看结果'}
        </Button>
      </View>
    </View>
  );
}