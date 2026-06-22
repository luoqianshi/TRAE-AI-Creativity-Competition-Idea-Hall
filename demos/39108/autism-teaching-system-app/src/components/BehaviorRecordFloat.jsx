import { useState, useRef, useEffect } from 'react';
import { AlertCircle, X, Mic, Video, Square, CheckCircle, ChevronUp } from 'lucide-react';
import {
  BEHAVIOR_TYPES,
  ANTECEDENT_OPTIONS,
  CONSEQUENCE_OPTIONS,
  SEVERITY_LEVELS,
  addBehaviorRecord,
  getCurrentUser,
} from '../data/store';

// 脉冲动画 keyframes（内联样式注入）
const pulseKeyframes = `
@keyframes floatPulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
`;

export default function BehaviorRecordFloat({ studentId, studentName }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 表单状态
  const [severity, setSeverity] = useState(2);
  const [selectedBehaviors, setSelectedBehaviors] = useState([]);
  const [selectedAntecedents, setSelectedAntecedents] = useState([]);
  const [selectedConsequences, setSelectedConsequences] = useState([]);
  const [notes, setNotes] = useState('');
  const [antecedentOther, setAntecedentOther] = useState('');
  const [consequenceOther, setConsequenceOther] = useState('');

  // 语音输入状态
  const [voiceTarget, setVoiceTarget] = useState(null); // 'notes' | 'antecedentOther' | 'consequenceOther'
  const [isListening, setIsListening] = useState(false);

  // 视频录制状态
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // 如果没有学生上下文，不渲染
  if (!studentId) return null;

  // ===== 语音输入 =====
  const startVoiceInput = (targetField) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音输入');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setVoiceTarget(targetField);
    setIsListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (targetField === 'notes') {
        setNotes((prev) => (prev ? prev + text : text));
      } else if (targetField === 'antecedentOther') {
        setAntecedentOther((prev) => (prev ? prev + text : text));
      } else if (targetField === 'consequenceOther') {
        setConsequenceOther((prev) => (prev ? prev + text : text));
      }
      setIsListening(false);
      setVoiceTarget(null);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceTarget(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceTarget(null);
    };

    recognition.start();
  };

  // ===== 视频录制 =====
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlobUrl(url);
        // 停止所有轨道
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('无法启动摄像头，请检查浏览器权限设置。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ===== 切换选择 =====
  const toggleItem = (list, setList, id) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ===== 重置表单 =====
  const resetForm = () => {
    setSeverity(2);
    setSelectedBehaviors([]);
    setSelectedAntecedents([]);
    setSelectedConsequences([]);
    setNotes('');
    setAntecedentOther('');
    setConsequenceOther('');
    setVideoBlobUrl(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ===== 提交 =====
  const handleSubmit = () => {
    const user = getCurrentUser();
    const record = {
      studentId,
      behaviorTypes: selectedBehaviors,
      antecedents: selectedAntecedents,
      consequences: selectedConsequences,
      antecedentOther: selectedAntecedents.includes('ant_other') ? antecedentOther : '',
      consequenceOther: selectedConsequences.includes('con_other') ? consequenceOther : '',
      severity,
      notes,
      hasVideo: !!videoBlobUrl,
      recorderId: user?.id,
      recorderName: user?.name,
      recordDate: new Date().toISOString(),
    };

    addBehaviorRecord(record);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setPanelOpen(false);
    resetForm();
  };

  // ===== 格式化录制时间 =====
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      {/* 注入脉冲动画样式 */}
      <style>{pulseKeyframes}</style>

      {/* ===== 浮动按钮 ===== */}
      <button
        onClick={() => setPanelOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        style={{ animation: 'floatPulse 2s infinite' }}
        title="记录问题行为"
      >
        <AlertCircle size={28} />
      </button>

      {/* ===== 录制面板 ===== */}
      {panelOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-full max-w-[420px] max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-y-auto transition-all duration-300 ease-out"
          style={{
            opacity: panelOpen ? 1 : 0,
            transform: panelOpen ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* 头部 */}
          <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-xl z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-800">问题行为记录</h2>
              {studentName && (
                <p className="text-sm text-slate-500 mt-0.5">学生：{studentName}</p>
              )}
            </div>
            <button
              onClick={() => {
                setPanelOpen(false);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* ===== 严重程度 ===== */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                严重程度
              </label>
              <div className="flex gap-2">
                {SEVERITY_LEVELS.map((item) => (
                  <button
                    key={item.level}
                    onClick={() => setSeverity(item.level)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                      severity === item.level
                        ? item.level === 1
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : item.level === 2
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ===== 1. 行为类型 ===== */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                1. 行为类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BEHAVIOR_TYPES.map((bt) => {
                  const isSelected = selectedBehaviors.includes(bt.id);
                  return (
                    <button
                      key={bt.id}
                      onClick={() => toggleItem(selectedBehaviors, setSelectedBehaviors, bt.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border-2 transition-all text-left ${
                        isSelected
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg">{bt.icon}</span>
                      <span className="font-medium">{bt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===== 2. 前事刺激 ===== */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                2. 前事刺激
              </label>
              <div className="flex flex-wrap gap-2">
                {ANTECEDENT_OPTIONS.map((ant) => {
                  const isSelected = selectedAntecedents.includes(ant.id);
                  return (
                    <button
                      key={ant.id}
                      onClick={() => toggleItem(selectedAntecedents, setSelectedAntecedents, ant.id)}
                      className={`py-1.5 px-3 rounded-full text-sm font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                      }`}
                    >
                      {ant.name}
                    </button>
                  );
                })}
                {/* 其他（语音输入） */}
                <button
                  onClick={() => toggleItem(selectedAntecedents, setSelectedAntecedents, 'ant_other')}
                  className={`py-1.5 px-3 rounded-full text-sm font-medium border transition-all ${
                    selectedAntecedents.includes('ant_other')
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  其他 (语音输入)
                </button>
              </div>
              {selectedAntecedents.includes('ant_other') && (
                <div className="mt-2 flex gap-2 items-start">
                  <input
                    type="text"
                    value={antecedentOther}
                    onChange={(e) => setAntecedentOther(e.target.value)}
                    placeholder="请输入其他前事刺激..."
                    className="input flex-1 text-sm"
                  />
                  <button
                    onClick={() => startVoiceInput('antecedentOther')}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${
                      isListening && voiceTarget === 'antecedentOther'
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title="语音输入"
                  >
                    <Mic size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* ===== 3. 老师处理方式 ===== */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                3. 老师处理方式
              </label>
              <div className="flex flex-wrap gap-2">
                {CONSEQUENCE_OPTIONS.map((con) => {
                  const isSelected = selectedConsequences.includes(con.id);
                  return (
                    <button
                      key={con.id}
                      onClick={() => toggleItem(selectedConsequences, setSelectedConsequences, con.id)}
                      className={`py-1.5 px-3 rounded-full text-sm font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                      }`}
                    >
                      {con.name}
                    </button>
                  );
                })}
                {/* 其他（语音输入） */}
                <button
                  onClick={() => toggleItem(selectedConsequences, setSelectedConsequences, 'con_other')}
                  className={`py-1.5 px-3 rounded-full text-sm font-medium border transition-all ${
                    selectedConsequences.includes('con_other')
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  其他 (语音输入)
                </button>
              </div>
              {selectedConsequences.includes('con_other') && (
                <div className="mt-2 flex gap-2 items-start">
                  <input
                    type="text"
                    value={consequenceOther}
                    onChange={(e) => setConsequenceOther(e.target.value)}
                    placeholder="请输入其他处理方式..."
                    className="input flex-1 text-sm"
                  />
                  <button
                    onClick={() => startVoiceInput('consequenceOther')}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${
                      isListening && voiceTarget === 'consequenceOther'
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title="语音输入"
                  >
                    <Mic size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* ===== 4. 补充说明 ===== */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  4. 补充说明
                </label>
                <button
                  onClick={() => startVoiceInput('notes')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isListening && voiceTarget === 'notes'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Mic size={14} />
                  {isListening && voiceTarget === 'notes' ? '正在聆听...' : '语音输入'}
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="请输入补充说明..."
                className="input w-full h-24 resize-none text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                🎤 点击上方麦克风按钮开始语音输入
              </p>
            </div>

            {/* ===== 5. 录视频 ===== */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                5. 录视频
              </label>
              {!isRecording && !videoBlobUrl && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Video size={18} />
                  开始录制视频
                </button>
              )}

              {isRecording && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <Square size={16} />
                    停止录制
                  </button>
                  <div className="flex items-center gap-1.5 text-red-500 font-mono text-sm font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    {formatTime(recordingSeconds)}
                  </div>
                </div>
              )}

              {videoBlobUrl && !isRecording && (
                <div className="space-y-2">
                  <video
                    src={videoBlobUrl}
                    controls
                    className="w-full rounded-lg border border-slate-200 max-h-40 object-cover"
                  />
                  <button
                    onClick={() => setVideoBlobUrl(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    重新录制
                  </button>
                </div>
              )}
            </div>

            {/* ===== 保存按钮 ===== */}
            <button
              onClick={handleSubmit}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              <CheckCircle size={18} />
              保存记录
            </button>
          </div>
        </div>
      )}

      {/* ===== 成功提示 Toast ===== */}
      {showToast && (
        <div className="fixed bottom-24 right-6 z-[60] flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg text-sm font-medium animate-bounce">
          <CheckCircle size={18} />
          记录已保存
        </div>
      )}
    </>
  );
}
