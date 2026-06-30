#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成完整的 app.js 文件
运行: python app_gen.py
"""

import os

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.js')

parts = []

# ============================================================
# 第1部分：文件头 + API配置
# ============================================================
part1 = r"""/*!
 * 感情急诊事务所 - 核心逻辑
 * 版本: 2026-06-29 v3.0
 */

// ==================== API 配置（内置，安全混淆） ====================
const _K_PARTS = [
  ';:;;8<;88885;7;78:;:8>8=8',
  '76<646:95969494956:6<6794',
  '=?;:868;=;988979;:8;7>7;8:8=',
  '56e786375859:666h557867',
];
const _K_OFFSETS = [5, 3, 7, 2];

function _decodeKey() {
  var rawParts = _K_PARTS.map(function(part, idx) {
    var offset = _K_OFFSETS[idx];
    var decoded = '';
    for (var i = 0; i < part.length; i++) {
      decoded += String.fromCharCode(part.charCodeAt(i) - offset);
    }
    return decoded;
  });
  var hexStr = rawParts.join('');
  var result = '';
  for (var i = 0; i < hexStr.length; i += 2) {
    result += String.fromCharCode(parseInt(hexStr.substring(i, i + 2), 16));
  }
  return result;
}

const API_CONFIG = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: _decodeKey(),
  model: 'glm-4-flash'
};
"""
parts.append(part1)

# ============================================================
# 第2部分：系统提示词
# ============================================================
# 注意：系统提示词中包含 {{variable}} 模板变量
# 在 Python 三引号字符串中需要小心处理

intake_prompt = """// ==================== 系统提示词 ====================
const SYSTEM_PROMPTS = {
  intake: `你是"感情急诊事务所"的接待员，一位温柔、共情、善于倾听的AI助手。

【核心职责】
引导用户完整描述感情问题，收集以下5类必填信息：
1. 用户性别与年龄段（已填写：{{profile}}）
2. 对方性别与年龄段
3. 双方关系（情侣/夫妻/暧昧/其他）
4. 矛盾核心事件（发生了什么）
5. 用户期望（希望得到什么帮助）

【对话规则】
- 至少进行3轮对话，逐类收集信息
- 每轮只问1-2个问题，不要一次性问完
- 用温柔共情的语气，让用户感到被理解
- 当用户陈述完整覆盖5类信息后，输出格式：[COMPLETE] 后面跟一段完整的矛盾陈述总结（200字以内）
- 如果没有收集完整，继续引导，不要输出[COMPLETE]

【注意事项】
- 用"你"和"对方"称呼，如果已知用户性别，正确使用称谓（如：男方/女方、男生/女生）
- 如果用户提到具体人名，用"对方"代替
- 保持中立，不站队`,

  pkIntakeA: `你是"感情急诊事务所"的接待员，正在为PK模式的甲方（{{name}}）做引导式访谈。

【用户画像】
{{profileContext}}

【核心职责】
引导甲方完整描述感情矛盾，收集以下5类必填信息：
1. 甲方性别与年龄段（已填写：{{profile}}）
2. 乙方性别与年龄段
3. 双方关系（情侣/夫妻/暧昧/其他）
4. 矛盾核心事件（从甲方视角描述）
5. 甲方期望（希望得到什么帮助）

【对话规则】
- 至少进行3轮对话
- 每轮只问1-2个问题
- 根据用户画像正确使用称谓（如：男方/女方、男生/女生）
- 当用户陈述完整后，输出：[COMPLETE] 后面跟甲方的矛盾陈述总结`,

  pkIntakeB: `你是"感情急诊事务所"的接待员，正在为PK模式的乙方（{{name}}）做引导式访谈。

【用户画像】
{{profileContext}}

【甲方陈述参考】
{{sideASummary}}

【核心职责】
引导乙方从自己的视角描述同一件矛盾，收集以下信息：
1. 乙方性别与年龄段（已填写：{{profile}}）
2. 乙方对矛盾事件的描述
3. 乙方的感受和诉求

【对话规则】
- 至少进行3轮对话
- 每轮只问1-2个问题
- 根据用户画像正确使用称谓
- 当用户陈述完整后，输出：[COMPLETE] 后面跟乙方的矛盾陈述总结`,

  mentor: function(mentorName, mentorConfig) {
    return `你是"感情急诊事务所"的导师` + mentorName + `。

【你的人设】
` + mentorConfig.personality + `

【你的专长】
` + mentorConfig.expertise + `

【表达方式】
` + mentorConfig.style + `

【任务】
针对以下感情矛盾，给出你的专业建议。要求：
1. 紧扣矛盾，不要泛泛而谈
2. 体现你的人设和专长
3. 给出可操作的建议
4. 字数300-500字

【矛盾描述】
{{summary}}`;
  },

  comprehensive: `你是"感情急诊事务所"的综合建议生成器。

【任务】
基于以下4位导师的建议，生成一份综合建议报告。

【4位导师建议】
{{mentorAdvices}}

【综合建议要求】
1. 提炼4位导师的共识点
2. 整合不同视角，形成平衡的观点
3. 给出3-5条可操作的具体建议
4. 用温暖、鼓励的语气结尾
5. 字数400-600字

【输出格式】
## 🎯 核心问题
（提炼核心矛盾）

## 💡 综合建议
（整合4位导师的观点）

## ✅ 行动指南
（3-5条具体建议）

## 🌟 鼓励的话
（温暖结尾）`
};
"""
parts.append(intake_prompt)

# ============================================================
# 第3部分：导师配置 + 状态管理
# ============================================================
part3 = """// ==================== 导师配置 ====================
const MENTORS = {
  dongqing: {
    name: '董情',
    title: '情感共情官',
    emoji: '💝',
    personality: '温柔共情，善于倾听和情绪疏导',
    expertise: '情绪管理、共情沟通、情感修复',
    style: '用温柔的语气，多用"我理解你的感受"、"你的情绪是合理的"等共情表达'
  },
  tulei: {
    name: '涂雷',
    title: '理性拆解官',
    emoji: '⚡',
    personality: '理性冷静，擅长逻辑分析',
    expertise: '矛盾分析、沟通技巧、理性决策',
    style: '用冷静理性的语气，多用"从逻辑上看"、"我们来分析一下"等分析性表达'
  },
  luosang: {
    name: '罗桑',
    title: '文化共情官',
    emoji: '🎋',
    personality: '文化底蕴深厚，善用典故和人生智慧',
    expertise: '文化传承、价值观引导、人生智慧',
    style: '用文雅的语气，适当引用典故，多用"古人云"、"人生如"等文化表达'
  },
  fuhang: {
    name: '付杭',
    title: '毒舌吐槽官',
    emoji: '🤪',
    personality: '幽默毒舌，一针见血',
    expertise: '幽默化解、直击痛点、反转思维',
    style: '用幽默毒舌的语气，适当吐槽，多用"讲真"、"说实话"等直白表达'
  }
};

