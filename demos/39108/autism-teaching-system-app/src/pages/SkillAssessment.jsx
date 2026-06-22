import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Save, Info, FileUp, Trash2, FileText, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import {
  getStudentById,
  updateSkillStatus,
  hasPermission,
  getAttachmentsByStudent,
  addAttachment,
  deleteAttachment,
  getCurrentUser,
} from '../data/store';
import { VB_MAPP_DOMAINS, VB_MAPP_LEVELS as VB_MAPP_LEVEL_LABELS, VB_MAPP_SKILLS, SECONDARY_DOMAINS } from '../data/vbmapp';

const STATUS_OPTIONS = [
  { value: 'not_mastered', label: '未掌握', score: 0, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { value: 'partial', label: '部分掌握', score: 0.5, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { value: 'mastered', label: '已掌握', score: 1, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { value: 'generalized', label: '已泛化', score: 1.5, color: 'text-primary-600', bg: 'bg-primary-50 border-primary-300' },
];


export default function SkillAssessment() {
  const { id } = useParams();
  const student = getStudentById(id);

  if (!hasPermission('supervisor')) {
    return <div className="text-center py-12 text-slate-500">技能评估仅督导可操作</div>;
  }

  // 从 localStorage 读取每个技能的状态（根据 studentId + skillCode 组合键保存）
  const [activeDomain, setActiveDomain] = useState('mand');
  const [activeLevel, setActiveLevel] = useState(2);
  const [saved, setSaved] = useState(false);

  // 次要领域默认折叠（读写、语言结构）
  const [collapsedDomains, setCollapsedDomains] = useState(() => {
    const init = {};
    SECONDARY_DOMAINS.forEach((d) => { init[d] = true; });
    return init;
  });

  // 初始化状态 - 从 store 读取
  const [skillStatuses, setSkillStatuses] = useState(() => {
    const map = {};
    Object.entries(VB_MAPP_DOMAINS).forEach(([domainKey, domain]) => {
      [1, 2, 3].forEach((level) => {
        const skills = VB_MAPP_SKILLS[domainKey][`level${level}`] || [];
        skills.forEach((skillName, idx) => {
          const code = `${domainKey}-L${level}-${idx + 1}`;
          const statusData = getSkillStatusFromStorage(id, code);
          if (statusData) map[code] = statusData;
        });
      });
    });
    return map;
  });

  // 附件相关
  const [attachments, setAttachments] = useState(() => getAttachmentsByStudent(id));
  const [newAttachment, setNewAttachment] = useState({ name: '', type: 'vbmapp' });
  const [showAddAttachment, setShowAddAttachment] = useState(false);

  if (!student) return <div className="text-center py-12 text-slate-500">学生不存在</div>;

  const handleStatusChange = (code, status) => {
    setSkillStatuses({ ...skillStatuses, [code]: status });
    setSaved(false);
  };

  const handleSave = () => {
    Object.entries(skillStatuses).forEach(([code, status]) => {
      updateSkillStatus(id, code, status);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 计算各领域各阶段的得分
  const domainStats = useMemo(() => {
    const stats = {};
    Object.entries(VB_MAPP_DOMAINS).forEach(([key, domain]) => {
      stats[key] = { total: 0, scored: 0, scoreSum: 0 };
      [1, 2, 3].forEach((level) => {
        const skills = VB_MAPP_SKILLS[key][`level${level}`] || [];
        skills.forEach((skillName, idx) => {
          stats[key].total++;
          const code = `${key}-L${level}-${idx + 1}`;
          const status = skillStatuses[code];
          if (status) {
            stats[key].scored++;
            const opt = STATUS_OPTIONS.find((o) => o.value === status);
            if (opt) stats[key].scoreSum += opt.score;
          }
        });
      });
    });
    return stats;
  }, [skillStatuses]);

  // 总体统计
  const totalStats = useMemo(() => {
    let total = 0, scored = 0, scoreSum = 0;
    Object.values(domainStats).forEach((s) => {
      total += s.total;
      scored += s.scored;
      scoreSum += s.scoreSum;
    });
    return { total, scored, scoreSum, pct: total > 0 ? Math.round((scoreSum / total) * 100) : 0 };
  }, [domainStats]);

  // 雷达图数据
  const radarData = useMemo(() => {
    return Object.entries(VB_MAPP_DOMAINS).map(([key, domain]) => {
      const stat = domainStats[key];
      const score = stat.total > 0 ? Math.round((stat.scoreSum / stat.total) * 100) : 0;
      return { domain: domain.name, score };
    });
  }, [domainStats]);

  const currentDomain = VB_MAPP_DOMAINS[activeDomain];
  const currentSkills = VB_MAPP_SKILLS[activeDomain]?.[`level${activeLevel}`] || [];

  // 添加附件
  const handleAddAttachment = () => {
    if (!newAttachment.name.trim()) return;
    const att = addAttachment(id, {
      name: newAttachment.name.trim(),
      type: newAttachment.type,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: getCurrentUser()?.name || '未知',
      size: '手动录入',
    });
    setAttachments(getAttachmentsByStudent(id));
    setNewAttachment({ name: '', type: 'vbmapp' });
    setShowAddAttachment(false);
  };

  const handleDeleteAttachment = (attId) => {
    if (!confirm('确定要删除这份纸质底稿记录吗？')) return;
    deleteAttachment(id, attId);
    setAttachments(getAttachmentsByStudent(id));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{student.name} - 技能评估</h1>
          <p className="text-slate-500 mt-1 text-sm">VB-MAPP 里程碑评估（第二版）</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <div className="text-xs text-slate-500">总体达成率</div>
            <div className="text-xl font-bold text-primary-600">{totalStats.pct}%</div>
            <div className="text-xs text-slate-400">已评 {totalStats.scored}/{totalStats.total} 项</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-primary flex items-center gap-2" onClick={handleSave}>
              {saved ? <CheckCircle size={18} /> : <Save size={18} />}
              {saved ? '已保存' : '保存评估'}
            </button>
            <Link
              to={`/students/${id}/assessment/plan`}
              className="btn-secondary flex items-center gap-2"
            >
              <Play size={16} />
              逐项评估
            </Link>
          </div>
        </div>
      </div>

      {/* 技能图谱 - 雷达图 */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">技能图谱 · 各领域评估可视化</h2>
          <span className="text-xs text-slate-400">共 {Object.keys(VB_MAPP_DOMAINS).length} 个领域</span>
        </div>
        <div className="h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: '#475569', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar name="评估得分" dataKey="score" stroke="#0891b2" fill="#0891b2" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 领域总览（缩小版） */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 mb-6">
        {Object.entries(VB_MAPP_DOMAINS).map(([key, domain]) => {
          const stat = domainStats[key];
          const pct = stat.total > 0 ? Math.round((stat.scoreSum / stat.total) * 100) : 0;
          return (
            <button
              key={key}
              onClick={() => {
                setActiveDomain(key);
                setActiveLevel(2);
              }}
              className={`card p-2 text-center transition-all hover:shadow-md ${
                activeDomain === key ? 'ring-2 ring-primary-500 border-primary-300' : ''
              }`}
            >
              <div className="text-base">{domain.icon}</div>
              <div className="text-xs font-medium text-slate-700 truncate mt-1">{domain.name}</div>
              <div className="text-sm font-bold text-primary-600 mt-0.5">{pct}%</div>
            </button>
          );
        })}
      </div>

      {/* 阶段 Tab */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((level) => {
          const info = VB_MAPP_LEVEL_LABELS[level];
          const skills = VB_MAPP_SKILLS[activeDomain]?.[`level${level}`] || [];
          const levelScored = skills.filter((_, idx) => {
            const code = `${activeDomain}-L${level}-${idx + 1}`;
            return skillStatuses[code];
          }).length;
          return (
            <button
              key={level}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 ${
                activeLevel === level ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveLevel(level)}
            >
              <div>{info.name}（{info.range}）</div>
              <div className="text-xs opacity-70 mt-1">{levelScored}/{skills.length} 已评</div>
            </button>
          );
        })}
      </div>

      {/* 领域描述 */}
      <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <div>
          <div className="text-sm font-medium text-blue-800">{currentDomain.name}（{currentDomain.nameEn}）</div>
          <div className="text-xs text-blue-600">{currentDomain.description}</div>
        </div>
      </div>

      {/* 技能表格 */}
      <div className="card overflow-hidden mb-6">
        <div className="px-4 py-3 bg-primary-600 text-white">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium">
            <div className="col-span-1">编号</div>
            <div className="col-span-5">技能项</div>
            <div className="col-span-6 text-center">评估状态（点击选择）</div>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {currentSkills.map((skillName, idx) => {
            const code = `${activeDomain}-L${activeLevel}-${idx + 1}`;
            return (
              <div key={code} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-1">
                    <span className="text-xs font-mono text-slate-400">L{activeLevel}-{idx + 1}</span>
                  </div>
                  <div className="col-span-5">
                    <div className="text-sm font-medium text-slate-700">{skillName}</div>
                  </div>
                  <div className="col-span-6 flex justify-center gap-1.5 flex-wrap">
                    {STATUS_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-medium ${
                          skillStatuses[code] === option.value
                            ? `${option.bg} ${option.color} border-current shadow-sm`
                            : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={code}
                          value={option.value}
                          checked={skillStatuses[code] === option.value}
                          onChange={() => handleStatusChange(code, option.value)}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {currentSkills.length === 0 && <div className="text-center py-8 text-slate-500">该阶段暂无技能项</div>}
      </div>

      {/* 纸质底稿上传 */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileUp size={18} className="text-slate-600" />
            <h2 className="text-lg font-bold text-slate-800">纸质评估底稿存档</h2>
          </div>
          <button
            onClick={() => setShowAddAttachment(!showAddAttachment)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <FileUp size={14} /> 录入纸质底稿
          </button>
        </div>

        {showAddAttachment && (
          <div className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">底稿名称</label>
                <input
                  type="text"
                  value={newAttachment.name}
                  onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                  placeholder="如：VB-MAPP 一阶评估底稿-2026年6月"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">底稿类型</label>
                <select
                  value={newAttachment.type}
                  onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
                  className="input w-full"
                >
                  <option value="vbmapp">VB-MAPP 评估底稿</option>
                  <option value="iep">IEP 目标记录</option>
                  <option value="classroom">课堂记录</option>
                  <option value="other">其他评估资料</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn-primary" onClick={handleAddAttachment} disabled={!newAttachment.name.trim()}>
                录底稿
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {attachments.length > 0 ? (
            attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{att.name}</div>
                  <div className="text-xs text-slate-400">
                    {att.uploadDate} · {att.uploadedBy} · {att.size}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="text-red-400 hover:text-red-600 p-1.5 shrink-0"
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FileUp size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无纸质评估底稿记录</p>
            </div>
          )}
        </div>
      </div>

      {/* 评估计分说明 */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700">VB-MAPP 评估计分说明</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-red-100 border border-red-200 shrink-0 mt-0.5"></span>
            <span>
              <strong className="text-red-700">未掌握 (0分)</strong>
              <div className="text-slate-500">任何环境下都无法完成</div>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-100 border border-amber-200 shrink-0 mt-0.5"></span>
            <span>
              <strong className="text-amber-700">部分掌握 (0.5分)</strong>
              <div className="text-slate-500">需辅助或仅偶尔完成</div>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 shrink-0 mt-0.5"></span>
            <span>
              <strong className="text-emerald-700">已掌握 (1分)</strong>
              <div className="text-slate-500">独立稳定完成（3次中2次正确）</div>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-primary-100 border border-primary-300 shrink-0 mt-0.5"></span>
            <span>
              <strong className="text-primary-700">已泛化 (1.5分)</strong>
              <div className="text-slate-500">在不同场景和人员面前均能完成</div>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 辅助函数：从 store 读取技能状态（兼容旧数据格式）
function getSkillStatusFromStorage(studentId, skillCode) {
  // 通过全局 store 结构间接获取（此处简化为从 localStorage 直接读取）
  try {
    const raw = localStorage.getItem('autism_teaching_system_v11');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.students) return null;

    // 查找 skillStatuses 中对应该学生的记录
    if (data.skillStatuses && Array.isArray(data.skillStatuses)) {
      const found = data.skillStatuses.find((s) => s.studentId === studentId && s.skillCode === skillCode);
      if (found) return found.status;
    }
    // 或查找学生对象下的 skillStatusesMap
    const student = data.students.find((s) => s.id === studentId);
    if (student && student.skillStatusesMap && student.skillStatusesMap[skillCode]) {
      return student.skillStatusesMap[skillCode];
    }
    return null;
  } catch (e) {
    return null;
  }
}
