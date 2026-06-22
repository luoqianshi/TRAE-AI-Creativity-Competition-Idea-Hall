import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, CheckCircle, ShieldAlert } from 'lucide-react';
import { getStudentById, getGoalsByStudent, getTrainingRecordsByStudent, addTrainingRecord, BARRIER_TAGS, PROMPT_LEVELS, getCurrentUser, hasPermission, getGoalsByType } from '../data/store';

const PROMPT_LEVEL_COLORS = {
  0: 'tag-success',
  1: 'tag-primary',
  2: 'tag-warn',
  3: 'tag-danger',
};

export default function TrainingRecord() {
  const { id } = useParams();
  const student = getStudentById(id);
  const goals = getGoalsByType(id, 'level3');
  const [records, setRecords] = useState(getTrainingRecordsByStudent(id));
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    goalId: '',
    dataType: '准确率',
    promptLevel: 1,
    barrierTags: [],
    correctTrials: '',
    errorTrials: '',
    notes: ''
  });

  const canEdit = hasPermission('teacher');

  if (!student) return <div className="text-center py-12 text-slate-500">学生不存在</div>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleBarrierTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      barrierTags: prev.barrierTags.includes(tagId)
        ? prev.barrierTags.filter(t => t !== tagId)
        : [...prev.barrierTags, tagId]
    }));
  };

  const handleSubmit = () => {
    const correctTrials = parseInt(formData.correctTrials);
    const errorTrials = parseInt(formData.errorTrials);
    const totalTrials = correctTrials + errorTrials;
    const newRecord = addTrainingRecord({
      ...formData,
      studentId: id,
      recordDate: new Date().toISOString().split('T')[0],
      recorderName: getCurrentUser()?.name || '未知',
      value: correctTrials,
      promptLevel: parseInt(formData.promptLevel),
      barrierTags: formData.barrierTags,
      correctTrials,
      errorTrials,
      totalTrials,
      recorderId: getCurrentUser()?.id,
    });
    setRecords([newRecord, ...records]);
    setShowForm(false);
    setFormData({ goalId: '', dataType: '准确率', promptLevel: 1, barrierTags: [], correctTrials: '', errorTrials: '', notes: '' });
    setSuccessMsg('记录已保存！');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const getAccuracy = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getSelectedGoal = () => goals.find(g => g.id === formData.goalId);

  const getBarrierTagInfo = (tagId) => BARRIER_TAGS.find(t => t.id === tagId);

  const getPromptLevelInfo = (level) => PROMPT_LEVELS.find(p => p.level === level);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{student.name} - 训练记录</h1>
        {canEdit && (
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={18} />
            {showForm ? '取消' : '快速记录'}
          </button>
        )}
      </div>

      {/* Assistant notice */}
      {!canEdit && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <ShieldAlert size={20} className="text-amber-600 shrink-0" />
          <span className="text-amber-800 text-sm font-medium">助教账号仅可查看训练记录</span>
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Quick Record Form */}
      {canEdit && showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">快速记录</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">选择目标 *</label>
              <select name="goalId" value={formData.goalId} onChange={handleChange} className="input">
                <option value="">请选择目标...</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">辅助层级 *</label>
              <select name="promptLevel" value={formData.promptLevel} onChange={handleChange} className="input">
                {PROMPT_LEVELS.map(pl => (
                  <option key={pl.level} value={pl.level}>{pl.name} - {pl.description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">正确次数 *</label>
              <input
                name="correctTrials"
                type="number"
                min="0"
                value={formData.correctTrials}
                onChange={handleChange}
                className="input"
                placeholder="例如：4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">错误次数 *</label>
              <input
                name="errorTrials"
                type="number"
                min="0"
                value={formData.errorTrials}
                onChange={handleChange}
                className="input"
                placeholder="例如：1"
              />
            </div>
          </div>

          {/* Accuracy preview */}
          {formData.correctTrials && formData.errorTrials && (
            <div className="mt-3 p-3 bg-primary-50 rounded-lg">
              <span className="text-sm text-primary-700">
                总机会数：{parseInt(formData.correctTrials) + parseInt(formData.errorTrials)} | 准确率：{getAccuracy(parseInt(formData.correctTrials), parseInt(formData.correctTrials) + parseInt(formData.errorTrials))}%
              </span>
            </div>
          )}

          {/* Barrier Tags */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">障碍归因标签</label>
            <div className="flex flex-wrap gap-2">
              {BARRIER_TAGS.map(tag => {
                const selected = formData.barrierTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleBarrierTag(tag.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all cursor-pointer"
                    style={{
                      borderColor: selected ? tag.color : '#e2e8f0',
                      backgroundColor: selected ? tag.color + '18' : '#f8fafc',
                      color: selected ? tag.color : '#64748b',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input h-16 resize-none"
              placeholder="记录训练中的观察..."
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!formData.goalId || !formData.correctTrials || formData.errorTrials === ''}
            >
              保存记录
            </button>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">历史记录</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {records.map(record => {
            const goal = goals.find(g => g.id === record.goalId);
            const promptInfo = getPromptLevelInfo(record.promptLevel);
            const recordCorrect = record.correctTrials ?? record.value;
            const recordTotal = record.totalTrials;
            const recordError = record.errorTrials ?? (recordTotal - recordCorrect);
            return (
              <div key={record.id} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{goal?.description || '未知目标'}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      {record.recordDate} · {record.recorderName}
                    </div>

                    {/* Prompt Level Badge */}
                    {promptInfo && (
                      <div className="mt-2">
                        <span className={`tag ${PROMPT_LEVEL_COLORS[record.promptLevel] || 'tag-primary'}`}>
                          辅助：{promptInfo.name}
                        </span>
                      </div>
                    )}

                    {/* Barrier Tags */}
                    {record.barrierTags && record.barrierTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {record.barrierTags.map(tagId => {
                          const tagInfo = getBarrierTagInfo(tagId);
                          if (!tagInfo) return null;
                          return (
                            <span
                              key={tagId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: tagInfo.color + '20',
                                color: tagInfo.color,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: tagInfo.color }}
                              />
                              {tagInfo.name}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {record.notes && (
                      <div className="text-sm text-slate-600 mt-1">{record.notes}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-lg font-bold text-primary-600">
                      {getAccuracy(recordCorrect, recordTotal)}%
                    </div>
                    <div className="text-xs mt-1 flex items-center gap-1 justify-end">
                      <span className="text-emerald-600 font-semibold">{recordCorrect}</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-red-500 font-semibold">{recordError}</span>
                      <span className="text-slate-400 ml-0.5">({recordTotal})</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {records.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            暂无训练记录
          </div>
        )}
      </div>
    </div>
  );
}
