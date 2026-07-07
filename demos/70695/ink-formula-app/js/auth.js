/* ========== 水性墨水配方管理系统 - 用户认证与权限模块 ========== */

const STORAGE_KEY_USERS = 'ink_users';
const STORAGE_KEY_SESSION = 'ink_session';

let currentUser = null;

// ========== User Storage ==========
function getUsers() {
  return loadData(STORAGE_KEY_USERS);
}

function saveUsers(users) {
  saveData(STORAGE_KEY_USERS, users);
}

function getUserById(id) {
  return getUsers().find(u => u.id === id);
}

function getUserByUsername(username) {
  return getUsers().find(u => u.username === username);
}

// ========== Init Default Users ==========
function initUsers() {
  let users = getUsers();
  let changed = false;

  // Ensure each default user exists (idempotent)
  const defaults = [
    { username: 'admin', password: 'admin123', displayName: '管理员', role: 'admin', materialPermissions: null },
    { username: 'user1', password: 'user123', displayName: '配方工程师-张三', role: 'user', materialPermissions: { '溶剂': true, '助剂': true, '树脂': true, '色浆': true } }
  ];

  defaults.forEach(def => {
    if (!users.find(u => u.username === def.username)) {
      users.push({
        id: genId(),
        username: def.username,
        password: def.password,
        displayName: def.displayName,
        role: def.role,
        enabled: true,
        materialPermissions: def.materialPermissions,
        createdAt: new Date().toISOString()
      });
      changed = true;
    }
  });

  if (changed) saveUsers(users);
  return users;
}

// ========== Password Hash (simple SHA-256) ==========
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'ink_salt_2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(input, storedHash) {
  const inputHash = await hashPassword(input);
  return inputHash === storedHash;
}

// ========== Login / Logout ==========
async function login(username, password) {
  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return { success: false, error: '用户名不存在' };
  }
  if (!user.enabled) {
    return { success: false, error: '该账号已被禁用，请联系管理员' };
  }

  // If password is stored as plaintext (legacy/migration), compare directly first, then migrate
  let match = false;
  if (user.passwordHash) {
    match = await verifyPassword(password, user.passwordHash);
  } else {
    // Plaintext fallback - migrate to hash
    match = (password === user.password);
    if (match) {
      user.passwordHash = await hashPassword(password);
      user.password = undefined;
      saveUsers(users);
    }
  }

  if (!match) {
    return { success: false, error: '密码错误' };
  }

  currentUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    materialPermissions: user.materialPermissions || {}
  };

  // Save session
  const session = {
    userId: user.id,
    loginAt: new Date().toISOString()
  };
  saveData(STORAGE_KEY_SESSION, session);

  return { success: true };
}

function guestLogin() {
  currentUser = {
    id: 'guest',
    username: 'guest',
    displayName: '游客',
    role: 'guest',
    materialPermissions: null
  };

  const session = {
    userId: 'guest',
    loginAt: new Date().toISOString()
  };
  saveData(STORAGE_KEY_SESSION, session);

  return { success: true };
}

function logout() {
  currentUser = null;
  saveData(STORAGE_KEY_SESSION, null);
  showLoginPage();
}

function restoreSession() {
  const session = loadData(STORAGE_KEY_SESSION);
  if (!session) return false;

  // Guest session
  if (session.userId === 'guest') {
    currentUser = {
      id: 'guest',
      username: 'guest',
      displayName: '游客',
      role: 'guest',
      materialPermissions: null
    };
    return true;
  }

  const user = getUserById(session.userId);
  if (!user || !user.enabled) return false;

  currentUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    materialPermissions: user.materialPermissions || {}
  };
  return true;
}

// ========== Permission Checks ==========
function isAdmin() {
  return currentUser && (currentUser.role === 'admin' || currentUser.role === 'guest');
}

function isGuest() {
  return currentUser && currentUser.role === 'guest';
}

function isLoggedIn() {
  return !!currentUser;
}

function canViewCategory(category) {
  if (!currentUser) return false;
  if (isAdmin()) return true;
  const perms = currentUser.materialPermissions || {};
  return !!perms[category];
}

