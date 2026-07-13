/* ========================================
   Linux 萌新救星工具箱 v3.0 - 交互脚本
   ======================================== */

// 命令数据
const commandDatabase = [
    {
        id: 1,
        name: 'dnf update',
        category: '系统管理',
        description: '更新系统中所有已安装的软件包到最新版本',
        syntax: 'dnf update [选项]',
        safety: 5,
        frequency: 95,
        distro: ['fedora', 'rhel', 'centos'],
        params: [
            { name: '-y', desc: '自动回答yes，无需手动确认' },
            { name: '--refresh', desc: '强制刷新元数据' },
            { name: '--security', desc: '仅安装安全更新' }
        ],
        examples: [
            { desc: '更新所有软件包', code: 'sudo dnf update' },
            { desc: '更新并自动确认', code: 'sudo dnf update -y' },
            { desc: '仅更新安全补丁', code: 'sudo dnf update --security' }
        ]
    },
    {
        id: 2,
        name: 'dnf install',
        category: '软件管理',
        description: '安装一个或多个软件包',
        syntax: 'dnf install <包名> [选项]',
        safety: 4,
        frequency: 90,
        distro: ['fedora', 'rhel', 'centos'],
        params: [
            { name: '<包名>', desc: '要安装的软件包名称，可以指定多个' },
            { name: '-y', desc: '自动回答yes' },
            { name: '--nogpgcheck', desc: '跳过GPG密钥验证' }
        ],
        examples: [
            { desc: '安装单个软件包', code: 'sudo dnf install vim' },
            { desc: '安装多个软件包', code: 'sudo dnf install vim git curl' }
        ]
    },
    {
        id: 3,
        name: 'ls',
        category: '文件操作',
        description: '列出目录内容',
        syntax: 'ls [选项] [路径]',
        safety: 5,
        frequency: 100,
        distro: ['all'],
        params: [
            { name: '-l', desc: '以长格式显示详细信息' },
            { name: '-a', desc: '显示所有文件，包括隐藏文件' },
            { name: '-h', desc: '以人类可读的格式显示文件大小' },
            { name: '-t', desc: '按修改时间排序' }
        ],
        examples: [
            { desc: '列出当前目录内容', code: 'ls' },
            { desc: '显示详细信息', code: 'ls -la' },
            { desc: '人性化显示文件大小', code: 'ls -lh' }
        ]
    },
    {
        id: 4,
        name: 'cd',
        category: '文件操作',
        description: '切换当前工作目录',
        syntax: 'cd <路径>',
        safety: 5,
        frequency: 100,
        distro: ['all'],
        params: [
            { name: '<路径>', desc: '目标目录路径' },
            { name: '~', desc: '切换到用户主目录' },
            { name: '-', desc: '切换到上一个目录' },
            { name: '..', desc: '切换到上级目录' }
        ],
        examples: [
            { desc: '切换到主目录', code: 'cd ~' },
            { desc: '切换到上级目录', code: 'cd ..' },
            { desc: '切换到指定目录', code: 'cd /home/user/Documents' }
        ]
    },
    {
        id: 5,
        name: 'systemctl',
        category: '系统管理',
        description: '控制系统服务和systemd管理器',
        syntax: 'systemctl <命令> [服务名]',
        safety: 3,
        frequency: 85,
        distro: ['all'],
        params: [
            { name: 'start', desc: '启动服务' },
            { name: 'stop', desc: '停止服务' },
            { name: 'restart', desc: '重启服务' },
            { name: 'status', desc: '查看服务状态' },
            { name: 'enable', desc: '设置开机自启' },
            { name: 'disable', desc: '禁止开机自启' }
        ],
        examples: [
            { desc: '启动nginx服务', code: 'sudo systemctl start nginx' },
            { desc: '查看服务状态', code: 'systemctl status sshd' },
            { desc: '设置开机自启', code: 'sudo systemctl enable httpd' }
        ]
    },
    {
        id: 6,
        name: 'grep',
        category: '文本处理',
        description: '在文件中搜索匹配的行',
        syntax: 'grep [选项] <模式> <文件>',
        safety: 5,
        frequency: 80,
        distro: ['all'],
        params: [
            { name: '-i', desc: '忽略大小写' },
            { name: '-r', desc: '递归搜索目录' },
            { name: '-n', desc: '显示行号' },
            { name: '-v', desc: '反向匹配，显示不匹配的行' },
            { name: '--color', desc: '高亮显示匹配结果' }
        ],
        examples: [
            { desc: '在文件中搜索', code: 'grep "pattern" file.txt' },
            { desc: '递归搜索目录', code: 'grep -r "pattern" /path/to/dir' },
            { desc: '忽略大小写搜索', code: 'grep -i "pattern" file.txt' }
        ]
    },
    {
        id: 7,
        name: 'chmod',
        category: '文件操作',
        description: '修改文件或目录的权限',
        syntax: 'chmod [选项] <权限> <文件>',
        safety: 2,
        frequency: 75,
        distro: ['all'],
        params: [
            { name: '-R', desc: '递归修改目录及其内容' },
            { name: '755', desc: 'rwxr-xr-x 常见目录权限' },
            { name: '644', desc: 'rw-r--r-- 常见文件权限' },
            { name: '+x', desc: '添加执行权限' }
        ],
        examples: [
            { desc: '添加执行权限', code: 'chmod +x script.sh' },
            { desc: '设置标准文件权限', code: 'chmod 644 file.txt' },
            { desc: '递归修改目录权限', code: 'chmod -R 755 /path/to/dir' }
        ]
    },
    {
        id: 8,
        name: 'df',
        category: '系统监控',
        description: '显示磁盘空间使用情况',
        syntax: 'df [选项] [文件系统]',
        safety: 5,
        frequency: 70,
        distro: ['all'],
        params: [
            { name: '-h', desc: '以人类可读格式显示' },
            { name: '-T', desc: '显示文件系统类型' },
            { name: '-i', desc: '显示inode使用情况' }
        ],
        examples: [
            { desc: '显示所有磁盘使用情况', code: 'df -h' },
            { desc: '显示文件系统类型', code: 'df -hT' }
        ]
    },
    {
        id: 9,
        name: 'free',
        category: '系统监控',
        description: '显示内存使用情况',
        syntax: 'free [选项]',
        safety: 5,
        frequency: 65,
        distro: ['all'],
        params: [
            { name: '-h', desc: '以人类可读格式显示' },
            { name: '-m', desc: '以MB为单位显示' },
            { name: '-g', desc: '以GB为单位显示' },
            { name: '-t', desc: '显示总计行' }
        ],
        examples: [
            { desc: '人性化显示内存', code: 'free -h' },
            { desc: '显示内存总计', code: 'free -ht' }
        ]
    },
    {
        id: 10,
        name: 'ps',
        category: '系统监控',
        description: '显示当前进程状态',
        syntax: 'ps [选项]',
        safety: 5,
        frequency: 60,
        distro: ['all'],
        params: [
            { name: 'aux', desc: '显示所有用户的所有进程' },
            { name: 'ef', desc: '显示完整格式的进程列表' },
            { name: '-u', desc: '显示指定用户的进程' }
        ],
        examples: [
            { desc: '显示所有进程', code: 'ps aux' },
            { desc: '查找特定进程', code: 'ps aux | grep nginx' }
        ]
    },
    {
        id: 11,
        name: 'kill',
        category: '系统管理',
        description: '向进程发送信号，通常用于终止进程',
        syntax: 'kill [选项] <PID>',
        safety: 2,
        frequency: 55,
        distro: ['all'],
        params: [
            { name: '-9', desc: '强制终止进程（SIGKILL）' },
            { name: '-15', desc: '正常终止进程（SIGTERM，默认）' },
            { name: '-l', desc: '列出所有可用信号' }
        ],
        examples: [
            { desc: '正常终止进程', code: 'kill 1234' },
            { desc: '强制终止进程', code: 'kill -9 1234' }
        ]
    },
    {
        id: 12,
        name: 'tar',
        category: '文件操作',
        description: '归档文件，可配合压缩使用',
        syntax: 'tar [选项] <归档文件> <文件/目录>',
        safety: 4,
        frequency: 60,
        distro: ['all'],
        params: [
            { name: '-c', desc: '创建新归档' },
            { name: '-x', desc: '提取归档' },
            { name: '-z', desc: '使用gzip压缩' },
            { name: '-j', desc: '使用bzip2压缩' },
            { name: '-f', desc: '指定归档文件名' },
            { name: '-v', desc: '显示详细过程' }
        ],
        examples: [
            { desc: '创建tar.gz压缩包', code: 'tar -czvf archive.tar.gz /path/to/dir' },
            { desc: '解压tar.gz文件', code: 'tar -xzvf archive.tar.gz' },
            { desc: '查看归档内容', code: 'tar -tzvf archive.tar.gz' }
        ]
    },
    {
        id: 13,
        name: 'find',
        category: '文件操作',
        description: '在目录树中搜索文件',
        syntax: 'find <路径> [表达式]',
        safety: 5,
        frequency: 65,
        distro: ['all'],
        params: [
            { name: '-name', desc: '按文件名搜索' },
            { name: '-type', desc: '按文件类型搜索（f文件/d目录）' },
            { name: '-size', desc: '按文件大小搜索' },
            { name: '-mtime', desc: '按修改时间搜索' },
            { name: '-exec', desc: '对找到的文件执行命令' }
        ],
        examples: [
            { desc: '按名称查找文件', code: 'find /home -name "*.txt"' },
            { desc: '查找大于100M的文件', code: 'find / -size +100M' },
            { desc: '查找7天内修改的文件', code: 'find . -mtime -7' }
        ]
    },
    {
        id: 14,
        name: 'ssh',
        category: '网络配置',
        description: '安全远程登录到另一台计算机',
        syntax: 'ssh [选项] <用户@主机>',
        safety: 3,
        frequency: 70,
        distro: ['all'],
        params: [
            { name: '-p', desc: '指定端口号' },
            { name: '-i', desc: '指定私钥文件' },
            { name: '-X', desc: '启用X11转发' },
            { name: '-v', desc: '详细模式，调试连接' }
        ],
        examples: [
            { desc: '基本SSH连接', code: 'ssh user@192.168.1.100' },
            { desc: '指定端口连接', code: 'ssh -p 2222 user@192.168.1.100' },
            { desc: '使用密钥登录', code: 'ssh -i ~/.ssh/id_rsa user@host' }
        ]
    },
    {
        id: 15,
        name: 'ip addr',
        category: '网络配置',
        description: '显示和操作网络接口地址',
        syntax: 'ip addr [命令]',
        safety: 4,
        frequency: 65,
        distro: ['all'],
        params: [
            { name: 'show', desc: '显示所有接口地址' },
            { name: 'add', desc: '添加地址' },
            { name: 'del', desc: '删除地址' }
        ],
        examples: [
            { desc: '显示所有网络接口', code: 'ip addr show' },
            { desc: '显示指定接口', code: 'ip addr show eth0' }
        ]
    }
];

