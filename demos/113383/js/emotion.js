// 情绪分析与颜色映射

const emotionKeywords = {
  joy: ['开心', '高兴', '笑', '快乐', '兴奋', '满足', '喜欢', '棒', '好'],
  sadness: ['难过', '想哭', '不想', '伤心', '失落', '委屈', '痛', '累', '糟糕'],
  anger: ['生气', '烦', '讨厌', '愤怒', '恨', '火大', '不爽'],
  anxiety: ['紧张', '担心', '睡不着', '焦虑', '害怕', '压力', '烦躁', '不安'],
  loneliness: ['孤单', '一个人', '没人', '孤独', '寂寞', '被忽略'],
  calm: ['安静', '舒服', '放松', '平静', '安心', '自在'],
  warmth: ['感动', '谢谢', '暖', '温柔', '体贴', '被爱', '关心'],
  tiredness: ['累', '困', '疲惫', '倦', '没力气', '想睡'],
  expectation: ['期待', '想', '明天', '希望', '盼望', '憧憬']
};

const emotionLabels = {
  joy: '喜悦',
  sadness: '悲伤',
  anger: '愤怒',
  anxiety: '焦虑',
  loneliness: '孤独',
  calm: '平静',
  warmth: '温暖',
  tiredness: '疲惫',
  expectation: '期待'
};

const emotionColorsByTheme = {
  cream: {
    joy: '#F9E4B7',
    sadness: '#E8DDD5',
    anger: '#E8CFC0',
    anxiety: '#EDDED0',
    loneliness: '#E0E0E0',
    calm: '#F0EBE3',
    warmth: '#F3DFC6',
    tiredness: '#E5DED6',
    expectation: '#F3E8C8'
  },
  film: {
    joy: '#F0E8D0',
    sadness: '#D4D4D0',
    anger: '#D8D0C8',
    anxiety: '#E0D8D0',
    loneliness: '#D0D4D8',
    calm: '#E8ECEF',
    warmth: '#E8E0D8',
    tiredness: '#D8D4D0',
    expectation: '#E4E0D0'
  },
  minimal: {
    joy: '#FFF8E1',
    sadness: '#EEEEEE',
    anger: '#F0EBE8',
    anxiety: '#F5F0EB',
    loneliness: '#ECEFF1',
    calm: '#F5F5F5',
    warmth: '#FFF3E0',
    tiredness: '#F5F5F5',
    expectation: '#FFFDE7'
  }
};

function getCurrentTheme() {
  return (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.theme) || 'film';
}

function getEmotionColor(emotion) {
  const theme = getCurrentTheme();
  const colors = emotionColorsByTheme[theme] || emotionColorsByTheme.film;
  return colors[emotion] || colors.calm;
}

const emotionPoems = {
  joy: '今天有光，落在心上。',
  sadness: '今天有雨，也有躲雨的屋檐。',
  anger: '今天的风很大，但云还在走。',
  anxiety: '今天有很多线头，但总能找到一根。',
  loneliness: '今天有一把椅子，在等一个人。',
  calm: '今天的一切都刚刚好。',
  warmth: '今天有人，悄悄递来一盏灯。',
  tiredness: '今天的黄昏，来得早一点。',
  expectation: '今天的路，通向有光的地方。'
};

// 分析文本情绪
function analyzeEmotion(text) {
  if (!text || text.trim().length < 5) {
    return {
      emotion: 'calm',
      label: '平静',
      color: getEmotionColor('calm'),
      poem: emotionPoems.calm
    };
  }

  const scores = {};
  let totalScore = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    scores[emotion] = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        scores[emotion] += 1;
        totalScore += 1;
      }
    });
  }

  // 如果没有命中关键词，默认平静
  if (totalScore === 0) {
    return {
      emotion: 'calm',
      label: '平静',
      color: getEmotionColor('calm'),
      poem: emotionPoems.calm
    };
  }

  // 找到得分最高的情绪
  let dominantEmotion = 'calm';
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion;
    }
  }

  return {
    emotion: dominantEmotion,
    label: emotionLabels[dominantEmotion],
    color: getEmotionColor(dominantEmotion),
    poem: generatePoem(dominantEmotion)
  };
}

// 生成诗句
function generatePoem(emotion) {
  return emotionPoems[emotion] || emotionPoems.calm;
}

// 调整颜色透明度（hex -> rgba）
function adjustColorOpacity(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// 生成画作 SVG
function generateArtSvg(emotion) {
  const baseColor = getEmotionColor(emotion);
  const palette = [baseColor, adjustColorOpacity(baseColor, 0.7), adjustColorOpacity(baseColor, 0.4)];
  const seed = Math.random();

  // 生成随机抽象形状
  let shapes = '';
  for (let i = 0; i < 5; i++) {
    const cx = 100 + (Math.sin(seed * (i + 1)) * 60);
    const cy = 100 + (Math.cos(seed * (i + 2)) * 60);
    const r = 20 + Math.abs(Math.sin(seed * (i + 3))) * 50;
    const color = palette[i % palette.length];
    const opacity = 0.3 + Math.abs(Math.sin(seed * (i + 4))) * 0.4;

    shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" />`;
  }

  // 添加一些线条
  for (let i = 0; i < 3; i++) {
    const x1 = Math.random() * 200;
    const y1 = Math.random() * 200;
    const x2 = Math.random() * 200;
    const y2 = Math.random() * 200;
    shapes += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${palette[0]}" stroke-width="1" opacity="0.4" />`;
  }

  const paperColor = (typeof document !== 'undefined' && getComputedStyle(document.body).getPropertyValue('--color-paper').trim()) || '#FDFBF7';

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
      <rect width="200" height="200" fill="${paperColor}" />
      <defs>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1" />
          </feComponentTransfer>
        </filter>
      </defs>
      ${shapes}
      <rect width="200" height="200" filter="url(#grain)" opacity="0.3" />
    </svg>
  `;
}
