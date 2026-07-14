const STORAGE_KEYS = {
  FILES: 'aika_files',
  REPORTS: 'aika_reports',
  SETTINGS: 'aika_settings'
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function readStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error('读取本地存储失败:', err);
    return defaultValue;
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('写入本地存储失败:', err);
    return false;
  }
}

function getDefaultSettings() {
  return {
    theme: 'light',
    fontSize: 'normal',
    llmEnabled: false,
    llmApiKey: '',
    llmApiBase: '',
    llmModel: '',
    autoSave: true
  };
}

function getSettings() {
  const saved = readStorage(STORAGE_KEYS.SETTINGS, {});
  return { ...getDefaultSettings(), ...saved };
}

function saveSettings(settings) {
  return writeStorage(STORAGE_KEYS.SETTINGS, settings);
}

function getFiles(folder = null) {
  const files = readStorage(STORAGE_KEYS.FILES, []);
  if (folder) {
    return files.filter(f => f.folder === folder);
  }
  return files;
}

function saveFiles(files) {
  return writeStorage(STORAGE_KEYS.FILES, files);
}

function getReports() {
  return readStorage(STORAGE_KEYS.REPORTS, []);
}

function saveReports(reports) {
  return writeStorage(STORAGE_KEYS.REPORTS, reports);
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

async function callLLM(prompt, filesInfo, options = {}) {
  const settings = getSettings();
  if (!settings.llmEnabled || !settings.llmApiKey) {
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

    console.log(`[LLM] 调用模型: ${settings.llmModel}, API: ${settings.llmApiBase}`);

    const response = await fetch(`${settings.llmApiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.llmApiKey}`
      },
      body: JSON.stringify({
        model: settings.llmModel,
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

async function uploadFile(file, folder = '工作笔记') {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileExt = file.name.split('.').pop().toLowerCase();
        let fileContent = '';
        
        if (fileExt === 'md' || fileExt === 'txt') {
          fileContent = e.target.result;
        }

        const newFile = {
          id: generateId(),
          name: file.name,
          type: fileExt,
          size: file.size,
          folder: folder,
          uploadTime: new Date().toISOString(),
          content: fileContent,
          tags: []
        };

        const settings = getSettings();
        if (settings.llmEnabled && settings.llmApiKey && fileContent) {
          try {
            const tagPrompt = `请分析以下文件内容，提取3-5个关键标签（关键词），用于知识分类和检索。

请严格按以下JSON格式返回，不要包含任何其他内容：
{"tags": ["标签1", "标签2", "标签3"]}

文件名：${file.name}
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

        const files = getFiles();
        files.unshift(newFile);
        saveFiles(files);

        resolve({ success: true, data: newFile, message: '文件上传成功' });
      } catch (err) {
        console.error('上传文件错误:', err);
        resolve({ success: false, message: '文件上传失败' });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, message: '文件读取失败' });
    };
    reader.readAsText(file, 'UTF-8');
  });
}

function deleteFile(fileId) {
  try {
    const files = getFiles();
    const index = files.findIndex(f => f.id === fileId);
    
    if (index === -1) {
      return { success: false, message: '文件不存在' };
    }
    
    const deletedFile = files[index];
    files.splice(index, 1);
    saveFiles(files);
    
    const reports = getReports();
    const filteredReports = reports.filter(r => r.fileName !== deletedFile.name);
    saveReports(filteredReports);
    
    return { success: true, message: '文件删除成功' };
  } catch (err) {
    console.error('删除文件错误:', err);
    return { success: false, message: '删除文件失败' };
  }
}

function deleteReport(reportId) {
  try {
    const reports = getReports();
    const index = reports.findIndex(r => r.id === reportId);
    
    if (index === -1) {
      return { success: false, message: '报告不存在' };
    }
    
    reports.splice(index, 1);
    saveReports(reports);
    
    return { success: true, message: '报告删除成功' };
  } catch (err) {
    console.error('删除报告错误:', err);
    return { success: false, message: '删除报告失败' };
  }
}

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

async function generateReport(fileName, fileId) {
  try {
    const files = getFiles();
    const reports = getReports();

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
      return { success: false, message: '未找到指定文件' };
    }

    const existingReport = reports.find(r => r.fileName === targetFile.name);
    if (existingReport) {
      return { success: true, data: existingReport, fromCache: true };
    }

    let report = null;

    const settings = getSettings();
    if (settings.llmEnabled && settings.llmApiKey) {
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

      console.log(`[Report] 调用LLM生成报告: ${targetFile.name}, 模型: ${settings.llmModel}`);
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
    saveReports(reports);

    return { success: true, data: report, fromCache: false };
  } catch (err) {
    console.error('生成报告错误:', err);
    return { success: false, message: '生成报告失败' };
  }
}

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
      type: 'text',
      content: q3File 
        ? `我找到了「${q3File.name}」文件。这是一份 Q3 季度总结文档，包含营收概况、产品进展、技术架构升级等重要内容。\n\n你可以点击文件查看详细内容，或者点击「生成报告」按钮获取完整的结构化分析报告。`
        : '我没有找到 Q3 季度总结相关的文件。你可以上传相关文档后再让我分析。',
      relatedFile: q3File || null
    };
  }

  if (matchedFile) {
    return {
      type: 'text',
      content: `我找到了相关文件「${matchedFile.name}」，它在「${matchedFile.folder}」文件夹中。\n\n这是一份${matchedFile.type}文件，你可以点击左侧文件查看详细内容，或者让我为你生成分析报告。`,
      files: files,
      relatedFile: matchedFile
    };
  }

  if (files.length === 0) {
    return {
      type: 'text',
      content: '你的知识库还是空的哦！点击左侧「上传文件」按钮，上传你的第一个文档，开始构建你的个人知识库吧～',
      files: []
    };
  }

  return {
    type: 'text',
    content: `我可以帮你分析知识库中的文件。你可以问我：\n• "列出所有文件"\n• "帮我总结一下Q3的内容"\n• "生成XXX文件的报告"\n\n也可以直接在左侧选择文件进行预览哦～`,
    files: files
  };
}

async function sendChatMessage(message) {
  try {
    if (!message || !message.trim()) {
      return { success: false, message: '请输入问题' };
    }

    const files = getFiles();
    const reports = getReports();
    
    const matchedFile = fuzzyMatchFile(message, files);

    const settings = getSettings();
    if (settings.llmEnabled && settings.llmApiKey) {
      const contextFiles = matchedFile ? [matchedFile] : files;
      const llmResponse = await callLLM(message, contextFiles, { useFileContent: true });
      if (llmResponse) {
        console.log(`[Chat] LLM响应成功，匹配文件: ${matchedFile ? matchedFile.name : '全部'}`);
        return { 
          success: true, 
          data: {
            type: 'text',
            content: llmResponse,
            files: files,
            relatedFile: matchedFile || null
          }
        };
      }
      console.log('[Chat] LLM调用返回null，使用降级回复');
    }

    const reply = generateAIReply(message, files, reports, matchedFile);
    return { success: true, data: reply };
  } catch (err) {
    console.error('AI对话错误:', err);
    return { success: false, message: 'AI处理失败' };
  }
}

function getKnowledgeGraph() {
  try {
    const files = getFiles();
    
    const folderColors = {
      '工作笔记': '#4A9BD9',
      '学习资料': '#34C77B',
      '生活记录': '#F5A623',
      '阅读摘录': '#9B59B6'
    };
    const defaultColors = ['#4A9BD9', '#34C77B', '#F5A623', '#9B59B6', '#E74C5E', '#1ABC9C'];
    const folderMap = {};
    let colorIdx = 0;
    
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

    const links = [];
    files.forEach(f => {
      links.push({
        source: f.id,
        target: 'folder_' + f.folder,
        value: '属于'
      });
    });

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

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        if (links.some(l => 
          (l.source === files[i].id && l.target === files[j].id) ||
          (l.source === files[j].id && l.target === files[i].id)
        )) continue;
        
        const c1 = (files[i].content || '').toLowerCase();
        const c2 = (files[j].content || '').toLowerCase();
        if (!c1 || !c2) continue;
        
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

    return { success: true, data: { nodes, links, categories } };
  } catch (err) {
    console.error('知识图谱错误:', err);
    return { success: false, message: '获取图谱数据失败' };
  }
}

async function getDailyRecommendation() {
  try {
    const files = getFiles();
    
    if (files.length === 0) {
      return { 
        success: true, 
        data: { 
          content: '上传你的第一个文件，开始构建知识库吧！',
          fileName: null
        }
      };
    }

    const contentFiles = files.filter(f => f.content && f.content.length > 50);
    if (contentFiles.length === 0) {
      return { 
        success: true, 
        data: { 
          content: '你的知识库中还没有可分析的文本文件，上传 .md 或 .txt 文件来获取智能推荐。',
          fileName: null
        }
      };
    }

    const randomFile = contentFiles[Math.floor(Math.random() * contentFiles.length)];
    
    let recommendation = null;
    const settings = getSettings();
    if (settings.llmEnabled && settings.llmApiKey) {
      const prompt = `请从以下文件内容中提取一个最有价值的知识点，用简短有趣的方式呈现，就像朋友分享知识一样。

文件名：${randomFile.name}
文件内容：
${(randomFile.content || '').substring(0, 1500)}

请直接返回知识点描述（50-100字），不要包含其他内容。`;

      recommendation = await callLLM(prompt, [randomFile], { useFileContent: false });
    }

    if (!recommendation) {
      const content = randomFile.content || '';
      const lines = content.split('\n').filter(l => l.trim().length > 10);
      const randomLine = lines[Math.floor(Math.random() * lines.length)] || content.substring(0, 100);
      recommendation = `📖 今日知识点：${randomLine.trim().substring(0, 80)}${randomLine.length > 80 ? '...' : ''}`;
    }

    return { 
      success: true, 
      data: { 
        content: recommendation,
        fileName: randomFile.name,
        fileId: randomFile.id
      }
    };
  } catch (err) {
    console.error('知识推荐错误:', err);
    return { success: false, message: '获取推荐失败' };
  }
}

function initSampleData() {
  const files = getFiles();
  if (files.length > 0) return;

  const sampleFiles = [
    {
      id: generateId(),
      name: 'Q3季度总结.md',
      type: 'md',
      size: 2048,
      folder: '工作笔记',
      uploadTime: new Date(Date.now() - 86400000 * 3).toISOString(),
      content: `# Q3季度总结

## 一、营收概况
Q3整体营收同比增长23%，达到季度目标的108%。
核心SaaS订阅收入占比提升至65%。
海外市场贡献营收占比从上季度的12%提升至18%。

## 二、产品进展
智能推荐引擎V2.0上线，推荐准确率由72%提升至89%。
移动端App 3.0版本完成全面改版。
新增企业协作模块，已签约12家企业客户。

## 三、技术架构升级
完成微服务架构迁移，核心服务可用性从99.5%提升至99.9%。
引入容器化部署方案，单次发布时间从45分钟缩短至8分钟。

## 四、团队建设
团队规模从38人扩展至45人。
建立内部技术分享机制，季度内完成12场技术讲座。

## 五、Q4展望
重点推进国际化战略。
启动AI助手2.0项目。
目标将新用户7日留存率提升至50%以上。`,
      tags: ['季度总结', '营收分析', '产品规划']
    },
    {
      id: generateId(),
      name: '产品设计原则.txt',
      type: 'txt',
      size: 1024,
      folder: '学习资料',
      uploadTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      content: `产品设计十大原则

1. 用户至上：始终将用户需求放在首位
2. 简洁为王：去除一切不必要的元素
3. 一致性：保持设计语言的统一
4. 反馈及时：用户操作后立即给出反馈
5. 容错性：允许用户犯错并提供撤销机制
6. 可访问性：确保所有用户都能使用
7. 性能优先：快速响应是基础体验
8. 情感化设计：让产品有温度
9. 持续迭代：小步快跑，不断优化
10. 数据驱动：用数据指导设计决策`,
      tags: ['产品设计', '用户体验', '设计原则']
    },
    {
      id: generateId(),
      name: '读书笔记：原子习惯.md',
      type: 'md',
      size: 1536,
      folder: '阅读摘录',
      uploadTime: new Date(Date.now() - 86400000).toISOString(),
      content: `# 《原子习惯》读书笔记

## 核心观点
习惯是自我提升的复利。
每天进步1%，一年后你会进步37倍。

## 习惯养成四步法
1. 提示：让习惯显而易见
2. 渴求：让习惯有吸引力
3. 反应：让习惯简便易行
4. 奖励：让习惯令人满足

## 实践建议
- 环境设计比意志力更重要
- 用习惯叠加建立新习惯
- 身份认同比目标设定更重要
- 两分钟规则：从极简行动开始

## 金句摘录
"你不会上升到目标的高度，你会下降到系统的水平。"
"成功是日常习惯的产物，而不是一生一次的转变的结果。"`,
      tags: ['读书笔记', '个人成长', '习惯养成']
    }
  ];

  saveFiles(sampleFiles);

  const sampleReport = {
    id: generateId(),
    title: 'Q3季度总结 · 营收与里程碑分析',
    fileName: 'Q3季度总结.md',
    folder: '工作笔记',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    description: '自动提取 Q3 季度核心数据，生成营收趋势、关键里程碑和下一步行动建议。',
    sections: [
      { heading: '一、营收概况', items: ['Q3整体营收同比增长 23%，达到季度目标的 108%。', '核心 SaaS 订阅收入占比提升至 65%。', '海外市场贡献营收占比从上季度的 12% 提升至 18%。'] },
      { heading: '二、产品进展', items: ['智能推荐引擎 V2.0 上线，推荐准确率由 72% 提升至 89%。', '移动端 App 3.0 版本完成全面改版。', '新增企业协作模块，已签约 12 家企业客户。'] },
      { heading: '三、技术架构升级', items: ['完成微服务架构迁移，核心服务可用性从 99.5% 提升至 99.9%。', '引入容器化部署方案，单次发布时间从 45 分钟缩短至 8 分钟。'] },
      { heading: '四、Q4 展望', items: ['重点推进国际化战略。', '启动 AI 助手 2.0 项目。', '目标将新用户 7 日留存率提升至 50% 以上。'] }
    ]
  };

  saveReports([sampleReport]);

  console.log('[Init] 已初始化示例数据');
}
