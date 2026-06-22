import { useState, useEffect } from 'react';
import { Bell, BellRing, X, Clock, CheckCircle, AlertTriangle, Hand } from 'lucide-react';
import {
  addCallRecord,
  getCallRecordsByStudent,
  getPendingCalls,
  updateCallStatus,
  getCurrentUser,
  hasPermission,
} from '../data/store';

// 时间格式化工具
const formatTimeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
};

// 呼叫原因选项
const REASON_OPTIONS = [
  { id: 'general', label: '一般呼叫' },
  { id: 'support', label: '需要辅助支持' },
  { id: 'behavior', label: '学生行为问题' },
  { id: 'materials', label: '需要准备材料' },
  { id: 'emergency', label: '紧急情况' },
];

// 状态徽章配置
const STATUS_CONFIG = {
  pending: { label: '等待中', color: 'bg-amber-100 text-amber-700', pulsing: true },
  accepted: { label: '已响应', color: 'bg-green-100 text-green-700', pulsing: false },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500', pulsing: false },
};

export default function CallAssistantFloat({ studentId, studentName }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('general');
  const [cooldown, setCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [callRecords, setCallRecords] = useState([]);
  const [pendingCalls, setPendingCalls] = useState([]);

  const currentUser = getCurrentUser();
  const isAssistant = currentUser?.role === 'assistant';
  const isTeacherOrSupervisor = currentUser?.role === 'teacher' || currentUser?.role === 'supervisor';

  // 倒计时冷却
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 定时刷新数据（每5秒）
  useEffect(() => {
    const refreshData = () => {
      if (studentId) {
        setCallRecords(getCallRecordsByStudent(studentId));
      }
      setPendingCalls(getPendingCalls());
    };

    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [studentId]);

  // 教师视图：发送呼叫
  const handleCall = () => {
    if (!studentId || !currentUser || cooldown > 0) return;

    addCallRecord({
      studentId,
      callerId: currentUser.id,
      callerName: currentUser.name,
      reason: selectedReason,
      status: 'pending',
    });

    setSuccessMessage('已发送呼叫通知');
    setCooldown(30);
    setCallRecords(getCallRecordsByStudent(studentId));

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // 助教视图：响应呼叫
  const handleRespond = (callId) => {
    updateCallStatus(callId, 'accepted');
    setPendingCalls(getPendingCalls());
  };

  // 计算待处理呼叫数
  const pendingCount = isAssistant
    ? pendingCalls.length
    : callRecords.filter((c) => c.status === 'pending').length;

  // 按钮是否可见
  const buttonVisible = isAssistant || (isTeacherOrSupervisor && studentId);

  if (!buttonVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end gap-3">
      {/* 面板 */}
      {panelOpen && (
        <div className="bg-white rounded-xl shadow-2xl w-[360px] max-w-[calc(100vw-48px)] overflow-hidden animate-in slide-in-from-bottom-2">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">
              {isAssistant ? '待处理呼叫' : '呼叫助教'}
            </h3>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {isAssistant ? (
              /* ===== 助教视图 ===== */
              <AssistantPanel
                pendingCalls={pendingCalls}
                onRespond={handleRespond}
              />
            ) : (
              /* ===== 教师/督导视图 ===== */
              <TeacherPanel
                studentId={studentId}
                studentName={studentName}
                selectedReason={selectedReason}
                onReasonChange={setSelectedReason}
                cooldown={cooldown}
                successMessage={successMessage}
                callRecords={callRecords}
                onCall={handleCall}
              />
            )}
          </div>
        </div>
      )}

      {/* 浮动按钮 */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg
          transition-all duration-200 hover:scale-105 active:scale-95
          ${isAssistant && pendingCount > 0
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-blue-500 hover:bg-blue-600'
          }
        `}
        title={isAssistant ? '待处理呼叫' : '呼叫助教'}
      >
        {isAssistant ? <Bell size={22} /> : <Hand size={22} />}

        {/* 红色徽标 */}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>
    </div>
  );
}

/* ===== 教师/督导面板 ===== */
function TeacherPanel({
  studentId,
  studentName,
  selectedReason,
  onReasonChange,
  cooldown,
  successMessage,
  callRecords,
  onCall,
}) {
  return (
    <div className="space-y-4">
      {/* 学生信息 */}
      {studentName && (
        <div className="text-sm text-slate-500">
          当前学生：<span className="font-medium text-slate-700">{studentName}</span>
        </div>
      )}

      {/* 成功提示 */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}

      {/* 快速呼叫按钮 */}
      <button
        onClick={onCall}
        disabled={cooldown > 0}
        className={`
          w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white
          transition-all duration-200
          ${cooldown > 0
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          }
        `}
      >
        <BellRing size={20} />
        {cooldown > 0 ? (
          <span>请等待 {cooldown}s 后再次呼叫</span>
        ) : (
          <span>立即呼叫助教</span>
        )}
      </button>

      {/* 呼叫原因选择 */}
      <div>
        <div className="text-sm font-medium text-slate-600 mb-2">呼叫原因</div>
        <div className="flex flex-wrap gap-2">
          {REASON_OPTIONS.map((reason) => (
            <button
              key={reason.id}
              onClick={() => onReasonChange(reason.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
                ${selectedReason === reason.id
                  ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {reason.label}
            </button>
          ))}
        </div>
      </div>

      {/* 最近呼叫记录 */}
      {callRecords.length > 0 && (
        <div>
          <div className="text-sm font-medium text-slate-600 mb-2">最近呼叫</div>
          <div className="space-y-2">
            {callRecords.slice(0, 5).map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-medium truncate">{call.callerName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 truncate">
                      {REASON_OPTIONS.find((r) => r.id === call.reason)?.label || '一般呼叫'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Clock size={12} />
                    {formatTimeAgo(call.createdAt)}
                  </div>
                </div>
                <StatusBadge status={call.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 无记录提示 */}
      {callRecords.length === 0 && (
        <div className="text-center py-4 text-sm text-slate-400">
          暂无呼叫记录
        </div>
      )}
    </div>
  );
}

/* ===== 助教面板 ===== */
function AssistantPanel({ pendingCalls, onRespond }) {
  const allPending = pendingCalls.filter((c) => c.status === 'pending');
  const allAccepted = pendingCalls.filter((c) => c.status === 'accepted');

  return (
    <div className="space-y-4">
      {/* 待处理呼叫 */}
      <div>
        <div className="text-sm font-medium text-slate-600 mb-2">
          待处理 ({allPending.length})
        </div>
        {allPending.length > 0 ? (
          <div className="space-y-2">
            {allPending.map((call) => (
              <div
                key={call.id}
                className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm">
                      {call.callerName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {REASON_OPTIONS.find((r) => r.id === call.reason)?.label || '一般呼叫'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <Clock size={12} />
                      {formatTimeAgo(call.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => onRespond(call.id)}
                    className="ml-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    响应
                  </button>
                </div>
                {call.reason === 'emergency' && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                    <AlertTriangle size={12} />
                    紧急情况，请优先处理
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-slate-400">
            暂无待处理呼叫
          </div>
        )}
      </div>

      {/* 已处理 */}
      {allAccepted.length > 0 && (
        <div>
          <div className="text-sm font-medium text-slate-600 mb-2">
            已处理 ({allAccepted.length})
          </div>
          <div className="space-y-2">
            {allAccepted.slice(0, 5).map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-700 truncate">{call.callerName}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Clock size={12} />
                    {formatTimeAgo(call.createdAt)}
                  </div>
                </div>
                <StatusBadge status="accepted" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 状态徽章 ===== */
function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${config.color}
        ${config.pulsing ? 'animate-pulse' : ''}
      `}
    >
      {status === 'pending' && <Clock size={10} />}
      {status === 'accepted' && <CheckCircle size={10} />}
      {config.label}
    </span>
  );
}
