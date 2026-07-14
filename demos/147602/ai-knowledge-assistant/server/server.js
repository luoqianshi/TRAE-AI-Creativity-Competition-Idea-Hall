const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/pages', express.static(path.join(__dirname, '..', 'pages')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'index.html'));
});

app.get('/main-v2.html', (req, res) => {
  res.redirect('/pages/main-v2.html');
});

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FILES_DB = path.join(DATA_DIR, 'files.json');
const REPORTS_DB = path.join(DATA_DIR, 'reports.json');
const SETTINGS_DB = path.join(DATA_DIR, 'settings.json');

const LLM_CONFIG = {
  enabled: process.env.LLM_ENABLED === 'true',
  apiKey: process.env.LLM_API_KEY || '',
  apiBase: process.env.LLM_API_BASE || 'https://api.openai.com/v1',
  model: process.env.LLM_MODEL || 'gpt-3.5-turbo'
};

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 启动时从 settings.json 加载已保存的LLM配置，避免重启后配置丢失
const savedSettings = readJSON(SETTINGS_DB);
if (savedSettings.llmEnabled && savedSettings.llmApiKey) {
  LLM_CONFIG.enabled = true;
  LLM_CONFIG.apiKey = savedSettings.llmApiKey;
  LLM_CONFIG.apiBase = savedSettings.llmApiBase || LLM_CONFIG.apiBase;
  LLM_CONFIG.model = savedSettings.llmModel || LLM_CONFIG.model;
  console.log('[Startup] 已从 settings.json 加载LLM配置，模型:', LLM_CONFIG.model);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function callLLM(prompt, filesInfo, options = {}) {
  if (!LLM_CONFIG.enabled || !LLM_CONFIG.apiKey) {
    return null;
  }

  try {
    const contextFiles = options.useFileContent && filesInfo
      ? filesInfo.map(f => {
          const content = f.content || '';
          const truncatedContent = content.length > 8000 ? content.substring(0, 8000) + '\n...（内容已截断）' : content;
          return `文件名：${f.name}\n文件夹：${f.folder}\n类型：${f.type}\n内容：\n${truncatedContent || '（无文本内容）'}`;
        }).join('\n\n---\n\n')
      : filesInfo.map(f => `- ${f.name}（${f.folder}）`).join('\n');

    const systemPrompt = options.systemPrompt || `你是一个专业的AI知识助理，你的任务是帮助用户分析他们的知识库文件。\n\n知识库文件信息：\n${contextFiles}\n\n请根据用户的问题和知识库内容进行回答。如果用户询问特定文件，请查找相关文件内容并进行分析。你的回答应该友好、专业、准确。`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    console.log(`[LLM] 调用模型: ${LLM_CONFIG.model}, API: ${LLM_CONFIG.apiBase}`);

    const response = await fetch(`${LLM_CONFIG.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: LLM_CONFIG.model,
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[LLM] HTTP错误 ${response.status}:`, errorText);
      return null;
    }

    const result = await response.json();
    console.log('[LLM] 响应结果:', JSON.stringify(result).substring(0, 200));
    
    if (result.choices && result.choices.length > 0) {
      return result.choices[0].message.content;
    }
    
    if (result.error) {
      console.error('[LLM] API错误:', result.error);
      return null;
    }
    
    return null;
  } catch (err) {
    console.error('[LLM] 调用失败:', err.message);
    return null;
  }
}

function fuzzyMatchFile(message, files) {
  const msgLower = message.toLowerCase();
  const results = [];

  files.forEach(file => {
    const fileName = file.name.toLowerCase();
    const fileNameWithoutExt = fileName.replace(/\.[^.]+$/, '');
    const folderName = file.folder.toLowerCase();
    
    let score = 0;
    
    if (fileName.includes(msgLower)) score += 10;
    else if (fileNameWithoutExt.includes(msgLower)) score += 8;
    
    if (msgLower.includes(fileNameWithoutExt)) score += 15;
    
    const words = msgLower.split(/[\s，,。.!?？！]+/);
    words.forEach(word => {
      if (word.length > 1 && fileNameWithoutExt.includes(word)) score += 2;
    });
    
    if (folderName.includes(msgLower) || msgLower.includes(folderName)) score += 3;
    
    if (score > 0) {
      results.push({ file, score });
    }
  });

  results.sort((a, b) => b.score - a.score);
  
  return results.length > 0 ? results[0].file : null;
}

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]/g, '_');
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf-8');
    const sanitizedName = sanitizeFilename(originalName);
    const uniqueName = generateId() + '_' + sanitizedName;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

