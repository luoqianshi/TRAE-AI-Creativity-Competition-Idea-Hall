import { SavedArtwork, BreathingPattern, SoundScene, MoodLog, DailyFortune } from './types';

export const USER_PROFILE = {
  name: 'Alex',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVSyp2Q_UkA14tgdHP1beaS0ayMGZsTsmQJ6k10PClXWJYpDZpwGbCKU5GQn35lWVJ9SJKfeqjW1wEP-gu9WWp_-7MuK-qS1UBu9u_-VA_FrCqllqTG_qy3A3_q1SBwRpKhK9jlV4kF6eazfo5YwCaftJu9W2V9011rVIl-E8TryAJXL-w_jITg6ZQmN6b5jjoOvfxuVTnCLMUj4d7nkpoFYvlh49IGGnXlFYSSagr22H53j_K1IHrL7o_DrKhDd2tXLFQVdfXJNrZ',
  islandAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj2TxAc6OVbKAn6aAqbEnX13ELT0E4qC-TwQVi46UPJB1-Jk3alCevZGn8Lc6RfKkmztndrCAl3yTnLTyrCX072RFlTu5wbus_cVaxL3De3Qesi1ySEwhMT3XdUb6iof10IqN1XZZslBFPlr1pULj2KJwxS0TmTAwvO3kpjsz8TKxQG9BQhQwugI_vvDKAAKTGFNOodmsY7WZdtXY2LXH981bdKNf0czMuccFSHYvnGjeyGoopgeKBtL3XenJGacykLNfT22wtoXdB',
  daysTogether: 27,
  worksCount: 24,
  breathingHours: 6.8,
  recordsCount: 38
};

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: '4-4-4',
    name: '4-4-4',
    inhale: 4,
    hold: 4,
    exhale: 4,
    description: '平衡呼吸 · 缓解压力'
  },
  {
    id: '4-7-8',
    name: '4-7-8',
    inhale: 4,
    hold: 7,
    exhale: 8,
    description: '助眠呼吸 · 深层放松'
  },
  {
    id: '5-5-5',
    name: '5-5-5',
    inhale: 5,
    hold: 5,
    exhale: 5,
    description: '专注呼吸 · 提神醒脑'
  }
];

