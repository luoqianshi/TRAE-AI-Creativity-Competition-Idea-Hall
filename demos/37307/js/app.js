/**
 * 教案叙事工坊 - 核心应用逻辑
 * TRAE全民AI创造力大赛参赛作品
 */

// ==================== 全局状态管理 ====================
const appState = {
    currentPage: 'index',
    currentLesson: null,
    lessonLibrary: [],
    settings: {
        fontSize: 'normal',
        autoSave: true
    }
};

// ==================== 生成的教案内容 ====================
let generatedContent = {
    intro: '',
    storyline: '',
    game: '',
    questions: '',
    blackboard: ''
};

// ==================== 教案生成功能 ====================
function generateLesson() {
    const gradeLevel = document.getElementById('gradeLevel').value;
    const subject = document.getElementById('subject').value;
    const lessonTitle = document.getElementById('lessonTitle').value.trim();
    const duration = document.getElementById('duration').value;
    
    // 验证输入
    if (!gradeLevel || !subject || !lessonTitle || !duration) {
        showToast('请填写完整的课程信息！', 'error');
        return;
    }
    
    // 显示加载状态
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.innerHTML = `
        <svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        正在生成...
    `;
    generateBtn.disabled = true;
    
    // 模拟生成过程（实际项目中可接入AI API）
    setTimeout(() => {
        // 根据科目和课文生成示例内容
        generatedContent = generateSampleContent(gradeLevel, subject, lessonTitle, duration);
        
        // 显示结果区域
        document.getElementById('result-section').style.display = 'block';
        
        // 填充各板块内容
        document.getElementById('result-intro').innerHTML = generatedContent.intro;
        document.getElementById('result-storyline').innerHTML = generatedContent.storyline;
        document.getElementById('result-game').innerHTML = generatedContent.game;
        document.getElementById('result-questions').innerHTML = generatedContent.questions;
        document.getElementById('result-blackboard').innerHTML = generatedContent.blackboard;
        
        // 添加动画效果
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // 恢复按钮状态
        generateBtn.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            一键生成
        `;
        generateBtn.disabled = false;
        
        // 保存当前教案信息
        appState.currentLesson = {
            gradeLevel,
            subject,
            lessonTitle,
            duration,
            content: generatedContent,
            createdAt: new Date().toISOString()
        };
        
        showToast('教案生成成功！', 'success');
        
        // 自动保存（如果开启）
        if (appState.settings.autoSave) {
            saveLesson();
        }
    }, 1500);
}

// ==================== 示例内容生成 ====================
function generateSampleContent(grade, subject, title, duration) {
    // 根据不同科目生成不同风格的示例内容
    const templates = {
        '语文': {
            intro: `<p class="mb-3">📚 <strong>情景导入设计：</strong></p>
                    <p>同学们，今天我们要走进一个特别的故事世界。在开始之前，老师想请大家闭上眼睛，想象一下...</p>
                    <p class="mt-3 italic text-teal-dark">"${title}"这篇课文，就像一扇通往另一个时空的大门。让我们一起推开这扇门，看看里面藏着怎样的故事...</p>
                    <p class="mt-3">【导入方式】：通过播放一段与课文主题相关的音乐/视频，配合教师深情朗读课文开头，营造沉浸式阅读氛围。</p>`,
            
            storyline: `<p class="mb-3">📖 <strong>故事主线梳理：</strong></p>
                       <p class="font-semibold text-teal-dark mb-2">第一幕：相遇</p>
                       <p>故事从...开始，主人公...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">第二幕：冲突</p>
                       <p>随着情节发展，出现了...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">第三幕：转折</p>
                       <p>关键时刻，...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">第四幕：结局</p>
                       <p>最终，故事以...收尾，留给读者...</p>`,
            
            game: `<p class="mb-3">🎮 <strong>课堂互动小游戏：</strong></p>
                   <p class="font-semibold text-teal-dark mb-2">游戏一：角色扮演剧场</p>
                   <p>让学生分组扮演课文中的主要角色，通过对话演绎故事情节。</p>
                   <p class="font-semibold text-teal-dark mb-2 mt-3">游戏二：词语接龙挑战</p>
                   <p>从课文中选取关键词，进行词语接龙，加深对课文词汇的理解。</p>
                   <p class="font-semibold text-teal-dark mb-2 mt-3">游戏三：情感温度计</p>
                   <p>让学生用手势表示对课文不同段落的理解程度（举手高度代表理解深度）。</p>`,
            
            questions: `<p class="mb-3">❓ <strong>递进式提问清单：</strong></p>
                       <p class="font-semibold mb-2">【基础理解层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>课文的主要内容是什么？</li>
                           <li>主人公是谁？他/她做了什么？</li>
                           <li>故事发生在什么时间、什么地点？</li>
                       </ul>
                       <p class="font-semibold mb-2 mt-3">【深度分析层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>作者为什么要写这篇文章？想表达什么？</li>
                           <li>课文中有哪些描写特别打动你？为什么？</li>
                           <li>主人公的选择给你什么启发？</li>
                       </ul>
                       <p class="font-semibold mb-2 mt-3">【拓展应用层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>如果你是主人公，你会怎么做？</li>
                           <li>这个故事对你的人生有什么启示？</li>
                           <li>你能联系现实生活，说说类似的例子吗？</li>
                       </ul>`,
            
            blackboard: `<p class="mb-3">📝 <strong>板书设计大纲：</strong></p>
                        <div class="bg-cream-dark p-4 rounded-lg font-mono text-sm">
                        <pre class="whitespace-pre-wrap">
┌─────────────────────────────────────┐
│           ${title}                    │
│  ─────────────────────────────────  │
│                                     │
│  【故事主线】                        │
│   开始 → 发展 → 高潮 → 结局          │
│                                     │
│  【关键词】                          │
│   关键词1  关键词2  关键词3          │
│                                     │
│  【核心主题】                        │
│   ________________________          │
│                                     │
└─────────────────────────────────────┘
                        </pre>
                        </div>`
        },
        
        '数学': {
            intro: `<p class="mb-3">📐 <strong>情景导入设计：</strong></p>
                    <p>同学们，数学不仅是公式和计算，它更是解决问题的工具！</p>
                    <p class="mt-3">今天我们来探索"${title}"。想象一下，如果你是一名建筑师，需要...</p>
                    <p class="mt-3 italic text-teal-dark">生活中的很多问题，都可以用数学来解决。让我们一起看看"${title}"如何帮助我们...</p>`,
            
            storyline: `<p class="mb-3">📊 <strong>知识主线梳理：</strong></p>
                       <p class="font-semibold text-teal-dark mb-2">第一步：发现问题</p>
                       <p>从实际情境中提炼数学问题...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">第二步：建立模型</p>
                       <p>将问题转化为数学表达式...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">第三步：求解验证</p>
                       <p>运用"${title}"的方法进行计算...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">第四步：应用拓展</p>
                       <p>将结论应用到更多情境...</p>`,
            
            game: `<p class="mb-3">🎯 <strong>课堂互动小游戏：</strong></p>
                   <p class="font-semibold text-teal-dark mb-2">游戏一：数学接力赛</p>
                   <p>分组进行计算接力，每组成员依次完成一步计算。</p>
                   <p class="font-semibold text-teal-dark mb-2 mt-3">游戏二：实物测量挑战</p>
                   <p>用教室里的物品进行实际测量，验证"${title}"的应用。</p>
                   <p class="font-semibold text-teal-dark mb-2 mt-3">游戏三：数学侦探</p>
                   <p>给出一个"数学谜题"，让学生用"${title}"的知识破解。</p>`,
            
            questions: `<p class="mb-3">❓ <strong>递进式提问清单：</strong></p>
                       <p class="font-semibold mb-2">【基础概念层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>"${title}"的定义是什么？</li>
                           <li>这个公式/定理适用于什么情况？</li>
                           <li>基本的计算步骤有哪些？</li>
                       </ul>
                       <p class="font-semibold mb-2 mt-3">【理解应用层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>为什么这个方法有效？</li>
                           <li>你能举出一个生活中的例子吗？</li>
                           <li>如果条件改变，结果会怎样？</li>
                       </ul>
                       <p class="font-semibold mb-2 mt-3">【拓展创新层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>你能发现其他解法吗？</li>
                           <li>这个知识和其他知识有什么联系？</li>
                           <li>你能设计一个新问题吗？</li>
                       </ul>`,
            
            blackboard: `<p class="mb-3">📝 <strong>板书设计大纲：</strong></p>
                        <div class="bg-cream-dark p-4 rounded-lg font-mono text-sm">
                        <pre class="whitespace-pre-wrap">
┌─────────────────────────────────────┐
│           ${title}                    │
│  ─────────────────────────────────  │
│                                     │
│  【公式/定理】                       │
│   ________________________          │
│                                     │
│  【推导过程】                        │
│   步骤1 → 步骤2 → 步骤3              │
│                                     │
│  【例题演示】                        │
│   已知：____  求：____              │
│   解：____________________          │
│                                     │
└─────────────────────────────────────┘
                        </pre>
                        </div>`
        },
        
        'default': {
            intro: `<p class="mb-3">🌟 <strong>情景导入设计：</strong></p>
                    <p>同学们，今天我们要学习"${title}"。这是一个非常有趣的主题！</p>
                    <p class="mt-3">在开始之前，老师想问大家一个问题...</p>
                    <p class="mt-3 italic text-teal-dark">让我们一起探索"${title}"的奥秘，发现它背后的精彩故事！</p>`,
            
            storyline: `<p class="mb-3">📚 <strong>知识主线梳理：</strong></p>
                       <p class="font-semibold text-teal-dark mb-2">环节一：引入</p>
                       <p>通过情境引入"${title}"的学习...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">环节二：探索</p>
                       <p>深入理解"${title}"的核心内容...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">环节三：实践</p>
                       <p>通过活动巩固所学知识...</p>
                       <p class="font-semibold text-teal-dark mb-2 mt-3">环节四：总结</p>
                       <p>归纳要点，拓展应用...</p>`,
            
            game: `<p class="mb-3">🎉 <strong>课堂互动小游戏：</strong></p>
                   <p class="font-semibold text-teal-dark mb-2">游戏一：知识竞答</p>
                   <p>分组进行知识问答竞赛，激发学习兴趣。</p>
                   <p class="font-semibold text-teal-dark mb-2 mt-3">游戏二：小组合作挑战</p>
                   <p>团队协作完成"${title}"相关任务。</p>
                   <p class="font-semibold text-teal-dark mb-2 mt-3">游戏三：角色扮演</p>
                   <p>模拟真实情境，体验"${title}"的应用。</p>`,
            
            questions: `<p class="mb-3">❓ <strong>递进式提问清单：</strong></p>
                       <p class="font-semibold mb-2">【基础层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>"${title}"的基本概念是什么？</li>
                           <li>有哪些关键知识点？</li>
                           <li>这个知识有什么特点？</li>
                       </ul>
                       <p class="font-semibold mb-2 mt-3">【理解层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>为什么这个知识很重要？</li>
                           <li>它和之前学的内容有什么联系？</li>
                           <li>你能用自己的话解释吗？</li>
                       </ul>
                       <p class="font-semibold mb-2 mt-3">【应用层】</p>
                       <ul class="list-disc pl-5 space-y-1">
                           <li>在生活中如何应用"${title}"？</li>
                           <li>你能举出具体例子吗？</li>
                           <li>如果遇到相关问题，你会怎么解决？</li>
                       </ul>`,
            
            blackboard: `<p class="mb-3">📝 <strong>板书设计大纲：</strong></p>
                        <div class="bg-cream-dark p-4 rounded-lg font-mono text-sm">
                        <pre class="whitespace-pre-wrap">
┌─────────────────────────────────────┐
│           ${title}                    │
│  ─────────────────────────────────  │
│                                     │
│  【核心概念】                        │
│   ________________________          │
│                                     │
│  【关键要点】                        │
│   1. ____________                   │
│   2. ____________                   │
│   3. ____________                   │
│                                     │
│  【拓展应用】                        │
│   ________________________          │
│                                     │
└─────────────────────────────────────┘
                        </pre>
                        </div>`
        }
    };
    
    // 根据科目选择模板
    const template = templates[subject] || templates['default'];
    
    // 根据学段和时长调整内容
    let content = {
        intro: template.intro,
        storyline: template.storyline,
        game: template.game,
        questions: template.questions,
        blackboard: template.blackboard
    };
    
    // 添加课程信息头部
    const header = `<div class="bg-teal-light/10 p-3 rounded-lg mb-4">
        <p class="text-sm"><strong>课程信息：</strong>${grade} · ${subject} · ${title} · ${duration}</p>
    </div>`;
    
    content.intro = header + content.intro;
    
    return content;
}

// ==================== 复制功能 ====================
function copySection(section) {
    const content = generatedContent[section];
    if (!content) {
        showToast('该板块暂无内容！', 'error');
        return;
    }
    
    // 提取纯文本
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板！', 'success');
    }).catch(() => {
        showToast('复制失败，请手动复制', 'error');
    });
}

function copyAllContent() {
    if (!generatedContent.intro) {
        showToast('请先生成教案！', 'error');
        return;
    }
    
    const gradeLevel = document.getElementById('gradeLevel').value;
    const subject = document.getElementById('subject').value;
    const lessonTitle = document.getElementById('lessonTitle').value;
    const duration = document.getElementById('duration').value;
    
    let fullText = `教案叙事工坊 - ${lessonTitle}\n`;
    fullText += `课程信息：${gradeLevel} · ${subject} · ${duration}\n`;
    fullText += `\n${'='.repeat(50)}\n\n`;
    
    fullText += `【课堂情景导入】\n${stripHtml(generatedContent.intro)}\n\n`;
    fullText += `【故事主线梳理】\n${stripHtml(generatedContent.storyline)}\n\n`;
    fullText += `【课堂互动小游戏】\n${stripHtml(generatedContent.game)}\n\n`;
    fullText += `【递进式提问清单】\n${stripHtml(generatedContent.questions)}\n\n`;
    fullText += `【板书设计大纲】\n${stripHtml(generatedContent.blackboard)}\n`;
    
    navigator.clipboard.writeText(fullText).then(() => {
        showToast('全部内容已复制！', 'success');
    }).catch(() => {
        showToast('复制失败，请手动复制', 'error');
    });
}

function stripHtml(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.innerText;
}

// ==================== 清空功能 ====================
function clearAllContent() {
    // 清空表单
    document.getElementById('gradeLevel').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('lessonTitle').value = '';
    document.getElementById('duration').value = '';
    
    // 清空结果
    generatedContent = {
        intro: '',
        storyline: '',
        game: '',
        questions: '',
        blackboard: ''
    };
    
    // 隐藏结果区域
    document.getElementById('result-section').style.display = 'none';
    
    // 清空内容显示
    document.getElementById('result-intro').innerHTML = '';
    document.getElementById('result-storyline').innerHTML = '';
    document.getElementById('result-game').innerHTML = '';
    document.getElementById('result-questions').innerHTML = '';
    document.getElementById('result-blackboard').innerHTML = '';
    
    appState.currentLesson = null;
    
    showToast('内容已清空！', 'success');
}

// ==================== 保存教案功能 ====================
function saveLesson() {
    if (!appState.currentLesson) {
        showToast('请先生成教案！', 'error');
        return;
    }
    
    // 从本地存储获取教案库
    let library = JSON.parse(localStorage.getItem('lessonLibrary') || '[]');
    
    // 为当前教案生成唯一ID（如果没有的话）
    if (!appState.currentLesson.id) {
        appState.currentLesson.id = Date.now().toString();
    }
    
    // 检查是否已存在相同教案（通过ID检查）
    const existingIndex = library.findIndex(l => l.id === appState.currentLesson.id);
    
    if (existingIndex >= 0) {
        // 更新现有教案
        library[existingIndex] = {
            ...appState.currentLesson,
            updatedAt: new Date().toISOString()
        };
        showToast('教案已更新！', 'success');
    } else {
        // 检查是否通过标题和科目找到相似的
        const existingByTitle = library.findIndex(l => 
            l.lessonTitle === appState.currentLesson.lessonTitle &&
            l.subject === appState.currentLesson.subject
        );
        
        if (existingByTitle >= 0) {
            // 更新现有教案
            library[existingByTitle] = {
                ...appState.currentLesson,
                id: library[existingByTitle].id, // 保留原有ID
                createdAt: library[existingByTitle].createdAt,
                updatedAt: new Date().toISOString()
            };
            showToast('教案已更新！', 'success');
        } else {
            // 添加新教案
            library.push({
                ...appState.currentLesson,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            });
            showToast('教案已保存！', 'success');
        }
    }
    
    // 保存到本地存储
    localStorage.setItem('lessonLibrary', JSON.stringify(library));
    appState.lessonLibrary = library;
}

// ==================== 教案库功能 ====================
function loadLessonLibrary() {
    const library = JSON.parse(localStorage.getItem('lessonLibrary') || '[]');
    appState.lessonLibrary = library;
    
    const lessonList = document.getElementById('lessonList');
    
    if (library.length === 0) {
        lessonList.innerHTML = `
            <div class="col-span-full text-center py-16">
                <svg class="w-16 h-16 mx-auto text-warm-gray/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <p class="text-warm-gray/60 text-lg">暂无保存的教案</p>
                <button onclick="showPage('create')" class="mt-4 px-6 py-2 bg-teal-dark text-white rounded-lg hover:bg-teal-light transition-colors">
                    开始创建第一个教案
                </button>
            </div>
        `;
        return;
    }
    
    // 渲染教案卡片
    lessonList.innerHTML = library.map(lesson => `
        <div class="bg-paper rounded-xl shadow-md overflow-hidden card-hover">
            <div class="bg-gradient-to-r from-teal-light to-teal-dark p-4">
                <h4 class="font-serif-cn text-lg font-semibold text-white">${lesson.lessonTitle}</h4>
                <p class="text-white/80 text-sm">${lesson.subject} · ${lesson.gradeLevel}</p>
            </div>
            <div class="p-4">
                <p class="text-warm-gray/60 text-sm mb-2">时长：${lesson.duration}</p>
                <p class="text-warm-gray/60 text-sm mb-4">创建：${formatDate(lesson.createdAt)}</p>
                <div class="flex gap-2">
                    <button onclick="viewLesson('${lesson.id}')" class="flex-1 px-3 py-2 bg-teal-dark text-white text-sm rounded-lg hover:bg-teal-light transition-colors">
                        查看
                    </button>
                    <button onclick="deleteLesson('${lesson.id}')" class="px-3 py-2 bg-red-100 text-red-500 text-sm rounded-lg hover:bg-red-200 transition-colors">
                        删除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterLessons() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const subjectFilter = document.getElementById('filterSubject').value;
    
    let library = JSON.parse(localStorage.getItem('lessonLibrary') || '[]');
    
    // 应用筛选
    if (searchTerm) {
        library = library.filter(l => 
            l.lessonTitle.toLowerCase().includes(searchTerm) ||
            l.subject.toLowerCase().includes(searchTerm)
        );
    }
    
    if (subjectFilter) {
        library = library.filter(l => l.subject === subjectFilter);
    }
    
    const lessonList = document.getElementById('lessonList');
    
    if (library.length === 0) {
        lessonList.innerHTML = `
            <div class="col-span-full text-center py-16">
                <p class="text-warm-gray/60 text-lg">未找到匹配的教案</p>
            </div>
        `;
        return;
    }
    
    // 渲染筛选后的教案卡片
    lessonList.innerHTML = library.map(lesson => `
        <div class="bg-paper rounded-xl shadow-md overflow-hidden card-hover">
            <div class="bg-gradient-to-r from-teal-light to-teal-dark p-4">
                <h4 class="font-serif-cn text-lg font-semibold text-white">${lesson.lessonTitle}</h4>
                <p class="text-white/80 text-sm">${lesson.subject} · ${lesson.gradeLevel}</p>
            </div>
            <div class="p-4">
                <p class="text-warm-gray/60 text-sm mb-2">时长：${lesson.duration}</p>
                <p class="text-warm-gray/60 text-sm mb-4">创建：${formatDate(lesson.createdAt)}</p>
                <div class="flex gap-2">
                    <button onclick="viewLesson('${lesson.id}')" class="flex-1 px-3 py-2 bg-teal-dark text-white text-sm rounded-lg hover:bg-teal-light transition-colors">
                        查看
                    </button>
                    <button onclick="deleteLesson('${lesson.id}')" class="px-3 py-2 bg-red-100 text-red-500 text-sm rounded-lg hover:bg-red-200 transition-colors">
                        删除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewLesson(id) {
    const library = JSON.parse(localStorage.getItem('lessonLibrary') || '[]');
    const lesson = library.find(l => l.id === id);
    
    if (!lesson) {
        // 如果没找到，尝试刷新教案库后重新查找
        loadLessonLibrary();
        const refreshedLibrary = JSON.parse(localStorage.getItem('lessonLibrary') || '[]');
        const refreshedLesson = refreshedLibrary.find(l => l.id === id);
        
        if (!refreshedLesson) {
            showToast('教案不存在或已删除！', 'error');
            return;
        }
        
        loadLessonContent(refreshedLesson);
    } else {
        loadLessonContent(lesson);
    }
}

function loadLessonContent(lesson) {
    // 跳转到创建页面并加载教案内容
    showPage('create');
    
    // 填充表单
    document.getElementById('gradeLevel').value = lesson.gradeLevel || '';
    document.getElementById('subject').value = lesson.subject || '';
    document.getElementById('lessonTitle').value = lesson.lessonTitle || '';
    document.getElementById('duration').value = lesson.duration || '';
    
    // 显示结果
    generatedContent = lesson.content || {
        intro: '',
        storyline: '',
        game: '',
        questions: '',
        blackboard: ''
    };
    
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-intro').innerHTML = generatedContent.intro || '';
    document.getElementById('result-storyline').innerHTML = generatedContent.storyline || '';
    document.getElementById('result-game').innerHTML = generatedContent.game || '';
    document.getElementById('result-questions').innerHTML = generatedContent.questions || '';
    document.getElementById('result-blackboard').innerHTML = generatedContent.blackboard || '';
    
    appState.currentLesson = lesson;
    
    showToast('教案已加载！', 'success');
}

function deleteLesson(id) {
    if (!confirm('确定要删除这个教案吗？')) {
        return;
    }
    
    let library = JSON.parse(localStorage.getItem('lessonLibrary') || '[]');
    const originalLength = library.length;
    
    // 正确的删除逻辑：保留id不等于目标id的教案
    let newLibrary = library.filter(l => l.id !== id);
    
    if (newLibrary.length === originalLength) {
        showToast('教案不存在！', 'error');
        return;
    }
    
    localStorage.setItem('lessonLibrary', JSON.stringify(newLibrary));
    appState.lessonLibrary = newLibrary;
    
    // 强制重新渲染教案列表
    loadLessonLibrary();
    
    showToast('教案已删除！', 'success');
}

// ==================== 导出功能 ====================
function exportToWord() {
    if (!generatedContent.intro) {
        showToast('请先生成教案！', 'error');
        return;
    }
    
    const gradeLevel = document.getElementById('gradeLevel').value;
    const subject = document.getElementById('subject').value;
    const lessonTitle = document.getElementById('lessonTitle').value;
    const duration = document.getElementById('duration').value;
    
    // 构建Word文档内容
    let content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
            <meta charset="utf-8">
            <title>${lessonTitle}</title>
            <style>
                body { font-family: '微软雅黑', sans-serif; }
                h1 { text-align: center; color: #5BA8A8; }
                h2 { color: #7EC8C8; border-bottom: 2px solid #7EC8C8; padding-bottom: 5px; }
                .info { background: #F5EDE3; padding: 10px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>${lessonTitle} - 教案叙事</h1>
            <div class="info">
                <p><strong>课程信息：</strong>${gradeLevel} · ${subject} · ${duration}</p>
                <p><strong>生成时间：</strong>${new Date().toLocaleString()}</p>
            </div>
            
            <h2>课堂情景导入</h2>
            ${generatedContent.intro}
            
            <h2>故事主线梳理</h2>
            ${generatedContent.storyline}
            
            <h2>课堂互动小游戏</h2>
            ${generatedContent.game}
            
            <h2>递进式提问清单</h2>
            ${generatedContent.questions}
            
            <h2>板书设计大纲</h2>
            ${generatedContent.blackboard}
            
            <hr>
            <p style="text-align: center; color: #999; font-size: 12px;">
                教案叙事工坊 · TRAE全民AI创造力大赛参赛作品
            </p>
        </body>
        </html>
    `;
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lessonTitle}_教案叙事.doc`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('Word文档已导出！', 'success');
}

function exportToPDF() {
    if (!generatedContent.intro) {
        showToast('请先生成教案！', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const gradeLevel = document.getElementById('gradeLevel').value;
    const subject = document.getElementById('subject').value;
    const lessonTitle = document.getElementById('lessonTitle').value;
    const duration = document.getElementById('duration').value;
    
    // 设置字体（使用内置字体）
    doc.setFont('helvetica');
    
    // 标题
    doc.setFontSize(24);
    doc.setTextColor(91, 168, 168);
    doc.text(lessonTitle, 105, 20, { align: 'center' });
    
    // 课程信息
    doc.setFontSize(12);
    doc.setTextColor(107, 91, 79);
    doc.text(`课程信息: ${gradeLevel} | ${subject} | ${duration}`, 105, 30, { align: 'center' });
    
    // 分隔线
    doc.setDrawColor(126, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // 内容区域
    let y = 45;
    const lineHeight = 7;
    const maxWidth = 170;
    
    // 各板块标题和内容
    const sections = [
        { title: '课堂情景导入', content: stripHtml(generatedContent.intro) },
        { title: '故事主线梳理', content: stripHtml(generatedContent.storyline) },
        { title: '课堂互动小游戏', content: stripHtml(generatedContent.game) },
        { title: '递进式提问清单', content: stripHtml(generatedContent.questions) },
        { title: '板书设计大纲', content: stripHtml(generatedContent.blackboard) }
    ];
    
    sections.forEach(section => {
        // 检查是否需要新页
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        // 板块标题
        doc.setFontSize(16);
        doc.setTextColor(126, 200, 200);
        doc.text(section.title, 20, y);
        y += lineHeight;
        
        // 板块内容
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        
        const lines = doc.splitTextToSize(section.content, maxWidth);
        lines.forEach(line => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, 20, y);
            y += lineHeight * 0.8;
        });
        
        y += 10;
    });
    
    // 页脚
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('教案叙事工坊 - TRAE全民AI创造力大赛参赛作品', 105, 285, { align: 'center' });
    
    // 保存PDF
    doc.save(`${lessonTitle}_教案叙事.pdf`);
    
    showToast('PDF已导出！', 'success');
}

// ==================== 设置功能 ====================
function changeFontSize() {
    const size = document.getElementById('fontSizeSelect').value;
    appState.settings.fontSize = size;
    
    // 应用字体大小
    const body = document.body;
    switch(size) {
        case 'small':
            body.style.fontSize = '14px';
            break;
        case 'normal':
            body.style.fontSize = '16px';
            break;
        case 'large':
            body.style.fontSize = '18px';
            break;
        case 'xlarge':
            body.style.fontSize = '20px';
            break;
    }
    
    // 保存设置
    localStorage.setItem('appSettings', JSON.stringify(appState.settings));
    showToast('字体大小已调整！', 'success');
}

function toggleAutoSave() {
    appState.settings.autoSave = document.getElementById('autoSaveToggle').checked;
    localStorage.setItem('appSettings', JSON.stringify(appState.settings));
    showToast(appState.settings.autoSave ? '自动保存已开启' : '自动保存已关闭', 'success');
}

function exportAllLessons() {
    const library = JSON.parse(localStorage.getItem('lessonLibrary') || '[]');
    
    if (library.length === 0) {
        showToast('暂无教案可导出！', 'error');
        return;
    }
    
    // 导出为JSON文件
    const data = JSON.stringify(library, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `教案库备份_${new Date().toLocaleDateString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('教案库已导出！', 'success');
}

function clearAllData() {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        return;
    }
    
    localStorage.removeItem('lessonLibrary');
    localStorage.removeItem('appSettings');
    
    appState.lessonLibrary = [];
    appState.currentLesson = null;
    
    showToast('所有数据已清空！', 'success');
    
    // 如果在教案库页面，刷新列表
    if (appState.currentPage === 'library') {
        loadLessonLibrary();
    }
}

// ==================== Toast消息提示 ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    
    // 根据类型设置颜色
    toast.className = 'fixed top-20 right-8 px-6 py-3 rounded-xl shadow-xl transform transition-transform duration-300 z-50 print-hide';
    if (type === 'success') {
        toast.classList.add('bg-teal-dark', 'text-white');
    } else if (type === 'error') {
        toast.classList.add('bg-red-500', 'text-white');
    }
    
    // 显示Toast
    toast.classList.remove('translate-x-full');
    toast.classList.add('translate-x-0');
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full');
    }, 3000);
}

// ==================== 工具函数 ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// ==================== 初始化 ====================
function initApp() {
    // 加载设置
    const savedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    if (savedSettings.fontSize) {
        appState.settings.fontSize = savedSettings.fontSize;
        document.getElementById('fontSizeSelect').value = savedSettings.fontSize;
        changeFontSize();
    }
    if (savedSettings.autoSave !== undefined) {
        appState.settings.autoSave = savedSettings.autoSave;
        document.getElementById('autoSaveToggle').checked = savedSettings.autoSave;
    }
    
    // 加载教案库
    appState.lessonLibrary = JSON.parse(localStorage.getItem('lessonLibrary') || '[]');
    
    console.log('教案叙事工坊已初始化！');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);