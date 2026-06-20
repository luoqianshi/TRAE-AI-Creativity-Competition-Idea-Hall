/**
 * 电工电子虚拟仿真教学软件 - 元件库
 * 定义所有可使用的电子元件及其属性
 */

const ComponentLibrary = {
  // ========== 无源元件 ==========
  resistor: {
    type: 'resistor',
    name: '电阻器',
    category: 'passive',
    icon: '🔌',
    description: '限制电流流动',
    defaultValue: 1000,
    unit: 'Ω',
    unitName: '欧姆',
    minValue: 0.1,
    maxValue: 10000000,
    terminals: 2,
    symbol: 'resistor',
    color: '#8d6e63',
    properties: {
      resistance: { label: '电阻值', default: 1000, unit: 'Ω' },
      tolerance: { label: '误差', default: 5, unit: '%' },
      power: { label: '功率', default: 0.25, unit: 'W' }
    }
  },

  capacitor: {
    type: 'capacitor',
    name: '电容器',
    category: 'passive',
    icon: '⚡',
    description: '储存电荷',
    defaultValue: 0.000001,
    unit: 'F',
    unitName: '法拉',
    minValue: 1e-12,
    maxValue: 10,
    terminals: 2,
    symbol: 'capacitor',
    color: '#42a5f5',
    properties: {
      capacitance: { label: '电容值', default: 1e-6, unit: 'F' },
      voltage: { label: '耐压', default: 50, unit: 'V' },
      type: { label: '类型', default: '陶瓷', options: ['陶瓷', '电解', '薄膜'] }
    }
  },

  inductor: {
    type: 'inductor',
    name: '电感器',
    category: 'passive',
    icon: '〰️',
    description: '储存磁能',
    defaultValue: 0.001,
    unit: 'H',
    unitName: '亨利',
    minValue: 1e-9,
    maxValue: 100,
    terminals: 2,
    symbol: 'inductor',
    color: '#66bb6a',
    properties: {
      inductance: { label: '电感值', default: 0.001, unit: 'H' },
      current: { label: '额定电流', default: 1, unit: 'A' }
    }
  },

  // ========== 电源 ==========
  dcSource: {
    type: 'dcSource',
    name: '直流电源',
    category: 'source',
    icon: '🔋',
    description: '提供直流电压',
    defaultValue: 12,
    unit: 'V',
    unitName: '伏特',
    minValue: -1000,
    maxValue: 1000,
    terminals: 2,
    symbol: 'dcSource',
    color: '#ef5350',
    properties: {
      voltage: { label: '电压', default: 12, unit: 'V' },
      current: { label: '电流限制', default: 1, unit: 'A' }
    }
  },

  acSource: {
    type: 'acSource',
    name: '交流电源',
    category: 'source',
    icon: '〽️',
    description: '提供交流电压',
    defaultValue: 220,
    unit: 'V',
    unitName: '伏特',
    minValue: 1,
    maxValue: 10000,
    terminals: 2,
    symbol: 'acSource',
    color: '#ef5350',
    properties: {
      voltage: { label: '电压有效值', default: 220, unit: 'V' },
      frequency: { label: '频率', default: 50, unit: 'Hz' },
      phase: { label: '相位', default: 0, unit: '°' }
    }
  },

  // ========== 半导体器件 ==========
  diode: {
    type: 'diode',
    name: '二极管',
    category: 'semiconductor',
    icon: '▶|',
    description: '单向导电',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 2,
    symbol: 'diode',
    color: '#ab47bc',
    properties: {
      forwardVoltage: { label: '正向压降', default: 0.7, unit: 'V' },
      maxCurrent: { label: '最大电流', default: 1, unit: 'A' },
      type: { label: '类型', default: '硅', options: ['硅', '锗', '肖特基', 'LED'] }
    }
  },

  led: {
    type: 'led',
    name: '发光二极管',
    category: 'semiconductor',
    icon: '💡',
    description: '通电发光',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 2,
    symbol: 'led',
    color: '#ffeb3b',
    properties: {
      forwardVoltage: { label: '正向压降', default: 2.0, unit: 'V' },
      forwardCurrent: { label: '工作电流', default: 0.02, unit: 'A' },
      color: { label: '发光颜色', default: '红色', options: ['红色', '绿色', '蓝色', '黄色', '白色'] }
    }
  },

  npnTransistor: {
    type: 'npnTransistor',
    name: 'NPN三极管',
    category: 'semiconductor',
    icon: '🔺',
    description: '电流放大',
    defaultValue: 100,
    unit: '',
    unitName: '倍',
    terminals: 3,
    symbol: 'npnTransistor',
    color: '#ab47bc',
    properties: {
      beta: { label: '电流放大系数', default: 100, unit: '' },
      vbe: { label: 'BE结压降', default: 0.7, unit: 'V' },
      maxPower: { label: '最大功率', default: 0.5, unit: 'W' }
    }
  },

  // ========== 开关与控制 ==========
  switch: {
    type: 'switch',
    name: '开关',
    category: 'control',
    icon: '🔘',
    description: '通断控制',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 2,
    symbol: 'switch',
    color: '#9e9e9e',
    properties: {
      state: { label: '状态', default: '断开', options: ['断开', '闭合'] },
      type: { label: '类型', default: '单刀单掷', options: ['单刀单掷', '单刀双掷'] }
    }
  },

  potentiometer: {
    type: 'potentiometer',
    name: '电位器',
    category: 'control',
    icon: '🔧',
    description: '可调电阻',
    defaultValue: 10000,
    unit: 'Ω',
    unitName: '欧姆',
    minValue: 10,
    maxValue: 1000000,
    terminals: 3,
    symbol: 'potentiometer',
    color: '#8d6e63',
    properties: {
      resistance: { label: '总阻值', default: 10000, unit: 'Ω' },
      position: { label: '滑动位置', default: 50, unit: '%' }
    }
  },

  // ========== 测量仪器 ==========
  voltmeter: {
    type: 'voltmeter',
    name: '电压表',
    category: 'instrument',
    icon: 'V',
    description: '测量电压',
    defaultValue: null,
    unit: 'V',
    unitName: '伏特',
    terminals: 2,
    symbol: 'voltmeter',
    color: '#26a69a',
    properties: {
      range: { label: '量程', default: 20, unit: 'V' },
      internalResistance: { label: '内阻', default: 10000000, unit: 'Ω' }
    }
  },

  ammeter: {
    type: 'ammeter',
    name: '电流表',
    category: 'instrument',
    icon: 'A',
    description: '测量电流',
    defaultValue: null,
    unit: 'A',
    unitName: '安培',
    terminals: 2,
    symbol: 'ammeter',
    color: '#26a69a',
    properties: {
      range: { label: '量程', default: 1, unit: 'A' },
      internalResistance: { label: '内阻', default: 0.01, unit: 'Ω' }
    }
  },

  multimeter: {
    type: 'multimeter',
    name: '万用表',
    category: 'instrument',
    icon: 'Ω',
    description: '多功能测量',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 2,
    symbol: 'multimeter',
    color: '#26a69a',
    properties: {
      mode: { label: '测量模式', default: '电压', options: ['电压', '电流', '电阻'] },
      range: { label: '量程', default: 20, unit: 'V' }
    }
  },

  // ========== 半导体器件扩展 ==========
  zenerDiode: {
    type: 'zenerDiode',
    name: '稳压二极管',
    category: 'semiconductor',
    icon: 'Z',
    description: '反向稳压',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 2,
    symbol: 'zenerDiode',
    color: '#ab47bc',
    properties: {
      zenerVoltage: { label: '稳压值', default: 5.1, unit: 'V' },
      maxPower: { label: '最大功率', default: 0.5, unit: 'W' }
    }
  },

  pnpTransistor: {
    type: 'pnpTransistor',
    name: 'PNP三极管',
    category: 'semiconductor',
    icon: '▽',
    description: 'PNP电流放大',
    defaultValue: 100,
    unit: '',
    unitName: '倍',
    terminals: 3,
    symbol: 'pnpTransistor',
    color: '#ab47bc',
    properties: {
      beta: { label: '电流放大系数', default: 100, unit: '' },
      vbe: { label: 'BE结压降', default: 0.7, unit: 'V' },
      maxPower: { label: '最大功率', default: 0.5, unit: 'W' }
    }
  },

  mosfet: {
    type: 'mosfet',
    name: '场效应管',
    category: 'semiconductor',
    icon: 'M',
    description: '电压控制器件',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 3,
    symbol: 'mosfet',
    color: '#ab47bc',
    properties: {
      thresholdVoltage: { label: '阈值电压', default: 2.0, unit: 'V' },
      rdsOn: { label: '导通电阻', default: 0.1, unit: 'Ω' },
      type: { label: '类型', default: 'N沟道', options: ['N沟道', 'P沟道'] }
    }
  },

  // ========== 集成电路 ==========
  opAmp: {
    type: 'opAmp',
    name: '运算放大器',
    category: 'ic',
    icon: '∫',
    description: '信号放大运算',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 5,
    symbol: 'opAmp',
    color: '#ff7043',
    properties: {
      gain: { label: '开环增益', default: 100000, unit: '' },
      bandwidth: { label: '带宽', default: 1000000, unit: 'Hz' },
      supplyVoltage: { label: '电源电压', default: 15, unit: 'V' }
    }
  },

  timer555: {
    type: 'timer555',
    name: '555定时器',
    category: 'ic',
    icon: 'T',
    description: '时序控制芯片',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 8,
    symbol: 'timer555',
    color: '#ff7043',
    properties: {
      frequency: { label: '输出频率', default: 1000, unit: 'Hz' },
      dutyCycle: { label: '占空比', default: 50, unit: '%' }
    }
  },

  // ========== 保护器件 ==========
  fuse: {
    type: 'fuse',
    name: '熔断器',
    category: 'protection',
    icon: 'F',
    description: '过流保护',
    defaultValue: 1,
    unit: 'A',
    unitName: '安培',
    terminals: 2,
    symbol: 'fuse',
    color: '#78909c',
    properties: {
      rating: { label: '额定电流', default: 1, unit: 'A' },
      blown: { label: '状态', default: '正常', options: ['正常', '熔断'] }
    }
  },

  // ========== 磁性器件 ==========
  transformer: {
    type: 'transformer',
    name: '变压器',
    category: 'magnetic',
    icon: 'T',
    description: '电压变换',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 4,
    symbol: 'transformer',
    color: '#7e57c2',
    properties: {
      turnsRatio: { label: '匝数比', default: 2, unit: '' },
      primaryVoltage: { label: '初级电压', default: 220, unit: 'V' }
    }
  },

  relay: {
    type: 'relay',
    name: '继电器',
    category: 'control',
    icon: 'R',
    description: '电磁开关',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 4,
    symbol: 'relay',
    color: '#9e9e9e',
    properties: {
      coilVoltage: { label: '线圈电压', default: 12, unit: 'V' },
      contactRating: { label: '触点容量', default: 10, unit: 'A' },
      state: { label: '状态', default: '断开', options: ['断开', '闭合'] }
    }
  },

  // ========== 信号源 ==========
  signalGenerator: {
    type: 'signalGenerator',
    name: '信号发生器',
    category: 'source',
    icon: '∿',
    description: '可调信号源',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 2,
    symbol: 'signalGenerator',
    color: '#ef5350',
    properties: {
      waveform: { label: '波形', default: '正弦波', options: ['正弦波', '方波', '三角波', '锯齿波'] },
      amplitude: { label: '幅值', default: 5, unit: 'V' },
      frequency: { label: '频率', default: 1000, unit: 'Hz' }
    }
  },

  pulseSource: {
    type: 'pulseSource',
    name: '脉冲源',
    category: 'source',
    icon: 'P',
    description: '脉冲信号',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 2,
    symbol: 'pulseSource',
    color: '#ef5350',
    properties: {
      amplitude: { label: '幅值', default: 5, unit: 'V' },
      period: { label: '周期', default: 0.001, unit: 's' },
      dutyCycle: { label: '占空比', default: 50, unit: '%' }
    }
  },

  // ========== 其他元件 ==========
  ground: {
    type: 'ground',
    name: '接地',
    category: 'other',
    icon: '⊥',
    description: '电路参考地',
    defaultValue: 0,
    unit: 'V',
    unitName: '伏特',
    terminals: 1,
    symbol: 'ground',
    color: '#607d8b',
    properties: {
      voltage: { label: '电位', default: 0, unit: 'V' }
    }
  },

  buzzer: {
    type: 'buzzer',
    name: '蜂鸣器',
    category: 'other',
    icon: '🔊',
    description: '声音提示',
    defaultValue: null,
    unit: '',
    unitName: '',
    terminals: 2,
    symbol: 'buzzer',
    color: '#ff7043',
    properties: {
      voltage: { label: '工作电压', default: 5, unit: 'V' },
      frequency: { label: '频率', default: 2000, unit: 'Hz' }
    }
  },

  thermistor: {
    type: 'thermistor',
    name: '热敏电阻',
    category: 'sensor',
    icon: '🌡',
    description: '温度敏感电阻',
    defaultValue: 10000,
    unit: 'Ω',
    unitName: '欧姆',
    terminals: 2,
    symbol: 'thermistor',
    color: '#8d6e63',
    properties: {
      resistance: { label: '阻值(25°C)', default: 10000, unit: 'Ω' },
      bValue: { label: 'B值', default: 3950, unit: 'K' },
      temperature: { label: '当前温度', default: 25, unit: '°C' }
    }
  },

  photoresistor: {
    type: 'photoresistor',
    name: '光敏电阻',
    category: 'sensor',
    icon: '☀',
    description: '光敏感应',
    defaultValue: 10000,
    unit: 'Ω',
    unitName: '欧姆',
    terminals: 2,
    symbol: 'photoresistor',
    color: '#8d6e63',
    properties: {
      resistance: { label: '亮电阻', default: 1000, unit: 'Ω' },
      darkResistance: { label: '暗电阻', default: 1000000, unit: 'Ω' },
      lightIntensity: { label: '光照强度', default: 50, unit: '%' }
    }
  }
};