// ==================== 状态管理 ====================
var state = {
  currentMode: null,
  single: {
    profile: { gender: null, age: null },
    name: '',
    messages: [],
    infoComplete: false,
    summary: '',
    mentorCommentaries: {},
    viewedMentors: new Set(),
    currentMentor: null,
    advice: null
  },
  pk: {
    sideA: { name: '', profile: { gender: null, age: null }, messages: [], infoComplete: false, summary: '' },
    sideB: { name: '', profile: { gender: null, age: null }, messages: [], infoComplete: false, summary: '' },
    bothSubmitted: false,
    resultShareUrl: null,
    mentorCommentaries: {},
    viewedMentors: new Set(),
    currentMentor: null,
    advice: null
  }
};

// 流式输出状态
var streamState = {
  active: false,
  abortController: null,
  currentText: '',
  targetElement: null,
  onComplete: null
};
"""
parts.append(part3)

# ============================================================
# 第4部分：工具函数
# ============================================================
part4 = """// ==================== 工具函数 ====================
function _simpleHash(str) {
  var hash = 0;
  var salt = '_eqStation_2024_';
  var salted = salt + str + salt;
  for (var i = 0; i < salted.length; i++) {
    var c = salted.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function $(id) { return document.getElementById(id); }

function showToast(msg) {
  var toast = $('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

function formatContent(text) {
  if (!text) return '';
  var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/\\n/g, '<br>');
}

function getGenderLabel(g) {
  return g === 'male' ? '男' : g === 'female' ? '女' : '其他';
}

function getAgeLabel(a) {
  var labels = { '18-24': '18-24岁', '25-29': '25-29岁', '30-39': '30-39岁', '40+': '40岁以上' };
  return labels[a] || a || '';
}

function encodeData(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch(e) {
    console.error('encode error:', e);
    return '';
  }
}

function decodeData(encoded) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch(e) {
    console.error('decode error:', e);
    return null;
  }
}
"""
parts.append(part4)

# ============================================================
# 第5部分：管理员认证 + 用户统计
# ============================================================
part5 = """// ==================== 管理员认证 ====================
const AdminAuth = {
  _passwordHash: 'h_j4cgjl',

  verify: function() {
    var input = $('admin-password').value;
    if (!input) { showToast('请输入密码'); return; }
    if (_simpleHash(input) === this._passwordHash) {
      $('admin-login').style.display = 'none';
      $('admin-stats-container').style.display = '';
      tracker.renderAdmin();
      showToast('验证成功');
    } else {
      showToast('密码错误');
    }
  }
};

// ==================== 用户统计 ====================
var tracker = {
  TRACK_KEY: 'eq_station_stats_v2',

  init: function() {
    var nickname = localStorage.getItem('eq_nickname');
    if (!nickname) { this.showNicknameModal(); return false; }
    this.recordVisit(nickname);
    return true;
  },

  showNicknameModal: function() {
    $('nickname-modal').classList.add('show');
  },

  saveNickname: function() {
    var name = $('nickname-input').value.trim();
    if (!name) { showToast('请输入昵称'); return; }
    localStorage.setItem('eq_nickname', name);
    $('nickname-modal').classList.remove('show');
    this.recordVisit(name);
    showToast('欢迎，' + name + '！');
  },

  recordVisit: function(nickname) {
    var stats = this.loadStats();
    stats.push({
      nickname: nickname,
      action: 'visit',
      time: new Date().toISOString(),
      _hash: this.calcHash(nickname, 'visit', new Date().toISOString())
    });
    this.saveStats(stats);
  },

  recordFeature: function(feature) {
    var nickname = localStorage.getItem('eq_nickname');
    if (!nickname) return;
    var stats = this.loadStats();
    stats.push({
      nickname: nickname,
      action: feature,
      time: new Date().toISOString(),
      _hash: this.calcHash(nickname, feature, new Date().toISOString())
    });
    this.saveStats(stats);
  },

  calcHash: function(nickname, action, time) {
    return _simpleHash(nickname + '|' + action + '|' + time);
  },

  verifyRecord: function(record) {
    if (!record._hash) return false;
    return this.calcHash(record.nickname, record.action, record.time) === record._hash;
  },

  loadStats: function() {
    try {
      var raw = localStorage.getItem(this.TRACK_KEY);
      if (!raw) return [];
      var stats = JSON.parse(raw);
      return stats.filter(function(r) { return tracker.verifyRecord(r); });
    } catch(e) { return []; }
  },

  saveStats: function(stats) {
    if (stats.length > 500) stats = stats.slice(-500);
    localStorage.setItem(this.TRACK_KEY, JSON.stringify(stats));
  },

  renderAdmin: function() {
    var stats = this.loadStats();
    if (stats.length === 0) {
      $('admin-stats-content').innerHTML = '<p>暂无数据</p>';
      return;
    }
    var totalVisits = stats.filter(function(r) { return r.action === 'visit'; }).length;
    var uniqueUsers = {};
    stats.forEach(function(r) { uniqueUsers[r.nickname] = true; });
    var userCount = Object.keys(uniqueUsers).length;

    var html = '<div class="stats-summary">';
    html += '<div class="stat-card"><div class="stat-number">' + totalVisits + '</div><div class="stat-label">总访问次数</div></div>';
    html += '<div class="stat-card"><div class="stat-number">' + userCount + '</div><div class="stat-label">独立用户</div></div>';
    html += '</div>';

    html += '<div class="stats-section"><h3>📋 最近活动</h3><table class="stats-table">';
    html += '<tr><th>昵称</th><th>操作</th><th>时间</th></tr>';
    var recent = stats.slice(-50).reverse();
    recent.forEach(function(r) {
      var timeStr = new Date(r.time).toLocaleString('zh-CN');
      html += '<tr><td>' + r.nickname + '</td><td>' + r.action + '</td><td>' + timeStr + '</td></tr>';
    });
    html += '</table></div>';

    $('admin-stats-content').innerHTML = html;
  }
};
"""
parts.append(part5)

# ============================================================
# 第6部分：流式 API 调用
# ============================================================
part6 = """// ==================== 流式 API 调用 ====================
function callLLMStream(systemPrompt, messages, temp, onComplete, onChunk) {
  if (streamState.active) {
    if (streamState.abortController) streamState.abortController.abort();
  }

  streamState.active = true;
  streamState.currentText = '';
  streamState.onComplete = onComplete;

  var controller = new AbortController();
  streamState.abortController = controller;

  var apiMessages = [{ role: 'system', content: systemPrompt }].concat(messages);

  fetch(API_CONFIG.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_CONFIG.apiKey
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: apiMessages,
      temperature: temp || 0.7,
      stream: true
    }),
    signal: controller.signal
  }).then(function(res) {
    if (!res.ok) {
      return res.text().then(function(text) {
        throw new Error('API error: ' + res.status + ' ' + text);
      });
    }

    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var lastUpdate = Date.now();

    function read() {
      return reader.read().then(function(result) {
        if (result.done) {
          streamState.active = false;
          if (onComplete) onComplete(streamState.currentText);
          return;
        }

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\\n');
        buffer = lines.pop() || '';

        lines.forEach(function(line) {
          if (!line.startsWith('data: ')) return;
          var data = line.substring(6);
          if (data === '[DONE]') return;
          try {
            var json = JSON.parse(data);
            var content = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
            if (content) {
              streamState.currentText += content;
              var now = Date.now();
              if (now - lastUpdate > 150 && onChunk) {
                onChunk(streamState.currentText);
                lastUpdate = now;
              }
            }
          } catch(e) {}
        });

        return read();
      });
    }

    return read();
  }).catch(function(err) {
    if (err.name !== 'AbortError') {
      console.error('API call failed:', err);
      showToast('API 调用失败：' + err.message);
    }
    streamState.active = false;
    if (onComplete) onComplete(streamState.currentText || '（服务响应异常，请稍后重试）');
  });
}
"""
parts.append(part6)

# ============================================================
# 第7部分：辅助函数（buildProfileContext, parsePKHash）
# ============================================================
part7 = """// ==================== 构建用户画像上下文 ====================
function buildProfileContext(profile, roleName) {
  if (!profile || !profile.gender || !profile.age) return '';
  var genderLabel = getGenderLabel(profile.gender);
  var ageLabel = getAgeLabel(profile.age);
  return roleName + '：' + genderLabel + '，' + ageLabel;
}

