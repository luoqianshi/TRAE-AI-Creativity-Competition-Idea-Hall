/* ========== 水性墨水配方管理系统 - 主控制器 v2 (含权限) ========== */

let currentPage = 'materials';
let adminSubPage = 'materials'; // 管理员模式下原料/配方/工作台/用户管理的子页

function initApp() {
  initUsers();
  initDemoData();
  migrateAllPasswords().then(() => {
    // Load demo formulas if none exist (regular users only, guests handle separately)
    ensureDemoFormulas().then(() => {
      if (restoreSession()) {
        initAppMain();
      } else {
        showLoginPage();
      }
    });
  });
}

async function ensureDemoFormulas() {
  const existing = getFormulas();
  if (existing.length > 0) return; // already have formulas
  
  try {
    const resp = await fetch('js/_inject_formulas.js');
    if (!resp.ok) return;
    const code = await resp.text();
    // Execute the IIFE to inject formulas
    eval(code);
  } catch(e) {
    console.warn('Demo formulas inject failed (may not exist yet):', e.message);
  }
}

function initAppMain() {
  if (!isLoggedIn()) {
    showLoginPage();
    return;
  }

  // Guest mode: load demo data into isolated storage
  if (isGuest()) {
    initGuestData();
  }

  // Auto-migrate: assign colors to formulas based on name
  migrateFormulaColors();

  // Render sidebar with role-based nav
  renderSidebar();

  // Render topbar with user info
  renderTopbar();

  // Navigate to appropriate default page
  if (isAdmin()) {
    navigateTo('materials');
  } else {
    navigateTo('formulas');
  }
}

// ========== Sidebar ==========
function renderSidebar() {
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (!sidebarNav) return;

  let navHtml = '';

  if (isAdmin()) {
    // Admin sees all + 用户管理
    navHtml = `
      <button class="nav-item active" data-page="materials" onclick="navigateTo('materials')">
        ${ico('flask')} 原料管理
      </button>
      <button class="nav-item" data-page="formulas" onclick="navigateTo('formulas')">
        ${ico('clipboard-list')} 配方管理
      </button>
      <button class="nav-item" data-page="workbench" onclick="navigateTo('workbench')">
        ${ico('microscope')} 工作台
      </button>
      ${!isGuest() ? `
      <button class="nav-item" data-page="users" onclick="navigateTo('users')">
        ${ico('users')} 用户管理
      </button>
      ` : ''}
      <button class="nav-item nav-item-ai" data-page="ai" onclick="showAiChatPanel()">
        ${ico('robot')} AI 助手
      </button>
    `;
  } else {
    // Regular user
    const hasMatPerm = getAllowedCategories().length > 0;
    navHtml = `
      ${hasMatPerm ? `
      <button class="nav-item" data-page="materials" onclick="navigateTo('materials')">
        ${ico('flask')} 原料查看
      </button>` : ''}
      <button class="nav-item active" data-page="formulas" onclick="navigateTo('formulas')">
        ${ico('clipboard-list')} 配方管理
      </button>
      <button class="nav-item" data-page="workbench" onclick="navigateTo('workbench')">
        ${ico('microscope')} 工作台
      </button>
      <button class="nav-item nav-item-ai" data-page="ai" onclick="showAiChatPanel()">
        ${ico('robot')} AI 助手
      </button>
    `;
  }

  sidebarNav.innerHTML = navHtml;
}

// ========== Topbar ==========
function renderTopbar() {
  const topbarActions = document.querySelector('.topbar-actions');
  if (!topbarActions || !currentUser) return;

  const roleLabel = isGuest() ? '游客' : (isAdmin() ? '管理员' : '普通用户');
  const roleClass = isGuest() ? 'role-guest' : (isAdmin() ? 'role-admin' : 'role-user');

  topbarActions.innerHTML = `
    <div class="user-info">
      ${ico('user')} <span>${escHtml(currentUser.displayName)}</span>
      <span class="user-role ${roleClass}">${roleLabel}</span>
      <button class="btn-logout" onclick="handleLogout()">退出登录</button>
    </div>
  `;
}

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    logout();
  }
}

// ========== Navigation ==========
function navigateTo(page) {
  currentPage = page;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Update title
  const titles = {
    materials: '原料管理',
    formulas: '配方管理',
    workbench: '工作台',
    users: '用户管理'
  };
  document.getElementById('page-title').textContent = titles[page] || '';

  // Render
  switch (page) {
    case 'materials': renderMaterialsPage(); break;
    case 'formulas': renderFormulasPage(); break;
    case 'workbench': renderWorkbenchPage(); break;
    case 'users': if (isAdmin()) renderUserManagementPage(); else navigateTo('formulas'); break;
  }
}