/**
 * 元件符号绘制函数
 * 返回SVG路径数据
 */
const ComponentSymbols = {
  // 电阻符号 - 锯齿形
  resistor: (ctx, x, y, width, height) => {
    const w = width || 60;
    const h = height || 30;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - w/2 + 10, y);
    path.lineTo(x - w/2 + 15, y - h/2);
    path.lineTo(x - w/2 + 25, y + h/2);
    path.lineTo(x - w/2 + 35, y - h/2);
    path.lineTo(x - w/2 + 45, y + h/2);
    path.lineTo(x - w/2 + 50, y);
    path.lineTo(x + w/2, y);
    return path;
  },

  // 电容符号 - 两条平行线
  capacitor: (ctx, x, y, width, height) => {
    const w = width || 40;
    const path = new Path2D();
    // 左侧引线
    path.moveTo(x - w/2, y);
    path.lineTo(x - 5, y);
    // 右侧引线
    path.moveTo(x + w/2, y);
    path.lineTo(x + 5, y);
    // 极板
    path.moveTo(x - 5, y - 15);
    path.lineTo(x - 5, y + 15);
    path.moveTo(x + 5, y - 15);
    path.lineTo(x + 5, y + 15);
    return path;
  },

  // 电感符号 - 线圈
  inductor: (ctx, x, y, width, height) => {
    const w = width || 60;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - w/2 + 8, y);
    // 绘制4个半圆
    for (let i = 0; i < 4; i++) {
      const startX = x - w/2 + 8 + i * 11;
      path.arc(startX + 5.5, y, 5.5, Math.PI, 0, false);
    }
    path.lineTo(x + w/2, y);
    return path;
  },

  // 直流电源 - 长线短线
  dcSource: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    // 左侧引线
    path.moveTo(x - w/2, y);
    path.lineTo(x - 10, y);
    // 右侧引线
    path.moveTo(x + w/2, y);
    path.lineTo(x + 10, y);
    // 长线（正极）
    path.moveTo(x - 10, y - 12);
    path.lineTo(x - 10, y + 12);
    // 短线（负极）
    path.moveTo(x + 10, y - 6);
    path.lineTo(x + 10, y + 6);
    return path;
  },

  // 交流电源 - 圆形波浪
  acSource: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    // 左侧引线
    path.moveTo(x - w/2, y);
    path.lineTo(x - 15, y);
    // 右侧引线
    path.moveTo(x + w/2, y);
    path.lineTo(x + 15, y);
    // 圆形
    path.arc(x, y, 15, 0, Math.PI * 2);
    // 波浪线
    path.moveTo(x - 8, y);
    path.bezierCurveTo(x - 4, y - 8, x + 4, y + 8, x + 8, y);
    return path;
  },

  // 二极管 - 三角形加线
  diode: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    // 左侧引线
    path.moveTo(x - w/2, y);
    path.lineTo(x - 10, y);
    // 右侧引线
    path.moveTo(x + w/2, y);
    path.lineTo(x + 10, y);
    // 三角形
    path.moveTo(x - 10, y - 12);
    path.lineTo(x - 10, y + 12);
    path.lineTo(x + 5, y);
    path.closePath();
    // 竖线
    path.moveTo(x + 5, y - 12);
    path.lineTo(x + 5, y + 12);
    return path;
  },

  // LED - 二极管加箭头
  led: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    // 左侧引线
    path.moveTo(x - w/2, y);
    path.lineTo(x - 10, y);
    // 右侧引线
    path.moveTo(x + w/2, y);
    path.lineTo(x + 10, y);
    // 三角形
    path.moveTo(x - 10, y - 12);
    path.lineTo(x - 10, y + 12);
    path.lineTo(x + 5, y);
    path.closePath();
    // 竖线
    path.moveTo(x + 5, y - 12);
    path.lineTo(x + 5, y + 12);
    // 箭头（发光指示）
    path.moveTo(x + 8, y - 10);
    path.lineTo(x + 14, y - 16);
    path.moveTo(x + 12, y - 8);
    path.lineTo(x + 18, y - 14);
    return path;
  },

  // NPN三极管
  npnTransistor: (ctx, x, y, width, height) => {
    const path = new Path2D();
    // 圆形
    path.arc(x, y, 20, 0, Math.PI * 2);
    // 基极引线 (左侧)
    path.moveTo(x - 20, y);
    path.lineTo(x - 35, y);
    // 集电极引线 (右上)
    path.moveTo(x, y - 20);
    path.lineTo(x + 10, y - 30);
    path.lineTo(x + 25, y - 30);
    // 发射极引线 (右下)
    path.moveTo(x, y + 20);
    path.lineTo(x + 10, y + 30);
    path.lineTo(x + 25, y + 30);
    // 内部连线
    path.moveTo(x - 10, y);
    path.lineTo(x - 10, y - 12);
    path.lineTo(x, y - 12);
    path.moveTo(x - 10, y);
    path.lineTo(x - 10, y + 12);
    path.lineTo(x, y + 12);
    // 箭头（发射极）
    path.moveTo(x + 5, y + 22);
    path.lineTo(x + 8, y + 18);
    return path;
  },

  // 开关
  switch: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    // 左侧引线
    path.moveTo(x - w/2, y);
    path.lineTo(x - 8, y);
    // 右侧引线
    path.moveTo(x + w/2, y);
    path.lineTo(x + 8, y);
    // 触点
    path.arc(x - 8, y, 3, 0, Math.PI * 2);
    path.arc(x + 8, y, 3, 0, Math.PI * 2);
    // 开关臂（默认断开状态）
    path.moveTo(x - 8, y);
    path.lineTo(x + 6, y - 12);
    return path;
  },

  // 电位器
  potentiometer: (ctx, x, y, width, height) => {
    const w = width || 60;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - w/2 + 10, y);
    path.lineTo(x - w/2 + 15, y - 10);
    path.lineTo(x - w/2 + 25, y + 10);
    path.lineTo(x - w/2 + 35, y - 10);
    path.lineTo(x - w/2 + 45, y + 10);
    path.lineTo(x - w/2 + 50, y);
    path.lineTo(x + w/2, y);
    path.moveTo(x, y - 10);
    path.lineTo(x, y - 25);
    path.lineTo(x + 10, y - 25);
    path.moveTo(x + 6, y - 22);
    path.lineTo(x + 10, y - 25);
    path.lineTo(x + 6, y - 28);
    return path;
  },

  // ========== 测量仪器符号 ==========
  voltmeter: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - 15, y);
    path.moveTo(x + w/2, y);
    path.lineTo(x + 15, y);
    path.arc(x, y, 15, 0, Math.PI * 2);
    path.moveTo(x - 6, y + 4);
    path.lineTo(x, y - 6);
    path.lineTo(x + 6, y + 4);
    return path;
  },

  ammeter: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - 15, y);
    path.moveTo(x + w/2, y);
    path.lineTo(x + 15, y);
    path.arc(x, y, 15, 0, Math.PI * 2);
    path.moveTo(x - 4, y - 6);
    path.lineTo(x + 4, y + 6);
    path.moveTo(x + 4, y - 6);
    path.lineTo(x - 4, y + 6);
    return path;
  },

  multimeter: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - 15, y);
    path.moveTo(x + w/2, y);
    path.lineTo(x + 15, y);
    path.arc(x, y, 15, 0, Math.PI * 2);
    path.moveTo(x - 8, y + 2);
    path.lineTo(x - 4, y + 2);
    path.lineTo(x - 2, y - 4);
    path.lineTo(x + 2, y + 4);
    path.lineTo(x + 4, y - 2);
    path.lineTo(x + 8, y - 2);
    return path;
  },

  // ========== 半导体扩展符号 ==========
  zenerDiode: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - 10, y);
    path.moveTo(x + w/2, y);
    path.lineTo(x + 10, y);
    path.moveTo(x - 10, y - 12);
    path.lineTo(x - 10, y + 12);
    path.lineTo(x + 5, y);
    path.closePath();
    path.moveTo(x + 5, y - 12);
    path.lineTo(x + 5, y + 12);
    path.moveTo(x + 5, y - 12);
    path.lineTo(x + 12, y - 8);
    path.moveTo(x + 5, y + 12);
    path.lineTo(x + 12, y + 8);
    return path;
  },

  pnpTransistor: (ctx, x, y, width, height) => {
    const path = new Path2D();
    path.arc(x, y, 20, 0, Math.PI * 2);
    path.moveTo(x - 20, y);
    path.lineTo(x - 35, y);
    path.moveTo(x, y - 20);
    path.lineTo(x + 10, y - 30);
    path.lineTo(x + 25, y - 30);
    path.moveTo(x, y + 20);
    path.lineTo(x + 10, y + 30);
    path.lineTo(x + 25, y + 30);
    path.moveTo(x - 10, y);
    path.lineTo(x - 10, y - 12);
    path.lineTo(x, y - 12);
    path.moveTo(x - 10, y);
    path.lineTo(x - 10, y + 12);
    path.lineTo(x, y + 12);
    path.moveTo(x + 5, y - 22);
    path.lineTo(x + 8, y - 18);
    return path;
  },

  mosfet: (ctx, x, y, width, height) => {
    const path = new Path2D();
    path.moveTo(x - 30, y);
    path.lineTo(x - 15, y);
    path.moveTo(x + 30, y);
    path.lineTo(x + 15, y);
    path.moveTo(x - 15, y - 20);
    path.lineTo(x - 15, y + 20);
    path.moveTo(x - 5, y - 15);
    path.lineTo(x - 5, y + 15);
    path.moveTo(x - 5, y - 10);
    path.lineTo(x + 15, y - 10);
    path.lineTo(x + 15, y - 25);
    path.moveTo(x - 5, y + 10);
    path.lineTo(x + 15, y + 10);
    path.lineTo(x + 15, y + 25);
    path.moveTo(x + 10, y + 5);
    path.lineTo(x + 13, y + 8);
    return path;
  },

  // ========== 集成电路符号 ==========
  opAmp: (ctx, x, y, width, height) => {
    const path = new Path2D();
    path.moveTo(x - 20, y - 25);
    path.lineTo(x - 20, y + 25);
    path.lineTo(x + 20, y);
    path.closePath();
    path.moveTo(x - 35, y - 15);
    path.lineTo(x - 20, y - 15);
    path.moveTo(x - 35, y + 15);
    path.lineTo(x - 20, y + 15);
    path.moveTo(x + 20, y);
    path.lineTo(x + 35, y);
    path.moveTo(x - 15, y - 15);
    path.lineTo(x - 10, y - 15);
    path.moveTo(x - 15, y + 15);
    path.lineTo(x - 10, y + 15);
    path.moveTo(x + 15, y);
    path.lineTo(x + 10, y);
    return path;
  },

  timer555: (ctx, x, y, width, height) => {
    const path = new Path2D();
    path.rect(x - 25, y - 30, 50, 60);
    path.moveTo(x - 25, y - 20);
    path.lineTo(x - 35, y - 20);
    path.moveTo(x - 25, y - 5);
    path.lineTo(x - 35, y - 5);
    path.moveTo(x - 25, y + 5);
    path.lineTo(x - 35, y + 5);
    path.moveTo(x - 25, y + 20);
    path.lineTo(x - 35, y + 20);
    path.moveTo(x + 25, y - 20);
    path.lineTo(x + 35, y - 20);
    path.moveTo(x + 25, y - 5);
    path.lineTo(x + 35, y - 5);
    path.moveTo(x + 25, y + 5);
    path.lineTo(x + 35, y + 5);
    path.moveTo(x + 25, y + 20);
    path.lineTo(x + 35, y + 20);
    path.moveTo(x - 10, y - 30);
    path.lineTo(x - 10, y - 40);
    path.moveTo(x + 10, y - 30);
    path.lineTo(x + 10, y - 40);
    return path;
  },

  // ========== 保护器件符号 ==========
  fuse: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - 15, y);
    path.moveTo(x + w/2, y);
    path.lineTo(x + 15, y);
    path.moveTo(x - 15, y - 8);
    path.lineTo(x + 15, y - 8);
    path.lineTo(x + 15, y + 8);
    path.lineTo(x - 15, y + 8);
    path.closePath();
    path.moveTo(x - 10, y - 3);
    path.lineTo(x + 10, y - 3);
    path.moveTo(x - 10, y + 3);
    path.lineTo(x + 10, y + 3);
    return path;
  },

  // ========== 磁性器件符号 ==========
  transformer: (ctx, x, y, width, height) => {
    const path = new Path2D();
    path.moveTo(x - 30, y - 20);
    path.lineTo(x - 10, y - 20);
    path.moveTo(x - 30, y + 20);
    path.lineTo(x - 10, y + 20);
    path.moveTo(x + 10, y - 20);
    path.lineTo(x + 30, y - 20);
    path.moveTo(x + 10, y + 20);
    path.lineTo(x + 30, y + 20);
    for (let i = 0; i < 4; i++) {
      path.moveTo(x - 10, y - 15 + i * 10);
      path.arc(x - 5, y - 15 + i * 10, 5, Math.PI, 0, false);
    }
    for (let i = 0; i < 4; i++) {
      path.moveTo(x + 10, y - 15 + i * 10);
      path.arc(x + 5, y - 15 + i * 10, 5, 0, Math.PI, false);
    }
    path.moveTo(x, y - 25);
    path.lineTo(x, y + 25);
    return path;
  },

  relay: (ctx, x, y, width, height) => {
    const path = new Path2D();
    path.rect(x - 20, y - 25, 40, 50);
    path.moveTo(x - 30, y - 15);
    path.lineTo(x - 20, y - 15);
    path.moveTo(x - 30, y + 15);
    path.lineTo(x - 20, y + 15);
    path.moveTo(x + 20, y - 15);
    path.lineTo(x + 30, y - 15);
    path.moveTo(x + 20, y + 15);
    path.lineTo(x + 30, y + 15);
    path.moveTo(x - 10, y - 15);
    path.lineTo(x - 10, y + 5);
    path.lineTo(x + 5, y - 10);
    path.moveTo(x + 10, y - 15);
    path.lineTo(x + 10, y + 15);
    return path;
  },

  // ========== 信号源符号 ==========
  signalGenerator: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - 15, y);
    path.moveTo(x + w/2, y);
    path.lineTo(x + 15, y);
    path.arc(x, y, 15, 0, Math.PI * 2);
    path.moveTo(x - 8, y);
    path.bezierCurveTo(x - 4, y - 8, x + 4, y + 8, x + 8, y);
    return path;
  },

  pulseSource: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - 15, y);
    path.moveTo(x + w/2, y);
    path.lineTo(x + 15, y);
    path.arc(x, y, 15, 0, Math.PI * 2);
    path.moveTo(x - 8, y + 6);
    path.lineTo(x - 4, y + 6);
    path.lineTo(x - 4, y - 6);
    path.lineTo(x + 2, y - 6);
    path.lineTo(x + 2, y + 6);
    path.lineTo(x + 6, y + 6);
    return path;
  },

  // ========== 其他元件符号 ==========
  ground: (ctx, x, y, width, height) => {
    const path = new Path2D();
    path.moveTo(x, y - 20);
    path.lineTo(x, y);
    path.moveTo(x - 15, y);
    path.lineTo(x + 15, y);
    path.moveTo(x - 10, y + 5);
    path.lineTo(x + 10, y + 5);
    path.moveTo(x - 5, y + 10);
    path.lineTo(x + 5, y + 10);
    return path;
  },

  buzzer: (ctx, x, y, width, height) => {
    const w = width || 50;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - 15, y);
    path.moveTo(x + w/2, y);
    path.lineTo(x + 15, y);
    path.moveTo(x - 15, y - 12);
    path.lineTo(x - 15, y + 12);
    path.lineTo(x + 5, y + 12);
    path.lineTo(x + 5, y - 12);
    path.closePath();
    path.moveTo(x + 5, y - 8);
    path.lineTo(x + 12, y - 12);
    path.moveTo(x + 5, y);
    path.lineTo(x + 12, y - 4);
    path.moveTo(x + 5, y + 8);
    path.lineTo(x + 12, y + 4);
    return path;
  },

  thermistor: (ctx, x, y, width, height) => {
    const w = width || 60;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - w/2 + 10, y);
    path.lineTo(x - w/2 + 15, y - 10);
    path.lineTo(x - w/2 + 25, y + 10);
    path.lineTo(x - w/2 + 35, y - 10);
    path.lineTo(x - w/2 + 45, y + 10);
    path.lineTo(x - w/2 + 50, y);
    path.lineTo(x + w/2, y);
    path.moveTo(x - 5, y - 15);
    path.lineTo(x + 5, y - 25);
    path.moveTo(x + 2, y - 15);
    path.lineTo(x + 8, y - 22);
    return path;
  },

  photoresistor: (ctx, x, y, width, height) => {
    const w = width || 60;
    const path = new Path2D();
    path.moveTo(x - w/2, y);
    path.lineTo(x - w/2 + 10, y);
    path.lineTo(x - w/2 + 15, y - 10);
    path.lineTo(x - w/2 + 25, y + 10);
    path.lineTo(x - w/2 + 35, y - 10);
    path.lineTo(x - w/2 + 45, y + 10);
    path.lineTo(x - w/2 + 50, y);
    path.lineTo(x + w/2, y);
    path.moveTo(x - 10, y - 18);
    path.lineTo(x + 5, y - 28);
    path.moveTo(x - 5, y - 15);
    path.lineTo(x + 10, y - 25);
    path.moveTo(x + 5, y - 20);
    path.lineTo(x + 12, y - 28);
    path.moveTo(x + 8, y - 18);
    path.lineTo(x + 15, y - 25);
    return path;
  }
};

