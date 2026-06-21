// ============================================
// PC端统一交互增强
// ============================================

// 创建遮罩层
function ensureOverlay() {
    let o = document.getElementById('global-modal-overlay');
    if (!o) {
        o = document.createElement('div');
        o.id = 'global-modal-overlay';
        o.className = 'modal-overlay';
        document.body.appendChild(o);
    }
    return o;
}

// 通用模态框
function showModal({ title, content, footer, width = 560, onClose }) {
    const overlay = ensureOverlay();
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.style.maxWidth = width + 'px';
    wrap.innerHTML = `
        <div class="modal-header">
            <div class="modal-title">${title || '提示'}</div>
            <div class="modal-close" data-act="close">×</div>
        </div>
        <div class="modal-body" style="max-height:60vh;overflow-y:auto;">${content || ''}</div>
        ${footer !== false ? `<div class="modal-footer">
            <button class="btn btn-default" data-act="close">关闭</button>
            ${footer || '<button class="btn btn-primary" data-act="confirm">确定</button>'}
        </div>` : ''}
    `;
    overlay.innerHTML = '';
    overlay.appendChild(wrap);
    overlay.classList.add('show');

    const close = () => {
        overlay.classList.remove('show');
        overlay.innerHTML = '';
        if (onClose) onClose();
    };
    wrap.addEventListener('click', e => {
        if (e.target.dataset.act === 'close' || e.target.dataset.act === 'confirm') close();
    });
    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });
    return { close, wrap };
}

// 确认框
function showConfirm(message, onOk, onCancel) {
    showModal({
        title: '⚠️ 操作确认',
        content: `<div style="padding:8px 0;font-size:14px;line-height:1.8;">${message}</div>`,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" data-act="confirm" id="__confirm_ok">确定</button>`,
        width: 420,
        onClose: () => {}
    });
    setTimeout(() => {
        const ok = document.getElementById('__confirm_ok');
        if (ok) ok.addEventListener('click', () => { if (onOk) onOk(); });
    }, 50);
}

// Toast提示
function showToast(message, type = 'info', duration = 2000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    t.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, duration);
}

// 抽屉（侧边滑出）
function showDrawer({ title, content, width = 480, onClose }) {
    const overlay = ensureOverlay();
    overlay.innerHTML = `
        <div class="drawer" style="width:${width}px;">
            <div class="drawer-header">
                <div class="drawer-title">${title || ''}</div>
                <div class="modal-close" data-act="close">×</div>
            </div>
            <div class="drawer-body">${content || ''}</div>
        </div>
    `;
    overlay.classList.add('show');
    const close = () => {
        overlay.classList.remove('show');
        overlay.innerHTML = '';
        if (onClose) onClose();
    };
    overlay.addEventListener('click', e => {
        if (e.target === overlay || e.target.dataset.act === 'close') close();
    });
    return { close };
}

// 页面加载时自动绑定交互
document.addEventListener('DOMContentLoaded', () => {
    // 1. 所有 .btn 按钮的默认反馈
    document.body.addEventListener('click', e => {
        const btn = e.target.closest('.btn, .m-btn, .kds-btn, .menu-item, .page-link, .btn-link');
        if (!btn) return;
        const text = btn.textContent.trim();
        // 跳过空按钮和已绑定的特殊按钮
        if (btn.dataset.bound) return;
        if (text) {
            btn.style.transform = 'scale(0.96)';
            setTimeout(() => btn.style.transform = '', 100);
        }
    });

    // 2. 全局按钮的弹框交互（基于 data-action 标记）
    document.body.addEventListener('click', e => {
        const t = e.target.closest('[data-action]');
        if (!t) return;
        const act = t.dataset.action;
        if (window[act] && typeof window[act] === 'function') {
            window[act](t, e);
        }
    });

    // 3. Tabs切换
    document.querySelectorAll('.tabs').forEach(tabs => {
        tabs.addEventListener('click', e => {
            const tab = e.target.closest('.tab');
            if (!tab) return;
            tabs.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            tab.classList.add('active');
            const name = tab.dataset.tab;
            const parent = tabs.parentElement;
            parent.querySelectorAll('.tab-panel').forEach(p => {
                p.style.display = p.dataset.panel === name ? 'block' : 'none';
            });
        });
    });

    // 4. 模态框关闭
    document.body.addEventListener('click', e => {
        if (e.target.classList && e.target.classList.contains('modal-close')) {
            const overlay = document.getElementById('global-modal-overlay');
            if (overlay) { overlay.classList.remove('show'); overlay.innerHTML = ''; }
        }
    });
});

// ============================================
// 各页面业务交互
// ============================================