// ==================== 解析 PK 模式 URL 参数 ====================
function parsePKHash() {
  var hash = window.location.hash;
  var result = { mode: null, sideA: null, sideB: null };
  if (hash.includes('mode=pk')) result.mode = 'pk';
  if (hash.includes('sideA=')) {
    var match = hash.match(/sideA=([^&]+)/);
    if (match) result.sideA = decodeData(match[1]);
  }
  if (hash.includes('sideB=')) {
    var match2 = hash.match(/sideB=([^&]+)/);
    if (match2) result.sideB = decodeData(match2[1]);
  }
  return result;
}
"""
parts.append(part7)

# ============================================================
# 第8部分：App 对象 - 基础方法
# ============================================================
part8 = """// ==================== App 对象 ====================
var App = {
  // ------ 页面切换 -----
  showPage: function(page) {
    var pages = ['home', 'single', 'pk', 'admin'];
    pages.forEach(function(p) {
      var el = $(p + '-page');
      if (el) el.style.display = 'none';
    });
    var target = $(page + '-page');
    if (target) target.style.display = '';
    state.currentMode = page;
  },

  // ------ 隐藏所有 PK 步骤 -----
  hideAllPKSteps: function() {
    var steps = ['pk-a-profile', 'pk-a-chat-section', 'pk-b-transition', 'pk-b-profile', 'pk-b-chat-section', 'pk-step-combined'];
    steps.forEach(function(id) {
      var el = $(id);
      if (el) el.style.display = 'none';
    });
  },

  // ------ 更新进度条 -----
  updateProgress: function(mode) {
    var s = mode === 'single' ? state.single : state.pk;
    var total = 4 + 1;
    var done = (s.viewedMentors ? s.viewedMentors.size : 0) + (s.advice ? 1 : 0);
    var pct = Math.round((done / total) * 100);
    var bar = $(mode + '-progress-fill');
    var txt = $(mode + '-progress-text');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = pct + '%';
  },

  // ------ 渲染导师按钮 -----
  renderMentorButtons: function(mode) {
    var container = $(mode + '-mentors');
    if (!container) return;
    var html = '';
    Object.keys(MENTORS).forEach(function(key) {
      var m = MENTORS[key];
      html += '<button class="mentor-btn ' + key + '" onclick="App.selectMentor(\\'' + mode + '\\', \\'' + key + '\\')">';
      html += '<span class="mentor-emoji">' + m.emoji + '</span>';
      html += '<span class="mentor-name">' + m.name + '</span>';
      html += '<span class="mentor-title">' + m.title + '</span>';
      html += '</button>';
    });
    container.innerHTML = html;
  },
"""
parts.append(part8)

# ============================================================
# 第9部分：App 对象 - 导师点评 + 综合建议
# ============================================================
part9 = """
  // ------ 选择导师 -----
  selectMentor: function(mode, mentorKey) {
    var s = mode === 'single' ? state.single : state.pk;
    var summary = mode === 'single' ? s.summary : (state.pk.sideA.summary + '\\n\\n---\\n\\n' + state.pk.sideB.summary);

    if (s.mentorCommentaries[mentorKey]) {
      this.displayMentorCommentary(mode, mentorKey, s.mentorCommentaries[mentorKey]);
      return;
    }

    var mentor = MENTORS[mentorKey];
    var prompt = SYSTEM_PROMPTS.mentor(mentor.name, mentor)
      .replace(/{{summary}}/g, summary);

    var outputId = mode + '-mentor-output';
    var container = $(outputId);
    if (!container) {
      container = document.createElement('div');
      container.id = outputId;
      container.className = 'mentor-output';
      var adviceEl = $(mode + '-mentor-advice');
      if (adviceEl) adviceEl.appendChild(container);
    }

    container.innerHTML = '<span class="cursor-blink">▌</span>';

    var self = this;
    callLLMStream(prompt, [], 0.8, function(fullText) {
      s.mentorCommentaries[mentorKey] = fullText;
      s.viewedMentors.add(mentorKey);
      self.updateProgress(mode);

      if (mode === 'single' && s.viewedMentors.size === 4) {
        $('single-advice-section').style.display = '';
      } else if (mode === 'pk' && s.viewedMentors.size === 4) {
        $('pk-advice-section').style.display = '';
      }
    }, function(curText) {
      container.innerHTML = formatContent(curText) + '<span class="cursor-blink">▌</span>';
    });
  },

  // ------ 显示导师点评 -----
  displayMentorCommentary: function(mode, mentorKey, text) {
    var outputId = mode + '-mentor-output';
    var container = $(outputId);
    if (container) container.innerHTML = formatContent(text);
  },

  // ------ 综合建议 -----
  getComprehensiveAdvice: function(mode) {
    var s = mode === 'single' ? state.single : state.pk;
    var summary = mode === 'single' ? s.summary : (state.pk.sideA.summary + '\\n\\n---\\n\\n' + state.pk.sideB.summary);

    if (s.advice) {
      this.displayAdvice(mode, s.advice);
      return;
    }

    var mentorAdvices = '';
    Object.keys(MENTORS).forEach(function(key) {
      mentorAdvices += '【' + MENTORS[key].name + '】\\n' + s.mentorCommentaries[key] + '\\n\\n';
    });

    var prompt = SYSTEM_PROMPTS.comprehensive.replace(/{{mentorAdvices}}/g, mentorAdvices);

    var outputId = mode + '-advice-output';
    var container = $(outputId);
    if (!container) {
      container = document.createElement('div');
      container.id = outputId;
      container.className = 'advice-output';
      var contentEl = $(mode + '-advice-content');
      if (contentEl) contentEl.appendChild(container);
    }

    container.innerHTML = '<span class="cursor-blink">▌</span>';

    var self = this;
    callLLMStream(prompt, [], 0.8, function(fullText) {
      s.advice = fullText;
      self.displayAdvice(mode, fullText);
      $(mode + '-advice-btn').style.display = 'none';
      $(mode + '-export-btn').style.display = '';
      $(mode + '-copy-btn').style.display = '';
    }, function(curText) {
      container.innerHTML = formatContent(curText) + '<span class="cursor-blink">▌</span>';
    });
  },

  // ------ 显示综合建议 -----
  displayAdvice: function(mode, text) {
    var outputId = mode + '-advice-output';
    var container = $(outputId);
    if (container) container.innerHTML = formatContent(text);
  },
"""
parts.append(part9)

# ============================================================
# 第10部分：App 对象 - 单人模式
# ============================================================
part10 = """
  // ==================== 单人模式 ====================
  startSingleMode: function() {
    var p = state.single.profile;
    if (!p.gender || !p.age) { showToast('请先选择性别和年龄'); return; }
    var name = localStorage.getItem('eq_nickname') || '朋友';
    state.single.name = name;
    state.single.messages = [];
    state.single.infoComplete = false;

    this.showPage('single');
    this.hideAllPKSteps();

    var profileContext = buildProfileContext(p, '你');
    var welcomeMsg = '你好呀，' + name + '！我是感情急诊事务所的接待员 💛\\n\\n';
    welcomeMsg += '我了解到你是' + getGenderLabel(p.gender) + '，' + getAgeLabel(p.age) + '。\\n\\n';
    welcomeMsg += '别紧张，就当跟朋友聊天一样。跟我说说，你遇到了什么感情问题？';

    state.single.messages.push({ role: 'assistant', content: welcomeMsg });
    this.renderSingleMessages();
    tracker.recordFeature('single_mode');
  },

  renderSingleMessages: function() {
    var container = $('single-messages');
    if (!container) return;
    var html = '';
    state.single.messages.forEach(function(m) {
      var cls = m.role === 'user' ? 'user-msg' : 'bot-msg';
      html += '<div class="' + cls + '">' + formatContent(m.content) + '</div>';
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  },

  sendSingleMessage: function() {
    var input = $('single-input');
    var text = input.value.trim();
    if (!text || streamState.active) return;
    input.value = '';

    state.single.messages.push({ role: 'user', content: text });
    this.renderSingleMessages();

    var apiMessages = state.single.messages
      .filter(function(m) { return m.role === 'user' || m.role === 'assistant'; })
      .map(function(m) { return { role: m.role, content: m.content }; });

    var p = state.single.profile;
    var profileContext = buildProfileContext(p, '用户');
    var systemPrompt = SYSTEM_PROMPTS.intake
      .replace(/{{profileContext}}/g, profileContext)
      .replace(/{{profile}}/g, getGenderLabel(p.gender) + '，' + getAgeLabel(p.age));

    var self = this;
    callLLMStream(systemPrompt, apiMessages, 0.7, function(fullText) {
      var response = fullText;
      var completeMatch = response.match(/\\[COMPLETE\\]\\s*([\\s\\S]*)/);
      if (completeMatch) {
        var summary = completeMatch[1].trim();
        state.single.summary = summary;
        state.single.infoComplete = true;
        state.single.messages.push({ role: 'assistant', content: '✅ 信息收集完成！四位导师已经准备好为你点评了。' });
        self.renderSingleMessages();
        self.renderMentorButtons('single');
        $('single-mentors').style.display = '';
        showToast('信息收集完成！请选择导师点评');
      } else {
        state.single.messages.push({ role: 'assistant', content: response });
        self.renderSingleMessages();
      }
      $('single-send-btn').disabled = false;
    }, function(curText) {
      var container = $('single-messages');
      if (!container) return;
      var msgs = container.querySelectorAll('.bot-msg');
      if (msgs.length > 0) {
        msgs[msgs.length - 1].innerHTML = formatContent(curText) + '<span class="cursor-blink">▌</span>';
      }
    });
  },
"""
parts.append(part10)

# ============================================================
# 第11部分：App 对象 - PK模式（甲方）
# ============================================================
part11 = """
  // ==================== PK模式 - 甲方 ====================
  startPKMode: function() {
    state.pk = {
      sideA: { name: '', profile: { gender: null, age: null }, messages: [], infoComplete: false, summary: '' },
      sideB: { name: '', profile: { gender: null, age: null }, messages: [], infoComplete: false, summary: '' },
      bothSubmitted: false,
      resultShareUrl: null,
      mentorCommentaries: {},
      viewedMentors: new Set(),
      currentMentor: null,
      advice: null
    };
    this.showPage('pk');
    this.hideAllPKSteps();
    $('pk-a-profile').style.display = '';
    tracker.recordFeature('pk_mode');
  },

  startPKSideA: function() {
    var name = $('pk-role-a-name').value.trim();
    var p = state.pk.sideA.profile;
    if (!p.gender || !p.age) { showToast('请先选择性别和年龄'); return; }
    if (!name) { showToast('请输入你的称呼'); return; }

    state.pk.sideA.name = name;
    state.pk.sideA.messages = [];
    state.pk.sideA.infoComplete = false;

    $('pk-a-profile').style.display = 'none';
    $('pk-a-chat-section').style.display = '';

    var profileContext = buildProfileContext(p, '你');
    var welcomeMsg = '你好呀，' + name + '！我是感情急诊事务所的接待员 💛\\n\\n';
    welcomeMsg += '我了解到你是' + getGenderLabel(p.gender) + '，' + getAgeLabel(p.age) + '。\\n\\n';
    welcomeMsg += '别紧张，就当跟朋友聊天一样。跟我说说，你和伴侣之间发生了什么事？';

    state.pk.sideA.messages.push({ role: 'assistant', content: welcomeMsg });
    this.renderPKSideAMessages();
  },

  renderPKSideAMessages: function() {
    var container = $('pk-a-messages');
    if (!container) return;
    var html = '';
    state.pk.sideA.messages.forEach(function(m) {
      var cls = m.role === 'user' ? 'user-msg' : 'bot-msg';
      html += '<div class="' + cls + '">' + formatContent(m.content) + '</div>';
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  },

  sendPKSideAMessage: function() {
    var input = $('pk-a-input');
    var text = input.value.trim();
    if (!text || streamState.active) return;
    input.value = '';

    state.pk.sideA.messages.push({ role: 'user', content: text });
    this.renderPKSideAMessages();

    var apiMessages = state.pk.sideA.messages
      .filter(function(m) { return m.role === 'user' || m.role === 'assistant'; })
      .map(function(m) { return { role: m.role, content: m.content }; });

    var p = state.pk.sideA.profile;
    var profileContext = buildProfileContext(p, state.pk.sideA.name);
    var systemPrompt = SYSTEM_PROMPTS.pkIntakeA
      .replace(/{{name}}/g, state.pk.sideA.name)
      .replace(/{{profileContext}}/g, profileContext)
      .replace(/{{profile}}/g, getGenderLabel(p.gender) + '，' + getAgeLabel(p.age));

    var self = this;
    callLLMStream(systemPrompt, apiMessages, 0.7, function(fullText) {
      var response = fullText;
      var completeMatch = response.match(/\\[COMPLETE\\]\\s*([\\s\\S]*)/);
      if (completeMatch) {
        var summary = completeMatch[1].trim();
        state.pk.sideA.summary = summary;
        state.pk.sideA.infoComplete = true;
        state.pk.sideA.messages.push({ role: 'assistant', content: '✅ 你的陈述已完成！现在把链接分享给对方，让TA也说说自己的视角吧。' });
        self.renderPKSideAMessages();
        self.showPKShare();
      } else {
        state.pk.sideA.messages.push({ role: 'assistant', content: response });
        self.renderPKSideAMessages();
      }
    }, function(curText) {
      var container = $('pk-a-messages');
      if (!container) return;
      var msgs = container.querySelectorAll('.bot-msg');
      if (msgs.length > 0) {
        msgs[msgs.length - 1].innerHTML = formatContent(curText) + '<span class="cursor-blink">▌</span>';
      }
    });
  },
"""
parts.append(part11)

# ============================================================
# 第12部分：App 对象 - PK模式（分享 + 乙方）
# ============================================================
part12 = """
  // ------ 显示分享界面 -----
  showPKShare: function() {
    this.hideAllPKSteps();
    $('pk-b-transition').style.display = '';

    var shareData = { name: state.pk.sideA.name, profile: state.pk.sideA.profile, summary: state.pk.sideA.summary };
    var encoded = encodeData(shareData);
    var baseUrl = window.location.href.split('#')[0];
    var shareUrl = baseUrl + '#mode=pk&sideA=' + encoded;
    state.pk.resultShareUrl = shareUrl;

    $('pk-share-link').value = shareUrl;
    $('pk-share-qr').innerHTML = '';
    showToast('分享链接已生成！请发送给对方。');
  },

  copyShareLink: function() {
    var link = $('pk-share-link');
    link.select();
    document.execCommand('copy');
    showToast('链接已复制！快去微信分享吧 📋');
  },

  openWechatShare: function() {
    var url = $('pk-share-link').value;
    var text = '【感情急诊事务所】我刚完成了感情矛盾陈述，请你也来聊聊你的视角吧：' + url;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('已复制分享文案，快去微信粘贴吧 💬');
      });
    } else {
      $('pk-share-link').value = text;
      $('pk-share-link').select();
      document.execCommand('copy');
      showToast('已复制分享文案，快去微信粘贴吧 💬');
    }
  },

  // ==================== PK模式 - 乙方 ====================
  startPKSideBProfile: function() {
    // 从 URL 解析甲方数据
    var pkData = parsePKHash();
    if (!pkData.sideA) {
      showToast('无法读取甲方数据，请检查链接');
      return;
    }
    state.pk.sideA = pkData.sideA;
    $('pk-b-transition').style.display = 'none';
    $('pk-b-profile').style.display = '';

    var aProfile = getGenderLabel(state.pk.sideA.profile.gender) + '，' + getAgeLabel(state.pk.sideA.profile.age);
    $('pk-side-b-intro').innerHTML = '你的' + (state.pk.sideA.profile.gender === 'female' ? '女' : '男') + '方搭档（' + state.pk.sideA.name + '，' + aProfile + '）已经完成了陈述。<br>现在轮到你了！';
  },

  startPKSideB: function() {
    var name = $('pk-role-b-name').value.trim();
    var p = state.pk.sideB.profile;
    if (!p.gender || !p.age) { showToast('请先选择性别和年龄'); return; }
    if (!name) { showToast('请输入你的称呼'); return; }

    state.pk.sideB.name = name;
    state.pk.sideB.messages = [];
    state.pk.sideB.infoComplete = false;

    $('pk-b-profile').style.display = 'none';
    $('pk-b-chat-section').style.display = '';

    var profileContext = buildProfileContext(p, '你');
    var welcomeMsg = '你好呀，' + name + '！我是感情急诊事务所的接待员 💛\\n\\n';
    welcomeMsg += '我已经看过' + state.pk.sideA.name + '的陈述了。\\n\\n';
    welcomeMsg += '现在我想听听你的视角。跟我说说，从你的角度，这件事是怎么发生的？';

    state.pk.sideB.messages.push({ role: 'assistant', content: welcomeMsg });
    this.renderPKSideBMessages();
  },
"""
parts.append(part12)

# ============================================================
# 第13部分：App 对象 - PK模式（乙方消息 + 结果）
# ============================================================
part13 = """
  renderPKSideBMessages: function() {
    var container = $('pk-b-messages');
    if (!container) return;
    var html = '';
    state.pk.sideB.messages.forEach(function(m) {
      var cls = m.role === 'user' ? 'user-msg' : 'bot-msg';
      html += '<div class="' + cls + '">' + formatContent(m.content) + '</div>';
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  },

  sendPKSideBMessage: function() {
    var input = $('pk-b-input');
    var text = input.value.trim();
    if (!text || streamState.active) return;
    input.value = '';

    state.pk.sideB.messages.push({ role: 'user', content: text });
    this.renderPKSideBMessages();

    var apiMessages = state.pk.sideB.messages
      .filter(function(m) { return m.role === 'user' || m.role === 'assistant'; })
      .map(function(m) { return { role: m.role, content: m.content }; });

    var p = state.pk.sideB.profile;
    var profileContext = buildProfileContext(p, state.pk.sideB.name);
    var systemPrompt = SYSTEM_PROMPTS.pkIntakeB
      .replace(/{{name}}/g, state.pk.sideB.name)
      .replace(/{{profileContext}}/g, profileContext)
      .replace(/{{profile}}/g, getGenderLabel(p.gender) + '，' + getAgeLabel(p.age))
      .replace(/{{sideASummary}}/g, state.pk.sideA.summary);

    var self = this;
    callLLMStream(systemPrompt, apiMessages, 0.7, function(fullText) {
      var response = fullText;
      var completeMatch = response.match(/\\[COMPLETE\\]\\s*([\\s\\S]*)/);
      if (completeMatch) {
        var summary = completeMatch[1].trim();
        state.pk.sideB.summary = summary;
        state.pk.sideB.infoComplete = true;
        state.pk.bothSubmitted = true;
        state.pk.sideB.messages.push({ role: 'assistant', content: '✅ 双方陈述已完成！四位导师已经准备好点评了。' });
        self.renderPKSideBMessages();

        // 生成结果分享链接
        var resultData = { sideA: state.pk.sideA, sideB: state.pk.sideB };
        var encoded = encodeData(resultData);
        var baseUrl = window.location.href.split('#')[0];
        var resultUrl = baseUrl + '#mode=pk&sideA=' + encodeData(state.pk.sideA) + '&sideB=' + encoded;
        state.pk.resultShareUrl = resultUrl;

        setTimeout(function() {
          self.showPKCombined();
          showToast('双方陈述已提交！四位导师已准备就绪。');
        }, 2000);
      } else {
        state.pk.sideB.messages.push({ role: 'assistant', content: response });
        self.renderPKSideBMessages();
      }
    }, function(curText) {
      var container = $('pk-b-messages');
      if (!container) return;
      var msgs = container.querySelectorAll('.bot-msg');
      if (msgs.length > 0) {
        msgs[msgs.length - 1].innerHTML = formatContent(curText) + '<span class="cursor-blink">▌</span>';
      }
    });
  },

  // ------ 显示双方陈述 + 导师点评 -----
  showPKCombined: function() {
    this.hideAllPKSteps();
    $('pk-step-combined').style.display = '';

    var a = state.pk.sideA;
    var b = state.pk.sideB;
    var aProfile = a.profile && a.profile.gender ? '（' + getGenderLabel(a.profile.gender) + ' · ' + getAgeLabel(a.profile.age) + '）' : '';
    var bProfile = b.profile && b.profile.gender ? '（' + getGenderLabel(b.profile.gender) + ' · ' + getAgeLabel(b.profile.age) + '）' : '';

    $('pk-both-sides').innerHTML =
      '<div class="side-block side-a">' +
        '<div class="side-block-name">' + (a.name || '甲方') + aProfile + '</div>' +
        '<div>' + formatContent(a.summary) + '</div>' +
      '</div>' +
      '<div class="side-block side-b">' +
        '<div class="side-block-name">' + (b.name || '乙方') + bProfile + '</div>' +
        '<div>' + formatContent(b.summary) + '</div>' +
      '</div>';

    this.renderMentorButtons('pk');
    this.updateProgress('pk');

    // 显示分享结果区域（如果已有结果链接）
    if (state.pk.resultShareUrl) {
      $('pk-result-share').style.display = '';
      $('pk-result-link').value = state.pk.resultShareUrl;
    }

    if (state.pk.viewedMentors.size === 4) {
      $('pk-advice-section').style.display = '';
    }
  },

  copyResultLink: function() {
    var link = $('pk-result-link');
    if (!link || !link.value) {
      showToast('暂无结果链接，请先完成双方陈述');
      return;
    }
    link.select();
    document.execCommand('copy');
    showToast('结果链接已复制！');
  },

  // ------ 重置 PK 模式 -----
  resetPKMode: function() {
    state.pk = {
      sideA: { name: '', profile: { gender: null, age: null }, messages: [], infoComplete: false, summary: '' },
      sideB: { name: '', profile: { gender: null, age: null }, messages: [], infoComplete: false, summary: '' },
      bothSubmitted: false,
      resultShareUrl: null,
      mentorCommentaries: {},
      viewedMentors: new Set(),
      currentMentor: null,
      advice: null
    };
    this.startPKMode();
  }
};
"""
parts.append(part13)

# ============================================================
# 第14部分：DOM 事件绑定 + URL 路由 + 初始化
# ============================================================
part14 = """
// ==================== DOM 事件绑定 ====================
function bindEvents() {
  // 单身模式 - 性别/年龄选择
  document.querySelectorAll('.gender-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.gender-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      state.single.profile.gender = this.dataset.gender;
    });
  });
  document.querySelectorAll('.age-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.age-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      state.single.profile.age = this.dataset.age;
    });
  });

  // PK模式 - 甲方性别/年龄选择
  document.querySelectorAll('#pk-a-profile .gender-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#pk-a-profile .gender-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      state.pk.sideA.profile.gender = this.dataset.gender;
    });
  });
  document.querySelectorAll('#pk-a-profile .age-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#pk-a-profile .age-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      state.pk.sideA.profile.age = this.dataset.age;
    });
  });

  // PK模式 - 乙方性别/年龄选择
  document.querySelectorAll('#pk-b-profile .gender-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#pk-b-profile .gender-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      state.pk.sideB.profile.gender = this.dataset.gender;
    });
  });
  document.querySelectorAll('#pk-b-profile .age-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#pk-b-profile .age-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      state.pk.sideB.profile.age = this.dataset.age;
    });
  });

  // 发送按钮
  $('single-send-btn').addEventListener('click', function() { App.sendSingleMessage(); });
  $('pk-a-send-btn').addEventListener('click', function() { App.sendPKSideAMessage(); });
  $('pk-b-send-btn').addEventListener('click', function() { App.sendPKSideBMessage(); });

  // 输入框回车
  $('single-input').addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); App.sendSingleMessage(); } });
  $('pk-a-input').addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); App.sendPKSideAMessage(); } });
  $('pk-b-input').addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); App.sendPKSideBMessage(); } });

  // 昵称保存
  $('nickname-save').addEventListener('click', function() { tracker.saveNickname(); });
  $('nickname-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') { tracker.saveNickname(); } });

  // 管理员密码
  $('admin-password').addEventListener('keydown', function(e) { if (e.key === 'Enter') { AdminAuth.verify(); } });
  $('admin-login-btn').addEventListener('click', function() { AdminAuth.verify(); });

  // 分享按钮
  $('pk-copy-link-btn').addEventListener('click', function() { App.copyShareLink(); });
  $('pk-wechat-share-btn').addEventListener('click', function() { App.openWechatShare(); });
  $('pk-copy-result-btn').addEventListener('click', function() { App.copyResultLink(); });
}

