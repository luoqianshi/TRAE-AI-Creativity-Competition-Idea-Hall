// 录音状态机：idle → recording → processing → done
const RecordingState = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  DONE: 'done'
};

let recordingState = RecordingState.IDLE;
let recordingTimer = null;
let processingTimer = null;
let recordingSeconds = 0;
let recordingInterval = null;

function startRecording(onStateChange) {
  if (recordingState !== RecordingState.IDLE) return;
  
  recordingState = RecordingState.RECORDING;
  recordingSeconds = 0;
  if (onStateChange) onStateChange(recordingState, recordingSeconds);
  
  // 每秒更新录音时长
  recordingInterval = setInterval(() => {
    recordingSeconds++;
    if (onStateChange) onStateChange(recordingState, recordingSeconds);
  }, 1000);
  
  // 模拟 45 秒录音
  recordingTimer = setTimeout(() => {
    stopRecording(onStateChange);
  }, 45000);
}

function stopRecording(onStateChange) {
  if (recordingState !== RecordingState.RECORDING) return;
  
  clearTimeout(recordingTimer);
  clearInterval(recordingInterval);
  recordingState = RecordingState.PROCESSING;
  if (onStateChange) onStateChange(recordingState, recordingSeconds);
  
  // 模拟 6 秒处理时间
  let processingStep = 0;
  processingTimer = setInterval(() => {
    processingStep++;
    if (onStateChange) onStateChange(recordingState, recordingSeconds, processingStep);
    if (processingStep >= 6) {
      clearInterval(processingTimer);
      recordingState = RecordingState.DONE;
      if (onStateChange) onStateChange(recordingState, recordingSeconds, 6);
    }
  }, 1000);
}

function resetRecording(onStateChange) {
  clearTimeout(recordingTimer);
  clearInterval(recordingInterval);
  clearInterval(processingTimer);
  recordingState = RecordingState.IDLE;
  recordingSeconds = 0;
  if (onStateChange) onStateChange(recordingState, 0);
}

function getRecordingState() {
  return recordingState;
}

function formatRecordingTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}