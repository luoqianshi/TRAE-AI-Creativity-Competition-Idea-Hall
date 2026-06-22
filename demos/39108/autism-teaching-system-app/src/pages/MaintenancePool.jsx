import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RefreshCw, CheckCircle, XCircle, Clock, ArrowLeft, Plus, AlertTriangle } from 'lucide-react';
import {
  getStudentById,
  getMaintenancePool,
  getMasteredLibrary,
  addMaintenanceRecord,
  addToMaintenancePool,
  getGoalsByType,
  hasPermission,
} from '../data/store';

export default function MaintenancePool() {
  const { id } = useParams();
  const student = getStudentById(id);

  const [pool, setPool] = useState(getMaintenancePool(id));
  const [library, setLibrary] = useState(getMasteredLibrary(id));
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');

  // 每个观察池条目的记录表单
  const [recordForms, setRecordForms] = useState({});

  if (!student) {
    return <div className="text-center py-12 text-slate-500">学生不存在</div>;
  }

  const canEdit = hasPermission('teacher');

  // 获取已精熟的 level3 目标（用于手动添加到维持池）
  const masteredGoals = getGoalsByType(id, 'level3').filter(
    (g) => g.status === 'mastered' && !pool.some((p) => p.goalId === g.id)
  );

  const observingCount = pool.filter((p) => p.status === 'observing').length;
  const passedCount = pool.filter((p) => p.status === 'passed').length;
  const failedCount = pool.filter((p) => p.status === 'failed').length;

  const handleAddRecord = (poolId) => {
    const form = recordForms[poolId];
    if (!form || !form.accuracy || !form.date) return;

    const updated = addMaintenanceRecord(poolId, parseInt(form.accuracy), form.date);
    setPool(getMaintenancePool(id));
    setLibrary(getMasteredLibrary(id));
    setRecordForms((prev) => ({ ...prev, [poolId]: { accuracy: '', date: '' } }));
  };

  const handleAddToPool = () => {
    if (!selectedGoalId) return;
    const goal = masteredGoals.find((g) => g.id === selectedGoalId);
    if (!goal) return;

    addToMaintenancePool(goal.id, id, goal.description);
    setPool(getMaintenancePool(id));
    setShowAddForm(false);
    setSelectedGoalId('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'observing':
        return (
          <span className="tag tag-primary flex items-center gap-1">
            <Clock size={14} />
            观察中
          </span>
        );
      case 'passed':
        return (
          <span className="tag tag-success flex items-center gap-1">
            <CheckCircle size={14} />
            已进入精熟库
          </span>
        );
      case 'failed':
        return (
          <span className="tag tag-danger flex items-center gap-1">
            <AlertTriangle size={14} />
            需回流训练
          </span>
        );
      default:
        return null;
    }
  };

  const renderAccuracyBadges = (records) => {
    if (!records || records.length === 0) {
      return <span className="text-xs text-slate-400">暂无记录</span>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {records.map((r, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center justify-center w-12 h-7 rounded text-xs font-bold ${
              r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {r.accuracy}%
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* 返回按钮 */}
      <Link
        to={`/students/${id}`}
        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">返回学生详情</span>
      </Link>

      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {student.name} - 精熟维持池
        </h1>
        {canEdit && masteredGoals.length > 0 && (
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={18} />
            {showAddForm ? '取消' : '添加到维持池'}
          </button>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
            <RefreshCw size={16} />
            观察中
          </div>
          <div className="text-2xl font-bold text-blue-600">{observingCount}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald-600 text-sm mb-2">
            <CheckCircle size={16} />
            已通过 / 进入精熟库
          </div>
          <div className="text-2xl font-bold text-emerald-600">{passedCount}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
            <XCircle size={16} />
            需回流
          </div>
          <div className="text-2xl font-bold text-red-600">{failedCount}</div>
        </div>
      </div>

      {/* 添加到维持池表单 */}
      {showAddForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">添加已精熟技能到维持池</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                选择已精熟目标
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="input"
              >
                <option value="">请选择...</option>
                {masteredGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.description}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn-primary"
              onClick={handleAddToPool}
              disabled={!selectedGoalId}
            >
              确认添加
            </button>
          </div>
        </div>
      )}

      {/* 观察池列表 */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">观察池列表</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {pool.map((entry) => (
            <div key={entry.id} className="px-6 py-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-slate-800 text-lg">{entry.skillName}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    进入日期：{entry.enteredDate} · 当前：第{entry.week}周
                  </div>
                </div>
                <div>{getStatusBadge(entry.status)}</div>
              </div>

              {/* 第1周记录 */}
              <div className="mb-3">
                <div className="text-sm font-medium text-slate-600 mb-1">第1周记录</div>
                {renderAccuracyBadges(entry.week1Records)}
              </div>

              {/* 第2周记录 */}
              {entry.week >= 2 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-slate-600 mb-1">第2周记录</div>
                  {renderAccuracyBadges(entry.week2Records)}
                </div>
              )}

              {/* 已通过提示 */}
              {entry.status === 'passed' && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  该技能已通过双周维持观察，已进入精熟库。
                </div>
              )}

              {/* 需回流提示 */}
              {entry.status === 'failed' && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  该技能未通过双周维持观察，目标进度已重置，需要回流重新训练。
                </div>
              )}

              {/* 添加记录表单（仅观察中且可编辑时显示） */}
              {entry.status === 'observing' && canEdit && (
                <div className="mt-3 p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-2">
                    添加第{entry.week}周观察记录
                  </div>
                  <div className="flex items-end gap-3 flex-wrap">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">准确率 (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="input w-24"
                        placeholder="80"
                        value={recordForms[entry.id]?.accuracy || ''}
                        onChange={(e) =>
                          setRecordForms((prev) => ({
                            ...prev,
                            [entry.id]: {
                              ...prev[entry.id],
                              accuracy: e.target.value,
                              date: prev[entry.id]?.date || new Date().toISOString().split('T')[0],
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">日期</label>
                      <input
                        type="date"
                        className="input"
                        value={
                          recordForms[entry.id]?.date ||
                          new Date().toISOString().split('T')[0]
                        }
                        onChange={(e) =>
                          setRecordForms((prev) => ({
                            ...prev,
                            [entry.id]: {
                              ...prev[entry.id],
                              date: e.target.value,
                              accuracy: prev[entry.id]?.accuracy || '',
                            },
                          }))
                        }
                      />
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => handleAddRecord(entry.id)}
                      disabled={
                        !recordForms[entry.id]?.accuracy || !recordForms[entry.id]?.date
                      }
                    >
                      保存
                    </button>
                  </div>
                </div>
              )}

              {/* 助教只读提示 */}
              {entry.status === 'observing' && !canEdit && (
                <div className="mt-3 text-xs text-slate-400">
                  仅教师及以上权限可添加观察记录
                </div>
              )}
            </div>
          ))}
          {pool.length === 0 && (
            <div className="text-center py-8 text-slate-500">暂无观察中的技能</div>
          )}
        </div>
      </div>

      {/* 精熟库 */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">精熟库</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {library.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{item.skillName}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    领域：{item.domain || '-'} · 精熟日期：{item.masteredDate} · 复习次数：{item.reviewCount}
                  </div>
                </div>
                <button
                  className="btn-secondary text-sm"
                  onClick={() => alert('随机复习功能开发中，敬请期待！')}
                >
                  随机复习
                </button>
              </div>
            </div>
          ))}
          {library.length === 0 && (
            <div className="text-center py-8 text-slate-500">精熟库为空</div>
          )}
        </div>
      </div>
    </div>
  );
}
