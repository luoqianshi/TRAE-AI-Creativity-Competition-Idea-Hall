// ========== Settings ==========
function loadSettings() {
    document.getElementById('btnPositionSetting').value = state.settings.btnPosition;
    document.getElementById('inputModeSetting').value = state.settings.inputMode;
    document.getElementById('sidebarToggleSetting').checked = state.settings.sidebarOpen;
    document.getElementById('webSearchSetting').checked = state.settings.webSearch;
    document.getElementById('aiSpeedSetting').value = state.settings.aiSpeed;
    document.getElementById('loginNotifySetting').checked = state.settings.loginNotify;
    document.getElementById('fontFamilySetting').value = state.settings.fontFamily || "'Noto Sans SC', sans-serif";
    const sendModeEl = document.getElementById('sendModeSetting');
    if (sendModeEl) sendModeEl.value = state.settings.sendMode || 'ctrl_enter';
    // Load theme preference
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const isLight = localStorage.getItem('theme') === 'light';
        if (isLight) {
            themeToggle.classList.add('active');
            document.documentElement.classList.add('light-theme');
        }
    }
    applySettings();
    updateProfileUI();
    renderPreferencesList();
    if (typeof AvatarFrameSystem !== 'undefined') {
        AvatarFrameSystem.renderFrameSelector();
    }
    // Render level panel
    if (typeof LevelSystem !== 'undefined') {
        var levelPanel = document.getElementById('levelPanel');
        if (levelPanel) {
            levelPanel.innerHTML = LevelSystem.renderLevelPanelCompact() + '<div style="margin-top:12px;text-align:center;"><button class="btn-secondary" onclick="LevelSystem.openLevelModal()">查看完整等级详情</button></div>';
        }
    }
}

function saveSetting(key, value) {
    state.settings[key] = value;
    applySettings();
    StorageManager.saveSettings(state.settings);
    showToast('success', '设置已保存');
}

function sendFeedback() {
    const feedback = document.getElementById('feedbackText').value.trim();
    if (!feedback) {
        showToast('warning', '请输入问题描述');
        return;
    }
    const subject = encodeURIComponent('智学空间问题反馈');
    const body = encodeURIComponent('问题描述：\n' + feedback + '\n\n---\n设备信息：' + navigator.userAgent);
    window.location.href = 'mailto:lanxi_lanranyi@qq.com?subject=' + subject + '&body=' + body;
    showToast('success', '正在打开邮件客户端...');
}

function applySettings() {
    // Apply button position - target ALL chat-actions elements
    var allChatActions = document.querySelectorAll('.chat-actions');
    for (var i = 0; i < allChatActions.length; i++) {
        allChatActions[i].style.justifyContent = state.settings.btnPosition === 'right' ? 'flex-end' :
                                                   state.settings.btnPosition === 'left' ? 'flex-start' : 'center';
    }

    // Apply input mode
    var inputArea = document.querySelector('.chat-input-area');
    if (inputArea) {
        if (state.settings.inputMode === 'slide') {
            inputArea.classList.add('collapsed');
            inputArea.onclick = function(e) {
                if (inputArea.classList.contains('collapsed')) {
                    inputArea.classList.remove('collapsed');
                    e.stopPropagation();
                }
            };
        } else if (state.settings.inputMode === 'overlay') {
            inputArea.classList.add('overlay-mode');
            inputArea.classList.remove('collapsed');
            inputArea.onclick = null;
        } else {
            inputArea.classList.remove('collapsed');
            inputArea.classList.remove('overlay-mode');
            inputArea.onclick = null;
        }
    }

    // Apply sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        if (state.settings.sidebarOpen) {
            sidebar.classList.add('open');
        } else {
            sidebar.classList.remove('open');
        }
    }

    // Apply font family
    if (state.settings.fontFamily) {
        document.body.style.fontFamily = state.settings.fontFamily;
    }
}

function clearAllData() {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
        StorageManager.clearUserData();
        state.notes = [];
        state.subjects.forEach(s => { s.errors = []; s.chats = {}; });
        state.chatHistories = {};
        renderNotes();
        renderErrors();
        renderChatHistory();
        updateErrorCount();
        showToast('success', '所有数据已清除');
    }
}

function resetSidebarWidth() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggleOuter');
    const toggleIcon = document.getElementById('sidebarToggleIcon2');
    if (sidebar) {
        sidebar.style.width = '';
        sidebar.style.minWidth = '';
        sidebar.classList.remove('collapsed');
        if (toggleIcon) toggleIcon.className = 'fas fa-chevron-left';
        if (toggleBtn) toggleBtn.style.left = '260px';
        showToast('success', '侧边栏已恢复默认宽度');
    }
}

