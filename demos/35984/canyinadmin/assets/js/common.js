// 公共JS工具
// 模拟数据
const mockData = {
    user: { name: '张老板', avatar: '张', shop: '蜀香小炒' },
    stats: {
        todaySales: 8654.5,
        todayOrders: 132,
        todayCustomers: 286,
        avgOrder: 65.6,
        salesTrend: 12.5,
        orderTrend: 8.3
    },
    weeklySales: [3200, 4500, 5100, 4800, 6200, 7800, 8654],
    dishRanking: [
        { name: '宫保鸡丁', sales: 156, amount: 4680 },
        { name: '麻婆豆腐', sales: 142, amount: 2840 },
        { name: '水煮鱼', sales: 98, amount: 5880 },
        { name: '回锅肉', sales: 87, amount: 3480 },
        { name: '鱼香肉丝', sales: 76, amount: 2280 }
    ],
    categoryDist: [
        { name: '热菜', value: 45 },
        { name: '凉菜', value: 18 },
        { name: '主食', value: 15 },
        { name: '汤品', value: 12 },
        { name: '酒水', value: 10 }
    ]
};

// 显示Toast
function showToast(message, duration = 2000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// 打开/关闭模态框
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'flex';
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
}

// 抽屉
function openDrawer(id) {
    const m = document.getElementById(id + '-mask');
    const d = document.getElementById(id);
    if (m) m.classList.add('show');
    if (d) d.classList.add('show');
}
function closeDrawer(id) {
    const m = document.getElementById(id + '-mask');
    const d = document.getElementById(id);
    if (m) m.classList.remove('show');
    if (d) d.classList.remove('show');
}

// 切换侧边栏菜单项
function setActiveMenu(menuName) {
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.toggle('active', el.dataset.menu === menuName);
    });
}

// 切换Tabs
function switchTab(tabsContainer, tabName) {
    const container = typeof tabsContainer === 'string' ? document.querySelector(tabsContainer) : tabsContainer;
    if (!container) return;
    container.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
    });
    const panels = container.parentElement.querySelectorAll('.tab-panel');
    panels.forEach(p => {
        p.style.display = p.dataset.panel === tabName ? 'block' : 'none';
    });
}

// 模拟时间
function formatDate(d) {
    const pad = n => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 时钟
function startClock(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    const update = () => {
        const d = new Date();
        const pad = n => n < 10 ? '0' + n : n;
        el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    update();
    setInterval(update, 1000);
}

// 倒计时
function startCountdown(elId, seconds) {
    const el = document.getElementById(elId);
    if (!el) return;
    let s = seconds;
    const update = () => {
        const m = Math.floor(s / 60);
        const ss = s % 60;
        el.textContent = `${m < 10 ? '0' + m : m}:${ss < 10 ? '0' + ss : ss}`;
    };
    update();
    const t = setInterval(() => {
        s--;
        if (s < 0) { clearInterval(t); return; }
        update();
    }, 1000);
}

// 模拟按钮交互
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn, .m-btn')) {
        // 触发点击反馈
    }
});
