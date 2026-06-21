const STORAGE_KEYS = {
  LEVEL_SCORES: 'level_scores',
  PLAYER_NAME: 'player_name',
  TOTAL_SCORES: 'total_scores'
};

function getLevelScores() {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.LEVEL_SCORES);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveLevelScore(levelId, score) {
  const scores = getLevelScores();
  if (!scores[levelId] || score > scores[levelId]) {
    scores[levelId] = score;
    wx.setStorageSync(STORAGE_KEYS.LEVEL_SCORES, JSON.stringify(scores));
  }
}

function getPlayerName() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.PLAYER_NAME) || '玩家';
  } catch {
    return '玩家';
  }
}

function savePlayerName(name) {
  wx.setStorageSync(STORAGE_KEYS.PLAYER_NAME, name);
}

function getTotalScore() {
  const scores = getLevelScores();
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
}

function getLevelRanking(levelId) {
  try {
    const data = wx.getStorageSync(`level_ranking_${levelId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLevelRanking(levelId, playerName, score) {
  const rankings = getLevelRanking(levelId);
  rankings.push({ name: playerName, score, time: Date.now() });
  rankings.sort((a, b) => b.score - a.score);
  const top10 = rankings.slice(0, 10);
  wx.setStorageSync(`level_ranking_${levelId}`, JSON.stringify(top10));
}

function getTotalRanking() {
  try {
    const data = wx.getStorageSync('total_ranking');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTotalRanking(playerName, totalScore) {
  const rankings = getTotalRanking();
  const existingIndex = rankings.findIndex(item => item.name === playerName);
  if (existingIndex >= 0) {
    if (totalScore > rankings[existingIndex].score) {
      rankings[existingIndex].score = totalScore;
      rankings[existingIndex].time = Date.now();
    }
  } else {
    rankings.push({ name: playerName, score: totalScore, time: Date.now() });
  }
  rankings.sort((a, b) => b.score - a.score);
  const top10 = rankings.slice(0, 10);
  wx.setStorageSync('total_ranking', JSON.stringify(top10));
}

module.exports = {
  getLevelScores,
  saveLevelScore,
  getPlayerName,
  savePlayerName,
  getTotalScore,
  getLevelRanking,
  saveLevelRanking,
  getTotalRanking,
  saveTotalRanking
};