export const INITIAL_SAVED_ARTWORKS: SavedArtwork[] = [
  {
    id: 'art-1',
    title: '紫曦极光 - Aurora',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6zRYGIw1RCW7xcYA6Vn_i0kvXl01fWOSFV9MOMDenrJ09vKzuZJQlRow8CLsxupofV_Rb_3JkOQbEnq-PGNBd0KLGl6CIVpDVrXlh_IwnDfeWeirDmORDbNxahN8EWiGVHHtdNxzQiwLc4L9tT7NPf-1IUkCzA8Ys-WroulgMJcItzx0-YbgHtx9egvz04VLzIZQ2XbtSiwIG9ot24NTKMIjV6uLDaxvibqXI5Gkm-sEfFzJAMRui-QfrewV6xTcdp1YIsx4QBTW3',
    imageAlt: 'fluid swirling wisps of lavender and cyan',
    date: '2026.05.20',
    category: 'recent'
  },
  {
    id: 'art-2',
    title: '蜜桃晓雾 - Soft Peach Waves',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvFv-GJwk0S6yW2het-vq_oLO08DHK3EOXE-eSS2per1ZYVaWpNvBOToJea3QN3_2DcwMmMhfAu5UTDXEV2QfL-4B-5aC-qaK7jB5OBxGh_93u-cUalQqpKZ9y5nrgnQiZC_Pluksv6biVVjo7R4nRXobBEIot4lZQtnOulNvJ1vN2lBNH-SyvoX_2mm2laJUHOzuN_s4aKPw_Vbl4D0OFroz5PQNDdjGxrzU5djNaNgQfEtQVjz7Uv8WR3aiYEd229bnXcxgqGNu7',
    imageAlt: 'soft overlapping waves of peach and sky blue',
    date: '2026.05.19',
    category: 'favorite'
  },
  {
    id: 'art-3',
    title: '晨曦流金 - Golden Dawn Reflection',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo0X3LS9Xe2F1EFvF8a7pHq7DZSXKgAW58Icsmt84h7HFy2ZyAG8tA1elCtrcDNpK9BNgUhR8NM6rpMswxmPtqM8juOn01Z6LPxgdeBpgh0T_RKWFDJHdUSXPqGsTtOuSOFM7mprlox1OZgpdskd91TERpB9HRLN83REe461XEzvPQX2fo5aFhkz2hxfEuz577fa3aapingm5RBVyRmTLC0dAO1APUgG6r1mp8DM3UvjTddmlKQPKEr6af9KU6lrl0jOGbwRgW22M_',
    imageAlt: 'glowing golden threads with cool violet shadows',
    date: '2026.05.18',
    category: 'all'
  },
  {
    id: 'art-4',
    title: '云蒸雨夜 - Rainy Breath',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBy19KLsILhZjTfjCxeYAgUIaWyAtSOJBZ0i5Gxb_K99vkoFWczEsW7NkzwxPouC9erDMSdD8w0jbAooQRsaTwxn1jr-dBQBJqkNheSppkkshm-SDSDP43SMjLeGpAxxxE47J1Wv5esBkw-YcYOl9PsTdUj-zpJm_Z1R8ZSjjmvr-jLg7Yc1w5m29iFwhspu3CTUslAnwPH3ASxqJShC9i0CDIbTQZ3pTf-5zIG73swPUgtnFUsaZd5lGRlnHPpAGO3OXNXWOWqrvfR',
    imageAlt: 'ambient shadows and glassmorphism',
    date: '2026.05.17',
    category: 'recent'
  },
  {
    id: 'art-5',
    title: '琥珀流痕 - Pearlescent Mint',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ1saFsGxXYh7A96Cv8hNzTIBzCLIiNjM5TlFbKmEUHvY6IVs4tQvcHI6jhFffUG8-VlUCh6fstIo3XUuJcPUpuT8WjqrnYxXvvUlRHrXf7OUoxod0-XEOB12tCxwS_ycAe6blaa6eZFP_oaqN4BktSYtL2p1yqaqKwQ6D1zwlsptY_c-mTyxfuSKiQU8BljcLuwpXG1VfpqykXh-sajdVECBn_MBmS2QT6JxSQkMP8WwiMGU_a5Oa7PuqVsdC0mAAbtihFnPsur3Y',
    imageAlt: 'pearlescent mint and soft lavender',
    date: '2026.05.15',
    category: 'all'
  },
  {
    id: 'art-6',
    title: '幽谧破晓 - Misty Horizon',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeAko7vOtiZWJ0STf42A_it2J5nteYkHxOLyDrnZ6RKkMmRCFB_ajNqBjPAbfhnZUn3P79qF4N_681twJFhjpLAY9jtcoXszmZ15VrGVv_60S2mRnt5g4ZSuFS1HbAsQQ9Mijhgfw_20sDLFxLa2rQv8gssX322RbxNErlu2hLTmFnnI7NyrbEKU4qIBwM5cVUPUyTT1xaY5DJRelSytOpQShBq1lQWlbw1098sygIj-_N3M0yLK6S0K7S4Tq1nkYhYbaqSmorwyns',
    imageAlt: 'glowing soft-focus particles suspended',
    date: '2026.05.12',
    category: 'favorite'
  }
];

