const storage = require('../../utils/storage');
const ai = require('../../utils/ai');

Page({
  data: {
    todayDate: '',
    todayCount: 0,
    analyzedCount: 0,
    maxScore: 0,
    categoryCount: 0,
    creativityIndex: 0,
    ciStatus: '',
    ciDesc: '',
    weekCount: 0,
    avgScore: 0,
    totalScore: 0,
    top3: [],
    timeline: []
  },

  onShow() {
    this.loadData();
    this.drawTrendChart();
  },

  loadData() {
    const ideas = storage.getIdeas();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    this.setData({
      todayDate: today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    });

    const todayIdeas = ideas.filter(i => i.date === todayStr);
    const analyzedCount = todayIdeas.filter(i => i.score > 0).length;
    const maxScore = todayIdeas.length > 0 ? Math.max(...todayIdeas.map(i => i.score)) : 0;
    const categoryCount = new Set(todayIdeas.map(i => i.category)).size;
    const avgScore = todayIdeas.length > 0 ? Math.round(todayIdeas.reduce((s, i) => s + i.score, 0) / todayIdeas.length) : 0;
    const totalScore = todayIdeas.reduce((s, i) => s + i.score, 0);

    const ci = ai.calculateCreativityIndex(ideas, todayStr);
    const ciStatus = ci >= 80 ? '创意爆发！' : ci >= 60 ? '思维活跃' : '继续加油';
    const ciDesc = ci >= 80 ? '🔥' : ci >= 60 ? '✨' : '💪';

    const weekIdeas = ideas.filter(i => {
      const d = new Date(i.date);
      const diff = (today - d) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });

    // TOP 3
    const sorted = [...todayIdeas].sort((a, b) => b.score - a.score).slice(0, 3);
    const reasons = [
      '🌟 综合评分最高，差异化明显，建议优先深入调研',
      '✅ 市场潜力较大，值得进一步探索',
      '💡 有创新亮点，可作为备选方向'
    ];
    const top3 = sorted.map((idea, i) => ({
      ...idea,
      reason: reasons[i] || '💡 值得关注的想法'
    }));

    // 时间轴
    const timeline = [...todayIdeas].sort((a, b) => a.time.localeCompare(b.time));

    this.setData({
      todayCount: todayIdeas.length,
      analyzedCount,
      maxScore,
      categoryCount,
      creativityIndex: ci,
      ciStatus,
      ciDesc,
      weekCount: weekIdeas.length,
      avgScore,
      totalScore,
      top3,
      timeline
    });
  },

  drawTrendChart() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#trendChart').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      const width = res[0].width;
      const height = res[0].height;
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      // 获取本周数据
      const ideas = storage.getIdeas();
      const today = new Date();
      const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const dayIndex = (today.getDay() + 6) % 7;
      
      const counts = dayNames.map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - dayIndex + i);
        const dateStr = d.toISOString().split('T')[0];
        return ideas.filter(idea => idea.date === dateStr).length;
      });

      const maxCount = Math.max(...counts, 1);

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 绘制柱状图
      const barWidth = chartWidth / counts.length * 0.6;
      const gap = chartWidth / counts.length;

      counts.forEach((count, i) => {
        const barHeight = (count / maxCount) * chartHeight * 0.8;
        const x = padding + i * gap + (gap - barWidth) / 2;
        const y = height - padding - barHeight;

        // 渐变
        const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // 圆角
        ctx.beginPath();
        ctx.moveTo(x, y + 6);
        ctx.arcTo(x, y, x + 6, y, 6);
        ctx.lineTo(x + barWidth - 6, y);
        ctx.arcTo(x + barWidth, y, x + barWidth, y + 6, 6);
        ctx.lineTo(x + barWidth, height - padding);
        ctx.lineTo(x, height - padding);
        ctx.closePath();
        ctx.fill();

        // 数值
        ctx.fillStyle = '#888';
        ctx.font = '20rpx sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(count.toString(), x + barWidth / 2, y - 10);

        // 标签
        ctx.fillStyle = '#666';
        ctx.font = '22rpx sans-serif';
        ctx.fillText(dayNames[i], x + barWidth / 2, height - padding + 25);
      });
    });
  },

  goToAnalysis(e) {
    const id = e.currentTarget.dataset.id;
    wx.setStorageSync('analysisId', id);
    wx.switchTab({ url: '/pages/analysis/analysis' });
  }
});
