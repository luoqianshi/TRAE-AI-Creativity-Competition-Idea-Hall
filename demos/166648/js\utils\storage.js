// ========== localStorage 缓存 ==========
function saveProgress() {
  try {
    localStorage.setItem('careerCompass_progress', JSON.stringify({
      phase: currentPhase,
      riasecIndex: riasecIndex,
      anchorIndex: anchorIndex,
      data: assessmentData
    }));
  } catch (e) { /* 忽略存储异常 */ }
}

function loadProgress() {
  try {
    const saved = localStorage.getItem('careerCompass_progress');
    if (saved) {
      const obj = JSON.parse(saved);
      if (obj.data) {
        assessmentData = { ...assessmentData, ...obj.data };
        if (assessmentData.riasecAnswers.length > 0 && assessmentData.riasecScores.R === 0) {
          recalcScores();
        }
        if (obj.phase === 'B' || obj.phase === 'C') {
          currentPhase = obj.phase;
          riasecIndex = obj.riasecIndex || assessmentData.riasecAnswers.length;
          anchorIndex = obj.anchorIndex || assessmentData.anchorAnswers.length;

          if (currentPhase === 'B') {
            document.getElementById('phaseA').style.display = 'none';
            document.getElementById('phaseB').style.display = 'block';
            renderRIASECQuestion();
          } else if (currentPhase === 'C') {
            document.getElementById('phaseA').style.display = 'none';
            document.getElementById('phaseB').style.display = 'none';
            document.getElementById('phaseC').style.display = 'block';
            renderAnchorQuestion();
          }
          updatePhaseTabs();
          updateProgress();
        }
      }
    }
  } catch (e) { /* 忽略读取异常 */ }
}

function recalcScores() {
  assessmentData.riasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  assessmentData.riasecAnswers.forEach((ans, i) => {
    if (ans && i < riasecQuestions.length) {
      const type = riasecQuestions[i].type;
      assessmentData.riasecScores[type]++;
    }
  });
}

function resetAssessment() {
  if (!confirm('确定要重新开始测评吗？所有当前进度将被清除。')) return;
  localStorage.removeItem('careerCompass_progress');
  assessmentData = {
    name: '', education: '', experience: '', status: '',
    preferences: ['收入前景', '稳定性', '成长空间', '兴趣匹配'],
    riasecAnswers: [], anchorAnswers: [],
    riasecScores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
    anchorCounts: {}
  };
  currentPhase = 'A';
  riasecIndex = 0;
  anchorIndex = 0;

  document.getElementById('inputName').value = '';
  document.getElementById('inputEdu').value = '';
  document.getElementById('inputExp').value = '';
  document.getElementById('inputStatus').value = '';
  updatePrefRanks();

  document.getElementById('phaseA').style.display = 'block';
  document.getElementById('phaseB').style.display = 'none';
  document.getElementById('phaseC').style.display = 'none';
  updatePhaseTabs();
  updateProgress();
  navigateTo('assessment');
}
