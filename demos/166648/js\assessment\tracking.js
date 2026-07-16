// ========== 微测评追踪机制模块 ==========

const RETRACK_INTERVALS = {
  riasec: 90, anchor: 120, big5: 180, mbti: 180, disc: 90, gallup: 180
};

const RETRACK_MESSAGES = {
  within: '✓ 近期已完成，无需复测',
  warning: '⚠️ 建议关注，可考虑复测',
  overdue: '🔔 建议尽快复测，追踪变化',
  never: '尚未完成该测评'
};

function saveAssessmentHistory(assessmentId, results) {
  const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
  history.push({
    assessmentId,
    timestamp: new Date().toISOString(),
    results,
    version: 'v2.0'
  });
  localStorage.setItem('assessmentHistory', JSON.stringify(history));
}

function getAssessmentHistory(assessmentId) {
  const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
  return history.filter(h => h.assessmentId === assessmentId).sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
}

function getLastAssessmentDate(assessmentId) {
  const history = getAssessmentHistory(assessmentId);
  if (history.length === 0) return null;
  return new Date(history[0].timestamp);
}

function getRetrackStatus(assessmentId) {
  const lastDate = getLastAssessmentDate(assessmentId);
  if (!lastDate) return { status: 'never', days: null, message: RETRACK_MESSAGES.never };

  const now = new Date();
  const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  const interval = RETRACK_INTERVALS[assessmentId] || 90;

  let status, message;
  if (daysDiff < interval / 2) {
    status = 'within';
    message = RETRACK_MESSAGES.within;
  } else if (daysDiff < interval) {
    status = 'warning';
    message = `${RETRACK_MESSAGES.warning} (${daysDiff}天前)`;
  } else {
    status = 'overdue';
    message = `${RETRACK_MESSAGES.overdue} (${daysDiff}天前)`;
  }

  return { status, days: daysDiff, message };
}

function calculateTrendChange(assessmentId) {
  const history = getAssessmentHistory(assessmentId);
  if (history.length < 2) return null;

  const recent = history[0].results;
  const previous = history[1].results;

  const changes = {};
  let totalChange = 0;
  let count = 0;

  if (assessmentId === 'riasec' && recent.scores && previous.scores) {
    Object.keys(recent.scores).forEach(key => {
      const diff = recent.scores[key] - previous.scores[key];
      changes[key] = diff;
      totalChange += Math.abs(diff);
      count++;
    });
  } else if (assessmentId === 'big5' && recent.scores && previous.scores) {
    Object.keys(recent.scores).forEach(key => {
      const diff = recent.scores[key] - previous.scores[key];
      changes[key] = diff;
      totalChange += Math.abs(diff);
      count++;
    });
  } else if (assessmentId === 'disc' && recent.scores && previous.scores) {
    Object.keys(recent.scores).forEach(key => {
      const diff = recent.scores[key] - previous.scores[key];
      changes[key] = diff;
      totalChange += Math.abs(diff);
      count++;
    });
  }

  return {
    changes,
    avgChange: count > 0 ? Math.round((totalChange / count) * 10) / 10 : 0,
    trend: totalChange > 0 ? 'changing' : 'stable',
    recentDate: history[0].timestamp,
    previousDate: history[1].timestamp
  };
}

function generateTrendReport() {
  const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
  const assessmentTypes = [...new Set(history.map(h => h.assessmentId))];
  
  let report = {
    totalAssessments: history.length,
    assessmentTypes: assessmentTypes.length,
    trends: {}
  };

  assessmentTypes.forEach(type => {
    const trend = calculateTrendChange(type);
    if (trend) {
      report.trends[type] = trend;
    }
  });

  return report;
}

function renderTrendComparison() {
  const report = generateTrendReport();
  const container = document.getElementById('profileContent');
  if (!container) return;

  let html = '<div class="trend-report"><h3>📈 测评趋势对比</h3>';
  
  if (report.totalAssessments < 2) {
    html += '<div class="trend-empty"><p>完成两次以上同一测评后，可查看趋势变化分析。</p></div>';
  } else {
    html += `<div class="trend-summary">共完成 ${report.totalAssessments} 次测评，覆盖 ${report.assessmentTypes} 种类型</div>`;
    
    Object.entries(report.trends).forEach(([type, trend]) => {
      const typeNames = { riasec: '霍兰德兴趣', anchor: '职业锚', big5: '大五人格', mbti: 'MBTI', disc: 'DISC', gallup: '盖洛普优势' };
      
      html += `<div class="trend-card">`;
      html += `<div class="trend-card-header">`;
      html += `<span class="trend-icon">${getAssessmentIcon(type)}</span>`;
      html += `<h4>${typeNames[type] || type}</h4>`;
      html += `<span class="trend-status ${trend.trend}">${trend.trend === 'changing' ? '有变化' : '稳定'}</span>`;
      html += `</div>`;
      
      html += `<div class="trend-changes">`;
      Object.entries(trend.changes).forEach(([dim, diff]) => {
        const dimLabels = getDimensionLabels(type);
        const direction = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
        const color = diff > 0 ? '#0DB8A8' : diff < 0 ? '#DC5078' : '#6B6B5E';
        html += `<div class="trend-change-item">`;
        html += `<span class="trend-dim">${dimLabels[dim] || dim}</span>`;
        html += `<span class="trend-diff" style="color:${color}">${direction} ${Math.abs(diff)}</span>`;
        html += `</div>`;
      });
      html += `</div>`;
      
      html += `<div class="trend-dates">`;
      html += `<span>最近: ${formatDate(trend.recentDate)}</span>`;
      html += `<span>上次: ${formatDate(trend.previousDate)}</span>`;
      html += `</div>`;
      
      html += `</div>`;
    });
  }

  html += '</div>';
  return html;
}

function getAssessmentIcon(type) {
  const icons = { riasec: '🎯', anchor: '⚓', big5: '🧠', mbti: '🔮', disc: '💬', gallup: '⭐' };
  return icons[type] || '📊';
}

function getDimensionLabels(type) {
  if (type === 'riasec') return { R: '实用', I: '研究', A: '艺术', S: '社会', E: '企业', C: '常规' };
  if (type === 'big5') return { O: '开放', C: '尽责', E: '外向', A: '宜人', N: '神经' };
  if (type === 'disc') return { D: '支配', I: '影响', S: '稳健', C: '服从' };
  return {};
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function scheduleRetrackReminders() {
  const completed = JSON.parse(localStorage.getItem('completedAssessments') || '[]');
  const reminders = [];

  completed.forEach(id => {
    const status = getRetrackStatus(id);
    if (status.status === 'overdue') {
      reminders.push({
        assessmentId: id,
        message: status.message,
        daysSinceLast: status.days
      });
    }
  });

  localStorage.setItem('retrackReminders', JSON.stringify(reminders));
  return reminders;
}

function checkRetrackReminders() {
  const reminders = scheduleRetrackReminders();
  if (reminders.length > 0) {
    console.log('需要复测的测评:', reminders);
  }
  return reminders;
}