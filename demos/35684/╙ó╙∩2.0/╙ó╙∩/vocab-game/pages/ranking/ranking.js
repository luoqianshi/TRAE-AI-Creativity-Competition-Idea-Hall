const storage = require('../../utils/storage.js');

Page({
  data: {
    type: 'total',
    levelId: 0,
    levelName: '',
    title: '',
    rankings: [],
    isEmpty: false
  },

  onLoad(options) {
    const type = options.type || 'total';
    const levelId = parseInt(options.levelId) || 0;
    const levelName = options.levelName || '';
    
    this.setData({ type, levelId, levelName });
    this.loadRankings();
  },

  loadRankings() {
    let title = '';
    let rankings = [];

    if (this.data.type === 'total') {
      title = '总排行榜';
      rankings = storage.getTotalRanking();
    } else {
      title = `${this.data.levelName}排行榜`;
      rankings = storage.getLevelRanking(this.data.levelId);
    }

    this.setData({ 
      title, 
      rankings,
      isEmpty: rankings.length === 0
    });
  },

  goBack() {
    wx.navigateBack();
  },

  getRankIcon(index) {
    const icons = ['🥇', '🥈', '🥉'];
    return icons[index] || `第${index + 1}名`;
  },

  getRankStyle(index) {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  }
});