/**
 * 获取元件端子位置
 */
function getTerminalPositions(component) {
  const positions = [];
  const x = component.x;
  const y = component.y;
  const w = component.width || 60;

  switch (component.type) {
    case 'resistor':
    case 'capacitor':
    case 'inductor':
    case 'diode':
    case 'led':
    case 'switch':
    case 'dcSource':
    case 'acSource':
    case 'voltmeter':
    case 'ammeter':
    case 'multimeter':
    case 'zenerDiode':
    case 'fuse':
    case 'signalGenerator':
    case 'pulseSource':
    case 'buzzer':
    case 'thermistor':
    case 'photoresistor':
      positions.push({ x: x - w/2, y: y, id: 0 });
      positions.push({ x: x + w/2, y: y, id: 1 });
      break;
    case 'potentiometer':
      positions.push({ x: x - w/2, y: y, id: 0 });
      positions.push({ x: x + w/2, y: y, id: 1 });
      positions.push({ x: x + 10, y: y - 25, id: 2 });
      break;
    case 'npnTransistor':
    case 'pnpTransistor':
      positions.push({ x: x - 35, y: y, id: 0 }); // 基极 B
      positions.push({ x: x + 25, y: y - 30, id: 1 }); // 集电极 C
      positions.push({ x: x + 25, y: y + 30, id: 2 }); // 发射极 E
      break;
    case 'mosfet':
      positions.push({ x: x - 30, y: y, id: 0 }); // 栅极 G
      positions.push({ x: x + 30, y: y - 25, id: 1 }); // 漏极 D
      positions.push({ x: x + 30, y: y + 25, id: 2 }); // 源极 S
      break;
    case 'opAmp':
      positions.push({ x: x - 35, y: y - 15, id: 0 }); // 反相输入 -
      positions.push({ x: x - 35, y: y + 15, id: 1 }); // 同相输入 +
      positions.push({ x: x + 35, y: y, id: 2 }); // 输出
      positions.push({ x: x, y: y - 35, id: 3 }); // VCC
      positions.push({ x: x, y: y + 35, id: 4 }); // VEE
      break;
    case 'timer555':
      positions.push({ x: x - 35, y: y - 20, id: 0 }); // GND
      positions.push({ x: x - 35, y: y - 5, id: 1 }); // TRIG
      positions.push({ x: x - 35, y: y + 5, id: 2 }); // OUT
      positions.push({ x: x - 35, y: y + 20, id: 3 }); // RESET
      positions.push({ x: x + 35, y: y - 20, id: 4 }); // VCC
      positions.push({ x: x + 35, y: y - 5, id: 5 }); // DISCH
      positions.push({ x: x + 35, y: y + 5, id: 6 }); // THRES
      positions.push({ x: x + 35, y: y + 20, id: 7 }); // CTRL
      positions.push({ x: x - 10, y: y - 40, id: 8 }); // VCC top
      positions.push({ x: x + 10, y: y - 40, id: 9 }); // GND top
      break;
    case 'transformer':
      positions.push({ x: x - 30, y: y - 20, id: 0 }); // 初级上
      positions.push({ x: x - 30, y: y + 20, id: 1 }); // 初级下
      positions.push({ x: x + 30, y: y - 20, id: 2 }); // 次级上
      positions.push({ x: x + 30, y: y + 20, id: 3 }); // 次级下
      break;
    case 'relay':
      positions.push({ x: x - 30, y: y - 15, id: 0 }); // 线圈1
      positions.push({ x: x - 30, y: y + 15, id: 1 }); // 线圈2
      positions.push({ x: x + 30, y: y - 15, id: 2 }); // 触点常开
      positions.push({ x: x + 30, y: y + 15, id: 3 }); // 触点公共
      break;
    case 'ground':
      positions.push({ x: x, y: y - 20, id: 0 });
      break;
  }

  return positions;
}

