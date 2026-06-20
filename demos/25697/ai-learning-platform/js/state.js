// ========== App State ==========
const state = {
    role: null, // 'student' or 'worker'
    currentPage: 'chat',
    currentSubject: null,
    inputTab: 'text',
    uploadedImage: null,
    currentUser: null, // logged-in user object
    selectedRegAvatar: '😀',
    currentLoginTab: 'phone',
    currentRegTab: 'phone',
    settings: {
        btnPosition: 'right',
        inputMode: 'fixed',
        sidebarOpen: true,
        webSearch: true,
        aiSpeed: 'normal',
        loginNotify: true,
        fontFamily: "'Noto Sans SC', sans-serif",
    },

    // Student data
    subjects: [
        { id: 'math', name: '数学', icon: '🧮', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'english', name: '英语', icon: '📖', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'chinese', name: '语文', icon: '📝', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'physics', name: '物理', icon: '🔭', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'chemistry', name: '化学', icon: '⚗️', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'biology', name: '生物', icon: '🧬', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'history', name: '历史', icon: '🏛️', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'politics', name: '政治', icon: '⚖️', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'geography', name: '地理', icon: '🌍', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'programming', name: '编程', icon: '💻', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'music', name: '音乐', icon: '🎵', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'art', name: '美术', icon: '🎨', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'pe', name: '体育', icon: '⚽', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'it', name: '信息技术', icon: '📡', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
    ],

    // Worker data
    projects: [
        { id: 'files', name: '文件管理', icon: '📁', type: 'files', files: [
            { name: '工作文档', type: 'folder', items: 12, date: '2026-06-15' },
            { name: '项目报告.docx', type: 'doc', size: '2.4 MB', date: '2026-06-14' },
            { name: '会议纪要.pdf', type: 'doc', size: '1.1 MB', date: '2026-06-13' },
            { name: '数据分析表.xlsx', type: 'doc', size: '856 KB', date: '2026-06-12' },
            { name: '产品截图.png', type: 'img', size: '3.2 MB', date: '2026-06-11' },
            { name: '代码片段.js', type: 'code', size: '12 KB', date: '2026-06-10' },
        ]},
        { id: 'dev', name: '项目开发', icon: '💻', type: 'dev' },
        { id: 'ppt', name: 'PPT制作', icon: '📊', type: 'ppt' },
        { id: 'video', name: '视频制作', icon: '🎬', type: 'video' },
        { id: 'writing', name: '帮助写作', icon: '✍️', type: 'writing' },
        { id: 'plan', name: '方案生成', icon: '📋', type: 'plan' },
        { id: 'spreadsheet', name: '表格制作', icon: '📊', type: 'spreadsheet' },
    ],

    // 咨询服务（学生和工作者共用）
    consultations: [
        { id: 'law', name: '法律', icon: '⚖️' },
        { id: 'mental', name: '心理', icon: '💚' },
        { id: 'funcounsel', name: '功能', icon: '💡' },
    ],

    // Shared notepad
    notes: [],
    currentNoteFilter: 'all',
    currentErrorFilter: 'all',
    selectedSubjectIcon: '📚',
    selectedReminderType: '一次性',
    chatHistories: {}, // per subject/project
    learningStats: {}, // { subjectId: { '2026-06-17': { count: 5, entries: [{ q, a, time }] } } }
    userPreferences: {}, // { prefId: { id, text, category, active, createdAt, usageCount } }

    // Current school level setting
    schoolLevel: 'auto', // auto, kindergarten, primary, junior, senior, vocational, university
};

function changeSchoolLevel(level) {
    state.schoolLevel = level;
    const levelNames = { kindergarten: '幼儿园', primary: '小学', junior: '初中', senior: '高中', vocational: '职高', university: '大学', auto: '自动检测' };
    showToast('success', '学段已切换为：' + levelNames[level]);
}
