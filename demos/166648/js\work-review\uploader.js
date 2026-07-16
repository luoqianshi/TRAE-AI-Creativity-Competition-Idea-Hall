// ========== 工作文档上传组件 ==========

const ALLOWED_TYPES = {
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/pdf': 'pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/webp': 'image'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const AUTO_PARSE_THRESHOLD = 1 * 1024 * 1024; // 1MB

let uploadQueue = [];
let isUploading = false;

// 初始化上传组件
function initUploader() {
  const dropZone = document.getElementById('uploadDropZone');
  const fileInput = document.getElementById('uploadFileInput');
  const uploadList = document.getElementById('uploadList');

  if (!dropZone || !fileInput) return;

  // 拖拽事件
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  // 点击上传
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
}

// 处理文件列表
function handleFiles(files) {
  const validFiles = [];

  Array.from(files).forEach(file => {
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      showUploadError(`不支持的文件格式: ${file.name}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showUploadError(`文件过大: ${file.name} (最大10MB)`);
      return;
    }
    validFiles.push({
      file,
      ext,
      id: generateId(),
      status: 'pending',
      progress: 0
    });
  });

  uploadQueue.push(...validFiles);
  renderUploadList();
  processUploadQueue();
}

// 处理上传队列
async function processUploadQueue() {
  if (isUploading || uploadQueue.length === 0) return;
  isUploading = true;

  const item = uploadQueue.find(i => i.status === 'pending');
  if (!item) {
    isUploading = false;
    return;
  }

  item.status = 'uploading';
  renderUploadList();

  try {
    // 模拟上传进度
    await simulateUploadProgress(item);

    // 读取文件内容
    const content = await readFileContent(item.file, item.ext);
    item.content = content;
    item.status = 'uploaded';

    // 判断是否需要手动确认
    if (item.file.size > AUTO_PARSE_THRESHOLD) {
      item.status = 'needs-confirm';
      showConfirmDialog(item);
    } else {
      // 自动解析
      await autoParseDocument(item);
    }
  } catch (err) {
    item.status = 'error';
    item.error = err.message;
  }

  renderUploadList();
  isUploading = false;
  processUploadQueue();
}

// 模拟上传进度
function simulateUploadProgress(item) {
  return new Promise(resolve => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        resolve();
      }
      item.progress = Math.min(progress, 100);
      renderUploadList();
    }, 200);
  });
}

// 读取文件内容
function readFileContent(file, ext) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (ext === 'image') {
        // 图片文件返回 base64
        resolve({ type: 'image', data: e.target.result });
      } else {
        // 文本文件返回文本内容
        resolve({ type: 'text', data: e.target.result });
      }
    };

    reader.onerror = () => reject(new Error('文件读取失败'));

    if (ext === 'image') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
}

// 自动解析文档
async function autoParseDocument(item) {
  item.status = 'parsing';
  renderUploadList();

  try {
    // 调用后端解析API
    const result = await parseDocument(item);
    item.parsedData = result;
    item.status = 'parsed';

    // 保存到本地存储
    saveParsedDocument(item);

    // 触发归纳
    if (typeof organizeDocument === 'function') {
      organizeDocument(item);
    }
  } catch (err) {
    item.status = 'error';
    item.error = err.message;
  }

  renderUploadList();
}

// 调用后端解析API
async function parseDocument(item) {
  // 如果后端不可用，使用本地解析
  if (!API.isBackendAvailable) {
    return localParseDocument(item);
  }

  const formData = new FormData();
  formData.append('file', item.file);
  formData.append('ext', item.ext);

  const res = await fetch('/api/work-review/parse', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('解析失败');
  return await res.json();
}

// 本地解析（降级方案）
function localParseDocument(item) {
  const content = item.content?.data || '';

  const keywords = extractKeywords(content);
  const dates = extractDates(content);
  const projects = extractProjects(content);
  const skills = extractSkills(content);
  const achievements = extractAchievements(content);

  return {
    title: item.file.name.replace(/\.[^.]+$/, ''),
    date: dates[0] || new Date().toISOString().split('T')[0],
    summary: generateSmartSummary(content, keywords, achievements),
    keywords,
    projects,
    skills,
    achievements,
    rawContent: content.substring(0, 10000),
    aiInsights: generateAIInsights(content, keywords, skills, achievements),
    suggestedTags: generateSuggestedTags(content, keywords, skills)
  };
}

// 智能摘要生成
function generateSmartSummary(content, keywords, achievements) {
  if (!content || content.length < 20) return '内容过短，无法生成摘要';

  let summary = '';

  const titleMatch = content.match(/^(#{1,3}\s+.+)$/m);
  if (titleMatch) {
    summary += titleMatch[1].replace(/^#{1,3}\s*/, '') + '。';
  }

  const firstParagraph = content.split(/\n\n|\r\n\r\n/)[0]?.trim();
  if (firstParagraph && firstParagraph.length > 0) {
    const cleaned = firstParagraph.replace(/[#*`]/g, '').trim();
    summary += cleaned.substring(0, 150);
    if (cleaned.length > 150) summary += '...';
  }

  if (achievements.length > 0) {
    summary += ' 主要成果：' + achievements.slice(0, 2).join('；');
  }

  if (keywords.length > 0) {
    summary += ' 关键词：' + keywords.slice(0, 3).join('、');
  }

  return summary.substring(0, 300);
}

// 生成AI洞察（本地规则引擎模拟）
function generateAIInsights(content, keywords, skills, achievements) {
  const insights = [];

  if (skills.length > 0) {
    insights.push({
      type: 'skill',
      title: '技能匹配建议',
      content: `检测到你掌握 ${skills.join('、')} 等技能，建议在职业档案中完善相关技能条目`
    });
  }

  if (achievements.length > 0) {
    insights.push({
      type: 'achievement',
      title: '成果亮点',
      content: `识别到 ${achievements.length} 项工作成果，建议使用STAR法则整理成项目经历`
    });
  }

  if (keywords.length >= 3) {
    insights.push({
      type: 'topic',
      title: '主题分析',
      content: `文档核心主题：${keywords.slice(0, 5).join('、')}`
    });
  }

  const wordCount = content.length;
  if (wordCount > 2000) {
    insights.push({
      type: 'length',
      title: '文档建议',
      content: '文档内容丰富，建议拆分为多个项目经历或工作复盘记录'
    });
  }

  return insights;
}

// 生成建议标签
function generateSuggestedTags(content, keywords, skills) {
  const tags = new Set([...skills]);

  const tagKeywords = {
    '报告': ['分析', '报告', '总结', '汇报', '评估'],
    '项目': ['项目', '开发', '实施', '建设', '重构'],
    '复盘': ['复盘', '总结', '反思', '回顾'],
    '会议': ['会议', '讨论', '沟通', '纪要'],
    '调研': ['调研', '研究', '分析', '问卷'],
    '设计': ['设计', '方案', '规划']
  };

  Object.entries(tagKeywords).forEach(([tag, patterns]) => {
    if (patterns.some(p => content.includes(p))) {
      tags.add(tag);
    }
  });

  return [...tags].slice(0, 8);
}

// 提取关键词
function extractKeywords(text) {
  const commonWords = new Set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这']);
  const words = text.match(/[\u4e00-\u9fa5]{2,8}/g) || [];
  const freq = {};
  words.forEach(w => {
    if (!commonWords.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);
}

// 提取日期
function extractDates(text) {
  const patterns = [
    /(\d{4}[年/-]\d{1,2}[月/-]\d{1,2})/g,
    /(\d{4}[年/-]\d{1,2})/g,
    /(\d{4})/g
  ];
  const dates = [];
  patterns.forEach(p => {
    const matches = text.match(p);
    if (matches) dates.push(...matches);
  });
  return [...new Set(dates)].slice(0, 5);
}

// 提取项目名
function extractProjects(text) {
  const patterns = [
    /项目[：:]\s*([^\n]{2,30})/g,
    /【([^】]{2,30}项目[^】]*)】/g,
    /([^，。\n]{2,20}项目)/g
  ];
  const projects = [];
  patterns.forEach(p => {
    let match;
    while ((match = p.exec(text)) !== null) {
      projects.push(match[1].trim());
    }
  });
  return [...new Set(projects)].slice(0, 5);
}

// 提取技能关键词
function extractSkills(text) {
  const skillKeywords = [
    'Python', 'Java', 'JavaScript', 'React', 'Vue', 'Node.js', 'SQL',
    '数据分析', '产品设计', '项目管理', '团队协作', '沟通协调',
    '机器学习', '深度学习', 'NLP', '计算机视觉', '大数据',
    'Excel', 'PPT', 'Word', 'Photoshop', 'Figma', 'Sketch',
    '运营', '市场', '销售', '客服', '人力资源', '财务',
    '英语', '日语', '韩语', '法语', '德语'
  ];
  const found = [];
  skillKeywords.forEach(skill => {
    if (text.includes(skill)) found.push(skill);
  });
  return found;
}

// 提取成果
function extractAchievements(text) {
  const patterns = [
    /完成[了]?([^，。\n]{5,50})/g,
    /实现[了]?([^，。\n]{5,50})/g,
    /提升[了]?([^，。\n]{5,50})/g,
    /增长[了]?([^，。\n]{5,50})/g,
    /优化[了]?([^，。\n]{5,50})/g
  ];
  const achievements = [];
  patterns.forEach(p => {
    let match;
    while ((match = p.exec(text)) !== null) {
      achievements.push(match[0].trim());
    }
  });
  return achievements.slice(0, 5);
}

// 保存解析结果到本地存储
function saveParsedDocument(item) {
  const docs = JSON.parse(localStorage.getItem('workDocuments') || '[]');
  docs.push({
    id: item.id,
    title: item.parsedData?.title || item.file.name,
    date: item.parsedData?.date || new Date().toISOString(),
    summary: item.parsedData?.summary || '',
    keywords: item.parsedData?.keywords || [],
    projects: item.parsedData?.projects || [],
    skills: item.parsedData?.skills || [],
    achievements: item.parsedData?.achievements || [],
    ext: item.ext,
    uploadedAt: new Date().toISOString()
  });
  localStorage.setItem('workDocuments', JSON.stringify(docs));
}

// 显示确认对话框（大文件）
function showConfirmDialog(item) {
  const dialog = document.getElementById('uploadConfirmDialog');
  if (!dialog) return;

  dialog.innerHTML = `
    <div class="confirm-dialog-content">
      <h4>文件较大，确认解析？</h4>
      <p>${item.file.name} (${(item.file.size / 1024 / 1024).toFixed(2)}MB)</p>
      <p class="confirm-hint">大文件解析可能需要较长时间并消耗更多资源。</p>
      <div class="confirm-actions">
        <button class="btn-secondary" onclick="cancelParse('${item.id}')">取消</button>
        <button class="btn-primary" onclick="confirmParse('${item.id}')">确认解析</button>
      </div>
    </div>
  `;
  dialog.style.display = 'flex';
}

// 确认解析
function confirmParse(id) {
  const item = uploadQueue.find(i => i.id === id);
  if (item) {
    document.getElementById('uploadConfirmDialog').style.display = 'none';
    autoParseDocument(item);
  }
}

// 取消解析
function cancelParse(id) {
  const item = uploadQueue.find(i => i.id === id);
  if (item) {
    item.status = 'cancelled';
    document.getElementById('uploadConfirmDialog').style.display = 'none';
    renderUploadList();
  }
}

// 渲染上传列表
function renderUploadList() {
  const container = document.getElementById('uploadList');
  if (!container) return;

  if (uploadQueue.length === 0) {
    container.innerHTML = '<div class="upload-empty">暂无上传文件</div>';
    return;
  }

  container.innerHTML = uploadQueue.map(item => {
    const statusLabels = {
      pending: '等待中',
      uploading: '上传中',
      uploaded: '已上传',
      'needs-confirm': '需确认',
      parsing: '解析中',
      parsed: '已解析',
      error: '失败',
      cancelled: '已取消'
    };

    return `
      <div class="upload-item ${item.status}">
        <div class="upload-item-icon">${getFileIcon(item.ext)}</div>
        <div class="upload-item-info">
          <div class="upload-item-name">${item.file.name}</div>
          <div class="upload-item-meta">
            <span>${(item.file.size / 1024).toFixed(1)}KB</span>
            <span class="upload-item-status">${statusLabels[item.status] || item.status}</span>
          </div>
          ${item.status === 'uploading' || item.status === 'parsing' ? `
            <div class="upload-progress-bar">
              <div class="upload-progress-fill" style="width:${item.progress}%"></div>
            </div>
          ` : ''}
          ${item.error ? `<div class="upload-item-error">${item.error}</div>` : ''}
        </div>
        <button class="upload-item-remove" onclick="removeUpload('${item.id}')">&times;</button>
      </div>
    `;
  }).join('');
}

// 获取文件图标
function getFileIcon(ext) {
  const icons = {
    txt: '&#128196;',
    md: '&#128221;',
    docx: '&#128190;',
    pdf: '&#128195;',
    image: '&#128444;'
  };
  return icons[ext] || '&#128196;';
}

// 移除上传项
function removeUpload(id) {
  uploadQueue = uploadQueue.filter(i => i.id !== id);
  renderUploadList();
}

// 显示上传错误
function showUploadError(msg) {
  const container = document.getElementById('uploadErrors');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'upload-error-msg';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 获取已解析的文档列表
function getParsedDocuments() {
  return JSON.parse(localStorage.getItem('workDocuments') || '[]');
}

// 删除文档
function deleteDocument(id) {
  const docs = getParsedDocuments().filter(d => d.id !== id);
  localStorage.setItem('workDocuments', JSON.stringify(docs));
  return docs;
}
