// Parent Report
function showReport() {
  const log = AppData.emotionLog;
  const now = Date.now();
  const weekLog = log.filter(e => now - e.ts < 7 * 24 * 3600 * 1000);

  const counts = {};
  const emotionDefs = [
    { name:'开心', emoji:'😊', color:'#639922' },
    { name:'难过', emoji:'😭', color:'#378ADD' },
    { name:'生气', emoji:'😡', color:'#D85A30' },
    { name:'害怕', emoji:'😨', color:'#D4537E' },
    { name:'累了', emoji:'😴', color:'#BA7517' },
    { name:'困惑', emoji:'😕', color:'#7F77DD' }
  ];
  emotionDefs.forEach(e => counts[e.name] = 0);
  weekLog.forEach(e => { if (counts[e.name] !== undefined) counts[e.name]++; });

  const total = weekLog.length;
  const maxCount = Math.max(...Object.values(counts), 1);
  const stars = AppData.totalStars;

  const topEmotion = emotionDefs.reduce((a, b) => counts[a.name] > counts[b.name] ? a : b);
  const summary = total === 0
    ? '本周还没有训练记录，快来开始吧！'
    : `本周共完成 ${total} 次情绪表达训练，累计获得 ${stars} 颗星星。${
        counts['开心'] > 2 ? '孩子本周心情较好，积极情绪明显。' : ''
      }${
        counts['难过'] > 2 ? '本周有较多难过情绪，建议多给予关爱与陪伴。' : ''
      } 持续坚持，孩子的表达能力会越来越好！`;

  document.getElementById('report-card').innerHTML = `
    <h2 class="report-title">📊 家长成长报告</h2>
    <p class="report-sub">本周情绪表达训练数据 · 累计 ${stars} 颗星星</p>

    <div style="margin-bottom:16px">
      <div style="font-size:14px;font-weight:600;color:#1a1a2e;margin-bottom:12px">本周情绪分布</div>
      <div class="emotion-stat-row">
        ${emotionDefs.map(e => `
          <div class="emotion-stat">
            <span class="emotion-stat-emoji">${e.emoji}</span>
            <span class="stat-label">${e.name}</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar" style="width:${Math.round((counts[e.name]/maxCount)*100)}%;background:${e.color}"></div>
            </div>
            <span class="stat-count">${counts[e.name]}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:#EAF3DE;border-radius:12px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:700;color:#3B6D11">${total}</div>
        <div style="font-size:12px;color:#5F5E5A">本周训练次数</div>
      </div>
      <div style="background:#E6F1FB;border-radius:12px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:700;color:#185FA5">${stars}</div>
        <div style="font-size:12px;color:#5F5E5A">累计星星数</div>
      </div>
    </div>

    <div class="report-summary">${summary}</div>

    <button class="btn-primary" style="margin-top:20px" onclick="closeReportBtn()">关闭报告</button>
  `;

  document.getElementById('report-modal').classList.add('open');
}

function closeReport(e) {
  if (e.target === document.getElementById('report-modal')) {
    document.getElementById('report-modal').classList.remove('open');
  }
}

function closeReportBtn() {
  document.getElementById('report-modal').classList.remove('open');
}
