// 业务领域类型

export type AgeGroup = '1-3' | '3-4' | '4-6';

export type ThemeKey =
  | 'dinosaur'
  | 'princess'
  | 'car'
  | 'space'
  | 'animal';

export const THEME_LABELS: Record<ThemeKey, string> = {
  dinosaur: '恐龙',
  princess: '公主',
  car: '汽车',
  space: '太空',
  animal: '动物',
};

export const ALL_THEMES: ThemeKey[] = ['dinosaur', 'princess', 'car', 'space', 'animal'];

export const AGE_LABELS: Record<AgeGroup, string> = {
  '1-3': '1-3 岁',
  '3-4': '3-4 岁',
  '4-6': '4-6 岁',
};

export const AGE_DESCRIPTIONS: Record<AgeGroup, string> = {
  '1-3': '小宝宝爱听简单短句',
  '3-4': '开始喜欢小情节',
  '4-6': '能听懂因果与小知识',
};