// 通用：查看订单详情
window.viewOrder = function (orderNo) {
    showModal({
        title: `📋 订单详情 #${orderNo}`,
        width: 720,
        content: `
            <div style="background:var(--primary-light);padding:14px;border-radius:8px;margin-bottom:14px;">
                <div class="flex-between">
                    <div>
                        <div style="font-size:16px;font-weight:600;">订单号：${orderNo}</div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">下单时间：2026-06-20 15:02:35</div>
                    </div>
                    <span class="tag tag-warning">⏰ 制作中</span>
                </div>
            </div>
            <div style="margin-bottom:14px;">
                <div style="font-weight:600;margin-bottom:8px;">📝 商品明细</div>
                <table class="table" style="font-size:13px;">
                    <thead><tr><th>菜品</th><th>规格</th><th>单价</th><th>数量</th><th>小计</th></tr></thead>
                    <tbody>
                        <tr><td>🍗 宫保鸡丁</td><td>中辣/大份</td><td>¥30</td><td>1</td><td><strong>¥30</strong></td></tr>
                        <tr><td>🥘 麻婆豆腐</td><td>微辣</td><td>¥20</td><td>1</td><td><strong>¥20</strong></td></tr>
                        <tr><td>🍚 米饭</td><td>-</td><td>¥3</td><td>3</td><td><strong>¥9</strong></td></tr>
                        <tr><td>🥤 可乐</td><td>冰</td><td>¥5</td><td>3</td><td><strong>¥15</strong></td></tr>
                    </tbody>
                </table>
            </div>
            <div style="background:#fafbfc;padding:12px;border-radius:8px;">
                <div class="flex-between" style="padding:3px 0;font-size:13px;"><span>商品总额</span><span>¥74.0</span></div>
                <div class="flex-between" style="padding:3px 0;font-size:13px;"><span>餐位费</span><span>¥6.0</span></div>
                <div class="flex-between" style="padding:3px 0;font-size:13px;color:var(--danger);"><span>会员折扣</span><span>-¥5.0</span></div>
                <div class="flex-between" style="padding:8px 0 0;font-size:18px;font-weight:700;border-top:1px solid #e0e0e0;margin-top:6px;">
                    <span>实收金额</span><span style="color:var(--primary);">¥158.5</span>
                </div>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">关闭</button>
                 <button class="btn btn-default">🖨 打印小票</button>
                 <button class="btn btn-primary">✓ 确认出餐</button>`
    });
};

// 通用：编辑表单（通用）
window.editForm = function (title, fields, onSave) {
    const fieldHtml = fields.map(f => `
        <div class="form-group">
            <label class="form-label">${f.label}${f.required ? ' <span style="color:var(--danger);">*</span>' : ''}</label>
            ${f.type === 'select' ?
                `<select class="form-control" id="__f_${f.key}">${(f.options || []).map(o => `<option value="${o.v}">${o.l}</option>`).join('')}</select>` :
              f.type === 'textarea' ?
                `<textarea class="form-control" id="__f_${f.key}" rows="3">${f.value || ''}</textarea>` :
                `<input class="form-control" type="${f.type || 'text'}" id="__f_${f.key}" value="${f.value || ''}" placeholder="${f.placeholder || ''}">`
            }
        </div>
    `).join('');
    const { close } = showModal({
        title: title,
        width: 560,
        content: `<div style="padding:8px 0;">${fieldHtml}</div>`,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" id="__form_save">保存</button>`
    });
    setTimeout(() => {
        const saveBtn = document.getElementById('__form_save');
        if (saveBtn) saveBtn.addEventListener('click', () => {
            const data = {};
            fields.forEach(f => { data[f.key] = (document.getElementById('__f_' + f.key) || {}).value; });
            if (onSave) onSave(data);
            close();
            showToast('保存成功！', 'success');
        });
    }, 50);
};

// ============================================
// 各页面的具体交互入口
// ============================================

// 登录页
window.doLogin = function (btn) {
    const user = document.getElementById('login-username')?.value;
    const pwd = document.getElementById('login-pwd')?.value;
    if (!user || !pwd) { showToast('请输入账号和密码', 'warning'); return; }
    btn.textContent = '登录中...';
    btn.disabled = true;
    setTimeout(() => {
        showToast('登录成功，正在跳转...', 'success');
        setTimeout(() => location.href = 'dashboard.html', 800);
    }, 1000);
};

// 仪表盘
window.refreshDashboard = function () {
    showToast('正在刷新数据...', 'info');
    setTimeout(() => showToast('数据已更新', 'success'), 800);
};
window.exportDashboard = function () {
    showModal({
        title: '📤 导出运营报表',
        content: `
            <div class="form-group"><label class="form-label">报表类型</label>
                <select class="form-control"><option>日报表</option><option>周报表</option><option>月报表</option></select>
            </div>
            <div class="form-group"><label class="form-label">导出格式</label>
                <select class="form-control"><option>Excel (.xlsx)</option><option>PDF</option><option>CSV</option></select>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('报表已生成，正在下载...','success')">开始导出</button>`
    });
};