// ========== Dynamic Modal (for showVersionHistory etc.) ==========
function showModal(title, contentHtml) {
    // Remove any existing dynamic modal
    const existing = document.getElementById('dynamicModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = 'dynamicModal';
    overlay.style.display = 'flex';
    overlay.innerHTML =
        '<div class="modal" style="max-width:550px;">' +
            '<div class="modal-header">' +
                '<h2>' + title + '</h2>' +
                '<button class="modal-close" onclick="closeModal(\'dynamicModal\')">&times;</button>' +
            '</div>' +
            '<div class="modal-body">' + contentHtml + '</div>' +
        '</div>';

    document.body.appendChild(overlay);
    // Click overlay to close
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal('dynamicModal');
        }
    });
}

function parseVersion(versionStr) {
    var parts = String(versionStr).split('.');
    return {
        major: parseInt(parts[0] || '0', 10) || 0,
        minor: parseInt(parts[1] || '0', 10) || 0,
        patch: parseInt(parts[2] || '0', 10) || 0
    };
}

function compareVersions(v1, v2) {
    var a = parseVersion(v1);
    var b = parseVersion(v2);
    if (a.major !== b.major) return a.major > b.major ? 1 : -1;
    if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
    if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;
    return 0;
}

function getVersionBadge(prevVersion, currVersion) {
    var prev = parseVersion(prevVersion);
    var curr = parseVersion(currVersion);
    if (curr.major !== prev.major) {
        return '<span style="display:inline-block;background:linear-gradient(90deg,#ff6b6b,#feca57);color:#fff;font-size:11px;padding:2px 8px;border-radius:8px;margin-left:6px;vertical-align:middle;">大版本更新</span>';
    }
    if (curr.minor !== prev.minor) {
        return '<span style="display:inline-block;background:linear-gradient(90deg,#48dbfb,#0abde3);color:#fff;font-size:11px;padding:2px 8px;border-radius:8px;margin-left:6px;vertical-align:middle;">小版本更新</span>';
    }
    return '<span style="display:inline-block;background:linear-gradient(90deg,#1dd1a1,#10ac84);color:#fff;font-size:11px;padding:2px 8px;border-radius:8px;margin-left:6px;vertical-align:middle;">修复更新</span>';
}

