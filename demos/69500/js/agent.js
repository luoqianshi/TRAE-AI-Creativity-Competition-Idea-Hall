/**
 * AI Agent 决策引擎
 * 任务完成后主动分析环境，做出决策，推送消息，动态调整路线
 */
var QuestAgent = (function () {

  // === Agent 人格 ===
  var AGENT_NAME = '探险向导';
  var AGENT_AVATAR = '🧭';

  // === 决策规则库 ===
  var DECISION_RULES = [
    {
      id: 'weather_shift',
      condition: function (ctx) {
        return ctx.weather === 'rainy' && ctx.completedCount >= 1 && ctx.remainingCount >= 2;
      },
      priority: 8,
      decision: function (ctx) {
        return {
          action: 'reorder',
          moveTaskFrom: ctx.completedCount + 2,
          moveTaskTo: ctx.completedCount + 1,
          reason: '下雨了，室外任务体验会打折扣。我检测到下一站是室外点位，但再下一站有室内替代——我把室内任务提前。',
          messages: [
            { type: 'observe', text: '你已经完成第' + ctx.completedCount + '站，做得不错。' },
            { type: 'analyze', text: '我注意到当前正在下雨，室外任务的体验会受到影响。' },
            { type: 'decide', text: '我把第' + (ctx.completedCount + 2) + '站提前——那是一个室内点位，更适合现在的天气。路线已自动调整。' }
          ]
        };
      }
    },
    {
      id: 'time_pressure',
      condition: function (ctx) {
        return ctx.timeSlot === 'night' && ctx.completedCount >= 1 && ctx.remainingCount >= 2;
      },
      priority: 7,
      decision: function (ctx) {
        return {
          action: 'reorder',
          moveTaskFrom: ctx.completedCount + 2,
          moveTaskTo: ctx.completedCount + 1,
          reason: '天色已晚，我优先安排光线较好的点位。',
          messages: [
            { type: 'observe', text: '第' + ctx.completedCount + '站完成。夜幕降临了。' },
            { type: 'analyze', text: '夜间拍照和观察任务效果较差，但有些点位在夜晚反而更有氛围。' },
            { type: 'decide', text: '我把下一站换成夜间氛围更佳的点位，让你的体验不打折。' }
          ]
        };
      }
    },
    {
      id: 'energy_drop',
      condition: function (ctx) {
        return ctx.completedCount >= 2 && ctx.energy === 'relaxed' && ctx.remainingCount >= 2;
      },
      priority: 6,
      decision: function (ctx) {
        return {
          action: 'skip_optional',
          skipTaskSeq: ctx.completedCount + 1,
          reason: '你的体力设置为"轻松"，已完成2站后体力可能下降。我跳过可选任务，保留精华站点。',
          messages: [
            { type: 'observe', text: '已经走了' + ctx.completedCount + '站了，辛苦了。' },
            { type: 'analyze', text: '考虑到你选择了轻松节奏，接下来的任务中有一个是可选项。' },
            { type: 'decide', text: '我帮你跳过那个可选任务，直接前往精华站点。少走一段路，体验不减。' }
          ]
        };
      }
    },
    {
      id: 'poi_type_balance',
      condition: function (ctx) {
        if (ctx.remainingCount < 2) return false;
        var completed = ctx.completedTypes;
        var nextTwo = ctx.nextTwoTypes;
        // 如果接下来两个是同类型，调整
        return nextTwo[0] === nextTwo[1];
      },
      priority: 5,
      decision: function (ctx) {
        return {
          action: 'reorder',
          moveTaskFrom: ctx.completedCount + 2,
          moveTaskTo: ctx.completedCount + 1,
          reason: '接下来两个任务类型相同，我调整顺序让体验更多样。',
          messages: [
            { type: 'observe', text: '第' + ctx.completedCount + '站完成。' },
            { type: 'analyze', text: '我分析了一下后续路线，发现接下来两站的类型比较相似。' },
            { type: 'decide', text: '我把顺序调整了一下，让你的探险体验更加丰富多样。' }
          ]
        };
      }
    },
    {
      id: 'story_twist',
      condition: function (ctx) {
        return ctx.completedCount === Math.floor(ctx.totalCount / 2);
      },
      priority: 9,
      decision: function (ctx) {
        return {
          action: 'narrative_only',
          reason: '故事中点转折',
          messages: [
            { type: 'observe', text: '你已经走完了一半的旅程。' },
            { type: 'analyze', text: '回顾你收集到的碎片，我发现了一条隐藏的线索——' },
            { type: 'reveal', text: '这些碎片的排列方式指向一个你意想不到的真相。继续前进，答案就在前方。' }
          ]
        };
      }
    },
    {
      id: 'crowd_prediction',
      condition: function (ctx) {
        return ctx.timeSlot === 'day' && ctx.weather === 'sunny' && ctx.completedCount >= 1 && ctx.remainingCount >= 2;
      },
      priority: 4,
      decision: function (ctx) {
        return {
          action: 'narrative_only',
          reason: '人流预测提示',
          messages: [
            { type: 'observe', text: '第' + ctx.completedCount + '站完成。' },
            { type: 'analyze', text: '晴朗白天，热门景点人流正在增加。' },
            { type: 'decide', text: '建议加快步伐，或先前往人流较少的次要站点。路线不变，但注意时间。' }
          ]
        };
      }
    },
    {
      id: 'final_approach',
      condition: function (ctx) {
        return ctx.remainingCount === 1;
      },
      priority: 3,
      decision: function (ctx) {
        return {
          action: 'narrative_only',
          reason: '终点提示',
          messages: [
            { type: 'observe', text: '只剩最后一站了！' },
            { type: 'analyze', text: '所有碎片即将拼合，故事的真相呼之欲出。' },
            { type: 'decide', text: '前往终点，揭开最后的谜底。' }
          ]
        };
      }
    }
  ];

  // === 上下文构建 ===
  function buildContext(completedSeq, quest, appState) {
    var tasks = quest.tasks;
    var completedCount = 0;
    var completedTypes = [];

    tasks.forEach(function (t) {
      if (t.seq < completedSeq) {
        completedCount++;
        completedTypes.push(t.poiType);
      }
    });

    var remaining = tasks.filter(function (t) { return t.seq >= completedSeq; });
    var remainingCount = remaining.length;
    var nextTwoTypes = remaining.slice(0, 2).map(function (t) { return t.poiType; });

    return {
      completedCount: completedCount,
      remainingCount: remainingCount,
      totalCount: tasks.length,
      completedTypes: completedTypes,
      nextTwoTypes: nextTwoTypes,
      weather: appState.weather || 'sunny',
      timeSlot: appState.timeSlot || 'day',
      energy: appState.energy || 'normal',
      party: appState.party || 'solo',
      theme: appState.theme || 'culture',
      currentSeq: completedSeq
    };
  }

  // === 决策评估 ===
  function evaluate(ctx) {
    var candidates = DECISION_RULES.filter(function (rule) {
      try {
        return rule.condition(ctx);
      } catch (e) {
        return false;
      }
    });

    if (candidates.length === 0) return null;

    // 按优先级排序，取最高
    candidates.sort(function (a, b) { return b.priority - a.priority; });

    // 同优先级随机选一个
    var topPriority = candidates[0].priority;
    var samePriority = candidates.filter(function (r) { return r.priority === topPriority; });
    var chosen = samePriority[Math.floor(Math.random() * samePriority.length)];

    // 防止重复触发同类型决策
    if (lastDecisionId === chosen.id) return null;
    lastDecisionId = chosen.id;

    return chosen.decision(ctx);
  }

  var lastDecisionId = null;

  // === 消息推送系统 ===
  function pushMessages(messages, onComplete) {
    var chatBox = document.getElementById('agent-chat');
    if (!chatBox) {
      // 创建聊天框
      chatBox = createChatBox();
    }

    chatBox.classList.add('show');
    var messageList = chatBox.querySelector('.agent-messages');
    messageList.innerHTML = '';

    var idx = 0;
    function pushNext() {
      if (idx >= messages.length) {
        // 全部消息推送完毕
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
        return;
      }

      var msg = messages[idx];
      var bubble = document.createElement('div');
      bubble.className = 'agent-bubble agent-typing';
      bubble.innerHTML =
        '<div class="agent-avatar">' + AGENT_AVATAR + '</div>' +
        '<div class="agent-bubble-content">' +
          '<div class="agent-name">' + AGENT_NAME + '</div>' +
          '<div class="agent-text"></div>' +
        '</div>';

      messageList.appendChild(bubble);
      chatBox.scrollTop = chatBox.scrollHeight;

      // 打字机效果
      var textEl = bubble.querySelector('.agent-text');
      var fullText = msg.text;
      var charIdx = 0;
      var typeSpeed = 25;

      // 根据消息类型调整样式
      if (msg.type === 'decide') {
        bubble.classList.add('agent-decide');
      } else if (msg.type === 'reveal') {
        bubble.classList.add('agent-reveal');
      }

      function typeNext() {
        if (charIdx < fullText.length) {
          textEl.textContent = fullText.substring(0, charIdx + 1);
          charIdx++;
          chatBox.scrollTop = chatBox.scrollHeight;
          setTimeout(typeNext, typeSpeed);
        } else {
          bubble.classList.remove('agent-typing');
          idx++;
          setTimeout(pushNext, 600);
        }
      }

      // 短暂延迟后开始打字
      setTimeout(typeNext, 200);
    }

    pushNext();
  }

  function createChatBox() {
    var box = document.createElement('div');
    box.id = 'agent-chat';
    box.className = 'agent-chat';
    box.innerHTML =
      '<div class="agent-header">' +
        '<span class="agent-header-avatar">' + AGENT_AVATAR + '</span>' +
        '<span class="agent-header-name">' + AGENT_NAME + '</span>' +
        '<button class="agent-close" onclick="document.getElementById(\'agent-chat\').classList.remove(\'show\')">×</button>' +
      '</div>' +
      '<div class="agent-messages"></div>';
    document.body.appendChild(box);
    return box;
  }

  // === 主入口：任务完成后触发 ===
  function onTaskCompleted(completedSeq, quest, appState, callbacks) {
    var ctx = buildContext(completedSeq, quest, appState);
    var decision = evaluate(ctx);

    if (!decision) {
      // 无决策，直接回调继续
      if (callbacks && callbacks.onNoAction) callbacks.onNoAction();
      return;
    }

    // 推送消息
    pushMessages(decision.messages, function () {
      if (decision.action === 'reorder' && callbacks && callbacks.onReorder) {
        callbacks.onReorder(decision, ctx);
      } else if (decision.action === 'skip_optional' && callbacks && callbacks.onSkip) {
        callbacks.onSkip(decision, ctx);
      } else if (decision.action === 'narrative_only' && callbacks && callbacks.onNarrative) {
        callbacks.onNarrative(decision, ctx);
      } else {
        if (callbacks && callbacks.onNoAction) callbacks.onNoAction();
      }
    });
  }

  // === 重置 ===
  function reset() {
    lastDecisionId = null;
    var chatBox = document.getElementById('agent-chat');
    if (chatBox) {
      chatBox.classList.remove('show');
    }
  }

  return {
    onTaskCompleted: onTaskCompleted,
    reset: reset,
    pushMessages: pushMessages
  };
})();