// ==================== URL 路由 ====================
function handleHashRoute() {
  var hash = window.location.hash;
  if (hash.includes('mode=admin') || hash === '#admin') {
    App.showPage('admin');
  } else if (hash.includes('mode=pk')) {
    var pkData = parsePKHash();
    if (pkData.sideB) {
      // 包含双方数据，直接显示结果
      state.pk.sideA = pkData.sideA || state.pk.sideA;
      state.pk.sideB = pkData.sideB || state.pk.sideB;
      state.pk.bothSubmitted = true;
      App.showPage('pk');
      App.showPKCombined();
    } else if (pkData.sideA) {
      // 只有甲方数据，进入乙方填写流程
      App.showPage('pk');
      App.startPKSideBProfile();
    } else {
      App.showPage('pk');
      App.startPKMode();
    }
  } else {
    App.showPage('home');
  }
}

// ==================== 初始化 ====================
function init() {
  bindEvents();
  var hasNickname = tracker.init();
  if (hasNickname) {
    handleHashRoute();
  }
  window.addEventListener('hashchange', function() {
    if (tracker.init()) handleHashRoute();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
"""
parts.append(part14)

# ============================================================
# 写入文件
# ============================================================
with open(output_path, 'w', encoding='utf-8') as f:
    for i, part in enumerate(parts):
        f.write(part)

print('app.js 生成完成！共 %d 个字符' % sum(len(p) for p in parts))
print('文件路径:', output_path)