export const INITIAL_MOOD_LOGS: MoodLog[] = [
  {
    id: 'log-1',
    type: 'calm',
    label: '平静 Calm',
    time: '08:30',
    description: '早晨漫步在晨雾和煦的日光中。醒来时感到一种清晰感和正念流转，神清气爽。',
    icon: 'sentiment_satisfied',
    date: '2026.05.20'
  },
  {
    id: 'log-2',
    type: 'calm',
    label: '平静 Calm',
    time: '13:45',
    description: '工作处理得很轻松，深度工作了2个小时。调息效果极佳。',
    icon: 'waves',
    date: '2026.05.19'
  },
  {
    id: 'log-3',
    type: 'anxious',
    label: '焦虑 Anxious',
    time: '16:30',
    description: '会议前有些许烦闷和突如其来的心跳加速。通过5分钟的4-7-8呼吸得以调和平抑。',
    icon: 'wind',
    date: '2026.05.18'
  },
  {
    id: 'log-4',
    type: 'tired',
    label: '疲惫 Tired',
    time: '21:15',
    description: '结束了一天繁重的数据处理，肩膀酸疼。配合沉浸雨声调和了呼吸，感觉紧绷正渐渐散去。',
    icon: 'moon',
    date: '2026.05.17'
  },
  {
    id: 'log-5',
    type: 'low',
    label: '低落 Low',
    time: '11:00',
    description: '细雨微寒，提不起太多精神，做事效率不高。借由指尖在黑夜画布中勾画一朵柔和的曼陀罗，慢慢沉淀。',
    icon: 'trending-down',
    date: '2026.05.15'
  },
  {
    id: 'log-6',
    type: 'irritated',
    label: '烦躁 Irritated',
    time: '15:20',
    description: '外界环境噪音干扰，有些难以入定。好在佩戴上耳塞后调整了气流，逐步归于平静。',
    icon: 'frown',
    date: '2026.05.12'
  },
  {
    id: 'log-7',
    type: 'calm',
    label: '平静 Calm',
    time: '22:00',
    description: '睡前例行调息，与心里的杂音轻轻和解。很期待明天清晨。',
    icon: 'heart',
    date: '2026.05.20'
  }
];

export const SOUND_SCENES: SoundScene[] = [
  {
    id: 'ocean',
    title: '海之漂浮',
    englishTitle: 'DEEP SEA',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8PwTm_YgPcV3y8pA_8_m5VY0iFwzObtqInfnbyBOHD-S761s6ocxWBxX5pQ_vF4fNRGwtDQ_tTuVDXC2bVAlVEmvfbJpaGSbWtHhYp_URRmU8X_Jg3sxfAkRF4l3oV2O-wyHFBIacaJ064dmKfoSJ42UfI0s6wdk50RU7A_gL9WAML0rwrHZ6-EBw7C_KG5La1GbHrDD7eBe0nBq3KFAmUm9wXl9hqyIU8oYKkcl7beE3uKxDYkp4ixnOh48Ud0M9G8Ygcf5DlNBQ',
    imageAlt: 'deep ocean blue depths water filter light',
    mix: '海浪 + 深度环境钢琴'
  },
  {
    id: 'rain',
    title: '雨夜沉思',
    englishTitle: 'RAINY NIGHT',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1mU4RpOPhR32vyqHkqWQJF34snZ02H_M9x5FqrhU1-Zzc1DcJVLhdKwIOSzqLaQGo9KeRSBqs5xHy8uky3VCM-4DF5GVOIDtAh6fotUcYbxVTe942iXwl4w9UppvLZ3j7Hkpestpf-8FmSR14Xxm_IhB68M_IIqee4XfNLBO0RRwH7T3BFELzY2YGArCy76PgRqtKAX-S0xBgHAvOtS__ssP9yYs8l1mOIZ0pUYWMgRVLPpFNYLrJ7t_UB-YPIdsvzMTVN1Ygv2ux',
    imageAlt: 'rainy night skyline misty droplets',
    mix: '雨声纹理 + 白噪音'
  },
  {
    id: 'forest',
    title: '古林深呼吸',
    englishTitle: 'MISTY FOREST',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcWVTor9V2ao2BAI08LCCnNr5FIHNvXKIgAWbVcE5x7Pwr7BJiRvwka8RaM8Q-CkxE_zgUZ5UNO1YuzX53Px7-Cmda1ieoCtcAU4IQHJmCT9xmIObIkd-yNBDe5gxnxqTeO1nsOcaiUOJH6GZN8Wws9ErVHvEd-md-3nB_x0hHKaw_e_CQbv19NW30qm6mdsohG96vtjN8WdzdJmVkwgutI2G6hYQmheHYoeS-_YKGGbx3TkQliETV9s97_YTyrySv8phzO6nUEoiu',
    imageAlt: 'misty pine trees evergreen canopy',
    mix: '松林晚风 + 玄空磐音'
  },
  {
    id: 'moonlight',
    title: '月夜流光',
    englishTitle: 'MOONLIGHT',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgBDfMX2xmp4tqTnwOac-4SfO4-w6CJkETTiKyNKC8CFtV_1trPTwgy5paWBfxGXW00o4TmLE9uxd37oGVvE4HqLueMaKl25TqcZZXcKvoqokh8QVvZkmjZmWhpQe7euXQrL6qFCMncUvB0G15mPy8MwQbkV5ZzVxPliJ2hRDQBOjC3VIyNEHtwsBxEJlzowoeNhm9ek4POBJMZilfujGVMAAZPntIV_tSqVZ629s3rtqqNGKRO07u7yNDcA-UN0mQjxe_syddYBD9',
    imageAlt: 'quiet lake shoreline moonlight reflect',
    mix: '潮起汐落 + 潮汐钢琴'
  },
  {
    id: 'starry',
    title: '群星咏赞',
    englishTitle: 'STARRY SKY',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwzKfpYoo-Nn8AOeawGjRdrdTEux4iwaRqs-3r0RbLlszKMGvafDJBLaBjmHN4EL5OlvvmrMWtw33TmH21A5kN-iHxkCqzzCwJdwvb4H6JySHq3_GJP0TuPQgYpCIE-nkWjbA6EYJdaUqOVodvKyQjtvEitWNRFHrIAkNgJR8iWkcammbMnKDGbr-s-QO4U2BuoAh3gczNFKRa2UzJdAmrq8CPZiMZllPgNDlG-KGjos1jvPnYOYp121b3Fh8wYl7FOECHnT_mhSO2',
    imageAlt: 'unclouded night sky shimmering stellar galaxy stars',
    mix: '星核虚空音 + 天籁磬钟'
  }
];

