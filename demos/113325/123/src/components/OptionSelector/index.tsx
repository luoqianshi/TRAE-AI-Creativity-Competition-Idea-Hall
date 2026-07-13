import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface OptionSelectorProps {
  options: { key: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  showResult?: boolean;
  correctAnswers?: string[];
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  showResult = false,
  correctAnswers = []
}) => {
  const handleClick = (key: string) => {
    if (disabled) return;

    let newValue: string[];
    if (value.includes(key)) {
      newValue = value.filter((v) => v !== key);
    } else {
      newValue = [...value, key];
    }
    onChange(newValue);
  };

  const getOptionClass = (key: string) => {
    const isSelected = value.includes(key);
    const isCorrect = correctAnswers.includes(key);

    if (!showResult) {
      return isSelected ? styles.selected : '';
    }

    if (isCorrect) {
      return styles.correct;
    }
    if (isSelected && !isCorrect) {
      return styles.wrong;
    }
    return '';
  };

  return (
    <View className={styles.container}>
      {options.map((option) => (
        <View
          key={option.key}
          className={`${styles.option} ${getOptionClass(option.key)}`}
          onClick={() => handleClick(option.key)}
        >
          <View className={styles.checkbox}>
            {value.includes(option.key) && <Text className={styles.checkIcon}>✓</Text>}
          </View>
          <Text className={styles.optionText}>
            <Text className={styles.optionKey}>{option.key}.</Text>
            {option.value}
          </Text>
          {showResult && correctAnswers.includes(option.key) && (
            <Text className={styles.correctIcon}>✓</Text>
          )}
        </View>
      ))}
    </View>
  );
};

export default OptionSelector;