function getAllowedCategories() {
  if (!currentUser) return [];
  if (isAdmin()) return [...CATEGORIES];
  const perms = currentUser.materialPermissions || {};
  return CATEGORIES.filter(c => perms[c]);
}

// ========== User Management (Admin) ==========
function createUser(userData) {
  const users = getUsers();

  if (getUserByUsername(userData.username)) {
    return { success: false, error: '用户名已存在' };
  }

  const newUser = {
    id: genId(),
    username: userData.username,
    password: userData.password, // stored plaintext temporarily, will be hashed on first login
    displayName: userData.displayName || userData.username,
    role: userData.role || 'user',
    enabled: true,
    materialPermissions: userData.role === 'admin' ? null : (userData.materialPermissions || {}),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  return { success: true, user: newUser };
}

async function updateUserPassword(userId, newPassword) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx < 0) return false;

  users[idx].passwordHash = await hashPassword(newPassword);
  users[idx].password = undefined;
  saveUsers(users);
  return true;
}

function updateUser(userId, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx < 0) return false;

  if (updates.displayName !== undefined) users[idx].displayName = updates.displayName;
  if (updates.enabled !== undefined) users[idx].enabled = updates.enabled;
  if (updates.role !== undefined) {
    users[idx].role = updates.role;
    if (updates.role === 'admin') {
      users[idx].materialPermissions = null; // admin gets all access
    }
  }
  if (updates.materialPermissions !== undefined) {
    users[idx].materialPermissions = updates.materialPermissions;
  }

  saveUsers(users);

  // If updating current user, refresh session
  if (userId === currentUser?.id && updates.materialPermissions) {
    currentUser.materialPermissions = updates.materialPermissions;
  }

  return true;
}

function deleteUser(userId) {
  if (userId === currentUser?.id) return false; // can't delete self
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
  return true;
}

// ========== Login Page ==========
function showLoginPage() {
  // Remove any existing login overlay
  document.querySelector('.login-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  overlay.id = 'login-overlay';

  overlay.innerHTML = `
    <div class="login-container">
      <div class="login-banner">
        <h1>${ico('flask')} InkForm Lab</h1>
        <p>水性墨水配方管理系统</p>
      </div>
      <div class="login-body">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" class="input" id="login-username" placeholder="请输入用户名" autocomplete="username">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" class="input" id="login-password" placeholder="请输入密码" autocomplete="current-password">
        </div>
        <div class="login-error" id="login-error"></div>
        <button class="login-btn" id="login-btn">登 录</button>
        <button class="login-guest-btn" id="login-guest-btn">🔓 游客模式（无需密码·权限全开·体验演示数据）</button>
        <div class="login-hint">
          默认管理员账号：admin / admin123<br>
          登录后可在用户管理中修改密码
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const usernameInput = overlay.querySelector('#login-username');
  const passwordInput = overlay.querySelector('#login-password');
  const errorDiv = overlay.querySelector('#login-error');
  const loginBtn = overlay.querySelector('#login-btn');

  const doLogin = async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      errorDiv.textContent = '请输入用户名和密码';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';
    errorDiv.textContent = '';

    const result = await login(username, password);

    if (result.success) {
      overlay.remove();
      initAppMain();
    } else {
      errorDiv.textContent = result.error;
      loginBtn.disabled = false;
      loginBtn.textContent = '登 录';
    }
  };

  loginBtn.onclick = doLogin;
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });
  usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') passwordInput.focus();
  });

  // Guest mode
  const guestBtn = overlay.querySelector('#login-guest-btn');
  guestBtn.onclick = () => {
    guestLogin();
    overlay.remove();
    initAppMain();
  };

  // Auto-focus
  setTimeout(() => usernameInput.focus(), 200);
}

// ========== Quick hash migration for existing plaintext passwords ==========
async function migrateAllPasswords() {
  const users = getUsers();
  let changed = false;
  for (const u of users) {
    if (!u.passwordHash && u.password) {
      u.passwordHash = await hashPassword(u.password);
      u.password = undefined;
      changed = true;
    }
  }
  if (changed) saveUsers(users);
}
