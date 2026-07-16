// ========== MBTI 测评模块 (93题简版) ==========

const MBTI_QUESTIONS = [
  { id: 1, text: '我更倾向于把精力集中在外部世界', dimension: 'E', reverse: false },
  { id: 2, text: '我喜欢与人交往', dimension: 'E', reverse: false },
  { id: 3, text: '我喜欢参加聚会和社交活动', dimension: 'E', reverse: false },
  { id: 4, text: '我经常需要与人交流才能感到精力充沛', dimension: 'E', reverse: false },
  { id: 5, text: '我善于表达自己的想法', dimension: 'E', reverse: false },
  { id: 6, text: '我倾向于通过思考来处理事情', dimension: 'E', reverse: true },
  { id: 7, text: '我喜欢一个人安静地工作', dimension: 'E', reverse: true },
  { id: 8, text: '我更关注内部世界的想法和感受', dimension: 'I', reverse: false },
  { id: 9, text: '我喜欢独处', dimension: 'I', reverse: false },
  { id: 10, text: '我需要时间独处来恢复精力', dimension: 'I', reverse: false },
  { id: 11, text: '我在说话之前会先思考', dimension: 'I', reverse: false },
  { id: 12, text: '我更喜欢小范围的交流', dimension: 'I', reverse: false },
  { id: 13, text: '我相信自己的直觉', dimension: 'N', reverse: false },
  { id: 14, text: '我喜欢思考抽象的概念', dimension: 'N', reverse: false },
  { id: 15, text: '我关注未来的可能性', dimension: 'N', reverse: false },
  { id: 16, text: '我喜欢寻找事物之间的联系', dimension: 'N', reverse: false },
  { id: 17, text: '我善于发现规律和模式', dimension: 'N', reverse: false },
  { id: 18, text: '我更关注具体的事实和细节', dimension: 'N', reverse: true },
  { id: 19, text: '我相信我的感官体验', dimension: 'S', reverse: false },
  { id: 20, text: '我喜欢处理实际问题', dimension: 'S', reverse: false },
  { id: 21, text: '我关注眼前的现实', dimension: 'S', reverse: false },
  { id: 22, text: '我注重细节和准确性', dimension: 'S', reverse: false },
  { id: 23, text: '我喜欢按照既定的方法做事', dimension: 'S', reverse: false },
  { id: 24, text: '我做决定时更倾向于逻辑分析', dimension: 'T', reverse: false },
  { id: 25, text: '我重视公平和公正', dimension: 'T', reverse: false },
  { id: 26, text: '我喜欢用客观标准来衡量事物', dimension: 'T', reverse: false },
  { id: 27, text: '我更关注事情的对错', dimension: 'T', reverse: false },
  { id: 28, text: '我善于分析问题', dimension: 'T', reverse: false },
  { id: 29, text: '我做决定时更倾向于考虑他人感受', dimension: 'T', reverse: true },
  { id: 30, text: '我做决定时更关注个人价值观', dimension: 'F', reverse: false },
  { id: 31, text: '我重视和谐与关系', dimension: 'F', reverse: false },
  { id: 32, text: '我喜欢用主观标准来衡量事物', dimension: 'F', reverse: false },
  { id: 33, text: '我更关注事情对人的影响', dimension: 'F', reverse: false },
  { id: 34, text: '我善于理解他人的需求', dimension: 'F', reverse: false },
  { id: 35, text: '我喜欢有计划、有条理的生活', dimension: 'J', reverse: false },
  { id: 36, text: '我喜欢提前做计划', dimension: 'J', reverse: false },
  { id: 37, text: '我喜欢事情有确定性', dimension: 'J', reverse: false },
  { id: 38, text: '我善于组织和管理', dimension: 'J', reverse: false },
  { id: 39, text: '我倾向于快速做出决定', dimension: 'J', reverse: false },
  { id: 40, text: '我喜欢灵活、随性的生活', dimension: 'J', reverse: true },
  { id: 41, text: '我喜欢保持开放和灵活', dimension: 'P', reverse: false },
  { id: 42, text: '我喜欢事情有多种可能性', dimension: 'P', reverse: false },
  { id: 43, text: '我善于适应变化', dimension: 'P', reverse: false },
  { id: 44, text: '我倾向于推迟做决定', dimension: 'P', reverse: false },
  { id: 45, text: '我喜欢即兴发挥', dimension: 'P', reverse: false },
  { id: 46, text: '我喜欢成为关注的焦点', dimension: 'E', reverse: false },
  { id: 47, text: '我喜欢与人讨论想法', dimension: 'E', reverse: false },
  { id: 48, text: '我善于社交', dimension: 'E', reverse: false },
  { id: 49, text: '我喜欢在团队中工作', dimension: 'E', reverse: false },
  { id: 50, text: '我喜欢公开演讲', dimension: 'E', reverse: false },
  { id: 51, text: '我喜欢独立工作', dimension: 'I', reverse: false },
  { id: 52, text: '我善于倾听', dimension: 'I', reverse: false },
  { id: 53, text: '我喜欢深入思考', dimension: 'I', reverse: false },
  { id: 54, text: '我不太喜欢成为焦点', dimension: 'I', reverse: false },
  { id: 55, text: '我喜欢安静的环境', dimension: 'I', reverse: false },
  { id: 56, text: '我喜欢想象和创造', dimension: 'N', reverse: false },
  { id: 57, text: '我喜欢探索新想法', dimension: 'N', reverse: false },
  { id: 58, text: '我关注大局和整体', dimension: 'N', reverse: false },
  { id: 59, text: '我喜欢创新和改变', dimension: 'N', reverse: false },
  { id: 60, text: '我喜欢哲学思考', dimension: 'N', reverse: false },
  { id: 61, text: '我喜欢具体的例子', dimension: 'S', reverse: false },
  { id: 62, text: '我喜欢实际的应用', dimension: 'S', reverse: false },
  { id: 63, text: '我关注细节和事实', dimension: 'S', reverse: false },
  { id: 64, text: '我喜欢传统和稳定', dimension: 'S', reverse: false },
  { id: 65, text: '我喜欢可验证的信息', dimension: 'S', reverse: false },
  { id: 66, text: '我善于逻辑推理', dimension: 'T', reverse: false },
  { id: 67, text: '我重视效率和效果', dimension: 'T', reverse: false },
  { id: 68, text: '我喜欢辩论和讨论', dimension: 'T', reverse: false },
  { id: 69, text: '我善于解决问题', dimension: 'T', reverse: false },
  { id: 70, text: '我重视原则和标准', dimension: 'T', reverse: false },
  { id: 71, text: '我善于共情', dimension: 'F', reverse: false },
  { id: 72, text: '我重视感受和情感', dimension: 'F', reverse: false },
  { id: 73, text: '我喜欢合作和支持', dimension: 'F', reverse: false },
  { id: 74, text: '我善于调解冲突', dimension: 'F', reverse: false },
  { id: 75, text: '我重视人际和谐', dimension: 'F', reverse: false },
  { id: 76, text: '我喜欢按计划执行', dimension: 'J', reverse: false },
  { id: 77, text: '我喜欢设定目标', dimension: 'J', reverse: false },
  { id: 78, text: '我喜欢完成任务', dimension: 'J', reverse: false },
  { id: 79, text: '我喜欢有序的环境', dimension: 'J', reverse: false },
  { id: 80, text: '我喜欢遵守规则', dimension: 'J', reverse: false },
  { id: 81, text: '我喜欢保持选择开放', dimension: 'P', reverse: false },
  { id: 82, text: '我喜欢随遇而安', dimension: 'P', reverse: false },
  { id: 83, text: '我喜欢探索多种可能性', dimension: 'P', reverse: false },
  { id: 84, text: '我喜欢灵活的安排', dimension: 'P', reverse: false },
  { id: 85, text: '我喜欢自由和自主', dimension: 'P', reverse: false },
  { id: 86, text: '我喜欢与人合作完成任务', dimension: 'E', reverse: false },
  { id: 87, text: '我喜欢通过实践来学习', dimension: 'S', reverse: false },
  { id: 88, text: '我喜欢通过思考来学习', dimension: 'N', reverse: false },
  { id: 89, text: '我喜欢按照自己的价值观做事', dimension: 'F', reverse: false },
  { id: 90, text: '我喜欢按照客观标准做事', dimension: 'T', reverse: false },
  { id: 91, text: '我喜欢有明确的截止日期', dimension: 'J', reverse: false },
  { id: 92, text: '我喜欢没有压力的工作', dimension: 'P', reverse: false },
  { id: 93, text: '我喜欢在截止日期前完成', dimension: 'J', reverse: false }
];