// ========== User Management Page (Admin Only) ==========
function renderUserManagementPage() {
  if (!isAdmin()) { navigateTo('formulas'); return; }

  const content = document.getElementById('content');
  const users = getUsers();

  content.innerHTML = `
    <div class="toolbar flex items-center justify-between">
      <div class="flex gap-8 items-center">
        <span class="text-muted">共 <strong>${users.length}</strong> 个用户</span>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-primary btn-sm" onclick="renderUserModal()">＋ 添加用户</button>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>显示名称</th>
              <th>角色</th>
              <th>原料权限</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              const isCurrent = u.id === currentUser.id;
              const permCategories = u.role === 'admin' ? ['全部'] :
                (u.materialPermissions ? CATEGORIES.filter(c => u.materialPermissions[c]) : []);
              return `
                <tr>
                  <td>
                    <strong>${escHtml(u.username)}</strong>
                    ${isCurrent ? '<span class="text-muted" style="font-size:0.7rem;">(当前)</span>' : ''}
                  </td>
                  <td>${escHtml(u.displayName || u.username)}</td>
                  <td>
                    <span class="user-role ${u.role === 'admin' ? 'role-admin' : 'role-user'}">${u.role === 'admin' ? '管理员' : '普通用户'}</span>
                  </td>
                  <td>
                    ${u.role === 'admin'
                      ? '<span style="font-size:0.78rem;">' + ico('lock-open') + ' 全部原料</span>'
                      : permCategories.length > 0
                        ? permCategories.map(c => `<span class="tag tag-${CATEGORY_COLORS[c]}" style="margin:1px;">${c}</span>`).join(' ')
                        : '<span class="text-muted" style="font-size:0.78rem;">无权限</span>'
                    }
                  </td>
                  <td>
                    <span class="status-dot ${u.enabled ? 'active' : 'inactive'}"></span>
                    ${u.enabled ? '启用' : '禁用'}
                  </td>
                  <td class="text-muted">${formatDate(u.createdAt)}</td>
                  <td>
                    <div class="flex gap-4">
                      <button class="btn btn-ghost btn-sm" onclick="renderUserModal('${u.id}')">${ico('pen-to-square')} 编辑</button>
                      ${!isCurrent ? `<button class="btn btn-ghost btn-sm text-danger" onclick="handleDeleteUser('${u.id}','${escHtml(u.username)}')">${ico('trash-can')}</button>` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ========== User Create/Edit Modal ==========
async function renderUserModal(editId) {
  if (!isAdmin()) return;

  const isEdit = !!editId;
  const user = isEdit ? getUserById(editId) : null;
  if (isEdit && !user) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const isSelfEdit = isEdit && user.id === currentUser.id;
  const currentPerms = user?.materialPermissions || {};

  overlay.innerHTML = `
    <div class="modal" style="max-width:540px;">
      <div class="modal-header">
        <h3>${isEdit ? '编辑用户' : '添加用户'}</h3>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="this.closest('.modal-overlay').remove()">${ico('xmark')}</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>用户名 <span class="required">*</span></label>
          <input type="text" class="input" id="usr-username" value="${isEdit ? escHtml(user.username) : ''}" placeholder="登录用户名" ${isEdit ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label>显示名称</label>
          <input type="text" class="input" id="usr-displayname" value="${isEdit ? escHtml(user.displayName || '') : ''}" placeholder="显示在界面上的名称">
        </div>
        ${isEdit ? `
        <div class="form-group">
          <label>新密码 <span class="text-muted">（留空则不修改）</span></label>
          <input type="password" class="input" id="usr-password" placeholder="输入新密码">
        </div>
        ` : `
        <div class="form-group">
          <label>密码 <span class="required">*</span></label>
          <input type="password" class="input" id="usr-password" placeholder="设置登录密码">
        </div>
        `}
        <div class="form-group">
          <label>角色</label>
          <select class="select" id="usr-role" ${isSelfEdit ? 'disabled' : ''} onchange="onUserRoleChange()">
            <option value="user" ${(!user || user.role === 'user') ? 'selected' : ''}>普通用户</option>
            <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>管理员</option>
          </select>
        </div>

        <div class="form-group">
          <label>账号状态</label>
          <select class="select" id="usr-enabled" ${isSelfEdit ? 'disabled' : ''}>
            <option value="1" ${!user || user.enabled ? 'selected' : ''}>启用</option>
            <option value="0" ${user && !user.enabled ? 'selected' : ''}>禁用</option>
          </select>
        </div>

        <!-- Material permissions (for regular users only) -->
        <div id="perm-section" class="card mt-16" style="${user && user.role === 'admin' ? 'display:none;' : ''}">
          <div class="card-header">
            <h3>原料查看权限</h3>
            <span class="text-muted" style="font-size:0.72rem;">控制该用户可查看哪些分类的原料</span>
          </div>
          <div class="card-body">
            <div class="perm-grid">
              ${CATEGORIES.map(cat => `
                <div class="perm-card">
                  <div>
                    <div class="perm-info">${cat}</div>
                    <div class="perm-cat">
                      <span class="tag tag-${CATEGORY_COLORS[cat]}">分类</span>
                    </div>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" class="perm-checkbox" data-cat="${cat}"
                      ${!isEdit || currentPerms[cat] ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">取消</button>
        <button class="btn btn-primary" id="btn-save-user">保存</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Role change handler
  window.onUserRoleChange = () => {
    const role = overlay.querySelector('#usr-role').value;
    const permSection = overlay.querySelector('#perm-section');
    if (permSection) {
      permSection.style.display = role === 'admin' ? 'none' : '';
    }
  };

  // Save
  overlay.querySelector('#btn-save-user').onclick = async () => {
    const username = overlay.querySelector('#usr-username').value.trim();
    const displayName = overlay.querySelector('#usr-displayname').value.trim();
    const password = overlay.querySelector('#usr-password').value;
    const role = overlay.querySelector('#usr-role').value;
    const enabled = overlay.querySelector('#usr-enabled').value === '1';

    if (!isEdit && !username) { showToast('请输入用户名', 'error'); return; }
    if (!isEdit && !password) { showToast('请输入密码', 'error'); return; }

    if (isEdit) {
      // Update existing user
      if (displayName !== user.displayName || enabled !== user.enabled || role !== user.role) {
        updateUser(editId, { displayName, enabled, role });
      }

      // Update material permissions for regular users
      if (role === 'user') {
        const perms = {};
        overlay.querySelectorAll('.perm-checkbox').forEach(cb => {
          perms[cb.dataset.cat] = cb.checked;
        });
        updateUser(editId, { materialPermissions: perms });

        // If editing current user, refresh session
        if (editId === currentUser.id) {
          currentUser.materialPermissions = perms;
          renderSidebar();
        }
      }

      // Change password if provided
      if (password) {
        await updateUserPassword(editId, password);
      }

      showToast('用户已更新', 'success');
    } else {
      // Create new user
      const perms = {};
      if (role === 'user') {
        overlay.querySelectorAll('.perm-checkbox').forEach(cb => {
          perms[cb.dataset.cat] = cb.checked;
        });
      }

      const result = createUser({
        username,
        displayName: displayName || username,
        password,
        role,
        materialPermissions: perms
      });

      if (result.success) {
        showToast('用户已创建', 'success');
      } else {
        showToast(result.error, 'error');
        return;
      }
    }

    overlay.remove();
    renderUserManagementPage();
  };

  // Enter to save
  overlay.querySelector('#usr-username').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') overlay.querySelector('#btn-save-user').click();
  });
}

function handleDeleteUser(userId, username) {
  if (!isAdmin()) return;
  if (userId === currentUser.id) { showToast('不能删除自己', 'error'); return; }
  if (!confirm(`确定要删除用户「${username}」吗？此操作不可撤销。`)) return;

  if (deleteUser(userId)) {
    showToast('用户已删除', 'success');
    renderUserManagementPage();
  } else {
    showToast('删除失败', 'error');
  }
}

// ========== Keyboard shortcuts ==========
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
  }
});

