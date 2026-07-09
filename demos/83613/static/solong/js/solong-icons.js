/**
 * solong-icons.js — 邻里接龙 SVG 图标系统
 * =========================================
 * 所有图标使用 24x24 viewBox，strokes 使用 currentColor
 * 风格一致: 圆润、简洁、2px stroke-width, round linecap/linejoin
 *
 * 调用方式:
 *   icon('home')           // 20px 默认大小
 *   icon('home', 32)       // 指定 32px
 *   icon('home', 24, 'my-class') // 带额外 CSS 类
 *   iconRaw('home')        // 返回纯 SVG 字符串
 *   iconWithText('home', '首页') // 图标 + 文字
 */

;(function(global) {
  'use strict';

  var SOLONG_ICONS = {
    /* ========== 导航图标 ========== */

    /**
     * 首页 — 房屋
     */
    'home':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>' +
        '<polyline points="9 22 9 12 15 12 15 22"/>' +
      '</svg>',

    /**
     * 发现 — 指南针
     */
    'discover':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="9"/>' +
        '<path d="M12 4l3 7h-6l3-7z"/>' +
        '<path d="M12 20l-3-7h6l-3 7z"/>' +
      '</svg>',

    /**
     * 发起 — 加号圆
     */
    'create':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="9"/>' +
        '<path d="M12 8v8M8 12h8"/>' +
      '</svg>',

    /**
     * 我的 — 人物轮廓
     */
    'profile':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>' +
        '<circle cx="12" cy="7" r="4"/>' +
      '</svg>',

    /* ========== 操作图标 ========== */

    /**
     * 返回 — 左箭头
     */
    'back':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M19 12H5"/>' +
        '<path d="M12 19l-7-7 7-7"/>' +
      '</svg>',

    /**
     * 分享 — 节点连线
     */
    'share':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="18" cy="5" r="3"/>' +
        '<circle cx="6" cy="12" r="3"/>' +
        '<circle cx="18" cy="19" r="3"/>' +
        '<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>' +
        '<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>' +
      '</svg>',

    /**
     * 搜索 — 放大镜
     */
    'search':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="11" cy="11" r="8"/>' +
        '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
      '</svg>',

    /**
     * 筛选 — 漏斗
     */
    'filter':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>' +
      '</svg>',

    /**
     * 统计 — 柱状图
     */
    'stats':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M4 20h16"/>' +
        '<path d="M6 16V9"/>' +
        '<path d="M10 16V6"/>' +
        '<path d="M14 16v-5"/>' +
        '<path d="M18 16v-3"/>' +
      '</svg>',

    /* ========== 状态 / 互动图标 ========== */

    /**
     * 热度 — 火焰
     */
    'hot':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3C9 8 7 11 7 14.5a5 5 0 0010 0C17 11 15 8 12 3z"/>' +
        '<path d="M12 12c-1.1 1.5-2 2.5-2 3.5a2 2 0 004 0c0-1-1-2-2-3.5z"/>' +
      '</svg>',

    /**
     * 达人 / 排行 — 皇冠
     */
    'crown':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M2 20h20l-3-11-5 4-4-5-5 4-3 12z"/>' +
        '<circle cx="6" cy="16" r="1" fill="currentColor" stroke="none"/>' +
        '<circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>' +
        '<circle cx="18" cy="16" r="1" fill="currentColor" stroke="none"/>' +
      '</svg>',

    /**
     * 倒计时 — 时钟
     */
    'clock':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<polyline points="12 6 12 12 16 14"/>' +
      '</svg>',

    /**
     * 目标 — 靶心
     */
    'target':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<circle cx="12" cy="12" r="6"/>' +
        '<circle cx="12" cy="12" r="2"/>' +
      '</svg>',

    /**
     * 价格 — 标签
     */
    'price':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>' +
        '<line x1="7" y1="7" x2="7.01" y2="7"/>' +
      '</svg>',

    /**
     * 人物 — 单人头像
     */
    'person':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="9" r="4.5"/>' +
        '<path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/>' +
      '</svg>',

    /**
     * 编辑 — 笔
     */
    'edit':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>' +
      '</svg>',

    /**
     * 关闭 — X
     */
    'close':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="18" y1="6" x2="6" y2="18"/>' +
        '<line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>',

    /**
     * 成功 — 勾选
     */
    'check':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="20 6 9 17 4 12"/>' +
      '</svg>',

    /**
     * 复制 — 重叠方块
     */
    'copy':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
        '<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>' +
      '</svg>',

    /**
     * 上传 — 向上箭头 + 横线
     */
    'upload':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>' +
        '<polyline points="17 8 12 3 7 8"/>' +
        '<line x1="12" y1="3" x2="12" y2="15"/>' +
      '</svg>',

    /**
     * 拍照 — 相机
     */
    'camera':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>' +
        '<circle cx="12" cy="13" r="4"/>' +
      '</svg>',

    /**
     * 空状态 — 箱子 / 问号
     */
    'empty':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0"/>' +
        '<circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>' +
      '</svg>',

    /**
     * 小龙人 — 可爱龙头
     */
    'dragon':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3c-5 0-9 4-9 9 0 4 2 6 4 8h10c2-2 4-4 4-8 0-5-4-9-9-9z"/>' +
        '<path d="M8 4L5 1"/>' +
        '<path d="M16 4l3-1"/>' +
        '<circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/>' +
        '<circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/>' +
        '<path d="M9 15c2 1 4 1 6 0"/>' +
      '</svg>',

    /**
     * 庆祝 — 彩带 + 星星
     */
    'celebrate':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3l1.5 4H18l-3.5 2.5L16 14l-4-3-4 3 1.5-4.5L6 7h4.5z"/>' +
        '<path d="M5 20l6-5"/>' +
        '<path d="M19 20l-6-5"/>' +
      '</svg>',

    /**
     * 链接 — 链条
     */
    'link':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>' +
        '<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>' +
      '</svg>',

    /**
     * 更多 — 三点
     */
    'more':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/>' +
        '<circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>' +
        '<circle cx="19" cy="12" r="2" fill="currentColor" stroke="none"/>' +
      '</svg>',

    /**
     * 排序 — 上下箭头
     */
    'sort':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M6 9l6-6 6 6"/>' +
        '<path d="M6 15l6 6 6-6"/>' +
      '</svg>',

    /**
     * 分类 — 网格
     */
    'category':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="3" y="3" width="8" height="8" rx="1"/>' +
        '<rect x="13" y="3" width="8" height="8" rx="1"/>' +
        '<rect x="3" y="13" width="8" height="8" rx="1"/>' +
        '<rect x="13" y="13" width="8" height="8" rx="1"/>' +
      '</svg>',

    /**
     * 提醒 — 铃铛
     */
    'alert':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
        '<path d="M13.73 21a2 2 0 01-3.46 0"/>' +
      '</svg>',

    /**
     * 消息 — 对话气泡
     */
    'chat':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>' +
      '</svg>',

    /* ========== 基础 / 工具图标 ========== */

    /**
     * 带圆的关闭
     */
    'close-circle':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="15" y1="9" x2="9" y2="15"/>' +
        '<line x1="9" y1="9" x2="15" y2="15"/>' +
      '</svg>',

    /**
     * 信息 — 圆圈 i
     */
    'info':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="12" y1="16" x2="12" y2="12"/>' +
        '<line x1="12" y1="8" x2="12.01" y2="8"/>' +
      '</svg>',

    /**
     * 向下箭头
     */
    'arrow-down':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 5v14"/>' +
        '<path d="M19 12l-7 7-7-7"/>' +
      '</svg>',

    /**
     * 向上箭头
     */
    'arrow-up':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 19V5"/>' +
        '<path d="M5 12l7-7 7 7"/>' +
      '</svg>',

    /**
     * 减号
     */
    'minus':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="5" y1="12" x2="19" y2="12"/>' +
      '</svg>',

    /**
     * 加号
     */
    'plus':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="12" y1="5" x2="12" y2="19"/>' +
        '<line x1="5" y1="12" x2="19" y2="12"/>' +
      '</svg>',

    /**
     * 包裹 — 快递盒
     */
    'package':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>' +
        '<polyline points="3.27 6.96 12 12.01 20.73 6.96"/>' +
        '<line x1="12" y1="22.08" x2="12" y2="12"/>' +
      '</svg>',

    /**
     * 刷新 — 旋转箭头
     */
    'refresh':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="23 4 23 10 17 10"/>' +
        '<polyline points="1 20 1 14 7 14"/>' +
        '<path d="M20.49 15a9 9 0 01-16.97-4"/>' +
        '<path d="M3.51 9a9 9 0 0116.97 4"/>' +
      '</svg>'
  };

  /* ========== 辅助函数 ========== */

  /**
   * 简易 HTML 转义
   * @param {*} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ========== 公开 API ========== */

  /**
   * 返回包裹在 span 中的 SVG 图标 HTML
   * @param {string} name  - 图标名称
   * @param {number} [size=20] - 图标尺寸 px
   * @param {string} [className=''] - 额外 CSS 类
   * @returns {string} HTML 字符串
   */
  function icon(name, size, className) {
    var svg = SOLONG_ICONS[name];
    if (!svg) return '';
    var s = (typeof size === 'number' && size > 0) ? size : 20;
    var cls = className || '';
    return '<span class="solong-icon' +
      (cls ? ' ' + cls : '') +
      '" style="display:inline-flex;width:' + s + 'px;height:' + s + 'px">' +
      svg +
      '</span>';
  }

  /**
   * 返回纯 SVG 字符串（无包裹 span）
   * @param {string} name - 图标名称
   * @returns {string} SVG 字符串
   */
  function iconRaw(name) {
    return SOLONG_ICONS[name] || '';
  }

  /**
   * 字体图标兼容 — 图标 + 文字
   * @param {string} iconName - 图标名称
   * @param {string} text     - 显示文字
   * @param {number} [iconSize=16] - 图标尺寸
   * @returns {string} HTML
   */
  function iconWithText(iconName, text, iconSize) {
    var is = (typeof iconSize === 'number' && iconSize > 0) ? iconSize : 16;
    return icon(iconName, is) + '<span>' + escapeHtml(text) + '</span>';
  }

  /* ========== 暴露到全局 ========== */

  global.SOLONG_ICONS = SOLONG_ICONS;
  global.icon = icon;
  global.iconRaw = iconRaw;
  global.iconWithText = iconWithText;

})(typeof window !== 'undefined' ? window : this);
