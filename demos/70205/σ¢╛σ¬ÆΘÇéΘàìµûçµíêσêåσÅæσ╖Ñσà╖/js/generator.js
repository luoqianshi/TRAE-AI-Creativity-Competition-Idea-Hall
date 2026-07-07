/**
 * 图媒适配原生文案一键分发工具 - 文案生成引擎 v2
 * 核心改动：去AI味，自然拼接，降低emoji，增加语气停顿
 */

class CopyGenerator {
  constructor() {
    this.usedMemes = new Set();
  }

  pick(arr) {
    if (!arr || arr.length === 0) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  pickN(arr, n) {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
  }

  getMeme(scene) {
    const sceneMemes = MEME_DATABASE[scene] || [];
    const generalMemes = MEME_DATABASE.general || [];
    const pool = [...sceneMemes, ...this.pickN(generalMemes, 3)];

    const available = pool.filter(m => !this.usedMemes.has(m));
    const meme = this.pick(available.length > 0 ? available : pool);
    this.usedMemes.add(meme);
    return meme;
  }

  fillTemplate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : match;
    });
  }

  generateTitle(platform, scene, context) {
    // 使用按场景区分的标题模板
    const scenePatterns = TITLE_PATTERNS[scene] || _TITLE_FALLBACK;
    const patterns = scenePatterns[platform] || scenePatterns.dianping || _TITLE_FALLBACK[platform];
    const pattern = this.pick(patterns);
    const meme = this.getMeme(scene);
    const keyword = context.keyword || SCENE_TYPES[scene]?.label || '探店';
    const price = context.price || this.pick(['58', '88', '128', '168', '98']);
    const location = context.location || this.pick(FILLER_WORDS.location);
    const wait = this.pick(FILLER_WORDS.wait);

    // 部分标题模板会用到 dish（如"这家的{dish}，{keyword}天花板级别了吧"）
    const dishPool = scene === 'cafe' ? FILLER_WORDS.cafe_dish : FILLER_WORDS.dish;
    const dish = context.dish1 || this.pick(dishPool);

    return this.fillTemplate(pattern, { keyword, price, meme, location, wait, dish });
  }

  generateOpening(platform, scene) {
    const templates = OPENING_TEMPLATES[platform] || OPENING_TEMPLATES.dianping;
    const template = this.pick(templates);
    const meme = this.getMeme(scene);
    const keyword = SCENE_TYPES[scene]?.label || '';
    return this.fillTemplate(template, { meme, keyword });
  }

  generateBody(platform, scene, context) {
    const sceneBodies = BODY_TEMPLATES[scene] || BODY_TEMPLATES.food;
    const templates = sceneBodies[platform] || sceneBodies.dianping;

    // 根据字数要求选择对应长度的模板
    // 所有平台模板按 [短, 短, 中, 中, 长] 排列
    const wordCount = context.wordCount || 'auto';
    let candidateTemplates = templates;
    if (templates.length >= 5 && wordCount !== 'auto') {
      if (wordCount === 'short') {
        candidateTemplates = templates.slice(0, 2);   // 前2个是短文案
      } else if (wordCount === 'medium') {
        candidateTemplates = templates.slice(2, 4);   // 中间2个是中等文案
      } else if (wordCount === 'long') {
        candidateTemplates = templates.slice(4);       // 最后是长文案
      }
    }
    const template = this.pick(candidateTemplates);

    const meme = this.getMeme(scene);
    const price = context.price || this.pick(['58', '88', '128', '168', '98']);

    // 菜品/产品 - 咖啡甜品场景用专属菜品
    const dishPool = scene === 'cafe' ? FILLER_WORDS.cafe_dish : FILLER_WORDS.dish;
    const dish = context.dish1 || this.pick(dishPool);
    const dish2 = context.dish2 || this.pick(dishPool.filter(d => d !== dish));
    const dish3 = this.pick(dishPool.filter(d => d !== dish && d !== dish2));
    // 产品 - 按场景选择
    const productPool = scene === 'beauty' ? FILLER_WORDS.beauty_product 
      : scene === 'home' ? FILLER_WORDS.home_product
      : scene === 'shopping' ? FILLER_WORDS.shopping_product
      : FILLER_WORDS.shopping_product;
    const product = context.product || this.pick(productPool);
    const spot = context.spot || this.pick(FILLER_WORDS.spot);
    const spot2 = this.pick(FILLER_WORDS.spot.filter(s => s !== spot));

    // 描述词
    const taste_desc = this.pick(DESC_WORDS.taste);
    const taste_desc2 = this.pick(DESC_WORDS.taste.filter(t => t !== taste_desc));
    const taste_desc3 = this.pick(DESC_WORDS.taste.filter(t => t !== taste_desc && t !== taste_desc2));
    const env_desc = this.pick(DESC_WORDS.env);
    const service_desc = this.pick(DESC_WORDS.service);
    const portion = this.pick(DESC_WORDS.portion);
    const flavor_note = this.pick(DESC_WORDS.flavor_note);
    const occasion = this.pick(DESC_WORDS.occasion);
    const value_note = context.value_note || this.pick(DESC_WORDS.value_note);
    const texture = this.pick(DESC_WORDS.texture);
    const effect = this.pick(DESC_WORDS.effect);
    const skin_type = this.pick(DESC_WORDS.skin_type);
    const color_desc = this.pick(DESC_WORDS.color_desc);
    const negative_note = this.pick(DESC_WORDS.negative_notes_by_scene[scene] || DESC_WORDS.negative_notes_by_scene.food);
    const env_note = this.pick(DESC_WORDS.env_note);
    const duration_note = this.pick(DESC_WORDS.duration_note);
    const spot_desc = this.pick(DESC_WORDS.spot_desc);
    const spot_desc2 = this.pick(DESC_WORDS.spot_desc2);
    const spot_note = this.pick(DESC_WORDS.spot_note);
    const traffic_desc = this.pick(DESC_WORDS.traffic_desc);

    // 其他变量
    const location = context.location || this.pick(FILLER_WORDS.location);
    // tip按场景区分
    const tips_by_scene = {
      food: ['建议提前预约', '工作日去人少', '记得看团购', '早点去不用排队', '停车不太好找', '建议地铁出行', '带件外套空调足', '人均仅供参考'],
      cafe: ['工作日去人少', '记得看团购', '建议地铁出行', '带件外套空调足', '人均仅供参考', '坐窗边光线好'],
      travel: ['建议工作日去', '记得带防晒', '穿舒服的鞋', '带够水', '早点到人少', '停车不太好找', '建议地铁出行'],
      shopping: ['趁活动入手', '记得领券', '比价后再买', '看清楚尺寸', '确认颜色再下单', '留意退换政策'],
      beauty: ['先买小样试试', '确认肤质再入手', '记得做过敏测试', '晚上用效果更好', '搭配同系列用'],
      home: ['量好尺寸再买', '注意材质选择', '散味几天再用', '确认颜色再下单', '安装看视频教程'],
      lifestyle: ['工作日去人少', '记得带防晒', '穿舒服的鞋'],
      pet: ['换粮要循序渐进', '定期体检', '注意驱虫', '多陪伴'],
    };
    const tip = this.pick(tips_by_scene[scene] || tips_by_scene.food);
    // 时长 - 不同场景用不同单位
    const duration = scene === 'cafe' 
      ? this.pick(['一个小时', '两个小时', '一下午', '半天'])
      : scene === 'shopping' || scene === 'beauty' || scene === 'home'
      ? this.pick(['一周', '半个月', '一个月', '两周'])
      : this.pick(['一个小时', '两个小时', '半天']);
    const activity = this.pick(FILLER_WORDS.activity);
    const pet_name = this.pick(DESC_WORDS.pet_name);
    const product_desc = this.pick(DESC_WORDS.product_desc);
    const pro = this.pick(DESC_WORDS.pro);
    const overall_note = this.pick(DESC_WORDS.overall_note);
    const detail1 = this.pick(DESC_WORDS.detail1);
    const detail2 = this.pick(DESC_WORDS.detail2);
    const detail3 = this.pick(DESC_WORDS.detail3);
    const time = this.pick(FILLER_WORDS.time);
    const revisit = this.pick(DESC_WORDS.revisit);
    const rating = (Math.random() * 1 + 3.8).toFixed(1); // 3.8-4.8，不要全是5分

    return this.fillTemplate(template, {
      meme, dish, dish2, dish3, product, spot, spot2, price, location, tip,
      taste_desc, taste_desc2, taste_desc3, env_desc, service_desc, portion,
      flavor_note, occasion, value_note, texture, effect, skin_type, color_desc,
      negative_note, env_note, duration_note, spot_desc, spot_desc2, spot_note,
      traffic_desc, duration, activity, pet_name, product_desc, pro,
      overall_note, detail1, detail2, detail3, time, revisit, rating,
      keyword: SCENE_TYPES[scene]?.label || '',
    });
  }

  generateClosing(platform, scene, context) {
    const templates = CLOSING_TEMPLATES[platform] || CLOSING_TEMPLATES.dianping;
    const template = this.pick(templates);

    const meme = this.getMeme(scene);
    const price = context.price || this.pick(['58', '88', '128', '168', '98']);
    const location = context.location || this.pick(FILLER_WORDS.location);
    const rating = (Math.random() * 1 + 3.8).toFixed(1);

    const hashtagPool = HASHTAG_POOLS[scene] || HASHTAG_POOLS.food;
    // 标签数量少一点，3-5个
    const hashtags = this.pickN(hashtagPool, 3 + Math.floor(Math.random() * 3)).join(' ');

    const value_note = context.value_note || this.pick(DESC_WORDS.value_note);
    // closing里的tip也按场景区分（简化版）
    const closing_tips = {
      food: ['建议提前预约', '工作日人少', '记得看团购', '早点去'],
      cafe: ['工作日人少', '记得看团购', '坐窗边光线好'],
      travel: ['建议工作日去', '记得带防晒', '穿舒服的鞋'],
      shopping: ['趁活动入手', '记得领券', '比价后再买'],
      beauty: ['先买小样试试', '确认肤质再入手'],
      home: ['量好尺寸再买', '散味几天再用'],
      lifestyle: ['工作日人少', '记得带防晒'],
      pet: ['定期体检', '注意驱虫'],
    };
    const tip = this.pick(closing_tips[scene] || closing_tips.food);
    const revisit = this.pick(DESC_WORDS.revisit);

    return this.fillTemplate(template, {
      meme, price, location, rating, hashtags, value_note, tip, revisit,
    });
  }

  /**
   * 随机决定是否在文案中加入语气停顿（30%概率）
   * 模拟真人边想边说的感觉
   */
  maybeAddTone(text) {
    if (Math.random() > 0.3) return text;
    const tone = this.pick(TONE_PUNCTUATIONS);
    // 在第一个句号/换行后插入
    const match = text.match(/[。\n]/);
    if (match && match.index > 5) {
      const pos = match.index + 1;
      return text.slice(0, pos) + tone + text.slice(pos);
    }
    return text;
  }

  /**
   * 按场景构建补充句，用于字数不足时追加
   */
  _buildSupplements(scene, context) {
    const price = context.price || this.pick(['58', '88', '128', '168', '98']);
    const location = context.location || this.pick(FILLER_WORDS.location);
    const dishPool = scene === 'cafe' ? FILLER_WORDS.cafe_dish : FILLER_WORDS.dish;
    const dish = context.dish1 || this.pick(dishPool);

    const supplementsByScene = {
      food: [
        `\n${this.pick(['对了', '另外', '补充一下'])}，${this.pick(DESC_WORDS.env_note || ['环境还行'])}。`,
        `\n${this.pick(['顺便提一句', '还有'])}，${this.pick(DESC_WORDS.value_note || ['性价比还行'])}。`,
        `\n${this.pick(['最后说', '哦对'])}，${this.pick(['记得提前预约', '工作日去人少', '记得看团购', '早点去不用排队'])}。`,
        `\n${this.pick(['多说一句'])}，${dish}${this.pick(DESC_WORDS.taste)}。`,
        `\n${this.pick(['忘说了'])}，服务${this.pick(DESC_WORDS.service)}。`,
      ],
      cafe: [
        `\n${this.pick(['对了', '另外'])}，${this.pick(DESC_WORDS.env_note || ['环境不错'])}。`,
        `\n${this.pick(['顺便提一句'])}，坐了一下午${this.pick(DESC_WORDS.duration_note || ['没被催'])}。`,
        `\n${this.pick(['还有'])}，${this.pick(DESC_WORDS.value_note || ['性价比还行'])}。`,
        `\n${this.pick(['多说一句'])}，${dish}${this.pick(DESC_WORDS.taste)}。`,
      ],
      travel: [
        `\n${this.pick(['对了', '另外'])}，${this.pick(DESC_WORDS.spot_note || ['人还不算多'])}。`,
        `\n${this.pick(['顺便提一句', '还有'])}，${this.pick(['记得带防晒', '穿舒服的鞋', '带够水', '早点到人少'])}。`,
        `\n${this.pick(['补充一下'])}，交通${this.pick(DESC_WORDS.traffic_desc)}。`,
        `\n${this.pick(['最后说'])}，${this.pick(DESC_WORDS.value_note || ['值得'])}。`,
      ],
      shopping: [
        `\n${this.pick(['对了', '另外'])}，${this.pick(DESC_WORDS.value_note || ['性价比还行'])}。`,
        `\n${this.pick(['顺便提一句'])}，${this.pick(['记得领券', '趁活动入手', '比价后再买', '看清楚尺寸'])}。`,
        `\n${this.pick(['还有'])}，${this.pick(DESC_WORDS.pro || ['质感不错'])}。`,
        `\n${this.pick(['多说一句'])}，${this.pick(['物流挺快的', '包装一般', '客服回复挺及时'])}。`,
      ],
      beauty: [
        `\n${this.pick(['对了', '另外'])}，我是${this.pick(DESC_WORDS.skin_type)}，${this.pick(DESC_WORDS.value_note || ['性价比可以'])}。`,
        `\n${this.pick(['顺便提一句'])}，${this.pick(DESC_WORDS.texture || ['质地清爽'])}。`,
        `\n${this.pick(['还有'])}，${this.pick(['先买小样试试', '确认肤质再入手', '晚上用效果更好'])}。`,
        `\n${this.pick(['多说一句'])}，${this.pick(DESC_WORDS.effect || ['效果还行'])}。`,
      ],
      home: [
        `\n${this.pick(['对了', '另外'])}，${this.pick(DESC_WORDS.value_note || ['这个价格值'])}。`,
        `\n${this.pick(['顺便提一句'])}，${this.pick(['量好尺寸再买', '散味几天再用', '安装看视频教程'])}。`,
        `\n${this.pick(['还有'])}，${this.pick(DESC_WORDS.pro || ['颜值在线'])}。`,
        `\n${this.pick(['多说一句'])}，${this.pick(['快递包装可以', '邻居来问链接', '租房党刚需'])}。`,
      ],
      lifestyle: [
        `\n${this.pick(['对了', '另外'])}，${this.pick(DESC_WORDS.overall_note || ['挺好的'])}。`,
        `\n${this.pick(['顺便提一句'])}，${this.pick(DESC_WORDS.detail2 || ['心情挺好'])}。`,
        `\n${this.pick(['还有'])}，${this.pick(['记录一下', '日常碎片', '小确幸'])}。`,
      ],
      pet: [
        `\n${this.pick(['对了', '另外'])}，${this.pick(['体检一切正常', '医生说状态不错', '又胖了半斤'])}。`,
        `\n${this.pick(['顺便提一句'])}，${this.pick(['换粮要循序渐进', '定期体检', '注意驱虫'])}。`,
        `\n${this.pick(['还有'])}，${this.pick(['看到零食就精神了', '毛比之前顺了', '掉毛季到了'])}。`,
      ],
    };
    return supplementsByScene[scene] || supplementsByScene.food;
  }

  /**
   * 根据字数要求调整正文长度
   * short: 50-120字, medium: 120-220字, long: 220-350字, auto: 不限制
   * 超长则截断，偏短则追加细节补充
   */
  adjustWordCount(text, target, scene = 'food', context = {}) {
    if (!target || target === 'auto') return text;

    const ranges = {
      short: [50, 120],
      medium: [120, 220],
      long: [220, 350],
    };
    const range = ranges[target];
    if (!range) return text;

    const len = text.length;
    if (len >= range[0] && len <= range[1]) return text;

    // 超长：在目标上限附近找句子边界截断
    if (len > range[1]) {
      let cut = text.slice(0, range[1]);
      const boundaries = ['。', '\n', '！', '？', '；'];
      let lastBreak = -1;
      for (const ch of boundaries) {
        const pos = cut.lastIndexOf(ch);
        if (pos > lastBreak && pos > range[0] * 0.6) lastBreak = pos;
      }
      if (lastBreak > range[0] * 0.6) {
        return text.slice(0, lastBreak + 1);
      }
      const commaPos = cut.lastIndexOf('，');
      if (commaPos > range[0] * 0.6) {
        return text.slice(0, commaPos + 1);
      }
      return cut;
    }

    // 偏短：追加细节补充到目标范围（按场景生成更贴合的补充句）
    const sceneSupplements = this._buildSupplements(scene, context);
    let adjusted = text;
    let attempts = 0;
    while (adjusted.length < range[0] && attempts < sceneSupplements.length) {
      adjusted += sceneSupplements[attempts];
      attempts++;
    }
    // 如果还是不够，再追加通用补充
    const genericSupplements = [
      `\n${this.pick(['对了', '另外', '补充一下'])}，${this.pick(DESC_WORDS.value_note || ['性价比还行'])}。`,
      `\n${this.pick(['还有', '多说一句'])}，${this.pick(['体验还行', '值得一试', '不踩雷'])}。`,
    ];
    let gi = 0;
    while (adjusted.length < range[0] && gi < genericSupplements.length) {
      adjusted += genericSupplements[gi];
      gi++;
    }
    return adjusted;
  }

  generate(platform, scene, context = {}) {
    this.usedMemes = new Set();

    // 全文共用同一个价格、地点、评价，避免前后矛盾
    const sharedPrice = context.price || this.pick(['58', '88', '128', '168', '98']);
    const sharedLocation = context.location || this.pick(FILLER_WORDS.location);
    // 先决定整体评价倾向，保证正文和结尾一致
    const sharedValueNote = this.pick(DESC_WORDS.value_note);
    const sharedContext = { 
      ...context, 
      price: sharedPrice, 
      location: sharedLocation,
      value_note: sharedValueNote,
    };

    const title = this.generateTitle(platform, scene, sharedContext);
    const opening = this.generateOpening(platform, scene);
    const body = this.generateBody(platform, scene, sharedContext);
    const closing = this.generateClosing(platform, scene, sharedContext);

    // 拼接正文 - 更自然的过渡
    let content;
    if (platform === 'xiaohongshu') {
      // 小红书用换行分段，但不要太多空行
      content = `${opening}\n${body}\n${closing}`;
    } else {
      // 点评/抖音直接拼接，像说话一样
      content = `${opening} ${body} ${closing}`;
    }

    // 随机加入语气停顿增加人味
    content = this.maybeAddTone(content);

    // 根据字数要求调整正文
    const wordCount = context.wordCount || 'auto';
    content = this.adjustWordCount(content, wordCount, scene, context);

    const hashtagPool = HASHTAG_POOLS[scene] || HASHTAG_POOLS.food;
    const hashtags = this.pickN(hashtagPool, 4 + Math.floor(Math.random() * 2));

    return {
      title,
      content,
      hashtags,
      platform,
      scene,
      timestamp: new Date().toISOString(),
    };
  }

  generateAll(scene, context = {}, platforms = ['dianping', 'xiaohongshu', 'douyin']) {
    return platforms.map(platform => this.generate(platform, scene, context));
  }

  regenerate(platform, scene, context = {}) {
    return this.generate(platform, scene, context);
  }
}

const copyGenerator = new CopyGenerator();
