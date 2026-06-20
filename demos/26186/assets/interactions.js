(function () {
  var modal = document.getElementById('demoModal');
  var modalTitle = document.getElementById('modalTitle');
  var modalSub = document.getElementById('modalSub');
  var modalBody = document.getElementById('modalBody');
  var modalClose = document.getElementById('modalClose');

  function phone(content) {
    return [
      '<div class="mini-phone">',
      '<div class="mini-screen">',
      '<div class="mini-status"><span>9:41</span><span>●●● 100%</span></div>',
      content,
      '</div>',
      '</div>'
    ].join('');
  }

  function spec(items, tags) {
    return [
      '<div class="window-spec">',
      items.map(function (item) {
        return [
          '<div class="spec-card">',
          '<h4>' + item.title + '</h4>',
          '<ul>',
          item.points.map(function (point) { return '<li>' + point + '</li>'; }).join(''),
          '</ul>',
          '</div>'
        ].join('');
      }).join(''),
      '<div class="pill-row">',
      tags.map(function (tag) { return '<span class="pill">' + tag + '</span>'; }).join(''),
      '</div>',
      '</div>'
    ].join('');
  }

  var panels = {
    quickCreate: {
      title: '快捷模式：Prompt 模板半屏面板',
      sub: 'Home-Create · 点击「5分钟写个故事」后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>5分钟写个故事</h4>',
          '<p>选择一个灵感模板，AI 会自动生成标题、英文故事和中文释义。</p>',
          '</div>',
          '<div class="sheet">',
          '<div class="sheet-handle"></div>',
          '<h4>今天想写什么？</h4>',
          '<p>选一个模板即可开始，之后还可以微调风格。</p>',
          '<div class="choice-grid">',
          '<div class="choice active">科幻 + 治愈<br><small>120-180 words</small></div>',
          '<div class="choice">职场逆袭<br><small>CEFR A2-B1</small></div>',
          '<div class="choice">悬疑反转<br><small>Plot twist</small></div>',
          '<div class="choice">睡前童话<br><small>Warm tone</small></div>',
          '<div class="choice">旅行偶遇<br><small>Dialogue</small></div>',
          '<div class="choice">校园友情<br><small>Easy words</small></div>',
          '</div>',
          '<button class="demo-btn" style="margin-top:14px">开始生成</button>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['顶部：标题「今天想写什么？」+ 副文案降低心理负担。', '主体：4-6 个模板卡片，展示题材、难度、预计字数。', '底部：固定「开始生成」按钮，未选择时置灰。'] },
          { title: '交互反馈', points: ['模板被选中时卡片高亮并轻微放大。', '点击生成后立即关闭 Sheet，进入 AI 创作中全屏状态。', '如果用户未选择模板，按钮轻微左右抖动并提示「先选一个灵感」。'] }
        ], ['半屏 Sheet', '3 次点击内启动', 'Ability'])
      ].join('')
    },
    customCreate: {
      title: '定制模式：手账卡片式生成表单',
      sub: 'Home-Create · 点击「定制我的故事」后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>定制我的故事</h4>',
          '<p>像拼贴手账一样组合故事元素，不需要从空白处开始。</p>',
          '<div class="form-stack">',
          '<div class="form-field"><label>时间</label><div>傍晚 / After sunset ▾</div></div>',
          '<div class="form-field"><label>地点</label><div>东京小咖啡馆 / Tokyo Café ▾</div></div>',
          '<div class="form-field"><label>人物</label><div>👩 Mei · 中国  +  👨 Lucas · 法国</div></div>',
          '<div class="form-field"><label>冲突盲盒</label><div>收到一封来自未来的信</div></div>',
          '</div>',
          '<button class="demo-btn" style="margin-top:14px">生成我的故事</button>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['采用三张可左右滑动的手账卡：场景、人物、事件。', '时间/地点用下拉选择，人物用头像 + 国籍标签组合。', '事件冲突提供三选一盲盒，同时保留 20 字以内自定义输入。'] },
          { title: '状态规则', points: ['用户至少选择 2 个维度即可生成，避免强制填满。', '每张卡右上角显示「已完成」或「可跳过」。', '生成按钮旁显示预计难度：A2 / B1 / B2。'] }
        ], ['结构化表单', '手账卡片', '低输入压力'])
      ].join('')
    },
    aiLoading: {
      title: 'AI 创作中：全屏毛玻璃等待状态',
      sub: '模板或表单提交后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="loading-scene">',
          '<div>',
          '<div class="quill">✒️</div>',
          '<h4>正在召唤莎士比亚润色…</h4>',
          '<p>AI 正在生成英文故事、中文释义、文化注释和适合加入生词本的关键词。</p>',
          '<div class="pill-row" style="justify-content:center"><span class="pill">预计 8 秒</span><span class="pill">可随时取消</span></div>',
          '</div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['背景：当前页面毛玻璃模糊，避免跳转割裂。', '动效：羽毛笔书写 / 咖啡冒热气二选一轮换。', '文案轮播：「正在找一个漂亮开头」「正在加入地道表达」「正在检查词汇难度」。'] },
          { title: '完成后去向', points: ['成功：自动进入双语阅读与编辑页。', '失败：显示可重试卡片，并保留用户已选择的模板和表单。', '取消：回到上一步，Toast 提示「已保留你的灵感」。'] }
        ], ['毛玻璃', '等待焦虑缓解', '自动跳转'])
      ].join('')
    },
    createSearch: {
      title: '搜索与 Feed：探索入口',
      sub: 'Home-Create · 点击搜索框或 Feed 卡片后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<div class="form-field"><label>搜索</label><div>咖啡 / 职场 / 悬疑</div></div>',
          '<h4 style="margin-top:16px">热门搜索</h4>',
          '<div class="pill-row"><span class="pill">#高分神作</span><span class="pill">#5分钟故事</span><span class="pill">#表达升级</span></div>',
          '<div class="result-card"><h5>The Last Coffee in Tokyo</h5><p>3 mins · ★ 4.8 · 点击可进入故事详情或一键用同款模板创作。</p></div>',
          '<div class="result-card"><h5>Office Parade</h5><p>4 mins · 职场逆袭 · 提供「仿写一个」快捷按钮。</p></div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['顶部搜索框自动聚焦，展示历史搜索与热门 Tag。', '搜索结果分为「故事」「作者」「模板」三类。', 'Feed 卡片详情页应提供「用同款模板创作」转化按钮。'] },
          { title: '交互反馈', points: ['输入时实时联想 Prompt 模板。', '无结果时推荐三个可点击主题，避免空状态。', '点击故事卡片进入详情，点击模板直接进入 AI 生成。'] }
        ], ['搜索页', '模板转化', '探索空间'])
      ].join('')
    },
    cultureNote: {
      title: '文化注释：手撕便签 Sheet',
      sub: 'Editor-Reader · 点击习语高亮后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>Coffee at Midnight</h4>',
          '<p style="font-family:var(--serif);font-size:15px;line-height:1.8">Her task was <span style="background:#c8d6e077;border-bottom:2px wavy var(--blue-mist)">a piece of cake</span>, but the café still felt mysterious.</p>',
          '</div>',
          '<div class="sheet" style="background:linear-gradient(180deg,#fffdf8,var(--bg));border-top:2px dashed var(--rule)">',
          '<div class="sheet-handle"></div>',
          '<h4>📝 a piece of cake</h4>',
          '<p>不是“蛋糕的一块”，而是“非常容易的事”。常用于轻松、自信地描述任务。</p>',
          '<div class="result-card"><h5>使用场景</h5><p>考试很简单：The test was a piece of cake.</p></div>',
          '<button class="demo-btn" style="margin-top:12px">收藏到表达库</button>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['顶部保留当前阅读上下文，不离开阅读页。', 'Sheet 采用手撕便签视觉，包含习语解释、文化来源、使用场景。', '底部提供「收藏到表达库」和「生成 3 个例句」。'] },
          { title: '已收藏状态', points: ['收藏后按钮变为「已在表达库中」。', '右上角出现星星飞入表达库图标动效。', '后台记录原句，便于复习时回到语境。'] }
        ], ['文化注释', '表达库', '语境学习'])
      ].join('')
    },
    wordCapture: {
      title: '生词收录：长按释义气泡',
      sub: 'Editor-Reader · 长按单词后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>Coffee at Midnight</h4>',
          '<p style="font-family:var(--serif);font-size:15px;line-height:1.85">Outside, the rain <u>drizzled</u> on neon signs.</p>',
          '<div class="word-popover" style="position:relative;top:auto;left:auto;margin:20px auto 0;width:238px">',
          '<div class="w-head"><span class="w-en">drizzled</span><span class="w-ipa">/ˈdrɪz.əld/</span></div>',
          '<div class="w-def">v. 毛毛细雨地下；语境义：细雨轻轻落在霓虹灯上。</div>',
          '<span class="w-add">★ 加入生词本</span>',
          '</div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['气泡包含单词、音标、语境释义、加入按钮。', '二次长按已收录词汇时按钮置灰，显示「已在生词本中」。', '自动保存完整原句和故事标题，复习时展示。'] },
          { title: '触感与动效', points: ['长按触发轻微震动。', '加入成功后一颗星星飞入右上角生词本图标。', '底部 Toast：「已加入，明天提醒复习」。'] }
        ], ['长按', '语境释义', '原句抓取'])
      ].join('')
    },
    rewriteSheet: {
      title: '微调：AI 改写指令面板',
      sub: 'Editor-Reader · 点击「微调」后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>当前段落</h4>',
          '<p style="font-family:var(--serif);line-height:1.8">The barista whispered a secret into the foam...</p>',
          '</div>',
          '<div class="sheet">',
          '<div class="sheet-handle"></div>',
          '<h4>你想怎么调整？</h4>',
          '<div class="choice-grid">',
          '<div class="choice active">更简单<br><small>A2 词汇</small></div>',
          '<div class="choice">更地道<br><small>Native tone</small></div>',
          '<div class="choice">更幽默<br><small>Light comedy</small></div>',
          '<div class="choice">更像绘本<br><small>Picture book</small></div>',
          '</div>',
          '<div class="form-field" style="margin-top:12px"><label>自定义指令</label><div>例如：加入一句对话</div></div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['快捷指令：更简单、更地道、更幽默、更像绘本。', '自定义输入框限制 40 字，防止复杂指令。', '底部显示「只改当前段 / 改全文」切换。'] },
          { title: '完成后状态', points: ['展示新旧版本对比，高亮变更句子。', '提供「接受」「撤回」「继续调整」三个按钮。', '若用户发布前未接受变更，系统保留原文。'] }
        ], ['AI 改写', '版本对比', '轻量编辑'])
      ].join('')
    },
    posterMaker: {
      title: '海报生成器：分享预览',
      sub: 'Editor-Reader · 点击「生成海报」后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<div class="poster-preview">',
          '<div><p style="font-family:var(--mono);font-size:10px;opacity:.75">StoryInk · Coffee at Midnight</p><div class="quote">“The rain painted every puddle into a silver lining.”</div></div>',
          '<div style="display:flex;justify-content:space-between;align-items:end"><div><p>by Ada Lin</p><p style="font-size:11px;opacity:.72">4 min English story</p></div><div class="qr-box"></div></div>',
          '</div>',
          '<button class="demo-btn" style="margin-top:14px">保存相册</button><button class="demo-btn" style="margin-top:8px;background:var(--accent2)">转发微信好友</button>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['自动截取故事金句、标题、作者信息。', '底部拼接当前小程序专属二维码。', '可切换 3 套模板：暖咖啡、蓝夜雨、手账纸。'] },
          { title: '分享规则', points: ['保存相册成功后提示「已保存，可发朋友圈」。', '转发微信好友时默认文案：我写了一个 4 分钟英语故事。', '二维码落地页优先打开该故事详情页。'] }
        ], ['海报预览', '二维码', '裂变分享'])
      ].join('')
    },
    discoverFilter: {
      title: '分类筛选：Tag 点击状态',
      sub: 'Discover · 点击分类 Tag 后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<div class="form-field"><label>当前筛选</label><div>#睡前治愈 · 综合排序 ✕</div></div>',
          '<div class="result-card"><h5>The Moon Forgot to Sleep</h5><p>PGC · 3 mins · 温柔低难度词汇。</p></div>',
          '<div class="result-card"><h5>A Cat at the Window</h5><p>UGC ★ · 4 mins · 适合睡前朗读。</p></div>',
          '<div class="result-card"><h5>Cloud Soup</h5><p>AUDIO · 5 mins · 支持逐句跟读。</p></div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['点击 Tag 后列表即时刷新，不跳新页。', '顶部出现筛选说明条，可一键清除。', '排序支持：综合、最新、高赞、短篇优先。'] },
          { title: '动效反馈', points: ['被点击 Tag 变为深色胶囊。', '列表卡片淡入上滑 120ms。', '无内容时推荐相近分类。'] }
        ], ['即时筛选', '分类探索', '低等待'])
      ].join('')
    },
    storyDetail: {
      title: '故事详情页：阅读与读后感',
      sub: 'Discover · 点击故事卡片后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>The Cat Who Lost Its Shadow</h4>',
          '<p style="font-family:var(--serif);font-size:15px;line-height:1.8">On a rainy Paris morning, a little cat woke up and found that its shadow had gone missing...</p>',
          '<div class="comment-box">写一句读后感（50字以内）：<br>这只猫像在找回自己的勇气。</div>',
          '<div class="pill-row"><span class="pill">♡ 点赞 612</span><span class="pill">☆ 收藏</span><span class="pill">用同款模板创作</span></div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['顶部展示封面、标题、作者、阅读时长和难度。', '正文保持纯净阅读体验。', '文末设置「一句话读后感」输入框，限制 50 字以内。'] },
          { title: '转化路径', points: ['点赞后出现轻反馈，收藏后进入个人书房。', '评论发布后展示在故事底部。', '「用同款模板创作」可回流到创作主页并预填模板。'] }
        ], ['详情页', '读后感', '再创作'])
      ].join('')
    },
    audioReader: {
      title: '有声绘本：音频阅读播放器',
      sub: 'Discover · 点击 AUDIO 故事后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>Night Train to Hokkaido</h4>',
          '<p style="font-family:var(--serif);font-size:15px;line-height:1.8">The train hummed softly as snow began to cover the window...</p>',
          '</div>',
          '<div class="sheet">',
          '<div class="sheet-handle"></div>',
          '<h4>🎧 有声朗读</h4>',
          '<p>00:48 / 04:12</p>',
          '<div class="pill-row"><span class="pill">0.8x</span><span class="pill">1.0x</span><span class="pill">1.25x</span><span class="pill">跟读录音</span></div>',
          '<button class="demo-btn" style="margin-top:14px">暂停</button>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['底部播放器包含播放/暂停、进度、语速调节。', '正文逐句高亮，当前朗读句使用柔雾蓝背景。', '可开启跟读录音，录音后返回发音相似度。'] },
          { title: '学习闭环', points: ['跟读错误高频词可加入生词本。', '完成朗读后记录到个人中心阅读量。', '支持后台播放和锁屏控制。'] }
        ], ['有声绘本', '逐句高亮', '跟读'])
      ].join('')
    },
    socialFeedback: {
      title: '社交反馈：点赞与收藏',
      sub: 'Discover Detail · 点击点赞 / 收藏后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>The Cat Who Lost Its Shadow</h4>',
          '<p>♡ 612 → ♥ 613</p>',
          '<div class="result-card" style="text-align:center"><h5>已收藏到个人书房</h5><p>下次可在「我的 · 已收藏」继续阅读。</p></div>',
          '<div class="pill-row"><span class="pill">继续阅读</span><span class="pill">看相似故事</span><span class="pill">分享给朋友</span></div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['点赞：爱心弹跳 + 数字递增。', '收藏：Toast 显示「已收藏到个人书房」。', '首次收藏后推荐 2 个相似故事。'] },
          { title: '边界状态', points: ['重复点击点赞可取消，数字回退。', '网络失败时保留乐观 UI，后台重试。', '未登录用户点击收藏时弹出微信授权提示。'] }
        ], ['轻反馈', '收藏入库', '推荐延展'])
      ].join('')
    },
    calendarDay: {
      title: '创作日历：当天记录 Sheet',
      sub: 'Me · 点击热力图格子后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>创作日历</h4>',
          '<p>点击 06.12 的格子查看当天记录。</p>',
          '</div>',
          '<div class="sheet">',
          '<div class="sheet-handle"></div>',
          '<h4>06.12 学习记录</h4>',
          '<div class="review-card"><div><div class="review-word">阅读</div><div class="review-date">3 篇 · 12 分钟</div></div><span>📚</span></div>',
          '<div class="review-card"><div><div class="review-word">创作</div><div class="review-date">478 words · Coffee at Midnight</div></div><span>✏️</span></div>',
          '<div class="review-card"><div><div class="review-word">生词</div><div class="review-date">+8 词 · 已复习 5 词</div></div><span>★</span></div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['显示当天阅读量、创作字数、生词收集数量。', '若当天有作品，展示作品标题并可点击进入编辑页。', '支持分享当天学习卡片。'] },
          { title: '断签状态', points: ['未完成日期显示「今日未打卡」。', '点击后进入补救任务 Sheet。', '补签成功后热力图格子即时变色。'] }
        ], ['热力图', '学习记录', '补签入口'])
      ].join('')
    },
    assetTabs: {
      title: '我的资产：草稿与已发布切换',
      sub: 'Me · 点击资产 Tab 后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>我的资产</h4>',
          '<div class="p4-tabs"><div class="p4-tab">已发布作品 · 8</div><div class="p4-tab active">草稿箱 · 3</div></div>',
          '<div class="result-card"><h5>Untitled Draft #3</h5><p>152 words · 待完善 · 继续写</p></div>',
          '<div class="result-card"><h5>The Moon Letter</h5><p>89 words · 缺少结尾 · 让 AI 帮我续写</p></div>',
          '<div class="pill-row"><span class="pill">批量删除</span><span class="pill">按时间排序</span></div>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['Tab 切换不跳页，列表内容即时替换。', '草稿项展示「继续写」「AI 续写」「删除」快捷操作。', '已发布项展示「查看数据」「生成海报」「设为私密」。'] },
          { title: '操作反馈', points: ['删除需二次确认，避免误触。', '发布成功后从草稿箱移动到已发布作品。', '空草稿箱展示「从 5 分钟故事开始」按钮。'] }
        ], ['资产管理', '草稿召回', '继续创作'])
      ].join('')
    },
    vocabReview: {
      title: '生词本：艾宾浩斯复习首页',
      sub: 'Me · 点击生词本入口后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>今日复习 · 56 词</h4>',
          '<p>按艾宾浩斯记忆曲线排序，优先复习即将遗忘的词。</p>',
          '<div class="review-card"><div><div class="review-word">drizzle</div><div class="review-date">来自 Coffee at Midnight · 第 2 次复习</div></div><span>🔊</span></div>',
          '<div class="review-card"><div><div class="review-word">whisper</div><div class="review-date">原句回忆 · 明天再现</div></div><span>✍️</span></div>',
          '<div class="review-card"><div><div class="review-word">silver lining</div><div class="review-date">表达库 · 场景复习</div></div><span>★</span></div>',
          '<button class="demo-btn" style="margin-top:14px">开始 5 分钟复习</button>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['今日复习词按遗忘风险排序。', '卡片包含单词、来源故事、原句、复习次数。', '复习方式：听音辨词、看中文回忆英文、原句填空。'] },
          { title: '完成后状态', points: ['每个词可标记「认识 / 模糊 / 不认识」。', '系统根据结果更新下次复习时间。', '完成复习后掌握词汇数增长并回到个人中心。'] }
        ], ['生词复习', '艾宾浩斯', '原句记忆'])
      ].join('')
    },
    streakRepair: {
      title: '断签补救：今日未打卡 Sheet',
      sub: 'Me · 点击「今日未打卡」后',
      html: [
        '<div class="window-grid">',
        phone([
          '<div class="mini-content">',
          '<h4>今日还差一步</h4>',
          '<p>完成任意一个 5 分钟任务，即可保住连续打卡。</p>',
          '</div>',
          '<div class="sheet">',
          '<div class="sheet-handle"></div>',
          '<h4>选择一个补救任务</h4>',
          '<div class="choice-grid">',
          '<div class="choice active">写 1 个微故事<br><small>约 5 分钟</small></div>',
          '<div class="choice">读 1 篇短文<br><small>3-5 分钟</small></div>',
          '<div class="choice">复习 5 个词<br><small>最快完成</small></div>',
          '<div class="choice">听 1 段朗读<br><small>适合睡前</small></div>',
          '</div>',
          '<button class="demo-btn" style="margin-top:14px">开始补救</button>',
          '</div>'
        ].join('')),
        spec([
          { title: '窗口内容', points: ['明确告诉用户「完成任意一个任务即可保住连续打卡」。', '四个任务按耗时与难度排序。', '默认选中最符合 Ability 的“复习 5 个词”或“微故事”。'] },
          { title: '心理机制', points: ['利用损失厌恶降低放弃概率。', '任务小而具体，避免让用户产生负担。', '完成后播放火焰恢复动效并更新连续天数。'] }
        ], ['Prompt', '断签修复', '微任务'])
      ].join('')
    }
  };

  function openPanel(key) {
    var data = panels[key];
    if (!data) return;
    modalTitle.textContent = data.title;
    modalSub.textContent = data.sub;
    modalBody.innerHTML = data.html;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-panel]').forEach(function (button) {
    button.addEventListener('click', function () {
      openPanel(button.getAttribute('data-panel'));
    });
  });

  modalClose.addEventListener('click', closePanel);
  modal.addEventListener('click', function (event) {
    if (event.target === modal) closePanel();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closePanel();
  });
})();
