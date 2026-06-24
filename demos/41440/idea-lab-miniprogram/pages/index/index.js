const storage = require('../../utils/storage');
const ai = require('../../utils/ai');

Page({
  data: {
    inputValue: '',
    isRecording: false,
    todayCount: 0,
    todayAvgScore: 0,
    todayMaxScore: 0,
    recentIdeas: []
  },

  recorderManager: null,

  onLoad() {
    this.loadData();
    this.initRecorder();
  },

  onShow() {
    this.loadData();
  },

  initRecorder() {
    this.recorderManager = wx.getRecorderManager();
    this.recorderManager.onStart(() => {
      this.setData({ isRecording: true });
      wx.showToast({ title: '正在录音，请说话...', icon: 'none', duration: 2000 });
    });
    this.recorderManager.onStop((res) => {
      this.setData({ isRecording: false });
      // 这里可以上传录音文件到语音识别服务
      // 目前使用模拟的语音识别结果
      this.simulateVoiceRecognition();
    });
    this.recorderManager.onError((err) => {
      this.setData({ isRecording: false });
      wx.showToast({ title: '录音失败：' + err.errMsg, icon: 'none' });
    });
  },

  simulateVoiceRecognition() {
    wx.showLoading({ title: '识别中...' });
    setTimeout(() => {
      wx.hideLoading();
      const demos = [
        '我想做一个帮助老年人管理日常用药和健康数据的智能助手',
        '开发一个AI学习伴侣，根据孩子兴趣自动推荐学习内容',
        '做一个社区共享工具箱，减少资源浪费促进邻里交流',
        '用AI帮助科研人员快速阅读论文，自动生成思维导图',
        '设计一款智能冰箱管理器，识别食材推荐菜谱'
      ];
      const randomDemo = demos[Math.floor(Math.random() * demos.length)];
      this.setData({ inputValue: randomDemo });
      wx.showToast({ title: '语音识别完成', icon: 'success' });
    }, 1500);
  },

  loadData() {
    const ideas = storage.getIdeas();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayIdeas = ideas.filter(i => i.date === todayStr);
    
    const todayCount = todayIdeas.length;
    const todayAvgScore = todayCount > 0 ? Math.round(todayIdeas.reduce((s, i) => s + i.score, 0) / todayCount) : 0;
    const todayMaxScore = todayCount > 0 ? Math.max(...todayIdeas.map(i => i.score)) : 0;
    
    this.setData({
      todayCount,
      todayAvgScore,
      todayMaxScore,
      recentIdeas: ideas.slice(0, 5)
    });
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  clearInput() {
    this.setData({ inputValue: '' });
  },

  addIdea() {
    const content = this.data.inputValue.trim();
    if (!content) {
      wx.showToast({ title: '请输入你的想法', icon: 'none' });
      return;
    }

    const category = ai.classifyIdea(content);
    const tags = ai.extractTags(content, category);
    const now = new Date();
    const score = ai.calculateScore(content);

    const idea = {
      title: content.length > 25 ? content.substring(0, 25) + '...' : content,
      content: content,
      category: category,
      tags: tags,
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0],
      score: score,
      pinned: false
    };

    storage.addIdea(idea);
    this.setData({ inputValue: '' });
    wx.showToast({ title: '想法已记录！', icon: 'success' });
    this.loadData();
  },

  quickFill(e) {
    if (!e || !e.currentTarget) {
      console.error('quickFill: event object is invalid', e);
      return;
    }
    const category = e.currentTarget.dataset.category;
    const examples = {
      '产品创意': '我想做一个智能药盒，帮助老年人按时服药。通过语音提醒和手机联动，子女可以远程查看服药记录，异常情况自动报警。',
      '学习心得': '今天学到了费曼学习法，用简单语言向他人解释复杂概念。让我意识到输出比输入更重要，可以应用到我的知识整理流程中。',
      '优化想法': '如果能够改进快递柜的取件流程，通过人脸识别自动开门，可以让老年人取快递更方便，减少操作步骤。',
      '问题发现': '我发现社区里很多独居老人午餐没人管，存在一个问题：外卖不健康、自己做饭又麻烦。如果能建立一个社区互助送餐系统就能解决。',
      '灵感闪现': '突然想到一个点子：把宠物陪伴和智能家居结合起来，做成一个会互动的智能宠物机器人，既能陪伴老人又能控制家电。'
    };
    const example = examples[category] || '';
    // 先清空再设置，强制触发视图更新
    this.setData({ inputValue: '' }, () => {
      this.setData({ inputValue: example });
    });
    wx.showToast({ title: '已填充示例，可直接使用或修改', icon: 'none' });
  },

  toggleVoice() {
    if (this.data.isRecording) {
      this.recorderManager.stop();
    } else {
      const options = {
        duration: 60000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        format: 'mp3'
      };
      this.recorderManager.start(options);
    }
  },

  goToIdeas() {
    wx.switchTab({ url: '/pages/ideas/ideas' });
  },

  goToAnalysis(e) {
    const id = e.currentTarget.dataset.id;
    wx.setStorageSync('analysisId', id);
    wx.switchTab({ url: '/pages/analysis/analysis' });
  }
});
