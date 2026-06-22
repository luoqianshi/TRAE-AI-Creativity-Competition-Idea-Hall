import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Save,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import {
  getStudentById,
  getTeachingSessionById,
  updateSessionTrialGoal,
  judgeSessionGoals,
  updateTeachingSession,
  getCurrentUser,
  BARRIER_TAGS,
  PROMPT_LEVELS,
  addTrainingRecord,
} from '../data/store';

// ===== 常量 =====
const TRIAL_OPTIONS = ['+', '-', 'P+', 'P-'];

const TRIAL_COLORS = {
  '+': { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500', ring: 'ring-emerald-300', label: '独立正确' },
  '-': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500', ring: 'ring-red-300', label: '错误' },
  'P+': { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-500', ring: 'ring-amber-300', label: '提示正确' },
  'P-': { bg: 'bg-slate-400', text: 'text-white', border: 'border-slate-400', ring: 'ring-slate-300', label: '提示错误' },
};

const GOAL_STATUS_MAP = {
  pending: { label: '待开始', color: 'bg-slate-100 text-slate-600', icon: Play },
  recording: { label: '记录中', color: 'bg-blue-100 text-blue-700', icon: Play },
  completed: { label: '已完成', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  pass: { label: '通过', color: 'bg-emerald-100 text-emerald-700', icon: Trophy },
  fail: { label: '未通过', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const TYPE_LABELS = {
  acquisition: '新技能',
  maintenance: '维持',
  review: '复习',
};

// ===== 辅助函数 =====
function getGoalStatus(goal) {
  if (goal.passed === true) return 'pass';
  if (goal.passed === false) return 'fail';
  if (goal.finalProbeResult !== null) return 'completed';
  if (goal.probeResult !== null || goal.trials.length > 0) return 'recording';
  return 'pending';
}

function getTrialAccuracy(trials) {
  if (!trials || trials.length === 0) return 0;
  // 只有 + 才算正确，P+ 不算
  const correct = trials.filter(t => t === '+').length;
  return Math.round((correct / trials.length) * 100);
}

// 判定单个目标是否通过（二选一：首测+尾测 或 逐次记录）
function judgeGoal(goal) {
  // 方式1：首测和尾测都为 +（不需要逐次记录）
  if (goal.probeResult === '+' && goal.finalProbeResult === '+') {
    return true;
  }
  // 方式2：逐次记录中只有 + 算正确，>= 80% 即通过
  if (goal.trials && goal.trials.length >= 10) {
    const correctCount = goal.trials.filter(t => t === '+').length;
    if (correctCount >= 8) {
      return true;
    }
  }
  // 如果有记录但未通过
  if ((goal.probeResult !== null && goal.finalProbeResult !== null) || (goal.trials && goal.trials.length >= 10)) {
    return false;
  }
  // 还没记录完，不判定
  return null;
}

// ===== 子组件：探针按钮区 =====
function ProbeSection({ label, result, onRecord, disabled, completed }) {
  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-semibold text-slate-600 mb-3">{label}</h4>

      {completed ? (
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg ${
              result === '+' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {result}
          </div>
          <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
            <CheckCircle size={14} />
            {label}完成
          </span>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            disabled={disabled}
            onClick={() => onRecord('+')}
            className={`w-20 h-20 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-3xl font-bold shadow-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center select-none`}
          >
            +
          </button>
          <button
            disabled={disabled}
            onClick={() => onRecord('-')}
            className={`w-20 h-20 rounded-2xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-3xl font-bold shadow-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center select-none`}
          >
            -
          </button>
        </div>
      )}
    </div>
  );
}

// ===== 子组件：逐次记录区 =====
function TrialsSection({ trials, onRecordTrial, disabled }) {
  const currentTrialIndex = trials.length;
  const isComplete = trials.length >= 10;

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-semibold text-slate-600 mb-3">逐次记录</h4>

      {/* 10 个回合槽位 */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {Array.from({ length: 10 }, (_, i) => {
          const value = trials[i];
          const isCurrent = i === currentTrialIndex && !isComplete;
          const isEmpty = value === undefined;

          let slotClass = 'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-150 ';
          if (!isEmpty) {
            const colorInfo = TRIAL_COLORS[value];
            slotClass += `${colorInfo.bg} ${colorInfo.text} shadow-md`;
          } else if (isCurrent) {
            slotClass += 'border-2 border-dashed border-blue-400 bg-blue-50 text-blue-400';
          } else {
            slotClass += 'bg-slate-100 text-slate-300';
          }

          return (
            <div key={i} className={slotClass} title={`回合 ${i + 1}`}>
              {isEmpty ? (isCurrent ? i + 1 : '-') : value}
            </div>
          );
        })}
      </div>

      {/* 进度 */}
      <div className="text-sm text-slate-500 mb-3">
        {isComplete ? (
          <span className="font-semibold text-slate-700">
            10/10 回合 · 正确率 {getTrialAccuracy(trials)}%
          </span>
        ) : (
          <span>
            {currentTrialIndex}/10 回合
          </span>
        )}
      </div>

      {/* 输入按钮 */}
      {!isComplete && (
        <div className="grid grid-cols-4 gap-2">
          {TRIAL_OPTIONS.map(opt => {
            const colorInfo = TRIAL_COLORS[opt];
            return (
              <button
                key={opt}
                disabled={disabled}
                onClick={() => onRecordTrial(opt)}
                className={`min-h-[48px] min-w-[48px] px-3 py-2 rounded-xl ${colorInfo.bg} ${colorInfo.text} font-bold text-lg shadow-md hover:opacity-90 active:scale-95 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed select-none`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {isComplete && (
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
          <CheckCircle size={14} />
          逐次记录完成
        </div>
      )}
    </div>
  );
}

// ===== 子组件：结果横幅 =====
function ResultBanner({ passed }) {
  if (passed === null) return null;

  return (
    <div
      className={`mt-4 p-4 rounded-xl text-center font-bold text-lg ${
        passed
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 text-emerald-700'
          : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-700'
      }`}
    >
      {passed ? (
        <div className="flex items-center justify-center gap-2">
          <Trophy size={22} className="text-emerald-600" />
          <span>通过！目标已达成</span>
          <Trophy size={22} className="text-emerald-600" />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <AlertCircle size={22} className="text-red-500" />
          <span>未通过，继续练习</span>
        </div>
      )}
    </div>
  );
}

// ===== 子组件：辅助层级和障碍标签选择器 =====
function SessionMetaSelector({ goal, sessionId, onUpdate, disabled }) {
  const handleMetaUpdate = useCallback(
    (field, value) => {
      const updated = updateSessionTrialGoal(sessionId, goal.goalId, { [field]: value });
      onUpdate(updated);
    },
    [sessionId, goal.goalId, onUpdate]
  );

  return (
    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
      {/* 辅助层级 */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 shrink-0">辅助层级:</span>
        <select
          value={goal.promptLevel ?? 0}
          onChange={(e) => handleMetaUpdate('promptLevel', parseInt(e.target.value))}
          disabled={disabled}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-300 disabled:opacity-50"
        >
          {PROMPT_LEVELS.map((p) => (
            <option key={p.level} value={p.level}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* 障碍归因标签 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 shrink-0">障碍:</span>
        {BARRIER_TAGS.map((tag) => {
          const isSelected = goal.barrierTags?.includes(tag.id) || false;
          return (
            <button
              key={tag.id}
              onClick={() => {
                const current = goal.barrierTags || [];
                const next = isSelected
                  ? current.filter((t) => t !== tag.id)
                  : [...current, tag.id];
                handleMetaUpdate('barrierTags', next);
              }}
              disabled={disabled}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all disabled:opacity-50 ${
                isSelected
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
              style={isSelected ? { borderColor: tag.color, backgroundColor: tag.color + '15', color: tag.color } : {}}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== 子组件：目标卡片 =====
function GoalCard({ goal, index, sessionId, onUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const status = getGoalStatus(goal);
  const statusInfo = GOAL_STATUS_MAP[status];
  const StatusIcon = statusInfo.icon;
  const canRecord = status !== 'pass' && status !== 'fail';

  const handleProbeRecord = useCallback(
    (value) => {
      if (!canRecord) return;
      const updated = updateSessionTrialGoal(sessionId, goal.goalId, { probeResult: value });
      onUpdate(updated);
    },
    [sessionId, goal.goalId, canRecord, onUpdate]
  );

  const handleTrialRecord = useCallback(
    (value) => {
      if (!canRecord) return;
      const newTrials = [...goal.trials, value];
      const updates = { trials: newTrials };
      // 10回合完成后自动判定
      if (newTrials.length >= 10) {
        const tempGoal = { ...goal, trials: newTrials };
        const passed = judgeGoal(tempGoal);
        if (passed !== null) {
          updates.passed = passed;
        }
      }
      const updated = updateSessionTrialGoal(sessionId, goal.goalId, updates);
      onUpdate(updated);
    },
    [sessionId, goal.goalId, goal, canRecord, onUpdate]
  );

  const handleFinalProbeRecord = useCallback(
    (value) => {
      if (!canRecord) return;
      const updates = { finalProbeResult: value };
      // Auto-judge（首测+尾测方式）
      const tempGoal = { ...goal, finalProbeResult: value };
      const passed = judgeGoal(tempGoal);
      if (passed !== null) {
        updates.passed = passed;
      }
      const updated = updateSessionTrialGoal(sessionId, goal.goalId, updates);
      onUpdate(updated);
    },
    [sessionId, goal.goalId, goal, canRecord, onUpdate]
  );

  const handleReset = useCallback(() => {
    const resetData = {
      probeResult: null,
      trials: [],
      finalProbeResult: null,
      passed: null,
    };
    const updated = updateSessionTrialGoal(sessionId, goal.goalId, resetData);
    onUpdate(updated);
  }, [sessionId, goal.goalId, onUpdate]);

  const handleUndoLastTrial = useCallback(() => {
    if (goal.trials.length === 0) return;
    const newTrials = goal.trials.slice(0, -1);
    const updated = updateSessionTrialGoal(sessionId, goal.goalId, { trials: newTrials });
    onUpdate(updated);
  }, [sessionId, goal.goalId, goal.trials, onUpdate]);

  return (
    <div
      id={`goal-${goal.goalId}`}
      className={`card overflow-hidden transition-all duration-200 ${
        status === 'recording' ? 'ring-2 ring-blue-400 shadow-lg' : ''
      } ${status === 'pass' ? 'ring-2 ring-emerald-300' : ''}`}
    >
      {/* 卡片头部 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm shrink-0">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-bold text-slate-800 truncate">{goal.description}</div>
            {goal.hierarchyPath && (
              <div className="text-xs text-slate-500 truncate mt-0.5">{goal.hierarchyPath}</div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {goal.domain && (
              <span className="tag tag-primary text-xs">{goal.domain}</span>
            )}
            {goal.type && (
              <span className="tag tag-warn text-xs">{TYPE_LABELS[goal.type] || goal.type}</span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
              <StatusIcon size={12} />
              {statusInfo.label}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-400 shrink-0 ml-2" /> : <ChevronDown size={18} className="text-slate-400 shrink-0 ml-2" />}
      </button>

      {/* 卡片内容 */}
      {expanded && (
        <div className="px-5 pb-5">
          {/* 辅助层级 + 障碍归因标签 */}
          <SessionMetaSelector
            goal={goal}
            sessionId={sessionId}
            onUpdate={onUpdate}
            disabled={!canRecord}
          />

          {/* 三段式记录区 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* 首测 */}
            <div className="flex flex-col items-center py-4 px-3 bg-slate-50 rounded-xl">
              <ProbeSection
                label="首测"
                result={goal.probeResult}
                onRecord={handleProbeRecord}
                disabled={!canRecord}
                completed={goal.probeResult !== null}
              />
            </div>

            {/* 逐次记录 */}
            <div className="flex flex-col items-center py-4 px-3 bg-slate-50 rounded-xl">
              <TrialsSection
                trials={goal.trials}
                onRecordTrial={handleTrialRecord}
                disabled={!canRecord}
              />
            </div>

            {/* 尾测 */}
            <div className="flex flex-col items-center py-4 px-3 bg-slate-50 rounded-xl">
              <ProbeSection
                label="尾测"
                result={goal.finalProbeResult}
                onRecord={handleFinalProbeRecord}
                disabled={!canRecord}
                completed={goal.finalProbeResult !== null}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2">
              {canRecord && goal.trials.length > 0 && (
                <button
                  onClick={handleUndoLastTrial}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw size={12} />
                  撤销上回合
                </button>
              )}
              {canRecord && (goal.probeResult !== null || goal.trials.length > 0) && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <RotateCcw size={12} />
                  重置此目标
                </button>
              )}
            </div>

            {/* 逐次记录统计 */}
            {goal.trials.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  + 正确: {goal.trials.filter(t => t === '+').length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
                  - 错误: {goal.trials.filter(t => t === '-').length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                  P+ 提示正确: {goal.trials.filter(t => t === 'P+').length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block" />
                  P- 提示错误: {goal.trials.filter(t => t === 'P-').length}
                </span>
              </div>
            )}
          </div>

          {/* 结果横幅 */}
          <ResultBanner passed={goal.passed} />
        </div>
      )}
    </div>
  );
}

// ===== 主页面组件 =====
export default function TeachingSession() {
  const { id: studentId, sessionId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [student, setStudent] = useState(() => getStudentById(studentId));
  const [session, setSession] = useState(() => getTeachingSessionById(sessionId));
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState(false);

  // 从 localStorage 重新加载最新数据（因为 store 是直接操作 localStorage 的）
  const refreshSession = useCallback(() => {
    const latest = getTeachingSessionById(sessionId);
    if (latest) {
      setSession({ ...latest });
    }
  }, [sessionId]);

  const refreshStudent = useCallback(() => {
    const latest = getStudentById(studentId);
    if (latest) {
      setStudent(latest);
    }
  }, [studentId]);

  useEffect(() => {
    refreshSession();
    refreshStudent();
  }, [refreshSession, refreshStudent]);

  // 处理目标数据更新
  const handleGoalUpdate = useCallback(
    (updatedGoal) => {
      if (!session) return;
      setSession(prev => ({
        ...prev,
        trialGoals: prev.trialGoals.map(tg =>
          tg.goalId === updatedGoal.goalId ? { ...updatedGoal } : tg
        ),
      }));
    },
    [session]
  );

  // 完成上课
  const handleCompleteSession = useCallback(() => {
    if (!session) return;

    // 先判定所有已完成的目标
    judgeSessionGoals(sessionId);

    // 将每个目标的教学数据同步写入训练记录（让训练记录页面也能看到）
    const updatedSession = getTeachingSessionById(sessionId);
    if (updatedSession && updatedSession.trialGoals) {
      updatedSession.trialGoals.forEach((goal) => {
        // 只同步有实际记录的目标
        if (goal.probeResult === null && goal.trials.length === 0 && goal.finalProbeResult === null) return;

        const correctCount = goal.trials.filter(t => t === '+').length;
        const totalCount = goal.trials.length;
        const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        addTrainingRecord({
          studentId,
          goalId: goal.goalId,
          recordDate: session.date || new Date().toISOString().split('T')[0],
          value: accuracy,
          totalTrials: totalCount || 1,
          correctTrials: correctCount,
          errorTrials: totalCount - correctCount,
          promptLevel: goal.promptLevel ?? 0,
          barrierTags: goal.barrierTags || [],
          notes: goal.passed === true ? '上课通过' : goal.passed === false ? '上课未通过' : '上课记录',
          recorderId: currentUser?.id,
          recorderName: currentUser?.name,
        });
      });
    }

    // 更新会话状态
    updateTeachingSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    setCompleteSuccess(true);
    refreshSession();

    // 2秒后跳转
    setTimeout(() => {
      navigate(`/students/${studentId}`, { replace: true });
    }, 2000);
  }, [session, sessionId, studentId, navigate, refreshSession, currentUser]);

  // 计算进度
  const completedCount = session
    ? session.trialGoals.filter(tg => tg.passed !== null).length
    : 0;
  const totalCount = session ? session.trialGoals.length : 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 加载失败
  if (!student) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">找不到该学生</p>
        <Link to="/students" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          返回学生列表
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">找不到该教学会话</p>
        <Link to={`/students/${studentId}`} className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          返回学生详情
        </Link>
      </div>
    );
  }

  const isSessionCompleted = session.status === 'completed';

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/students/${studentId}`}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">返回学生详情</span>
        </Link>
      </div>

      {/* 标题区 */}
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {student.name} - 上课记录
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span>{session.date || session.createdAt?.split('T')[0] || '未设置日期'}</span>
              <span>教师：{currentUser?.name || '未知'}</span>
              {isSessionCompleted && (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle size={14} />
                  已完成
                </span>
              )}
            </div>
          </div>
          {!isSessionCompleted && (
            <button
              onClick={() => setShowCompleteConfirm(true)}
              className="text-sm text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              <Save size={14} />
              提前完成
            </button>
          )}
        </div>
      </div>

      {/* 粘性进度条 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 -mx-6 px-6 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              已完成 {completedCount}/{totalCount} 个目标
            </span>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{progressPct}%</span>
          </div>

          {/* 快速跳转按钮 */}
          <div className="flex gap-1.5">
            {session.trialGoals.map((tg, i) => {
              const st = getGoalStatus(tg);
              const isPass = st === 'pass';
              const isFail = st === 'fail';
              const isRecording = st === 'recording';
              return (
                <button
                  key={tg.goalId}
                  onClick={() => {
                    const el = document.getElementById(`goal-${tg.goalId}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isPass
                      ? 'bg-emerald-500 text-white'
                      : isFail
                      ? 'bg-red-500 text-white'
                      : isRecording
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title={tg.description}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 成功提示 */}
      {completeSuccess && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <Trophy size={20} className="text-emerald-600" />
          <span className="text-emerald-700 font-medium">上课记录已保存！正在返回...</span>
        </div>
      )}

      {/* 目标卡片列表 */}
      <div className="space-y-4">
        {session.trialGoals.map((goal, index) => (
          <GoalCard
            key={goal.goalId}
            goal={goal}
            index={index}
            sessionId={sessionId}
            onUpdate={handleGoalUpdate}
          />
        ))}
      </div>

      {/* 底部吸底完成按钮 */}
      {!isSessionCompleted && (
        <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200 -mx-6 px-6 py-4 mt-6">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="text-sm text-slate-500">
              已完成 <span className="font-bold text-primary-600">{completedCount}</span> / {totalCount} 个目标
            </div>
            <button
              onClick={() => setShowCompleteConfirm(true)}
              className="btn-primary flex items-center gap-2 text-base px-8 py-3"
            >
              <Save size={20} />
              完成上课
            </button>
          </div>
        </div>
      )}

      {isSessionCompleted && (
        <div className="sticky bottom-0 z-10 bg-emerald-50/95 backdrop-blur-sm border-t border-emerald-200 -mx-6 px-6 py-4 mt-6">
          <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium max-w-5xl mx-auto">
            <CheckCircle size={18} />
            本节课已完成 · {session.completedAt ? new Date(session.completedAt).toLocaleString('zh-CN') : ''}
          </div>
        </div>
      )}

      {session.trialGoals.length === 0 && (
        <div className="card p-12 text-center">
          <Play size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">本节课暂无教学目标</p>
          <p className="text-sm text-slate-400 mt-1">请先在备课页面选择教学目标</p>
        </div>
      )}

      {/* 完成确认对话框 */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-3">确认完成上课？</h3>
            <div className="text-sm text-slate-600 mb-4 space-y-2">
              <p>已完成目标：<span className="font-bold text-emerald-600">{completedCount}</span> / {totalCount}</p>
              <p>未完成目标：<span className="font-bold text-amber-600">{totalCount - completedCount}</span></p>
              {totalCount - completedCount > 0 && (
                <p className="text-amber-600">
                  注意：还有 {totalCount - completedCount} 个目标未完成，未完成的目标将不会被判定。
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="btn-secondary px-4 py-2"
              >
                继续上课
              </button>
              <button
                onClick={handleCompleteSession}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Save size={16} />
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