// 菜单管理
window.addDish = function () {
    editForm('🍽️ 新增菜品', [
        { key: 'name', label: '菜品名称', required: true, placeholder: '请输入菜品名称' },
        { key: 'category', label: '菜品分类', type: 'select', options: [
            { v: '1', l: '🍖 招牌菜' }, { v: '2', l: '🥘 热菜' },
            { v: '3', l: '🥗 凉菜' }, { v: '4', l: '🍚 主食' },
            { v: '5', l: '🍲 汤品' }, { v: '6', l: '🥤 饮料' }
        ]},
        { key: 'price', label: '售价', type: 'number', required: true, placeholder: '0.00' },
        { key: 'cost', label: '成本', type: 'number', placeholder: '0.00' },
        { key: 'desc', label: '菜品描述', type: 'textarea', placeholder: '请输入菜品介绍...' },
        { key: 'status', label: '上架状态', type: 'select', options: [{v:'1',l:'立即上架'},{v:'0',l:'暂不上架'}] }
    ]);
};
window.exportMenu = function () {
    showModal({
        title: '📥 导出菜单',
        content: `
            <div class="form-group"><label class="form-label">导出范围</label>
                <select class="form-control"><option>全部菜品</option><option>当前分类</option><option>在售菜品</option></select>
            </div>
            <div class="form-group"><label class="form-label">导出格式</label>
                <select class="form-control"><option>Excel (.xlsx)</option><option>PDF（带图片）</option><option>CSV</option></select>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('菜单导出中...','success')">开始导出</button>`
    });
};
window.viewDish = function (name, price, sales) {
    showModal({
        title: '🍽️ ' + name,
        width: 520,
        content: `
            <div style="text-align:center;padding:20px 0;">
                <div style="width:120px;height:120px;margin:0 auto;background:linear-gradient(135deg,var(--primary),#ff8c5a);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:60px;color:#fff;">🍗</div>
                <div style="font-size:24px;font-weight:700;margin-top:14px;">${name}</div>
                <div style="color:var(--primary);font-size:28px;font-weight:700;margin-top:6px;">${price}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
                <div style="background:#fafbfc;padding:10px;border-radius:6px;text-align:center;">
                    <div style="color:var(--text-muted);font-size:11px;">已售</div>
                    <div style="font-weight:600;font-size:18px;">${sales}</div>
                </div>
                <div style="background:#fafbfc;padding:10px;border-radius:6px;text-align:center;">
                    <div style="color:var(--text-muted);font-size:11px;">评分</div>
                    <div style="font-weight:600;font-size:18px;color:#fa8c16;">⭐ 4.8</div>
                </div>
                <div style="background:#fafbfc;padding:10px;border-radius:6px;text-align:center;">
                    <div style="color:var(--text-muted);font-size:11px;">复购率</div>
                    <div style="font-weight:600;font-size:18px;color:#52c41a;">38%</div>
                </div>
            </div>
            <div style="background:#fafbfc;padding:12px;border-radius:6px;font-size:13px;line-height:1.8;">
                <div><strong>规格：</strong>大份 / 中份 / 小份</div>
                <div><strong>口味：</strong>微辣 / 中辣 / 特辣</div>
                <div><strong>配料：</strong>鸡腿肉、花生、干辣椒</div>
                <div><strong>状态：</strong><span class="tag tag-success">在售</span></div>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">关闭</button>
                 <button class="btn btn-default" onclick="editDish('${name}');document.querySelector('.modal-overlay .modal-close').click();">编辑</button>
                 <button class="btn btn-primary">查看销售明细</button>`
    });
};
window.editDish = function (name) {
    editForm(`✏️ 编辑菜品 - ${name}`, [
        { key: 'name', label: '菜品名称', value: name },
        { key: 'price', label: '售价', value: '30' },
        { key: 'desc', label: '描述', value: '香辣可口，川菜经典', type: 'textarea' }
    ]);
};
window.toggleDish = function (name) {
    showConfirm(`确定要切换菜品「${name}」的上下架状态吗？`, () => {
        showToast('操作成功', 'success');
    });
};
window.deleteDish = function (name) {
    showConfirm(`确定要删除菜品「<strong>${name}</strong>」吗？<br><span style="color:var(--danger);">删除后无法恢复！</span>`, () => {
        showToast('已删除', 'success');
    });
};

