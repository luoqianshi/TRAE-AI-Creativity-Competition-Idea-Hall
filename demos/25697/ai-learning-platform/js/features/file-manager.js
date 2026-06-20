// ========== Graphical File Manager ==========

const FileManager = {
    currentPath: '/',
    files: {
        '/': [
            { name: '文档', type: 'folder', size: '-', date: '2026-06-18' },
            { name: '图片', type: 'folder', size: '-', date: '2026-06-18' },
            { name: '笔记.txt', type: 'file', size: '2KB', date: '2026-06-17' },
            { name: '数学公式.md', type: 'file', size: '5KB', date: '2026-06-16' },
            { name: '学习计划.doc', type: 'file', size: '8KB', date: '2026-06-15' },
        ],
        '/文档/': [
            { name: '英语单词本.txt', type: 'file', size: '12KB', date: '2026-06-15' },
            { name: '学习计划.doc', type: 'file', size: '8KB', date: '2026-06-14' },
            { name: '读书笔记.pdf', type: 'file', size: '156KB', date: '2026-06-13' },
            { name: '作文素材.doc', type: 'file', size: '24KB', date: '2026-06-12' },
        ],
        '/图片/': [
            { name: '截图1.png', type: 'file', size: '156KB', date: '2026-06-13' },
            { name: '截图2.png', type: 'file', size: '203KB', date: '2026-06-12' },
            { name: '课堂笔记.jpg', type: 'file', size: '312KB', date: '2026-06-11' },
            { name: '思维导图.png', type: 'file', size: '89KB', date: '2026-06-10' },
        ]
    },

    getFileIcon(item) {
        if (item.type === 'folder') return '<i class="fas fa-folder" style="color:var(--warning);font-size:36px;"></i>';
        const ext = item.name.split('.').pop().toLowerCase();
        const iconMap = {
            txt: '<i class="fas fa-file-alt" style="color:var(--text-secondary);font-size:36px;"></i>',
            md: '<i class="fas fa-file-code" style="color:var(--primary-light);font-size:36px;"></i>',
            doc: '<i class="fas fa-file-word" style="color:#2b579a;font-size:36px;"></i>',
            docx: '<i class="fas fa-file-word" style="color:#2b579a;font-size:36px;"></i>',
            pdf: '<i class="fas fa-file-pdf" style="color:#c0392b;font-size:36px;"></i>',
            png: '<i class="fas fa-file-image" style="color:var(--success);font-size:36px;"></i>',
            jpg: '<i class="fas fa-file-image" style="color:var(--success);font-size:36px;"></i>',
            jpeg: '<i class="fas fa-file-image" style="color:var(--success);font-size:36px;"></i>',
            gif: '<i class="fas fa-file-image" style="color:var(--success);font-size:36px;"></i>',
            mp3: '<i class="fas fa-file-audio" style="color:var(--accent);font-size:36px;"></i>',
            mp4: '<i class="fas fa-file-video" style="color:var(--accent);font-size:36px;"></i>',
            xls: '<i class="fas fa-file-excel" style="color:#217346;font-size:36px;"></i>',
            xlsx: '<i class="fas fa-file-excel" style="color:#217346;font-size:36px;"></i>',
        };
        return iconMap[ext] || '<i class="fas fa-file" style="color:var(--text-secondary);font-size:36px;"></i>';
    },

    renderBreadcrumb() {
        const parts = this.currentPath.split('/').filter(Boolean);
        let html = '<span class="fm-bc-root" onclick="FileManager.openFolder(\'/\')">根目录</span>';
        let buildPath = '';
        parts.forEach(part => {
            buildPath += '/' + part + '/';
            html += ' <span class="fm-bc-sep">/</span> <span class="fm-bc-part" onclick="FileManager.openFolder(\'' + buildPath + '\')">' + part + '</span>';
        });
        return html;
    },

    render() {
        const container = document.getElementById('fileManagerContent');
        if (!container) return;
        const items = this.files[this.currentPath] || [];
        let html = '<div class="file-manager">';
        html += '<div class="fm-toolbar">';
        html += '<div class="fm-breadcrumb">' + this.renderBreadcrumb() + '</div>';
        html += '<div class="fm-actions">';
        html += '<button class="fm-btn" onclick="FileManager.goUp()" title="返回上级"><i class="fas fa-level-up-alt"></i> 上级</button>';
        html += '<button class="fm-btn" onclick="FileManager.createNewFile()" title="新建文件"><i class="fas fa-plus"></i> 新建</button>';
        html += '</div>';
        html += '</div>';
        html += '<div class="fm-grid">';
        if (items.length === 0) {
            html += '<div class="fm-empty"><i class="fas fa-folder-open" style="font-size:48px;color:var(--text-muted);margin-bottom:12px;"></i><p>此文件夹为空</p></div>';
        } else {
            items.forEach((item, idx) => {
                html += '<div class="fm-item" ondblclick="FileManager.handleDblClick(' + idx + ')" oncontextmenu="FileManager.showContextMenu(event, ' + idx + ');return false;" ontouchstart="FileManager.touchStart(event, ' + idx + ')" ontouchend="FileManager.touchEnd(event)">';
                html += '<div class="fm-item-icon">' + this.getFileIcon(item) + '</div>';
                html += '<div class="fm-item-name" title="' + item.name + '">' + item.name + '</div>';
                html += '<div class="fm-item-meta">' + (item.size || '-') + ' · ' + item.date + '</div>';
                html += '</div>';
            });
        }
        html += '</div></div>';
        container.innerHTML = html;
    },

    handleDblClick(idx) {
        const items = this.files[this.currentPath] || [];
        const item = items[idx];
        if (!item) return;
        if (item.type === 'folder') {
            const newPath = this.currentPath + item.name + '/';
            this.openFolder(newPath);
        } else {
            this.openFile(item);
        }
    },

    openFolder(path) {
        this.currentPath = path;
        if (!this.files[path]) {
            this.files[path] = [];
        }
        this.render();
    },

    goUp() {
        if (this.currentPath === '/') return;
        const parts = this.currentPath.split('/').filter(Boolean);
        parts.pop();
        this.currentPath = parts.length === 0 ? '/' : '/' + parts.join('/') + '/';
        this.render();
    },

    openFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];
        const textExts = ['txt', 'md', 'json', 'csv', 'xml', 'html', 'css', 'js', 'log'];
        const docExts = ['doc', 'docx'];

        if (imageExts.includes(ext)) {
            this._openImagePreview(file);
        } else if (textExts.includes(ext)) {
            this._openTextEditor(file);
        } else if (docExts.includes(ext)) {
            this._openDocEditor(file);
        } else {
            showToast('info', '暂不支持打开此类型文件: ' + file.name);
        }
    },

    _getFileStorageKey(path, name) {
        return 'fm_file_' + path + name;
    },

    _getFileContent(path, name) {
        const key = this._getFileStorageKey(path, name);
        try {
            const data = localStorage.getItem(key);
            return data ? data : '';
        } catch (e) {
            return '';
        }
    },

    _saveFileContent(path, name, content) {
        const key = this._getFileStorageKey(path, name);
        try {
            localStorage.setItem(key, content);
        } catch (e) {
            showToast('warning', '文件保存失败，存储空间不足');
        }
    },

    _openImagePreview(file) {
        // Remove any existing dynamic modal
        const existing = document.getElementById('dynamicModal');
        if (existing) existing.remove();

        // Use placeholder image since we don't have real files
        const placeholderSvg = 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
            '<rect fill="%231a1a2e" width="400" height="300"/>' +
            '<text x="200" y="140" text-anchor="middle" fill="%236C5CE7" font-size="20">' + file.name + '</text>' +
            '<text x="200" y="170" text-anchor="middle" fill="%23888" font-size="14">图片预览</text>' +
            '</svg>'
        );

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'dynamicModal';
        overlay.style.display = 'flex';
        overlay.innerHTML =
            '<div class="modal" style="max-width:500px;">' +
                '<div class="modal-header">' +
                    '<h2>🖼️ ' + file.name + '</h2>' +
                    '<button class="modal-close" onclick="closeModal(\'dynamicModal\')">&times;</button>' +
                '</div>' +
                '<div class="modal-body" style="text-align:center;">' +
                    '<img src="' + placeholderSvg + '" alt="' + file.name + '" style="max-width:100%;max-height:400px;border-radius:8px;">' +
                    '<div style="margin-top:12px;color:var(--text-muted);font-size:13px;">' + file.size + ' · ' + file.date + '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal('dynamicModal');
        });
    },

    _openTextEditor(file) {
        // Remove any existing dynamic modal
        const existing = document.getElementById('dynamicModal');
        if (existing) existing.remove();

        const content = this._getFileContent(this.currentPath, file.name);
        const escapedName = file.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'dynamicModal';
        overlay.style.display = 'flex';
        overlay.innerHTML =
            '<div class="modal" style="max-width:650px;">' +
                '<div class="modal-header">' +
                    '<h2>📄 ' + file.name + '</h2>' +
                    '<button class="modal-close" onclick="closeModal(\'dynamicModal\')">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<textarea id="fmFileEditor" style="width:100%;min-height:300px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:14px;line-height:1.6;resize:vertical;font-family:inherit;" placeholder="在此编辑文件内容...">' + escapeHtml(content) + '</textarea>' +
                    '<div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">' +
                        '<button class="btn-secondary" onclick="closeModal(\'dynamicModal\')">关闭</button>' +
                        '<button class="btn-primary" onclick="FileManager.saveFileContent(\'' + escapedName + '\')"><i class="fas fa-save"></i> 保存</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal('dynamicModal');
        });
    },

    _openDocEditor(file) {
        const content = this._getFileContent(this.currentPath, file.name);
        const escapedName = file.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        // Remove any existing dynamic modal
        const existing = document.getElementById('dynamicModal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'dynamicModal';
        overlay.style.display = 'flex';
        overlay.innerHTML =
            '<div class="modal" style="max-width:700px;">' +
                '<div class="modal-header">' +
                    '<h2>📝 ' + file.name + '</h2>' +
                    '<button class="modal-close" onclick="closeModal(\'dynamicModal\')">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' +
                        '<div style="background:var(--bg-secondary);padding:8px 12px;border-bottom:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap;">' +
                            '<button class="btn-secondary" style="padding:4px 8px;font-size:12px;" onclick="document.execCommand(\'bold\')"><b>B</b></button>' +
                            '<button class="btn-secondary" style="padding:4px 8px;font-size:12px;" onclick="document.execCommand(\'italic\')"><i>I</i></button>' +
                            '<button class="btn-secondary" style="padding:4px 8px;font-size:12px;" onclick="document.execCommand(\'underline\')"><u>U</u></button>' +
                            '<button class="btn-secondary" style="padding:4px 8px;font-size:12px;" onclick="document.execCommand(\'insertUnorderedList\')"><i class="fas fa-list-ul"></i></button>' +
                        '</div>' +
                        '<div id="fmDocEditor" contenteditable="true" style="min-height:300px;padding:16px;background:var(--bg-primary);color:var(--text-primary);font-size:14px;line-height:1.8;outline:none;">' + (content || '<p>在此编辑文档内容...</p>') + '</div>' +
                    '</div>' +
                    '<div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">' +
                        '<button class="btn-secondary" onclick="closeModal(\'dynamicModal\')">关闭</button>' +
                        '<button class="btn-primary" onclick="FileManager.saveDocContent(\'' + escapedName + '\')"><i class="fas fa-save"></i> 保存</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal('dynamicModal');
        });
    },

    saveFileContent(fileName) {
        const editor = document.getElementById('fmFileEditor');
        if (!editor) return;
        const content = editor.value;
        this._saveFileContent(this.currentPath, fileName, content);
        showToast('success', '文件已保存: ' + fileName);
    },

    saveDocContent(fileName) {
        const editor = document.getElementById('fmDocEditor');
        if (!editor) return;
        const content = editor.innerHTML;
        this._saveFileContent(this.currentPath, fileName, content);
        showToast('success', '文档已保存: ' + fileName);
    },

    createNewFile() {
        const name = prompt('新建文件名（例如：笔记.txt）:', '');
        if (!name || !name.trim()) return;
        const trimmedName = name.trim();

        // Validate name
        if (trimmedName.includes('/') || trimmedName.includes('\\') || trimmedName.includes('..')) {
            showToast('warning', '文件名不能包含特殊字符');
            return;
        }

        const items = this.files[this.currentPath] || [];
        if (items.find(function(i) { return i.name === trimmedName; })) {
            showToast('warning', '该文件名已存在');
            return;
        }

        const newItem = {
            name: trimmedName,
            type: 'file',
            size: '0KB',
            date: new Date().toISOString().split('T')[0]
        };
        items.push(newItem);
        this.files[this.currentPath] = items;

        // Initialize empty content in localStorage
        this._saveFileContent(this.currentPath, trimmedName, '');

        this.render();
        showToast('success', '已创建文件: ' + trimmedName);
    },

    deleteItem(name) {
        const items = this.files[this.currentPath];
        if (!items) return;
        const idx = items.findIndex(i => i.name === name);
        if (idx > -1) {
            items.splice(idx, 1);
            this.render();
            showToast('success', '已删除: ' + name);
        }
        this.hideContextMenu();
    },

    showContextMenu(e, idx) {
        this.hideContextMenu();
        const items = this.files[this.currentPath] || [];
        const item = items[idx];
        if (!item) return;
        const menu = document.createElement('div');
        menu.id = 'fmContextMenu';
        menu.className = 'fm-context-menu';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        let html = '<div class="fm-cm-item" onclick="FileManager.openFileByName(\'' + item.name + '\')"><i class="fas fa-external-link-alt"></i> 打开</div>';
        html += '<div class="fm-cm-item" onclick="FileManager.deleteItem(\'' + item.name + '\')"><i class="fas fa-trash-alt"></i> 删除</div>';
        if (item.type === 'file') {
            html += '<div class="fm-cm-item" onclick="FileManager.renameItem(\'' + item.name + '\')"><i class="fas fa-edit"></i> 重命名</div>';
        }
        menu.innerHTML = html;
        document.body.appendChild(menu);
        // Click outside to close
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu, { once: true });
        }, 10);
    },

    hideContextMenu() {
        const menu = document.getElementById('fmContextMenu');
        if (menu) menu.remove();
    },

    openFileByName(name) {
        const items = this.files[this.currentPath] || [];
        const item = items.find(i => i.name === name);
        if (item) {
            if (item.type === 'folder') {
                this.openFolder(this.currentPath + item.name + '/');
            } else {
                this.openFile(item);
            }
        }
        this.hideContextMenu();
    },

    renameItem(oldName) {
        const items = this.files[this.currentPath];
        if (!items) return;
        const newName = prompt('重命名文件:', oldName);
        if (newName && newName !== oldName) {
            const item = items.find(i => i.name === oldName);
            if (item) item.name = newName;
            this.render();
            showToast('success', '已重命名');
        }
        this.hideContextMenu();
    },

    touchTimer: null,
    touchStart(e, idx) {
        this.touchTimer = setTimeout(() => {
            this.showContextMenu(e.touches[0], idx);
        }, 600);
    },
    touchEnd(e) {
        if (this.touchTimer) {
            clearTimeout(this.touchTimer);
            this.touchTimer = null;
        }
    }
};

function openFileManager() {
    switchPage('fileManager');
    FileManager.render();
}
