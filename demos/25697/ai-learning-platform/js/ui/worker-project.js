        // ========== Worker: Project Detail ==========
        function renderProjectDetail(project) {
            const container = document.getElementById('projectContent');

            if (project.type === 'files') {
                renderFileManager(container, project);
            } else if (project.type === 'dev') {
                renderDevPanel(container, project);
            } else if (project.type === 'ppt') {
                renderPPTPanel(container, project);
            } else if (project.type === 'video') {
                renderVideoPanel(container, project);
            } else if (project.type === 'writing') {
                renderWritingPanel(container, project);
            } else if (project.type === 'plan') {
                renderPlanPanel(container, project);
            } else if (project.type === 'spreadsheet') {
                renderSpreadsheetPanel(container, project);
            } else {
                renderCustomProject(container, project);
            }
        }

        // ========== File Manager ==========
        function renderFileManager(container, project) {
            // 确保项目有文件数组
            if (!project.files) project.files = [];

            // 初始化项目统计信息
            if (!project.stats) {
                project.stats = {
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                };
            }
            project.stats.lastActive = new Date().toISOString();

            // 排序状态
            if (!project._sort) project._sort = { key: 'name', asc: true };

            function refreshFiles() {
                renderFileManager(container, project);
            }

            function addFile() {
                const name = prompt('请输入文件名（如：report.docx）：');
                if (name && name.trim()) {
                    const ext = name.split('.').pop().toLowerCase();
                    let type = 'doc';
                    if (['jpg','jpeg','png','gif','webp'].includes(ext)) type = 'img';
                    else if (['js','py','java','cpp','c','html','css','json','xml'].includes(ext)) type = 'code';
                    else if (['ppt','pptx'].includes(ext)) type = 'ppt';
                    else if (['xls','xlsx','csv'].includes(ext)) type = 'sheet';
                    project.files.push({
                        name: name.trim(),
                        type: type,
                        size: (Math.random() * 5 + 0.1).toFixed(1) + ' MB',
                        date: new Date().toISOString().split('T')[0]
                    });
                    refreshFiles();
                    showToast('success', '文件已添加');
                    // 持久化保存项目数据
                    if (typeof StorageManager !== 'undefined' && typeof StorageManager.saveData === 'function') {
                        StorageManager.saveData('worker_projects', state.projects);
                    }
                }
            }

            function addFolder() {
                const name = prompt('请输入文件夹名称：');
                if (name && name.trim()) {
                    project.files.push({
                        name: name.trim(),
                        type: 'folder',
                        items: 0,
                        date: new Date().toISOString().split('T')[0]
                    });
                    refreshFiles();
                    showToast('success', '文件夹已创建');
                    // 持久化保存项目数据
                    if (typeof StorageManager !== 'undefined' && typeof StorageManager.saveData === 'function') {
                        StorageManager.saveData('worker_projects', state.projects);
                    }
                }
            }

            function deleteFile(idx) {
                if (confirm('确定要删除「' + project.files[idx].name + '」吗？')) {
                    project.files.splice(idx, 1);
                    refreshFiles();
                    showToast('success', '已删除');
                    // 持久化保存项目数据
                    if (typeof StorageManager !== 'undefined' && typeof StorageManager.saveData === 'function') {
                        StorageManager.saveData('worker_projects', state.projects);
                    }
                }
            }

            // 文件重命名功能
            function renameFile(idx) {
                const file = project.files[idx];
                const newName = prompt('请输入新文件名：', file.name);
                if (newName && newName.trim() && newName.trim() !== file.name) {
                    file.name = newName.trim();
                    // 更新类型
                    const ext = file.name.split('.').pop().toLowerCase();
                    if (file.type !== 'folder') {
                        if (['jpg','jpeg','png','gif','webp'].includes(ext)) file.type = 'img';
                        else if (['js','py','java','cpp','c','html','css','json','xml'].includes(ext)) file.type = 'code';
                        else if (['ppt','pptx'].includes(ext)) file.type = 'ppt';
                        else if (['xls','xlsx','csv'].includes(ext)) file.type = 'sheet';
                        else file.type = 'doc';
                    }
                    refreshFiles();
                    showToast('success', '重命名成功');
                    // 持久化保存项目数据
                    if (typeof StorageManager !== 'undefined' && typeof StorageManager.saveData === 'function') {
                        StorageManager.saveData('worker_projects', state.projects);
                    }
                }
            }

            // 文件排序功能
            function sortFiles(key) {
                if (project._sort.key === key) {
                    project._sort.asc = !project._sort.asc;
                } else {
                    project._sort.key = key;
                    project._sort.asc = true;
                }
                refreshFiles();
            }

            // 执行排序
            const sortKey = project._sort.key;
            const sortAsc = project._sort.asc;
            const sortedFiles = [...project.files].sort((a, b) => {
                let valA, valB;
                if (sortKey === 'name') {
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                } else if (sortKey === 'date') {
                    valA = a.date || '';
                    valB = b.date || '';
                } else if (sortKey === 'size') {
                    valA = parseFloat((a.size || '0').replace(' MB', '')) || 0;
                    valB = parseFloat((b.size || '0').replace(' MB', '')) || 0;
                } else {
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                }
                if (valA < valB) return sortAsc ? -1 : 1;
                if (valA > valB) return sortAsc ? 1 : -1;
                return 0;
            });

            function deleteFile(idx) {
                if (confirm('确定要删除「' + project.files[idx].name + '」吗？')) {
                    project.files.splice(idx, 1);
                    refreshFiles();
                    showToast('success', '已删除');
                    // 持久化保存项目数据
                    if (typeof StorageManager !== 'undefined' && typeof StorageManager.saveData === 'function') {
                        StorageManager.saveData('worker_projects', state.projects);
                    }
                }
            }

            let filesHtml = '';
            sortedFiles.forEach((file, sortedIdx) => {
                // 找到原始索引用于删除操作
                const originalIdx = project.files.indexOf(file);
                const iconMap = {
                    folder: 'fa-folder',
                    img: 'fa-image',
                    code: 'fa-code',
                    ppt: 'fa-file-powerpoint',
                    sheet: 'fa-table',
                    doc: 'fa-file-alt'
                };
                const iconName = iconMap[file.type] || 'fa-file';
                filesHtml += `
                    <div class="file-item">
                        <div class="file-icon ${file.type}"><i class="fas ${iconName}"></i></div>
                        <div class="file-info">
                            <div class="name" onclick="window._renameFile && window._renameFile(${originalIdx})" title="点击重命名" style="cursor:pointer;">${file.name}</div>
                            <div class="meta">${file.type === 'folder' ? (file.items + ' 项') : (file.size || '')} · ${file.date}</div>
                        </div>
                        <div class="file-actions">
                            <button onclick="showToast('info','预览功能：${file.name}')" title="预览"><i class="fas fa-eye"></i></button>
                            <button onclick="window._renameFile && window._renameFile(${originalIdx})" title="重命名"><i class="fas fa-edit"></i></button>
                            <button onclick="showToast('info','分享功能：${file.name}')" title="分享"><i class="fas fa-share-alt"></i></button>
                            <button onclick="window._deleteFile && window._deleteFile(${originalIdx})" title="删除"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });

            // 生成排序按钮的激活状态
            const sortBtnClass = (key) => {
                if (project._sort.key === key) {
                    return project._sort.asc ? 'active-asc' : 'active-desc';
                }
                return '';
            };

            // 计算项目统计数据
            const fileCount = project.files.filter(f => f.type !== 'folder').length;
            const folderCount = project.files.filter(f => f.type === 'folder').length;
            const createdDate = project.stats.createdAt ? project.stats.createdAt.split('T')[0] : '-';
            const lastActiveDate = project.stats.lastActive ? project.stats.lastActive.split('T')[0] : '-';

            window._deleteFile = deleteFile;
            window._addFile = addFile;
            window._addFolder = addFolder;
            window._renameFile = renameFile;
            window._sortFiles = sortFiles;

            container.innerHTML = `
                <div class="project-header">
                    <h1><span style="margin-right:10px;">${project.icon}</span>${project.name}</h1>
                    <button class="btn-primary" onclick="window._addFile()">
                        <i class="fas fa-plus"></i> 新建文件
                    </button>
                </div>

                <div class="file-manager">
                    <div class="file-toolbar">
                        <div class="path">
                            <i class="fas fa-home"></i> 根目录 <span style="color:var(--text-muted)">/ ${project.files.length} 个项目</span>
                        </div>
                        <div class="actions">
                            <button class="btn-secondary ${sortBtnClass('name')}" onclick="window._sortFiles('name')" title="按名称排序">
                                <i class="fas fa-font"></i> 名称
                            </button>
                            <button class="btn-secondary ${sortBtnClass('date')}" onclick="window._sortFiles('date')" title="按日期排序">
                                <i class="fas fa-calendar"></i> 日期
                            </button>
                            <button class="btn-secondary ${sortBtnClass('size')}" onclick="window._sortFiles('size')" title="按大小排序">
                                <i class="fas fa-weight-hanging"></i> 大小
                            </button>
                            <button class="btn-secondary" onclick="window._addFolder()">
                                <i class="fas fa-folder-plus"></i> 新建文件夹
                            </button>
                        </div>
                    </div>
                    <div class="file-list">
                        ${filesHtml || '<div class="empty-state"><i class="fas fa-folder-open"></i><p>暂无文件，点击"新建文件"或"新建文件夹"开始管理</p></div>'}
                    </div>
                </div>

                <!-- 项目数据统计面板 -->
                <div class="tool-panel" style="margin-top:20px;">
                    <h3><i class="fas fa-chart-pie"></i> 项目数据统计</h3>
                    <div class="quick-actions" style="margin-top:12px;">
                        <div class="quick-action" style="cursor:default;">
                            <i class="fas fa-clock" style="color:var(--primary-light)"></i>
                            <span>创建时间<br><strong>${createdDate}</strong></span>
                        </div>
                        <div class="quick-action" style="cursor:default;">
                            <i class="fas fa-file" style="color:var(--secondary)"></i>
                            <span>文件数量<br><strong>${fileCount} 个</strong></span>
                        </div>
                        <div class="quick-action" style="cursor:default;">
                            <i class="fas fa-folder" style="color:var(--accent)"></i>
                            <span>文件夹数量<br><strong>${folderCount} 个</strong></span>
                        </div>
                        <div class="quick-action" style="cursor:default;">
                            <i class="fas fa-history" style="color:var(--success)"></i>
                            <span>最后活动<br><strong>${lastActiveDate}</strong></span>
                        </div>
                        <div class="quick-action" style="cursor:default;">
                            <i class="fas fa-hdd" style="color:var(--warning)"></i>
                            <span>总项目数<br><strong>${project.files.length} 个</strong></span>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========== Dev Panel ==========
        function renderDevPanel(container, project) {
            // 从本地存储加载代码片段
            const snippetsKey = 'dev_snippets_' + (project.id || 'default');
            let snippets = [];
            try {
                const stored = localStorage.getItem(snippetsKey);
                if (stored) snippets = JSON.parse(stored);
            } catch (e) {
                snippets = [];
            }

            function saveSnippet() {
                const title = prompt('请输入代码片段标题：');
                if (!title || !title.trim()) return;
                const code = prompt('请输入代码内容：');
                if (!code || !code.trim()) return;
                snippets.push({
                    title: title.trim(),
                    code: code.trim(),
                    date: new Date().toISOString().split('T')[0]
                });
                localStorage.setItem(snippetsKey, JSON.stringify(snippets));
                renderDevPanel(container, project);
                showToast('success', '代码片段已保存');
            }

            function deleteSnippet(idx) {
                if (confirm('确定要删除代码片段「' + snippets[idx].title + '」吗？')) {
                    snippets.splice(idx, 1);
                    localStorage.setItem(snippetsKey, JSON.stringify(snippets));
                    renderDevPanel(container, project);
                    showToast('success', '已删除');
                }
            }

            function useSnippet(code) {
                startDevAssist('代码生成');
                const input = document.getElementById('questionInput');
                if (input) {
                    input.value = '请帮我优化这段代码：\n```\n' + code + '\n```';
                }
            }

            let snippetsHtml = '';
            if (snippets.length > 0) {
                snippetsHtml = `
                    <div class="storage-items" style="margin-top:12px;">
                        ${snippets.map((s, idx) => `
                            <div class="storage-item">
                                <div class="icon" style="background:rgba(108,92,231,0.15);color:var(--primary-light);">
                                    <i class="fas fa-code"></i>
                                </div>
                                <div class="info">
                                    <div class="name">${s.title}</div>
                                    <div class="desc">${s.date} · ${s.code.length} 字符</div>
                                </div>
                                <div class="actions">
                                    <button onclick="window._useSnippet && window._useSnippet(${idx})" title="使用"><i class="fas fa-play"></i></button>
                                    <button onclick="window._deleteSnippet && window._deleteSnippet(${idx})" title="删除"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                snippetsHtml = '<p style="color:var(--text-muted);font-size:13px;margin-top:8px;">暂无保存的代码片段</p>';
            }

            window._saveSnippet = saveSnippet;
            window._deleteSnippet = deleteSnippet;
            window._useSnippet = (idx) => useSnippet(snippets[idx].code);

            container.innerHTML = `
                <div class="project-header">
                    <h1><span style="margin-right:10px;">${project.icon}</span>${project.name}</h1>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-code"></i> 项目开发辅助</h3>
                    <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">
                        点击下方功能，AI会为你提供专业的开发辅助。
                    </p>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="startDevAssist('需求分析')">
                            <i class="fas fa-clipboard-list" style="color:var(--primary-light)"></i>
                            <span>需求分析</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('架构设计')">
                            <i class="fas fa-sitemap" style="color:var(--secondary)"></i>
                            <span>架构设计</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('代码生成')">
                            <i class="fas fa-file-code" style="color:var(--success)"></i>
                            <span>代码生成</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('代码审查')">
                            <i class="fas fa-search" style="color:var(--warning)"></i>
                            <span>代码审查</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('调试辅助')">
                            <i class="fas fa-bug" style="color:var(--danger)"></i>
                            <span>调试辅助</span>
                        </div>
                        <div class="quick-action" onclick="openDocumentEditor()">
                            <i class="fas fa-file-alt" style="color:var(--accent)"></i>
                            <span>文档编辑</span>
                        </div>
                    </div>
                </div>

                <!-- 代码片段管理 -->
                <div class="tool-panel">
                    <h3><i class="fas fa-save"></i> 代码片段库
                        <button class="btn-secondary" style="float:right;font-size:12px;padding:4px 10px;" onclick="window._saveSnippet()">
                            <i class="fas fa-plus"></i> 保存新片段
                        </button>
                    </h3>
                    ${snippetsHtml}
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-box"></i> 项目存储</h3>
                    <div class="storage-items">
                        <div class="storage-item">
                            <div class="icon" style="background:rgba(108,92,231,0.15);color:var(--primary-light);">
                                <i class="fas fa-code-branch"></i>
                            </div>
                            <div class="info">
                                <div class="name">代码仓库</div>
                                <div class="desc">管理项目源代码和版本</div>
                            </div>
                            <div class="actions">
                                <button onclick="startDevAssist('代码生成')">管理</button>
                            </div>
                        </div>
                        <div class="storage-item">
                            <div class="icon" style="background:rgba(0,206,201,0.15);color:var(--secondary);">
                                <i class="fas fa-database"></i>
                            </div>
                            <div class="info">
                                <div class="name">数据存储</div>
                                <div class="desc">项目相关的数据和配置文件</div>
                            </div>
                            <div class="actions">
                                <button onclick="startDevAssist('架构设计')">管理</button>
                            </div>
                        </div>
                        <div class="storage-item">
                            <div class="icon" style="background:rgba(253,121,168,0.15);color:var(--accent);">
                                <i class="fas fa-file-alt"></i>
                            </div>
                            <div class="info">
                                <div class="name">技术文档</div>
                                <div class="desc">API文档、设计文档等</div>
                            </div>
                            <div class="actions">
                                <button onclick="startDevAssist('文档生成')">管理</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========== PPT Panel ==========
        function renderPPTPanel(container, project) {
            container.innerHTML = `
                <div class="project-header">
                    <h1><span style="margin-right:10px;">${project.icon}</span>${project.name}</h1>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-presentation"></i> PPT制作辅助</h3>
                    <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">
                        点击下方功能，AI帮你快速创建专业演示文稿。
                    </p>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="startDevAssist('PPT大纲生成')">
                            <i class="fas fa-list-ol" style="color:var(--primary-light)"></i>
                            <span>大纲生成</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('PPT内容填充')">
                            <i class="fas fa-pen-fancy" style="color:var(--secondary)"></i>
                            <span>内容填充</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('PPT模板推荐')">
                            <i class="fas fa-palette" style="color:var(--accent)"></i>
                            <span>模板推荐</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('PPT图表生成')">
                            <i class="fas fa-chart-bar" style="color:var(--success)"></i>
                            <span>图表生成</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('PPT演讲备注')">
                            <i class="fas fa-microphone" style="color:var(--warning)"></i>
                            <span>演讲备注</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('PPT排版优化')">
                            <i class="fas fa-align-left" style="color:var(--danger)"></i>
                            <span>排版优化</span>
                        </div>
                    </div>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-folder-open"></i> 我的演示文稿</h3>
                    <div class="storage-items">
                        <div class="storage-item">
                            <div class="icon" style="background:rgba(253,121,168,0.15);color:var(--accent);">
                                <i class="fas fa-file-powerpoint"></i>
                            </div>
                            <div class="info">
                                <div class="name">季度工作汇报.pptx</div>
                                <div class="desc">上次编辑：2026-06-15</div>
                                <div class="size">5.2 MB · 24页</div>
                            </div>
                            <div class="actions">
                                <button onclick="startDevAssist('PPT排版优化')">编辑</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========== Video Panel ==========
        function renderVideoPanel(container, project) {
            container.innerHTML = `
                <div class="project-header">
                    <h1><span style="margin-right:10px;">${project.icon}</span>${project.name}</h1>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-video"></i> 视频制作辅助</h3>
                    <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">
                        点击下方功能，AI帮你高效完成视频创作。
                    </p>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="startDevAssist('视频脚本生成')">
                            <i class="fas fa-scroll" style="color:var(--primary-light)"></i>
                            <span>脚本生成</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('视频字幕生成')">
                            <i class="fas fa-closed-captioning" style="color:var(--secondary)"></i>
                            <span>字幕生成</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('视频素材推荐')">
                            <i class="fas fa-photo-video" style="color:var(--accent)"></i>
                            <span>素材推荐</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('视频剪辑建议')">
                            <i class="fas fa-cut" style="color:var(--success)"></i>
                            <span>剪辑建议</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('视频配乐推荐')">
                            <i class="fas fa-music" style="color:var(--warning)"></i>
                            <span>配乐推荐</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('视频封面生成')">
                            <i class="fas fa-image" style="color:var(--danger)"></i>
                            <span>封面生成</span>
                        </div>
                    </div>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-film"></i> 我的视频项目</h3>
                    <div class="storage-items">
                        <div class="storage-item">
                            <div class="icon" style="background:rgba(253,203,110,0.15);color:var(--warning);">
                                <i class="fas fa-film"></i>
                            </div>
                            <div class="info">
                                <div class="name">产品宣传视频</div>
                                <div class="desc">进行中 · 预计3分钟</div>
                                <div class="size">已收集素材 12 个</div>
                            </div>
                            <div class="actions">
                                <button onclick="startDevAssist('视频脚本生成')">继续</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========== Writing Panel ==========
        function renderWritingPanel(container, project) {
            // 写作模板数据
            const templates = [
                { name: '商务邮件', icon: 'fa-envelope', color: 'var(--secondary)', content: `尊敬的【收件人】：

您好！

【正文内容：说明来意、背景、具体事项】

期待您的回复。如有任何问题，请随时与我联系。

此致
敬礼

【你的姓名】
【日期】` },
                { name: '工作报告', icon: 'fa-file-alt', color: 'var(--accent)', content: `# 【报告标题】

## 一、工作概述
【简述本阶段主要工作内容】

## 二、完成情况
【列出已完成的工作事项及成果】

## 三、问题与挑战
【分析遇到的问题及解决方案】

## 四、下阶段计划
【规划下一步工作安排】

## 五、总结
【对整体工作的总结与反思】` },
                { name: '会议纪要', icon: 'fa-users', color: 'var(--primary-light)', content: `# 【会议主题】

- 时间：【日期时间】
- 地点：【会议地点】
- 主持人：【姓名】
- 参会人：【名单】

## 会议议题
1. 【议题一】
2. 【议题二】

## 讨论内容
【记录主要讨论要点】

## 决议事项
- 【决议一】
- 【决议二】

## 待办事项
| 事项 | 负责人 | 截止日期 |
|------|--------|----------|
| 【事项】 | 【姓名】 | 【日期】 |` },
                { name: '产品介绍', icon: 'fa-box', color: 'var(--success)', content: `# 【产品名称】

## 产品概述
【一句话描述产品核心价值】

## 核心功能
1. 【功能一】：【功能描述】
2. 【功能二】：【功能描述】
3. 【功能三】：【功能描述】

## 目标用户
【描述目标用户群体】

## 产品优势
- 【优势一】
- 【优势二】
- 【优势三】

## 使用场景
【描述典型使用场景】` },
                { name: '社交媒体文案', icon: 'fa-share-alt', color: 'var(--warning)', content: `【吸引眼球的标题/开头】

【正文内容：简洁有力，突出亮点】

【互动引导：提问或号召】

#话题标签 #品牌标签 #行业标签` },
                { name: '简历优化', icon: 'fa-id-card', color: 'var(--danger)', content: `# 个人信息
- 姓名：【姓名】
- 电话：【手机号】
- 邮箱：【邮箱地址】

# 求职意向
【目标岗位】

# 工作经历
## 【公司名】 | 【职位】 | 【时间段】
- 【工作成果/职责，使用STAR法则描述】
- 【量化业绩数据】

# 项目经验
## 【项目名称】
- 背景：【项目背景】
- 职责：【你的职责】
- 成果：【项目成果，尽量量化】

# 教育背景
【学校】 | 【专业】 | 【时间段】

# 技能特长
- 【技能一】
- 【技能二】` }
            ];

            function insertTemplate(idx) {
                const tpl = templates[idx];
                startDevAssist('写作模板');
                const input = document.getElementById('questionInput');
                if (input) {
                    input.value = `请帮我基于以下「${tpl.name}」模板进行写作：\n\n${tpl.content}`;
                }
                showToast('info', `已插入「${tpl.name}」模板，请补充具体内容`);
            }

            window._insertTemplate = insertTemplate;

            container.innerHTML = `
                <div class="project-header">
                    <h1><span style="margin-right:10px;">${project.icon}</span>${project.name}</h1>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-pen-nib"></i> AI写作辅助</h3>
                    <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">
                        点击下方功能，AI帮你高效完成各类写作任务。
                    </p>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="startDevAssist('营销文案')">
                            <i class="fas fa-ad" style="color:var(--primary-light)"></i>
                            <span>营销文案</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('商务邮件')">
                            <i class="fas fa-envelope" style="color:var(--secondary)"></i>
                            <span>商务邮件</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('工作报告')">
                            <i class="fas fa-file-alt" style="color:var(--accent)"></i>
                            <span>工作报告</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('论文写作')">
                            <i class="fas fa-graduation-cap" style="color:var(--success)"></i>
                            <span>论文写作</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('润色改写')">
                            <i class="fas fa-magic" style="color:var(--warning)"></i>
                            <span>润色改写</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('摘要提炼')">
                            <i class="fas fa-compress-alt" style="color:var(--danger)"></i>
                            <span>摘要提炼</span>
                        </div>
                    </div>
                </div>

                <!-- 写作模板快速插入 -->
                <div class="tool-panel">
                    <h3><i class="fas fa-magic"></i> 写作模板快速插入</h3>
                    <p style="color:var(--text-secondary);font-size:13px;margin-bottom:10px;">点击模板即可插入到AI对话中，快速开始写作。</p>
                    <div class="quick-actions">
                        ${templates.map((tpl, idx) => `
                            <div class="quick-action" onclick="window._insertTemplate(${idx})" title="点击插入模板">
                                <i class="fas ${tpl.icon}" style="color:${tpl.color}"></i>
                                <span>${tpl.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-folder-open"></i> 我的写作稿</h3>
                    <div class="storage-items">
                        <div class="storage-item">
                            <div class="icon" style="background:rgba(108,92,231,0.15);color:var(--primary-light);">
                                <i class="fas fa-file-word"></i>
                            </div>
                            <div class="info">
                                <div class="name">季度工作总结.docx</div>
                                <div class="desc">上次编辑：2026-06-15</div>
                                <div class="size">15.2 KB · 3页</div>
                            </div>
                            <div class="actions">
                                <button onclick="startDevAssist('润色改写')">编辑</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========== Plan Panel ==========
        function renderPlanPanel(container, project) {
            // 计划模板数据
            const planTemplates = [
                { name: '周计划', icon: 'fa-calendar-week', color: 'var(--primary-light)', content: `# 【第X周工作计划】

## 本周目标
【概述本周核心目标】

## 每日安排
| 日期 | 重点任务 | 预计时长 |
|------|----------|----------|
| 周一 | 【任务】 | 【时长】 |
| 周二 | 【任务】 | 【时长】 |
| 周三 | 【任务】 | 【时长】 |
| 周四 | 【任务】 | 【时长】 |
| 周五 | 【任务】 | 【时长】 |

## 优先级排序
1. 【高优先级任务】
2. 【中优先级任务】
3. 【低优先级任务】

## 复盘总结
【周末对本周执行情况进行复盘】` },
                { name: '月计划', icon: 'fa-calendar-alt', color: 'var(--secondary)', content: `# 【X月工作计划】

## 月度目标
【概述本月核心目标，建议3-5个】

## 目标分解
| 周次 | 关键任务 | 交付成果 | 负责人 |
|------|----------|----------|--------|
| 第1周 | 【任务】 | 【成果】 | 【姓名】 |
| 第2周 | 【任务】 | 【成果】 | 【姓名】 |
| 第3周 | 【任务】 | 【成果】 | 【姓名】 |
| 第4周 | 【任务】 | 【成果】 | 【姓名】 |

## 资源需求
- 【人力】
- 【预算】
- 【工具/设备】

## 风险预判
| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 【风险】 | 【高/中/低】 | 【措施】 |

## 月度复盘
【月末总结完成情况】` },
                { name: '项目计划', icon: 'fa-project-diagram', color: 'var(--accent)', content: `# 【项目名称】计划书

## 项目背景
【说明项目发起原因和背景】

## 项目目标
- 总体目标：【一句话描述】
- 阶段目标：
  - 阶段一：【目标】（【时间】）
  - 阶段二：【目标】（【时间】）
  - 阶段三：【目标】（【时间】）

## 任务分解（WBS）
1. 【任务组一】
   - 【子任务1】
   - 【子任务2】
2. 【任务组二】
   - 【子任务1】
   - 【子任务2】

## 时间规划
| 阶段 | 开始时间 | 结束时间 | 里程碑 |
|------|----------|----------|--------|
| 【阶段】 | 【日期】 | 【日期】 | 【成果】 |

## 团队分工
| 角色 | 姓名 | 职责 |
|------|------|------|
| 【角色】 | 【姓名】 | 【职责】 |

## 风险管理
【列出主要风险及应对方案】` },
                { name: '学习计划', icon: 'fa-book-reader', color: 'var(--success)', content: `# 【学习主题】学习计划

## 学习目标
【明确学习后要达到的水平】

## 学习周期
【总时长，如：3个月】

## 阶段安排
| 阶段 | 时间 | 学习内容 | 检验方式 |
|------|------|----------|----------|
| 基础阶段 | 【时间】 | 【内容】 | 【方式】 |
| 进阶阶段 | 【时间】 | 【内容】 | 【方式】 |
| 实战阶段 | 【时间】 | 【内容】 | 【方式】 |

## 学习资源
- 书籍：【书单】
- 课程：【课程链接/平台】
- 实践：【项目/练习】

## 每日学习安排
【具体的时间分配】

## 复盘与调整
【定期回顾学习效果】` },
                { name: '活动策划', icon: 'fa-calendar-check', color: 'var(--warning)', content: `# 【活动名称】策划方案

## 活动概述
- 主题：【主题】
- 时间：【日期时间】
- 地点：【地点】
- 目标人数：【人数】

## 活动目标
【说明活动要达成的目标】

## 活动流程
| 时间 | 环节 | 内容 | 负责人 |
|------|------|------|--------|
| 【时间】 | 【环节】 | 【内容】 | 【姓名】 |

## 预算规划
| 项目 | 预算 | 备注 |
|------|------|------|
| 【项目】 | 【金额】 | 【备注】 |
| 合计 | 【总金额】 | |

## 宣传推广
【宣传渠道和时间节点】

## 应急预案
【突发情况处理方案】` },
                { name: '旅行规划', icon: 'fa-plane', color: 'var(--danger)', content: `# 【目的地】旅行计划

## 行程概览
- 目的地：【地点】
- 天数：【N天】
- 人数：【N人】
- 预算：【金额】

## 每日行程
| 天数 | 上午 | 下午 | 晚上 | 住宿 |
|------|------|------|------|------|
| Day 1 | 【活动】 | 【活动】 | 【活动】 | 【酒店】 |
| Day 2 | 【活动】 | 【活动】 | 【活动】 | 【酒店】 |

## 交通安排
【往返交通及当地交通方案】

## 必带清单
- 【证件类】
- 【衣物类】
- 【电子类】
- 【药品类】

## 注意事项
【当地风俗、安全提示等】` }
            ];

            function insertPlanTemplate(idx) {
                const tpl = planTemplates[idx];
                startDevAssist('计划模板');
                const input = document.getElementById('questionInput');
                if (input) {
                    input.value = `请帮我基于以下「${tpl.name}」模板制定计划：\n\n${tpl.content}`;
                }
                showToast('info', `已插入「${tpl.name}」模板，请补充具体内容`);
            }

            window._insertPlanTemplate = insertPlanTemplate;

            container.innerHTML = `
                <div class="project-header">
                    <h1><span style="margin-right:10px;">${project.icon}</span>${project.name}</h1>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-tasks"></i> AI方案与计划生成</h3>
                    <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">
                        点击下方功能，AI帮你生成结构化的方案和可执行的计划。
                    </p>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="startDevAssist('项目规划')">
                            <i class="fas fa-project-diagram" style="color:var(--primary-light)"></i>
                            <span>项目规划</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('活动策划')">
                            <i class="fas fa-calendar-alt" style="color:var(--secondary)"></i>
                            <span>活动策划</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('学习计划')">
                            <i class="fas fa-book-reader" style="color:var(--accent)"></i>
                            <span>学习计划</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('旅行规划')">
                            <i class="fas fa-plane" style="color:var(--success)"></i>
                            <span>旅行规划</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('预算方案')">
                            <i class="fas fa-calculator" style="color:var(--warning)"></i>
                            <span>预算方案</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('时间管理')">
                            <i class="fas fa-clock" style="color:var(--danger)"></i>
                            <span>时间管理</span>
                        </div>
                    </div>
                </div>

                <!-- 计划模板快速插入 -->
                <div class="tool-panel">
                    <h3><i class="fas fa-magic"></i> 计划模板快速插入</h3>
                    <p style="color:var(--text-secondary);font-size:13px;margin-bottom:10px;">点击模板即可插入到AI对话中，快速生成结构化计划。</p>
                    <div class="quick-actions">
                        ${planTemplates.map((tpl, idx) => `
                            <div class="quick-action" onclick="window._insertPlanTemplate(${idx})" title="点击插入模板">
                                <i class="fas ${tpl.icon}" style="color:${tpl.color}"></i>
                                <span>${tpl.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-folder-open"></i> 我的方案</h3>
                    <div class="storage-items">
                        <div class="storage-item">
                            <div class="icon" style="background:rgba(0,206,201,0.15);color:var(--secondary);">
                                <i class="fas fa-file-alt"></i>
                            </div>
                            <div class="info">
                                <div class="name">产品上线计划.md</div>
                                <div class="desc">上次编辑：2026-06-14</div>
                                <div class="size">8.5 KB</div>
                            </div>
                            <div class="actions">
                                <button onclick="startDevAssist('项目规划')">编辑</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========== Spreadsheet Panel ==========
        function renderSpreadsheetPanel(container, project) {
            // 常用公式数据
            const formulas = [
                { name: 'SUM', desc: '求和', example: '=SUM(A1:A10)', category: '数学' },
                { name: 'AVERAGE', desc: '平均值', example: '=AVERAGE(B1:B10)', category: '数学' },
                { name: 'COUNT', desc: '计数', example: '=COUNT(C1:C10)', category: '数学' },
                { name: 'MAX', desc: '最大值', example: '=MAX(D1:D10)', category: '数学' },
                { name: 'MIN', desc: '最小值', example: '=MIN(E1:E10)', category: '数学' },
                { name: 'IF', desc: '条件判断', example: '=IF(F1>60,"及格","不及格")', category: '逻辑' },
                { name: 'VLOOKUP', desc: '垂直查找', example: '=VLOOKUP(G1,A:B,2,FALSE)', category: '查找' },
                { name: 'SUMIF', desc: '条件求和', example: '=SUMIF(A:A,">0",B:B)', category: '数学' },
                { name: 'COUNTIF', desc: '条件计数', example: '=COUNTIF(C:C,"完成")', category: '数学' },
                { name: 'CONCATENATE', desc: '文本合并', example: '=CONCATENATE(A1," ",B1)', category: '文本' },
                { name: 'LEFT/RIGHT', desc: '截取文本', example: '=LEFT(D1,3)', category: '文本' },
                { name: 'ROUND', desc: '四舍五入', example: '=ROUND(E1,2)', category: '数学' }
            ];

            function insertFormula(idx) {
                const formula = formulas[idx];
                startDevAssist('公式编写');
                const input = document.getElementById('questionInput');
                if (input) {
                    input.value = `请帮我解释并优化这个${formula.name}公式的使用：${formula.example}\n\n我的需求是：【请描述你的具体需求】`;
                }
                showToast('info', `已插入「${formula.name}」公式示例`);
            }

            window._insertFormula = insertFormula;

            container.innerHTML = `
                <div class="project-header">
                    <h1><span style="margin-right:10px;">${project.icon}</span>${project.name}</h1>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-table"></i> 表格制作辅助</h3>
                    <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">
                        点击下方功能，AI帮你高效制作和管理表格。
                    </p>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="startDevAssist('表格设计')">
                            <i class="fas fa-th" style="color:var(--primary-light)"></i>
                            <span>表格设计</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('公式编写')">
                            <i class="fas fa-calculator" style="color:var(--secondary)"></i>
                            <span>公式编写</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('数据分析')">
                            <i class="fas fa-chart-line" style="color:var(--accent)"></i>
                            <span>数据分析</span>
                        </div>
                        <div class="quick-action" onclick="openSpreadsheetEditor()">
                            <i class="fas fa-table" style="color:var(--success)"></i>
                            <span>电子表格</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('报表生成')">
                            <i class="fas fa-file-invoice" style="color:var(--warning)"></i>
                            <span>报表生成</span>
                        </div>
                        <div class="quick-action" onclick="startDevAssist('数据清洗')">
                            <i class="fas fa-broom" style="color:var(--danger)"></i>
                            <span>数据清洗</span>
                        </div>
                    </div>
                </div>

                <!-- 常用公式快速插入 -->
                <div class="tool-panel">
                    <h3><i class="fas fa-function"></i> 常用公式快速插入</h3>
                    <p style="color:var(--text-secondary);font-size:13px;margin-bottom:10px;">点击公式即可插入到AI对话中，获取详细用法说明。</p>
                    <div class="quick-actions">
                        ${formulas.map((f, idx) => `
                            <div class="quick-action" onclick="window._insertFormula(${idx})" title="${f.desc} - ${f.example}">
                                <i class="fas fa-calculator" style="color:var(--secondary)"></i>
                                <span>${f.name}<br><small style="color:var(--text-muted);font-size:11px;">${f.desc}</small></span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="tool-panel">
                    <h3><i class="fas fa-folder-open"></i> 我的表格</h3>
                    <div class="storage-items">
                        <div class="storage-item">
                            <div class="icon" style="background:rgba(16,185,129,0.15);color:#10b981;">
                                <i class="fas fa-table"></i>
                            </div>
                            <div class="info">
                                <div class="name">销售数据统计.xlsx</div>
                                <div class="desc">上次编辑：2026-06-16</div>
                                <div class="size">45.2 KB · 3个工作表</div>
                            </div>
                            <div class="actions">
                                <button onclick="startDevAssist('数据分析')">编辑</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========== Custom Project ==========
        function renderCustomProject(container, project) {
            container.innerHTML = `
                <div class="project-header">
                    <h1><span style="margin-right:10px;">${project.icon}</span>${project.name}</h1>
                </div>
                <div class="tool-panel">
                    <h3><i class="fas fa-rocket"></i> 项目概览</h3>
                    <p style="color:var(--text-secondary);font-size:14px;">
                        这是一个自定义项目。你可以在AI助手中提问，获取项目相关的帮助和建议。
                    </p>
                    <div style="margin-top:16px;">
                        <button class="btn-primary" onclick="switchPage('chat')">
                            <i class="fas fa-robot"></i> 前往AI助手
                        </button>
                    </div>
                </div>
            `;
        }

        // ========== Start Dev Assist ==========
        function startDevAssist(feature) {
            switchPage('chat');
            const prompts = {
                '需求分析': '请帮我分析一个项目的需求。我想开发一个【请描述你的项目】，需要实现哪些功能？',
                '架构设计': '请帮我设计一个项目的架构。项目类型是【请描述】，应该如何规划技术架构？',
                '代码生成': '请帮我生成一段代码。我需要用【语言】实现【功能】，请给出代码示例。',
                '代码审查': '请帮我审查这段代码，指出潜在问题和优化建议：\n```\n【请粘贴代码】\n```',
                '调试辅助': '我的代码出现了这个错误：【请描述错误信息】，请帮我分析原因和解决方案。',
                '文档生成': '请帮我生成项目文档。项目是关于【请描述】的，需要包含哪些内容？',
                'PPT大纲生成': '请帮我生成一个PPT的大纲。主题是【请描述】，大约需要【N】页。',
                'PPT内容填充': '请帮我为PPT的某一页生成详细内容。主题是【请描述】。',
                'PPT模板推荐': '请推荐适合【主题】的PPT模板风格和设计建议。',
                'PPT图表生成': '请帮我设计一个展示【数据类型】的图表方案。',
                'PPT演讲备注': '请为以下PPT内容生成演讲备注：【请粘贴内容】',
                'PPT排版优化': '请帮我优化以下PPT的排版和视觉设计：【请描述】',
                '视频脚本生成': '请帮我写一个视频脚本。视频主题是【请描述】，时长约【N】分钟。',
                '视频字幕生成': '请为以下视频内容生成字幕文本：【请描述内容】',
                '视频素材推荐': '请推荐适合【主题】的视频素材类型和获取渠道。',
                '视频剪辑建议': '请为以下视频内容提供剪辑建议：【请描述】',
                '视频配乐推荐': '请推荐适合【主题/风格】的背景音乐。',
                '视频封面生成': '请帮我设计一个视频封面的方案。视频主题是【请描述】。',
                '营销文案': '请帮我写一段营销文案。产品是【请描述】，目标受众是【请描述】。',
                '商务邮件': '请帮我写一封商务邮件。主题是【请描述】，收件人是【请描述】。',
                '工作报告': '请帮我写一份工作/学习报告。内容是【请描述】，字数约【N】字。',
                '论文写作': '请帮我写一个论文的【摘要/引言/结论】。主题是【请描述】。',
                '润色改写': '请帮我润色改写以下内容：【请粘贴内容】',
                '摘要提炼': '请帮我提炼以下内容的摘要：【请粘贴内容】',
                '项目规划': '请帮我制定一个项目计划。项目是【请描述】，周期是【N】天。',
                '活动策划': '请帮我策划一个活动。活动类型是【请描述】，参与人数约【N】人。',
                '学习计划': '请帮我制定一个学习计划。目标是【请描述】，周期是【N】天/月。',
                '旅行规划': '请帮我规划一次旅行。目的地是【请描述】，天数是【N】天。',
                '预算方案': '请帮我制定一个预算方案。用途是【请描述】，总额约【N】元。',
                '时间管理': '请帮我制定一个时间管理方案。我的日常安排是【请描述】。',
                '表格设计': '请帮我设计一个表格结构。用途是【请描述】，需要包含哪些字段？',
                '公式编写': '请帮我编写Excel/Google表格公式。需求是【请描述】。',
                '数据分析': '请帮我分析以下数据：【请描述或粘贴数据】',
                '电子表格': '请帮我设计一个电子表格来整理【数据】。',
                '报表生成': '请帮我生成一份【类型】报表。数据是【请描述】。',
                '数据清洗': '请帮我制定数据清洗方案。数据问题是【请描述】。',
                '写作模板': '请帮我基于以下模板进行写作：【请粘贴模板】',
                '计划模板': '请帮我基于以下模板制定计划：【请粘贴模板】'
            };
            const prompt = prompts[feature] || `请帮我进行${feature}`;
            document.getElementById('questionInput').value = prompt;
            showToast('info', `已切换到AI对话，请补充「${feature}」的具体需求`);
        }