app.get('/api/files', (req, res) => {
  const files = readJSON(FILES_DB);
  const { folder } = req.query;
  let result = files;
  if (folder) {
    result = files.filter(f => f.folder === folder);
  }
  res.json({ success: true, data: result });
});

app.delete('/api/files/:id', (req, res) => {
  try {
    const fileId = req.params.id;
    const files = readJSON(FILES_DB);
    const index = files.findIndex(f => f.id === fileId);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }
    
    const deletedFile = files[index];
    
    if (deletedFile.storedName) {
      const filePath = path.join(UPLOADS_DIR, deletedFile.storedName);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('删除文件失败:', err);
      }
    }
    
    files.splice(index, 1);
    writeJSON(FILES_DB, files);
    
    const reports = readJSON(REPORTS_DB);
    const filteredReports = reports.filter(r => r.fileName !== deletedFile.name);
    writeJSON(REPORTS_DB, filteredReports);
    
    res.json({ success: true, message: '文件删除成功' });
  } catch (err) {
    console.error('删除文件错误:', err);
    res.status(500).json({ success: false, message: '删除文件失败' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '未接收到文件' });
    }

    const folder = req.body.folder || '工作笔记';
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf-8');
    const fileExt = path.extname(originalName).toLowerCase().replace('.', '');
    
    let fileContent = '';
    if (fileExt === 'md' || fileExt === 'txt') {
      try {
        fileContent = fs.readFileSync(req.file.path, 'utf-8');
      } catch (err) {
        console.error('读取文件内容失败:', err);
      }
    }
    
    const newFile = {
      id: generateId(),
      name: originalName,
      type: fileExt,
      size: req.file.size,
      folder: folder,
      uploadTime: new Date().toISOString(),
      storedName: req.file.filename,
      content: fileContent,
      tags: []
    };

    // AI 自动生成标签
    if (LLM_CONFIG.enabled && LLM_CONFIG.apiKey && fileContent) {
      try {
        const tagPrompt = `请分析以下文件内容，提取3-5个关键标签（关键词），用于知识分类和检索。

请严格按以下JSON格式返回，不要包含任何其他内容：
{"tags": ["标签1", "标签2", "标签3"]}

文件名：${originalName}
文件内容（前2000字）：
${fileContent.substring(0, 2000)}`;

        const tagResult = await callLLM(tagPrompt, [], {});
        if (tagResult) {
          const tagMatch = tagResult.match(/\{[\s\S]*\}/);
          if (tagMatch) {
            const parsed = JSON.parse(tagMatch[0]);
            if (parsed.tags && Array.isArray(parsed.tags)) {
              newFile.tags = parsed.tags.slice(0, 5);
              console.log(`[Upload] AI生成标签: ${newFile.tags.join(', ')}`);
            }
          }
        }
      } catch (tagErr) {
        console.error('[Upload] 标签生成失败:', tagErr.message);
      }
    }

    const files = readJSON(FILES_DB);
    files.unshift(newFile);
    writeJSON(FILES_DB, files);

    res.json({ success: true, data: newFile, message: '文件上传成功' });
  } catch (err) {
    console.error('上传文件错误:', err);
    res.status(500).json({ success: false, message: '文件上传失败' });
  }
});

app.get('/api/reports', (req, res) => {
  const reports = readJSON(REPORTS_DB);
  res.json({ success: true, data: reports });
});