export const FORTUNES: DailyFortune[] = [
  {
    id: 1,
    level: '上上签',
    title: '云开月明',
    poem: '长风破浪会有时，直挂云帆济沧海。',
    meaning: '今日运势如虹，阴霾尽散。你所期待之事正悄然向好消息转变，内心澄明如镜。',
    advice: '保持正念，大胆前行。适合开启新计划或做出重要决定。',
    tags: ['开运', '顺遂', '光明']
  },
  {
    id: 2,
    level: '上上签',
    title: '春风得意',
    poem: '等闲识得东风面，万紫千红总是春。',
    meaning: '万物复苏，生机勃勃。今日你的能量场格外和谐，容易吸引美好的缘分与机遇。',
    advice: '多与人交流，分享你的喜悦。善意的流动会为你带来更多福报。',
    tags: ['人缘', '喜悦', '丰盛']
  },
  {
    id: 3,
    level: '上签',
    title: '静水流深',
    poem: '行到水穷处，坐看云起时。',
    meaning: '表面平静之下，蕴藏着深邃的智慧。今日适合内观与沉淀，答案自会浮现。',
    advice: '不必急于行动，给自己一段独处的时光，聆听内心的声音。',
    tags: ['内省', '智慧', '沉淀']
  },
  {
    id: 4,
    level: '上签',
    title: '柳暗花明',
    poem: '山重水复疑无路，柳暗花明又一村。',
    meaning: '困境即将过去，转机已在前方。你的坚持与耐心终将得到回报。',
    advice: '在看似无路可走时，不妨换个角度思考，新的可能性正在萌芽。',
    tags: ['转机', '希望', '坚持']
  },
  {
    id: 5,
    level: '上签',
    title: '厚德载物',
    poem: '地势坤，君子以厚德载物。',
    meaning: '你的包容与善良正在悄然积累福报。今日宜行善积德，广结善缘。',
    advice: '以温柔对待自己和他人，你的善意会像涟漪一样扩散开来。',
    tags: ['善良', '包容', '福报']
  },
  {
    id: 6,
    level: '中签',
    title: '细水长流',
    poem: '随风潜入夜，润物细无声。',
    meaning: '今日运势平稳，没有大起大落。看似平淡的日子里，正孕育着细微的成长。',
    advice: '珍惜当下的平静，在细微处发现生活的美好。慢下来，才能走得更远。',
    tags: ['平稳', '耐心', '成长']
  },
  {
    id: 7,
    level: '中签',
    title: '守正待时',
    poem: '时来天地皆同力，运去英雄不自由。',
    meaning: '时机尚未完全成熟，此刻最重要的是守住本心，做好当下的每一件事。',
    advice: '不急于求成，把眼前的小事做好。属于你的时机正在路上。',
    tags: ['等待', '专注', '积累']
  },
  {
    id: 8,
    level: '中签',
    title: '返璞归真',
    poem: '采菊东篱下，悠然见南山。',
    meaning: '今日适合回归简单，放下繁杂的思虑。最朴素的快乐往往最珍贵。',
    advice: '尝试做一次减法，放下手机，去自然中走走，感受生命的本真。',
    tags: ['简单', '自然', '放下']
  },
  {
    id: 9,
    level: '下签',
    title: '韬光养晦',
    poem: '千淘万漉虽辛苦，吹尽狂沙始到金。',
    meaning: '今日或许会感到些许阻滞，但这正是磨砺心性的时刻。风雨之后必有彩虹。',
    advice: '把挑战视为成长的礼物，降低预期，专注于自己能控制的部分。',
    tags: ['磨砺', '韧性', '成长']
  },
  {
    id: 10,
    level: '下签',
    title: '否极泰来',
    poem: '沉舟侧畔千帆过，病树前头万木春。',
    meaning: '低谷是转折的前奏。今日的困顿正是为了明日更好的绽放做准备。',
    advice: '允许自己短暂地休息和调整，不必强撑。明天又是新的一天。',
    tags: ['转折', '休息', '希望']
  }
];

