// pages/login/login.js — 登录授权 + 角色选择
const { setRole, wxLogin } = require('../../utils/auth');
const { track } = require('../../utils/track');

Page({
  data: {
    step: 'role',     // role → profile → done
    role: null,
    childName: '',
    birthMonth: '',
  },

  // 选择角色
  pickRole(e) {
    const { role } = e.currentTarget.dataset;
    this.setData({ role, step: 'profile' });
    track('select_role', { role });
  },

  // 输入儿童信息
  onNameInput(e) {
    this.setData({ childName: e.detail.value });
  },
  onBirthInput(e) {
    this.setData({ birthMonth: e.detail.value });
  },

  // 微信授权登录（button open-type="getUserProfile" 已废弃，改用 chooseAvatar + 昵称）
  async handleStart() {
    if (this.data.role === 'parent' && !this.data.childName) {
      wx.showToast({ title: '请填写宝宝昵称', icon: 'none' });
      return;
    }
    try {
      await setRole(this.data.role, {
        name: this.data.childName,
        birthMonth: this.data.birthMonth,
      });
      track('login_success', { role: this.data.role });
      wx.switchTab({ url: '/pages/index/index' });
    } catch (e) {
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    }
  },
});