app.delete('/api/reports/:id', (req, res) => {
  try {
    const reportId = req.params.id;
    const reports = readJSON(REPORTS_DB);
    const index = reports.findIndex(r => r.id === reportId);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: '报告不存在' });
    }
    
    reports.splice(index, 1);
    writeJSON(REPORTS_DB, reports);
    
    res.json({ success: true, message: '报告删除成功' });
  } catch (err) {
    console.error('删除报告错误:', err);
    res.status(500).json({ success: false, message: '删除报告失败' });
  }
});

app.get('/api/settings', (req, res) => {
  const settings = readJSON(SETTINGS_DB);
  const defaultSettings = {
    theme: 'light',
    fontSize: 'normal',
    llmEnabled: false,
    llmApiKey: '',
    llmApiBase: 'https://api.openai.com/v1',
    llmModel: 'gpt-3.5-turbo',
    autoSave: true
  };
  res.json({ success: true, data: { ...defaultSettings, ...settings } });
});

app.post('/api/settings', (req, res) => {
  try {
    const settings = req.body;
    writeJSON(SETTINGS_DB, settings);
    
    if (settings.llmEnabled && settings.llmApiKey) {
      LLM_CONFIG.enabled = true;
      LLM_CONFIG.apiKey = settings.llmApiKey;
      LLM_CONFIG.apiBase = settings.llmApiBase || 'https://api.openai.com/v1';
      LLM_CONFIG.model = settings.llmModel || 'gpt-3.5-turbo';
    } else {
      LLM_CONFIG.enabled = false;
    }
    
    res.json({ success: true, message: '设置保存成功' });
  } catch (err) {
    console.error('保存设置错误:', err);
    res.status(500).json({ success: false, message: '保存设置失败' });
  }
});

app.post('/api/report', async (req, res) => {
  try {
    const { fileName, fileId } = req.body;
    const files = readJSON(FILES_DB);
    const reports = readJSON(REPORTS_DB);

    let targetFile = null;
    if (fileId) {
      targetFile = files.find(f => f.id === fileId);
    } else if (fileName) {
      targetFile = files.find(f => f.name === fileName);
      if (!targetFile) {
        targetFile = fuzzyMatchFile(fileName, files);
      }
    }

    if (!targetFile) {
      return res.status(404).json({ success: false, message: '未找到指定文件' });
    }

    const existingReport = reports.find(r => r.fileName === targetFile.name);
    if (existingReport) {
      return res.json({ success: true, data: existingReport, fromCache: true });
    }

    let report = null;

    if (LLM_CONFIG.enabled && LLM_CONFIG.apiKey) {
      const prompt = `请分析以下文件，并生成一份结构化的中文分析报告。报告必须包含标题、描述和若干章节。

请严格按以下JSON格式返回，不要包含任何其他内容（如markdown代码块标记）：
{
  "title": "报告标题",
  "description": "报告简短描述",
  "sections": [
    { "heading": "章节标题", "items": ["要点1", "要点2", "要点3"] },
    { "heading": "章节标题", "items": ["要点1", "要点2"] }
  ]
}

文件信息：
文件名：${targetFile.name}
文件类型：${targetFile.type}
所属文件夹：${targetFile.folder}`;

      console.log(`[Report] 调用LLM生成报告: ${targetFile.name}, 模型: ${LLM_CONFIG.model}`);
      const llmContent = await callLLM(prompt, [targetFile], { useFileContent: true });

      if (llmContent) {
        try {
          const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : llmContent);
          report = {
            id: generateId(),
            title: parsed.title || `${targetFile.name} · 智能分析报告`,
            fileName: targetFile.name,
            folder: targetFile.folder,
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: parsed.description || '基于文件内容自动提取关键信息，生成结构化分析摘要。',
            sections: Array.isArray(parsed.sections) ? parsed.sections : []
          };
        } catch (parseErr) {
          console.error('[Report] LLM返回JSON解析失败:', parseErr.message);
          console.error('[Report] LLM原始输出:', llmContent.substring(0, 800));
        }
      }
    }

    if (!report) {
      console.log(`[Report] LLM未返回有效结果，使用降级模板: ${targetFile.name}`);
      report = generateMockReport(targetFile);
    }

    reports.unshift(report);
    writeJSON(REPORTS_DB, reports);

    res.json({ success: true, data: report, fromCache: false });
  } catch (err) {
    console.error('生成报告错误:', err);
    res.status(500).json({ success: false, message: '生成报告失败' });
  }
});

