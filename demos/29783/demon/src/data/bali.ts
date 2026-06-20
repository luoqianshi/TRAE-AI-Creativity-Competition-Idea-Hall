import type { TravelDetail } from './types';

const IMG = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`;

const IMG_P = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`;

const IMG_S = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square`;

export const baliDetail: TravelDetail = {
  id: 'bali',
  title: '巴厘岛7日游',
  location: '印度尼西亚·巴厘岛',
  startDate: '2024-07-15',
  endDate: '2024-07-21',
  coverImage: IMG('beautiful Bali island beach resort tropical palm trees turquoise water sunset luxury travel'),
  aiAnalysisStatus: 'completed',
  aiProgress: 100,
  days: 7,
  timeline: [
    {
      date: '2024-07-15', day: '第一天',
      activities: [
        { id: 'a1', time: '09:00', title: '抵达巴厘岛', description: '乘坐印尼鹰航抵达登巴萨国际机场，专车接机前往酒店', location: '登巴萨国际机场', image: IMG_P('Bali airport terminal modern architecture tropical plants') },
        { id: 'a2', time: '14:00', title: '入住酒店', description: '入住巴厘岛努沙杜瓦海滩豪华度假村，享受热带风情', location: '努沙杜瓦海滩度假村', image: IMG_P('luxury Bali resort hotel with infinity pool overlooking ocean') },
        { id: 'a3', time: '18:00', title: '日落晚餐', description: '在海边餐厅享用印尼特色美食，欣赏绝美日落', location: 'Jimbaran Beach', image: IMG_P('romantic beach dinner sunset Bali candles seafood') },
      ],
    },
    {
      date: '2024-07-16', day: '第二天',
      activities: [
        { id: 'a4', time: '08:00', title: '乌布皇宫', description: '参观乌布皇宫，感受巴厘岛传统建筑艺术', location: '乌布皇宫', image: IMG_P('Ubud Royal Palace traditional Balinese architecture carvings') },
        { id: 'a5', time: '11:00', title: '猴林公园', description: '与可爱的猴子亲密接触，探索热带雨林', location: 'Sacred Monkey Forest', image: IMG_P('monkey forest Ubud Bali tropical jungle cute monkeys') },
        { id: 'a6', time: '15:00', title: '梯田日落', description: '前往德格拉朗梯田，欣赏层层叠叠的稻田美景', location: 'Tegallalang Rice Terraces', image: IMG_P('Bali rice terraces Tegallalang green fields sunset view') },
      ],
    },
    {
      date: '2024-07-17', day: '第三天',
      activities: [
        { id: 'a7', time: '09:00', title: '蓝梦岛一日游', description: '乘坐快艇前往蓝梦岛，体验浮潜和水上运动', location: 'Lembongan Island', image: IMG_P('Nusa Lembongan island crystal clear water snorkeling Bali') },
        { id: 'a8', time: '14:00', title: "恶魔的眼泪", description: '观赏壮观的海浪拍打悬崖，形成美丽的彩虹', location: 'Devils Tears', image: IMG_P("Devils Tears Lembongan waves crashing cliff rainbow") },
      ],
    },
    {
      date: '2024-07-18', day: '第四天',
      activities: [
        { id: 'a9', time: '10:00', title: '水明漾购物', description: '逛水明漾精品店，购买巴厘岛特色手工艺品', location: 'Seminyak', image: IMG_P('Seminyak shopping street Bali boutique stores cafes') },
        { id: 'a10', time: '15:00', title: 'SPA体验', description: '享受正宗巴厘岛按摩SPA，放松身心', location: 'Bali SPA Center', image: IMG_P('traditional Balinese SPA massage treatment relaxing environment') },
      ],
    },
    {
      date: '2024-07-19', day: '第五天',
      activities: [
        { id: 'a11', time: '08:00', title: '火山徒步', description: '徒步巴杜尔火山，俯瞰火山口湖美景', location: 'Mount Batur', image: IMG_P('Mount Batur volcano hike Bali sunrise crater lake') },
        { id: 'a12', time: '14:00', title: '温泉放松', description: '泡在火山温泉中，缓解徒步疲劳', location: 'Batur Hot Springs', image: IMG_P('hot springs Bali natural pool volcanic minerals') },
      ],
    },
    {
      date: '2024-07-20', day: '第六天',
      activities: [
        { id: 'a13', time: '09:00', title: '库塔海滩', description: '在库塔海滩冲浪，享受阳光沙滩', location: 'Kuta Beach', image: IMG_P('Kuta Beach Bali surfing sunset tourists waves') },
        { id: 'a14', time: '18:00', title: '告别晚宴', description: '在海景餐厅享用最后一顿晚餐，回顾精彩旅程', location: 'Bali Hai Restaurant', image: IMG_P('farewell dinner Bali ocean view restaurant romantic') },
      ],
    },
    {
      date: '2024-07-21', day: '第七天',
      activities: [
        { id: 'a15', time: '08:00', title: '机场送机', description: '结束美好的巴厘岛之旅，返回温暖的家', location: '登巴萨国际机场' },
      ],
    },
  ],
  hotels: [
    {
      name: '巴厘岛努沙杜瓦海滩豪华度假村',
      address: 'Jl. Pratama, Nusa Dua, Bali',
      checkIn: '2024-07-15',
      checkOut: '2024-07-21',
      price: 12800,
      rating: 4.8,
      image: IMG_P('luxury Bali resort hotel exterior tropical garden'),
    },
  ],
  flights: [
    { airline: '印尼鹰航', flightNumber: 'GA891', departure: '上海浦东', arrival: '登巴萨', departureTime: '09:30', arrivalTime: '15:45', price: 3580 },
    { airline: '印尼鹰航', flightNumber: 'GA890', departure: '登巴萨', arrival: '上海浦东', departureTime: '17:30', arrivalTime: '23:45', price: 3280 },
  ],
  photos: [
    { id: 'p1', url: IMG_S('Bali beach sunset golden hour palm trees'), caption: '美丽的海滩日落', date: '2024-07-15' },
    { id: 'p2', url: IMG_S('Ubud temple traditional Balinese architecture'), caption: '乌布神庙', date: '2024-07-16' },
    { id: 'p3', url: IMG_S('Bali rice terraces green landscape'), caption: '德格拉朗梯田', date: '2024-07-16' },
    { id: 'p4', url: IMG_S('crystal clear water snorkeling Bali'), caption: '蓝梦岛浮潜', date: '2024-07-17' },
    { id: 'p5', url: IMG_S('Mount Batur sunrise hike'), caption: '巴杜尔火山日出', date: '2024-07-19' },
    { id: 'p6', url: IMG_S('Balinese traditional dance performance'), caption: '传统舞蹈表演', date: '2024-07-18' },
    { id: 'p7', url: IMG_S('delicious Balinese food Nasi Goreng'), caption: '印尼美食', date: '2024-07-15' },
    { id: 'p8', url: IMG_S('luxury resort infinity pool ocean view'), caption: '酒店无边泳池', date: '2024-07-16' },
    { id: 'p9', url: IMG_S('Devils Tears waves rainbow Lembongan'), caption: '恶魔的眼泪', date: '2024-07-17' },
    { id: 'p10', url: IMG_S('Bali SPA treatment relaxing'), caption: 'SPA体验', date: '2024-07-18' },
    { id: 'p11', url: IMG_S('Kuta Beach surfing sunset'), caption: '库塔海滩冲浪', date: '2024-07-20' },
    { id: 'p12', url: IMG_S('Bali night market colorful lights'), caption: '夜市逛吃', date: '2024-07-19' },
  ],
  aiDiary: {
    summary: '巴厘岛的七天，你从海滩到火山，从梯田到日落。AI 从你拍摄的 126 张照片、18 段视频、3 份订单中识别出 42 个关键事件，串联成这段属于你的海岛故事。',
    entries: [
      {
        date: '2024-07-15',
        paragraphs: [
          '这是你抵达巴厘岛的第一天。',
          '午后阳光很好，你在努沙杜瓦办理入住后前往海边。',
          '傍晚时分拍摄了大量日落照片，系统检测到你在此停留超过 2 小时。',
          '这里很可能是本次旅行最喜欢的地点之一。',
        ],
      },
      {
        date: '2024-07-16',
        paragraphs: [
          '乌布的早晨带着清新的稻香。',
          '你走过了乌布皇宫、猴林公园，在德格拉朗梯田停留了 1 小时 32 分钟。',
          'AI 检测到你对绿色景观的偏好，今天的 24 张照片里有一半是稻田与植物。',
        ],
      },
      {
        date: '2024-07-17',
        paragraphs: [
          '蓝梦岛的海水清澈见底。',
          '你在浮潜时拍下了 31 张海底照片，AI 识别出 18 种不同的珊瑚和鱼类。',
          '"恶魔的眼泪" 让你驻足了 47 分钟，浪花与彩虹同框的瞬间被自动标记为高光时刻。',
        ],
      },
      {
        date: '2024-07-18',
        paragraphs: [
          '今天你只拍了一个地方：Melasti Beach。',
          '连续 42 张照片，停留 2 小时 14 分钟。',
          'AI 推断这是本次旅行你最幸福的一刻——日落场景出现频率最高，金色光线反复出现。',
        ],
      },
      {
        date: '2024-07-19',
        paragraphs: [
          '凌晨 4 点你出发去爬巴杜尔火山。',
          '当太阳从火山口升起时，你拍了 18 张延时素材。',
          '下山后泡在火山温泉里，AI 识别出这一段视频的回放次数最多。',
        ],
      },
      {
        date: '2024-07-20',
        paragraphs: [
          '库塔海滩的浪很大。',
          '你尝试了人生第一次冲浪，AI 在 12 段视频里识别出 3 次成功站立的瞬间。',
          '海边的告别晚宴，是这一程最安静的收尾。',
        ],
      },
      {
        date: '2024-07-21',
        paragraphs: [
          '回程的航班在 17:30 起飞。',
          'AI 在你的相册里找到了 9 张窗外的云海照片。',
          '巴厘岛的故事先暂存到这里，下一次出发，AI 会在目的地机场等你。',
        ],
      },
    ],
  },
  expenses: [
    { category: '机票', amount: 6860, color: '#FF6B35' },
    { category: '酒店', amount: 12800, color: '#4ECDC4' },
    { category: '餐饮', amount: 3200, color: '#F7931E' },
    { category: '交通', amount: 1500, color: '#9B59B6' },
    { category: '景点门票', amount: 1800, color: '#3498DB' },
    { category: '购物', amount: 4500, color: '#E74C3C' },
    { category: 'SPA娱乐', amount: 2200, color: '#1ABC9C' },
  ],
  memoryCards: [
    { id: 'm1', image: IMG_S('beautiful Bali beach sunset romantic'), title: '最美日落', description: '在Jimbaran海滩见证了人生中最美的日落，金色的阳光洒在海面上，波光粼粼', date: '2024-07-15' },
    { id: 'm2', image: IMG_S('Mount Batur sunrise amazing view'), title: '火山日出', description: '凌晨4点的徒步挑战，换来的是令人窒息的火山日出美景', date: '2024-07-19' },
    { id: 'm3', image: IMG_S('crystal clear water snorkeling tropical fish'), title: '海底世界', description: '蓝梦岛浮潜时，五彩斑斓的珊瑚和热带鱼环绕身旁', date: '2024-07-17' },
    { id: 'm4', image: IMG_S('traditional Balinese dance performance colorful'), title: '文化盛宴', description: '欣赏了传统巴厘岛舞蹈表演，精美的服饰和动人的舞姿令人难忘', date: '2024-07-18' },
  ],
  mapTrack: {
    start: { lat: -8.7832, lng: 115.1889 },
    end: { lat: -8.6705, lng: 115.2127 },
    points: [
      { lat: -8.7832, lng: 115.1889, name: '登巴萨机场' },
      { lat: -8.7716, lng: 115.1642, name: '努沙杜瓦' },
      { lat: -8.5011, lng: 115.2614, name: '乌布' },
      { lat: -8.6705, lng: 115.2127, name: '库塔' },
    ],
  },
};
