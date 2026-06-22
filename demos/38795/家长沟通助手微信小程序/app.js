App({
  onLaunch: function () {
    this.initData()
  },
  onShow: function () {},
  onHide: function () {},
  
  initData: function() {
    const templates = wx.getStorageSync('templates')
    if (!templates || templates.length === 0) {
      const defaultTemplates = [
        {
          id: '1',
          name: '成绩进步-微信-鼓励型',
          scene: '成绩进步',
          style: '温和鼓励型',
          channel: '微信',
          content: '尊敬的{name}家长您好！{name}这次{subject}考试取得了{score}分的好成绩，相比上次进步了{improvement}分，班级排名第{rank}名，表现非常出色！孩子在学习上的努力值得肯定，建议继续保持这种学习状态。如果有任何问题，随时联系我。',
          createdAt: Date.now()
        },
        {
          id: '2',
          name: '成绩退步-短信-建议型',
          scene: '成绩退步',
          style: '建设性建议型',
          channel: '短信',
          content: '{name}家长您好，{name}这次{subject}考试{score}分，较上次有所波动。主要问题在{weakPoints}部分，建议周末针对性练习。如需帮助请联系我。',
          createdAt: Date.now()
        },
        {
          id: '3',
          name: '课堂表现异常-邮件-直接型',
          scene: '课堂表现',
          style: '专业直接型',
          channel: '邮件',
          content: '尊敬的{name}家长：\n\n您好！最近{name}同学在{subject}课堂上的表现出现了一些异常情况，主要表现为{behavior}。这种状态持续下去会严重影响学习效果。\n\n希望家长能关注孩子的状态，了解是否存在家庭或个人方面的问题。建议我们保持密切沟通，共同帮助{name}调整状态。\n\n如有需要，欢迎随时联系我。\n\n此致\n敬礼',
          createdAt: Date.now()
        },
        {
          id: '4',
          name: '作业提醒-关怀型',
          scene: '作业完成情况',
          style: '关怀提醒型',
          channel: '微信',
          content: '温馨提醒：{name}同学今天的{subject}作业还未提交，请家长督促孩子按时完成。如有特殊情况请告知，谢谢配合！',
          createdAt: Date.now()
        },
        {
          id: '5',
          name: '知识点薄弱-建议型',
          scene: '知识点掌握情况',
          style: '建设性建议型',
          channel: '微信',
          content: '尊敬的{name}家长您好！经过近期观察，{name}同学在{subject}的{weakPoints}知识点上掌握不够扎实，建议在家多做一些相关练习，巩固基础。有问题随时可以问我。',
          createdAt: Date.now()
        },
        {
          id: '6',
          name: '家校配合请求-专业型',
          scene: '家校配合请求',
          style: '专业直接型',
          channel: '微信',
          content: '尊敬的{name}家长您好！为了更好地帮助{name}同学提高{subject}成绩，希望家长能配合以下几点：\n1. 每天监督孩子完成作业\n2. 每周检查一次错题本\n3. 定期与孩子沟通学习情况\n\n感谢您的支持与配合！',
          createdAt: Date.now()
        }
      ]
      wx.setStorageSync('templates', defaultTemplates)
    }
  },
  
  globalData: {
    userInfo: null
  }
})
