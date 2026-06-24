// API 请求/响应类型

export type ThemeKey = 'dinosaur' | 'princess' | 'car' | 'space' | 'animal' | string;

export interface GenerateStoryRequest {
  childId: string;
  theme?: ThemeKey;
  customPrompt?: string;
}

export interface GenerateStoryResponse {
  story: {
    id: string;
    title: string;
    fullText: string;
    theme: ThemeKey;
    durationSeconds: number;
  };
}

export interface TextToSpeechRequest {
  storyId: string;
  text: string;
}

export interface TextToSpeechResponse {
  audioUrl: string;
  cached: boolean;
  fallback?: boolean; // 标记是否走了浏览器降级
}

export interface StoryRecommendItem {
  id: string;
  title: string;
  theme: ThemeKey;
  emoji: string;
  durationSeconds: number;
  isSeed: boolean;
}

export interface StoryRecommendResponse {
  stories: StoryRecommendItem[];
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}