const categories = [
    '全部',
    '系统管理',
    '文件操作',
    '软件管理',
    '网络配置',
    '系统监控',
    '文本处理'
];

let currentCategory = '全部';
let currentDistro = 'all';
let selectedCommand = null;

// 初始化命令页面
function initCommandPage() {
    renderFilterTags();
    renderCommandList(commandDatabase);
    setupSearch();
    setupModal();
}

// 渲染分类标签
function renderFilterTags() {
    const container = document.querySelector('.filter-tags');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="filter-tag ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
            ${cat}
        </div>
    `).join('');
    
    container.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            currentCategory = tag.dataset.category;
            renderFilterTags();
            filterCommands();
        });
    });
}

// 渲染命令列表
function renderCommandList(commands) {
    const list = document.querySelector('.command-list');
    if (!list) return;
    
    if (commands.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-tertiary);">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <div>没有找到匹配的命令</div>
            </div>
        `;
        return;
    }
    
    list.innerHTML = commands.map(cmd => `
        <div class="command-item" data-id="${cmd.id}">
            <div class="command-item-header">
                <span class="command-name">${highlightMatch(cmd.name)}</span>
                <span class="command-category-tag">${cmd.category}</span>
            </div>
            <div class="command-description">${highlightMatch(cmd.description)}</div>
            <div class="command-footer">
                <span class="command-syntax">${cmd.syntax}</span>
                <div class="command-meta">
                    <span class="command-safety">
                        安全等级: ${renderSafetyStars(cmd.safety)}
                    </span>
                    <span>使用频率: ${cmd.frequency}%</span>
                </div>
            </div>
        </div>
    `).join('');
    
    list.querySelectorAll('.command-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const cmd = commandDatabase.find(c => c.id === id);
            if (cmd) openCommandDetail(cmd);
        });
    });
}

