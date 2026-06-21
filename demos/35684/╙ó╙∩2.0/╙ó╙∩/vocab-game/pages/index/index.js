const levels = require('../../data/levels.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    levels: [],
    playerName: '',
    totalScore: 0,
    showNameModal: false,
    inputName: ''
  },

  onLoad() {
    this.loadLevels();
    this.loadPlayerInfo();
  },

  onShow() {
    this.loadPlayerInfo();
  },

  loadLevels() {
    const levelScores = storage.getLevelScores();
    const newLevels = levels.map(level => ({
      ...level,
      bestScore: levelScores[level.id] || 0
    }));
    this.setData({ levels: newLevels });
  },

  loadPlayerInfo() {
    const playerName = storage.getPlayerName();
    const totalScore = storage.getTotalScore();
    this.setData({ playerName, totalScore });
  },

  startLevel(e) {
    const levelId = e.currentTarget.dataset.levelId;
    wx.navigateTo({
      url: `/pages/game/game?levelId=${levelId}`
    });
  },

  viewLevelRanking(e) {
    const levelId = e.currentTarget.dataset.levelId;
    const levelName = e.currentTarget.dataset.levelName;
    wx.navigateTo({
      url: `/pages/ranking/ranking?type=level&levelId=${levelId}&levelName=${levelName}`
    });
  },

  viewTotalRanking() {
    wx.navigateTo({
      url: '/pages/ranking/ranking?type=total'
    });
  },

  changeName() {
    this.setData({ 
      showNameModal: true,
      inputName: this.data.playerName 
    });
  },

  confirmName() {
    const name = this.data.inputName.trim();
    if (name) {
      storage.savePlayerName(name);
      this.setData({ playerName: name });
    }
    this.setData({ showNameModal: false });
  },

  cancelName() {
    this.setData({ showNameModal: false });
  },

  onInputChange(e) {
    this.setData({ inputName: e.detail.value });
  }
});