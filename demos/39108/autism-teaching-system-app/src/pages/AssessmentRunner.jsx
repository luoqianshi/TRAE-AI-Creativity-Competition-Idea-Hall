import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, SkipForward, CheckCircle, Save } from 'lucide-react';
import {
  getStudentById, getAssessmentQueue, updateAssessmentQueueItem,
  updateAssessmentQueue, syncAssessmentQueueToSkillStatuses, deleteAssessmentQueue,
} from '../data/store';
import { VB_MAPP_DOMAINS, VB_MAPP_LEVELS } from '../data/vbmapp';
import ProgressBar from '../components/ProgressBar';
import StatusSelector from '../components/StatusSelector';

export default function AssessmentRunner() {
  const { id, queueId } = useParams();
  const navigate = useNavigate();
  const student = getStudentById(id);

  const [queue, setQueue] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  // 加载队列
  useEffect(() => {
    const q = getAssessmentQueue(queueId);
    if (!q) {
      navigate(`/students/${id}/assessment`);
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
      const hasProgress = queue?.items.some(i => i.status === 'assessed' || i.status === 'skipped');
      if (hasProgress) {
        updateAssessmentQueue(queueId, { status: 'in_progress' });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [queue, queueId]);

  // 检查是否全部完成
  useEffect(() => {
    if (!queue) return;
    const allDone = queue.items.every(i => i.status !== 'pending');
    if (allDone && !showSummary) {
      setShowSummary(true);
    }
  }, [queue, showSummary]);

  if (!queue || !student) return <div className="p-6">加载中...</div>;

  const currentItem = queue.items[currentIndex];
  const totalItems = queue.items.length;
  const assessedCount = queue.items.filter(i => i.status === 'assessed').length;
  const skippedCount = queue.items.filter(i => i.status === 'skipped').length;
  const isLastItem = currentIndex === totalItems - 1;

  // 选择评估状态 - 自动保存并跳转下一项
  const handleStatusChange = (status) => {
    if (!currentItem) return;
    // 立即保存到队列
    updateAssessmentQueueItem(queueId, currentItem.id, {
      result: status,
      status: 'assessed',
      assessedAt: new Date().toISOString(),
    });
    const updated = getAssessmentQueue(queueId);
    setQueue(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
    // 短暂延迟后自动跳转下一项（让用户看到选中反馈）
    if (!isLastItem) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 400);
    } else {
      // 最后一项，显示总结
      setTimeout(() => setShowSummary(true), 600);
    }
  };

  const handleSkip = () => {
    if (!currentItem) return;
    updateAssessmentQueueItem(queueId, currentItem.id, { status: 'skipped' });
    const updated = getAssessmentQueue(queueId);
    setQueue(updated);
    if (!isLastItem) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (!isLastItem) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    syncAssessmentQueueToSkillStatuses(queueId);
    updateAssessmentQueue(queueId, { status: 'completed' });
    navigate(`/students/${id}/assessment`);
  };

  const handleExit = () => {
    const hasProgress = queue.items.some(i => i.status === 'assessed' || i.status === 'skipped');
    if (hasProgress) {
      updateAssessmentQueue(queueId, { status: 'in_progress' });
    }
    navigate(`/students/${id}/assessment`);
  };

  // 保存结果并同步到评估数据
  const handleSaveResults = () => {
    syncAssessmentQueueToSkillStatuses(queueId);
    updateAssessmentQueue(queueId, { status: 'in_progress' });
    setSaveConfirmed(true);
    setTimeout(() => setSaveConfirmed(false), 2000);
  };

  const handleDiscard = () => {
    if (window.confirm('确定要放弃此评估队列吗？已评估的数据将不会同步。')) {
      deleteAssessmentQueue(queueId);
      navigate(`/students/${id}/assessment`);
    }
  };

  const domainInfo = VB_MAPP_DOMAINS[currentItem?.domainKey];
  const levelInfo = VB_MAPP_LEVELS[currentItem?.level];

  // 总结页面
  if (showSummary) {
    const results = { not_mastered: 0, partial: 0, mastered: 0, generalized: 0, skipped: 0 };
    queue.items.forEach(i => {
      if (i.status === 'skipped') results.skipped++;
      else if (i.result) results[i.result]++;
    });

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <Link to={`/students/${id}/assessment`} className="p-1 rounded-md hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-bold">评估完成</h1>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">评估结果统计</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{results.not_mastered}</p>
                <p className="text-xs text-red-500">未掌握</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{results.partial}</p>
                <p className="text-xs text-amber-500">部分掌握</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{results.mastered}</p>
                <p className="text-xs text-green-500">已掌握</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{results.generalized}</p>
                <p className="text-xs text-blue-500">已泛化</p>
              </div>
            </div>
            {results.skipped > 0 && (
              <p className="text-xs text-slate-400 text-center mt-2">跳过 {results.skipped} 项</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">逐项回顾</h2>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {queue.items.map((item, idx) => {
                const d = VB_MAPP_DOMAINS[item.domainKey];
                const statusLabels = {
                  not_mastered: '未掌握', partial: '部分掌握', mastered: '已掌握', generalized: '已泛化',
                };
                const statusColors = {
                  not_mastered: 'text-red-600 bg-red-50', partial: 'text-amber-600 bg-amber-50',
                  mastered: 'text-green-600 bg-green-50', generalized: 'text-blue-600 bg-blue-50',
                };
                return (
                  <div key={item.id} className="flex items-center gap-2 py-1.5">
                    <span className="text-xs text-slate-400 w-5">{idx + 1}</span>
                    <p className="flex-1 text-sm text-slate-700 truncate">{item.description}</p>
                    {item.status === 'skipped' ? (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">跳过</span>
                    ) : item.result ? (
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[item.result]}`}>
                        {statusLabels[item.result]}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom space-y-2">
          <button
            onClick={handleFinish}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <CheckCircle size={18} />
            完成并同步评估数据
          </button>
          <button
            onClick={handleDiscard}
            className="w-full py-2 text-sm text-slate-400 hover:text-red-500"
          >
            放弃（不保存）
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={handleExit} className="p-1 rounded-md hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-bold">{student.name}</h1>
            <p className="text-xs text-slate-500">{domainInfo?.icon} {domainInfo?.name} · {levelInfo?.name}</p>
          </div>
          {saved && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full animate-pulse">
              已保存
            </span>
          )}
        </div>
        <ProgressBar
          current={assessedCount + skippedCount}
          total={totalItems}
          items={queue.items}
        />
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="text-center mb-2">
          <span className="text-xs text-slate-400">{currentItem.code}</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl md:text-2xl font-semibold text-slate-800 text-center leading-relaxed px-4">
            {currentItem.description}
          </p>
        </div>
        <div className="mt-4">
          <StatusSelector
            value={currentItem.result}
            onChange={handleStatusChange}
          />
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-4 safe-area-bottom">
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-sm flex items-center justify-center gap-1 disabled:opacity-40 active:scale-[0.98]"
          >
            <ChevronLeft size={16} />
            上一项
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
              <>
                <CheckCircle size={16} />
                完成
              </>
            ) : (
              <>
                下一项
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
        {/* 保存结果按钮 */}
        <button
          onClick={handleSaveResults}
          className={`w-full mt-2 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
            saveConfirmed
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-white border border-slate-300 text-slate-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50'
          }`}
        >
          <Save size={14} />
          {saveConfirmed ? '已保存并同步到评估数据' : '保存结果'}
        </button>
      </div>
    </div>
  );
}