// 搜索高亮
function highlightMatch(text) {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput || !searchInput.value) return text;
    
    const query = searchInput.value.toLowerCase();
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// 渲染安全等级星星
function renderSafetyStars(level) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += `<span class="safety-star ${i < level ? 'filled' : ''}">★</span>`;
    }
    return stars;
}

// 设置搜索
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    let timeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            filterCommands(e.target.value);
        }, 150);
    });
}

// 筛选命令
function filterCommands(query = '') {
    const searchInput = document.querySelector('.search-input');
    if (!query && searchInput) query = searchInput.value;
    
    let filtered = commandDatabase;
    
    if (currentCategory !== '全部') {
        filtered = filtered.filter(cmd => cmd.category === currentCategory);
    }
    
    if (currentDistro !== 'all') {
        filtered = filtered.filter(cmd => 
            cmd.distro.includes('all') || cmd.distro.includes(currentDistro)
        );
    }
    
    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(cmd => 
            cmd.name.toLowerCase().includes(q) ||
            cmd.description.toLowerCase().includes(q) ||
            cmd.category.toLowerCase().includes(q) ||
            cmd.syntax.toLowerCase().includes(q)
        );
        
        filtered.sort((a, b) => {
            const aName = a.name.toLowerCase().includes(q) ? 1 : 0;
            const bName = b.name.toLowerCase().includes(q) ? 1 : 0;
            return bName - aName || b.frequency - a.frequency;
        });
    } else {
        filtered.sort((a, b) => b.frequency - a.frequency);
    }
    
    renderCommandList(filtered);
}

