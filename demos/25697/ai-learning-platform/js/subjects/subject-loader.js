// ========== 科目模块加载器 ==========
// 智学空间 - 动态科目模块管理系统

// 全局科目模块注册表
window.SubjectModules = window.SubjectModules || {};

// 科目ID与文件路径映射
var SUBJECT_FILE_MAP = {
    math: 'math.js',
    english: 'english.js',
    chinese: 'chinese.js',
    physics: 'physics.js',
    chemistry: 'chemistry.js',
    biology: 'biology.js',
    history: 'history.js',
    politics: 'politics.js',
    geography: 'geography.js'
};

// 已加载的科目集合
var _loadedSubjects = {};

// 科目中文名映射
var SUBJECT_NAMES = {
    math: '数学',
    english: '英语',
    chinese: '语文',
    physics: '物理',
    chemistry: '化学',
    biology: '生物',
    history: '历史',
    politics: '政治',
    geography: '地理'
};

/**
 * 动态加载科目模块
 * @param {string} subjectId - 科目ID
 * @returns {Promise<object>} 科目模块对象
 */
function loadSubjectModule(subjectId) {
    // 如果已加载，直接返回
    if (_loadedSubjects[subjectId]) {
        return Promise.resolve(_loadedSubjects[subjectId]);
    }

    // 如果模块已在全局注册（内联加载的情况）
    if (window.SubjectModules[subjectId]) {
        _loadedSubjects[subjectId] = window.SubjectModules[subjectId];
        return Promise.resolve(window.SubjectModules[subjectId]);
    }

    // 动态加载JS文件
    var fileName = SUBJECT_FILE_MAP[subjectId];
    if (!fileName) {
        return Promise.reject(new Error('未知科目: ' + subjectId));
    }

    return new Promise(function(resolve, reject) {
        // 检查是否已有同名script标签
        var existingScript = document.querySelector('script[data-subject="' + subjectId + '"]');
        if (existingScript) {
            // 等待加载完成
            var checkInterval = setInterval(function() {
                if (window.SubjectModules[subjectId]) {
                    clearInterval(checkInterval);
                    _loadedSubjects[subjectId] = window.SubjectModules[subjectId];
                    resolve(_loadedSubjects[subjectId]);
                }
            }, 50);
            // 超时处理
            setTimeout(function() {
                clearInterval(checkInterval);
                reject(new Error('加载科目模块超时: ' + subjectId));
            }, 10000);
            return;
        }

        var script = document.createElement('script');
        script.setAttribute('data-subject', subjectId);
        script.src = 'js/subjects/' + fileName;
        script.onload = function() {
            if (window.SubjectModules[subjectId]) {
                _loadedSubjects[subjectId] = window.SubjectModules[subjectId];
                resolve(_loadedSubjects[subjectId]);
            } else {
                reject(new Error('科目模块注册失败: ' + subjectId));
            }
        };
        script.onerror = function() {
            reject(new Error('科目模块加载失败: ' + subjectId));
        };
        document.head.appendChild(script);
    });
}

/**
 * 获取科目处理函数
 * @param {string} subjectId - 科目ID
 * @returns {Function|null} 处理函数
 */
function getSubjectHandler(subjectId) {
    if (_loadedSubjects[subjectId] && _loadedSubjects[subjectId].handle) {
        return _loadedSubjects[subjectId].handle;
    }
    if (window.SubjectModules[subjectId] && window.SubjectModules[subjectId].handle) {
        _loadedSubjects[subjectId] = window.SubjectModules[subjectId];
        return window.SubjectModules[subjectId].handle;
    }
    return null;
}

/**
 * 获取科目的出题函数
 * @param {string} subjectId - 科目ID
 * @returns {Function|null} 出题函数
 */
function getSubjectGenerator(subjectId) {
    var mod = _loadedSubjects[subjectId] || window.SubjectModules[subjectId];
    if (mod && mod.generateProblem) {
        return mod.generateProblem;
    }
    return null;
}

/**
 * 获取科目模块
 * @param {string} subjectId - 科目ID
 * @returns {object|null} 科目模块
 */
function getSubjectModule(subjectId) {
    return _loadedSubjects[subjectId] || window.SubjectModules[subjectId] || null;
}

/**
 * 获取所有已注册的科目列表
 * @returns {Array} 科目信息列表
 */
function getRegisteredSubjects() {
    var subjects = [];
    for (var id in SUBJECT_FILE_MAP) {
        subjects.push({
            id: id,
            name: SUBJECT_NAMES[id] || id,
            loaded: !!(_loadedSubjects[id] || window.SubjectModules[id])
        });
    }
    return subjects;
}

/**
 * 预加载所有科目模块
 * @returns {Promise} 全部加载完成
 */
function preloadAllSubjects() {
    var promises = [];
    for (var id in SUBJECT_FILE_MAP) {
        promises.push(
            loadSubjectModule(id).catch(function(err) {
                console.warn('预加载科目失败:', err.message);
            })
        );
    }
    return Promise.all(promises);
}

/**
 * 回退内联处理器 - 当模块未加载时使用
 * 提供基本的科目响应能力
 */
var fallbackHandler = function(question, cleanQ, context) {
    var q = (question || '').toLowerCase();

    // 数学回退
    if (q.includes('计算') || q.includes('等于') || q.includes('加') || q.includes('减') || q.includes('乘') || q.includes('除')) {
        return '正在加载数学模块...请稍后再试，或刷新页面。';
    }

    // 英语回退
    if (q.includes('翻译') || q.includes('英语') || q.includes('english')) {
        return '正在加载英语模块...请稍后再试，或刷新页面。';
    }

    // 语文回退
    if (q.includes('古诗') || q.includes('成语') || q.includes('文言文')) {
        return '正在加载语文模块...请稍后再试，或刷新页面。';
    }

    // 其他科目回退
    var subjectName = SUBJECT_NAMES[context] || '该科目';
    return '正在加载' + subjectName + '模块...请稍后再试，或刷新页面。';
};

// 导出接口
window.SubjectLoader = {
    load: loadSubjectModule,
    getHandler: getSubjectHandler,
    getGenerator: getSubjectGenerator,
    getModule: getSubjectModule,
    getAll: getRegisteredSubjects,
    preloadAll: preloadAllSubjects,
    fallback: fallbackHandler
};