function showVersionHistory() {
    const changelog = [
        { version: '4.4.0', date: '2026-06-19', changes: [
            '安全修复：用户消息HTML注入防护（escapeHtml转义，AI回复Markdown格式不受影响）',
            '安全修复：AI日志面板detail参数转义防护',
            '功能新增：功能咨询AI助手（覆盖功能概览/快捷键/头像框/等级/游戏/数据保存6大模块）',
            '功能新增：侧边栏"功能咨询"入口，点击进入咨询模式',
            '优化：天气回复统一为友好引导（建议查看天气App+引导学习天气知识）',
            '优化：咨询类路由添加防重复检测'
        ] },
        { version: '4.3.1', date: '2026-06-19', changes: [
            '修复：错题量显示0/0/0（添加localStorage fallback读取，init时自动更新徽章）',
            '修复：等级/经验信息未保存（改为按用户ID隔离存储level_data_{userId}）',
            '修复：等级数据从旧全局key自动迁移到用户隔离key',
            '功能新增：学习卡片添加难度标签（简单/中等/困难，三色显示）',
            '功能新增：知识点卡片库移到学习卡片主页（可折叠展开，显示各科目卡片数）',
            '功能新增：创建卡片时可选难度等级',
            '优化：回答检测排除列表扩展（添加学习卡片操作词）',
            '优化：切换到学习卡片页面时自动更新错题徽章'
        ] },
        { version: '4.3.0', date: '2026-06-18', changes: [
            '功能新增：8个科目49张预置知识点卡片（数学/英语/语文/物理/化学/生物/历史/地理）',
            '功能新增：学习卡片"导入知识点"按钮（一键导入科目专属卡片，自动去重）',
            '功能新增：已掌握卡片"重新复习"按钮（手动将已掌握卡片重新加入复习队列）',
            '功能新增：文件上传问题解决（支持txt/md/csv/json/html/css/js/py/pdf/doc/xls等格式）',
            '功能新增：输入工具栏文件上传按钮（📎图标）',
            '修复：图片上传预览定位BUG（隐藏file input避免遮挡预览图片）',
            '优化：文件上传后自动识别类型并生成AI提问前缀'
        ] },
        { version: '4.2.1', date: '2026-06-18', changes: [
            '修复：头像框装备错误（聊天中改用applyFrame创建子元素覆盖层，匹配CSS选择器）',
            '工作者：文档编辑器AI真正接入（调用generateWorkerResponse替代固定文本）',
            '工作者：错别字检查扩展（从3组扩展到15组常见错别字）',
            '工作者：项目管理数据持久化（文件增删改后自动保存到localStorage）',
            '工作者：快捷功能已全部接入AI对话（开发/PPT/视频/写作/计划/表格面板）'
        ] },
        { version: '4.2.0', date: '2026-06-18', changes: [
            '功能新增：8种新特效头像框（极光/熔岩/海洋/森林/银河/龙焰/水晶/赛博）',
            '功能新增：头像框总数达29种（13种免费 + 7种等级解锁 + 2种成就解锁 + 2种稀有 + 5种特效免费）',
            '功能调整：开发阶段大部分头像框设为免费使用',
            '功能修复：侧边栏收展按钮彻底修复（区分移动端/桌面端，明确三种状态判断）',
            'UI优化：8种新头像框CSS动画特效（极光旋转/熔岩流动/海洋波浪/森林飘叶等）'
        ] },
        { version: '4.1.1', date: '2026-06-18', changes: [
            '修复：AvatarFrameSystem未定义时对话头像渲染报错（添加typeof检查）',
            '修复：learning-game.js重复函数定义导致游戏启动异常（删除第二套重复函数）',
            '修复：脚本加载顺序调整（avatar-frame.js移至interactions.js之前）',
            '修复：页面刷新后历史消息头像框不显示（init.js中添加刷新逻辑）',
            '修复：chat-avatar全局overflow:visible导致头像溢出（改为.has-frame条件触发）',
            '优化：回答检测排除列表扩展（新增40+日常对话/游戏控制短语）',
            '优化：移动端头像框尺寸适配（480px以下缩小为30x30px）'
        ] },
        { version: '4.1.0', date: '2026-06-18', changes: [
            '功能新增：8种新头像框（冰霜/雷电/樱花/暗影/神圣/学霸/夜猫子/连胜）',
            '功能新增：头像框成就解锁系统（答题100道/夜间学习/游戏5连胜）',
            '功能修复：学习游戏18个全部可正常启动和游玩',
            '功能修复：游戏类型名称统一（poetry/feihua/chem_eq/grammar/timeline等别名兼容）',
            'UI修复：侧边栏收展按钮在调整列宽后仍可正常控制',
            'UI修复：对话中用户头像框正确显示（存储同步到用户对象）',
            '优化：头像框CSS动画效果（冰霜结晶/雷电脉冲/樱花飘落等）'
        ] },
        { version: '4.0.0', date: '2026-06-18', changes: [
            '重大更新：AI智能回答系统全面升级',
            'AI新增：回答检测与验证系统（判断题/选择题/问答题自动验证）',
            'AI新增：上下文感知对话（记住上下文，智能判断用户意图）',
            'AI新增：图片问答智能引导（根据文字描述推断图片科目）',
            'AI新增：完整元素周期表可视化（CSS Grid布局，40+元素数据）',
            'AI新增：周期律趋势讲解（原子半径/电负性/金属性变化规律）',
            'AI新增：数学集合运算（交集/并集/补集）和组合数C(n,k)计算',
            'AI新增：生活场景覆盖（购物/交通/旅游/理财/社交/健康/学习规划/家居）',
            'AI新增：AI出题功能增强（语文古诗题库扩展、数学/英语/物理/化学出题）',
            'AI新增：内置知识库扩展（判断题30+条、问答题15+条、化学公式4条）',
            'AI修复：垂直线斜率计算公式修正',
            'AI修复：英语过去式引号处理',
            'AI修复：翻译内容提取（正确识别引号内文本）',
            'AI修复：化学公式名称查询路由',
            'AI修复：中文炼字分析路由',
            'UI修复：对话中用户头像框正确显示（addMessage + renderChatHistory）',
            'UI修复：学习游戏列表从4个补全为18个（含诗词飞花令/化学方程式配平等）',
            'UI优化：全面界面美化和交互优化',
            '版本号更新至v4.0.0，操作指南内容同步更新'
        ] },
        { version: '3.2.2', date: '2026-06-18', changes: [
            '修复：聊天操作按钮（复制/修改/分享/删除/反应）功能完善',
            '修复：消息时间戳显示格式统一',
            '修复：侧边栏折叠状态下科目按钮文字隐藏',
            '修复：快速笔记关闭后残留样式清理',
            '优化：AI回答排版优化（列表/表格/代码块间距调整）',
            '优化：输入框placeholder根据当前科目动态变化',
            '优化：设置页各区块折叠/展开交互'
        ] },
        { version: '3.2.1', date: '2026-06-18', changes: [
            '修复：AI回答中HTML标签转义处理（防止XSS）',
            '修复：错题本保存时特殊字符编码问题',
            '修复：闪卡翻转动画在移动端卡顿',
            '修复：记事本标签筛选不生效的问题',
            '修复：文件管理器重命名文件后列表不刷新',
            '优化：AI思考过程展示动画流畅度',
            '优化：学习统计图表渲染性能',
            '优化：科目切换时聊天记录加载速度'
        ] },
        { version: '3.2.0', date: '2026-06-18', changes: [
            'AI深度优化：回答结构化增强（分步骤→关键公式→总结归纳）',
            'AI深度优化：数学解题过程更详细（每步附说明）',
            'AI深度优化：英语语法分析更精准（时态/语态/从句识别）',
            'AI深度优化：语文阅读理解答题模板优化',
            'AI新增：自动识别题目难度并调整回答深度',
            'AI新增：公式自动渲染（支持分数/根号/上下标）',
            'AI新增：代码块语法高亮（支持Python/JavaScript/HTML/CSS）',
            '题库扩展：数学新增解析几何/导数应用/概率分布共45道',
            '题库扩展：英语新增完形填空/阅读理解共30道',
            '题库扩展：物理新增电磁感应/光学计算共25道',
            '题库扩展：化学新增化学平衡/电化学计算共20道',
            'UI新增：消息气泡打字机效果（逐字显示AI回答）',
            'UI新增：AI回答中的可折叠详情区域',
            'UI优化：聊天气泡样式细化（用户/AI差异化设计）',
            'UI优化：深色模式下代码块和公式对比度提升',
            '修复：长消息自动换行和滚动条显示',
            '修复：多轮对话上下文丢失问题'
        ] },
        { version: '3.1.6', date: '2026-06-18', changes: ['修复：等级条点击弹出小型弹窗（不跳转设置页）', '修复：图片上传区域默认隐藏，仅在图片模式时显示', '修复：聊天操作按钮尺寸缩小（更紧凑）', '修复：AI按钮位置设置现在正确生效', '修复：输入框模式设置现在正确生效（含overlay模式）', '新增：学习游戏按钮移到聊天头部工具栏', '新增：快速笔记支持拖动（鼠标+触摸）', '优化：快速笔记标题栏显示拖动光标'] },
        { version: '3.1.5', date: '2026-06-18', changes: ['AI思考增强：可视化思考路径（→连接各步骤）、证明/实验/作文专属框架', 'AI理解增强：新增公式推导/比较分析/实例需要检测，问题分类准确率提升', 'AI回复增强：追问响应（继续/然后呢）、错误纠正（先道歉再更正）、点赞响应（感谢+深入）', 'AI命令增强：新增画图表/编题/划重点/做规划4个命令', 'AI输出增强：自动编号❶❷❸、层次缩进、分割线、引用块格式', 'AI知识体系：新增35条知识点（细分学科+学习方法+考试技巧）', '游戏扩展：飞花令新增5关键字、化学方程式+15道', '新增第14种游戏：英语语法填空（34道题）', '新增第15种游戏：历史时间线（52个事件）', '题库扩展：9科目×4难度共新增132道题（含challenge难度）', '主题适配：深色/浅色主题变量统一，平滑过渡动画', '移动端适配：480px完整覆盖、safe area、触控44px', '加载状态：骨架屏系统+多色Loading过度', '交互反馈：按钮点击缩放0.97、切换开关弹跳动画、卡片hover提升', 'UI修复：聊天长消息滚动/弹窗溢出/侧边栏折叠', 'HTML优化：32个脚本均加defer、150+aria标签、meta标签优化'] },
        { version: '3.1.4', date: '2026-06-18', changes: ['UI修复：将截图上传标签改为上传图片', 'UI修复：聊天搜索栏样式美化', 'UI修复：快捷键帮助tooltip样式美化', 'AI深度优化：思考能力增强（假设验证/反例/类比/归纳，学科专属步骤）', 'AI深度优化：理解能力增强（实体识别/意图识别/多步骤检测）', 'AI深度优化：回复能力增强（核心答案→详细解释→总结结构）', 'AI深度优化：输出能力增强（数学公式美化/代码块语言标签/自动emoji标注）', 'AI深度优化：新增6个实用命令（总结要点/对比区别/举3个例子/用表格整理/画图说明/简单解释）', 'AI深度优化：交流互动增强（学习陪伴/时段化关心/7种情绪感知/共情回应）', 'UI美化：全局动画优化（页面过渡/弹窗缩放/消息弹性滑入）', 'UI美化：聊天区域美化（用户消息阴影/AI消息彩色边框/代码块语法高亮/引用块竖线）', 'UI美化：z-index层级系统/模态框遮罩/滚动条美化/响应式适配', '游戏扩展：词语接龙+100词、成语+100个、谜语+100个、拼写+300词、问答+100题、逻辑+20题', '新增第12种游戏：诗词飞花令（10关键字×20诗句）', '新增第13种游戏：化学方程式配平（20道方程式）'] },
        { version: '3.1.3', date: '2026-06-18', changes: ['UI修复：头像框分类展开后分格子排列显示', 'UI修复：特殊字符面板完整显示（修复空白问题）', 'UI优化：建议chip按钮样式（suggestion-chip/topic-chip/reaction-chip）', 'UI优化：输入区额外按钮样式统一（附件/特殊字符/语音）', 'UI优化：聊天操作按钮样式（发送/清空）', 'UI优化：快捷工具按钮样式（计算器/绘图板/笔记/指南）', 'UI优化：科目按钮和咨询按钮样式统一', 'UI优化：输入标签页样式（文字/图片/截图）', 'UI优化：图片上传区域样式', 'UI优化：AI日志面板按钮样式', 'CSS全面补充：补全所有缺失的UI组件样式'] },
        { version: '3.1.2', date: '2026-06-18', changes: ['UI修复：经验条样式恢复正常显示', 'UI修复：头像框分类默认收起，展开后显示完整特效', 'UI优化：修改密码区域样式美化', 'UI修复：学习游戏按钮和游戏列表样式统一', 'UI修复：快速笔记背景不再透明，可正常拖动', 'UI修复：特殊字符面板添加背景色', 'AI交流增强：天气问候、节日祝福、日常闲聊、鼓励打气', 'AI互动增强：个性化问候（时间/等级）、猜谜、脑筋急转弯、冷知识', 'AI问答增强：新增55条学科知识点（数/物/化/生/语/英/史/地/政）', 'AI思考增强：6步详细思考流程，按科目和问题类型定制', 'AI理解增强：新增证明题/实验题/阅读理解/作文指导/翻译/评价/总结检测', '题库扩展：9个科目各新增30+道题目，共270+道', '游戏扩展：词语接龙+30词、成语+20个、谜语+20个、拼写+20词、问答+30题', '新增第10种游戏：数独挑战（4x4/9x9）', '新增第11种游戏：逻辑推理（20+逻辑题）', '网络搜索增强：新增3个CORS代理、缓存优化、关键词提取、摘要生成、智能回退'] },
        { version: '3.1.1', date: '2026-06-18', changes: ['修复头像框切换：再次点击已选头像框可切换回无框', '修复头像框显示：改为绝对定位边框覆盖，不破坏头像内容', '头像框添加分类收展：基础框/等级框/成就框三大分类', '等级条点击打开独立经验窗口', '设置页等级改为精简版+查看详情按钮', '新增学习打卡系统（日历视图+连续打卡奖励）', '新增学习计时器（番茄钟25+5分钟）', 'AI新增动态打字延迟（根据回答长度调整）', 'AI新增话题切换检测和过渡语', 'AI新增智能不理解引导（Did you mean建议）', 'AI新增可折叠详情区域和延伸阅读', 'AI新增情感智能（挫折检测+成就庆祝）', 'AI新增命令：复习上次/换个例子/简单点/详细点/用图解释', '数学新增立体几何/平面向量/复数/数学归纳法/微积分/概率分布/线性规划/数学建模', '英语新增听力技巧/口语表达/英语文化/学术英语/词根词缀/谚语格言/修辞手法/翻译技巧', '语文新增修辞手法大全/文学常识/汉字演变/书法基础/对联文化/方言/新闻阅读/演讲辩论', '物理新增电磁感应/简谐振动/相对论/电磁波/原子结构', '化学新增元素周期律/化学键/化学平衡/电化学/配位化合物', '生物新增DNA复制/神经调节/免疫调节/植物激素/种群群落', '历史新增四大发明/两次大战/冷战/改革开放/文明交流', '政治新增中国特色社会主义/市场经济/国际关系/依法治国/新发展理念', '地理新增地球运动/水循环/人口城市化/地质作用/农业区位', '网络搜索新增TTL缓存24小时/中文分词/结果排序/来源多样性'] },
        { version: '3.1.0', date: '2026-06-18', changes: ['新增等级经验系统（LV.0-LV.50，三角数公式升级）', '等级称号系统（萌新→新手入门→初学者→活跃学习者→勤奋学生→进阶学者→学习精英→知识大师→学霸传说）', '经验获取：提问+10、答对+20、答错+5、每日登录+30、游戏+15、获胜+30', '每周经验上限5000 XP，自动重置', '连续登录奖励（每7天+50 XP）', '侧边栏显示等级和XP进度条', '设置页等级面板（统计数据+经验获取方式列表）', '升级动画效果（金色光晕脉冲）', '头像框添加等级解锁（铜LV.3/霓虹蓝LV.5/霓虹紫LV.10/烈焰LV.15/彩虹LV.25/皇冠LV.35/钻石LV.45）', '新增传说之框（LV.50解锁）', 'AI新增话题推荐系统（回答后推荐2-3个相关话题chip）', 'AI新增连续答对鼓励（3/5/10题递进式鼓励）', 'AI答对/答错反馈优化（更友好的语气+知识点解析）', 'UI全面美化：聊天气泡渐变+彩色边框', 'UI美化：侧边栏渐变背景+紫色边框', 'UI美化：输入框聚焦紫色光晕', 'UI美化：科目按钮扫光动画+激活态渐变', 'UI美化：弹窗圆角+滑入动画+深阴影', 'UI美化：快捷工具hover上浮效果', '数学新增导数进阶/概率统计进阶/解析几何/线性代数/竞赛数学', '英语新增倒装句/虚拟语气进阶/独立主格/阅读技巧/写作技巧/文化常识', '语文新增文言文翻译/古诗词鉴赏/现代文阅读/高考作文技巧', '网络搜索新增Bing搜索引擎', '搜索结果质量评分系统', '搜索查询智能优化（去噪/学科识别/中英混合）'] },
        { version: '3.0.0', date: '2026-06-18', changes: ['新增头像框系统（12种独特框：金/银/铜/霓虹蓝/霓虹紫/烈焰/彩虹/皇冠/钻石/星空/渐变流光）', '头像框带独特CSS动画特效（发光/扫光/脉冲/霓虹/火焰/彩虹循环/皇冠浮动/钻石闪烁/星星闪烁/渐变流动）', '头像框按成就解锁（注册/答题数/科目覆盖/连续天数/游戏次数）', '游客用户不显示头像框', '操作栏移至AI消息气泡正后方', '个人信息新增性别选择（男/女/保密）', '个人信息新增生日设置（自动计算年龄/星座/生肖）', '个人信息新增修改密码功能', '新增会话记忆系统（追踪话题/问答/纠正/偏好）', '新增时段问候语（早/午/晚/夜不同问候）', '新增响应模板多样性（避免重复回答）', '新增知识检查功能（讲解后邀请做题）', '新增多意图检测（一句话包含多个指令）', '新增歧义检测（指代不明/缺少内容时主动追问）', '新增上下文感知响应（同词在不同科目不同理解）', '统一弹窗模板样式（操作指南等使用版本历史风格）', '新增成语接龙游戏（第9种学习游戏，610个成语库）', '新增每日挑战系统（日期种子+连胜追踪）', '游戏数据库大幅扩展：词语322/速算140/记忆55/成语123/谜语97/拼写92/打字55/问答133', '题库扩展至718道（新增应用题/多步题/跨学科题/挑战题110道）', '操作指南弹窗重构（模块化分区+版本徽章）'] },
        { version: '2.9.0', date: '2026-06-18', changes: ['修复版本历史弹窗无法打开的Bug（新增showModal函数）', '修复文件管理器无法打开文件的Bug（支持文本/文档/图片编辑预览）', '消息操作按钮移至输入框下方（复制/修改/分享/删除/反应）', '操作指南移至快捷工具栏最后位置', '新增AI思考过程展示（可折叠，按科目生成不同步骤）', '新增AI问题预处理系统（实体提取、类型识别、格式推断）', '新增AI追问检测和上下文关联', '新增DuckDuckGo即时回答API搜索', '新增Wikipedia API摘要和搜索', '新增多源搜索结果合并去重', '新增智能缓存关键词交叉匹配', '新增综合题库608道独特题目（9个科目×4难度）', '数学90题：几何/代数/数论/概率/函数/导数/积分', '英语87题：词汇/语法/阅读/翻译/写作/修辞', '语文81题：拼音/古诗/成语/文言文/文学评论', '物理63题：力学/电磁学/光学/热学/核物理', '化学63题：元素/方程式/有机/电化学/实验', '生物63题：细胞/遗传/生态/进化/人体', '历史60题：古代/近代/现代/世界史', '政治42题：法律/经济/哲学/国际', '地理63题：气候/地形/人口/经济地理'] },
        { version: '2.8.0', date: '2026-06-18', changes: ['架构重构：9个科目独立模块文件，每个科目携带独立知识库', '知识点按学龄分类：幼儿园/小学/初中/高中/职高/大学', '新增学段选择器，支持手动切换和自动检测', '新增打字速度挑战游戏（第7种学习游戏）', '新增知识问答对战游戏（第8种学习游戏）', '新增每日一知功能：每天推送一条知识小贴士', '修复添加科目按钮被覆盖的Bug', '修复默认科目标签不显示的Bug', '优化聊天头部布局，更紧凑美观', '优化科目按钮激活发光效果', '优化侧边栏各区域间距', '数学新增幼儿园数数、小学四则运算、大学微积分等', '英语新增幼儿园字母、小学单词、大学语言学等', '语文新增幼儿园拼音、小学识字、大学文学史等', '物理新增幼儿园光影、高中电磁学、大学量子力学等', '化学新增小学认识物质、高中电化学、大学物理化学等', '生物新增幼儿园动植物、高中遗传学、大学生物化学等', '历史新增幼儿园节日、初中中国史、大学史学理论等', '政治新增小学规则、初中法律、大学马克思主义等', '地理新增幼儿园地球、初中中国地理、大学GIS等'] },
        { version: '2.7.0', date: '2026-06-18', changes: ['新增六大AI命令：总结、对比、举例、思维导图、复习、公式', 'AI情绪感知系统：识别沮丧情绪并给予鼓励', 'AI智能追问：短句追问自动深入解释', '新增消息反应功能（点赞/踩/固定/标记）', '新增聊天搜索功能，支持关键词过滤和高亮', '新增智能输入建议，按科目推荐常用提问', '新增每日学习目标追踪和达成庆祝', '新增键盘快捷键系统（Ctrl+Enter/Ctrl+/Esc等）', '新增单词拼写挑战游戏（第6种学习游戏）', '闪卡增强：掌握标记、学习统计、批量导入', '出题增强：四级难度、混合题、多步计算题', '答题后显示学习进度条', 'UI新增6种动画：脉冲发光、滑入、弹跳、渐变文字、毛玻璃、涟漪', 'UI新增6种组件：进度条、思维导图、知识卡片、对比表格、公式框、难度徽章', '聊天气泡渐变背景、输入框聚焦动画、模态框毛玻璃效果', '数学新增数列、不等式、圆锥曲线、排列组合', '英语新增虚拟语气、被动语态、非谓语动词、音标基础', '语文新增文言文虚词、标点规则、作文技巧、错别字辨析', '物理新增电路分析、万有引力、核物理', '化学新增方程式配平、有机化学、电化学', '生物新增循环系统、生态系统、进化论', '历史新增世界近代史、中国近代史、文明古国对比', '政治新增经济常识、哲学常识、国际组织', '地理新增气候类型、中国分区、地图与GIS'] },
        { version: '2.6.0', date: '2026-06-18', changes: ['AI对话新增打字指示器动画和响应延迟', '新增"继续"、"翻译这段话"、"解释更详细"快捷命令', '新增快速笔记浮动窗口功能', '新增消息出现动画和Toast滑入动画', '优化科目按钮悬停效果和输入框聚焦样式', '数学新增概率统计（排列组合、标准差等）', '英语新增缩写、习语、标点规则、中式英语纠错', '语文新增成语故事、标点规则、错别字、古文经典', '物理新增波的性质、光谱与颜色理论', '化学新增酸碱中和、氧化还原、实验室仪器', '生物新增光合作用、细胞呼吸、消化系统、细胞对比', '历史新增朝代文化成就、一战二战、现代中国', '政治新增政府结构、公民权利义务', '地理新增中国分区、世界河流山脉、气候带'] },
        { version: '2.1.0', date: '2026-06-18', changes: ['新增猜谜题学习游戏', '新增图形化文件管理器', '优化输入区域按钮功能', 'AI助手新增笑话、名言、历史上的今天、随机数等功能', '扩展各学科题库', '优化版本历史弹窗滚动体验'] },
        { version: '2.0.0', date: '2026-06-15', changes: ['全新界面设计，更现代美观', '支持学习模式和工作者模式切换', '新增AI学习助手，支持多学科问答', '新增学习游戏：词语接龙、速算挑战、记忆测试、成语挑战', '新增学习工具：计算器、绘图板、文件管理', '新增错题本功能', '新增记事本功能', '支持联网搜索', '支持截图上传和AI识别', '支持语音朗读', '支持主题切换'] },
        { version: '1.5.0', date: '2026-05-20', changes: ['优化AI响应速度', '新增历史记录功能', '支持更多学科', '修复已知问题'] },
        { version: '1.0.0', date: '2026-04-01', changes: ['初始版本发布', '基础聊天功能', '简单学习工具'] }
    ];

    var html = '<div style="max-height:400px;overflow-y:auto;padding-right:8px;">';
    for (var i = 0; i < changelog.length; i++) {
        var item = changelog[i];
        var prevVersion = (i + 1 < changelog.length) ? changelog[i + 1].version : '0.0.0';
        var badge = getVersionBadge(prevVersion, item.version);
        html += '<div style="margin-bottom:20px;">';
        html += '<h3 style="color:var(--primary);margin-bottom:8px;">v' + item.version + ' <span style="color:var(--text-secondary);font-size:13px;">(' + item.date + ')</span>' + badge + '</h3>';
        html += '<ul style="margin-left:20px;">';
        for (var j = 0; j < item.changes.length; j++) {
            html += '<li style="margin-bottom:4px;">' + item.changes[j] + '</li>';
        }
        html += '</ul></div>';
    }
    html += '</div>';

    showModal('版本历史', html);
}

