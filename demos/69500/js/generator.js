/**
 * 城市探险游戏生成器 - 游戏生成引擎
 * 模块 A: 任务模板库调用
 * 模块 B: POI 匹配算法（综合地理可达性、主题相关度、天气适配性、时段开放状态）
 * 模块 C: AI 叙事引擎（故事背景 + 任务包装 + 连贯性检查）
 *
 * 支持两种模式：
 *   1. 预设城市 (cityKey) — 使用内置 POI 数据库
 *   2. 自定义坐标 (customLat/customLng/customCityName) — 动态生成附近 POI
 */
const QuestGenerator = (function () {

  // === 动态生成附近 POI（用于自定义地图选址）===
  var POI_NAME_POOL = {
    ancient: ['古塔', '城门', '祠堂', '古庙', '石桥', '牌坊', '钟楼', '鼓楼', '古戏台', '书院'],
    street: ['老街', '步行街', '夜市', '巷子', '市集', '老巷', '胡同', '石板街', '骑楼街', '美食街'],
    garden: ['公园', '园中园', '花苑', '苗圃', '竹林', '莲池', '盆景园', '梅园', '荷塘', '曲径园'],
    lake: ['湖畔', '湖心亭', '水岸', '荷塘', '曲桥', '码头', '观景台', '水榭', '栈道', '河湾'],
    nature: ['林荫道', '草坪', '湿地', '山径', '植物园', '果园', '茶园', '溪畔', '花田', '绿道'],
    modern: ['广场', '艺术区', '创意园', '商业中心', '观景塔', '科技馆', '美术馆', '音乐厅', '文化中心', '地标']
  };

  var POI_DESC_POOL = {
    ancient: ['始建年代久远，承载着厚重的历史记忆', '建筑风格独特，是当地文化的活化石', '历经沧桑，仍保留着原始的风貌与韵味'],
    street: '充满烟火气的街区，汇聚了本地特色与人文风情',
    garden: '闹中取静的园林，是城市中的一片绿洲',
    lake: '水光潋滟的城市水景，四季皆有不同的美',
    nature: '城市中的自然秘境，让人短暂忘却喧嚣',
    modern: '融合现代设计与城市功能的时尚地标'
  };

  function generateNearbyPOIs(lat, lng, theme, weather, timeSlot, taskCount) {
    // 根据 POI 类型池生成虚拟 POI
    var types = Object.keys(POI_NAME_POOL);
    var pois = [];
    var usedNames = {};

    for (var i = 0; i < taskCount + 2; i++) {
      var type = types[i % types.length];
      var namePool = POI_NAME_POOL[type];
      var nameIdx = Math.floor(Math.random() * namePool.length);
      var name = namePool[nameIdx];

      // 避免重名
      if (usedNames[name]) {
        name = '附近' + name;
      }
      usedNames[name] = true;

      // 在中心点附近随机偏移（约 500m-3km 范围）
      var offsetLat = (Math.random() - 0.5) * 0.03;
      var offsetLng = (Math.random() - 0.5) * 0.03;

      // 确保天气和时段适配
      var weatherOpts = ['sunny', 'cloudy'];
      if (Math.random() > 0.5) weatherOpts.push('rainy');
      var timeOpts = ['day', 'dusk'];
      if (type === 'street' || type === 'modern' || Math.random() > 0.6) timeOpts.push('night');

      pois.push({
        id: 'custom-' + i,
        name: name,
        lat: lat + offsetLat,
        lng: lng + offsetLng,
        type: type,
        themes: [theme, types[(i + 1) % types.length]],
        weather: weatherOpts,
        time: timeOpts,
        desc: typeof POI_DESC_POOL[type] === 'string' ? POI_DESC_POOL[type] : POI_DESC_POOL[type][i % POI_DESC_POOL[type].length]
      });
    }
    return pois;
  }

  // 探险偏好 → POI 类型加成映射
  var PREFERENCE_TYPES = {
    culture: ['ancient', 'street'],
    nature: ['lake', 'nature', 'garden'],
    food: ['street'],
    photo: ['modern', 'garden'],
    leisure: ['garden', 'lake']
  };
  var PREFERENCE_LABELS = {
    culture: '人文历史',
    nature: '自然风光',
    food: '美食探索',
    photo: '摄影打卡',
    leisure: '休闲漫步'
  };

  // === 城市专属主题：每个城市独有的视觉与叙事特征 ===
  var CITY_THEMES = {
    beijing: {
      accentColor: '#c8521e', accent2Color: '#8b6914', bgTint: 'rgba(200,82,30,0.04)',
      title: '帝都寻踪', subtitle: '在皇城根下，寻找被六百年岁月掩埋的秘辛',
      musicMood: '庄严', taskStyle: '历史解谜',
      narrativeFlavor: '古老城墙诉说着王朝更迭，胡同深处藏着不为人知的传说',
      specialTask: '寻找一处只有老北京人才知道的隐秘四合院',
      weatherEffects: { sunny: '金瓦映日', cloudy: '灰墙朦胧', rainy: '雨打琉璃', snowy: '雪覆金銮' }
    },
    shanghai: {
      accentColor: '#e91e63', accent2Color: '#00bcd4', bgTint: 'rgba(233,30,99,0.04)',
      title: '魔都迷局', subtitle: '在十里洋场，追踪一封跨时代的加密信件',
      musicMood: '摩登', taskStyle: '密码破译',
      narrativeFlavor: '石库门的弄堂里回响着老唱片的旋律，外滩的钟声敲响每一个秘密',
      specialTask: '在外滩找到一栋建筑，其门牌号与一个历史年份吻合',
      weatherEffects: { sunny: '江风暖阳', cloudy: '雾锁浦江', rainy: '雨夜霓虹', snowy: '银装魔都' }
    },
    chengdu: {
      accentColor: '#ff8c42', accent2Color: '#5b8c5a', bgTint: 'rgba(255,140,66,0.04)',
      title: '锦城谜踪', subtitle: '在茶香与火锅间，解开三国遗留下的密令',
      musicMood: '悠闲', taskStyle: '文化体验',
      narrativeFlavor: '茶馆里的竹椅上，老人讲述着诸葛亮的锦囊妙计；巷子深处飘来的麻辣香气引人入胜',
      specialTask: '在一家老茶馆找到一位会讲故事的老茶客',
      weatherEffects: { sunny: '暖阳茶香', cloudy: '雾漫蓉城', rainy: '巴山夜雨', snowy: '雪盖锦官' }
    },
    hangzhou: {
      accentColor: '#1abc9c', accent2Color: '#3498db', bgTint: 'rgba(26,188,156,0.04)',
      title: '西湖寻梦', subtitle: '在断桥残雪处，寻找白娘子留下的千年遗物',
      musicMood: '诗意', taskStyle: '诗意寻踪',
      narrativeFlavor: '湖光山色间藏着千年的诗篇，苏堤上的柳枝轻拂着每一段传说',
      specialTask: '在西湖边找到一首与当前位置相关的古诗',
      weatherEffects: { sunny: '水光潋滟', cloudy: '山色空蒙', rainy: '雨打芭蕉', snowy: '断桥残雪' }
    },
    xian: {
      accentColor: '#d48820', accent2Color: '#9b59b6', bgTint: 'rgba(212,136,32,0.04)',
      title: '长安密语', subtitle: '在大唐故地，追寻一卷失落的经书',
      musicMood: '古朴', taskStyle: '考古探秘',
      narrativeFlavor: '城墙的砖缝里藏着唐朝的密码，碑林的石碑上刻着未解的谜题',
      specialTask: '找到一块碑刻，上面有一个你认识的繁体字',
      weatherEffects: { sunny: '金光古城', cloudy: '烟笼长安', rainy: '雨洗碑林', snowy: '雪覆雁塔' }
    },
    nanjing: {
      accentColor: '#3498db', accent2Color: '#e74c3c', bgTint: 'rgba(52,152,219,0.04)',
      title: '金陵旧梦', subtitle: '在秦淮河畔，解开六朝古都的层层谜雾',
      musicMood: '怀旧', taskStyle: '历史寻访',
      narrativeFlavor: '秦淮河水流淌着六朝的旧事，古城墙上每一块砖都记录着一段兴亡',
      specialTask: '找到一处城墙缺口，想象当年的战火',
      weatherEffects: { sunny: '晴波秦淮', cloudy: '雾锁金陵', rainy: '烟雨六朝', snowy: '雪覆钟山' }
    },
    suzhou: {
      accentColor: '#27ae60', accent2Color: '#8e44ad', bgTint: 'rgba(39,174,96,0.04)',
      title: '园林秘境', subtitle: '在粉墙黛瓦间，寻找造园大师隐藏的机关',
      musicMood: '雅致', taskStyle: '空间解谜',
      narrativeFlavor: '假山的叠石中藏着造园的密码，回廊的曲径通幽处暗含玄机',
      specialTask: '在园林中找到一处"框景"，用画框的方式记录下来',
      weatherEffects: { sunny: '光影园林', cloudy: '朦胧水乡', rainy: '雨打芭蕉', snowy: '雪覆飞檐' }
    },
    guangzhou: {
      accentColor: '#e74c3c', accent2Color: '#f39c12', bgTint: 'rgba(231,76,60,0.04)',
      title: '羊城暗语', subtitle: '在骑楼老街，破译一串粤语密码',
      musicMood: '市井', taskStyle: '美食探秘',
      narrativeFlavor: '骑楼的阴影下藏着老广的智慧，早茶的蒸汽中升腾着市井的传奇',
      specialTask: '找到一家老字号，点一道当地特色并了解其来历',
      weatherEffects: { sunny: '暖阳骑楼', cloudy: '雾满珠江', rainy: '暴雨倾城', snowy: '罕见飘雪' }
    }
  };

  // === 故事主线谜团池：贯穿全程的核心目标，配合城市主题润色 ===
  var CENTRAL_MYSTERIES = [
    {
      name: '失落的城市密钥',
      mystery: '寻找失落的城市密钥',
      fragmentClue: '一块刻有古老符文的密钥碎片',
      resolution: '当你将所有碎片拼合，失落的密钥在掌心浮现，城市千年的秘密向你敞开'
    },
    {
      name: '跨越时空的密信',
      mystery: '追踪一封跨越时空的密信',
      fragmentClue: '一页泛黄的信笺残片',
      resolution: '当残页拼成完整的信件，跨越时空的真相终于揭晓，一切谜团豁然开朗'
    },
    {
      name: '破碎的城市记忆之镜',
      mystery: '拼合破碎的城市记忆之镜',
      fragmentClue: '一块映着旧时光的镜片',
      resolution: '当最后一块镜片归位，城市的记忆之镜重新明亮，照见过去也照见未来'
    },
    {
      name: '散落的城市密卷',
      mystery: '还原一卷散落的城市密卷',
      fragmentClue: '一卷残破的密卷片段',
      resolution: '当所有片段连缀成卷，尘封的密语重见天日，城市的隐秘往事在你笔下复活'
    },
    {
      name: '散落的城市星图',
      mystery: '集齐散落的城市星图',
      fragmentClue: '一枚刻着星象的铜片',
      resolution: '当星图拼合完整，头顶的星辰与脚下的城市遥相呼应，指引你走向最终的答案'
    },
    {
      name: '沉睡的城魂之印',
      mystery: '唤醒沉睡的城魂之印',
      fragmentClue: '一枚半掩于岁月的印章残件',
      resolution: '当六枚印纹合而为一，沉睡的城魂缓缓苏醒，低语出这座城最深的秘密'
    }
  ];

  // === 模块 B: POI 匹配算法 ===
  function matchPOIs(cityKey, theme, weather, timeSlot, taskCount, customLocation, preference, energy) {
    var cityPois;

    if (customLocation) {
      // 自定义选址模式：动态生成附近 POI
      cityPois = generateNearbyPOIs(customLocation.lat, customLocation.lng, theme, weather, timeSlot, taskCount);
    } else {
      // 预设城市模式
      var city = POI_DATABASE[cityKey];
      if (!city) return [];
      cityPois = city.pois;
    }

    var center = customLocation
      ? [customLocation.lat, customLocation.lng]
      : POI_DATABASE[cityKey].center;

    // 体力水平影响距离权重：relaxed 偏好紧凑路线，active 允许更远扩散
    var distWeight = 0.1;
    if (energy === 'relaxed') distWeight = 0.22;
    else if (energy === 'active') distWeight = 0.05;

    // 探险偏好对 POI 类型的加成
    var preferredTypes = preference ? (PREFERENCE_TYPES[preference] || []) : [];

    // 硬过滤：天气和时段必须适配
    var candidates = cityPois.filter(function (poi) {
      var weatherOk = poi.weather.indexOf(weather) !== -1;
      var timeOk = poi.time.indexOf(timeSlot) !== -1;
      return weatherOk && timeOk;
    });

    // 放宽过滤补充
    if (candidates.length < taskCount) {
      cityPois.forEach(function (p) {
        if (candidates.indexOf(p) === -1 && p.time.indexOf(timeSlot) !== -1) {
          candidates.push(p);
        }
      });
    }
    if (candidates.length < taskCount) {
      cityPois.forEach(function (p) {
        if (candidates.indexOf(p) === -1) candidates.push(p);
      });
    }

    // 按权重排序（加入随机扰动，确保每次路线不同）
    candidates = candidates.map(function (poi) {
      var themeScore = poi.themes.indexOf(theme) !== -1 ? 1 : 0.2;
      // 偏好加成：若 POI 类型命中探险偏好，主题分上浮
      var prefHit = preferredTypes.indexOf(poi.type) !== -1;
      if (prefHit) themeScore = Math.min(1, themeScore + 0.25);
      var weatherScore = poi.weather.length / 3;
      var timeScore = poi.time.length / 3;
      var dist = Math.sqrt(
        Math.pow(poi.lat - center[0], 2) +
        Math.pow(poi.lng - center[1], 2)
      );
      var distScore = Math.max(0, 1 - dist * 10);
      var prefBoost = prefHit ? 0.08 : 0;
      var weight = themeScore * 0.4 + weatherScore * 0.25 + timeScore * 0.25 + distScore * distWeight + prefBoost;
      var total = Math.min(1, weight);
      // 随机扰动：±15% 的分数波动（仅用于排序，不计入展示分）
      var sortWeight = weight * (0.85 + Math.random() * 0.3);

      // 距离换算为米（1 度约 111 公里）
      var distMeters = Math.round(dist * 111000);

      // 构造人类可读的入选理由
      var reasonParts = [];
      if (themeScore >= 0.95) reasonParts.push('主题高度匹配');
      else if (themeScore > 0.4) reasonParts.push('主题部分相关');
      else reasonParts.push('类型独特、增添路线多样性');

      if (distMeters < 500) reasonParts.push('紧邻起点');
      else if (distMeters < 1500) reasonParts.push('距起点约 ' + distMeters + ' 米');
      else reasonParts.push('距起点约 ' + (distMeters / 1000).toFixed(1) + ' 公里');

      if (weatherScore >= 0.95) reasonParts.push('全天候适配');
      else if (weather === 'rainy') reasonParts.push('适合雨天游览');
      else if (weather === 'sunny') reasonParts.push('适合晴天游览');
      else reasonParts.push('天气适配良好');

      if (prefHit && preference) {
        reasonParts.push('契合「' + PREFERENCE_LABELS[preference] + '」偏好');
      }

      var scores = {
        theme: Number(themeScore.toFixed(2)),
        weather: Number(weatherScore.toFixed(2)),
        time: Number(timeScore.toFixed(2)),
        distance: Number(distScore.toFixed(2)),
        total: Number(total.toFixed(2)),
        reason: reasonParts.join('，')
      };

      return Object.assign({}, poi, { _weight: sortWeight, _scores: scores });
    });

    candidates.sort(function (a, b) { return b._weight - a._weight; });

    // 从前 N+2 个候选中随机选取 N 个，增加多样性
    var poolSize = Math.min(candidates.length, taskCount + 2);
    var topCandidates = candidates.slice(0, poolSize);
    // 随机打乱
    for (var i = topCandidates.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = topCandidates[i];
      topCandidates[i] = topCandidates[j];
      topCandidates[j] = temp;
    }
    var selected = topCandidates.slice(0, Math.max(2, taskCount));

    // 环形排序：以中心点为圆心，按顺时针角度排列，形成绕一圈回到起点的路线
    selected.sort(function (a, b) {
      var angleA = Math.atan2(a.lat - center[0], a.lng - center[1]);
      var angleB = Math.atan2(b.lat - center[0], b.lng - center[1]);
      return angleA - angleB;
    });
    return selected;
  }

  // === 模块 A: 任务模板库调用 ===
  function assignTaskTemplates(pois, theme) {
    var usedTypes = [];
    return pois.map(function (poi, idx) {
      var templates = TASK_TEMPLATES[poi.type] || TASK_TEMPLATES.street;
      var available = templates.filter(function (t) {
        return usedTypes.indexOf(t.type) === -1;
      });
      var pool = available.length > 0 ? available : templates;
      // 随机选择模板（而非固定索引）
      var templateIdx = Math.floor(Math.random() * pool.length);
      var template = pool[templateIdx];
      usedTypes.push(template.type);

      var title = template.title.replace(/\{poi\}/g, poi.name);
      var prompt = template.prompt.replace(/\{poi\}/g, poi.name);

      return {
        seq: idx + 1,
        poiId: poi.id,
        poiName: poi.name,
        poiDesc: poi.desc,
        poiType: poi.type,
        lat: poi.lat,
        lng: poi.lng,
        taskType: template.type,
        taskTypeName: TASK_TYPE_NAMES[template.type] || '探索题',
        taskIcon: TASK_TYPE_ICONS[template.type] || '🧭',
        title: title,
        prompt: prompt,
        verify: template.verify
      };
    });
  }

  // === 模块 C: AI 叙事引擎 ===
  function generateNarrative(theme, pois, weather, timeSlot, duration, party, cityTheme) {
    var engine = NARRATIVE_ENGINE[theme] || NARRATIVE_ENGINE.history;
    var engineTitle = engine.titles[Math.floor(Math.random() * engine.titles.length)];
    var engineIntro = engine.intros[Math.floor(Math.random() * engine.intros.length)];
    var engineEnding = engine.endings[Math.floor(Math.random() * engine.endings.length)];

    // === 故事主线：随机选取一个贯穿全程的核心谜团，并贴合城市主题 ===
    var mystery = CENTRAL_MYSTERIES[Math.floor(Math.random() * CENTRAL_MYSTERIES.length)];
    var centralMystery = mystery.mystery;
    var centralResolution = mystery.resolution;

    // 城市主题融入：用城市叙事风味润色核心谜团
    var cityFlavor = (cityTheme && cityTheme.narrativeFlavor) ? cityTheme.narrativeFlavor : '';
    var cityTitle = (cityTheme && cityTheme.title) ? cityTheme.title : engineTitle;

    // 为每个 POI 任务生成一片"碎片"，串成完整故事线（每片呼应核心谜团）
    var fragments = pois.map(function (poi, idx) {
      return '在「' + poi.name + '」，你寻获了' + mystery.fragmentClue +
        '——这是「' + mystery.name + '」的第 ' + (idx + 1) + ' 片碎片。';
    });

    // 引言：揭开核心谜团，铺设城市氛围
    var mysterySetup = '今日的目标并非寻常漫游——你要' + centralMystery + '。' +
      (cityFlavor ? cityFlavor + '。' : '') +
      '此行每一处地点，都藏有通往真相的一片碎片，唯有集齐，方能破解最终之谜。';

    var weatherNote = '';
    if (weather === 'rainy') {
      weatherNote = '细雨为这场探险蒙上了一层诗意，湿润的青石板路会带给你不同的触感。';
    } else if (weather === 'cloudy') {
      weatherNote = '云层柔和了光线，正是漫步与观察的绝佳条件。';
    } else {
      weatherNote = '晴朗的天空让每一处细节都清晰可见，光线是最好的向导。';
    }

    var timeNote = '';
    if (timeSlot === 'night') {
      timeNote = '夜幕下的城市褪去了喧嚣，显露出白日不曾有的静谧与神秘。';
    } else if (timeSlot === 'dusk') {
      timeNote = '夕阳将建筑染成暖金，这是一天中最富戏剧性的时刻。';
    } else {
      timeNote = '晨光中的城市生机勃勃，每一条街道都在向你展露最真实的一面。';
    }

    // 同行人数 → 叙事风味（不影响 POI 选择，仅润色故事文本）
    var partyNote = '';
    if (party === 'solo') {
      partyNote = '这是一场属于你一个人的独行——孤独是最好的旅伴，让你听见城市最细微的呼吸。';
    } else if (party === 'couple') {
      partyNote = '两人同行，让这条路多了一份共享的温度，每一处转角都值得彼此低语。';
    } else if (party === 'family') {
      partyNote = '全家出游，孩子的好奇心将成为这场探险最珍贵的指南针。';
    } else if (party === 'friends') {
      partyNote = '与朋友并肩，每一个任务都是一次欢声笑语的协作。';
    }

    return {
      gameTitle: cityTitle,
      intro: mysterySetup + ' ' + engineIntro + ' ' + weatherNote + ' ' + timeNote + (partyNote ? ' ' + partyNote : ''),
      ending: centralResolution + ' ' + engineEnding,
      totalTasks: pois.length,
      estimatedDuration: duration,
      storyArc: {
        centralMystery: centralMystery,
        fragments: fragments,
        resolution: centralResolution
      }
    };
  }

  // === 生成策略说明（AI 决策解释总览）===
  function buildGenerationReason(ctx) {
    var p = ctx.params;
    var prefLabel = PREFERENCE_LABELS[p.preference] || '综合探索';
    var partyLabel = ({ solo: '独自探险', couple: '两人同行', family: '家庭出游', friends: '朋友组队' })[p.party] || '探险';
    var energyLabel = ({ relaxed: '轻松', normal: '适中', active: '高强度' })[p.energy] || '适中';

    var prefPart = p.preference ? ('侧重「' + prefLabel + '」偏好、') : '';
    return '围绕「' + ctx.themeName + '」主题与「' + ctx.weatherName + ' · ' + ctx.timeName + '」条件，' +
      '从 ' + ctx.cityName + ' ' + ctx.totalCandidates + ' 个候选中筛选出 ' + ctx.selectedCount + ' 处' +
      prefPart + '地点，规划 ' + ctx.durationName + ' 的环形探险路线。' +
      '该路线适配「' + partyLabel + '」场景与「' + energyLabel + '」体力节奏。';
  }

  // === 模块 C: 故事线连贯性检查 ===
  function checkCoherence(tasks) {
    var issues = [];
    var types = tasks.map(function (t) { return t.taskType; });
    var uniqueTypes = types.filter(function (v, i, a) { return a.indexOf(v) === i; });

    if (uniqueTypes.length < Math.min(3, tasks.length)) {
      issues.push('任务类型多样性不足，建议增加不同认知类型');
    }

    // 环形路线检查：首尾距离应较近（绕一圈回到起点）
    if (tasks.length >= 3) {
      var first = tasks[0];
      var last = tasks[tasks.length - 1];
      var closeDist = Math.sqrt(
        Math.pow(first.lat - last.lat, 2) + Math.pow(first.lng - last.lng, 2)
      );
      if (closeDist > 0.05) {
        issues.push('首尾距离较远，环形路线可能不够紧凑');
      }
    }

    return {
      passed: issues.length === 0,
      issues: issues,
      typeDiversity: uniqueTypes.length + '/' + tasks.length
    };
  }

  // === 模块 D: 因果链系统 ===
  // 每个任务的完成会触发一个"结果"，影响下一个任务
  var CAUSAL_LINKS = [
    { trigger: 'observe', effect: 'discover', text: '你在上一个地点发现了隐藏的线索，指向下一处秘境' },
    { trigger: 'interact', effect: 'unlock', text: '你的互动解锁了当地人的一条秘密通道' },
    { trigger: 'create', effect: 'inspire', text: '你的创作引起了一位老者的注意，他为你指明了方向' },
    { trigger: 'challenge', effect: 'prove', text: '你通过了考验，获得了通往下一站的"通行密语"' },
    { trigger: 'explore', effect: 'reveal', text: '你的探索揭开了被遗忘的故事的一角' },
    { trigger: 'rest', effect: 'energy', text: '稍作停留后你恢复了精力，注意到一条少有人走的小径' },
    { trigger: 'record', effect: 'evidence', text: '你记录的画面成为了解开下一个谜题的关键' },
    { trigger: 'decode', effect: 'truth', text: '你破译的密码揭示了下一段旅程的真正目的' }
  ];

  // 任务间的因果事件模板
  var CAUSAL_EVENTS = [
    { condition: 'photo->any', text: '你拍下的照片中隐藏着一个小细节——路牌上模糊的字迹，指向下一处地点' },
    { condition: 'text->any', text: '你写下的文字让一位路过的老人会心一笑，他说："你也该去看看{nextPoi}"' },
    { condition: 'ai->any', text: '你的作品获得了高分，一位旁观者说："有这般观察力的人，一定能在{nextPoi}发现更多"' },
    { condition: 'count->any', text: '你数到的数字恰好与{nextPoi}的门牌号吻合，这绝非巧合' },
    { condition: 'any->ancient', text: '前方的古建筑在等你已久——它的墙壁上刻着只有完成上一题的人才能解读的符号' },
    { condition: 'any->street', text: '街巷的喧嚣中，有人低声传话："{prevPoi}来的人，{nextPoi}有东西给你"' },
    { condition: 'any->garden', text: '你从上一个地点带来的一片落叶，恰好与{nextPoi}中的那棵古树同种' },
    { condition: 'any->lake', text: '水面的倒影中，你看到了上一站与这一站的奇妙连接' },
    { condition: 'any->nature', text: '风从{prevPoi}的方向吹来，带着花香，引你走向{nextPoi}' },
    { condition: 'any->modern', text: '现代建筑的玻璃幕墙上反射出你刚走过的路线，终点指向这里' }
  ];

  function buildCausalChain(tasks, theme) {
    if (tasks.length < 2) return { links: [], storyFlow: '' };

    var links = [];
    var linkTypes = CAUSAL_LINKS;

    for (var i = 0; i < tasks.length - 1; i++) {
      var cur = tasks[i];
      var next = tasks[i + 1];

      // 选择因果连接类型
      var linkType = linkTypes[Math.floor(Math.random() * linkTypes.length)];

      // 选择因果事件文本
      var verifyKey = cur.verify === '拍照验证' ? 'photo' :
                      cur.verify === 'AI 评分' ? 'ai' :
                      cur.verify === '文字描述' || cur.verify === '开放作答' ? 'text' :
                      cur.verify === '协作验证' ? 'count' : 'any';

      var nextTypeKey = 'any->' + next.poiType;
      var matchedEvents = CAUSAL_EVENTS.filter(function (e) {
        return e.condition === verifyKey + '->any' || e.condition === nextTypeKey || e.condition === 'any->any';
      });

      var eventText = '';
      if (matchedEvents.length > 0) {
        var event = matchedEvents[Math.floor(Math.random() * matchedEvents.length)];
        eventText = event.text
          .replace(/\{prevPoi\}/g, cur.poiName)
          .replace(/\{nextPoi\}/g, next.poiName);
      }

      links.push({
        from: cur.seq,
        to: next.seq,
        trigger: linkType.trigger,
        effect: linkType.effect,
        summary: linkType.text,
        eventText: eventText,
        fromName: cur.poiName,
        toName: next.poiName
      });
    }

    // 生成故事流概述
    var flowParts = links.map(function (l) {
      return l.fromName + ' →(' + l.effect + ')→ ' + l.toName;
    });
    var storyFlow = tasks[0].poiName + ' ' + links.map(function (l) {
      return '⟶ ' + l.toName;
    }).join(' ');

    return {
      links: links,
      storyFlow: storyFlow,
      totalLinks: links.length
    };
  }
  function generate(params) {
    var durationConfig = DURATION_LIST.filter(function (d) { return d.id === params.duration; })[0] || DURATION_LIST[1];
    var taskCount = durationConfig.taskCount;

    // 体力水平调整任务数量：relaxed -1，active +1
    if (params.energy === 'relaxed') taskCount = Math.max(2, taskCount - 1);
    else if (params.energy === 'active') taskCount = taskCount + 1;

    // 判断是预设城市还是自定义选址
    var customLocation = null;
    var cityKey = params.city;
    var cityName = '';

    if (params.customLat && params.customLng) {
      customLocation = { lat: params.customLat, lng: params.customLng };
      cityName = params.customCityName || '自定义位置';
      var nearest = GeoSensor.findNearestCity(customLocation.lat, customLocation.lng);
      if (nearest) cityKey = nearest;
    } else if (POI_DATABASE[params.city]) {
      cityName = POI_DATABASE[params.city].name;
    }

    // 城市专属主题（视觉与叙事特征），未匹配时回退至北京
    var cityTheme = CITY_THEMES[cityKey] || CITY_THEMES.beijing;

    // Step 1: POI 匹配
    var cityPois;
    if (customLocation) {
      cityPois = generateNearbyPOIs(customLocation.lat, customLocation.lng, params.theme, params.weather, params.timeSlot, taskCount);
    } else {
      var city = POI_DATABASE[cityKey];
      cityPois = city ? city.pois : [];
    }
    var totalCandidates = cityPois.length;
    var pois = matchPOIs(cityKey, params.theme, params.weather, params.timeSlot, taskCount, customLocation, params.preference, params.energy);

    // Step 2: 分配任务模板
    var tasks = assignTaskTemplates(pois, params.theme);

    // Step 3: 生成叙事（party 影响故事文本风味，不影响 POI 选择；cityTheme 注入城市主线）
    var narrative = generateNarrative(params.theme, pois, params.weather, params.timeSlot, durationConfig.name, params.party, cityTheme);

    // 将故事主线碎片绑定到对应任务，使每个任务都呼应核心谜团
    tasks.forEach(function (t, idx) {
      if (narrative.storyArc && narrative.storyArc.fragments[idx]) {
        t.storyFragment = narrative.storyArc.fragments[idx];
      }
    });

    // Step 4: 连贯性检查
    var coherence = checkCoherence(tasks);
    if (!coherence.passed && tasks.length > 2) {
      var mid = Math.floor(tasks.length / 2);
      if (tasks.length > 2) {
        var tmp = tasks[mid];
        tasks[mid] = tasks[mid - 1];
        tasks[mid - 1] = tmp;
        tasks.forEach(function (t, i) { t.seq = i + 1; });
      }
      coherence = checkCoherence(tasks);
    }

    // Step 5: 构建因果链
    var causalChain = buildCausalChain(tasks, params.theme);

    // 给每个任务添加因果信息
    tasks.forEach(function (t, idx) {
      if (idx === 0) {
        t.causalRole = 'origin';
        t.causalHint = '探险的起点——一切故事从这里开始';
      } else {
        var link = causalChain.links[idx - 1];
        t.causalRole = 'consequence';
        t.causalFrom = link.from;
        t.causalFromName = link.fromName;
        t.causalTrigger = link.trigger;
        t.causalEffect = link.effect;
        t.causalSummary = link.summary;
        t.causalEvent = link.eventText;
      }
      if (idx === tasks.length - 1) {
        t.causalRole = t.causalRole === 'origin' ? 'solo' : 'finale';
        t.causalHint = t.causalHint || '故事的终章——回到起点，完成环形旅程';
      }
    });

    var center = customLocation
      ? [customLocation.lat, customLocation.lng]
      : (POI_DATABASE[cityKey] ? POI_DATABASE[cityKey].center : [39.9, 116.4]);

    // 追加城市专属特殊任务（贯穿主线的关键一环，集齐碎片后的终极秘令）
    var specialTask = {
      seq: tasks.length + 1,
      poiId: 'special-' + cityKey,
      poiName: cityTheme.specialTask,
      poiDesc: cityTheme.narrativeFlavor,
      poiType: 'special',
      lat: center[0],
      lng: center[1],
      taskType: 'special',
      taskTypeName: cityTheme.taskStyle,
      taskIcon: '⭐',
      title: '【终极秘令】' + cityTheme.specialTask,
      prompt: cityTheme.narrativeFlavor + '。当你集齐所有碎片，完成这最后一步，便能揭开「' +
        (narrative.storyArc ? narrative.storyArc.centralMystery : '城市之谜') + '」的最终真相。',
      verify: '开放作答',
      isSpecialTask: true,
      causalRole: 'special',
      causalHint: '终极秘令——集齐所有碎片，揭开城市的最终真相',
      storyFragment: narrative.storyArc ? narrative.storyArc.resolution : ''
    };
    tasks.push(specialTask);
    // 同步任务总数，使故事面板计数与任务卡片一致
    narrative.totalTasks = tasks.length;

    var themeInfo = THEME_LIST.filter(function (t) { return t.id === params.theme; })[0] || THEME_LIST[0];
    var weatherInfo = WEATHER_LIST.filter(function (w) { return w.id === params.weather; })[0] || WEATHER_LIST[0];
    var timeInfo = TIME_LIST.filter(function (t) { return t.id === params.timeSlot; })[0] || TIME_LIST[0];

    // 构建生成策略说明
    var generationReason = buildGenerationReason({
      params: params,
      cityName: cityName,
      themeName: themeInfo.name,
      weatherName: weatherInfo.name,
      timeName: timeInfo.name,
      durationName: durationConfig.name,
      selectedCount: pois.length,
      totalCandidates: totalCandidates
    });

    // 按最终任务顺序对齐 POI 评分，便于在 AI 决策解释中与任务序号一一对应
    var poiById = {};
    pois.forEach(function (p) { poiById[p.id] = p; });
    var poiScores = tasks.map(function (t) {
      var p = poiById[t.poiId];
      return { name: t.poiName, scores: p ? p._scores : null };
    });

    return {
      meta: {
        city: cityName,
        cityKey: cityKey,
        cityTheme: cityTheme,
        center: center,
        theme: themeInfo.name,
        themeId: params.theme,
        themeIcon: themeInfo.icon,
        weather: weatherInfo.name,
        weatherIcon: weatherInfo.icon,
        weatherId: params.weather,
        weatherTemp: params.weatherTemp || null,
        timeSlot: timeInfo.name,
        timeIcon: timeInfo.icon,
        duration: durationConfig.name,
        generatedAt: new Date().toLocaleString('zh-CN'),
        isCustomLocation: !!customLocation,
        preference: PREFERENCE_LABELS[params.preference] || '综合探索',
        party: ({ solo: '独自探险', couple: '两人同行', family: '家庭出游', friends: '朋友组队' })[params.party] || '探险',
        energy: ({ relaxed: '轻松', normal: '适中', active: '高强度' })[params.energy] || '适中'
      },
      narrative: narrative,
      tasks: tasks,
      causalChain: causalChain,
      coherence: coherence,
      debug: {
        totalCandidates: totalCandidates,
        selectedCount: pois.length,
        poiTypes: pois.map(function (p) { return p.type; }),
        taskTypes: tasks.map(function (t) { return t.taskTypeName; }),
        poiScores: poiScores,
        generationReason: generationReason
      }
    };
  }

  // === 局部重新规划：保留已完成任务，围绕新位置生成后续任务 ===
  // params: 与 generate() 相同的参数（customLat/customLng 作为新中心）
  // completedTasks: 已完成的任务对象数组（保持原序，seq 从 1 开始）
  function reroute(params, completedTasks) {
    completedTasks = completedTasks || [];

    // 以用户当前位置为中心生成全新探险
    var rerouteParams = Object.assign({}, params, {
      customLat: params.customLat,
      customLng: params.customLng,
      customCityName: params.customCityName || '当前位置附近'
    });

    var fresh = generate(rerouteParams);

    // 续编号：新任务 seq 从 已完成数+1 开始
    var newTasks = fresh.tasks.map(function (t, idx) {
      t.seq = completedTasks.length + idx + 1;
      return t;
    });

    // 用续编号后的新任务重建因果链（from/to 与新 seq 对齐）
    var newChain = buildCausalChain(newTasks, params.theme);

    // 重新挂载每个新任务的因果字段
    newTasks.forEach(function (t, idx) {
      if (idx === newTasks.length - 1) {
        t.causalRole = (idx === 0) ? 'solo' : 'finale';
        t.causalHint = '故事的终章——AI 重新规划的终点，等待你的到来';
      } else if (idx > 0) {
        var link = newChain.links[idx - 1];
        t.causalRole = 'consequence';
        t.causalFrom = link.from;
        t.causalFromName = link.fromName;
        t.causalTrigger = link.trigger;
        t.causalEffect = link.effect;
        t.causalSummary = link.summary;
        t.causalEvent = link.eventText;
      }
    });

    // 构建桥接因果链：最后一个已完成任务 -> 第一个新任务
    var bridgeLink = null;
    if (completedTasks.length > 0 && newTasks.length > 0) {
      var lastDone = completedTasks[completedTasks.length - 1];
      var firstNew = newTasks[0];
      var bridgeType = CAUSAL_LINKS[Math.floor(Math.random() * CAUSAL_LINKS.length)];
      bridgeLink = {
        from: lastDone.seq,
        to: firstNew.seq,
        trigger: bridgeType.trigger,
        effect: bridgeType.effect,
        summary: '故事发生了转折——你无意间走入了一条未知的巷子，旧路线已成过往',
        eventText: '你从「' + lastDone.poiName + '」离开后偏离了原定路线，却在「' +
                   firstNew.poiName + '」附近发现了新的线索，命运将你引向一段未知的旅程',
        fromName: lastDone.poiName,
        toName: firstNew.poiName,
        isRerouteBridge: true
      };
      // 第一个新任务以桥接因果作为来源（覆盖原 origin 角色）
      firstNew.causalRole = 'consequence';
      firstNew.causalFrom = bridgeLink.from;
      firstNew.causalFromName = bridgeLink.fromName;
      firstNew.causalTrigger = bridgeLink.trigger;
      firstNew.causalEffect = bridgeLink.effect;
      firstNew.causalSummary = bridgeLink.summary;
      firstNew.causalEvent = bridgeLink.eventText;

      // 最后一个已完成任务不再是终章，降级为中间节点
      if (lastDone.causalRole === 'finale' || lastDone.causalRole === 'solo') {
        lastDone.causalRole = 'consequence';
      }
    }

    // 合并任务
    var mergedTasks = completedTasks.concat(newTasks);

    // 合并因果链：已完成任务内部链 -> 桥接 -> 新任务内部链
    var oldChain = completedTasks.length > 0
      ? buildCausalChain(completedTasks, params.theme)
      : { links: [], storyFlow: '', totalLinks: 0 };
    var mergedLinks = oldChain.links.slice();
    if (bridgeLink) mergedLinks.push(bridgeLink);
    mergedLinks = mergedLinks.concat(newChain.links);

    var storyFlow = mergedTasks.map(function (t) { return t.poiName; }).join(' ⟶ ');
    var mergedCausalChain = {
      links: mergedLinks,
      storyFlow: storyFlow,
      totalLinks: mergedLinks.length
    };

    // 合并后的 meta：以新位置为中心，标记为重新规划
    var mergedMeta = Object.assign({}, fresh.meta, {
      center: [params.customLat, params.customLng],
      isReroute: true,
      reroutedAt: new Date().toLocaleString('zh-CN'),
      completedCount: completedTasks.length
    });

    // 叙事附加转折说明
    var pivotNote = ' 故事发生了转折——你无意间走入了一条未知的巷子，AI 已根据你的当前位置重新规划接下来的旅程。';
    var mergedNarrative = Object.assign({}, fresh.narrative, {
      intro: (fresh.narrative.intro || '') + pivotNote,
      totalTasks: mergedTasks.length
    });

    return Object.assign({}, fresh, {
      meta: mergedMeta,
      narrative: mergedNarrative,
      tasks: mergedTasks,
      causalChain: mergedCausalChain,
      coherence: checkCoherence(mergedTasks)
    });
  }

  return { generate: generate, reroute: reroute };
})();
