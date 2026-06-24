const storage = require('../../utils/storage');
const ai = require('../../utils/ai');

Page({
  data: {
    heatmapData: [],
    radarData: [],
    growthData: [],
    growData: [],
    relationList: []
  },

  onShow() {
    this.loadData();
    this.drawMindmap();
  },

  loadData() {
    const ideas = storage.getIdeas();
    const total = ideas.length || 1;
    const CATEGORIES = ['社会服务', '教育创新', '生活娱乐', '学习工作', '硬件交互'];
    const CAT_COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#fa709a'];

    // 热力图
    const catCounts = {};
    CATEGORIES.forEach(c => catCounts[c] = 0);
    ideas.forEach(i => { if (catCounts[i.category] !== undefined) catCounts[i.category]++; });

    const heatmapData = CATEGORIES.map((cat, i) => ({
      category: cat,
      percent: Math.round((catCounts[cat] / total) * 100),
      color: CAT_COLORS[i]
    }));

    // 能力雷达
    const boost = Math.min(20, ideas.length * 2);
    const abilities = [
      { icon: '🎯', name: '社会洞察', base: 82, color: '#43e97b' },
      { icon: '💡', name: '创意发散', base: 76, color: '#667eea' },
      { icon: '🔧', name: '技术实现', base: 48, color: '#f5576c' },
      { icon: '📊', name: '商业思维', base: 60, color: '#fee140' },
      { icon: '🤝', name: '用户感知', base: 73, color: '#f093fb' }
    ];

    const radarData = abilities.map(a => ({
      ...a,
      score: Math.min(98, a.base + (a.name === '技术实现' ? Math.floor(boost * 0.5) : a.name === '商业思维' ? Math.floor(boost * 0.7) : boost))
    }));

    // 成长轨迹
    const growthData = [
      { date: '第1天', text: '记录了第一个想法，开启创意之旅' },
      { date: `已记录 ${ideas.length} 个想法`, text: '创意思维逐渐活跃，覆盖多个领域' },
      { date: '持续成长中', text: '通过每日回顾，想法质量不断提升' }
    ];
    if (ideas.length >= 5) growthData.push({ date: '里程碑', text: '已积累 5+ 个想法，形成初步创意库' });
    if (ideas.length >= 10) growthData.push({ date: '进阶', text: '创意库初具规模，思维画像逐渐清晰' });

    // 提升建议
    const weakAreas = radarData.filter(a => a.score < 65).map(a => a.name);
    const strongAreas = radarData.filter(a => a.score >= 70).map(a => a.name);
    const topIdea = ideas.length > 0 ? ideas.reduce((a, b) => a.score > b.score ? a : b) : null;

    const growData = [
      {
        type: 'learn',
        typeLabel: '课程推荐',
        title: '针对薄弱领域的学习资源',
        items: weakAreas.includes('技术实现') ? ['Python 编程入门实战', 'AI 产品设计基础', '前端开发快速上手'] :
               weakAreas.includes('商业思维') ? ['商业模式画布精讲', '创业融资入门', '产品定价策略'] :
               ['AI 工具使用技巧', '产品思维培养', '数据驱动决策']
      },
      {
        type: 'action',
        typeLabel: '行动建议',
        title: '把想法转化为行动',
        items: topIdea ? [`选择评分最高的想法「${topIdea.title}」深入调研`, '制定一周行动计划', '寻找志同道合的伙伴'] :
               ['开始记录你的第一个想法', '每天至少记录一个灵感', '定期回顾和整理']
      },
      {
        type: 'inspire',
        typeLabel: '灵感激发',
        title: '基于你的兴趣推荐跨界灵感',
        items: strongAreas.includes('社会洞察') ? ['关注适老化设计案例', '研究海外社会创新项目', '阅读《社会企业家的故事》'] :
               strongAreas.includes('创意发散') ? ['浏览 Kickstarter 热门项目', '参加创意工作坊', '阅读《创新者的窘境》'] :
               ['关注 AI 前沿动态', '浏览 Product Hunt 每日新品', '订阅科技资讯周刊']
      }
    ];

    // 关联发现：找出相似的想法对
    const duplicates = ai.detectDuplicates(ideas);
    const relationList = duplicates.slice(0, 3).map(pair => ({
      titleA: pair.a.title,
      titleB: pair.b.title,
      sim: Math.round(pair.sim * 100),
      categoryA: pair.a.category,
      categoryB: pair.b.category
    }));

    this.setData({ heatmapData, radarData, growthData, growData, relationList });
  },

  drawMindmap() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#mindmap').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;

      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      const width = res[0].width;
      const height = res[0].height;
      const cx = width / 2;
      const cy = height / 2;

      const ideas = storage.getIdeas();
      const CATEGORIES = ['社会服务', '教育创新', '生活娱乐', '学习工作', '硬件交互'];
      const CAT_COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#fa709a'];
      const catCounts = {};
      CATEGORIES.forEach(c => catCounts[c] = 0);
      ideas.forEach(i => { if (catCounts[i.category] !== undefined) catCounts[i.category]++; });

      ctx.clearRect(0, 0, width, height);

      // 背景圆环装饰
      for (let ring = 1; ring <= 3; ring++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 60 + ring * 35, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(102, 126, 234, ${0.03 * ring})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 计算分类节点位置
      const categoryNodes = CATEGORIES.map((cat, i) => {
        const angle = (i / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
        const r = Math.min(width, height) * 0.30;
        return {
          cat,
          i,
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          count: catCounts[cat],
          color: CAT_COLORS[i]
        };
      });

      // 绘制分类之间的关联线（基于共同标签）
      const tagMap = {};
      ideas.forEach(idea => {
        idea.tags.forEach(tag => {
          if (!tagMap[tag]) tagMap[tag] = [];
          tagMap[tag].push(idea.category);
        });
      });

      const drawnPairs = new Set();
      Object.values(tagMap).forEach(cats => {
        for (let i = 0; i < cats.length; i++) {
          for (let j = i + 1; j < cats.length; j++) {
            const a = CATEGORIES.indexOf(cats[i]);
            const b = CATEGORIES.indexOf(cats[j]);
            if (a !== -1 && b !== -1 && a !== b) {
              const key = Math.min(a, b) + '-' + Math.max(a, b);
              if (!drawnPairs.has(key)) {
                drawnPairs.add(key);
                const nodeA = categoryNodes[a];
                const nodeB = categoryNodes[b];
                ctx.beginPath();
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.strokeStyle = 'rgba(102, 126, 234, 0.15)';
                ctx.lineWidth = 2;
                ctx.stroke();
              }
            }
          }
        }
      });

      // 绘制中心到分类的连线（带渐变）
      categoryNodes.forEach(node => {
        const grad = ctx.createLinearGradient(cx, cy, node.x, node.y);
        grad.addColorStop(0, node.color + '40');
        grad.addColorStop(1, node.color + '80');
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      // 绘制中心节点
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      const centerGrad = ctx.createRadialGradient(cx - 15, cy - 15, 0, cx, cy, 40);
      centerGrad.addColorStop(0, '#667eea');
      centerGrad.addColorStop(0.7, '#764ba2');
      centerGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = centerGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 中心文字
      ctx.fillStyle = 'white';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('我的想法', cx, cy - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${ideas.length}个`, cx, cy + 14);

      // 绘制分类节点
      categoryNodes.forEach(node => {
        const nodeR = Math.max(32, Math.min(48, node.count * 5 + 24));

        // 外发光
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeR + 8, 0, Math.PI * 2);
        ctx.fillStyle = node.color + '18';
        ctx.fill();

        // 节点
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
        const nodeGrad = ctx.createRadialGradient(
          node.x - nodeR * 0.3, node.y - nodeR * 0.3, 0,
          node.x, node.y, nodeR
        );
        nodeGrad.addColorStop(0, node.color);
        nodeGrad.addColorStop(1, node.color + 'cc');
        ctx.fillStyle = nodeGrad;
        ctx.fill();

        // 节点边框
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 分类名称
        ctx.fillStyle = 'white';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.cat, node.x, node.y - 6);

        // 数量
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(`${node.count}个`, node.x, node.y + 14);
      });
    });
  }
});