function generateMockReport(file) {
  const reportTemplates = {
    'Q3季度总结.md': {
      title: 'Q3季度总结 · 营收与里程碑分析',
      description: '自动提取 Q3 季度核心数据，生成营收趋势、关键里程碑和下一步行动建议。',
      sections: [
        { heading: '一、营收概况', items: ['Q3整体营收同比增长 23%，达到季度目标的 108%。', '核心 SaaS 订阅收入占比提升至 65%。', '海外市场贡献营收占比从上季度的 12% 提升至 18%。'] },
        { heading: '二、产品进展', items: ['智能推荐引擎 V2.0 上线，推荐准确率由 72% 提升至 89%。', '移动端 App 3.0 版本完成全面改版。', '新增企业协作模块，已签约 12 家企业客户。'] },
        { heading: '三、技术架构升级', items: ['完成微服务架构迁移，核心服务可用性从 99.5% 提升至 99.9%。', '引入容器化部署方案，单次发布时间从 45 分钟缩短至 8 分钟。'] },
        { heading: '四、团队建设', items: ['团队规模从 38 人扩展至 45 人。', '建立内部技术分享机制，季度内完成 12 场技术讲座。'] },
        { heading: '五、Q4 展望', items: ['重点推进国际化战略。', '启动 AI 助手 2.0 项目。', '目标将新用户 7 日留存率提升至 50% 以上。'] }
      ]
    },
    '会议记录.txt': {
      title: '会议记录 · 决策事项与待办提取',
      description: '自动识别会议记录中的决策事项、待办任务和负责人，生成结构化汇总。',
      sections: [
        { heading: '一、决策事项', items: ['确定Q4重点方向：国际化战略', '批准新增3个HC', '移动端App 3.0改版项目正式立项'] },
        { heading: '二、待办任务', items: ['张工：完成推荐算法优化方案', '李经理：准备Q3汇报PPT', '王产品：输出用户调研报告'] },
        { heading: '三、关键风险点', items: ['国际化团队组建可能存在人才缺口', 'Q3季度总结材料准备时间紧张'] }
      ]
    }
  };

  let template = reportTemplates[file.name];
  if (!template) {
    template = {
      title: file.name + ' · 智能分析报告',
      description: '基于文件内容自动提取关键信息，生成结构化分析摘要。',
      sections: [
        { heading: '一、文件概述', items: [`文件名称：${file.name}`, `文件类型：${file.type}`, `所属文件夹：${file.folder}`] },
        { heading: '二、核心要点', items: ['要点1：根据文件内容提取的第一条核心信息', '要点2：根据文件内容提取的第二条核心信息', '要点3：根据文件内容提取的第三条核心信息'] },
        { heading: '三、建议与行动', items: ['建议1：基于分析结果给出的第一条建议', '建议2：基于分析结果给出的第二条建议'] }
      ]
    };
  }

  return {
    id: generateId(),
    title: template.title,
    fileName: file.name,
    folder: file.folder,
    status: 'completed',
    createdAt: new Date().toISOString(),
    description: template.description,
    sections: template.sections
  };
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: '请输入问题' });
    }

    const files = readJSON(FILES_DB);
    const reports = readJSON(REPORTS_DB);
    
    const matchedFile = fuzzyMatchFile(message, files);

    if (LLM_CONFIG.enabled && LLM_CONFIG.apiKey) {
      const contextFiles = matchedFile ? [matchedFile] : files;
      const llmResponse = await callLLM(message, contextFiles, { useFileContent: true });
      if (llmResponse) {
        console.log(`[Chat] LLM响应成功，匹配文件: ${matchedFile ? matchedFile.name : '全部'}`);
        return res.json({ 
          success: true, 
          data: {
            type: 'text',
            content: llmResponse,
            files: files,
            relatedFile: matchedFile || null
          }
        });
      }
      console.log('[Chat] LLM调用返回null，使用降级回复');
    }

    const reply = generateAIReply(message, files, reports, matchedFile);
    res.json({ success: true, data: reply });
  } catch (err) {
    console.error('AI对话错误:', err);
    res.status(500).json({ success: false, message: 'AI处理失败' });
  }
});

