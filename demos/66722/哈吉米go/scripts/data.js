/* ============================================================
 *  Meowdex · 猫咪数据
 *  8 只预置猫咪 + cataas.com 真实照片 ID
 *  cataas.com 是一个免费的"猫图即服务" API，无需 key
 *  URL 格式：https://cataas.com/cat/{id}?width=400&height=400
 * ============================================================ */

/* 调色板：所有猫共享一套奶油底 + 不同主色 */
const CAT_PALETTE = {
  paper:   '#f4ecdb',
  ink:     '#2a1f17',
  orange:  '#ff7a3d',
  cream:   '#f9e9c8',
  mint:    '#4ec9a0',
  shadow:  'rgba(63, 39, 18, 0.18)',
};

/* cataas 基础 URL */
const CATAAS_BASE = 'https://cataas.com/cat';

/* 工具：根据 ID 生成不同尺寸的 URL */
function cataasUrl(id, w = 400, h = 400) {
  return `${CATAAS_BASE}/${id}?width=${w}&height=${h}&fit=cover`;
}

/* 8 只猫的核心数据
 * cataasId 来自 cataas.com/api/cats 查询，挑选符合个性 + 毛色的真实照片
 * cataasTags 用于说明选这只的理由 / 显示在档案里
 */
const CATS_SEED = [
  {
    id: 'fluffyfur',
    name: 'Fluffyfur',
    cn: '毛毛',
    color: 'orange-tabby',
    colorLabel: '橘猫',
    personality: '黏人、爱蹭腿、吃罐头会喵喵叫',
    area: '7号楼花坛 / 物业办公室门口',
    lastSeen: '2 小时前',
    sightings: 24,
    affection: 92,
    cataasId: '1KeQpy7eHqi0SFmc',  // cute orange 床上蜷着，更贴 Fluffyfur "黏人" 的设定
    cataasTags: ['cute', 'orange', 'cozy'],
    palette: { body: '#f08a3a', belly: '#ffd9a8', accent: '#2a1f17' },
    rarity: '★★★★',
    fact: '据说是 2019 年从隔壁小区走丢过来的',
  },
  {
    id: 'cleverlatte',
    name: 'Cleverlatte',
    cn: '拿铁',
    color: 'gray-tabby',
    colorLabel: '灰狸花',
    personality: '高冷、机警、会在高处看你',
    area: '北门保安亭 / 单元 3 楼道',
    lastSeen: '昨天 19:02',
    sightings: 18,
    affection: 64,
    cataasId: '1ntkA1kLWffNS2xN',  // surprised cute grey
    cataasTags: ['cute', 'grey', 'alert'],
    palette: { body: '#6c6055', belly: '#cfc1ad', accent: '#2a1f17' },
    rarity: '★★★',
    fact: '只吃渴望牌的猫粮，其他牌子闻一下就走',
  },
  {
    id: 'drpancake',
    name: 'Drpancake',
    cn: '煎饼',
    color: 'orange-tabby',
    colorLabel: '大橘',
    personality: '馋嘴、贪吃、见到罐头就坐下',
    area: '南门小卖部门口 / 9 号楼车库',
    lastSeen: '30 分钟前',
    sightings: 31,
    affection: 78,
    cataasId: '2EGeQU9fUQSmO2Te',  // orange fat
    cataasTags: ['cute', 'orange', 'fat'],
    palette: { body: '#e26a1f', belly: '#ffc78a', accent: '#2a1f17' },
    rarity: '★★★★',
    fact: '体重大约 7 公斤，胖到跳不上窗台',
  },
  {
    id: 'countessclaws',
    name: 'Countessclaws',
    cn: '伯爵爪',
    color: 'tuxedo',
    colorLabel: '奶牛',
    personality: '优雅、社牛、爱被拍照',
    area: '中心花园长椅 / 喷泉边',
    lastSeen: '今天 08:15',
    sightings: 12,
    affection: 41,
    cataasId: '2R4fwl2tPwmSwvp1',  // business cute tuxedo
    cataasTags: ['cute', 'tuxedo', 'social'],
    palette: { body: '#1f1a17', belly: '#f4ecdb', accent: '#ffffff' },
    rarity: '★★★',
    fact: '经常叼着树叶回来送人',
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    cn: '小凤',
    color: 'ginger',
    colorLabel: '橘白',
    personality: '胆小、爱躲树丛、傍晚才出来',
    area: '东侧绿化带 / 假山后面',
    lastSeen: '3 天前',
    sightings: 6,
    affection: 28,
    cataasId: '2ihCjEch6BVdv8Yx',  // orange cream cozy
    cataasTags: ['cute', 'orange', 'shy'],
    palette: { body: '#e89254', belly: '#fff1de', accent: '#2a1f17' },
    rarity: '★★',
    fact: '耳朵缺了一小块，是打架留下的',
  },
  {
    id: 'drstripe',
    name: 'Drstripe',
    cn: '条条',
    color: 'gray-tabby',
    colorLabel: '虎斑',
    personality: '活泼、追逐激光笔、能跳 1 米 5',
    area: '西门快递柜 / 充电车棚顶',
    lastSeen: '5 小时前',
    sightings: 19,
    affection: 55,
    cataasId: '1Y3dpssxcbHPEkfO',  // cute tabby
    cataasTags: ['cute', 'tabby', 'active'],
    palette: { body: '#8a7a66', belly: '#e6d6b8', accent: '#2a1f17' },
    rarity: '★★★',
    fact: '和小区里的柯基是好朋友',
  },
  {
    id: 'odin',
    name: 'Odin',
    cn: '奥丁',
    color: 'gray-white',
    colorLabel: '灰白',
    personality: '沉稳、独来独往、眼神像哲学家',
    area: '物业楼顶 / 锅炉房外',
    lastSeen: '昨天 22:30',
    sightings: 9,
    affection: 35,
    cataasId: '4CGBn8ySN95C7cG6',  // grey white
    cataasTags: ['cute', 'grey', 'calm'],
    palette: { body: '#9aa1a8', belly: '#f4ecdb', accent: '#2a1f17' },
    rarity: '★★',
    fact: '冬天喜欢钻到车底取暖',
  },
  {
    id: 'countessfur',
    name: 'Countessfur',
    cn: '毛伯爵',
    color: 'calico',
    colorLabel: '三花',
    personality: '挑食、傲娇、只在天气好时出来',
    area: '南门奶茶店 / 1 号楼大厅',
    lastSeen: '1 小时前',
    sightings: 14,
    affection: 49,
    cataasId: '7U01QMCY91SvOpyk',  // calico cute heterochromia
    cataasTags: ['cute', 'calico', 'rare'],
    palette: { body: '#d49a6a', belly: '#f9e9c8', accent: '#2a1f17' },
    rarity: '★★★',
    fact: '三花都是女孩',
  },
];

