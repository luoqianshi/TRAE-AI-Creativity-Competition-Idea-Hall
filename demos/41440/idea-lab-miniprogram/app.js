App({
  onLaunch() {
    // 初始化本地存储
    const ideas = wx.getStorageSync('ideas') || [];
    if (ideas.length === 0) {
      // 预置示例数据
      const defaultIdeas = [
        {id:1,title:'银发经济智能陪伴助手',content:'做一个AI陪伴机器人，帮助独居老人解决日常孤独感，提供用药提醒、情感聊天、紧急呼叫等功能。通过语音交互降低使用门槛，让老年人也能轻松使用智能设备。',category:'社会服务',tags:['银发经济','AI陪伴','养老'],time:'10:30',date:'2026-06-21',score:75,pinned:false},
        {id:2,title:'儿童AI学习伴侣',content:'开发一个AI学习助手，根据孩子兴趣和学习进度自动推荐内容。通过游戏化设计激发学习兴趣，家长可以实时查看学习报告。',category:'教育创新',tags:['儿童教育','AI学习','游戏化'],time:'14:15',date:'2026-06-21',score:68,pinned:false},
        {id:3,title:'社区共享工具箱',content:'在社区设置共享工具箱，居民可以通过小程序查看和借用工具。减少资源浪费，促进邻里交流。',category:'生活娱乐',tags:['共享经济','社区','环保'],time:'16:45',date:'2026-06-21',score:55,pinned:false},
        {id:4,title:'AI论文速读助手',content:'用AI帮助研究生和科研人员快速阅读和理解论文。自动提取摘要、关键贡献、方法论，生成思维导图。',category:'学习工作',tags:['科研','论文','效率工具'],time:'09:20',date:'2026-06-20',score:82,pinned:true},
        {id:5,title:'非遗文化数字体验馆',content:'利用AR/VR技术让用户沉浸式体验非遗文化。结合AI讲解，让传统文化以更生动的方式传播。',category:'社会服务',tags:['非遗','文化','AR/VR'],time:'11:00',date:'2026-06-20',score:71,pinned:false},
        {id:6,title:'智能冰箱管理器',content:'通过摄像头识别冰箱内食材，AI自动推荐菜谱、提醒过期。支持营养分析和购物清单生成。',category:'生活娱乐',tags:['智能家居','健康','减少浪费'],time:'19:30',date:'2026-06-19',score:63,pinned:false},
        {id:7,title:'方言保护与传承平台',content:'建立方言数据库，AI识别和翻译方言。通过互动游戏让年轻人学习方言。保护濒危方言，传承地域文化。',category:'社会服务',tags:['方言','文化保护','AI'],time:'08:15',date:'2026-06-19',score:77,pinned:false},
        {id:8,title:'老年人用药提醒手环',content:'设计一款专为老年人设计的智能手环，通过震动提醒按时服药，内置语音播报功能。',category:'硬件交互',tags:['智能硬件','养老','健康'],time:'20:10',date:'2026-06-21',score:70,pinned:false},
        {id:9,title:'社区养老互助平台',content:'搭建社区内的养老互助平台，让年轻志愿者帮助独居老人。AI匹配需求与志愿者，记录服务时长可兑换积分。',category:'社会服务',tags:['社区','养老','互助'],time:'15:30',date:'2026-06-21',score:73,pinned:false},
        {id:10,title:'AI编程学习助手',content:'用AI辅助初学者学习编程，实时纠错、代码解释、项目推荐。根据学习进度自适应调整难度。',category:'教育创新',tags:['编程','AI','学习'],time:'10:00',date:'2026-06-20',score:80,pinned:false}
      ];
      wx.setStorageSync('ideas', defaultIdeas);
      wx.setStorageSync('nextId', 11);
    }
  },

  globalData: {
    userInfo: null
  }
});