// ========== Auto-migrate formula colors from name ==========
function migrateFormulaColors() {
  const formulas = getFormulas();
  let changed = false;
  
  const nameToColor = [
    ['蓝', '蓝'], ['青', '青'], ['绿', '绿'], ['黄', '黄'],
    ['橙', '橙'], ['红', '红'], ['紫', '紫'], ['品', '品红'],
    ['黑', '黑'], ['白', '白'], ['灰', '灰'], ['棕', '棕'],
    ['Cyan', '青'], ['Magenta', '品红'], ['Yellow', '黄'], ['Black', '黑'],
    ['White', '白'], ['Green', '绿'], ['Blue', '蓝'], ['Red', '红'],
    ['Violet', '紫']
  ];

  const nameToSubstrate = [
    ['柔版', '铜版纸'], ['凹版', 'PET膜'], ['丝印', '棉布/织物'],
    ['涂层', 'PE淋膜纸'], ['FLEX', '铜版纸'], ['GRAV', 'PET膜'],
    ['SCR', '棉布/织物']
  ];

  formulas.forEach(f => {
    if (!f.color) {
      for (const [keyword, color] of nameToColor) {
        if (f.name.includes(keyword)) { f.color = color; changed = true; break; }
      }
    }
    if (!f.substrate) {
      for (const [keyword, substrate] of nameToSubstrate) {
        if (f.name.includes(keyword)) { f.substrate = substrate; changed = true; break; }
      }
    }
  });

  if (changed) saveData(STORAGE_KEY_FORMULAS, formulas);
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);
