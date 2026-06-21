/* ============================================
   远程守护 · 电视品牌数据
   ============================================ */

const TV_BRANDS = [
  {
    id: 'hisense',
    name: '海信',
    short: '海',
    color: '#0099CC',
    models: [
      { id: 'hisense-65e3f', name: '65E3F 4K 智能电视', year: 2023, features: ['4K 超清', '智能语音', 'HDR'] },
      { id: 'hisense-75u7k', name: '75U7K Mini LED', year: 2024, features: ['Mini LED', '144Hz', '杜比视界'] },
      { id: 'hisense-55a6k', name: '55A6K 智能电视', year: 2023, features: ['4K', 'AI 语音', '远场拾音'] },
      { id: 'hisense-85u8k', name: '85U8K 8K 旗舰', year: 2024, features: ['8K', 'Mini LED', '游戏模式'] }
    ]
  },
  {
    id: 'tcl',
    name: 'TCL',
    short: 'T',
    color: '#005CA9',
    models: [
      { id: 'tcl-75c835', name: '75C835 Mini LED', year: 2023, features: ['Mini LED', '4K', '144Hz'] },
      { id: 'tcl-65c755', name: '65C755 QD-Mini LED', year: 2024, features: ['QD-Mini LED', 'HDR', '游戏引擎'] },
      { id: 'tcl-55p735', name: '55P735 4K 电视', year: 2023, features: ['4K', '杜比全景声', '智能系统'] },
      { id: 'tcl-85x955', name: '85X955 旗舰巨幕', year: 2024, features: ['8K', 'Mini LED', 'ONKYO 音响'] }
    ]
  },
  {
    id: 'xiaomi',
    name: '小米',
    short: '米',
    color: '#FF6900',
    models: [
      { id: 'xiaomi-s75', name: 'Redmi 智能电视 S75', year: 2023, features: ['4K', '金属全面屏', '小爱同学'] },
      { id: 'xiaomi-es75', name: '小米电视 ES75 2025', year: 2024, features: ['4K', '全面屏', '远场语音'] },
      { id: 'xiaomi-ma85', name: '小米电视大师 85', year: 2024, features: ['8K', 'OLED', '杜比视界'] },
      { id: 'xiaomi-a65', name: 'Redmi A65 2024', year: 2024, features: ['4K', '智能系统', '性价比'] }
    ]
  },
  {
    id: 'skyworth',
    name: '创维',
    short: '创',
    color: '#E60012',
    models: [
      { id: 'skyworth-75a5d', name: '75A5D 4K 智能', year: 2023, features: ['4K', '护眼屏', '杜比音效'] },
      { id: 'skyworth-85g3d', name: '85G3D 巨幕电视', year: 2024, features: ['8K', 'Mini LED', '哈曼音响'] },
      { id: 'skyworth-65s3d', name: '65S3D 智能电视', year: 2023, features: ['4K', 'AI 语音', '远场控制'] },
      { id: 'skyworth-55a23d', name: '55A23D 入门款', year: 2024, features: ['4K', '智能系统', '高性价比'] }
    ]
  },
  {
    id: 'haier',
    name: '海尔',
    short: '海',
    color: '#005AAA',
    models: [
      { id: 'haier-75h6k', name: '75H6K 4K 智能', year: 2023, features: ['4K', '语音控制', '全面屏'] },
      { id: 'haier-65l65', name: '65L65 智能电视', year: 2024, features: ['4K', '杜比音效', '远场语音'] },
      { id: 'haier-85x5k', name: '85X5K 巨幕电视', year: 2024, features: ['8K', 'Mini LED', '游戏模式'] }
    ]
  },
  {
    id: 'konka',
    name: '康佳',
    short: '康',
    color: '#1A5BB5',
    models: [
      { id: 'konka-75g7', name: '75G7 4K 智能', year: 2023, features: ['4K', '全面屏', '智能语音'] },
      { id: 'konka-65u5', name: '65U5 智能电视', year: 2024, features: ['4K', '杜比音效', '远场控制'] },
      { id: 'konka-85x8', name: '85X8 巨幕旗舰', year: 2024, features: ['8K', 'Mini LED', '哈曼音响'] }
    ]
  },
  {
    id: 'changhong',
    name: '长虹',
    short: '长',
    color: '#D81E06',
    models: [
      { id: 'changhong-75d5', name: '75D5 4K 智能', year: 2023, features: ['4K', '语音控制', '全面屏'] },
      { id: 'changhong-65q5', name: '65Q5 智能电视', year: 2024, features: ['4K', 'AI 语音', '杜比音效'] },
      { id: 'changhong-86x8', name: '86X8 巨幕电视', year: 2024, features: ['8K', 'Mini LED', '游戏引擎'] }
    ]
  },
  {
    id: 'sony',
    name: '索尼',
    short: '索',
    color: '#000000',
    models: [
      { id: 'sony-x75l', name: 'BRAVIA XR X75L', year: 2023, features: ['4K', 'XR 芯片', 'Google TV'] },
      { id: 'sony-x90l', name: 'BRAVIA XR X90L', year: 2024, features: ['4K', 'Mini LED', 'XR 认知芯片'] },
      { id: 'sony-a95l', name: 'BRAVIA XR A95L', year: 2024, features: ['4K OLED', 'QD-OLED', '旗舰画质'] }
    ]
  },
  {
    id: 'samsung',
    name: '三星',
    short: '三',
    color: '#1428A0',
    models: [
      { id: 'samsung-q60c', name: 'QLED 4K Q60C', year: 2023, features: ['QLED', '4K', '量子点'] },
      { id: 'samsung-s90c', name: 'OLED 4K S90C', year: 2024, features: ['OLED', '4K', '杜比全景声'] },
      { id: 'samsung-neo-qn85c', name: 'Neo QLED 8K QN85C', year: 2024, features: ['8K', 'Mini LED', 'Neo 量子点'] }
    ]
  },
  {
    id: 'lg',
    name: 'LG',
    short: 'L',
    color: '#A50034',
    models: [
      { id: 'lg-ur8050', name: 'UR8050 4K UHD', year: 2023, features: ['4K', 'webOS', 'AI 画质'] },
      { id: 'lg-c3', name: 'OLED evo C3', year: 2024, features: ['OLED', '4K', 'α9 Gen6 芯片'] },
      { id: 'lg-qned85', name: 'QNED Mini LED 85', year: 2024, features: ['8K', 'QNED', 'Mini LED'] }
    ]
  }
];

// localStorage 键名
const STORAGE_KEYS = {
  CONNECTION: 'remote_guard_connection',
  RECORDS: 'remote_guard_records',
  PREFS: 'remote_guard_prefs',
  CMD_LOG: 'remote_guard_cmdlog'
};