// 库存管理
window.stockIn = function (name) {
    showModal({
        title: '📥 物料入库' + (name ? ' - ' + name : ''),
        content: `
            <div class="form-group"><label class="form-label">物料名称</label><input class="form-control" value="${name || ''}" placeholder="搜索或选择物料"></div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group"><label class="form-label">入库数量</label><input class="form-control" type="number" placeholder="0.00"></div>
                <div class="form-group"><label class="form-label">单位</label><select class="form-control"><option>kg</option><option>g</option><option>个</option><option>箱</option><option>袋</option></select></div>
            </div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group"><label class="form-label">单价（元）</label><input class="form-control" type="number" placeholder="0.00"></div>
                <div class="form-group"><label class="form-label">供应商</label><select class="form-control"><option>汇通冷链</option><option>鲜达物流</option><option>本地批发</option></select></div>
            </div>
            <div class="form-group"><label class="form-label">生产日期</label><input class="form-control" type="date" value="2026-06-20"></div>
            <div class="form-group"><label class="form-label">备注</label><textarea class="form-control" rows="2"></textarea></div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('入库成功 ✓','success')">确认入库</button>`
    });
};
window.stockOut = function () {
    showModal({
        title: '📤 物料出库',
        content: `
            <div class="form-group"><label class="form-label">物料名称</label><input class="form-control" placeholder="搜索或选择物料"></div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group"><label class="form-label">出库数量</label><input class="form-control" type="number" placeholder="0.00"></div>
                <div class="form-group"><label class="form-label">用途</label><select class="form-control"><option>菜品制作</option><option>报损</option><option>调拨</option><option>其他</option></select></div>
            </div>
            <div class="form-group"><label class="form-label">关联订单</label><input class="form-control" placeholder="选填"></div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('出库成功 ✓','success')">确认出库</button>`
    });
};
window.stockCheck = function () {
    showModal({
        title: '📊 库存盘点',
        width: 600,
        content: `
            <div style="background:#fafbfc;padding:12px;border-radius:6px;margin-bottom:12px;font-size:13px;color:var(--text-secondary);">
                💡 盘点将生成实盘数据与系统库存的差异报告
            </div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group"><label class="form-label">盘点类型</label><select class="form-control"><option>全盘</option><option>分类盘点</option><option>重点物料</option></select></div>
                <div class="form-group"><label class="form-label">盘点人</label><input class="form-control" value="张老板"></div>
            </div>
            <div class="form-group"><label class="form-label">备注</label><textarea class="form-control" rows="2" placeholder="本次盘点的特殊情况说明..."></textarea></div>
            <div style="background:#fff7e6;padding:10px;border-radius:6px;font-size:12px;color:#d48806;">⚠️ 开始盘点后，系统将暂停该部分物料的出入库操作</div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('盘点任务已创建','success')">开始盘点</button>`
    });
};
window.addMaterial = function () {
    editForm('➕ 新增物料', [
        { key: 'code', label: '物料编码', required: true, placeholder: '如：SP-0087' },
        { key: 'name', label: '物料名称', required: true, placeholder: '如：鸡腿肉' },
        { key: 'category', label: '物料分类', type: 'select', options: [
            {v:'1',l:'🥩 肉类'},{v:'2',l:'🐟 海鲜水产'},
            {v:'3',l:'🥬 蔬菜'},{v:'4',l:'🍚 主食粮油'},
            {v:'5',l:'🧂 调味品'},{v:'6',l:'🥤 酒水饮料'}
        ]},
        { key: 'unit', label: '计量单位', type: 'select', options: [
            {v:'1',l:'kg'},{v:'2',l:'g'},{v:'3',l:'个'},{v:'4',l:'箱'},{v:'5',l:'袋'}
        ]},
        { key: 'price', label: '单价', type: 'number', placeholder: '0.00' },
        { key: 'safe', label: '安全库存', type: 'number', placeholder: '10' },
        { key: 'warn', label: '预警线', type: 'number', placeholder: '5' }
    ]);
};
window.viewMaterial = function (name) {
    showModal({
        title: '📦 物料详情 - ' + name,
        content: `
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;">
                <div style="background:#fafbfc;padding:10px;border-radius:6px;"><div style="color:var(--text-muted);font-size:11px;">当前库存</div><div style="font-size:20px;font-weight:600;color:var(--primary);margin-top:4px;">12.0 kg</div></div>
                <div style="background:#fafbfc;padding:10px;border-radius:6px;"><div style="color:var(--text-muted);font-size:11px;">库存价值</div><div style="font-size:20px;font-weight:600;color:#fa8c16;margin-top:4px;">¥456</div></div>
            </div>
            <div style="background:#fafbfc;padding:12px;border-radius:6px;font-size:13px;line-height:1.8;">
                <div><strong>分类：</strong>🥩 肉类</div>
                <div><strong>安全库存：</strong>8 kg</div>
                <div><strong>预警线：</strong>10 kg</div>
                <div><strong>单价：</strong>¥38/kg</div>
                <div><strong>供应商：</strong>汇通冷链</div>
                <div><strong>最近入库：</strong>2026-06-18</div>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">关闭</button>
                 <button class="btn btn-primary" onclick="stockIn('${name}');document.querySelector('.modal-overlay .modal-close').click();">立即入库</button>`
    });
};

// 员工管理
window.addStaff = function () {
    editForm('➕ 新增员工', [
        { key: 'name', label: '员工姓名', required: true, placeholder: '请输入员工姓名' },
        { key: 'phone', label: '联系电话', required: true, placeholder: '11位手机号' },
        { key: 'role', label: '岗位角色', type: 'select', options: [
            {v:'1',l:'👨‍🍳 厨师'},{v:'2',l:'🍽️ 服务员'},{v:'3',l:'💰 收银员'},
            {v:'4',l:'📦 库管'},{v:'5',l:'👔 店长'},{v:'6',l:'🧹 清洁'}
        ]},
        { key: 'id', label: '工号', placeholder: '自动生成' },
        { key: 'entry', label: '入职日期', type: 'date' },
        { key: 'salary', label: '月薪', type: 'number', placeholder: '0.00' },
        { key: 'status', label: '账号状态', type: 'select', options: [{v:'1',l:'✅ 启用'},{v:'0',l:'❌ 禁用'}] }
    ]);
};
window.viewStaff = function (name) {
    showModal({
        title: '👤 员工档案 - ' + name,
        content: `
            <div style="text-align:center;padding:16px 0;">
                <div style="width:80px;height:80px;margin:0 auto;background:linear-gradient(135deg,#1890ff,#36cfc9);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:32px;font-weight:600;">${name.substr(0,1)}</div>
                <div style="font-size:20px;font-weight:600;margin-top:10px;">${name}</div>
                <div style="color:var(--text-secondary);font-size:13px;margin-top:4px;">工号 EM-002 · 服务员 · 入职 2024-03-15</div>
            </div>
            <div style="background:#fafbfc;padding:12px;border-radius:6px;font-size:13px;line-height:1.8;">
                <div><strong>联系电话：</strong>138****8888</div>
                <div><strong>所属门店：</strong>蜀香小炒·春熙店</div>
                <div><strong>本月工时：</strong>176 小时</div>
                <div><strong>本月业绩：</strong>¥12,580</div>
                <div><strong>综合评分：</strong>⭐ 4.8 / 5.0</div>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">关闭</button>
                 <button class="btn btn-primary" onclick="showToast('编辑成功','success')">编辑资料</button>`
    });
};