// 知识图谱数据接口
app.get('/api/graph', (req, res) => {
  try {
    const files = readJSON(FILES_DB);
    
    const folderColors = {
      '工作笔记': '#4A9BD9',
      '学习资料': '#34C77B',
      '生活记录': '#F5A623',
      '阅读摘录': '#9B59B6'
    };
    const defaultColors = ['#4A9BD9', '#34C77B', '#F5A623', '#9B59B6', '#E74C5E', '#1ABC9C'];
    const folderMap = {};
    let colorIdx = 0;
    
    // 节点：文件
    const nodes = files.map(f => {
      const color = folderColors[f.folder] || defaultColors[colorIdx++ % defaultColors.length];
      folderMap[f.folder] = folderMap[f.folder] || color;
      return {
        id: f.id,
        name: f.name,
        symbolSize: Math.max(30, Math.min(60, (f.content || '').length / 50 + 30)),
        category: f.folder,
        itemStyle: { color },
        label: { show: true, fontSize: 11 },
        value: {
          fileId: f.id,
          fileName: f.name,
          folder: f.folder,
          type: f.type,
          tags: f.tags || []
        }
      };
    });

    // 文件夹节点
    const folders = [...new Set(files.map(f => f.folder))];
    folders.forEach(folder => {
      const color = folderColors[folder] || defaultColors[colorIdx++ % defaultColors.length];
      nodes.push({
        id: 'folder_' + folder,
        name: folder,
        symbolSize: 45,
        category: '文件夹',
        itemStyle: { color, opacity: 0.7 },
        label: { show: true, fontSize: 12, fontWeight: 'bold' },
        value: { type: 'folder', folder }
      });
    });

    // 边：文件 -> 所属文件夹
    const links = [];
    files.forEach(f => {
      links.push({
        source: f.id,
        target: 'folder_' + f.folder,
        value: '属于'
      });
    });

    // 边：共享标签的文件之间连线
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const tags1 = files[i].tags || [];
        const tags2 = files[j].tags || [];
        const sharedTags = tags1.filter(t => tags2.includes(t));
        if (sharedTags.length > 0) {
          links.push({
            source: files[i].id,
            target: files[j].id,
            value: sharedTags.join(', '),
            lineStyle: { type: 'dashed', color: '#E74C5E', width: sharedTags.length }
          });
        }
      }
    }

    // 边：内容关键词关联（简单分词匹配）
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        if (links.some(l => 
          (l.source === files[i].id && l.target === files[j].id) ||
          (l.source === files[j].id && l.target === files[i].id)
        )) continue;
        
        const c1 = (files[i].content || '').toLowerCase();
        const c2 = (files[j].content || '').toLowerCase();
        if (!c1 || !c2) continue;
        
        // 提取共同的高频词
        const words1 = new Set(c1.match(/[\u4e00-\u9fa5]{2,}/g) || []);
        const common = [...words1].filter(w => c2.includes(w)).slice(0, 3);
        
        if (common.length >= 2) {
          links.push({
            source: files[i].id,
            target: files[j].id,
            value: '内容关联',
            lineStyle: { type: 'dotted', color: '#8C99A8', width: 1 }
          });
        }
      }
    }

    const categories = folders.map(f => ({ name: f }));
    categories.push({ name: '文件夹' });

    res.json({ 
      success: true, 
      data: { nodes, links, categories }
    });
  } catch (err) {
    console.error('知识图谱错误:', err);
    res.status(500).json({ success: false, message: '获取图谱数据失败' });
  }
});

