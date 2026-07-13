// API 请求封装
const API = (() => {
    const getToken = () => localStorage.getItem("token");

    const request = async (method, path, body = null, isForm = false) => {
        const headers = {};
        const token = getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        let payload = undefined;
        if (body !== null && !isForm) {
            headers["Content-Type"] = "application/json";
            payload = JSON.stringify(body);
        } else if (body !== null && isForm) {
            payload = body; // FormData，不要设 Content-Type
        }

        try {
            const resp = await fetch(`/api${path}`, {
                method,
                headers,
                body: payload,
            });

            const data = await resp.json().catch(() => ({}));

            if (!resp.ok) {
                const err = new Error(data.detail || data.message || `请求失败 (${resp.status})`);
                err.status = resp.status;
                err.data = data;
                throw err;
            }

            return data;
        } catch (err) {
            if (err.status === 401) {
                // token 失效，回到登录页
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                App.logout();
            }
            throw err;
        }
    };

    return {
        // 认证
        register: (username, password, nickname) =>
            request("POST", "/auth/register", { username, password, nickname }),
        login: (username, password) =>
            request("POST", "/auth/login", { username, password }),
        getMe: () => request("GET", "/auth/me"),
        searchUsers: (keyword) =>
            request("GET", `/auth/users/search?keyword=${encodeURIComponent(keyword)}`),

        // 好友
        sendFriendRequest: (friendId) =>
            request("POST", "/friends/request", { friend_id: friendId }),
        acceptFriendRequest: (friendshipId) =>
            request("POST", `/friends/${friendshipId}/accept`),
        rejectFriendRequest: (friendshipId) =>
            request("POST", `/friends/${friendshipId}/reject`),
        listFriends: () => request("GET", "/friends"),
        listFriendRequests: () => request("GET", "/friends/requests"),

        // 消息
        listConversations: () => request("GET", "/conversations"),
        getMessages: (peerId, beforeId = null) => {
            let url = `/messages/${peerId}?limit=50`;
            if (beforeId) url += `&before_id=${beforeId}`;
            return request("GET", url);
        },
        uploadImage: (file) => {
            const form = new FormData();
            form.append("file", file);
            return request("POST", "/messages/upload", form, true);
        },

        // AI Bot
        listBots: () => request("GET", "/bots"),
        getBot: (botId) => request("GET", `/bots/${botId}`),
        createBot: (data) => request("POST", "/bots", data),
        updateBot: (botId, data) => request("PUT", `/bots/${botId}`, data),

        // 工具
        mediaUrl: (path) => {
            if (!path) return "";
            // 如果是绝对路径（服务端存的本地路径），转为 /media/ 访问
            if (path.includes("\\media\\")) {
                const idx = path.indexOf("\\media\\");
                return path.substring(idx).replace(/\\/g, "/");
            }
            if (path.includes("/media/")) {
                const idx = path.indexOf("/media/");
                return path.substring(idx);
            }
            // 已生成的图片在 media/images 下
            if (path.includes("\\images\\")) {
                const parts = path.split(/\\|\//);
                const imgIdx = parts.indexOf("images");
                if (imgIdx >= 0) {
                    return "/media/images/" + parts.slice(imgIdx + 1).join("/");
                }
            }
            return path;
        },
    };
})();