let mbtiIndex = 0;
let mbtiAnswers = [];

const MBTI_TYPE_DESCRIPTIONS = {
  'INTJ': '建筑师型 - 富有想象力和战略性，善于规划和执行',
  'INTP': '逻辑学家型 - 好奇、分析，善于思考复杂问题',
  'ENTJ': '指挥官型 - 果断、自信，善于领导和决策',
  'ENTP': '辩论家型 - 机智、创新，善于挑战和探索',
  'INFJ': '提倡者型 - 富有洞察力和创造力，关注他人福祉',
  'INFP': '调停者型 - 理想主义、敏感，善于理解他人',
  'ENFJ': '主人公型 - 热情、有说服力，善于激励他人',
  'ENFP': '竞选者型 - 热情、好奇，善于与人交往和创新',
  'ISTJ': '物流师型 - 可靠、务实，善于组织和执行',
  'ISFJ': '守卫者型 - 热心、负责，善于保护和照顾他人',
  'ESTJ': '总经理型 - 务实、果断，善于管理和控制',
  'ESFJ': '执政官型 - 热情、友好，善于与人相处',
  'ISTP': '鉴赏家型 - 灵活、务实，善于解决实际问题',
  'ISFP': '探险家型 - 敏感、灵活，善于体验和创造',
  'ESTP': '企业家型 - 精力充沛、果断，善于行动和冒险',
  'ESFP': '表演者型 - 热情、活泼，善于娱乐和社交'
};

