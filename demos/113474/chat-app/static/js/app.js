// 主应用模块：状态管理 + 路由 + 事件处理 + WS 事件分发
const App = (() => {
    const state = {
        currentUser: null,
        currentPeerId: null,
        currentPeerName: null,
        currentPeerIsBot: false,
        currentView: "chats",
        conversations: [],
        messages: [],
        friends: [],
        friendRequests: [],
        searchResults: [],
        searchKeyword: "",
        bots: [],
    };

    // ===== 持久化 =====
    const saveSession = (token, user) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    };

    const clearSession = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    // ===== 进入主界面 =====
    const enterMain = (user) => {
        state.currentUser = user;
        UI.renderMain(user);
        WS.connect();
        registerWsHandlers();
        loadConversations();
    };

    // ===== 辅助加载函数（A.6）=====

    const loadConversations = async () => {
        try {
            const data = await API.listConversations();
            state.conversations = data.conversations || [];
            if (state.currentView === "chats") {
                UI.renderConversations(state.conversations, state.currentPeerId);
            }
        } catch (e) {
            // 401 已由 api.js 处理，其它错误静默（避免刷新时刷屏）
            console.error("加载会话失败:", e);
        }
    };

    const loadFriendsView = async () => {
        try {
            const [friendsRes, reqsRes] = await Promise.all([
                API.listFriends(),
                API.listFriendRequests(),
            ]);
            state.friends = friendsRes.friends || [];
            state.friendRequests = reqsRes.requests || [];
            UI.renderFriendsView({
                friends: state.friends,
                requests: state.friendRequests,
                searchResults: state.searchResults,
                keyword: state.searchKeyword,
            });
            UI.updateFriendRequestBadge(state.friendRequests.length);
        } catch (e) {
            console.error("加载好友视图失败:", e);
            UI.toast("加载好友列表失败");
        }
    };

    const loadBots = async () => {
        try {
            const data = await API.listBots();
            state.bots = data.bots || [];
            UI.renderSettingsView(state.bots);
        } catch (e) {
            console.error("加载 bots 失败:", e);
            UI.toast("加载 AI 配置失败");
        }
    };

    // ===== WS 事件注册（A.3）=====

    const registerWsHandlers = () => {
        WS.on("open", () => {
            loadConversations();
        });

        WS.on("chat", (data) => {
            // 收到新消息（来自好友或 AI bot 回复）
            const msg = {
                id: data.msg_id,
                sender_id: data.sender_id,
                msg_type: data.msg_type,
                content: data.content,
                media_path: data.media_path,
                llm_model: data.llm_model,
                created_at: data.created_at,
            };
            if (data.sender_id === state.currentPeerId) {
                UI.appendMessage(msg, state.currentUser.id);
            } else {
                // 非当前会话，toast 提醒
                const conv = state.conversations.find(
                    (c) => c.peer_id === data.sender_id
                );
                const name = conv
                    ? conv.peer_nickname || conv.peer_username
                    : "新消息";
                UI.toast(`收到来自 ${name} 的消息`);
            }
            loadConversations();
        });

        WS.on("ack", () => {
            // 我方消息已持久化，刷新侧边栏以显示最新最后消息
            loadConversations();
        });

        WS.on("read", () => {
            // 已读回执：最小实现，预留扩展
        });

        WS.on("typing", (data) => {
            UI.updateTyping(null, data.sender_id, data.is_typing);
        });

        WS.on("presence", () => {
            // 上下线：最小实现，预留扩展
        });

        WS.on("friend_request", (data) => {
            UI.toast(`收到 ${data.username} 的好友请求`);
            if (state.currentView === "friends") {
                loadFriendsView();
            } else {
                // 仅更新角标
                API.listFriendRequests()
                    .then((res) => {
                        state.friendRequests = res.requests || [];
                        UI.updateFriendRequestBadge(state.friendRequests.length);
                    })
                    .catch(() => {});
            }
        });

        WS.on("friend_accepted", () => {
            UI.toast("对方已接受好友请求");
            loadFriendsView();
            loadConversations();
        });

        WS.on("error", (data) => {
            if (data && data.message) {
                UI.toast(data.message);
            }
        });

        WS.on("close", () => {
            // ws.js 已自动重连
        });

        WS.on("pong", () => {
            // 心跳回包
        });
    };

    // ===== 认证事件（A.2）=====

    const handleLogin = async (username, password) => {
        const errEl = document.getElementById("auth-error");
        if (errEl) errEl.textContent = "";
        try {
            const data = await API.login(username, password);
            saveSession(data.token, data.user);
            enterMain(data.user);
        } catch (e) {
            if (errEl) errEl.textContent = e.message || "登录失败";
        }
    };

    const handleRegister = async (username, password, nickname) => {
        const errEl = document.getElementById("auth-error");
        if (errEl) errEl.textContent = "";
        try {
            const data = await API.register(username, password, nickname);
            saveSession(data.token, data.user);
            enterMain(data.user);
        } catch (e) {
            if (errEl) errEl.textContent = e.message || "注册失败";
        }
    };

    const handleLogout = () => {
        clearSession();
        WS.disconnect();
        state.currentUser = null;
        state.currentPeerId = null;
        state.currentPeerName = null;
        state.currentPeerIsBot = false;
        state.currentView = "chats";
        state.conversations = [];
        state.messages = [];
        state.friends = [];
        state.friendRequests = [];
        state.searchResults = [];
        state.searchKeyword = "";
        state.bots = [];
        UI.renderAuth();
    };

    // api.js 在 401 时调用此方法（不再触发 API，避免循环）
    const logout = () => {
        UI.toast("登录已过期，请重新登录");
        handleLogout();
    };

    // ===== 视图切换（A.2）=====

    const switchView = (view) => {
        state.currentView = view;
        if (view === "chats") {
            loadConversations();
        } else if (view === "friends") {
            loadFriendsView();
        } else if (view === "settings") {
            loadBots();
        }
    };

    // ===== 聊天（A.2）=====

    const openChat = async (peerId, peerName, isBot) => {
        state.currentPeerId = peerId;
        state.currentPeerName = peerName;
        state.currentPeerIsBot = isBot === true || isBot === "true";

        UI.renderChatWindow(peerId, peerName, state.currentPeerIsBot);

        try {
            const data = await API.getMessages(peerId);
            state.messages = data.messages || [];
            UI.renderMessages(state.messages, state.currentUser.id);
        } catch (e) {
            console.error("加载消息历史失败:", e);
            UI.toast("加载消息失败");
        }

        // 通知对方已读（服务端标记对方发来的消息为 read）
        WS.send("read", { peer_id: peerId });

        // 刷新侧边栏（高亮当前会话）
        if (state.currentView === "chats") {
            UI.renderConversations(state.conversations, state.currentPeerId);
        }
    };

    const closeChat = () => {
        state.currentPeerId = null;
        state.currentPeerName = null;
        state.currentPeerIsBot = false;
        state.messages = [];

        const chatArea = document.getElementById("chat-area");
        if (chatArea) {
            chatArea.innerHTML = `
                <div class="chat-empty" id="chat-empty">
                    <div class="empty-icon">💬</div>
                    <p>选择一个会话开始聊天</p>
                </div>`;
        }
        const layout = document.querySelector(".main-layout");
        if (layout) layout.classList.remove("show-chat");

        if (state.currentView === "chats") {
            UI.renderConversations(state.conversations, null);
        }
    };

    const sendMessage = (text) => {
        if (!state.currentPeerId || !text) return;

        // 乐观追加本地消息
        const optimistic = {
            sender_id: state.currentUser.id,
            is_mine: true,
            msg_type: "text",
            content: text,
            created_at: new Date().toISOString(),
        };
        UI.appendMessage(optimistic, state.currentUser.id);

        // 通过 WS 发送
        const ok = WS.send("chat", {
            receiver_id: state.currentPeerId,
            msg_type: "text",
            content: text,
        });
        if (!ok) {
            UI.toast("连接已断开，消息可能未发送");
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file || !state.currentPeerId) return;

        try {
            const data = await API.uploadImage(file);
            const mediaPath = data.media_path;

            // 乐观追加图片消息
            const optimistic = {
                sender_id: state.currentUser.id,
                is_mine: true,
                msg_type: "image",
                media_path: mediaPath,
                content: "",
                created_at: new Date().toISOString(),
            };
            UI.appendMessage(optimistic, state.currentUser.id);

            const ok = WS.send("chat", {
                receiver_id: state.currentPeerId,
                msg_type: "image",
                media_path: mediaPath,
                content: "",
            });
            if (!ok) {
                UI.toast("连接已断开，图片可能未发送");
            }
        } catch (e) {
            console.error("上传图片失败:", e);
            UI.toast(e.message || "图片上传失败");
        } finally {
            // 允许重复选择同一文件
            event.target.value = "";
        }
    };

    const sendTyping = (peerId, isTyping) => {
        WS.send("typing", { peer_id: peerId, is_typing: isTyping });
    };

    // ===== 好友（A.2）=====

    const searchFriends = async () => {
        const input = document.getElementById("friend-search-input");
        const keyword = input ? input.value.trim() : "";
        state.searchKeyword = keyword;
        if (!keyword) {
            state.searchResults = [];
            UI.renderFriendsView({
                friends: state.friends,
                requests: state.friendRequests,
                searchResults: state.searchResults,
                keyword: state.searchKeyword,
            });
            return;
        }
        try {
            const data = await API.searchUsers(keyword);
            state.searchResults = data.users || [];
            UI.renderFriendsView({
                friends: state.friends,
                requests: state.friendRequests,
                searchResults: state.searchResults,
                keyword: state.searchKeyword,
            });
        } catch (e) {
            console.error("搜索用户失败:", e);
            UI.toast(e.message || "搜索失败");
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            await API.sendFriendRequest(userId);
            UI.toast("好友请求已发送");
            loadFriendsView();
        } catch (e) {
            console.error("发送好友请求失败:", e);
            UI.toast(e.message || "发送失败");
        }
    };

    const acceptFriend = async (friendshipId) => {
        try {
            await API.acceptFriendRequest(friendshipId);
            UI.toast("已添加好友");
            loadFriendsView();
            loadConversations();
        } catch (e) {
            console.error("接受好友请求失败:", e);
            UI.toast(e.message || "操作失败");
        }
    };

    const rejectFriend = async (friendshipId) => {
        try {
            await API.rejectFriendRequest(friendshipId);
            UI.toast("已拒绝");
            loadFriendsView();
        } catch (e) {
            console.error("拒绝好友请求失败:", e);
            UI.toast(e.message || "操作失败");
        }
    };

    // ===== Bot 管理（A.2）=====

    const showCreateBotForm = () => {
        UI.renderCreateBotForm();
    };

    const createBot = async () => {
        const get = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : "";
        };
        const payload = {
            name: get("new-bot-name"),
            username: get("new-bot-username"),
            provider: get("new-bot-provider"),
            base_url: get("new-bot-base-url"),
            api_key: get("new-bot-api-key") || null,
            model: get("new-bot-model"),
            system_prompt: get("new-bot-prompt") || null,
        };
        if (!payload.name || !payload.username) {
            UI.toast("名称和用户名不能为空");
            return;
        }
        try {
            await API.createBot(payload);
            UI.toast("AI 机器人已创建");
            loadBots();
        } catch (e) {
            console.error("创建 bot 失败:", e);
            UI.toast(e.message || "创建失败");
        }
    };

    const saveBot = async (botId) => {
        const card = document.querySelector(
            `.bot-card[data-bot-id="${botId}"]`
        );
        if (!card) return;

        const payload = {};
        card.querySelectorAll("[data-field]").forEach((el) => {
            const field = el.dataset.field;
            if (el.type === "checkbox") {
                payload[field] = el.checked;
            } else {
                const val = el.value.trim();
                if (field === "api_key") {
                    // 关键：空值不下发，避免清空已有 key（listBots 不返回明文）
                    if (val) payload[field] = val;
                } else if (field === "max_history" || field === "max_tokens") {
                    payload[field] = val ? parseInt(val, 10) : undefined;
                } else if (field === "temperature") {
                    payload[field] = val ? parseFloat(val) : undefined;
                } else {
                    payload[field] = val;
                }
            }
        });

        // 移除 undefined 字段
        Object.keys(payload).forEach((k) => {
            if (payload[k] === undefined) delete payload[k];
        });

        if (Object.keys(payload).length === 0) {
            UI.toast("没有需要更新的字段");
            return;
        }

        try {
            await API.updateBot(botId, payload);
            UI.toast("配置已保存");
            loadBots();
        } catch (e) {
            console.error("保存 bot 配置失败:", e);
            UI.toast(e.message || "保存失败");
        }
    };

    // ===== 初始化（A.4）=====

    const init = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            UI.renderAuth();
            return;
        }
        try {
            const me = await API.getMe();
            enterMain(me);
        } catch (e) {
            // token 失效
            clearSession();
            UI.renderAuth();
        }
    };

    // 暴露接口
    return {
        state,
        handleLogin,
        handleRegister,
        handleLogout,
        logout,
        switchView,
        openChat,
        closeChat,
        sendMessage,
        handleImageUpload,
        sendTyping,
        searchFriends,
        sendFriendRequest,
        acceptFriend,
        rejectFriend,
        saveBot,
        createBot,
        showCreateBotForm,
        init,
    };
})();

// 启动
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