// 今日知识推荐接口
app.get('/api/recommend', async (req, res) => {
  try {
    const files = readJSON(FILES_DB);
    
    if (files.length === 0) {
      return res.json({ 
        success: true, 
        data: { 
          content: '上传你的第一个文件，开始构建知识库吧！',
          fileName: null
        }
      });
    }

    // 随机选一个有内容的文件
    const contentFiles = files.filter(f => f.content && f.content.length > 50);
    if (contentFiles.length === 0) {
      return res.json({ 
        success: true, 
        data: { 
          content: '你的知识库中还没有可分析的文本文件，上传 .md 或 .txt 文件来获取智能推荐。',
          fileName: null
        }
      });
    }

    const randomFile = contentFiles[Math.floor(Math.random() * contentFiles.length)];
    
    let recommendation = null;
    if (LLM_CONFIG.enabled && LLM_CONFIG.apiKey) {
      const prompt = `请从以下文件内容中提取一个最有价值的知识点，用简短有趣的方式呈现，就像朋友分享知识一样。

文件名：${randomFile.name}
文件内容：
${(randomFile.content || '').substring(0, 1500)}

请直接返回知识点描述（50-100字），不要包含其他内容。`;

      recommendation = await callLLM(prompt, [randomFile], { useFileContent: false });
    }

    if (!recommendation) {
      // 降级：从内容中提取摘要
      const content = randomFile.content || '';
      const lines = content.split('\n').filter(l => l.trim().length > 10);
      const randomLine = lines[Math.floor(Math.random() * lines.length)] || content.substring(0, 100);
      recommendation = `📖 今日知识点：${randomLine.trim().substring(0, 80)}${randomLine.length > 80 ? '...' : ''}`;
    }

    res.json({ 
      success: true, 
      data: { 
        content: recommendation,
        fileName: randomFile.name,
        fileId: randomFile.id
      }
    });
  } catch (err) {
    console.error('知识推荐错误:', err);
    res.status(500).json({ success: false, message: '获取推荐失败' });
  }
});

