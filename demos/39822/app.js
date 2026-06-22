const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadResult = document.getElementById('upload-result');
const currentStage = document.getElementById('current-stage');
const historyList = document.getElementById('history-list');
const generateBtn = document.getElementById('generate-btn');
const generateResult = document.getElementById('generate-result');
const downloadQuestions = document.getElementById('download-questions');
const downloadAnswers = document.getElementById('download-answers');

let selectedFile = null;

const setStepState = (stage) => {
  document.querySelectorAll('.flow-step').forEach((node) => {
    node.classList.toggle('active', node.dataset.stage === stage);
  });
};

const refreshStatus = async () => {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    currentStage.textContent = data.message || '等待上传图片';
    setStepState(data.stage);
    historyList.innerHTML = (data.history || [])
      .slice()
      .reverse()
      .map((item) => `<li>[${item.timestamp}] ${item.message}</li>`)
      .join('');

    if (data.last_generated) {
      downloadQuestions.href = '/api/download/questions';
      downloadAnswers.href = '/api/download/answers';
      downloadQuestions.classList.remove('disabled');
      downloadAnswers.classList.remove('disabled');
    }
  } catch (error) {
    console.error(error);
  }
};

setInterval(refreshStatus, 1500);
refreshStatus();

dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => {
  selectedFile = event.target.files[0] || null;
  uploadResult.textContent = selectedFile ? `已选择：${selectedFile.name}` : '';
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', (event) => {
  selectedFile = event.dataTransfer.files[0] || null;
  uploadResult.textContent = selectedFile ? `已选择：${selectedFile.name}` : '';
});

uploadBtn.addEventListener('click', async () => {
  if (!selectedFile) {
    uploadResult.textContent = '请先选择一张图片。';
    return;
  }
  uploadResult.textContent = '正在上传并处理...';
  const formData = new FormData();
  formData.append('file', selectedFile);
  const response = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok) {
    uploadResult.textContent = `处理失败：${data.detail || '未知错误'}`;
    return;
  }
  uploadResult.textContent = `处理完成：已入库 ${data.result.added_to_bank} 道题。`;
  refreshStatus();
});

generateBtn.addEventListener('click', async () => {
  generateResult.textContent = '正在组卷...';
  const payload = {
    audience: document.getElementById('audience').value,
    topic: document.getElementById('topic').value,
    question_type: document.getElementById('question-type').value,
    count: Number(document.getElementById('count').value || 5),
  };
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    generateResult.textContent = `组卷失败：${data.detail || '未知错误'}`;
    return;
  }
  const info = data.result;
  generateResult.textContent = JSON.stringify(info, null, 2);
  downloadQuestions.href = '/api/download/questions';
  downloadAnswers.href = '/api/download/answers';
  downloadQuestions.classList.remove('disabled');
  downloadAnswers.classList.remove('disabled');
  refreshStatus();
});