import React, { useState } from 'react';
import { View, Text, Button, Picker, Textarea, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const subjects = ['数学', '物理', '化学', '英语', '语文', '生物', '历史', '地理', '政治'];
const grades = ['初一', '初二', '初三', '高一', '高二', '高三'];

export default function CapturePage() {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleCamera = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        analyzeImage(res.tempFilePaths[0]);
      },
      fail: (err) => {
        console.error('[Capture] Camera error:', err);
        Taro.showToast({ title: '拍照失败', icon: 'none' });
      }
    });
  };

  const handleGallery = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        analyzeImage(res.tempFilePaths[0]);
      },
      fail: (err) => {
        console.error('[Capture] Gallery error:', err);
        Taro.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  };

  const analyzeImage = (imagePath: string) => {
    setAnalyzing(true);
    
    setTimeout(() => {
      setAnalyzing(false);
      setContent('已知函数 f(x) = x² - 2x + 1，求 f(x) 的最小值及取得最小值时 x 的值。');
      setOptions(['A. 最小值为0，x=1', 'B. 最小值为1，x=0', 'C. 最小值为-1，x=1', 'D. 最小值为0，x=-1']);
      setCorrectAnswer('A');
      Taro.showToast({ title: '识别成功', icon: 'success' });
    }, 2000);
  };

  const handleSubmit = () => {
    if (!subject || !grade || !content) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    setAnalyzing(true);
    
    setTimeout(() => {
      setAnalyzing(false);
      Taro.showToast({ title: '录入成功', icon: 'success' });
      setContent('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setUserAnswer('');
      
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1000);
    }, 1500);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📷 拍照识别</Text>
        <View className={styles.cameraCard}>
          <View className={styles.cameraArea} onClick={handleCamera}>
            <Text className={styles.cameraIcon}>📸</Text>
            <Text className={styles.cameraText}>点击拍照或上传图片</Text>
            <Text className={styles.cameraHint}>支持自动识别题目内容和答案</Text>
          </View>
          <View className={styles.cameraActions}>
            <Button className={styles.cameraBtn} onClick={handleCamera}>
              拍照
            </Button>
            <Button className={styles.cameraBtnSecondary} onClick={handleGallery}>
              从相册选择
            </Button>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>✏️ 手动录入</Text>
        <View className={styles.manualCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>学科</Text>
            <Picker mode="selector" range={subjects} onChange={(e) => setSubject(subjects[e.detail.value])}>
              <View className={styles.formSelect}>
                {subject || '请选择学科'}
              </View>
            </Picker>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>年级</Text>
            <Picker mode="selector" range={grades} onChange={(e) => setGrade(grades[e.detail.value])}>
              <View className={styles.formSelect}>
                {grade || '请选择年级'}
              </View>
            </Picker>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>题目内容</Text>
            <Textarea 
              className={styles.formTextarea}
              placeholder="请输入题目内容..."
              value={content}
              onChange={(e) => setContent(e.detail.value)}
            />
          </View>

          {options.some(o => o) && (
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>选项（可选）</Text>
              {options.map((option, index) => (
                <View key={index} className={styles.optionsInput}>
                  <Input 
                    className={styles.optionInput}
                    placeholder={`选项${String.fromCharCode(65 + index)}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.detail.value)}
                  />
                </View>
              ))}
            </View>
          )}

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>正确答案</Text>
            <Input 
              className={styles.formSelect}
              placeholder="如：A、B、C、D 或直接输入答案"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>我的答案（可选）</Text>
            <Input 
              className={styles.formSelect}
              placeholder="如：A、B、C、D 或直接输入答案"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.detail.value)}
            />
          </View>

          <Button className={styles.submitBtn} onClick={handleSubmit}>
            AI智能分析并保存
          </Button>
        </View>
      </View>

      {analyzing && (
        <View className={styles.analyzingModal}>
          <View className={styles.analyzingContent}>
            <Text className={styles.loadingIcon}>🔄</Text>
            <Text className={styles.analyzingText}>AI正在分析题目...</Text>
            <Text className={styles.analyzingHint}>请稍候，分析需要几秒钟</Text>
          </View>
        </View>
      )}
    </View>
  );
}