// Preference UI functions
function addPreferenceFromInput() {
    const input = document.getElementById('newPreferenceInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        showToast('warning', '请输入偏好内容');
        return;
    }
    const prefId = 'pref_' + Date.now();
    const pref = {
        id: prefId,
        text: text,
        category: 'manual',
        active: true,
        createdAt: Date.now(),
        usageCount: 0
    };
    state.userPreferences[prefId] = pref;
    StorageManager.savePreferences(state.userPreferences);
    input.value = '';
    renderPreferencesList();
    showToast('success', '已添加偏好：' + text);
}

function renderPreferencesList() {
    const container = document.getElementById('preferencesList');
    if (!container) return;
    const prefs = Object.values(state.userPreferences);
    if (prefs.length === 0) {
        container.innerHTML = '<div class="preferences-empty">暂无存储偏好</div>';
        return;
    }
    let html = '';
    prefs.forEach(p => {
        const categoryClass = p.category || 'manual';
        html += '<div class="preference-card ' + (p.active ? '' : 'inactive') + '">' +
            '<div class="preference-info">' +
            '<div class="preference-text">' + escapeHtml(p.text) + '</div>' +
            '<div class="preference-meta">' +
            '<span class="preference-category ' + categoryClass + '">' + (p.category || '手动') + '</span>' +
            '<span>使用' + (p.usageCount || 0) + '次</span>' +
            '</div></div>' +
            '<div class="preference-actions">' +
            '<button onclick="togglePreferenceUI(\'' + p.id + '\')" title="' + (p.active ? '停用' : '启用') + '">' + (p.active ? '暂停' : '启用') + '</button>' +
            '<button class="delete" onclick="deletePreferenceUI(\'' + p.id + '\')" title="删除">删除</button>' +
            '</div></div>';
    });
    container.innerHTML = html;
}

function togglePreferenceUI(id) {
    const pref = state.userPreferences[id];
    if (!pref) return;
    pref.active = !pref.active;
    StorageManager.savePreferences(state.userPreferences);
    renderPreferencesList();
    showToast('success', '偏好已' + (pref.active ? '启用' : '停用'));
}

function deletePreferenceUI(id) {
    const pref = state.userPreferences[id];
    if (!pref) return;
    delete state.userPreferences[id];
    StorageManager.savePreferences(state.userPreferences);
    renderPreferencesList();
    showToast('success', '已删除偏好：' + pref.text);
}

// Theme toggle
function toggleTheme() {
    const toggle = document.getElementById('themeToggle');
    const isLight = document.documentElement.classList.toggle('light-theme');
    toggle.classList.toggle('active', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    showToast('success', isLight ? '已切换到浅色主题' : '已切换到深色主题');
}