/**
 * 格式化数值显示
 */
function formatValue(value, unit) {
  if (value === null || value === undefined) return '--';
  
  const absValue = Math.abs(value);
  let formatted;
  
  if (absValue >= 1e6) {
    formatted = (value / 1e6).toFixed(2) + 'M';
  } else if (absValue >= 1e3) {
    formatted = (value / 1e3).toFixed(2) + 'k';
  } else if (absValue >= 1) {
    formatted = value.toFixed(2);
  } else if (absValue >= 1e-3) {
    formatted = (value * 1e3).toFixed(2) + 'm';
  } else if (absValue >= 1e-6) {
    formatted = (value * 1e6).toFixed(2) + 'μ';
  } else if (absValue >= 1e-9) {
    formatted = (value * 1e9).toFixed(2) + 'n';
  } else {
    formatted = value.toExponential(2);
  }
  
  return formatted + unit;
}

/**
 * 创建元件实例
 */
function createComponent(type, x, y) {
  const lib = ComponentLibrary[type];
  if (!lib) return null;

  const instance = {
    id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    type: type,
    name: lib.name,
    x: x,
    y: y,
    width: 60,
    height: 40,
    rotation: 0,
    properties: {},
    terminals: [],
    state: {}
  };

  // 复制默认属性
  for (const [key, prop] of Object.entries(lib.properties)) {
    instance.properties[key] = prop.default;
  }

  // 初始化端子
  const terminalPositions = getTerminalPositions(instance);
  instance.terminals = terminalPositions.map(t => ({
    id: t.id,
    x: t.x,
    y: t.y
  }));

  // 初始化状态
  instance.state.voltage = 0;
  instance.state.current = 0;
  instance.state.power = 0;

  return instance;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ComponentLibrary, ComponentSymbols, getTerminalPositions, formatValue, createComponent };
}
