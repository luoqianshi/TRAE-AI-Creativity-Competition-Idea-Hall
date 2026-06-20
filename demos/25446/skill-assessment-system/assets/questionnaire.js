// assets/questionnaire.js
// SkillChain - AI 职业倾向测评问卷系统
(function() {

  // ============================================================
  // State
  // ============================================================
  var TOTAL_STEPS = 11; // 0-welcome + questions 1-10
  var ANSWERS = {};
  var currentStep = 0;
  var isAnalyzing = false;

  // ============================================================
  // Init dots
  // ============================================================
  function initDots() {
    var container = document.getElementById('q-dots');
    if (!container) return;
    var html = '';
    for (var i = 0; i < TOTAL_STEPS; i++) {
      html += '<span class="q-dot" data-dot="' + i + '"></span>';
    }
    container.innerHTML = html;
  }
  initDots();

  // ============================================================
  // Update UI
  // ============================================================
  function updateUI() {
    var pct = Math.round((currentStep / (TOTAL_STEPS - 1)) * 100);
    document.getElementById('q-progress-fill').style.width = pct + '%';
    document.getElementById('q-step-label').textContent = '第 ' + currentStep + '/' + (TOTAL_STEPS - 1) + ' 题';
    document.getElementById('q-pct').textContent = pct + '%';

    // dots
    var dots = document.querySelectorAll('#q-dots .q-dot');
    dots.forEach(function(d, i) {
      d.className = 'q-dot';
      if (i < currentStep) d.classList.add('done');
      if (i === currentStep) d.classList.add('cur');
    });

    // steps
    var steps = document.querySelectorAll('#q-body .q-step');
    steps.forEach(function(s) { s.classList.remove('active'); });
    var activeStep = document.querySelector('#q-body .q-step[data-step="' + currentStep + '"]');
    if (activeStep) activeStep.classList.add('active');

    // buttons
    var backBtn = document.getElementById('q-btn-back');
    var nextBtn = document.getElementById('q-btn-next');
    backBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    if (currentStep === TOTAL_STEPS - 1) {
      nextBtn.textContent = '✨ 提交分析';
      nextBtn.disabled = false;
    } else {
      nextBtn.textContent = '下一题 →';
      // Check if current step requires answer
      if (currentStep === 8) {
        // multi-select - at least 1
        var picked = document.querySelectorAll('.q-step[data-step="8"] .q-tag.picked');
        nextBtn.disabled = picked.length === 0;
      } else if (currentStep > 0 && currentStep < TOTAL_STEPS - 1) {
        var qStep = document.querySelector('.q-step[data-step="' + currentStep + '"]');
        if (qStep) {
          var optsContainer = qStep.querySelector('.q-options');
          if (optsContainer) {
            var qid = optsContainer.getAttribute('data-qid');
            nextBtn.disabled = !ANSWERS[qid];
          }
        }
      } else {
        nextBtn.disabled = false;
      }
    }

    // result panel
    var resultPanel = document.getElementById('result-panel');
    var qBody = document.getElementById('q-body');
    var qNav = document.querySelector('.q-nav');
    if (currentStep >= TOTAL_STEPS && isAnalyzing) {
      qBody.style.display = 'none';
      qNav.style.display = 'none';
      resultPanel.classList.add('active');
    }
  }

  // ============================================================
  // Navigation
  // ============================================================
  window.prevStep = function() {
    if (isAnalyzing) return;
    if (currentStep > 0) {
      currentStep--;
      updateUI();
    }
  };

  window.nextStep = function() {
    if (isAnalyzing) return;

    // Collect current answer
    if (currentStep >= 1 && currentStep <= 7) {
      var qStep = document.querySelector('.q-step[data-step="' + currentStep + '"]');
      if (qStep) {
        var opts = qStep.querySelector('.q-options');
        if (opts) {
          var qid = opts.getAttribute('data-qid');
          var selected = qStep.querySelector('.q-option.selected');
          if (selected) {
            ANSWERS[qid] = selected.getAttribute('data-val');
          }
        }
      }
    }

    // Step 9: dream text
    if (currentStep === 9) {
      var dreamInput = document.getElementById('q-dream-input');
      if (dreamInput) ANSWERS['dream'] = dreamInput.value.trim();
    }

    // Step 10: location
    if (currentStep === 10) {
      var locStep = document.querySelector('.q-step[data-step="10"]');
      if (locStep) {
        var selected = locStep.querySelector('.q-option.selected');
        if (selected) ANSWERS['location'] = selected.getAttribute('data-val');
      }
    }

    // Name from step 0
    if (currentStep === 0) {
      var nameInput = document.getElementById('q-name-input');
      if (nameInput) ANSWERS['name'] = nameInput.value.trim();
    }

    // Validate required
    if (currentStep === 8) {
      // Multi-select interests
      var picked = document.querySelectorAll('.q-step[data-step="8"] .q-tag.picked');
      if (picked.length === 0) return; // block
      var interests = [];
      picked.forEach(function(t) { interests.push(t.getAttribute('data-val')); });
      ANSWERS['interests'] = interests;
    } else if (currentStep >= 1 && currentStep <= 7) {
      var qStep = document.querySelector('.q-step[data-step="' + currentStep + '"]');
      if (qStep) {
        var opts = qStep.querySelector('.q-options');
        if (opts) {
          var qid = opts.getAttribute('data-qid');
          if (!ANSWERS[qid]) return; // block - no answer
        }
      }
    }

    if (currentStep < TOTAL_STEPS - 1) {
      currentStep++;
      updateUI();
    } else {
      // Submit and analyze
      startAnalysis();
    }
  };

  // ============================================================
  // Option picking (single choice)
  // ============================================================
  window.pickOption = function(el, qid) {
    var parent = el.parentElement;
    var allOpts = parent.querySelectorAll('.q-option');
    allOpts.forEach(function(o) { o.classList.remove('selected'); });
    el.classList.add('selected');
    ANSWERS[qid] = el.getAttribute('data-val');
    updateUI();
  };

  // ============================================================
  // Tag toggle (multi-select)
  // ============================================================
  window.toggleTag = function(el) {
    var allTags = el.parentElement.querySelectorAll('.q-tag');
    var picked = el.parentElement.querySelectorAll('.q-tag.picked');
    if (el.classList.contains('picked')) {
      el.classList.remove('picked');
    } else {
      if (picked.length >= 5) {
        // shake animation hint
        el.style.transform = 'translateX(-4px)';
        setTimeout(function() { el.style.transform = ''; }, 100);
        return;
      }
      el.classList.add('picked');
    }
    updateUI();
  };

  // ============================================================
  // Char counters
  // ============================================================
  window.updateNameChar = function() {
    var input = document.getElementById('q-name-input');
    var count = document.getElementById('name-char-count');
    if (input && count) count.textContent = (input.value ? input.value.length : 0) + ' / 20';
  };
  window.updateDreamChar = function() {
    var input = document.getElementById('q-dream-input');
    var count = document.getElementById('dream-char-count');
    if (input && count) count.textContent = (input.value ? input.value.length : 0) + ' / 200';
  };

  // ============================================================
  // Voice Recognition (Web Speech API)
  // ============================================================
  var recognition = null;
  var voiceTarget = null;

  window.toggleVoice = function(targetId) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音输入，请使用 Chrome 浏览器。');
      return;
    }

    if (recognition && voiceTarget === targetId) {
      // Stop
      recognition.stop();
      return;
    }
    // Stop previous
    if (recognition) recognition.stop();

    voiceTarget = targetId;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    var voiceStatus = document.querySelector('.q-step.active .voice-status');
    if (!voiceStatus) {
      voiceStatus = document.createElement('div');
      voiceStatus.className = 'voice-status';
      var parentEl = document.querySelector('.q-step.active .q-input-wrap');
      if (parentEl) parentEl.appendChild(voiceStatus);
    }

    var voiceBtn = document.getElementById('voice-' + targetId.replace('-input', '') + '-btn');
    if (voiceBtn) voiceBtn.classList.add('recording');

    recognition.onstart = function() {
      if (voiceStatus) voiceStatus.textContent = '🎙️ 正在聆听...';
    };

    recognition.onresult = function(e) {
      var transcript = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      // Map target
      var inputId = '';
      if (targetId === 'name-input') inputId = 'q-name-input';
      else if (targetId === 'dream-input') inputId = 'q-dream-input';
      var input = document.getElementById(inputId);
      if (input) {
        input.value = transcript;
        if (targetId === 'name-input') updateNameChar();
        else updateDreamChar();
      }
    };

    recognition.onerror = function(e) {
      if (voiceStatus) voiceStatus.textContent = '❌ 语音识别出错：' + e.error;
      resetVoiceBtn();
    };

    recognition.onend = function() {
      if (voiceStatus) voiceStatus.textContent = '✅ 语音输入完成';
      resetVoiceBtn();
      setTimeout(function() {
        if (voiceStatus) voiceStatus.textContent = '';
      }, 2000);
    };

    recognition.start();
  };

  function resetVoiceBtn() {
    var btns = document.querySelectorAll('.voice-btn');
    btns.forEach(function(b) { b.classList.remove('recording'); });
    recognition = null;
    voiceTarget = null;
  }

  // ============================================================
  // AI Analysis Engine
  // ============================================================
  function startAnalysis() {
    isAnalyzing = true;
    currentStep = TOTAL_STEPS;
    updateUI();

    // Simulate AI thinking delay
    setTimeout(function() {
      var results = analyzeAnswers();
      showResults(results);
    }, 2000);
  }

  function analyzeAnswers() {
    var workstyle = ANSWERS['workstyle'] || 'analytical';
    var problem = ANSWERS['problem_solving'] || 'systematic';
    var motivation = ANSWERS['motivation'] || 'impact';
    var environment = ANSWERS['environment'] || 'startup';
    var dataAff = ANSWERS['data_affinity'] || 'ok';
    var team = ANSWERS['team_style'] || 'peer';
    var resilience = ANSWERS['resilience'] || 'fight';
    var interests = ANSWERS['interests'] || ['IT'];
    var location = ANSWERS['location'] || 'tier2';
    var name = ANSWERS['name'] || '用户';

    // --- Calculate personality dimensions ---
    var personality = calculatePersonality(workstyle, problem, motivation, team, dataAff, resilience, environment);

    // --- Calculate skill scores ---
    var skills = calculateSkills(workstyle, dataAff, team, resilience, problem, interests);

    // --- Find top 3 industry matches ---
    var matches = findTopMatches(personality, skills, interests, location, environment);

    return {
      name: name,
      personality: personality,
      skills: skills,
      matches: matches,
      interests: interests,
      location: location,
      environment: environment
    };
  }

  function calculatePersonality(workstyle, problem, motivation, team, dataAff, resilience, environment) {
    var p = {};
    // Analytical thinking (0-100)
    p.analytical = 50;
    if (workstyle === 'analytical') p.analytical += 30;
    if (problem === 'systematic' || problem === 'research') p.analytical += 20;
    if (dataAff === 'love') p.analytical += 15;
    if (workstyle === 'creative') p.analytical -= 10;

    // Creativity (0-100)
    p.creativity = 50;
    if (workstyle === 'creative') p.creativity += 30;
    if (motivation === 'innovation') p.creativity += 20;
    if (problem === 'intuitive') p.creativity += 15;
    if (environment === 'startup') p.creativity += 10;

    // Social/Communication (0-100)
    p.social = 50;
    if (workstyle === 'social') p.social += 30;
    if (problem === 'collaborative') p.social += 20;
    if (team === 'diverse') p.social += 15;
    if (resilience === 'support') p.social += 10;
    if (team === 'solo') p.social -= 20;

    // Leadership (0-100)
    p.leadership = 50;
    if (workstyle === 'leadership') p.leadership += 30;
    if (motivation === 'growth') p.leadership += 20;
    if (resilience === 'fight') p.leadership += 15;
    if (team === 'mentor') p.leadership -= 10;

    // Adaptability (0-100)
    p.adaptability = 50;
    if (resilience === 'adapt') p.adaptability += 25;
    if (environment === 'startup' || environment === 'remote') p.adaptability += 20;
    if (problem === 'intuitive') p.adaptability += 10;

    // Conscientiousness / discipline (0-100)
    p.discipline = 50;
    if (problem === 'systematic') p.discipline += 25;
    if (environment === 'corporate' || environment === 'institution') p.discipline += 20;
    if (workstyle === 'analytical') p.discipline += 10;

    // Clamp
    Object.keys(p).forEach(function(k) {
      p[k] = Math.max(10, Math.min(95, p[k]));
    });

    return p;
  }

  function calculateSkills(workstyle, dataAff, team, resilience, problem, interests) {
    var s = {};
    // Tech skill
    s.tech = 50;
    if (interests.indexOf('IT') >= 0 || interests.indexOf('SCI') >= 0) s.tech += 25;
    if (dataAff === 'love') s.tech += 15;
    if (workstyle === 'analytical') s.tech += 10;

    // Innovation
    s.innovation = 50;
    if (workstyle === 'creative') s.innovation += 25;
    if (interests.indexOf('DESIGN') >= 0 || interests.indexOf('CULT') >= 0) s.innovation += 15;
    if (problem === 'intuitive') s.innovation += 10;

    // Communication
    s.communication = 50;
    if (workstyle === 'social') s.communication += 25;
    if (team === 'diverse' || team === 'peer') s.communication += 15;
    if (interests.indexOf('EDU') >= 0 || interests.indexOf('PUB') >= 0) s.communication += 10;
    if (team === 'solo') s.communication -= 15;

    // Management
    s.management = 50;
    if (workstyle === 'leadership') s.management += 25;
    if (resilience === 'fight') s.management += 10;
    if (interests.indexOf('PUB') >= 0) s.management += 10;

    // Learning
    s.learning = 50;
    if (resilience === 'reflect') s.learning += 20;
    if (problem === 'research') s.learning += 20;
    if (interests.indexOf('SCI') >= 0 || interests.indexOf('EDU') >= 0) s.learning += 15;

    // Industry knowledge
    s.industry = 50;
    if (interests.length >= 4) s.industry += 15;
    if (problem === 'research') s.industry += 15;
    if (dataAff === 'love') s.industry += 10;

    // Digital literacy
    s.digital = 50;
    if (interests.indexOf('IT') >= 0) s.digital += 30;
    if (dataAff === 'love') s.digital += 15;
    if (workstyle === 'analytical') s.digital += 10;

    // Cross-domain
    s.cross = 50;
    if (interests.length >= 3) s.cross += 20;
    if (team === 'diverse') s.cross += 15;
    if (resilience === 'adapt') s.cross += 10;

    // Clamp
    Object.keys(s).forEach(function(k) {
      s[k] = Math.max(10, Math.min(95, s[k]));
    });

    return s;
  }

  function findTopMatches(personality, skills, interests, location, environment) {
    // All industry definitions with: name, personality fit, salary, locations, prospect, key_skills
    var industries = [
      {
        code: 'I', name: '信息技术 / 软件服务', icon: '💻',
        pFit: ['analytical', 'creativity', 'adaptability'],
        salary: '15-50K / 月（初-高级）',
        locations: '北京、深圳、杭州、成都、上海',
        prospect: '⭐⭐⭐⭐⭐ 数字经济核心，持续高增长',
        tips: '需要持续学习，技术迭代快，适合逻辑思维强、喜欢钻研的人',
        sortKey: 0
      },
      {
        code: 'J', name: '金融业', icon: '🏦',
        pFit: ['analytical', 'discipline', 'leadership'],
        salary: '12-60K / 月（初-高级）',
        locations: '上海、北京、深圳、香港',
        prospect: '⭐⭐⭐⭐ 传统强赛道，FinTech 带来新机遇',
        tips: '对数字敏感、风险意识强的人更有优势',
        sortKey: 0
      },
      {
        code: 'P', name: '教育', icon: '📚',
        pFit: ['social', 'creativity', 'discipline'],
        salary: '8-25K / 月（K12-高校）',
        locations: '全国各地均有需求',
        prospect: '⭐⭐⭐⭐ 政策重视，在线教育转型中',
        tips: '适合有耐心、乐于分享、善于沟通的人',
        sortKey: 0
      },
      {
        code: 'M', name: '科研和技术服务业', icon: '🔬',
        pFit: ['analytical', 'creativity', 'discipline'],
        salary: '10-40K / 月（助理-研究员）',
        locations: '北京、上海、合肥、西安、武汉',
        prospect: '⭐⭐⭐⭐⭐ 国家战略重点，研发投入持续加大',
        tips: '需要深度专注和长期积累，适合追求专业深度的人',
        sortKey: 0
      },
      {
        code: 'C', name: '制造业', icon: '🏭',
        pFit: ['discipline', 'analytical', 'leadership'],
        salary: '8-30K / 月（技术员-工程师）',
        locations: '珠三角、长三角、成渝、武汉',
        prospect: '⭐⭐⭐⭐ 智能制造转型，高端制造需求旺盛',
        tips: '适合喜欢实操、动手能力强、追求稳定的人',
        sortKey: 0
      },
      {
        code: 'Q', name: '卫生和社会工作', icon: '🏥',
        pFit: ['social', 'discipline', 'adaptability'],
        salary: '8-35K / 月（初级-主任医师）',
        locations: '全国各地均有需求',
        prospect: '⭐⭐⭐⭐⭐ 老龄化社会刚需，大健康产业爆发',
        tips: '适合有同理心、抗压能力强、注重细节的人',
        sortKey: 0
      },
      {
        code: 'R', name: '文化/体育和娱乐业', icon: '🎭',
        pFit: ['creativity', 'social', 'adaptability'],
        salary: '6-30K / 月（新人-资深）',
        locations: '北京、上海、长沙、杭州、成都',
        prospect: '⭐⭐⭐⭐ 内容经济+数字文创蓬勃发展',
        tips: '适合创意丰富、表达能力强、紧跟潮流的人',
        sortKey: 0
      },
      {
        code: 'S', name: '公共管理/社会组织', icon: '🏛️',
        pFit: ['leadership', 'social', 'discipline'],
        salary: '6-20K / 月（基层-处级）',
        locations: '各省会城市及地级市',
        prospect: '⭐⭐⭐ 稳定但晋升周期长，公共服务价值高',
        tips: '适合有责任感、善于协调、追求稳定的人',
        sortKey: 0
      },
      {
        code: 'G', name: '交通运输/仓储/邮政', icon: '🚚',
        pFit: ['discipline', 'adaptability', 'leadership'],
        salary: '6-20K / 月',
        locations: '沿海港口城市、物流枢纽',
        prospect: '⭐⭐⭐⭐ 电商驱动物流，智慧物流前景好',
        tips: '适合执行力强、能适应快节奏的人',
        sortKey: 0
      },
      {
        code: 'F', name: '批发和零售业', icon: '🛒',
        pFit: ['social', 'adaptability', 'creativity'],
        salary: '6-25K / 月',
        locations: '一二线城市为主',
        prospect: '⭐⭐⭐⭐ 新零售+直播电商带来新增长',
        tips: '适合善于沟通、商业嗅觉敏锐的人',
        sortKey: 0
      },
      {
        code: 'E', name: '建筑业', icon: '🏗️',
        pFit: ['discipline', 'leadership', 'analytical'],
        salary: '8-25K / 月',
        locations: '全国各地，项目制为主',
        prospect: '⭐⭐⭐ 基建放缓但城市更新需求仍在',
        tips: '适合动手能力强、能适应项目制的人',
        sortKey: 0
      },
      {
        code: 'A', name: '农/林/牧/渔业', icon: '🌾',
        pFit: ['discipline', 'adaptability', 'analytical'],
        salary: '5-20K / 月',
        locations: '农业大省为主',
        prospect: '⭐⭐⭐⭐ 智慧农业+乡村振兴政策利好',
        tips: '现代农业需要科技赋能，懂技术的新型农人需求大',
        sortKey: 0
      }
    ];

    // Filter by interests
    var interestMap = {
      'IT': 'I', 'FIN': 'J', 'EDU': 'P', 'SCI': 'M', 'MFG': 'C',
      'MED': 'Q', 'CULT': 'R', 'PUB': 'S', 'TRAN': 'G', 'ECOMM': 'F',
      'CONS': 'E', 'AGRI': 'A', 'ENV': 'N', 'ENER': 'D', 'DESIGN': 'R', 'LAW': 'S'
    };

    // Calculate match score for each industry
    industries.forEach(function(ind) {
      var score = 0;
      // Personality fit
      ind.pFit.forEach(function(trait) {
        score += (personality[trait] || 50);
      });
      score /= ind.pFit.length;

      // Interest boost
      Object.keys(interestMap).forEach(function(ik) {
        if (interests.indexOf(ik) >= 0 && interestMap[ik] === ind.code) {
          score += 20;
        }
      });

      // Location bonus
      if (location === 'flexible') score += 5;

      // Environment bonus
      if (environment === 'startup' && (ind.code === 'I' || ind.code === 'R')) score += 8;
      if (environment === 'institution' && (ind.code === 'P' || ind.code === 'M' || ind.code === 'S' || ind.code === 'Q')) score += 8;
      if (environment === 'corporate' && (ind.code === 'J' || ind.code === 'C')) score += 8;
      if (environment === 'field' && (ind.code === 'A' || ind.code === 'E' || ind.code === 'G')) score += 8;

      ind.sortKey = score;
    });

    // Sort and take top 3
    industries.sort(function(a, b) { return b.sortKey - a.sortKey; });
    return industries.slice(0, 3);
  }

  // ============================================================
  // Display Results
  // ============================================================
  function showResults(results) {
    var resultContent = document.getElementById('result-content');
    var typingIndicator = document.querySelector('.typing-indicator');

    // Personality bars
    var pbContainer = document.getElementById('personality-bars');
    var pLabels = {
      analytical: '分析思维',
      creativity: '创造力',
      social: '社交沟通',
      leadership: '领导力',
      adaptability: '适应力',
      discipline: '严谨自律'
    };
    var pColors = ['#0284c7', '#7c3aed', '#059669', '#ea580c', '#0891b2', '#4f46e5'];
    var pIdx = 0;
    var pHtml = '';
    Object.keys(pLabels).forEach(function(k) {
      var v = results.personality[k];
      pHtml += '<div class="p-bar-row">' +
        '<div class="p-bar-label"><span>' + pLabels[k] + '</span><span style="color:' + pColors[pIdx] + '">' + v + '</span></div>' +
        '<div class="p-bar-track"><div class="p-bar-fill" style="width:0%;background:' + pColors[pIdx] + '" data-target="' + v + '"></div></div>' +
        '</div>';
      pIdx++;
    });
    pbContainer.innerHTML = pHtml;

    // Match cards
    var cardsContainer = document.getElementById('result-cards');
    var cardsHtml = '';
    results.matches.forEach(function(m, i) {
      var cls = i === 0 ? ' top' : '';
      cardsHtml += '<div class="result-card' + cls + '">' +
        '<h4>' + m.icon + ' ' + m.name + (i === 0 ? ' <span style="font-size:.7rem;background:#0284c7;color:#fff;padding:2px 8px;border-radius:999px;">最佳匹配</span>' : '') + '</h4>' +
        '<div class="info-row"><span class="lbl">💼 薪资范围</span><span class="val">' + m.salary + '</span></div>' +
        '<div class="info-row"><span class="lbl">📍 主要城市</span><span class="val">' + m.locations + '</span></div>' +
        '<div class="info-row"><span class="lbl">📈 发展前景</span><span class="val">' + m.prospect + '</span></div>' +
        '<div class="info-row"><span class="lbl">💡 适合人群</span><span class="val" style="font-size:.78rem;">' + m.tips + '</span></div>' +
        '</div>';
    });
    cardsContainer.innerHTML = cardsHtml;

    // Fade out typing
    if (typingIndicator) typingIndicator.style.display = 'none';
    resultContent.style.display = 'block';

    // Animate personality bars
    setTimeout(function() {
      var bars = document.querySelectorAll('.p-bar-fill');
      bars.forEach(function(bar) {
        var target = bar.getAttribute('data-target');
        bar.style.width = target + '%';
      });
    }, 200);

    // Store results on window for charts to access
    window.__analysisResults = results;
  }

  // ============================================================
  // Apply to Charts
  // ============================================================
  window.applyToCharts = function() {
    var results = window.__analysisResults;
    if (!results) return;

    // Set sliders
    var skillMap = {
      'tech': results.skills.tech,
      'innov': results.skills.innovation,
      'comm': results.skills.communication,
      'mgmt': results.skills.management,
      'learn': results.skills.learning,
      'know': results.skills.industry,
      'digi': results.skills.digital,
      'cross': results.skills.cross
    };

    Object.keys(skillMap).forEach(function(k) {
      var slider = document.getElementById('slider-' + k);
      if (slider) slider.value = Math.round(skillMap[k]);
    });

    // Close modal
    closeQuestionnaire();

    // Scroll to assessment section
    setTimeout(function() {
      var el = document.getElementById('assessment');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);

    // Trigger radar and heatmap update
    if (typeof window.updateRadar === 'function') {
      setTimeout(function() { window.updateRadar(); }, 400);
    }
    if (typeof window.updateHeatmapWithIndustry === 'function') {
      var topMatchCodes = results.matches.map(function(m) { return m.code; });
      setTimeout(function() { window.updateHeatmapWithIndustry(topMatchCodes); }, 500);
    }
  };

  // ============================================================
  // Open / Close modal
  // ============================================================
  window.openQuestionnaire = function() {
    var modal = document.getElementById('questionnaire-modal');
    if (modal) {
      modal.classList.add('active');
      currentStep = 0;
      isAnalyzing = false;
      ANSWERS = {};
      // Reset all
      document.querySelectorAll('.q-option.selected').forEach(function(o) { o.classList.remove('selected'); });
      document.querySelectorAll('.q-tag.picked').forEach(function(t) { t.classList.remove('picked'); });
      var nameInp = document.getElementById('q-name-input');
      if (nameInp) nameInp.value = '';
      var dreamInp = document.getElementById('q-dream-input');
      if (dreamInp) dreamInp.value = '';
      document.getElementById('result-content').style.display = 'none';
      document.querySelector('.typing-indicator').style.display = 'flex';
      document.getElementById('result-panel').classList.remove('active');
      document.getElementById('q-body').style.display = '';
      document.querySelector('.q-nav').style.display = '';
      updateUI();
    }
  };

  window.closeQuestionnaire = function() {
    var modal = document.getElementById('questionnaire-modal');
    if (modal) modal.classList.remove('active');
    // Stop voice if active
    if (recognition) {
      recognition.stop();
    }
  };

  // Close on overlay click
  document.addEventListener('click', function(e) {
    if (e.target.id === 'questionnaire-modal') {
      closeQuestionnaire();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    var modal = document.getElementById('questionnaire-modal');
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') { closeQuestionnaire(); return; }
    if (isAnalyzing) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      nextStep();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevStep();
    }
  });

})();
