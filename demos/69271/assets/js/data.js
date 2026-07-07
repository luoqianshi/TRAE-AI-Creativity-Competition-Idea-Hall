/**
 * 片刻 Pianke Demo — 内置数据
 * 包含：8大专题、95+姿势、6个拍摄点、7个滤镜、3个Banner、社区广场
 * 图片使用 AI 文生图 API（主题匹配），失败自动回退到 picsum
 */
window.PK_DATA = (function () {
  // ===== AI 文生图 helper =====
  // 调用 trae text_to_image API，生成与主题匹配的图片
  const t2i = (prompt, size = 'portrait_4_3') =>
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;

  // picsum 回退（onerror 时使用）
  const fallback = (seedKey, w, h) => `https://picsum.photos/seed/${seedKey}/${w}/${h}`;
  const portraitFB = (seedKey) => fallback('pk-' + seedKey, 400, 560);
  const landscapeFB = (seedKey, w = 800, h = 400) => fallback('pk-' + seedKey, w, h);

  // 带回退的图片对象（在 HTML 中用 onerror 切换）
  // 返回主 URL；HTML/img 上统一加 onerror="this.src=this.dataset.fb"
  const pose = (prompt, fbKey) => ({
    src: t2i(prompt, 'portrait_4_3'),
    fb: portraitFB(fbKey)
  });
  const banner = (prompt, fbKey) => ({
    src: t2i(prompt, 'landscape_16_9'),
    fb: landscapeFB(fbKey, 800, 400)
  });
  const landscape = (prompt, fbKey, w = 600, h = 400) => ({
    src: t2i(prompt, 'landscape_4_3'),
    fb: landscapeFB(fbKey, w, h)
  });
  const square = (prompt, fbKey) => ({
    src: t2i(prompt, 'square'),
    fb: fallback('pk-' + fbKey, 200, 200)
  });

  // ===== 滤镜预设 =====
  const filters = [
    { id: 'none', name: '原图', css: 'none' },
    { id: 'youth', name: '青春胶片', css: 'brightness(1.05) contrast(1.1) saturate(1.15) sepia(0.12)' },
    { id: 'jp', name: '日系清新', css: 'brightness(1.12) contrast(0.92) saturate(0.78) hue-rotate(-5deg)' },
    { id: 'retro', name: '复古校园', css: 'brightness(1.0) contrast(1.2) saturate(0.65) sepia(0.25)' },
    { id: 'bw', name: '经典黑白', css: 'grayscale(1) contrast(1.3) brightness(1.02)' },
    { id: 'golden', name: '暖金时刻', css: 'brightness(1.05) saturate(1.1) sepia(0.3) hue-rotate(-10deg) contrast(1.05)' },
    { id: 'cool', name: '冷调蓝', css: 'brightness(0.98) saturate(0.85) hue-rotate(10deg) contrast(1.08)' }
  ];

  // ===== 拍摄点（图片与地点匹配） =====
  const spots = [
    {
      id: 'spot_001', name: '北京三里屯', city: '北京',
      location: { lat: 39.93, lng: 116.45, x: 28, y: 30 },
      samples: [
        t2i('Sanlitun Beijing street at night with neon lights, modern shopping district, trendy urban photography', 'landscape_4_3'),
        t2i('Beijing Sanlitun neon signs reflecting on wet street, night lifestyle photography', 'landscape_4_3')
      ],
      bestTime: '傍晚 17-19 点', rating: 4.8,
      tags: ['街拍', '夜景', '潮流'], desc: '潮流地标，霓虹灯光适合人像街拍。'
    },
    {
      id: 'spot_002', name: '上海外滩', city: '上海',
      location: { lat: 31.24, lng: 121.49, x: 62, y: 55 },
      samples: [
        t2i('Shanghai Bund waterfront night skyline with Pudong Lujiazui skyscrapers, classic cityscape', 'landscape_4_3'),
        t2i('Shanghai Bund historical European architecture at blue hour, river promenade', 'landscape_4_3')
      ],
      bestTime: '日出 5-7 点 / 蓝调时刻', rating: 4.9,
      tags: ['城市', '夜景', '经典'], desc: '万国建筑群与浦东天际线，经典机位。'
    },
    {
      id: 'spot_003', name: '杭州西湖', city: '杭州',
      location: { lat: 30.25, lng: 120.15, x: 45, y: 68 },
      samples: [
        t2i('West Lake Hangzhou misty morning with Su Causeway and willow trees, traditional Chinese landscape', 'landscape_4_3'),
        t2i('West Lake Hangzhou Leifeng Pagoda at sunset, golden reflection on calm lake', 'landscape_4_3')
      ],
      bestTime: '清晨 6-8 点', rating: 4.7,
      tags: ['自然', '湖景', '古风'], desc: '断桥残雪，雷峰夕照，适合古风出片。'
    },
    {
      id: 'spot_004', name: '厦门鼓浪屿', city: '厦门',
      location: { lat: 24.45, lng: 118.07, x: 72, y: 75 },
      samples: [
        t2i('Gulangyu Island Xiamen red brick western architecture and banyan tree, seaside lane', 'landscape_4_3'),
        t2i('Gulangyu Xiamen narrow alley with vintage buildings, tropical sunlight, travel photography', 'landscape_4_3')
      ],
      bestTime: '上午 8-11 点', rating: 4.6,
      tags: ['海岛', '文艺', '建筑'], desc: '红砖洋楼与海岛小巷，文艺清新圣地。'
    },
    {
      id: 'spot_005', name: '成都宽窄巷子', city: '成都',
      location: { lat: 30.67, lng: 104.06, x: 38, y: 82 },
      samples: [
        t2i('Kuanzhai Alley Chengdu traditional Sichuan courtyard with gray brick wall and red lanterns', 'landscape_4_3'),
        t2i('Chengdu Kuanzhai Alley stone paved street with Qing dynasty architecture, cultural heritage', 'landscape_4_3')
      ],
      bestTime: '下午 15-17 点', rating: 4.5,
      tags: ['古风', '市井', '人文'], desc: '青砖灰瓦，川西民居，人文纪实好去处。'
    },
    {
      id: 'spot_006', name: '广州塔', city: '广州',
      location: { lat: 23.11, lng: 113.33, x: 55, y: 88 },
      samples: [
        t2i('Canton Tower Guangzhou at night with colorful light show, modern landmark skyline', 'landscape_4_3'),
        t2i('Guangzhou Canton Tower reflected on Pearl River at night, long exposure cityscape', 'landscape_4_3')
      ],
      bestTime: '夜晚 19-22 点', rating: 4.7,
      tags: ['地标', '夜景', '城市'], desc: '小蛮腰灯光秀，城市夜景代表。'
    }
  ];

  // ===== 8大专题（banner 与主题匹配） =====
  const themes = [
    {
      id: 'graduation', name: '毕业照', icon: '🎓', color: '#534AB7',
      banner: t2i('Graduation ceremony with students throwing caps in the air, joyful celebration, golden hour campus', 'landscape_16_9'),
      desc: '从单人学士服到全班大合影，记录最好的青春',
      tags: ['毕业', '校园', '青春', '学士服'],
      poseCount: 12
    },
    {
      id: 'wedding', name: '婚纱/情侣', icon: '💒', color: '#E11D48',
      banner: t2i('Romantic wedding couple bride in white dress and groom, golden hour backlight, outdoor ceremony', 'landscape_16_9'),
      desc: '80+经典婚纱姿势，定格最美瞬间',
      tags: ['婚纱', '情侣', '浪漫'],
      poseCount: 15
    },
    {
      id: 'kids', name: '亲子', icon: '👶', color: '#F59E0B',
      banner: t2i('Happy young family with child outdoors, warm sunlight, genuine smiles, lifestyle photography', 'landscape_16_9'),
      desc: '亲子互动姿势大全，记录成长每一刻',
      tags: ['亲子', '家庭', '温馨'],
      poseCount: 10
    },
    {
      id: 'travel', name: '旅行打卡', icon: '✈️', color: '#0EA5E9',
      banner: t2i('Traveler silhouette standing on mountain cliff overlooking scenic valley at sunset, wanderlust', 'landscape_16_9'),
      desc: '100+旅行拍照姿势，告别游客照',
      tags: ['旅行', '打卡', '风景'],
      poseCount: 20
    },
    {
      id: 'food', name: '美食', icon: '🍜', color: '#EA580C',
      banner: t2i('Beautiful flat lay food photography on wooden table, gourmet dishes, warm natural light, restaurant', 'landscape_16_9'),
      desc: '40+构图技巧，让美食更诱人',
      tags: ['美食', '构图', '餐厅'],
      poseCount: 8
    },
    {
      id: 'sports', name: '运动/健身', icon: '🏃', color: '#10B981',
      banner: t2i('Athlete in dynamic motion, dramatic lighting, gym or outdoor sports action shot, powerful', 'landscape_16_9'),
      desc: '运动瞬间抓拍，展现力量美感',
      tags: ['运动', '健身', '动感'],
      poseCount: 10
    },
    {
      id: 'pets', name: '宠物', icon: '🐱', color: '#A16207',
      banner: t2i('Cute golden retriever and cat portrait outdoors, soft natural light, adorable pets photography', 'landscape_16_9'),
      desc: '30+宠物拍摄技巧，萌宠出片指南',
      tags: ['宠物', '萌宠', '可爱'],
      poseCount: 8
    },
    {
      id: 'hanfu', name: '古风/汉服', icon: '🎭', color: '#9333EA',
      banner: t2i('Young Chinese woman in elegant hanfu traditional dress in ancient Chinese garden, cultural aesthetic', 'landscape_16_9'),
      desc: '40+古风姿势，国潮汉服出片',
      tags: ['古风', '汉服', '国潮'],
      poseCount: 12
    }
  ];

  // ===== 姿势模板：[标题, 分类, 难度, 构图, 提示数组, 英文 prompt] =====
  // 英文 prompt 必须与标题内容语义匹配，确保生成的图与姿势表达一致
  const poseTemplates = {
    graduation: [
      ['抛帽瞬间', '单人', 2, 'thirds', ['帽子向斜上方45度抛出', '抓拍帽子在空中的瞬间', '仰拍角度更显高'],
       'graduation cap thrown into blue sky by student in academic gown, celebration moment, low angle shot, campus'],
      ['学位服正坐', '单人', 1, 'golden', ['端正坐姿', '双手自然放膝上', '平视镜头微笑'],
       'graduate student in black academic gown sitting formally on stone steps, holding diploma, dignified pose, university'],
      ['回眸一笑', '单人', 2, 'diagonal', ['侧身回望镜头', '自然微笑', '逆光发丝发光'],
       'graduate in academic gown looking back over shoulder with smile, golden hour backlight, campus tree-lined path'],
      ['毕业证书特写', '单人', 1, 'thirds', ['手捧证书', '焦点在证书', '虚化人物'],
       'close-up of hands holding rolled university diploma, graduation gown sleeves, soft bokeh background'],
      ['闺蜜合影', '闺蜜', 2, 'thirds', ['头贴头亲密', '同色系服装', '自然互动'],
       'three female graduates in academic gowns heads together laughing, joyful, campus lawn background'],
      ['情侣学士服', '情侣', 2, 'golden', ['男生搂女生肩', '对视或看镜头', '同步表情'],
       'young couple in graduation gowns embracing on university quad, looking at each other, romantic, sunset'],
      ['跳拍全班', '全班', 5, 'thirds', ['全班统一动作', '低角度仰拍', '连拍抓最佳瞬间'],
       'group of university graduates jumping in unison, low angle, blue sky, celebration, caps in air'],
      ['图书馆书架间', '单人', 2, 'diagonal', ['书架作背景', '侧身站位', '翻书动作自然'],
       'graduate student in gown standing between library bookshelves, holding open book, soft warm light'],
      ['操场跑道起跑', '单人', 3, 'thirds', ['起跑姿势', '低角度', '动感抓拍'],
       'graduate in academic gown at starting blocks on running track, athletic pose, low angle dynamic'],
      ['校门地标合影', '单人', 1, 'golden', ['校门居中', '人物侧站', '光影均匀'],
       'graduate standing beside grand university gate, formal pose, landmark architecture, daylight'],
      ['林荫道漫步', '闺蜜', 2, 'diagonal', ['一前一后走', '自然步伐', '抓拍回头'],
       'two graduates walking down tree-lined campus path, one looking back, candid, dappled sunlight'],
      ['教室黑板前', '全班', 3, 'thirds', ['黑板写字互动', '抓拍表情', '自然光线'],
       'group of graduates in front of classroom blackboard, playful poses, writing, natural light']
    ],
    wedding: [
      ['深情对视', '情侣', 2, 'golden', ['面对面站立', '双手相握', '眼神交汇'],
       'bride in white wedding dress and groom gazing into each others eyes, holding hands, romantic outdoor'],
      ['新娘背影', '单人', 2, 'thirds', ['展示婚纱拖尾', '自然回头', '逆光轮廓'],
       'bride in white wedding dress back view showing long train, looking back over shoulder, natural light'],
      ['额头相抵', '情侣', 1, 'golden', ['闭眼感受', '双手相扣', '柔和光线'],
       'newlywed couple foreheads touching, eyes closed, intimate moment, soft natural light, romantic'],
      ['手部特写', '情侣', 1, 'diagonal', ['展示戒指', '虚化背景', '柔光拍摄'],
       'close-up of bride and groom hands with wedding rings, soft focus bokeh, romantic lighting'],
      ['拥吻瞬间', '情侣', 3, 'thirds', ['新郎轻拥新娘', '自然亲吻', '抓拍瞬间'],
       'bride and groom kissing passionately at wedding ceremony, romantic embrace, soft light'],
      ['婚纱旋转', '单人', 3, 'diagonal', ['转动裙摆', '抓拍动感', '低角度'],
       'bride spinning in white wedding dress, flowing skirt, dynamic motion, outdoor garden, joyful'],
      ['海边漫步', '情侣', 2, 'thirds', ['手牵手行走', '浪花背景', '夕阳逆光'],
       'bride and groom walking on beach holding hands, sunset backlight, waves, romantic silhouette'],
      ['窗前剪影', '情侣', 3, 'golden', ['侧身剪影', '窗户光源', '曝光欠一档'],
       'silhouette of bride and groom by large window, side profile, dramatic backlight, romantic'],
      ['捧花特写', '单人', 1, 'diagonal', ['手捧花束', '虚化人物', '焦点在花'],
       'close-up of bride hands holding bridal bouquet of white roses, soft focus, romantic wedding'],
      ['阶梯并坐', '情侣', 2, 'thirds', ['阶梯高低错落', '自然依偎', '对称构图'],
       'bride and groom sitting on stone staircase, leaning together, symmetry, romantic outdoor'],
      ['回眸一笑', '单人', 2, 'diagonal', ['缓步前行', '回头瞬间', '风吹动发丝'],
       'bride walking away in wedding dress, looking back over shoulder, veil flowing in wind, outdoor'],
      ['舞池旋转', '情侣', 4, 'diagonal', ['跳舞姿势', '抓拍旋转', '慢门虚化'],
       'bride and groom dancing spinning on dance floor, romantic, motion blur, ballroom lights'],
      ['掀头纱', '单人', 3, 'golden', ['头纱飘动', '抓拍瞬间', '逆光发亮'],
       'bride lifting wedding veil, backlit glowing, ethereal moment, soft light, romantic'],
      ['并排背影', '情侣', 1, 'thirds', ['手牵手背影', '风景前方', '黄金时刻'],
       'bride and groom back view holding hands, facing scenic landscape, golden hour, romantic'],
      ['戒指互换', '情侣', 2, 'diagonal', ['手部特写', '柔光箱光', '微距镜头'],
       'extreme close-up of hands exchanging wedding rings during ceremony, soft light, macro']
    ],
    kids: [
      ['亲子拥抱', '亲子', 1, 'golden', ['孩子抱住父母', '蹲下平视', '自然微笑'],
       'mother embracing young child warmly, both smiling, soft natural light, indoor lifestyle'],
      ['背娃背影', '亲子', 2, 'thirds', ['父母背孩子', '行走抓拍', '户外光线'],
       'father carrying child on back walking outdoors, back view, golden hour, nature path'],
      ['亲子阅读', '亲子', 1, 'diagonal', ['共读一本书', '专注表情', '窗边柔光'],
       'parent and child reading picture book together, focused expressions, soft window light, cozy'],
      ['孩子奔跑', '亲子', 2, 'diagonal', ['低角度抓拍', '连拍模式', '自然笑容'],
       'young child running and laughing in grass field, low angle, motion, joyful, outdoor'],
      ['全家福', '家庭', 2, 'thirds', ['高低错落站位', '统一色调', '自然互动'],
       'happy family of four portrait outdoors, casual coordinated outfits, warm harmonious, golden hour'],
      ['亲子亲吻', '亲子', 1, 'golden', ['亲吻额头', '闭眼感受', '柔光特写'],
       'mother gently kissing childs forehead, intimate close-up, soft light, tender moment'],
      ['吹泡泡', '亲子', 2, 'diagonal', ['抓拍泡泡飞舞', '孩子惊喜表情', '逆光梦幻'],
       'child blowing soap bubbles, surprised joyful expression, backlight, dreamy outdoor'],
      ['荡秋千', '亲子', 3, 'thirds', ['抓拍最高点', '大笑表情', '蓝天背景'],
       'child on playground swing at highest point, laughing, blue sky background, joyful motion'],
      ['沙滩玩耍', '家庭', 2, 'diagonal', ['挖沙堆堡', '俯拍全身', '鲜艳配色'],
       'child playing in sand on beach building sandcastle, top-down view, bright colors, summer'],
      ['睡前故事', '亲子', 1, 'golden', ['床边共读', '暖黄灯光', '温馨氛围'],
       'parent reading bedtime story to child in bed, warm yellow lamp light, cozy intimate atmosphere']
    ],
    travel: [
      ['地标合影', '单人', 1, 'thirds', ['地标居中', '人物侧站', '黄金时刻'],
       'tourist standing beside famous world landmark, side pose, golden hour, travel photography'],
      ['背影杀', '单人', 1, 'golden', ['背对镜头', '面朝风景', '留白构图'],
       'traveler back view facing scenic mountain valley landscape, vista, leading lines, golden hour'],
      ['跳跃抓拍', '单人', 3, 'diagonal', ['低角度仰拍', '连拍抓最佳', '蓝天背景'],
       'traveler jumping in front of scenic landscape, low angle, blue sky, joyful, dynamic'],
      ['街角漫步', '单人', 2, 'diagonal', ['自然行走', '回头瞬间', '街景虚化'],
       'tourist walking around street corner in old town, candid, urban scene, travel photography'],
      ['日落剪影', '单人', 3, 'thirds', ['侧身剪影', '曝光欠一档', '姿势舒展'],
       'silhouette of person against vibrant sunset sky, side profile, arms spread, dramatic'],
      ['当地美食合影', '单人', 1, 'thirds', ['手捧美食', '人物虚化', '色彩对比'],
       'tourist holding local street food, blurred background, vibrant colors, travel'],
      ['交通工具上', '单人', 2, 'diagonal', ['车窗边', '望向窗外', '抓拍思绪'],
       'traveler looking out train window contemplative, scenic view passing, travel mood'],
      ['楼梯构图', '单人', 2, 'golden', ['楼梯线条', '人物点缀', '对称美学'],
       'person on spiral staircase, geometric lines, symmetry, urban architecture photography'],
      ['咖啡馆窗边', '单人', 1, 'thirds', ['窗边自然光', '咖啡道具', '慵懒氛围'],
       'person sitting by cafe window with coffee cup, soft natural light, lazy afternoon mood'],
      ['海边张开双臂', '单人', 2, 'diagonal', ['双臂展开', '迎风而立', '地平线水平'],
       'traveler arms wide open facing sea at beach, horizon level, joyful, freedom, blue sky'],
      ['古城小巷', '单人', 2, 'diagonal', ['石板路纵深', '人物点缀', '光影斑驳'],
       'person in ancient town cobblestone alley, dappled light, depth, travel photography'],
      ['山顶眺望', '单人', 3, 'thirds', ['俯瞰全景', '人物背影', '云海背景'],
       'hiker at mountain summit overlooking valley and clouds, back view, achievement, scenic'],
      ['瀑布前', '单人', 3, 'diagonal', ['人物侧站', '瀑布虚化', '慢门水流'],
       'person in front of waterfall, side pose, long exposure water, lush nature, travel'],
      ['花海漫步', '单人', 2, 'golden', ['花海中行走', '抓拍回头', '色彩饱满'],
       'person walking through lavender flower field, turning back, vibrant colors, golden hour'],
      ['城市天际线', '单人', 2, 'thirds', ['屋顶机位', '人物前景', '蓝调时刻'],
       'person on rooftop with city skyline background, blue hour, urban photography'],
      ['夜市烟火', '单人', 2, 'diagonal', ['霓虹背景', '人物特写', '大光圈虚化'],
       'person at Asian night market, neon lights background, portrait, bokeh, vibrant'],
      ['寺庙祈福', '单人', 1, 'golden', ['虔诚姿态', '香火氛围', '低饱和色调'],
       'person praying with incense at Buddhist temple, peaceful, low saturation, cultural'],
      ['湖边倒影', '单人', 2, 'thirds', ['对称构图', '平静水面', '晨昏光线'],
       'person by calm lake with symmetrical reflection, dawn light, serene, mountains'],
      ['雪地嬉戏', '单人', 3, 'diagonal', ['白雪背景', '鲜艳服装', '动感抓拍'],
       'person playing in snow, bright red jacket, dynamic motion, winter mountain, joyful'],
      ['沙漠驼影', '单人', 3, 'golden', ['骆驼剪影', '沙丘线条', '夕阳逆光'],
       'camel silhouette on sand dune at sunset, traveler, desert, golden hour, exotic']
    ],
    food: [
      ['俯拍构图', '构图', 1, 'thirds', ['正俯拍90度', '桌布衬底', '餐具点缀'],
       'top-down flat lay of gourmet breakfast on rustic wooden table, styled, restaurant, natural light'],
      ['45度特写', '构图', 1, 'diagonal', ['最常用角度', '虚化背景', '蒸汽加分'],
       'food photo at 45 degree angle, pasta dish, shallow depth of field, steam rising, restaurant'],
      ['手持食物', '构图', 2, 'thirds', ['手捧食物', '背景虚化', '自然光线'],
       'hand holding artisanal burger, blurred restaurant background, natural light, food photography'],
      ['切面展示', '构图', 2, 'golden', ['切开瞬间', '内馅特写', '柔光箱光'],
       'cross-section of layered chocolate cake with fork cutting, soft light, food photography'],
      ['桌面平铺', '构图', 1, 'thirds', ['多道菜平铺', '统一色调', '留白构图'],
       'multiple Chinese dishes flat lay on round table, cohesive color palette, restaurant'],
      ['餐厅环境', '构图', 2, 'diagonal', ['人物+美食', '环境虚化', '氛围感'],
       'person dining in cozy restaurant, food on table, ambient atmosphere, lifestyle'],
      ['饮料倒出', '构图', 3, 'diagonal', ['抓拍倒入瞬间', '高速快门', '逆光透亮'],
       'pouring iced coffee into glass with ice, splash frozen, backlit, refreshing, food photography'],
      ['甜点细节', '构图', 1, 'golden', ['微距特写', '焦点细节', '柔光氛围'],
       'macro close-up of french macaron dessert details, soft light, intricate, pastry']
    ],
    sports: [
      ['跑步起跑', '动作', 2, 'thirds', ['起跑姿势', '低角度', '张力十足'],
       'runner at starting blocks on athletic track, low angle, dynamic tension, sports photography'],
      ['健身举铁', '动作', 3, 'diagonal', ['动作标准', '肌肉线条', '侧光阴影'],
       'muscular athlete lifting barbell, gym, dramatic side lighting, muscle definition, fitness'],
      ['瑜伽体式', '动作', 2, 'golden', ['体式标准', '自然光', '简洁背景'],
       'woman doing yoga warrior pose, balanced, natural light, minimal clean background, wellness'],
      ['篮球扣篮', '动作', 4, 'diagonal', ['抓拍腾空', '低角度仰拍', '连拍模式'],
       'basketball player dunking, frozen mid-air, low angle, dramatic, dynamic, sports'],
      ['骑行抓拍', '动作', 3, 'diagonal', ['侧面跟拍', '虚化背景', '动感模糊'],
       'cyclist riding road bike, side tracking shot, motion blur background, dynamic, sports'],
      ['登山登顶', '动作', 2, 'thirds', ['登顶瞬间', '俯瞰背景', '阳光照射'],
       'mountaineer at rocky summit with panoramic valley view, sunlight, achievement, adventure'],
      ['游泳出水', '动作', 4, 'diagonal', ['抓拍出水', '水花飞溅', '逆光透亮'],
       'swimmer emerging from pool water, water droplets splashing, backlit, dynamic, sports'],
      ['拉伸舒展', '动作', 1, 'golden', ['体式优美', '柔光', '简洁构图'],
       'athlete stretching, graceful pose, soft light, clean studio background, fitness'],
      ['球类运动', '动作', 3, 'thirds', ['动作瞬间', '眼神聚焦', '连拍抓拍'],
       'soccer player kicking ball in action, focused expression, dynamic, sports photography'],
      ['团队合影', '动作', 2, 'thirds', ['统一服装', '团队姿势', '场地背景'],
       'sports team group photo in unified uniform, confident pose, field background, team']
    ],
    pets: [
      ['平视对望', '技巧', 1, 'golden', ['蹲下平视', '焦点眼睛', '自然光'],
       'golden retriever dog looking at camera at eye level, sharp focus on eyes, natural light, portrait'],
      ['奔跑抓拍', '技巧', 3, 'diagonal', ['低角度跟拍', '连拍模式', '草地背景'],
       'dog running in green grass, low angle, motion, action shot, joyful, outdoor'],
      ['睡姿萌照', '技巧', 1, 'thirds', ['安静不打扰', '柔光特写', '温馨氛围'],
       'sleeping cat curled up cozy, soft light, peaceful, adorable, pet photography'],
      ['与主人合影', '技巧', 2, 'thirds', ['亲密互动', '同框对视', '户外光线'],
       'young woman hugging golden retriever, both looking at camera, outdoor, warm bond'],
      ['跳跃接物', '技巧', 4, 'diagonal', ['抛物引诱', '抓拍腾空', '蓝天背景'],
       'dog jumping to catch frisbee mid-air, blue sky background, dynamic, action, pet'],
      ['特写眼神', '技巧', 2, 'golden', ['眼睛对焦', '大光圈虚化', '眼神光'],
       'extreme close-up of cat green eyes, sharp focus, bokeh background, catchlight, pet'],
      ['装扮造型', '技巧', 2, 'thirds', ['可爱装扮', '配合道具', '抓拍表情'],
       'small dog wearing cute knitted sweater costume, posing, colorful background, adorable'],
      ['户外探索', '技巧', 2, 'diagonal', ['自然状态', '跟拍抓拍', '环境融入'],
       'dog exploring nature forest trail, curious, candid, environment, pet photography']
    ],
    hanfu: [
      ['执伞回眸', '古风', 2, 'diagonal', ['油纸伞道具', '缓步回眸', '烟雨背景'],
       'young Chinese woman in hanfu holding oil-paper umbrella, turning back, misty rain, traditional'],
      ['抚琴静坐', '古风', 2, 'golden', ['古琴道具', '端坐姿态', '竹林背景'],
       'woman in hanfu playing guqin zither, seated gracefully, bamboo grove, traditional Chinese'],
      ['执扇轻摇', '古风', 1, 'thirds', ['团扇遮面', '半遮半掩', '柔光特写'],
       'woman in hanfu holding round silk fan half-covering face, soft light, traditional Chinese beauty'],
      ['长廊漫步', '古风', 2, 'diagonal', ['古建长廊', '自然行走', '光影纵深'],
       'woman in hanfu walking in ancient Chinese palace corridor, light and shadow, traditional'],
      ['荷塘边', '古风', 2, 'golden', ['荷塘背景', '侧身而立', '夏日清晨'],
       'woman in hanfu standing by lotus pond, side pose, summer morning, traditional Chinese garden'],
      ['书法挥毫', '古风', 3, 'thirds', ['毛笔道具', '专注神态', '书房氛围'],
       'man in hanfu writing Chinese calligraphy with brush, focused, ink and paper, traditional study'],
      ['灯笼夜色', '古风', 3, 'diagonal', ['提灯笼', '夜色古街', '暖黄光线'],
       'woman in hanfu holding red lantern, ancient Chinese street at night, warm light, traditional'],
      ['雪中红衣', '古风', 3, 'golden', ['红衣白雪', '色彩对比', '飘雪抓拍'],
       'woman in red hanfu standing in snow, strong color contrast, snow falling, traditional Chinese'],
      ['茶道静心', '古风', 2, 'thirds', ['茶具道具', '跪坐姿态', '禅意氛围'],
       'woman in hanfu performing Chinese tea ceremony, kneeling, tea set, zen atmosphere, traditional'],
      ['竹林舞剑', '古风', 4, 'diagonal', ['剑术姿势', '竹林背景', '动感抓拍'],
       'man in hanfu practicing sword martial arts in bamboo forest, dynamic, traditional Chinese'],
      ['河灯祈福', '古风', 2, 'golden', ['河灯道具', '蹲姿放灯', '夜色倒影'],
       'woman in hanfu placing river lantern on water, kneeling, night reflection, traditional, peaceful'],
      ['楼阁远眺', '古风', 2, 'thirds', ['古楼凭栏', '远眺姿态', '夕阳余晖'],
       'person in hanfu leaning on ancient Chinese pavilion railing, sunset view, traditional, scenic']
    ]
  };

  // 为每个姿势生成完整数据
  themes.forEach(theme => {
    const templates = poseTemplates[theme.id] || [];
    theme.poses = templates.map((tpl, i) => {
      const img = pose(tpl[5], `${theme.id}-${i}`);
      return {
        id: `pose_${theme.id}_${String(i + 1).padStart(3, '0')}`,
        themeId: theme.id,
        title: tpl[0],
        category: tpl[1],
        difficulty: tpl[2],
        reference: img.src,
        referenceFb: img.fb,
        gridType: tpl[3],
        tips: tpl[4],
        cameraParams: {
          focal: tpl[2] >= 3 ? '35mm' : '50mm',
          angle: tpl[2] >= 3 ? 'low_angle' : 'eye_level'
        }
      };
    });
  });

  // ===== 首页 Banner =====
  const banners = [
    {
      id: 'ban_001',
      title: '毕业季 · 定格青春',
      subtitle: '50组精选姿势，记录最好的年华',
      image: themes[0].banner,
      themeId: 'graduation',
      gradient: 'from-indigo-900/80 to-purple-900/40'
    },
    {
      id: 'ban_002',
      title: '旅拍攻略 · 告别游客照',
      subtitle: '100+姿势带你拍出朋友圈爆款',
      image: themes[3].banner,
      themeId: 'travel',
      gradient: 'from-sky-900/80 to-cyan-900/40'
    },
    {
      id: 'ban_003',
      title: '古风汉服 · 国潮出片',
      subtitle: '40+姿势还原东方美学',
      image: themes[7].banner,
      themeId: 'hanfu',
      gradient: 'from-purple-900/80 to-rose-900/40'
    }
  ];

  // ===== 热门姿势（跨专题精选） =====
  const popularPoses = [
    themes[0].poses[0],  // 抛帽
    themes[3].poses[1],  // 背影杀
    themes[1].poses[0],  // 深情对视
    themes[7].poses[0],  // 执伞回眸
    themes[3].poses[4],  // 日落剪影
    themes[1].poses[5],  // 婚纱旋转
    themes[0].poses[4],  // 闺蜜合影
    themes[3].poses[2]   // 跳跃抓拍
  ];

  // ===== 社区广场 feed（类朋友圈信息流） =====
  // 每条帖子：用户分享的出片，附带姿势标题、点赞、评论
  const avatars = [
    t2i('young Chinese woman portrait avatar, friendly smile, soft gradient background', 'square'),
    t2i('young Chinese man portrait avatar, casual style, soft gradient background', 'square'),
    t2i('young Chinese woman with glasses avatar, warm smile, soft gradient', 'square'),
    t2i('young Chinese man with beanie avatar, cool style, soft gradient', 'square'),
    t2i('young Chinese woman with long hair avatar, gentle smile, soft gradient', 'square'),
    t2i('young Chinese man with glasses avatar, intellectual style, soft gradient', 'square')
  ];

  const feed = [
    {
      id: 'post_001',
      user: '阿木', avatar: avatars[0],
      time: '5 分钟前', location: '北京·三里屯',
      image: t2i('fashionable young woman in street style outfit posing at Sanlitun Beijing night, neon lights, urban street photography', 'portrait_4_3'),
      poseTitle: '街角漫步', themeIcon: '✈️', themeColor: '#0EA5E9',
      caption: '第一次在三里屯拍夜景，霓虹灯效果太赞了！跟着「街角漫步」姿势拍出来真的很出片 ✨',
      likes: 128, comments: 24, liked: false
    },
    {
      id: 'post_002',
      user: '小满', avatar: avatars[1],
      time: '23 分钟前', location: '上海·外滩',
      image: t2i('romantic couple prewedding photo at Shanghai Bund at blue hour, skyline background, elegant', 'portrait_4_3'),
      poseTitle: '深情对视', themeIcon: '💒', themeColor: '#E11D48',
      caption: '外滩蓝调时刻真的太出片了！「深情对视」这个姿势安利给所有备婚的姐妹 💕',
      likes: 256, comments: 38, liked: true
    },
    {
      id: 'post_003',
      user: '橙子', avatar: avatars[2],
      time: '1 小时前', location: '杭州·西湖',
      image: t2i('young woman in white hanfu holding oil-paper umbrella by West Lake, misty morning, traditional Chinese aesthetic', 'portrait_4_3'),
      poseTitle: '执伞回眸', themeIcon: '🎭', themeColor: '#9333EA',
      caption: '西湖晨雾配汉服，绝了！「执伞回眸」姿势超适合这种烟雨氛围 🌧️',
      likes: 342, comments: 56, liked: false
    },
    {
      id: 'post_004',
      user: '阿哲', avatar: avatars[3],
      time: '2 小时前', location: '成都·宽窄巷子',
      image: t2i('food photography Sichuan hotpot boiling red broth, steam rising, restaurant, appetizing', 'portrait_4_3'),
      poseTitle: '45度特写', themeIcon: '🍜', themeColor: '#EA580C',
      caption: '宽窄巷子的火锅，用 45 度特写拍出来，馋哭了朋友圈所有人 🌶️',
      likes: 89, comments: 12, liked: false
    },
    {
      id: 'post_005',
      user: '糖糖', avatar: avatars[4],
      time: '3 小时前', location: '厦门·鼓浪屿',
      image: t2i('happy family with child playing on beach at Gulangyu Xiamen, golden hour, lifestyle photography', 'portrait_4_3'),
      poseTitle: '沙滩玩耍', themeIcon: '👶', themeColor: '#F59E0B',
      caption: '带娃来鼓浪屿，跟着「沙滩玩耍」姿势拍了一组，孩子笑得太自然了 🏖️',
      likes: 167, comments: 21, liked: true
    },
    {
      id: 'post_006',
      user: 'Leo', avatar: avatars[5],
      time: '5 小时前', location: '深圳·大梅沙',
      image: t2i('runner on beach at sunrise, athletic motion, dynamic, fitness photography, golden hour', 'portrait_4_3'),
      poseTitle: '跑步起跑', themeIcon: '🏃', themeColor: '#10B981',
      caption: '海边晨跑打卡！「跑步起跑」姿势低角度仰拍，瞬间拉长腿部线条 🏃',
      likes: 76, comments: 9, liked: false
    },
    {
      id: 'post_007',
      user: '柚子', avatar: avatars[0],
      time: '昨天', location: '北京·中国传媒大学',
      image: t2i('graduation photo group of female graduates in academic gowns throwing caps in air, joyful, campus', 'portrait_4_3'),
      poseTitle: '跳拍全班', themeIcon: '🎓', themeColor: '#534AB7',
      caption: '毕业季！全班一起跳拍，瞬间拉满青春感 🎓 再见大学，你好未来！',
      likes: 512, comments: 89, liked: true
    },
    {
      id: 'post_008',
      user: '栗子', avatar: avatars[2],
      time: '昨天', location: '家中',
      image: t2i('cute orange tabby cat sleeping curled up on soft blanket, soft window light, adorable pet photography', 'portrait_4_3'),
      poseTitle: '睡姿萌照', themeIcon: '🐱', themeColor: '#A16207',
      caption: '我家橘子的睡颜，「睡姿萌照」姿势真的治愈一切 🐱 萌化了～',
      likes: 423, comments: 67, liked: false
    }
  ];

  // ===== 我的页面大图封面 =====
  const profileCover = t2i('artistic portrait photography collection, multiple photo frames grid, creative young photographer aesthetic, warm tones', 'landscape_16_9');

  return { themes, spots, filters, banners, popularPoses, feed, profileCover };
})();
