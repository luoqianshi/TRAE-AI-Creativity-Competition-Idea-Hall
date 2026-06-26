window.Auth = {
    getPort() {
        const port = window.location.port || '3000';
        return port;
    },

    getStorageKey(key) {
        const port = this.getPort();
        return `${port}_${key}`;
    },

    login(data) {
        const existingUser = this.getUser();
        const userData = {
            token: data.token || (existingUser ? existingUser.token : null),
            userId: data.user_id || data.userId,
            role: data.role,
            username: data.username,
            full_name: data.full_name,
            phone: data.phone,
            email: data.email,
            hotelId: data.hotel_id || data.hotelId || null
        };
        localStorage.setItem(this.getStorageKey('user'), JSON.stringify(userData));
        return userData;
    },

    logout() {
        localStorage.removeItem(this.getStorageKey('user'));
        const port = this.getPort();
        // 退出登录后跳转到首页
        const indexPath = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/super-admin/') ? '../index.html' : 'index.html';
        window.location.href = indexPath;
    },

    getUser() {
        try {
            const data = localStorage.getItem(this.getStorageKey('user'));
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    getToken() {
        const user = this.getUser();
        return user ? user.token : null;
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    isAdmin() {
        const user = this.getUser();
        return user && (user.role === 'admin' || user.role === 'super_admin');
    },

    isSuperAdmin() {
        const user = this.getUser();
        return user && user.role === 'super_admin';
    },

    getUserId() {
        const user = this.getUser();
        return user ? user.userId : null;
    },

    getHotelId() {
        const user = this.getUser();
        return user ? user.hotelId : null;
    },

    getRole() {
        const user = this.getUser();
        return user ? user.role : null;
    },

    fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        const headers = {
            ...options.headers
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, {
            ...options,
            headers,
            credentials: 'include'
        });
    },

    _getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    getApiBaseUrl() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = this.getPort();
        return `${protocol}//${hostname}:${port}`;
    },

    async checkAuthStatus() {
        const user = this.getUser();
        if (!user) {
            return { loggedIn: false, user: null };
        }
        
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': user.token ? `Bearer ${user.token}` : '',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    const newToken = data.data.token;
                    if (newToken && newToken !== user.token) {
                        this.login(data.data);
                        return { loggedIn: true, user: this.getUser() };
                    }
                }
                return { loggedIn: true, user: user };
            } else {
                return { loggedIn: false, user: null };
            }
        } catch (e) {
            return { loggedIn: !!user, user: user };
        }
    },

    redirectToLogin(currentPage) {
        const port = this.getPort();
        const loginUrl = `login.html${currentPage ? '?redirect=' + encodeURIComponent(currentPage) : ''}`;
        window.location.href = loginUrl;
    },

    updateHeaderNav() {
        const user = this.getUser();
        const userMenu = document.getElementById('userMenu');
        if (!userMenu) return;

        if (user) {
            let menuHtml = '';
            if (user.role === 'super_admin' || user.role === 'SUPER_ADMIN') {
                menuHtml = `
                    <div class="user-info" id="userInfoBtn">
                        <span>${user.full_name || user.username}</span>
                        <div class="user-avatar">${(user.full_name || user.username)[0]}</div>
                    </div>
                    <div class="dropdown-menu" id="dropdownMenu">
                        <a href="super-admin/index.html"><i class="fas fa-tachometer-alt"></i>管理后台</a>
                        <a href="user/profile.html"><i class="fas fa-user"></i>个人中心</a>
                        <a href="#" id="logoutLink"><i class="fas fa-sign-out-alt"></i>退出登录</a>
                    </div>
                `;
            } else if (user.role === 'hotel_admin' || user.role === 'HOTEL_ADMIN') {
                menuHtml = `
                    <div class="user-info" id="userInfoBtn">
                        <span>${user.full_name || user.username}</span>
                        <div class="user-avatar">${(user.full_name || user.username)[0]}</div>
                    </div>
                    <div class="dropdown-menu" id="dropdownMenu">
                        <a href="admin/index.html"><i class="fas fa-hotel"></i>酒店后台</a>
                        <a href="user/profile.html"><i class="fas fa-user"></i>个人中心</a>
                        <a href="#" id="logoutLink"><i class="fas fa-sign-out-alt"></i>退出登录</a>
                    </div>
                `;
            } else {
                menuHtml = `
                    <div class="user-info" id="userInfoBtn">
                        <span>${user.full_name || user.username}</span>
                        <div class="user-avatar">${(user.full_name || user.username)[0]}</div>
                    </div>
                    <div class="dropdown-menu" id="dropdownMenu">
                        <a href="user/profile.html?tab=orders"><i class="fas fa-shopping-cart"></i>我的订单</a>
                        <a href="user/profile.html"><i class="fas fa-user"></i>个人中心</a>
                        <a href="#" id="logoutLink"><i class="fas fa-sign-out-alt"></i>退出登录</a>
                    </div>
                `;
            }
            userMenu.innerHTML = menuHtml;
            this._setupUserMenuClick();
        } else {
            userMenu.innerHTML = `
                <a href="login.html" class="btn btn-outline" id="loginBtn">登录</a>
                <a href="register.html" class="btn btn-primary" id="registerBtn">注册</a>
            `;
        }
    },

    _setupUserMenuClick() {
        const userInfoBtn = document.getElementById('userInfoBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        const logoutLink = document.getElementById('logoutLink');

        if (userInfoBtn && dropdownMenu) {
            userInfoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!userInfoBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }

        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                window.location.reload();
            });
        }
    },

    requireLogin(callback) {
        if (this.isLoggedIn()) {
            callback();
        } else {
            const currentPage = window.location.pathname + window.location.search;
            this.redirectToLogin(currentPage);
        }
    }
};
