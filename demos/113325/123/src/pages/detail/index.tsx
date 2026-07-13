import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import QuestionCard from '@/components/QuestionCard';
import { getQuestionsBySubject, getQuestionsByChapter } from '@/data/questions';
import type { Question, ExamRecord } from '@/types';
import { useAppStore } from '@/store/appStore';

const DetailPage: React.FC = () => {
  const { addExamRecord } = useAppStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [examMode, setExamMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [examResult, setExamResult] = useState<{ score: number; correctCount: number } | null>(null);

  const currentQuestion = questions[currentIndex];
  const submitRef = useRef<() => void>(() => {});

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};

    if (options.mode === 'exam') {
      setExamMode(true);
      setTimeLeft(1800);
    }

    let questionData: Question[] = [];
    if (options.chapterId) {
      questionData = getQuestionsByChapter(options.chapterId);
    } else if (options.subjectId) {
      questionData = getQuestionsBySubject(options.subjectId);
    }

    if (questionData.length === 0) {
      questionData = getQuestionsBySubject('cet4-reading');
    }

    if (examMode) {
      setQuestions(questionData.slice(0, 10));
    } else {
      setQuestions(questionData);
    }
  }, []);

  useEffect(() => {
    if (!examMode || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examMode, showResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (answers: string[]) => {
    setSelectedAnswers(answers);
    setAnswers((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentQuestion?.id || '', answers);
      return newMap;
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevQuestion = questions[currentIndex - 1];
      setSelectedAnswers(answers.get(prevQuestion.id) || []);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextQuestion = questions[currentIndex + 1];
      setSelectedAnswers(answers.get(nextQuestion.id) || []);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = useCallback(() => {
    let correctCount = 0;
    questions.forEach((q) => {
      const userAnswer = answers.get(q.id) || [];
      const isCorrect =
        userAnswer.length === q.answer.length &&
        userAnswer.every((a) => q.answer.includes(a));
      if (isCorrect) correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);
    setExamResult({ score, correctCount });
    setShowResult(true);

    if (examMode) {
      const record: ExamRecord = {
        id: `exam_${Date.now()}`,
        subjectId: questions[0]?.subjectId || '',
        startTime: new Date().toLocaleString(),
        endTime: new Date().toLocaleString(),
        duration: Math.round((1800 - timeLeft) / 60),
        score,
        totalScore: 100,
        correctCount,
        totalCount: questions.length,
        answers: []
      };
      addExamRecord(record);
    }
  }, [questions, answers, examMode, timeLeft, addExamRecord]);

  submitRef.current = handleSubmit;

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setAnswers(new Map());
    setShowResult(false);
    setExamResult(null);
    if (examMode) {
      setTimeLeft(1800);
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      {examMode && !showResult && (
        <View className={`${styles.timer} ${timeLeft <= 300 ? styles.warning : ''}`}>
          ⏱️ {formatTime(timeLeft)}
        </View>
      )}

      <ScrollView className={styles.content} scrollY>
        {currentQuestion && (
          <>
            <View className={styles.questionNav}>
              <Text className={styles.questionIndex}>第 {currentIndex + 1} 题</Text>
              <Text className={styles.questionCount}>共 {questions.length} 题</Text>
            </View>
            <QuestionCard
              question={currentQuestion}
              selectedAnswers={selectedAnswers}
              onSelect={handleSelect}
              showResult={showResult}
            />
          </>
        )}
      </ScrollView>

      {!showResult && (
        <View className={styles.footer}>
          {!examMode && currentIndex > 0 && (
            <Text className={styles.actionBtn} onClick={handlePrev}>
              上一题
            </Text>
          )}
          {currentIndex < questions.length - 1 ? (
            <Text className={styles.submitBtn} onClick={handleNext}>
              下一题
            </Text>
          ) : (
            <Text
              className={`${styles.submitBtn} ${selectedAnswers.length === 0 ? styles.disabled : ''}`}
              onClick={selectedAnswers.length > 0 ? handleSubmit : undefined}
            >
              {examMode ? '交卷' : '查看结果'}
            </Text>
          )}
        </View>
      )}

      {showResult && examResult && (
        <View className={styles.resultOverlay}>
          <View className={styles.resultCard}>
            <Text className={styles.resultIcon}>
              {examResult.score >= 60 ? '🎉' : '💪'}
            </Text>
            <Text className={styles.resultTitle}>
              {examResult.score >= 60 ? '恭喜通过！' : '继续加油！'}
            </Text>
            <Text className={styles.resultScore}>{examResult.score}</Text>
            <View className={styles.resultDetail}>
              <View className={styles.detailItem}>
                <Text className={styles.detailValue}>{examResult.correctCount}</Text>
                <Text className={styles.detailLabel}>答对</Text>
              </View>
              <View className={styles.detailItem}>
                <Text className={styles.detailValue}>
                  {questions.length - examResult.correctCount}
                </Text>
                <Text className={styles.detailLabel}>答错</Text>
              </View>
              <View className={styles.detailItem}>
                <Text className={styles.detailValue}>
                  {Math.round((examResult.correctCount / questions.length) * 100)}%
                </Text>
                <Text className={styles.detailLabel}>正确率</Text>
              </View>
            </View>
            <View className={styles.resultBtn} onClick={handleRetry}>
              再练一次
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DetailPage;