function startMBTI() {
  mbtiIndex = 0;
  mbtiAnswers = [];
  renderMBTIQuestion();
  navigateTo('assessment');
}

function renderMBTIQuestion() {
  const container = document.getElementById('assessmentContent');
  if (!container) return;

  const question = MBTI_QUESTIONS[mbtiIndex];
  const progress = ((mbtiIndex + 1) / MBTI_QUESTIONS.length) * 100;

  container.innerHTML = `
    <div class="assessment-header">
      <div class="assessment-progress-bar">
        <div class="assessment-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="assessment-progress-text">${mbtiIndex + 1} / ${MBTI_QUESTIONS.length}</div>
      <h2>MBTI 性格测评</h2>
      <p class="assessment-subtitle">请根据你的实际情况选择答案</p>
    </div>

    <div class="question-card">
      <div class="question-text">${question.text}</div>
      <div class="question-options">
        <button class="option-btn" onclick="answerMBTI(1)">非常不符合</button>
        <button class="option-btn" onclick="answerMBTI(2)">不符合</button>
        <button class="option-btn" onclick="answerMBTI(3)">一般</button>
        <button class="option-btn" onclick="answerMBTI(4)">符合</button>
        <button class="option-btn" onclick="answerMBTI(5)">非常符合</button>
      </div>
    </div>

    <div class="assessment-footer">
      <button class="btn-secondary" onclick="navigateTo('assessment-guide')">退出测评</button>
    </div>
  `;
}

function answerMBTI(score) {
  const question = MBTI_QUESTIONS[mbtiIndex];
  mbtiAnswers.push({
    questionId: question.id,
    dimension: question.dimension,
    score: question.reverse ? (6 - score) : score
  });

  mbtiIndex++;
  if (mbtiIndex < MBTI_QUESTIONS.length) {
    renderMBTIQuestion();
  } else {
    calculateMBTIResults();
  }
}

function calculateMBTIResults() {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  mbtiAnswers.forEach(a => {
    scores[a.dimension] += a.score;
    counts[a.dimension]++;
  });

  const type = '';
  type += scores.E >= scores.I ? 'E' : 'I';
  type += scores.S >= scores.N ? 'S' : 'N';
  type += scores.T >= scores.F ? 'T' : 'F';
  type += scores.J >= scores.P ? 'J' : 'P';

  const percentages = {
    E: Math.round((scores.E / (scores.E + scores.I)) * 100),
    S: Math.round((scores.S / (scores.S + scores.N)) * 100),
    T: Math.round((scores.T / (scores.T + scores.F)) * 100),
    J: Math.round((scores.J / (scores.J + scores.P)) * 100)
  };

  localStorage.setItem('mbtiType', type);
  localStorage.setItem('mbtiScores', JSON.stringify(percentages));
  markAssessmentCompleted('mbti');

  showMBTIResults(type, percentages);
}