// 店铺管理
window.viewShop = function (name) {
    showModal({
        title: '🏪 店铺详情 - ' + name,
        content: `
            <div style="background:linear-gradient(135deg,#fff7e6,#ffe7ba);padding:16px;border-radius:8px;margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-size:20px;font-weight:700;">${name}</div>
                        <div style="color:var(--text-secondary);font-size:13px;margin-top:4px;">🌶️ 堂食 · 川菜</div>
                    </div>
                    <span class="tag tag-success">营业中</span>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                <div style="background:#fafbfc;padding:10px;border-radius:6px;"><div style="color:var(--text-muted);font-size:11px;">今日订单</div><div style="font-size:20px;font-weight:600;margin-top:4px;">132</div></div>
                <div style="background:#fafbfc;padding:10px;border-radius:6px;"><div style="color:var(--text-muted);font-size:11px;">今日营收</div><div style="font-size:20px;font-weight:600;color:var(--primary);margin-top:4px;">¥8,652</div></div>
                <div style="background:#fafbfc;padding:10px;border-radius:6px;"><div style="color:var(--text-muted);font-size:11px;">桌台数</div><div style="font-size:20px;font-weight:600;margin-top:4px;">24</div></div>
                <div style="background:#fafbfc;padding:10px;border-radius:6px;"><div style="color:var(--text-muted);font-size:11px;">员工数</div><div style="font-size:20px;font-weight:600;margin-top:4px;">16</div></div>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">关闭</button>
                 <button class="btn btn-primary" onclick="showToast('已切换到该店铺','success')">进入店铺</button>`
    });
};

// 订单处理
window.viewOrder = function (no) {
    showModal({
        title: '📋 订单详情 ' + no,
        width: 640,
        content: `
            <div style="background:linear-gradient(135deg,#fff7e6,#fff1f0);padding:14px;border-radius:8px;margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div><div style="color:var(--text-secondary);font-size:12px;">订单号</div><div style="font-weight:600;font-size:15px;margin-top:2px;">${no}</div></div>
                    <span class="tag tag-warning">制作中</span>
                </div>
            </div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                <div class="form-group"><label class="form-label">订单类型</label><div>🍽️ 堂食 · 5号桌</div></div>
                <div class="form-group"><label class="form-label">顾客</label><div>3人</div></div>
                <div class="form-group"><label class="form-label">下单时间</label><div>2026-06-20 15:02:35</div></div>
                <div class="form-group"><label class="form-label">支付方式</label><div>💚 微信支付</div></div>
            </div>
            <div style="background:#fafbfc;border-radius:8px;padding:12px;margin-bottom:12px;">
                <div style="font-weight:600;margin-bottom:8px;">📝 商品明细</div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #eee;"><span>宫保鸡丁 x 1</span><span style="color:var(--primary);font-weight:600;">¥30</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #eee;"><span>麻婆豆腐 x 1</span><span style="color:var(--primary);font-weight:600;">¥20</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>米饭 x 3</span><span style="color:var(--primary);font-weight:600;">¥6</span></div>
            </div>
            <div style="background:#fff7e6;padding:10px;border-radius:6px;font-size:12px;color:#d48806;">📌 备注：少辣，不要香菜</div>
        `,
        footer: `<button class="btn btn-default" data-act="close">关闭</button>
                 <button class="btn btn-primary" onclick="showToast('小票已打印 ✓','success')">🖨️ 打印小票</button>`
    });
};
window.processOrder = function (act, no) {
    const messages = {
        '接单': '已成功接单，订单进入制作流程',
        '出餐': '已出餐，请通知顾客取餐',
        '完成': '订单已完成，感谢您的使用'
    };
    showConfirm(`确认 <strong>${act}</strong> 订单 <strong>${no}</strong> ？`, () => {
        showToast(`订单 ${no} ${messages[act] || '操作成功'} ✓`, 'success');
    });
};
window.rejectOrder = function (no) {
    showModal({
        title: '⚠️ 拒单 - ' + no,
        content: `
            <div class="form-group"><label class="form-label">拒单原因（必填）</label>
                <select class="form-control"><option>食材不足</option><option>已打烊</option><option>超出配送范围</option><option>顾客要求</option><option>其他</option></select>
            </div>
            <div class="form-group"><label class="form-label">详细说明</label>
                <textarea class="form-control" rows="3" placeholder="请说明拒单的具体原因..."></textarea>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-danger" style="background:var(--danger);color:#fff;" onclick="showToast('订单已拒单并退款给顾客','success')">确认拒单</button>`
    });
};
window.reorder = function (no) {
    showToast(`订单 ${no} 的商品已加入购物车`, 'success');
    setTimeout(() => location.href = 'order.html', 800);
};
window.createOrder = function () {
    showModal({
        title: '➕ 新建订单',
        width: 640,
        content: `
            <div class="form-group"><label class="form-label">订单类型</label>
                <select class="form-control"><option>🍽️ 堂食</option><option>🛵 外送</option><option>🥡 自取</option></select>
            </div>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group"><label class="form-label">桌号/地址</label><input class="form-control" placeholder="如：5号桌"></div>
                <div class="form-group"><label class="form-label">人数</label><input class="form-control" type="number" value="2"></div>
            </div>
            <div class="form-group"><label class="form-label">顾客手机</label><input class="form-control" placeholder="11位手机号"></div>
            <div class="form-group"><label class="form-label">添加菜品</label>
                <input class="form-control" placeholder="点击选择菜品..." readonly onclick="showToast('菜品选择器已打开','info')">
            </div>
            <div class="form-group"><label class="form-label">备注</label><textarea class="form-control" rows="2"></textarea></div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('订单已创建','success')">创建订单</button>`
    });
};
window.processOrder = function (no) {
    showModal({
        title: `📋 处理订单 #${no}`,
        content: `
            <div class="form-group"><label class="form-label">处理动作</label>
                <select class="form-control" id="__proc_act">
                    <option>✓ 确认接单</option>
                    <option>🍳 开始制作</option>
                    <option>📦 已出餐</option>
                    <option>🚚 配送中</option>
                    <option>✅ 已完成</option>
                    <option>❌ 取消订单</option>
                </select>
            </div>
            <div class="form-group"><label class="form-label">备注</label>
                <textarea class="form-control" rows="3" placeholder="请输入处理说明..."></textarea>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('订单处理成功','success')">确认</button>`
    });
};

