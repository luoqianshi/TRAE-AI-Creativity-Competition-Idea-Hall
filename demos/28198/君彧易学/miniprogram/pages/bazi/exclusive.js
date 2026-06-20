var app = getApp();
var baziAnalysis = require('../../utils/bazi-analysis.js');

Page({
  data: {
    name: '',
    gender: '',
    riZhu: {},
    dayunList: [],
    pillars: [],
    yongShen: {},
    geJu: {},
    pillarRelations: {},
    wuXingStats: {},
    // 深度分析
    deepAnalysis: null,
    yuanPan: null,
    keyDaYun: [],
    turningPoints: [],
    bestDaYun: null,
    worstDaYun: null,
    health: null,
    career: null,
    marriage: null,
    academics: null,
    region: null,
    luck: null,
    lifeTips: [],
    loading: true,
    computing: true,
    // 引擎版本标识
    engineVersion: 'v2',
    v2Status: '等待中...',
    // 分享解锁
    unlocked: false
  },

  onLoad: function () {
    // 检查分享解锁状态
    var unlocked = false;
    try { unlocked = !!wx.getStorageSync('bazi_unlocked'); } catch(e) {}
    this.setData({ unlocked: unlocked });

    var resultData = app.globalData && app.globalData.baziResult;
    
    if (!resultData) {
      try {
        var cached = wx.getStorageSync('baziResult');
        if (cached) resultData = cached;
      } catch (e) {}
    }

    if (!resultData) {
      this.setData({ loading: false, computing: false, error: '未找到解读结果，请重新输入' });
      return;
    }

    console.log('[exclusive] resultData 字段检查:', JSON.stringify({
      has_pillars: Array.isArray(resultData.pillars) && resultData.pillars.length > 0,
      has_riZhu: !!resultData.riZhu,
      has_yongShen: !!resultData.yongShen,
      has_geJu: !!resultData.geJu,
      has_pillarRelations: !!resultData.pillarRelations,
      has_wuXingStats: !!resultData.wuXingStats,
      has_daYun: !!(resultData.daYun && resultData.daYun.daYunList),
      has_shenShaByPillar: !!resultData.shenShaByPillar,
      has_deepAnalysisV2: !!resultData._deepAnalysisV2,
      has_deepAnalysisParams: !!resultData._deepAnalysisParams,
      has_deepAnalysis: !!resultData.deepAnalysis
    }));

    // 提取基础数据（立即显示）
    this.setData({
      name: resultData.input && resultData.input.name || '探索者',
      gender: resultData.input && resultData.input.gender || '',
      riZhu: resultData.riZhu || {},
      dayunList: (resultData.daYun && resultData.daYun.daYunList) || [],
      pillars: resultData.pillars || [],
      yongShen: resultData.yongShen || {},
      geJu: resultData.geJu || {},
      pillarRelations: resultData.pillarRelations || {},
      wuXingStats: resultData.wuXingStats || {},
      loading: false,
      v2Status: '准备调用V2...'
    });

    // 延迟计算深度分析——直接从 resultData 构建参数，不依赖 _deepAnalysisParams
    var self = this;
    setTimeout(function () {
      try {
        var da = null;

        // 清除旧版V2缓存，确保使用最新代码重新计算
        if (resultData._deepAnalysisV2) {
          delete resultData._deepAnalysisV2;
          try { wx.setStorageSync('baziResult', resultData); } catch(e) {}
        }

        // 直接从 resultData 构建 V2 参数（始终重新计算，保证文字最新）
        var v2Params = {
          pillars: resultData.pillars || [],
          riZhu: resultData.riZhu || {},
          yongShen: resultData.yongShen || {},
          geJu: resultData.geJu || {},
          pillarRelations: resultData.pillarRelations || {},
          wuXingStats: resultData.wuXingStats || {},
          daYun: resultData.daYun || { daYunList: [] },
          shenShaByPillar: resultData.shenShaByPillar || {}
        };

        console.log('[exclusive] 调用 getDeepAnalysisV2...');
        self.setData({ v2Status: 'V2引擎计算中...' });

        da = baziAnalysis.getDeepAnalysisV2(v2Params);

        console.log('[exclusive] V2 计算完成，结果:', JSON.stringify({
          has_yuanPan: !!da.yuanPan,
          has_yongShen: !!da.yongShen,
          v2_yongShen_values: da.yongShen ? da.yongShen.yongShen : 'N/A',
          v2_jiShen_values: da.yongShen ? da.yongShen.jiShen : 'N/A',
          has_geJu: !!da.geJu,
          has_marriage: !!da.marriage,
          has_academics: !!da.academics,
          has_career: !!da.career,
          has_health: !!da.health,
          has_keyDaYun: Array.isArray(da.keyDaYun) && da.keyDaYun.length > 0,
          has_lifeTips: Array.isArray(da.lifeTips) && da.lifeTips.length > 0
        }));

        // 缓存
        resultData._deepAnalysisV2 = da;
        resultData.deepAnalysis = da;

        var v2YongShen = da.yongShen ? (da.yongShen.yongShen || []).join('、') : '无';
        var v2JiShen = da.yongShen ? (da.yongShen.jiShen || []).join('、') : '无';

        self.setData({
          engineVersion: 'v2',
          v2Status: 'V2引擎生效 ✓  |  喜用: ' + v2YongShen + '  |  所忌: ' + v2JiShen,
          deepAnalysis: da,
          yuanPan: da.yuanPan || null,
          yongShen: da.yongShen || self.data.yongShen,
          geJu: da.geJu || self.data.geJu,
          keyDaYun: da.keyDaYun || [],
          turningPoints: da.turningPoints || [],
          bestDaYun: da.bestDaYun || null,
          worstDaYun: da.worstDaYun || null,
          health: da.health || null,
          career: da.career || null,
          marriage: da.marriage || null,
          academics: da.academics || null,
          region: da.region || null,
          luck: da.luck || null,
          lifeTips: da.lifeTips || [],
          computing: false
        });
      } catch (err) {
        console.error('[exclusive] V2 引擎崩溃:', err.message, err.stack);
        self.setData({ 
          computing: false, 
          v2Status: 'V2引擎失败: ' + (err.message || '未知错误'),
          error: 'V2分析失败: ' + (err.message || '未知错误')
        });
      }
    }, 300);
  },

  onBack: function () {
    wx.navigateBack();
  },

  // 开发者快捷解锁：连续点击封印5次
  _devTapCount: 0,
  _devTapTimer: null,
  onDevSealTap: function () {
    var _this = this;
    _this._devTapCount = (_this._devTapCount || 0) + 1;
    if (_this._devTapTimer) clearTimeout(_this._devTapTimer);
    _this._devTapTimer = setTimeout(function () {
      _this._devTapCount = 0;
    }, 300);
    if (_this._devTapCount >= 5) {
      _this._devTapCount = 0;
      clearTimeout(_this._devTapTimer);
      try { wx.setStorageSync('bazi_unlocked', true); } catch(e) {}
      _this.setData({ unlocked: true });
      wx.showToast({ title: '已解锁（开发模式）', icon: 'none', duration: 1500 });
    }
  },

  onShareAppMessage: function () {
    var name = this.data.name || '探索者';
    // 分享即解锁
    try { wx.setStorageSync('bazi_unlocked', true); } catch(e) {}
    this.setData({ unlocked: true });
    return {
      title: name + ' 邀你共鉴 — 君彧易学',
      path: '/pages/bazi/input'
    };
  }
});