// 设置弹窗
function setupModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return;
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 打开命令详情
function openCommandDetail(cmd) {
    selectedCommand = cmd;
    
    const modal = document.querySelector('.modal-overlay');
    if (!modal) return;
    
    const title = modal.querySelector('.modal-title');
    const body = modal.querySelector('.modal-body');
    
    if (title) title.textContent = cmd.name;
    
    const safetyText = cmd.safety >= 4 ? '低风险' : cmd.safety >= 2 ? '中等风险' : '高风险';
    const safetyClass = cmd.safety >= 4 ? 'low' : cmd.safety >= 2 ? 'medium' : 'high';
    
    body.innerHTML = `
        <div class="modal-section">
            <div class="modal-section-title">命令语法</div>
            <div class="command-syntax-box">
                <span>${cmd.syntax}</span>
                <button class="copy-btn" onclick="copyText('${cmd.syntax}')">📋 复制</button>
            </div>
        </div>
        
        <div class="modal-section">
            <div class="modal-section-title">功能描述</div>
            <div class="modal-section-content">${cmd.description}</div>
        </div>
        
        <div class="modal-section">
            <div class="modal-section-title">安全等级</div>
            <div class="safety-indicator">
                <div class="safety-stars">${renderSafetyStars(cmd.safety)}</div>
                <span class="safety-text ${safetyClass}">${safetyText} (${cmd.safety}/5)</span>
            </div>
        </div>
        
        <div class="modal-section">
            <div class="modal-section-title">参数说明</div>
            <div class="param-list">
                ${cmd.params.map(p => `
                    <div class="param-item">
                        <span class="param-name">${p.name}</span>
                        <span class="param-desc">${p.desc}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="modal-section">
            <div class="modal-section-title">使用示例</div>
            ${cmd.examples.map(ex => `
                <div class="example-item">
                    <div class="example-desc">${ex.desc}</div>
                    <div class="example-code">
                        <span>${ex.code}</span>
                        <button class="copy-btn" onclick="copyText('${ex.code}')">📋 复制</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('show');
}

// 关闭弹窗
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
    }
    selectedCommand = null;
}

// 复制文本
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败，请手动复制');
    });
}

// 显示提示
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(32, 33, 36, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 13px;
        z-index: 2000;
        animation: slideDown 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

// 系统清理页面功能
function initCleanupPage() {
    const categories = document.querySelectorAll('.cleanup-category-header');
    categories.forEach(header => {
        header.addEventListener('click', () => {
            const checkbox = header.querySelector('.cleanup-checkbox');
            const expand = header.querySelector('.cleanup-category-expand');
            const content = header.nextElementSibling;
            
            if (event.target.closest('.cleanup-checkbox')) {
                checkbox.classList.toggle('checked');
                checkbox.textContent = checkbox.classList.contains('checked') ? '✓' : '';
                updateCleanupSummary();
                return;
            }
            
            expand.classList.toggle('expanded');
            content.classList.toggle('show');
        });
    });
}

// 更新清理摘要
function updateCleanupSummary() {
    const checked = document.querySelectorAll('.cleanup-checkbox.checked').length;
    const sizeValue = document.querySelector('.cleanup-summary-value.accent');
    const countValue = document.querySelectorAll('.cleanup-summary-value')[0];
    
    if (sizeValue) {
        const total = checked * 128 + ' MB';
        sizeValue.textContent = total;
    }
    if (countValue) {
        countValue.textContent = checked + ' 项';
    }
}

// GNOME扩展页面功能
function initExtensionPage() {
    const tabs = document.querySelectorAll('.extension-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// 终端模拟器功能
function initTerminal() {
    const terminal = document.querySelector('.terminal-body');
    if (!terminal) return;
    
    const input = terminal.querySelector('.terminal-input');
    const history = [];
    let historyIndex = -1;
    
    const commands = {
        help: () => {
            return [
                { text: '可用命令:', type: 'info' },
                { text: '  help        - 显示帮助信息', type: 'normal' },
                { text: '  clear       - 清屏', type: 'normal' },
                { text: '  ls          - 列出目录内容', type: 'normal' },
                { text: '  pwd         - 显示当前路径', type: 'normal' },
                { text: '  whoami      - 显示当前用户', type: 'normal' },
                { text: '  date        - 显示当前时间', type: 'normal' },
                { text: '  uname -a    - 显示系统信息', type: 'normal' },
                { text: '  dnf update  - 模拟系统更新', type: 'normal' },
                { text: '  neofetch    - 系统信息展示', type: 'normal' },
            ];
        },
        clear: () => {
            const inputLine = terminal.querySelector('.terminal-input-line');
            terminal.innerHTML = '';
            terminal.appendChild(inputLine);
            input.focus();
            return null;
        },
        ls: () => {
            return [
                { text: 'Desktop  Documents  Downloads  Music  Pictures  Videos', type: 'normal' }
            ];
        },
        pwd: () => {
            return [{ text: '/home/linux-savior', type: 'normal' }];
        },
        whoami: () => {
            return [{ text: 'linux-savior', type: 'normal' }];
        },
        date: () => {
            return [{ text: new Date().toLocaleString('zh-CN'), type: 'normal' }];
        },
        'uname -a': () => {
            return [{ text: 'Linux savior-workstation 6.8.0-fedora #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux', type: 'normal' }];
        },
        'dnf update': () => {
            return [
                { text: '正在检查更新...', type: 'info' },
                { text: '最后元数据过期检查: 0:01:23 前', type: 'normal' },
                { text: '依赖关系解决完成。', type: 'success' },
                { text: '', type: 'normal' },
                { text: ' 包                          架构      版本            仓库       大小', type: 'normal' },
                { text: '================================================================================', type: 'normal' },
                { text: '升级:  12 个包', type: 'normal' },
                { text: '', type: 'normal' },
                { text: '总下载大小: 156 MB', type: 'normal' },
                { text: '确定继续？[y/N]： y', type: 'warning' },
                { text: '下载包...', type: 'info' },
                { text: '[1/12] firefox-128.0-1.fc44.x86_64.rpm   68 MB   2.5 MB/s |  68 MB     00:27', type: 'normal' },
                { text: '... 完成', type: 'success' },
                { text: '运行事务检查', type: 'info' },
                { text: '事务检查成功。', type: 'success' },
                { text: '运行事务测试', type: 'info' },
                { text: '事务测试成功。', type: 'success' },
                { text: '运行事务', type: 'info' },
                { text: '  准备中        :                            1/1', type: 'normal' },
                { text: '  升级中        : firefox-128.0-1.fc44.x86_64  1/12', type: 'normal' },
                { text: '...', type: 'normal' },
                { text: '已升级:  12 个包', type: 'success' },
                { text: '完毕！', type: 'success' },
            ];
        },
        neofetch: () => {
            return [
                { text: '        .---.         linux-savior@savior-workstation', type: 'info' },
                { text: '       /     \\        -----------------------------', type: 'info' },
                { text: '      |  o o  |       OS: Fedora 44 (Workstation)', type: 'info' },
                { text: '      |  __   |       Host: Virtual Machine', type: 'info' },
                { text: '      | /  \\  |       Kernel: 6.8.0-fedora', type: 'info' },
                { text: '       \\____/         Uptime: 2 hours, 15 mins', type: 'info' },
                { text: '                       Shell: bash 5.2.26', type: 'info' },
                { text: '                       Resolution: 1920x1080', type: 'info' },
                { text: '                       DE: GNOME 46.0', type: 'info' },
                { text: '                       CPU: Intel i7-12700K (12) @ 3.6GHz', type: 'info' },
                { text: '                       Memory: 2048MiB / 8192MiB', type: 'info' },
            ];
        }
    };
    
    function addOutput(text, type = 'normal') {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        if (type === 'success') line.style.color = '#4ec9b0';
        else if (type === 'error') line.style.color = '#f48771';
        else if (type === 'warning') line.style.color = '#dcdcaa';
        else if (type === 'info') line.style.color = '#569cd6';
        line.textContent = text;
        
        const inputLine = terminal.querySelector('.terminal-input-line');
        terminal.insertBefore(line, inputLine);
    }
    
    function addCommandLine(cmd) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span style="color:#4ec9b0;">linux-savior@savior</span><span style="color:#569cd6;">:~</span><span style="color:#ce9178;">$ </span>${cmd}`;
        
        const inputLine = terminal.querySelector('.terminal-input-line');
        terminal.insertBefore(line, inputLine);
    }
    
    function executeCommand(cmd) {
        const trimmed = cmd.trim();
        if (!trimmed) return;
        
        history.push(trimmed);
        historyIndex = history.length;
        
        addCommandLine(trimmed);
        
        const cmdKey = Object.keys(commands).find(key => 
            trimmed === key || trimmed.startsWith(key + ' ')
        );
        
        if (cmdKey) {
            const output = commands[cmdKey]();
            if (output) {
                output.forEach(line => addOutput(line.text, line.type));
            }
        } else {
            addOutput(`bash: ${trimmed.split(' ')[0]}: 未找到命令`, 'error');
            addOutput('输入 help 查看可用命令', 'info');
        }
        
        terminal.scrollTop = terminal.scrollHeight;
    }
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeCommand(input.value);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                input.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                input.value = '';
            }
        }
    });
    
    terminal.addEventListener('click', () => {
        input.focus();
    });
    
    input.focus();
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    
    switch (page) {
        case 'commands':
            initCommandPage();
            break;
        case 'cleanup':
            initCleanupPage();
            break;
        case 'extensions':
            initExtensionPage();
            break;
        case 'terminal':
            initTerminal();
            break;
    }
});
