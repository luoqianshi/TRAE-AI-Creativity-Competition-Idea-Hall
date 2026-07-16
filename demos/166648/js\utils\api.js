// ========== API 服务层 - 封装后端通信，支持自动降级到本地模式 ==========
const API = {
  baseUrl: 'http://localhost:3000',
  available: false, // 后端是否可用
  sessionId: null,

  // 初始化：检测后端是否可用
  async init() {
    try {
      const res = await fetch(this.baseUrl + '/api/health', { signal: AbortSignal.timeout(3000) });
      this.available = res.ok;
    } catch (e) {
      this.available = false;
    }
    // 生成或恢复sessionId
    this.sessionId = localStorage.getItem('cc_session_id') || this.generateSessionId();
    localStorage.setItem('cc_session_id', this.sessionId);
    console.log('API mode:', this.available ? 'online' : 'offline (local)');
    return this.available;
  },

  generateSessionId() {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  },

  // 通用请求方法
  async request(method, path, data) {
    if (!this.available) return null;
    try {
      var options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (data) options.body = JSON.stringify(data);
      var res = await fetch(this.baseUrl + path, options);
      if (!res.ok) throw new Error('API ' + res.status);
      return await res.json();
    } catch (e) {
      console.warn('API request failed:', path, e.message);
      return null;
    }
  },

  // 保存测评结果
  async saveAssessment(assessmentData) {
    return this.request('POST', '/api/assessments', assessmentData);
  },

  // 保存用户信息
  async saveUser(userInfo) {
    return this.request('POST', '/api/sessions', {
      sessionId: this.sessionId,
      ...userInfo
    });
  },

  // 生成AI报告
  async generateAIReport(assessmentId, reportType, content) {
    return this.request('POST', '/api/ai-reports', {
      assessmentId: assessmentId,
      reportType: reportType,
      content: content
    });
  },

  // 发送聊天消息
  async sendChatMessage(role, content, context) {
    var result = await this.request('POST', '/api/chat/messages', {
      sessionId: this.sessionId,
      role: role,
      content: content,
      context: context
    });
    return result;
  },

  // 获取聊天历史
  async getChatHistory() {
    return this.request('GET', '/api/chat/messages/' + this.sessionId);
  }
};
