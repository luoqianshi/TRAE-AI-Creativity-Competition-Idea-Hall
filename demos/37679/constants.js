export const BOARD_BOUNDS = { width: 1200, height: 780 };
export const EXPORT_IMAGE_SCALE = 3;
export const SNAP_STYLE = { pointTolerance: 16, axisTolerance: 10 };
export const DEFAULT_LABEL_FONT_SIZE = 18;
export const DEFAULT_UNITS_PER_MM = 5;
export const DIMENSION_STYLE = {
  arrowLength: 11,
  arrowHalfWidth: 2.3,
  labelOffset: 24,
};
export const AUTO_DIMENSION_STYLE = {
  labelOffset: 10,
  verticalInset: 4,
  shelfLabelGap: 8,
  radiusLabelGap: 8,
  outsideDiameterCenterOffset: 12,
  insideDiameterMinOffset: 10,
  insideDiameterMaxOffset: 16,
  insideDiameterScale: 0.16,
};
export const LONG_PRESS_DELAY = 650;
export const DOUBLE_TAP_DELAY = 420;
export const MOVE_THRESHOLD = 6;
export const HISTORY_LIMIT = 60;
export const AUTOSAVE_STORAGE_KEY = "mechanical-drawing.autosave.v1";

export const TOOL_HINTS = {
  "arc-chord": "圆弧弦长标注：点击圆弧生成两端弦长尺寸。",
  "arc-length": "圆弧弧长标注：点击圆弧生成弧长尺寸。",
  select: "",
  "draw-line": "拖动画直线；开启正交锁定后会自动保持水平或垂直。",
  "draw-hidden-line": "拖动画细虚线；适合表示不可见轮廓线。",
  "draw-rect": "拖动画矩形。",
  "draw-roundrect": "拖动画圆角矩形。",
  "draw-circle": "按下作为圆心，拖动确定半径。",
  "draw-semicircle": "拖出直径范围，生成标准半圆弧。",
  "draw-arc": "拖出范围，生成圆弧。",
  "draw-cam": "点击放置凸轮中心并逐点绘制轮廓，双击、点击起点附近或按 Enter 可闭合。",
  length: "自动长度标注：点击直线、矩形或圆角矩形边生成长度标注。",
  diameter: "自动直径标注：点击圆生成直径标注。",
  radius: "自动半径标注：点击圆、半圆弧、圆弧或圆角生成半径标注。",
  angle: "圆弧角度标注：点击圆弧生成圆心角标注。",
  "polar-coordinate": "点击凸轮轮廓生成极坐标标注；极坐标原点自动采用该凸轮的中心点，水平向右为 0°。生成后切回选择工具可拖动半径和角度数字。",
  "manual-dim-line": "手动尺寸线：拖动绘制双箭头尺寸线。",
  "manual-extension-line": "细实线：拖动绘制自由标注细实线。",
  "manual-dim-text": "尺寸数字：点击放置尺寸数字，选中后可在左侧修改。",
  "draw-symmetry-line": "拖动画对称线。",
  "draw-chain-line": "拖动画点画线。",
  "manual-single-arrow": "单向箭头：拖动绘制自由标注箭头。",
  "manual-dim-line-labeled": "带字尺寸线：拖动绘制自带居中尺寸数字的尺寸线。",
};
