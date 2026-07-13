// UI 渲染模块
const UI = (() => {
    const $ = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => parent.querySelectorAll(sel);

    // 获取首字母作为头像
    const getAvatarText = (name) => {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
    };

    // 格式化时间
    const formatTime = (isoStr) => {
        if (!isoStr) return "";
        const d = new Date(isoStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
            return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
        }
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) {
            return "昨天";
        }
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    // Toast 提示
    const toast = (msg, duration = 2500) => {
        const el = document.createElement("div");
        el.className = "toast";
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), duration);
    };

    // 渲染登录页
    const renderAuth = () => {
        const tpl = $("#tpl-auth").content.cloneNode(true);
        $("#app").innerHTML = "";
        $("#app").appendChild(tpl);

        // tab 切换
        $$(".tab-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                $$(".tab-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                const tab = btn.dataset.tab;
                $("#login-form").style.display = tab === "login" ? "flex" : "none";
                $("#register-form").style.display = tab === "register" ? "flex" : "none";
                $("#auth-error").textContent = "";
            });
        });

        $("#login-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const f = e.target;
            App.handleLogin(f.username.value.trim(), f.password.value);
        });

        $("#register-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const f = e.target;
            App.handleRegister(
                f.username.value.trim(),
                f.password.value,
                f.nickname.value.trim() || null
            );
        });
    };

    // 渲染主应用
    const renderMain = (user) => {
        const tpl = $("#tpl-main").content.cloneNode(true);
        $("#app").innerHTML = "";
        $("#app").appendChild(tpl);

        // 用户信息
        $("#my-nickname").textContent = user.nickname || user.username;
        $("#my-avatar").textContent = getAvatarText(user.nickname || user.username);

        // 导航切换
        $$(".nav-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                $$(".nav-tab").forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                App.switchView(tab.dataset.view);
            });
        });

        // 默认显示聊天列表
        App.switchView("chats");
    };

    // 渲染会话列表
    const renderConversations = (conversations, activePeerId = null) => {
        const container = $("#sidebar-content");
        if (!container) return;

        if (!conversations || conversations.length === 0) {
            container.innerHTML = `
                <div style="padding: 40px 16px; text-align: center; color: rgba(255,255,255,0.4); font-size: 13px;">
                    暂无会话<br><br>去「好友」页添加好友开始聊天
                </div>`;
            return;
        }

        container.innerHTML = conversations
            .map((c) => {
                const isActive = c.peer_id === activePeerId ? "active" : "";
                const lastMsg =
                    c.last_message.msg_type === "image"
                        ? "[图片]"
                        : c.last_message.content || "";
                const botTag = c.peer_is_bot
                    ? '<span class="bot-tag">AI</span>'
                    : "";
                return `
                <div class="conv-item ${isActive}" data-peer-id="${c.peer_id}" data-peer-name="${c.peer_nickname || c.peer_username}" data-peer-is-bot="${c.peer_is_bot}">
                    <div class="avatar">${getAvatarText(c.peer_nickname || c.peer_username)}</div>
                    <div class="conv-info">
                        <div class="conv-name">${escapeHtml(c.peer_nickname || c.peer_username)}${botTag}</div>
                        <div class="conv-last">${escapeHtml(lastMsg)}</div>
                    </div>
                    <div class="conv-time">${formatTime(c.last_message.created_at)}</div>
                </div>`;
            })
            .join("");

        $$(".conv-item", container).forEach((item) => {
            item.addEventListener("click", () => {
                App.openChat(
                    item.dataset.peerId,
                    item.dataset.peerName,
                    item.dataset.peerIsBot === "true"
                );
            });
        });
    };

    // 渲染好友视图
    const renderFriendsView = (data) => {
        const container = $("#sidebar-content");
        if (!container) return;

        const { friends = [], requests = [], searchResults = [] } = data;

        const requestsHtml =
            requests.length > 0
                ? `
            <div class="section-title">好友请求 (${requests.length})</div>
            ${requests
                .map(
                    (r) => `
                <div class="friend-item" data-friendship-id="${r.friendship_id}">
                    <div class="avatar">${getAvatarText(r.nickname || r.username)}</div>
                    <div class="friend-info">
                        <div class="friend-name">${escapeHtml(r.nickname || r.username)}${r.is_bot ? '<span class="bot-tag">AI</span>' : ""}</div>
                        <div style="font-size:11px;color:rgba(255,255,255,0.4)">@${escapeHtml(r.username)}</div>
                    </div>
                    <div class="friend-actions">
                        <button class="btn-accept" onclick="App.acceptFriend(${r.friendship_id})">接受</button>
                        <button class="btn-reject" onclick="App.rejectFriend(${r.friendship_id})">拒绝</button>
                    </div>
                </div>`
                )
                .join("")}`
                : "";

        const friendsHtml =
            friends.length > 0
                ? `
            <div class="section-title">我的好友 (${friends.length})</div>
            ${friends
                .map(
                    (f) => `
                <div class="friend-item" data-peer-id="${f.id}" data-peer-name="${f.nickname || f.username}" data-peer-is-bot="${f.is_bot}">
                    <div class="avatar">${getAvatarText(f.nickname || f.username)}</div>
                    <div class="friend-info">
                        <div class="friend-name">${escapeHtml(f.nickname || f.username)}${f.is_bot ? '<span class="bot-tag">AI</span>' : ""}</div>
                        <div style="font-size:11px;color:rgba(255,255,255,0.4)">@${escapeHtml(f.username)}</div>
                    </div>
                </div>`
                )
                .join("")}`
                : "";

        const searchHtml =
            searchResults.length > 0
                ? `
            <div class="search-results">
                <div class="section-title">搜索结果</div>
                ${searchResults
                    .map(
                        (u) => `
                <div class="search-result-item">
                    <div class="avatar">${getAvatarText(u.nickname || u.username)}</div>
                    <div class="friend-info">
                        <div class="friend-name">${escapeHtml(u.nickname || u.username)}${u.is_bot ? '<span class="bot-tag">AI</span>' : ""}</div>
                        <div style="font-size:11px;color:rgba(255,255,255,0.4)">@${escapeHtml(u.username)}</div>
                    </div>
                    <button class="btn-accept" onclick="App.sendFriendRequest('${u.id}')">加好友</button>
                </div>`
                    )
                    .join("")}
            </div>`
                : "";

        container.innerHTML = `
            <div class="friends-view">
                <div class="search-box">
                    <input type="text" id="friend-search-input" placeholder="搜索用户名或昵称" value="${data.keyword || ""}">
                    <button onclick="App.searchFriends()">搜索</button>
                </div>
                ${requestsHtml}
                ${friendsHtml}
                ${searchHtml}
            </div>
        `;

        // 搜索回车
        const input = $("#friend-search-input");
        if (input) {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") App.searchFriends();
            });
        }

        // 点击好友打开聊天
        $$(".friend-item[data-peer-id]", container).forEach((item) => {
            item.addEventListener("click", () => {
                if (!item.querySelector(".friend-actions")) {
                    App.openChat(
                        item.dataset.peerId,
                        item.dataset.peerName,
                        item.dataset.peerIsBot === "true"
                    );
                }
            });
        });
    };

    // 渲染设置视图
    const renderSettingsView = (bots) => {
        const container = $("#sidebar-content");
        if (!container) return;

        const botsHtml =
            bots && bots.length > 0
                ? bots
                      .map(
                          (b) => `
            <div class="bot-card" data-bot-id="${b.id}" data-bot-user-id="${b.user_id}">
                <div class="bot-card-header">
                    <div class="avatar">${getAvatarText(b.name)}</div>
                    <div class="bot-name">${escapeHtml(b.name)}</div>
                    ${b.created_by === null ? '<span style="font-size:11px;color:rgba(255,255,255,0.4)">系统默认</span>' : ""}
                </div>
                <div class="bot-config-row">
                    <label>名称</label>
                    <input type="text" data-field="name" value="${escapeHtml(b.name)}">
                </div>
                <div class="bot-config-row">
                    <label>服务提供商</label>
                    <select data-field="provider">
                        <option value="local" ${b.provider === "local" ? "selected" : ""}>本地模型 (llama.cpp)</option>
                        <option value="deepseek" ${b.provider === "deepseek" ? "selected" : ""}>DeepSeek (云端)</option>
                        <option value="openai" ${b.provider === "openai" ? "selected" : ""}>OpenAI (云端)</option>
                    </select>
                </div>
                <div class="bot-config-row">
                    <label>API 端点 (base_url)</label>
                    <input type="text" data-field="base_url" value="${escapeHtml(b.base_url)}" placeholder="http://127.0.0.1:11434/v1">
                </div>
                <div class="bot-config-row">
                    <label>API Key（本地模型填 local）</label>
                    <input type="text" data-field="api_key" value="${escapeHtml(b.api_key || "")}" placeholder="sk-xxx 或 local">
                </div>
                <div class="bot-config-row">
                    <label>模型名</label>
                    <input type="text" data-field="model" value="${escapeHtml(b.model)}" placeholder="qwen2.5 / deepseek-chat / gpt-4o-mini">
                </div>
                <div class="bot-config-row">
                    <label>系统提示词</label>
                    <textarea data-field="system_prompt" placeholder="定义 AI 的角色和行为">${escapeHtml(b.system_prompt || "")}</textarea>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <div class="bot-config-row" style="flex:1;min-width:80px;">
                        <label>历史轮数</label>
                        <input type="number" data-field="max_history" value="${b.max_history}" min="1" max="50">
                    </div>
                    <div class="bot-config-row" style="flex:1;min-width:80px;">
                        <label>温度</label>
                        <input type="number" data-field="temperature" value="${b.temperature}" min="0" max="2" step="0.1">
                    </div>
                    <div class="bot-config-row" style="flex:1;min-width:80px;">
                        <label>最大 Token</label>
                        <input type="number" data-field="max_tokens" value="${b.max_tokens}" min="16" max="4096">
                    </div>
                </div>
                <div class="bot-config-row">
                    <label>
                        <input type="checkbox" data-field="image_gen_enabled" ${b.image_gen_enabled ? "checked" : ""} style="width:auto;margin-right:6px;">
                        启用图片生成（用户说"画一张X"时 AI 自动生成图片）
                    </label>
                </div>
                <button class="btn-save" onclick="App.saveBot(${b.id})">保存配置</button>
            </div>`
                      )
                      .join("")
                : '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.4)">暂无 AI 机器人</div>';

        container.innerHTML = `
            <div class="settings-view">
                <div class="settings-section">
                    <h3>AI 机器人管理</h3>
                    ${botsHtml}
                    <button class="btn-create-bot" onclick="App.showCreateBotForm()">+ 创建新 AI 机器人</button>
                </div>
                <div class="settings-section">
                    <h3>账户</h3>
                    <button class="btn-reject" style="width:100%;padding:10px;" onclick="App.handleLogout()">退出登录</button>
                </div>
            </div>
        `;
    };

    // 渲染创建 bot 表单
    const renderCreateBotForm = () => {
        const container = $("#sidebar-content");
        const existing = $(".bot-create-form");
        if (existing) {
            existing.remove();
            return;
        }

        const form = document.createElement("div");
        form.className = "bot-card bot-create-form";
        form.innerHTML = `
            <div class="bot-card-header">
                <div class="avatar">+</div>
                <div class="bot-name">创建新 AI 机器人</div>
            </div>
            <div class="bot-config-row">
                <label>名称 *</label>
                <input type="text" id="new-bot-name" placeholder="如：客服小助手">
            </div>
            <div class="bot-config-row">
                <label>用户名 *</label>
                <input type="text" id="new-bot-username" placeholder="如：cs_bot（用于搜索加好友）">
            </div>
            <div class="bot-config-row">
                <label>服务提供商</label>
                <select id="new-bot-provider">
                    <option value="local">本地模型 (llama.cpp)</option>
                    <option value="deepseek">DeepSeek (云端)</option>
                    <option value="openai">OpenAI (云端)</option>
                </select>
            </div>
            <div class="bot-config-row">
                <label>API 端点</label>
                <input type="text" id="new-bot-base-url" value="http://127.0.0.1:11434/v1">
            </div>
            <div class="bot-config-row">
                <label>API Key</label>
                <input type="text" id="new-bot-api-key" value="local">
            </div>
            <div class="bot-config-row">
                <label>模型名</label>
                <input type="text" id="new-bot-model" value="qwen2.5">
            </div>
            <div class="bot-config-row">
                <label>系统提示词</label>
                <textarea id="new-bot-prompt" placeholder="定义 AI 的角色和行为"></textarea>
            </div>
            <div style="display:flex;gap:8px;">
                <button class="btn-save" onclick="App.createBot()" style="flex:1;">创建</button>
                <button class="btn-reject" onclick="this.closest('.bot-create-form').remove()" style="flex:1;padding:8px 16px;">取消</button>
            </div>
        `;
        const settingsView = $(".settings-section");
        if (settingsView) {
            settingsView.appendChild(form);
        }
    };

    // 渲染聊天窗口
    const renderChatWindow = (peerId, peerName, isBot) => {
        const chatArea = $("#chat-area");
        if (!chatArea) return;

        chatArea.innerHTML = `
            <div class="chat-header">
                <button class="back-btn" onclick="App.closeChat()">←</button>
                <div class="avatar">${getAvatarText(peerName)}</div>
                <div>
                    <div class="chat-header-name">${escapeHtml(peerName)}${isBot ? '<span class="bot-tag">AI</span>' : ""}</div>
                    <div class="chat-header-status" id="peer-status"></div>
                </div>
            </div>
            <div class="messages" id="messages"></div>
            <div class="chat-input-area">
                <div class="input-tools">
                    <label class="tool-btn" title="发送图片" style="cursor:pointer;">
                        📷
                        <input type="file" accept="image/*" style="display:none;" id="image-upload-input">
                    </label>
                </div>
                <textarea class="msg-input" id="msg-input" placeholder="输入消息..." rows="1"></textarea>
                <button class="send-btn" id="send-btn">→</button>
            </div>
        `;

        // 移动端：显示聊天区，隐藏侧边栏
        $(".main-layout").classList.add("show-chat");

        // 图片上传
        $("#image-upload-input").addEventListener("change", App.handleImageUpload);

        // 发送消息
        const input = $("#msg-input");
        const sendBtn = $("#send-btn");

        const doSend = () => {
            const text = input.value.trim();
            if (text) {
                App.sendMessage(text);
                input.value = "";
                input.style.height = "auto";
            }
        };

        sendBtn.addEventListener("click", doSend);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                doSend();
            }
        });

        // 自动调整高度
        input.addEventListener("input", () => {
            input.style.height = "auto";
            input.style.height = Math.min(input.scrollHeight, 100) + "px";
        });

        // 输入时发送 typing
        let typingTimer = null;
        input.addEventListener("input", () => {
            if (typingTimer) return;
            App.sendTyping(peerId, true);
            typingTimer = setTimeout(() => {
                App.sendTyping(peerId, false);
                typingTimer = null;
            }, 3000);
        });
    };

    // 渲染消息列表
    const renderMessages = (messages, currentUserId) => {
        const container = $("#messages");
        if (!container) return;

        if (!messages || messages.length === 0) {
            container.innerHTML = "";
            return;
        }

        container.innerHTML = messages
            .map((m) => renderMessageHtml(m, currentUserId))
            .join("");

        // 滚动到底部
        container.scrollTop = container.scrollHeight;

        // 图片点击预览
        $$("img.msg-image", container).forEach((img) => {
            img.addEventListener("click", () => previewImage(img.src));
        });
    };

    // 单条消息 HTML
    const renderMessageHtml = (m, currentUserId) => {
        const isMine = m.sender_id === currentUserId || m.is_mine;
        const mineClass = isMine ? "mine" : "";

        let content = "";
        if (m.msg_type === "image" && m.media_path) {
            const url = API.mediaUrl(m.media_path);
            content = `<img class="msg-image" src="${url}" alt="图片">`;
        } else if (m.msg_type === "system") {
            return `<div class="msg-system">${escapeHtml(m.content || "")}</div>`;
        } else {
            content = escapeHtml(m.content || "").replace(/\n/g, "<br>");
        }

        const modelInfo = m.llm_model
            ? `<div class="msg-model">${escapeHtml(m.llm_model)}</div>`
            : "";

        return `
            <div class="msg-row ${mineClass}">
                <div>
                    <div class="msg-bubble">${content}</div>
                    <div class="msg-time">${formatTime(m.created_at)}</div>
                    ${modelInfo}
                </div>
            </div>
        `;
    };

    // 追加单条消息
    const appendMessage = (m, currentUserId) => {
        const container = $("#messages");
        if (!container) return;

        container.insertAdjacentHTML("beforeend", renderMessageHtml(m, currentUserId));
        container.scrollTop = container.scrollHeight;

        // 图片预览
        const img = container.querySelector(".msg-row:last-child img.msg-image");
        if (img) {
            img.addEventListener("click", () => previewImage(img.src));
        }
    };

    // 图片预览
    const previewImage = (src) => {
        const overlay = document.createElement("div");
        overlay.className = "image-preview-overlay";
        overlay.innerHTML = `<img src="${src}">`;
        overlay.addEventListener("click", () => overlay.remove());
        document.body.appendChild(overlay);
    };

    // 更新 typing 状态
    const updateTyping = (peerId, senderId, isTyping) => {
        const status = $("#peer-status");
        if (!status) return;
        if (App.state.currentPeerId === senderId && isTyping) {
            status.innerHTML = '<span class="typing-indicator">正在输入...</span>';
        } else {
            status.textContent = "";
        }
    };

    // HTML 转义
    const escapeHtml = (str) => {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // 更新好友请求角标
    const updateFriendRequestBadge = (count) => {
        const badge = $("#friend-request-badge");
        if (!badge) return;
        if (count > 0) {
            badge.style.display = "flex";
            badge.textContent = count > 99 ? "99+" : count;
        } else {
            badge.style.display = "none";
        }
    };

    return {
        renderAuth,
        renderMain,
        renderConversations,
        renderFriendsView,
        renderSettingsView,
        renderCreateBotForm,
        renderChatWindow,
        renderMessages,
        appendMessage,
        updateTyping,
        updateFriendRequestBadge,
        toast,
        escapeHtml,
        getAvatarText,
    };
})();
