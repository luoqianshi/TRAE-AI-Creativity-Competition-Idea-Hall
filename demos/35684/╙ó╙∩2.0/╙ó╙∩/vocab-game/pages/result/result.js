Page({
  data: {
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    levelId: 0,
    levelName: ''
  },

  onLoad(options) {
    const score = parseInt(options.score) || 0;
    const levelId = parseInt(options.levelId) || 0;
    const levelName = options.levelName || '';
    const correctCount = Math.floor(score / 10);
    const wrongCount = 0;
    
    this.setData({
      score,
      correctCount,
      wrongCount,
      levelId,
      levelName
    });
  },

  playAgain() {
    wx.redirectTo({
      url: `/pages/game/game?levelId=${this.data.levelId}`
    });
  },

  goHome() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },

  viewRanking() {
    wx.redirectTo({
      url: `/pages/ranking/ranking?type=level&levelId=${this.data.levelId}&levelName=${this.data.levelName}`
    });
  }
});