function showMBTIResults(type, percentages) {
  const container = document.getElementById('assessmentContent');
  if (!container) return;

  const desc = MBTI_TYPE_DESCRIPTIONS[type] || '未找到描述';

  container.innerHTML = `
    <div class="result-header">
      <h2>MBTI 测评结果</h2>
      <p>你的性格类型</p>
    </div>

    <div class="mbti-type-card">
      <div class="mbti-type-badge">${type}</div>
      <div class="mbti-type-desc">${desc}</div>
    </div>

    <div class="result-grid">
      <div class="result-card">
        <div class="result-card-header">
          <span class="result-card-icon">🔋</span>
          <h4>能量来源</h4>
        </div>
        <div class="result-card-body">
          <div class="mbti-dimension">
            <div class="mbti-dim-labels">
              <span>内向 (I)</span>
              <span>外向 (E)</span>
            </div>
            <div class="mbti-bar">
              <div class="mbti-bar-fill" style="width:${100 - percentages.E}%;background:#4E46DC"></div>
              <div class="mbti-bar-fill" style="width:${percentages.E}%;background:#0DB8A8"></div>
            </div>
            <div class="mbti-result">${percentages.E >= 50 ? '外向型' : '内向型'}</div>
          </div>
        </div>
      </div>

      <div class="result-card">
        <div class="result-card-header">
          <span class="result-card-icon">👁️</span>
          <h4>认知方式</h4>
        </div>
        <div class="result-card-body">
          <div class="mbti-dimension">
            <div class="mbti-dim-labels">
              <span>感觉 (S)</span>
              <span>直觉 (N)</span>
            </div>
            <div class="mbti-bar">
              <div class="mbti-bar-fill" style="width:${percentages.S}%;background:#4E46DC"></div>
              <div class="mbti-bar-fill" style="width:${100 - percentages.S}%;background:#0DB8A8"></div>
            </div>
            <div class="mbti-result">${percentages.S >= 50 ? '感觉型' : '直觉型'}</div>
          </div>
        </div>
      </div>

      <div class="result-card">
        <div class="result-card-header">
          <span class="result-card-icon">⚖️</span>
          <h4>决策方式</h4>
        </div>
        <div class="result-card-body">
          <div class="mbti-dimension">
            <div class="mbti-dim-labels">
              <span>情感 (F)</span>
              <span>思维 (T)</span>
            </div>
            <div class="mbti-bar">
              <div class="mbti-bar-fill" style="width:${100 - percentages.T}%;background:#4E46DC"></div>
              <div class="mbti-bar-fill" style="width:${percentages.T}%;background:#0DB8A8"></div>
            </div>
            <div class="mbti-result">${percentages.T >= 50 ? '思维型' : '情感型'}</div>
          </div>
        </div>
      </div>

      <div class="result-card">
        <div class="result-card-header">
          <span class="result-card-icon">📅</span>
          <h4>生活方式</h4>
        </div>
        <div class="result-card-body">
          <div class="mbti-dimension">
            <div class="mbti-dim-labels">
              <span>感知 (P)</span>
              <span>判断 (J)</span>
            </div>
            <div class="mbti-bar">
              <div class="mbti-bar-fill" style="width:${100 - percentages.J}%;background:#4E46DC"></div>
              <div class="mbti-bar-fill" style="width:${percentages.J}%;background:#0DB8A8"></div>
            </div>
            <div class="mbti-result">${percentages.J >= 50 ? '判断型' : '感知型'}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="result-footer">
      <button class="btn-primary" onclick="navigateTo('assessment-profile')">查看画像</button>
      <button class="btn-secondary" onclick="startNextAssessment()">继续测评</button>
      <button class="btn-secondary" onclick="navigateTo('assessment-guide')">返回引导</button>
    </div>
  `;
}