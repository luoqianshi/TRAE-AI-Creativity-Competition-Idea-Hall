(function () {
  var pageThemes = [
    { title: '第 1 页：便当盒收纳', emoji: '🍱', scene: '把小饭团、玉子烧和水果块塞进便当盒，每一步都像整理午餐一样满足。' },
    { title: '第 2 页：猫咪小屋', emoji: '🐱', scene: '给猫爪垫、毛线球和小鱼干找位置，让猫窝恢复软乎乎的秩序。' },
    { title: '第 3 页：冰箱补货', emoji: '🧊', scene: '把牛奶、布丁、蔬菜和小甜点按尺寸归位，补满冰箱的安全感。' },
    { title: '第 4 页：旅行箱拼装', emoji: '🧳', scene: '衣物、相机、拖鞋和纪念品都要刚刚好塞进箱子，像出发前的轻松仪式。' },
    { title: '第 5 页：文具抽屉', emoji: '✏️', scene: '橡皮、便签、胶带和小夹子排排站，把杂乱书桌变成治愈角落。' },
    { title: '第 6 页：甜品橱窗', emoji: '🍰', scene: '蛋糕、马卡龙和曲奇按形状摆进展示柜，满足强迫症式陈列快乐。' },
    { title: '第 7 页：浴室小架', emoji: '🫧', scene: '毛巾、香皂、牙杯和小鸭玩具依次归位，像泡澡前的放松整理。' },
    { title: '第 8 页：花园托盘', emoji: '🌷', scene: '花盆、铲子、种子包和喷壶拼进木托盘，整理出一片掌心花园。' },
    { title: '第 9 页：便利店货架', emoji: '🏪', scene: '饭团、饮料、零食和盲盒整齐上架，享受补货员的治愈瞬间。' },
    { title: '第 10 页：睡前床头柜', emoji: '🌙', scene: '眼罩、书本、夜灯和热牛奶各就各位，收尾一整天的松弛感。' }
  ];

  var gameNames = [
    ['三角饭团入格', '玉子烧连排', '小章鱼香肠', '草莓角落', '海苔卷贴边', '布丁空位', '迷你叉子归位', '番茄圆孔', '蓝莓缝隙', '饭盒盖贴合', '寿司四连块', '胡萝卜斜角', '虾仁弯弯槽', '青豆小圆点', '小熊饭团', '午餐布铺平', '酱料杯嵌入', '生菜边框', '苹果兔耳朵', '便当满格'],
    ['猫爪垫叠叠', '鱼干罐对齐', '毛线球滚入', '纸箱洞口', '逗猫棒收纳', '猫碗半圆位', '铃铛小格', '猫砂铲卡槽', '软垫补角', '猫咪照片墙', '罐头塔排序', '猫耳抱枕', '小鱼骨拼边', '猫窝圆环', '尾巴形缝隙', '午睡毯折叠', '猫薄荷袋', '爪印徽章', '纸袋探头', '猫屋完工'],
    ['牛奶盒竖排', '布丁杯三连', '生菜抽屉', '鸡蛋托盘', '汽水罐横放', '芝士片补位', '草莓盒上架', '小黄瓜直线', '冰棒拼角', '番茄圆阵', '蘑菇小盒', '酱料瓶排序', '饭团冷藏', '酸奶杯对称', '柠檬切片', '冷冻饺子袋', '小蛋糕保鲜', '冰块盒填满', '透明门关闭', '冰箱满满'],
    ['袜子卷卷', '护照夹缝', '相机方格', '拖鞋左右配', '太阳帽圆位', '衬衫折线', '小熊挂件', '洗漱包压缩', '地图折叠', '耳机绕线', '围巾塞角', '雨伞长槽', '纪念杯防撞', '充电器收线', '睡衣软格', '墨镜盒卡扣', '登机牌插袋', '零食边框', '行李牌贴上', '箱子合上'],
    ['铅笔按高矮', '橡皮小方块', '胶带圆环', '回形针归队', '便签分彩', '尺子直槽', '订书机卡位', '小剪刀贴边', '马克笔彩虹', '印章小盒', '便利贴翻页', '圆规尖角', '文件夹排序', '小夹子排排', '修正带转角', '贴纸册收拢', '书签入袋', '铅笔屑盒', '桌面擦亮', '抽屉闭合'],
    ['草莓蛋糕角', '马卡龙渐变', '曲奇圆阵', '奶油裱花', '布丁杯贴边', '甜甜圈套环', '瑞士卷长槽', '小叉子入位', '樱桃点缀', '蛋挞四宫格', '慕斯切块', '糖霜饼干', '纸杯蛋糕', '蜂蜜罐卡位', '巧克力排版', '蛋糕铲平放', '果酱瓶排序', '托盘蕾丝边', '玻璃门轻关', '橱窗点亮'],
    ['毛巾卷入格', '香皂圆角', '牙杯左右配', '牙刷斜插', '小鸭泡泡', '浴盐罐排序', '洗发瓶高低', '海绵软塞', '梳子长槽', '棉签盒补位', '发夹小格', '浴球挂上', '拖鞋并排', '镜面擦净', '护肤瓶贴边', '卷纸塔', '泡泡形拼图', '沐浴刷卡扣', '浴帘扣齐', '浴室清爽'],
    ['花盆三角阵', '喷壶弯嘴', '小铲子长格', '种子包排序', '园艺手套', '蘑菇摆件', '石子小圆阵', '向日葵转盘', '多肉拼盘', '木牌插入', '蝴蝶结绑好', '水滴槽', '藤蔓绕边', '小篱笆拼接', '花剪收纳', '泥土袋压平', '彩虹花标', '蜜蜂停靠', '托盘搬稳', '花园完成'],
    ['饭团三角架', '汽水罐补货', '薯片袋排队', '关东煮格子', '小票夹整理', '糖果罐圆阵', '盲盒上架', '冰柜饮料线', '三明治贴边', '收银硬币', '便当标签', '口香糖小槽', '热饮杯塔', '购物篮归位', '纸袋折叠', '零食吊牌', '招牌灯泡', '货架补满', '店门铃响', '便利店开张'],
    ['夜灯圆位', '眼罩软槽', '睡前书叠放', '热牛奶杯', '星星贴纸', '耳塞小盒', '闹钟归零', '护手霜卡位', '云朵抱枕', '月亮书签', '发圈圆环', '小毯子折好', '香薰石排列', '水杯防倒', '充电线收拢', '日记本合上', '许愿纸条', '拖鞋床边', '灯光调暗', '晚安完成']
  ];

  var detailStarts = ['拖拽', '旋转', '轻点', '滑入', '叠放'];
  var detailEnds = ['没有倒计时，放错也不会惩罚，只会轻轻弹回。', '完成后触发软萌音效和小星星动效。', '适合碎片时间放松，也适合睡前慢慢玩。', '关卡目标清楚，过程强调收纳的秩序感。'];
  var currentPage = 0;

  function buildGames(pageIndex) {
    return gameNames[pageIndex].map(function (name, index) {
      var action = detailStarts[(pageIndex + index) % detailStarts.length];
      var ending = detailEnds[(pageIndex * 3 + index) % detailEnds.length];
      return {
        id: pageIndex * 20 + index + 1,
        name: name,
        desc: action + '小物件，把它放进刚刚好的空位。' + ending
      };
    });
  }

  function renderTabs() {
    var tabs = document.querySelector('[data-tabs]');
    tabs.innerHTML = '';
    pageThemes.forEach(function (theme, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'page-tab' + (index === currentPage ? ' active' : '');
      button.textContent = '第 ' + (index + 1) + ' 页';
      button.setAttribute('aria-pressed', index === currentPage ? 'true' : 'false');
      button.addEventListener('click', function () {
        currentPage = index;
        render();
        document.querySelector('.prototype').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tabs.appendChild(button);
    });
  }

  function renderGames() {
    var theme = pageThemes[currentPage];
    var games = buildGames(currentPage);
    document.querySelector('[data-page-title]').textContent = theme.emoji + ' ' + theme.title;
    document.querySelector('[data-page-scene]').textContent = theme.scene;
    document.querySelector('[data-page-count]').textContent = '小游戏 ' + (currentPage * 20 + 1) + '–' + (currentPage * 20 + 20) + ' / 200';

    var grid = document.querySelector('[data-grid]');
    grid.innerHTML = '';
    games.forEach(function (game, index) {
      var card = document.createElement('article');
      card.className = 'game-card';
      card.style.setProperty('--delay', (index % 10) * 45 + 'ms');
      card.innerHTML = [
        '<div class="game-top">',
        '<span class="game-id">No.' + String(game.id).padStart(3, '0') + '</span>',
        '<span class="game-icon">' + theme.emoji + '</span>',
        '</div>',
        '<h4>' + game.name + '</h4>',
        '<p>' + game.desc + '</p>',
        '<div class="mini-board" aria-hidden="true">',
        '<span></span><span></span><span></span><span></span><span></span>',
        '</div>'
      ].join('');
      grid.appendChild(card);
    });
  }

  function render() {
    renderTabs();
    renderGames();
  }

  document.addEventListener('DOMContentLoaded', render);
})();
