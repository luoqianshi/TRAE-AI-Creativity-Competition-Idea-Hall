// app.js — 芽芽星 AI 幼小衔接小程序
App({
  globalData: {
    userInfo: null,
    role: null,           // parent | child | teacher
    childId: null,        // 当前选中的儿童档案
    cloudEnv: 'yayaxing-prod', // 云开发环境ID，部署时替换
    systemInfo: null,
    statusBarHeight: 0,
  },

  onLaunch(options) {
    // 云开发初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.cloudEnv,
        traceUser: true,
      });
    }

    // 缓存系统信息（胶囊按钮适配）
    const sysInfo = wx.getWindowInfo();
    this.globalData.systemInfo = sysInfo;
    this.globalData.statusBarHeight = sysInfo.statusBarHeight || 20;

    // 静默登录（不弹窗）
    this.silentLogin();

    // 检查更新
    this.checkUpdate();
  },

  // 静默登录：拿 openid，角色信息延后获取
  async silentLogin() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'login',
        data: { action: 'silent' },
      });
      if (result && result.openid) {
        this.globalData.openid = result.openid;
        if (result.role) {
          this.globalData.role = result.role;
        }
      }
    } catch (e) {
      console.warn('静默登录失败，将在用户操作时重试', e);
    }
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(() => {});
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已就绪，是否重启应用？',
          success: (res) => {
            if (res.confirm) updateManager.applyUpdate();
          },
        });
      });
    }
  },
});