// 桌台管理
window.openTable = function (no) {
    editForm(`🪑 开台 - ${no}号桌`, [
        { key: 'people', label: '就餐人数', type: 'number', required: true, placeholder: '几人' },
        { key: 'customer', label: '顾客姓名', placeholder: '选填' },
        { key: 'phone', label: '联系电话', placeholder: '选填' },
        { key: 'note', label: '备注', type: 'textarea' }
    ]);
};
window.tableAction = function (no, action) {
    const actions = {
        '点菜': () => showDrawer({ title: `🍽️ ${no}号桌 点菜`, width: 720, content: `
            <div style="display:flex;gap:12px;height:500px;">
                <div style="width:120px;background:#fafbfc;border-radius:8px;padding:8px;overflow-y:auto;">
                    <div style="padding:8px;background:var(--primary);color:#fff;border-radius:6px;font-size:13px;margin-bottom:4px;">招牌菜</div>
                    <div style="padding:8px;font-size:13px;color:#666;">精品肉</div>
                    <div style="padding:8px;font-size:13px;color:#666;">精品素</div>
                    <div style="padding:8px;font-size:13px;color:#666;">汤品</div>
                    <div style="padding:8px;font-size:13px;color:#666;">主食</div>
                </div>
                <div style="flex:1;overflow-y:auto;">
                    ${['宫保鸡丁', '水煮鱼', '麻婆豆腐', '手撕包菜'].map(n => `
                        <div style="display:flex;gap:10px;align-items:center;padding:8px;border-bottom:1px solid #f0f0f0;">
                            <div style="width:50px;height:50px;background:linear-gradient(135deg,#ff7a45,#ff9c6e);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:24px;">🍗</div>
                            <div style="flex:1;"><div style="font-weight:500;">${n}</div><div style="color:var(--primary);font-weight:600;">¥30</div></div>
                            <button class="btn btn-primary btn-sm">+ 加菜</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `}),
        '加单': () => showToast('请在菜单中点选要追加的菜品', 'info'),
        '结账': () => showModal({
            title: `💰 ${no}号桌 结账`,
            width: 520,
            content: `
                <div style="background:#fafbfc;padding:14px;border-radius:8px;margin-bottom:14px;">
                    <div class="flex-between" style="padding:4px 0;font-size:13px;"><span>商品总额</span><span>¥138.0</span></div>
                    <div class="flex-between" style="padding:4px 0;font-size:13px;"><span>餐位费</span><span>¥8.0</span></div>
                    <div class="flex-between" style="padding:4px 0;font-size:13px;color:var(--danger);"><span>会员折扣</span><span>-¥13.8</span></div>
                    <div class="flex-between" style="padding:8px 0 0;font-size:20px;font-weight:700;border-top:1px solid #e0e0e0;margin-top:6px;">
                        <span>应收</span><span style="color:var(--primary);">¥132.2</span>
                    </div>
                </div>
                <div class="form-group"><label class="form-label">支付方式</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div style="border:2px solid var(--primary);padding:10px;border-radius:6px;text-align:center;background:var(--primary-light);">💚 微信</div>
                        <div style="border:1px solid #e0e0e0;padding:10px;border-radius:6px;text-align:center;">💙 支付宝</div>
                        <div style="border:1px solid #e0e0e0;padding:10px;border-radius:6px;text-align:center;">💵 现金</div>
                        <div style="border:1px solid #e0e0e0;padding:10px;border-radius:6px;text-align:center;">💳 银行卡</div>
                    </div>
                </div>
            `,
            footer: `<button class="btn btn-default" data-act="close">取消</button>
                     <button class="btn btn-primary" onclick="showToast('结账成功！','success')">💚 确认支付</button>`
        }),
        '清台': () => showConfirm(`确定要清理 ${no}号桌 吗？`, () => showToast('已清理完成', 'success')),
        '详情': () => showModal({ title: `${no}号桌 详情`, content: `<div style="padding:14px;">桌台编号：${no}<br>桌台类型：4人桌<br>当前状态：就餐中<br>顾客人数：3人<br>开台时间：14:30</div>` })
    };
    if (actions[action]) actions[action]();
};

// 库存管理
window.addInbound = function () {
    editForm('📥 入库登记', [
        { key: 'sku', label: '物料编码', required: true, placeholder: '选择物料' },
        { key: 'qty', label: '入库数量', type: 'number', required: true },
        { key: 'price', label: '入库单价', type: 'number', required: true },
        { key: 'supplier', label: '供应商', required: true },
        { key: 'date', label: '入库日期', type: 'date' },
        { key: 'note', label: '备注', type: 'textarea' }
    ]);
};
window.addOutbound = function () {
    editForm('📤 出库登记', [
        { key: 'sku', label: '物料编码', required: true },
        { key: 'qty', label: '出库数量', type: 'number', required: true },
        { key: 'reason', label: '出库原因', type: 'select', options: [
            {v:'1',l:'生产领用'},{v:'2',l:'报损出库'},{v:'3',l:'调拨出库'}
        ]},
        { key: 'date', label: '出库日期', type: 'date' }
    ]);
};
window.stockCheck = function () {
    editForm('📋 库存盘点', [
        { key: 'sku', label: '物料编码', required: true },
        { key: 'bookQty', label: '账面库存', type: 'number' },
        { key: 'actualQty', label: '实际库存', type: 'number', required: true },
        { key: 'diff', label: '差异数量', type: 'number' },
        { key: 'reason', label: '差异原因', type: 'textarea' }
    ]);
};
window.alertStock = function (name) {
    showConfirm(`确定要为「${name}」设置库存预警吗？`, () => {
        showToast('预警已设置', 'success');
    });
};

// 销售报表
window.exportReport = function () {
    showModal({
        title: '📤 导出销售报表',
        content: `
            <div class="form-group"><label class="form-label">时间范围</label>
                <div style="display:flex;gap:8px;">
                    <input class="form-control" type="date" value="2026-06-01">
                    <input class="form-control" type="date" value="2026-06-20">
                </div>
            </div>
            <div class="form-group"><label class="form-label">报表内容</label>
                <div style="display:flex;gap:12px;font-size:13px;">
                    <label><input type="checkbox" checked> 营收数据</label>
                    <label><input type="checkbox" checked> 菜品销量</label>
                    <label><input type="checkbox"> 利润分析</label>
                    <label><input type="checkbox"> 会员数据</label>
                </div>
            </div>
            <div class="form-group"><label class="form-label">导出格式</label>
                <select class="form-control"><option>Excel (.xlsx)</option><option>PDF</option></select>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('报表生成中...','success')">开始导出</button>`
    });
};
window.printReport = function () { showToast('正在发送到打印机...', 'success'); };

// 员工管理
window.addStaff = function () {
    editForm('👤 新增员工', [
        { key: 'name', label: '员工姓名', required: true },
        { key: 'phone', label: '手机号', required: true, placeholder: '11位手机号' },
        { key: 'role', label: '角色', type: 'select', options: [
            {v:'1',l:'店长'},{v:'2',l:'厨师长'},{v:'3',l:'厨师'},
            {v:'4',l:'服务员'},{v:'5',l:'收银员'},{v:'6',l:'帮厨'}
        ]},
        { key: 'salary', label: '基本工资', type: 'number' },
        { key: 'date', label: '入职日期', type: 'date' },
        { key: 'idCard', label: '身份证号' },
        { key: 'addr', label: '家庭住址' }
    ]);
};
window.viewStaff = function (name) {
    showModal({
        title: `👤 员工档案 - ${name}`,
        width: 640,
        content: `
            <div style="display:flex;gap:16px;align-items:center;padding:14px;background:linear-gradient(135deg,var(--primary-light),#fff);border-radius:8px;margin-bottom:14px;">
                <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#ff8c5a);display:flex;align-items:center;justify-content:center;font-size:30px;color:#fff;">张</div>
                <div style="flex:1;">
                    <div style="font-size:20px;font-weight:700;">${name}</div>
                    <div style="color:var(--text-secondary);margin-top:4px;">厨师长 · 工号 E-001</div>
                    <div style="font-size:13px;color:var(--text-secondary);margin-top:8px;">📞 138****1234 · 2024-03-15 入职</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="background:#f6ffed;padding:12px;border-radius:8px;">
                    <div style="font-size:12px;color:var(--text-secondary);">本月出勤</div>
                    <div style="font-size:24px;font-weight:700;color:#52c41a;">22/22 天</div>
                </div>
                <div style="background:#fff7e6;padding:12px;border-radius:8px;">
                    <div style="font-size:12px;color:var(--text-secondary);">本月工资</div>
                    <div style="font-size:24px;font-weight:700;color:#fa8c16;">¥8,500</div>
                </div>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">关闭</button>
                 <button class="btn btn-primary">编辑信息</button>`
    });
};
window.leaveStaff = function (name) {
    showConfirm(`确定办理员工「<strong>${name}</strong>」的离职手续吗？`, () => {
        showToast('已办理离职', 'success');
    });
};
window.batchShift = function () {
    showModal({
        title: '📅 批量排班',
        width: 580,
        content: `
            <div class="form-group"><label class="form-label">选择员工（可多选）</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px;">
                    <label><input type="checkbox" checked> 张师傅</label>
                    <label><input type="checkbox" checked> 王哥</label>
                    <label><input type="checkbox" checked> 李姐</label>
                    <label><input type="checkbox" checked> 刘师傅</label>
                    <label><input type="checkbox" checked> 陈阿姨</label>
                    <label><input type="checkbox"> 赵小妹</label>
                </div>
            </div>
            <div class="form-group"><label class="form-label">日期范围</label>
                <div style="display:flex;gap:8px;">
                    <input class="form-control" type="date" value="2026-06-20">
                    <input class="form-control" type="date" value="2026-06-26">
                </div>
            </div>
            <div class="form-group"><label class="form-label">班次</label>
                <select class="form-control">
                    <option>早班 09:00-14:00</option>
                    <option>中班 14:00-21:00</option>
                    <option>晚班 17:00-22:00</option>
                </select>
            </div>
        `,
        footer: `<button class="btn btn-default" data-act="close">取消</button>
                 <button class="btn btn-primary" onclick="showToast('排班已保存','success')">确认排班</button>`
    });
};

// KDS大屏
window.kdsAction = function (act, no) {
    if (act === '出餐') {
        showConfirm(`确认订单 <strong>#${no}</strong> 已制作完成并出餐？`, () => {
            showToast(`订单 #${no} 已出餐！`, 'success');
            setTimeout(() => location.reload(), 1000);
        });
    } else if (act === '开始制作') {
        showToast(`订单 #${no} 制作中...`, 'info');
        setTimeout(() => showToast(`订单 #${no} 状态已更新`, 'success'), 1000);
    } else if (act === '通知服务员') {
        showToast(`已通知服务员，订单 #${no}`, 'info');
    } else if (act === '查看明细') {
        showModal({
            title: `订单 #${no} 制作详情`,
            width: 520,
            content: `
                <div style="background:#fafbfc;padding:14px;border-radius:8px;margin-bottom:12px;">
                    <div class="flex-between" style="padding:4px 0;font-size:13px;"><span>桌台</span><span>5号桌 · 3人</span></div>
                    <div class="flex-between" style="padding:4px 0;font-size:13px;"><span>下单时间</span><span>14:30</span></div>
                    <div class="flex-between" style="padding:4px 0;font-size:13px;"><span>预计用时</span><span>15 分钟</span></div>
                    <div class="flex-between" style="padding:4px 0;font-size:13px;"><span>订单类型</span><span>堂食</span></div>
                </div>
                <div style="background:#fff;border:1px solid #e0e0e0;padding:12px;border-radius:8px;">
                    <div style="font-weight:600;margin-bottom:8px;">📋 制作要求</div>
                    <ul style="font-size:13px;line-height:1.8;color:var(--text-secondary);">
                        <li>宫保鸡丁 - 中辣 / 大份</li>
                        <li>麻婆豆腐 - 微辣</li>
                        <li>米饭 3 份</li>
                        <li>可乐 3 杯</li>
                    </ul>
                    <div style="margin-top:8px;padding:8px;background:#fff7e6;border-radius:6px;font-size:12px;color:#d48806;">
                        💬 顾客备注：菜里少放花生
                    </div>
                </div>
            `,
            footer: `<button class="btn btn-default" data-act="close">关闭</button>
                     <button class="btn btn-primary">✓ 确认出餐</button>`
        });
    }
};

// 店铺信息
window.editShop = function () {
    editForm('🏪 编辑店铺信息', [
        { key: 'name', label: '店铺名称', value: '蜀香小炒 · 成都太古里店' },
        { key: 'phone', label: '联系电话', value: '028-88888888' },
        { key: 'address', label: '店铺地址', value: '成都市锦江区春熙路太古里7号', type: 'textarea' },
        { key: 'business', label: '营业时间', value: '09:00-22:00' },
        { key: 'type', label: '店铺类型', type: 'select', options: [
            {v:'1',l:'堂食'},{v:'2',l:'外送'},{v:'3',l:'堂食+外送'}
        ]}
    ]);
};

// 通用编辑表格行的辅助
window.editRow = function (tableName, rowIdx) {
    showToast(`正在编辑 ${tableName} 第 ${rowIdx} 行...`, 'info');
};
window.deleteRow = function (name) {
    showConfirm(`确定要删除 <strong>${name}</strong> 吗？`, () => showToast('已删除', 'success'));
};