/* 地图点位（百分比定位，避免依赖真实地图） */
const MAP_POINTS = [
  { id: 'fluffyfur',  x: 32, y: 38 },
  { id: 'drpancake',  x: 68, y: 30 },
  { id: 'phoenix',    x: 78, y: 62 },
  { id: 'odin',       x: 22, y: 70 },
  { id: 'countessclaws', x: 50, y: 50 },
  { id: 'drstripe',   x: 42, y: 78 },
  { id: 'cleverlatte', x: 14, y: 24 },
  { id: 'countessfur', x: 86, y: 46 },
];

/* 玩家预置数据（首次进入时初始化） */
const PLAYER_SEED = {
  name: '小柚',
  coins: 4285,
  xp: 580,
  hearts: 2,
  cans: 3,
  tries: 3,
  level: 7,
  collected: ['fluffyfur', 'cleverlatte', 'drpancake', 'countessclaws', 'drstripe', 'phoenix', 'odin', 'countessfur'],
  /* 每只猫的亲密度（独立于基础数据，便于演示） */
  affection: {
    fluffyfur: 92, cleverlatte: 64, drpancake: 78, countessclaws: 41,
    phoenix: 28, drstripe: 55, odin: 35, countessfur: 49,
  },
  sightings: [
    { id: 'drpancake',   place: '南门小卖部', time: '30 分钟前' },
    { id: 'countessclaws', place: '中心花园', time: '今天 08:15' },
    { id: 'fluffyfur',   place: '7 号楼花坛', time: '2 小时前' },
  ],
};
