const levels = require('../../data/levels.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    levelId: 1,
    levelName: '',
    wordData: [],
    englishWords: [],
    chineseWords: [],
    score: 0,
    completedCount: 0,
    total: 0,
    feedbackText: '',
    feedbackType: '',
    showFeedback: false,
    selectedIndex: -1,
    selectedWord: ''
  },

  onLoad(options) {
    const levelId = parseInt(options.levelId) || 1;
    const level = levels.find(l => l.id === levelId);
    
    if (level) {
      this.setData({
        levelId,
        levelName: level.name,
        wordData: level.words,
        total: level.words.length
      });
      this.initGame();
    }
  },

  initGame() {
    const wordData = this.data.wordData;
    const englishWords = this.shuffleArray([...wordData]);
    const chineseWords = this.shuffleArray([...wordData]);
    
    englishWords.forEach((item, index) => {
      item.matched = false;
    });
    
    chineseWords.forEach((item, index) => {
      item.matched = false;
    });

    this.setData({
      englishWords,
      chineseWords,
      score: 0,
      completedCount: 0,
      selectedIndex: -1,
      selectedWord: ''
    });
  },

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  onWordTap(e) {
    const { index, en, zh } = e.currentTarget.dataset;
    const englishWords = this.data.englishWords;
    
    if (englishWords[index].matched) return;
    
    this.setData({
      selectedIndex: index,
      selectedWord: en
    });
    
    wx.vibrateShort({ type: 'light' });
  },

  onTargetTap(e) {
    const { index, en, zh } = e.currentTarget.dataset;
    const chineseWords = this.data.chineseWords;
    
    if (chineseWords[index].matched) return;
    
    const { selectedIndex, selectedWord } = this.data;
    
    if (selectedIndex === -1 || !selectedWord) {
      this.showFeedback('请先选择英文词汇', 'wrong');
      return;
    }

    if (en === selectedWord) {
      this.handleCorrect(selectedIndex, index);
    } else {
      this.handleWrong();
    }
  },

  handleCorrect(enIndex, zhIndex) {
    this.playSound('correct');
    this.showFeedback('太棒了！', 'correct');
    
    const englishWords = this.data.englishWords;
    const chineseWords = this.data.chineseWords;
    
    englishWords[enIndex].matched = true;
    chineseWords[zhIndex].matched = true;
    
    const newScore = this.data.score + 10;
    const newCompletedCount = this.data.completedCount + 1;
    
    this.setData({
      englishWords,
      chineseWords,
      selectedIndex: -1,
      selectedWord: '',
      score: newScore,
      completedCount: newCompletedCount
    });

    if (newCompletedCount === this.data.total) {
      setTimeout(() => {
        const playerName = storage.getPlayerName();
        storage.saveLevelScore(this.data.levelId, newScore);
        storage.saveLevelRanking(this.data.levelId, playerName, newScore);
        
        const totalScore = storage.getTotalScore();
        storage.saveTotalRanking(playerName, totalScore);
        
        wx.redirectTo({
          url: `/pages/result/result?score=${newScore}&levelId=${this.data.levelId}&levelName=${this.data.levelName}`
        });
      }, 1000);
    }
  },

  handleWrong() {
    this.playSound('wrong');
    this.showFeedback('再想想哦～', 'wrong');
    this.setData({
      score: Math.max(0, this.data.score - 5)
    });
  },

  showFeedback(text, type) {
    this.setData({
      feedbackText: text,
      feedbackType: type,
      showFeedback: true
    });

    setTimeout(() => {
      this.setData({ showFeedback: false });
    }, 1000);
  },

  playSound(type) {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    
    if (type === 'correct') {
      wx.vibrateShort({ type: 'light' });
    } else {
      wx.vibrateShort({ type: 'heavy' });
    }
    
    innerAudioContext.onEnded(() => {
      innerAudioContext.destroy();
    });
  },

  goBack() {
    wx.navigateBack();
  }
