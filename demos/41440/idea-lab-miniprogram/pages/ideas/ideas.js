const storage = require('../../utils/storage');
const ai = require('../../utils/ai');

Page({
  data: {
    ideas: [],
    filteredIdeas: [],
    searchText: '',
    currentFilter: 'all',
    duplicates: [],
    showDetailModal: false,
    detailIdea: {},
    showEditModal: false,
    editId: null,
    editContent: '',
    showMergeModal: false,
    mergePair: { a: {}, b: {}, sim: 0 }
  },

  onShow() {
    this.loadIdeas();
  },

  loadIdeas() {
    const ideas = storage.getIdeas();
    const duplicates = ai.detectDuplicates(ideas);
    this.setData({ ideas, duplicates });
    this.applyFilter();
  },

  applyFilter() {
    let filtered = this.data.currentFilter === 'all'
      ? [...this.data.ideas]
      : this.data.ideas.filter(i => i.category === this.data.currentFilter);

    if (this.data.searchText) {
      const text = this.data.searchText.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(text) ||
        i.content.toLowerCase().includes(text) ||
        i.tags.some(t => t.toLowerCase().includes(text))
      );
    }

    // 置顶排序
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    this.setData({ filteredIdeas: filtered });
  },

  onSearch(e) {
    this.setData({ searchText: e.detail.value });
    this.applyFilter();
  },

  filterByCategory(e) {
    this.setData({ currentFilter: e.currentTarget.dataset.category });
    this.applyFilter();
  },

  showDetail(e) {
    const idea = this.data.ideas.find(i => i.id === e.currentTarget.dataset.id);
    this.setData({ detailIdea: idea, showDetailModal: true });
  },

  closeDetailModal() {
    this.setData({ showDetailModal: false });
  },

  showEditModal(e) {
    const idea = this.data.ideas.find(i => i.id === e.currentTarget.dataset.id);
    this.setData({
      editId: idea.id,
      editContent: idea.content,
      showEditModal: true
    });
  },

  closeEditModal() {
    this.setData({ showEditModal: false });
  },

  onEditContent(e) {
    this.setData({ editContent: e.detail.value });
  },

  saveEdit() {
    const content = this.data.editContent.trim();
    if (!content) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }

    const idea = this.data.ideas.find(i => i.id === this.data.editId);
    idea.title = content.length > 25 ? content.substring(0, 25) + '...' : content;
    idea.content = content;
    idea.category = ai.classifyIdea(content);
    idea.tags = ai.extractTags(content, idea.category);
    idea.score = ai.calculateScore(content);

    storage.updateIdea(idea);
    this.setData({ showEditModal: false });
    wx.showToast({ title: '已更新', icon: 'success' });
    this.loadIdeas();
  },

  togglePin(e) {
    const id = e.currentTarget.dataset.id;
    storage.togglePin(id);
    this.loadIdeas();
  },

  deleteIdea(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个想法吗？',
      confirmColor: '#f5576c',
      success: (res) => {
        if (res.confirm) {
          storage.deleteIdea(id);
          wx.showToast({ title: '已删除', icon: 'success' });
          this.loadIdeas();
        }
      }
    });
  },

  goToAnalysis(e) {
    const id = e.currentTarget.dataset.id;
    wx.setStorageSync('analysisId', id);
    wx.switchTab({ url: '/pages/analysis/analysis' });
  },

  exportIdeas() {
    const ideas = storage.getIdeas();
    const text = ideas.map(i =>
      `【${i.title}】\n分类：${i.category} | 标签：${i.tags.join('、')}\n时间：${i.date} ${i.time} | 评分：${i.score}分\n${i.content}\n${'─'.repeat(20)}`
    ).join('\n\n');
    const header = `闪念实验室 — 想法导出\n导出时间：${new Date().toLocaleString('zh-CN')}\n共 ${ideas.length} 个想法\n${'═'.repeat(20)}\n\n`;

    wx.setClipboardData({
      data: header + text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      }
    });
  },

  showMergeModal() {
    if (this.data.duplicates.length === 0) return;
    this.setData({
      mergePair: this.data.duplicates[0],
      showMergeModal: true
    });
  },

  closeMergeModal() {
    this.setData({ showMergeModal: false });
  },

  confirmMerge() {
    const { a, b } = this.data.mergePair;
    const keep = a.content.length >= b.content.length ? a : b;
    const remove = keep === a ? b : a;
    storage.deleteIdea(remove.id);
    this.setData({ showMergeModal: false });
    wx.showToast({ title: '已合并', icon: 'success' });
    this.loadIdeas();
  },

  preventBubble() {
    // 阻止事件冒泡
  }
});
