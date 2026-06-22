import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, SkipForward, CheckCircle,
  RotateCcw, ChevronDown, ChevronUp, Undo2,
} from 'lucide-react';
import {
  getStudentById, getTeachingQueue, updateTeachingQueueItem,
  updateTeachingQueue, syncTeachingQueueToSession, deleteTeachingQueue, PROMPT_LEVELS, BARRIER_TAGS,
} from '../data/store';
import { VB_MAPP_DOMAINS } from '../data/vbmapp';
import ProgressBar from '../components/ProgressBar';
import TrialInputPad from '../components/TrialInputPad';

export default function TeachingRunner() {
  const { id, queueId } = useParams();
  const navigate = useNavigate();
  const student = getStudentById(id);

  const [queue, setQueue] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [recordTab, setRecordTab] = useState('probe'); // 'probe' | 'trials' | 'final'

  useEffect(() => {
    const q = getTeachingQueue(queueId);
    if (!q) {
      navigate(`/students/${id}/training`);
      return;
    }
    setQueue(q);
    const firstPending = q.items.findIndex(i => i.status === 'pending');
    if (firstPending !== -1) {
      setCurrentIndex(firstPending);
    }
  }, [queueId, id, navigate]);

  // 页面卸载时自动保存进度
  useEffect(() => {
    const handleBeforeUnload = () => {
      const hasProgress = queue?.items.some(i => i.status === 'recording' || i.status === 'completed' || i.status === 'skipped');
      if (hasProgress) {
        updateTeachingQueue(queueId, { status: 'in_progress' });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [queue, queueId]);

  // 全部完成检查
  useEffect(() => {
    if (!queue) return;
    const allDone = queue.items.every(i => i.status === 'completed' || i.status === 'skipped');
    if (allDone && !showSummary) {
      setShowSummary(true);
    }
  }, [queue, showSummary]);

  if (!queue || !student) return <div className="p-6">加载中...</div>;

  const currentItem = queue.items[currentIndex];
  const totalItems = queue.items.length;
  const completedCount = queue.items.filter(i => i.status === 'completed').length;
  const skippedCount = queue.items.filter(i => i.status === 'skipped').length;
  const isLastItem = currentIndex === totalItems - 1;

  // 保存并刷新
  const saveAndRefresh = (itemId, updates) => {
    updateTeachingQueueItem(queueId, itemId, updates);
    const updated = getTeachingQueue(queueId);
    setQueue(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  // 首测
  const handleProbe = (result) => {
    if (!currentItem) return;
    saveAndRefresh(currentItem.id, {
      probeResult: result,
      status: 'recording',
    });
  };

  // 逐次记录
  const handleTrialInput = (value) => {
    if (!currentItem) return;
    const newTrials = [...(currentItem.trials || []), value];
    saveAndRefresh(currentItem.id, {
      trials: newTrials,
      status: 'recording',
    });
  };

  // 撤销上一回合
  const handleUndoTrial = () => {
    if (!currentItem || !currentItem.trials?.length) return;
    const newTrials = currentItem.trials.slice(0, -1);
    saveAndRefresh(currentItem.id, { trials: newTrials });
  };

  // 尾测
  const handleFinalProbe = (result) => {
    if (!currentItem) return;
    saveAndRefresh(currentItem.id, {
      finalProbeResult: result,
      status: 'recording',
    });
  };

  // 判定当前目标
  const judgeCurrentGoal = () => {
    if (!currentItem) return null;
    if (currentItem.probeResult === '+' && currentItem.finalProbeResult === '+') return true;
    if (currentItem.trials?.length >= 10) {
      const correct = currentItem.trials.filter(t => t === '+').length;
      return correct >= 8;
    }
    return null;
  };

  // 完成当前目标
  const handleCompleteGoal = () => {
    if (!currentItem) return;
    const passed = judgeCurrentGoal();
    saveAndRefresh(currentItem.id, {
      status: 'completed',
      passed: passed,
    });
  };

  // 跳过
  const handleSkip = () => {
    if (!currentItem) return;
    saveAndRefresh(currentItem.id, { status: 'skipped' });
    if (!isLastItem) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // 重置当前目标
  const handleReset = () => {
    if (!currentItem) return;
    saveAndRefresh(currentItem.id, {
      status: 'pending',
      probeResult: null,
      trials: [],
      finalProbeResult: null,
      passed: null,
    });
  };

  // 下一目标
  const handleNext = () => {
    if (!isLastItem) {
      // 如果当前目标已有记录数据但未完成，自动保存为 recording 状态（防止误触丢失）
      if (currentItem?.status === 'pending' && (
        currentItem.probeResult || (currentItem.trials?.length > 0) || currentItem.finalProbeResult
      )) {
        saveAndRefresh(currentItem.id, { status: 'recording' });
      }
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // 退出并保存进度
  const handleExit = () => {
    const hasProgress = queue.items.some(i => i.status === 'recording' || i.status === 'completed' || i.status === 'skipped');
    if (hasProgress) {
      updateTeachingQueue(queueId, { status: 'in_progress' });
    }
    navigate(`/students/${id}/training`);
  };

  // 完成上课 - 跳转到训练记录页
  const handleFinish = () => {
    syncTeachingQueueToSession(queueId);
    navigate(`/students/${id}/training?tab=record`);
  };

  const domainInfo = VB_MAPP_DOMAINS[currentItem?.domain];
  const typeLabels = { acquisition: '新授', maintenance: '维持', review: '复习' };
  const typeColors = { acquisition: 'bg-blue-100 text-blue-700', maintenance: 'bg-purple-100 text-purple-700', review: 'bg-green-100 text-green-700' };
  const passed = judgeCurrentGoal();

  // 总结页面
  if (showSummary) {
    const passCount = queue.items.filter(i => i.passed === true).length;
    const failCount = queue.items.filter(i => i.passed === false).length;
    const noResult = queue.items.filter(i => i.passed === null && i.status !== 'skipped').length;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <Link to={`/students/${id}/training?tab=record`} className="p-1 rounded-md hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-bold">上课完成</h1>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">结果统计</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{passCount}</p>
                <p className="text-xs text-green-500">通过</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{failCount}</p>
                <p className="text-xs text-red-500">未通过</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-500">{noResult + skippedCount}</p>
                <p className="text-xs text-slate-400">未判定/跳过</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">目标回顾</h2>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {queue.items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 py-1.5">
                  <span className="text-xs text-slate-400 w-5">{idx + 1}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[item.type]}`}>
                    {typeLabels[item.type]}
                  </span>
                  <p className="flex-1 text-sm text-slate-700 truncate">{item.description}</p>
                  {item.status === 'skipped' ? (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">跳过</span>
                  ) : item.passed === true ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">通过</span>
                  ) : item.passed === false ? (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">未通过</span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom">
          <button
            onClick={handleFinish}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <CheckCircle size={18} />
            完成并同步上课数据
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={handleExit} className="p-1 rounded-md hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-bold">{student.name}</h1>
            <p className="text-xs text-slate-500">
              {typeLabels[currentItem?.type]} · {domainInfo?.name}
            </p>
          </div>
          {saved && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full animate-pulse">已保存</span>
          )}
        </div>
        <ProgressBar current={completedCount + skippedCount} total={totalItems} items={queue.items} />
      </div>

      {/* 目标描述 */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-400">#{currentIndex + 1}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[currentItem?.type]}`}>
            {typeLabels[currentItem?.type]}
          </span>
          {passed === true && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-auto">已通过</span>
          )}
          {passed === false && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full ml-auto">未通过</span>
          )}
        </div>
        <p className="text-lg font-semibold text-slate-800">{currentItem?.description}</p>
        {currentItem?.hierarchyPath && (
          <p className="text-xs text-slate-400 mt-0.5">{currentItem.hierarchyPath}</p>
        )}
      </div>

      {/* 记录模式切换 */}
      <div className="bg-white px-4 py-2 border-b border-slate-100">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[
            { key: 'probe', label: '首测' },
            { key: 'trials', label: '逐次记录' },
            { key: 'final', label: '尾测' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setRecordTab(tab.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                recordTab === tab.key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 记录区域 */}
      <div className="flex-1 p-4">
        {/* 首测 */}
        {recordTab === 'probe' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-slate-500">首测探针</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleProbe('+')}
                className={`w-20 h-20 rounded-2xl text-2xl font-bold flex items-center justify-center transition-all active:scale-95 ${
                  currentItem?.probeResult === '+'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                +
              </button>
              <button
                onClick={() => handleProbe('-')}
                className={`w-20 h-20 rounded-2xl text-2xl font-bold flex items-center justify-center transition-all active:scale-95 ${
                  currentItem?.probeResult === '-'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                -
              </button>
            </div>
            {currentItem?.probeResult && (
              <p className="text-sm text-slate-500">
                首测结果：{currentItem.probeResult === '+' ? '正确' : '错误'}
              </p>
            )}
          </div>
        )}

        {/* 逐次记录 */}
        {recordTab === 'trials' && (
          <div className="space-y-4">
            {/* 回合槽位 */}
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => {
                const trial = currentItem?.trials?.[i];
                let bg = 'bg-slate-100 text-slate-400';
                if (trial === '+') bg = 'bg-green-500 text-white';
                else if (trial === '-') bg = 'bg-red-500 text-white';
                else if (trial === 'P+') bg = 'bg-blue-500 text-white';
                else if (trial === 'P-') bg = 'bg-orange-500 text-white';
                return (
                  <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold ${bg}`}>
                    {trial || (i + 1)}
                  </div>
                );
              })}
            </div>

            {/* 撤销按钮 */}
            {currentItem?.trials?.length > 0 && (
              <button
                onClick={handleUndoTrial}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mx-auto"
              >
                <Undo2 size={14} />
                撤销上回合
              </button>
            )}

            {/* 输入面板 */}
            <TrialInputPad
              onInput={handleTrialInput}
              disabled={currentItem?.trials?.length >= 10}
              trialCount={currentItem?.trials?.length || 0}
            />

            {/* 统计 */}
            {currentItem?.trials?.length > 0 && (
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-green-600">
                  正确: {currentItem.trials.filter(t => t === '+').length}
                </span>
                <span className="text-red-600">
                  错误: {currentItem.trials.filter(t => t === '-').length}
                </span>
                <span className="text-blue-600">
                  提示正确: {currentItem.trials.filter(t => t === 'P+').length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 尾测 */}
        {recordTab === 'final' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-slate-500">尾测探针</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleFinalProbe('+')}
                className={`w-20 h-20 rounded-2xl text-2xl font-bold flex items-center justify-center transition-all active:scale-95 ${
                  currentItem?.finalProbeResult === '+'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                +
              </button>
              <button
                onClick={() => handleFinalProbe('-')}
                className={`w-20 h-20 rounded-2xl text-2xl font-bold flex items-center justify-center transition-all active:scale-95 ${
                  currentItem?.finalProbeResult === '-'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                -
              </button>
            </div>
            {currentItem?.finalProbeResult && (
              <p className="text-sm text-slate-500">
                尾测结果：{currentItem.finalProbeResult === '+' ? '正确' : '错误'}
              </p>
            )}
          </div>
        )}

        {/* 更多选项 */}
        <div className="mt-4">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mx-auto"
          >
            {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showMore ? '收起更多选项' : '更多选项'}
          </button>
          {showMore && (
            <div className="mt-3 space-y-3 p-3 bg-white rounded-lg border border-slate-200">
              {/* 辅助层级 */}
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1.5">辅助层级</p>
                <div className="flex gap-2">
                  {PROMPT_LEVELS.map(pl => (
                    <button
                      key={pl.level}
                      onClick={() => saveAndRefresh(currentItem.id, { promptLevel: pl.level })}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                        currentItem?.promptLevel === pl.level
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* 障碍标签 */}
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1.5">障碍归因</p>
                <div className="flex flex-wrap gap-1.5">
                  {BARRIER_TAGS.map(tag => {
                    const isSelected = currentItem?.barrierTags?.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const current = currentItem?.barrierTags || [];
                          const newTags = isSelected
                            ? current.filter(t => t !== tag.id)
                            : [...current, tag.id];
                          saveAndRefresh(currentItem.id, { barrierTags: newTags });
                        }}
                        className={`px-2 py-1 text-xs rounded-full border transition-all ${
                          isSelected
                            ? 'border-current text-current'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                        style={isSelected ? { borderColor: tag.color, color: tag.color } : {}}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* 重置 */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 mx-auto"
              >
                <RotateCcw size={12} />
                重置此目标记录
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 吸底导航 */}
      <div className="bg-white border-t border-slate-200 p-4 safe-area-bottom">
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-sm flex items-center justify-center gap-1 disabled:opacity-40 active:scale-[0.98]"
          >
            <ChevronLeft size={16} />
            上一个
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-sm flex items-center justify-center gap-1 active:scale-[0.98]"
          >
            <SkipForward size={16} />
            跳过
          </button>
          <button
            onClick={isLastItem ? () => setShowSummary(true) : handleNext}
            className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-1 active:scale-[0.98]"
          >
            {isLastItem ? (
              <><CheckCircle size={16} /> 完成</>
            ) : (
              <>下一个 <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