function generateAIReply(message, files, reports, matchedFile) {
  const msg = message.toLowerCase();

  if (msg.includes('列出文件') || msg.includes('有哪些文件') || msg.includes('文件列表') || msg.includes('知识库')) {
    const folderMatch = message.match(/(工作笔记|学习资料|生活记录|阅读摘录)/);
    let targetFolder = folderMatch ? folderMatch[1] : null;
    let filteredFiles = targetFolder ? files.filter(f => f.folder === targetFolder) : files;
    
    const folders = {};
    filteredFiles.forEach(f => {
      if (!folders[f.folder]) folders[f.folder] = [];
      folders[f.folder].push(f.name);
    });

    let replyText = '';
    if (targetFolder) {
      replyText = `你的「${targetFolder}」文件夹中共有 ${filteredFiles.length} 个文件：${filteredFiles.map(f => f.name).join('、')}。`;
    } else {
      replyText = `你的知识库中共有 ${filteredFiles.length} 个文件，分布在 ${Object.keys(folders).length} 个文件夹中：\n`;
      for (const [folder, fileList] of Object.entries(folders)) {
        replyText += `📁 ${folder}（${fileList.length}个）：${fileList.join('、')}\n`;
      }
    }

    return {
      type: 'text',
      content: replyText,
      files: filteredFiles
    };
  }

  if (msg.includes('总结') && (msg.includes('q3') || msg.includes('Q3') || msg.includes('三季度') || msg.includes('第三季度'))) {
    const q3File = files.find(f => f.name.includes('Q3') || f.name.includes('q3'));
    const q3Report = reports.find(r => r.fileName && (r.fileName.includes('Q3') || r.fileName.includes('q3')));
    
    return {
      type: 'report',
      content: q3File 
        ? `好的，我已经为你生成了 Q3 季度总结的分析报告，你可以在右侧「AI 生成内容」面板中查看完整报告。`
        : `我在知识库中没有找到 Q3 季度总结相关的文件，请先上传相关文档。`,
      report: q3Report || null,
      relatedFile: q3File || null
    };
  }

  if (msg.includes('你好') || msg.includes('hi') || msg.includes('hello') || msg.includes('您好')) {
    return {
      type: 'text',
      content: '你好！我是你的AI知识助理。你可以向我提问关于你知识库中的任何内容，我会帮你整理、总结和分析。试试问我一个问题吧！'
    };
  }

  if (msg.includes('报告') || msg.includes('分析') || msg.includes('生成')) {
    if (matchedFile) {
      const existingReport = reports.find(r => r.fileName === matchedFile.name);
      return {
        type: 'report',
        content: `好的，我正在为你分析「${matchedFile.name}」，请稍候...`,
        report: existingReport || null,
        relatedFile: matchedFile
      };
    }
    
    return {
      type: 'text',
      content: '请问你想要分析哪个文件？你可以告诉我文件名，或者点击文件后再让我分析。'
    };
  }

  if (msg.includes('帮助') || msg.includes('怎么用') || msg.includes('使用')) {
    return {
      type: 'text',
      content: `我可以帮你做以下事情：\n1. 📁 列出文件 - 问问我"有哪些文件"\n2. 📝 总结文档 - 比如"总结一下Q3季度总结"\n3. 📊 生成报告 - 比如"分析项目需求文档"\n4. ❓ 回答问题 - 基于你的知识库内容回答问题\n\n试试上传一些文件，然后向我提问吧！`
    };
  }

  if (matchedFile) {
    const fileContent = matchedFile.content || '';
    if (fileContent.length > 0) {
      const summary = `我在知识库中找到了相关文件「${matchedFile.name}」。\n\n文件内容摘要：\n${fileContent.substring(0, 300)}${fileContent.length > 300 ? '...' : ''}\n\n请问你想让我帮你分析或总结这份文件的哪个方面？`;
      return {
        type: 'text',
        content: summary,
        relatedFile: matchedFile
      };
    }
    
    return {
      type: 'text',
      content: `我在知识库中找到了相关文件「${matchedFile.name}」。你想让我帮你分析这份文件吗？`,
      relatedFile: matchedFile
    };
  }

  return {
    type: 'text',
    content: `我理解你的问题是关于「${message}」的。目前我可以帮你：\n\n• 询问知识库中有哪些文件\n• 对指定文件生成分析报告\n• 总结文档内容\n\n你可以尝试问我："有哪些文件？" 或者 "总结Q3季度总结"`
  };
}

const { exec } = require('child_process');

async function getPortPID(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr ":${port}.*LISTENING"`, (err, stdout) => {
      if (err) {
        resolve(null);
        return;
      }
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          resolve(parts[parts.length - 1]);
          return;
        }
      }
      resolve(null);
    });
  });
}

const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  🤖 个人AI知识助理 - 后端服务启动成功!`);
  console.log(`========================================`);
  console.log(`  🌐 服务地址: http://localhost:${PORT}`);
  console.log(`  📄 主页地址: http://localhost:${PORT}/pages/main-v2.html`);
  console.log(`  📁 上传目录: ${UPLOADS_DIR}`);
  console.log(`  💾 数据目录: ${DATA_DIR}`);
  console.log(`  🧠 LLM模式: ${LLM_CONFIG.enabled ? '已启用' : '模拟模式'}`);
  if (LLM_CONFIG.enabled) {
    console.log(`  🤝 LLM接口: ${LLM_CONFIG.apiBase}`);
    console.log(`  🤖 LLM模型: ${LLM_CONFIG.model}`);
  }
  console.log(`========================================\n`);
});

server.on('error', async (err) => {
  if (err.code === 'EADDRINUSE') {
    const pid = await getPortPID(PORT);
    console.error(`\n❌ 端口 ${PORT} 已被占用!`);
    if (pid) {
      console.error(`   占用进程 PID: ${pid}`);
      console.error(`   请执行以下命令终止进程后重试:`);
      console.error(`   taskkill /PID ${pid} /F`);
    } else {
      console.error(`   无法获取占用进程信息，请手动查找并终止占用端口 ${PORT} 的进程`);
    }
    process.exit(1);
  } else {
    console.error(`❌ 服务启动失败:`, err.message);
    process.exit(1);
  }
});
