/**
 * 城市探险游戏生成器 - POI 模拟数据库
 * 按城市组织，每个 POI 包含坐标、类型、主题标签、天气适配、时段适配
 */
const POI_DATABASE = {
  beijing: {
    name: '北京',
    center: [39.9163, 116.3972],
    pois: [
      { id: 'bj-wm', name: '午门', lat: 39.9163, lng: 116.3972, type: 'ancient', themes: ['history', 'mystery'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '紫禁城正门，明清两代举行献俘大典之处' },
      { id: 'bj-thd', name: '太和殿', lat: 39.9170, lng: 116.3975, type: 'ancient', themes: ['history'], weather: ['sunny', 'cloudy'], time: ['day'], desc: '紫禁城最大的宫殿，俗称金銮殿' },
      { id: 'bj-yhy', name: '御花园', lat: 39.9180, lng: 116.3978, type: 'garden', themes: ['history', 'nature', 'art'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '始建于明永乐年间，园内奇石古柏遍布' },
      { id: 'bj-swm', name: '神武门', lat: 39.9185, lng: 116.3974, type: 'ancient', themes: ['history', 'mystery'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '紫禁城北门，现为故宫博物院出口' },
      { id: 'bj-njl', name: '南锣鼓巷', lat: 39.9360, lng: 116.4030, type: 'street', themes: ['food', 'culture', 'art'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '北京最古老的街区之一，胡同与四合院密集' },
      { id: 'bj-ht', name: '后海', lat: 39.9390, lng: 116.3850, type: 'lake', themes: ['nature', 'food', 'mystery'], weather: ['sunny', 'cloudy'], time: ['dusk', 'night'], desc: '什刹海组成部分，周边酒吧与老北京小吃云集' },
      { id: 'bj-tat', name: '天安门', lat: 39.9087, lng: 116.3974, type: 'ancient', themes: ['history'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '明清两代皇城正门' },
      { id: 'bj-qhm', name: '前门大街', lat: 39.8990, lng: 116.3970, type: 'street', themes: ['food', 'culture'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '老北京商业街，汇聚老字号店铺' },
      { id: 'bj-jst', name: '景山公园', lat: 39.9230, lng: 116.3950, type: 'garden', themes: ['nature', 'history', 'art'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '北京中轴线上制高点，可俯瞰紫禁城全貌' },
      { id: 'bj-bjz', name: '北海公园', lat: 39.9260, lng: 116.3880, type: 'lake', themes: ['nature', 'history', 'art'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '中国现存最古老、最完整的皇家园林之一' }
    ]
  },
  shanghai: {
    name: '上海',
    center: [31.2304, 121.4737],
    pois: [
      { id: 'sh-wt', name: '外滩', lat: 31.2397, lng: 121.4905, type: 'street', themes: ['history', 'art', 'mystery'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '万国建筑博览群，黄浦江畔地标' },
      { id: 'sh-nj', name: '南京路步行街', lat: 31.2350, lng: 121.4750, type: 'street', themes: ['food', 'culture'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '中华商业第一街' },
      { id: 'sh-yuy', name: '豫园', lat: 31.2270, lng: 121.4920, type: 'garden', themes: ['history', 'art', 'food'], weather: ['sunny', 'cloudy'], time: ['day'], desc: '明代古典园林，江南园林代表' },
      { id: 'sh-tianz', name: '田子坊', lat: 31.2100, lng: 121.4660, type: 'street', themes: ['art', 'food', 'culture'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '石库门里弄中的艺术聚集区' },
      { id: 'sh-xintiandi', name: '新天地', lat: 31.2240, lng: 121.4760, type: 'street', themes: ['culture', 'food'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '石库门建筑改造的时尚休闲区' },
      { id: 'sh-lujz', name: '陆家嘴', lat: 31.2380, lng: 121.5050, type: 'modern', themes: ['art', 'mystery'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '东方明珠与摩天楼群所在地' }
    ]
  },
  hangzhou: {
    name: '杭州',
    center: [30.2592, 120.1300],
    pois: [
      { id: 'hz-xh', name: '西湖', lat: 30.2592, lng: 120.1300, type: 'lake', themes: ['nature', 'history', 'art', 'mystery'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk'], desc: '人间天堂，西湖十景闻名天下' },
      { id: 'hz-lj', name: '灵隐寺', lat: 30.2460, lng: 120.1010, type: 'ancient', themes: ['history', 'mystery', 'nature'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day'], desc: '江南千年古刹，飞来峰造像' },
      { id: 'hz-hf', name: '河坊街', lat: 30.2500, lng: 120.1650, type: 'street', themes: ['food', 'culture'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '杭州历史文化街区，老字号汇聚' },
      { id: 'hz-lt', name: '龙井茶园', lat: 30.2300, lng: 120.1200, type: 'nature', themes: ['nature', 'food'], weather: ['sunny', 'cloudy'], time: ['day'], desc: '西湖龙井茶原产地，茶文化体验' },
      { id: 'hz-sd', name: '宋城', lat: 30.1900, lng: 120.1100, type: 'modern', themes: ['history', 'art', 'culture'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '再现宋代风貌的主题公园' }
    ]
  },
  chengdu: {
    name: '成都',
    center: [30.6590, 104.0650],
    pois: [
      { id: 'cd-kz', name: '宽窄巷子', lat: 30.6700, lng: 104.0550, type: 'street', themes: ['food', 'culture', 'art'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '清代古街区，宽巷子、窄巷子、井巷子平行排列' },
      { id: 'cd-jl', name: '锦里', lat: 30.6400, lng: 104.0430, type: 'street', themes: ['food', 'culture', 'history'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '武侯祠旁的民俗文化街区' },
      { id: 'cd-whc', name: '武侯祠', lat: 30.6380, lng: 104.0430, type: 'ancient', themes: ['history', 'mystery'], weather: ['sunny', 'cloudy'], time: ['day'], desc: '纪念诸葛亮的祠堂，三国文化圣地' },
      { id: 'cd-dp', name: '杜甫草堂', lat: 30.6550, lng: 104.0200, type: 'garden', themes: ['history', 'art', 'nature'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day'], desc: '唐代诗人杜甫流寓成都时的故居' },
      { id: 'cd-tfs', name: '太古里', lat: 30.6530, lng: 104.0830, type: 'modern', themes: ['art', 'food', 'culture'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '开放式低密度街区，时尚与古刹大慈寺并存' }
    ]
  },
  xian: {
    name: '西安',
    center: [34.3416, 108.9398],
    pois: [
      { id: 'xa-byl', name: '大雁塔', lat: 34.2185, lng: 108.9647, type: 'ancient', themes: ['history', 'mystery'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '唐代玄奘藏经塔，古都西安的象征' },
      { id: 'xa-cw', name: '城墙', lat: 34.2584, lng: 108.9401, type: 'ancient', themes: ['history', 'nature'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '中国现存最完整的古代城垣，可骑行环游' },
      { id: 'xa-hyjj', name: '回民街', lat: 34.2637, lng: 108.9398, type: 'street', themes: ['food', 'culture'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '西安最负盛名的美食街区，汇聚西北小吃' },
      { id: 'xa-bwy', name: '碑林博物馆', lat: 34.2520, lng: 108.9470, type: 'ancient', themes: ['history', 'art', 'culture'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day'], desc: '收藏历代碑石墓志最多的艺术宝库' },
      { id: 'xa-dag', name: '大唐不夜城', lat: 34.2125, lng: 108.9613, type: 'modern', themes: ['culture', 'art', 'food'], weather: ['sunny', 'cloudy'], time: ['dusk', 'night'], desc: '盛唐主题步行街，灯光璀璨的夜游胜地' },
      { id: 'xa-xgb', name: '小雁塔', lat: 34.2428, lng: 108.9370, type: 'ancient', themes: ['history', 'mystery', 'nature'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '唐代密檐砖塔，荐福寺塔院' }
    ]
  },
  nanjing: {
    name: '南京',
    center: [32.0603, 118.7969],
    pois: [
      { id: 'nj-fzm', name: '夫子庙', lat: 32.0220, lng: 118.7856, type: 'ancient', themes: ['history', 'culture', 'food'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '中国四大文庙之一，秦淮河畔核心景区' },
      { id: 'nj-qhh', name: '秦淮河', lat: 32.0180, lng: 118.7900, type: 'lake', themes: ['history', 'mystery', 'nature'], weather: ['sunny', 'cloudy', 'rainy'], time: ['dusk', 'night'], desc: '南京的母亲河，六朝金粉之地' },
      { id: 'nj-zml', name: '中山陵', lat: 32.0570, lng: 118.8460, type: 'modern', themes: ['history', 'culture'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '孙中山先生的陵寝，钟山风景区核心' },
      { id: 'nj-zwy', name: '总统府', lat: 32.0470, lng: 118.7950, type: 'modern', themes: ['history', 'mystery'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day'], desc: '中国近代史的重要见证地，民国建筑群' },
      { id: 'nj-lgt', name: '老门东', lat: 32.0185, lng: 118.7820, type: 'street', themes: ['food', 'culture', 'art'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '南京传统民居聚集地，金陵风味小吃' },
      { id: 'nj-xwl', name: '玄武湖', lat: 32.0750, lng: 118.8060, type: 'lake', themes: ['nature', 'history', 'art'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '江南最大城内公园，皇家园林湖泊' }
    ]
  },
  suzhou: {
    name: '苏州',
    center: [31.2989, 120.5853],
    pois: [
      { id: 'sz-zzy', name: '拙政园', lat: 31.3240, lng: 120.6310, type: 'garden', themes: ['history', 'art', 'nature'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day'], desc: '中国四大名园之首，江南古典园林代表' },
      { id: 'sz-hq', name: '虎丘', lat: 31.3220, lng: 120.5720, type: 'ancient', themes: ['history', 'mystery', 'nature'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '吴中第一名胜，斜塔与剑池闻名天下' },
      { id: 'sz-pm', name: '平江路', lat: 31.3120, lng: 120.6290, type: 'street', themes: ['food', 'culture', 'art'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '宋代古街，水巷小桥与评弹声声' },
      { id: 'sz-lqy', name: '留园', lat: 31.3170, lng: 120.6000, type: 'garden', themes: ['history', 'art'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day'], desc: '中国四大名园之一，建筑空间艺术的典范' },
      { id: 'sz-sj', name: '山塘街', lat: 31.3340, lng: 120.6040, type: 'street', themes: ['food', 'culture', 'history'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '白居易开凿的山塘河两岸，千年古街' },
      { id: 'sz-jcl', name: '金鸡湖', lat: 31.3120, lng: 120.6680, type: 'lake', themes: ['nature', 'art', 'mystery'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '苏州工业园区核心湖景，现代与自然交融' }
    ]
  },
  chongqing: {
    name: '重庆',
    center: [29.5630, 106.5516],
    pois: [
      { id: 'cq-hyd', name: '洪崖洞', lat: 29.5683, lng: 106.5816, type: 'modern', themes: ['culture', 'food', 'mystery'], weather: ['sunny', 'cloudy', 'rainy'], time: ['dusk', 'night'], desc: '巴渝吊脚楼建筑群，夜景如千与千寻' },
      { id: 'cq-csk', name: '磁器口', lat: 29.5790, lng: 106.4470, type: 'street', themes: ['food', 'culture', 'history'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk', 'night'], desc: '千年古镇，老重庆风貌的缩影' },
      { id: 'cq-jfb', name: '解放碑', lat: 29.5570, lng: 106.5780, type: 'modern', themes: ['history', 'food', 'culture'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '重庆地标，抗战胜利纪功碑' },
      { id: 'cq-nts', name: '南山一棵树', lat: 29.5230, lng: 106.5930, type: 'nature', themes: ['nature', 'art'], weather: ['sunny', 'cloudy'], time: ['dusk', 'night'], desc: '俯瞰山城夜景的最佳观景台' },
      { id: 'cq-cjk', name: '长江索道', lat: 29.5530, lng: 106.5860, type: 'modern', themes: ['mystery', 'culture'], weather: ['sunny', 'cloudy'], time: ['day', 'dusk'], desc: '万里长江第一条空中走廊，横跨长江' },
      { id: 'cq-ecl', name: '鹅岭二厂', lat: 29.5480, lng: 106.5440, type: 'modern', themes: ['art', 'culture', 'food'], weather: ['sunny', 'cloudy', 'rainy'], time: ['day', 'dusk', 'night'], desc: '印钞厂改造文创园，文艺打卡胜地' }
    ]
  }
};

/** 城市列表（供下拉菜单使用） */
const CITY_LIST = Object.keys(POI_DATABASE).map(function (key) {
  return { id: key, name: POI_DATABASE[key].name };
});

/** 主题列表 */
const THEME_LIST = [
  { id: 'history', name: '历史', icon: '📜', color: '#c2691f' },
  { id: 'food', name: '美食', icon: '🍜', color: '#e8593c' },
  { id: 'art', name: '艺术', icon: '🎨', color: '#7c3aed' },
  { id: 'mystery', name: '神秘', icon: '🔍', color: '#2d6e7e' },
  { id: 'nature', name: '自然', icon: '🌿', color: '#5b8c5a' },
  { id: 'culture', name: '人文', icon: '🏛️', color: '#8a6d3b' }
];

/** 天气选项 */
const WEATHER_LIST = [
  { id: 'sunny', name: '晴天', icon: '☀️' },
  { id: 'cloudy', name: '阴天', icon: '☁️' },
  { id: 'rainy', name: '雨天', icon: '🌧️' }
];

/** 时段选项 */
const TIME_LIST = [
  { id: 'day', name: '白天', icon: '🌅' },
  { id: 'dusk', name: '黄昏', icon: '🌇' },
  { id: 'night', name: '夜晚', icon: '🌙' }
];

/** 游戏时长选项 */
const DURATION_LIST = [
  { id: 30, name: '30 分钟', taskCount: 3 },
  { id: 60, name: '1 小时', taskCount: 4 },
  { id: 120, name: '2 小时', taskCount: 6 }
];
