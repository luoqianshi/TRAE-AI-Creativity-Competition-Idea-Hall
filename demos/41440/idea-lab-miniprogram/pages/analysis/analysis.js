const storage = require('../../utils/storage');
const ai = require('../../utils/ai');

const ANALYSIS_CACHE_KEY = 'analysisCache';

function getAnalysisCache() {
  return wx.getStorageSync(ANALYSIS_CACHE_KEY) || {};
}

function saveAnalysisCache(id, report) {
  const cache = getAnalysisCache();
  cache[id] = report;
  wx.setStorageSync(ANALYSIS_CACHE_KEY, cache);
}

function getCachedReport(id) {
  const cache = getAnalysisCache();
  return cache[id] || null;
}

function markIdeaAnalyzed(ideas, id) {
  const idx = ideas.findIndex(i => i.id === id);
  if (idx !== -1 && !ideas[idx].analyzed) {
    ideas[idx].analyzed = true;
    storage.saveIdeas(ideas);
  }
}

Page({
  data: {
    ideaList: [],
    filteredList: [],
    searchText: '',
    currentFilter: 'all',
    selectedIdea: null,
    report: null,
    isLoading: false
  },

  onShow() {
    this.loadIdeas();
    const analysisId = wx.getStorageSync('analysisId');
    if (analysisId) {
      wx.removeStorageSync('analysisId');
      const ideas = storage.getIdeas();
      const idea = ideas.find(i => i.id === analysisId);
      if (idea) {
        this.selectIdeaById(idea.id);
      }
    }
  },

  loadIdeas() {
    const ideas = storage.getIdeas();
    // 按时间倒序排列（最新的在前面）
    ideas.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB - dateA;
    });
    this.setData({ ideaList: ideas });
    this.applyFilter();
  },

  applyFilter() {
    let filtered = this.data.currentFilter === 'all'
      ? [...this.data.ideaList]
      : this.data.ideaList.filter(i => i.category === this.data.currentFilter);

    if (this.data.searchText) {
      const text = this.data.searchText.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(text) ||
        i.content.toLowerCase().includes(text)
      );
    }

    this.setData({ filteredList: filtered });
  },

  onSearch(e) {
    this.setData({ searchText: e.detail.value });
    this.applyFilter();
  },

  filterByCategory(e) {
    this.setData({ currentFilter: e.currentTarget.dataset.category });
    this.applyFilter();
  },

  selectIdea(e) {
    const id = e.currentTarget.dataset.id;
    this.selectIdeaById(id);
  },

  selectIdeaById(id) {
    const ideas = storage.getIdeas();
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;

    // 标记为已分析
    markIdeaAnalyzed(ideas, id);

    // 检查是否有缓存报告
    const cachedReport = getCachedReport(id);
    if (cachedReport) {
      this.setData({ selectedIdea: idea, report: cachedReport, isLoading: false });
      // 刷新列表上的已分析状态
      this.loadIdeas();
      return;
    }

    this.setData({ selectedIdea: idea, report: null });
    this.generateReport(idea);
  },

  backToList() {
    this.setData({ selectedIdea: null, report: null });
  },

  generateReport(idea) {
    this.setData({ isLoading: true });
    setTimeout(() => {
      const report = ai.generateAnalysis(idea);
      saveAnalysisCache(idea.id, report);
      this.setData({ report, isLoading: false });
      // 刷新列表上的已分析状态
      this.loadIdeas();
    }, 1500);
  },

  reanalyze() {
    const idea = this.data.selectedIdea;
    if (!idea) return;
    // 清除缓存并重新生成
    const cache = getAnalysisCache();
    delete cache[idea.id];
    wx.setStorageSync(ANALYSIS_CACHE_KEY, cache);
    this.setData({ report: null });
    this.generateReport(idea);
  }
});