export function getDailyFortune(): DailyFortune {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const saved = localStorage.getItem('lumina_fortune_date');
  const savedId = localStorage.getItem('lumina_fortune_id');

  if (saved === dateStr && savedId) {
    const id = parseInt(savedId, 10);
    return FORTUNES.find(f => f.id === id) || FORTUNES[0];
  }

  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const id = (seed % FORTUNES.length) + 1;
  const fortune = FORTUNES.find(f => f.id === id) || FORTUNES[0];

  localStorage.setItem('lumina_fortune_date', dateStr);
  localStorage.setItem('lumina_fortune_id', String(fortune.id));

  return fortune;
}

export function clearDailyFortune(): void {
  localStorage.removeItem('lumina_fortune_date');
  localStorage.removeItem('lumina_fortune_id');
}

// Helper to determine gradient styles for mood states
export const MOOD_STYLE_MAP = {
  calm: {
    orbColor: 'rgba(221, 230, 210, 0.4)',
    glowColor: 'rgba(221, 230, 210, 0.6)',
    bgGradient: 'linear-gradient(to tr, #dde6d2, #ffffff)',
    chinese: '平静',
    label: 'Calm',
    description: '深沉平和的呼吸，如山间微风般宁静自在。',
    colorHex: '#C0C9B7'
  },
  anxious: {
    orbColor: 'rgba(246, 222, 210, 0.4)',
    glowColor: 'rgba(246, 222, 210, 0.6)',
    bgGradient: 'linear-gradient(to tr, #f6ded2, #ffffff)',
    chinese: '焦虑',
    label: 'Anxious',
    description: '通过加长呼气时间，平抑激荡的脑电波，松弛身心。',
    colorHex: '#F6DED2'
  },
  tired: {
    orbColor: 'rgba(215, 228, 237, 0.4)',
    glowColor: 'rgba(215, 228, 237, 0.6)',
    bgGradient: 'linear-gradient(to tr, #d7e4ed, #ffffff)',
    chinese: '疲惫',
    label: 'Tired',
    description: '温柔的呼吸如海潮轻拍，为您轻柔抚平一日风尘。',
    colorHex: '#D7E4ED'
  },
  irritated: {
    orbColor: 'rgba(186, 26, 26, 0.15)',
    glowColor: 'rgba(186, 26, 26, 0.25)',
    bgGradient: 'linear-gradient(to tr, #ffdad6, #ffffff)',
    chinese: '烦躁',
    label: 'Irritated',
    description: '释放内心急躁与淤塞，令浮躁的气流沉淀归元。',
    colorHex: '#FED4C8'
  },
  low: {
    orbColor: 'rgba(184, 163, 152, 0.3)',
    glowColor: 'rgba(184, 163, 152, 0.4)',
    bgGradient: 'linear-gradient(to tr, #b8a398, #ffffff)',
    chinese: '低落',
    label: 'Low',
    description: '温柔轻缓的气流浸润心扉，托起沉重，静待光影重临。',
    colorHex: '#B8A398'
  }
};
