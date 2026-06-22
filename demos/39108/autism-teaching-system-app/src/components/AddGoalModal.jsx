import { useState, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { addGoal, getGoalsByType, getCurrentUser, hasPermission } from '../data/store';
import {
  VB_MAPP_DOMAINS,
  VB_MAPP_DOMAIN_OPTIONS,
  VB_MAPP_LEVEL_OPTIONS,
  VB_MAPP_SKILLS,
  getAllSkillsForDomain,
  findSkillByDescription,
} from '../data/vbmapp';

export default function AddGoalModal({ studentId, initialType = 'level3', onClose, onAdd }) {
  const currentUser = getCurrentUser();
  const isSupervisor = hasPermission('supervisor');

  // ===== 公共字段 =====
  const [domain, setDomain] = useState(VB_MAPP_DOMAIN_OPTIONS[0]?.value || 'mand');
  const [stage, setStage] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  // ===== 各层级启用状态 =====
  const [enabled, setEnabled] = useState({
    level1: true,
    level2: true,
    level3: true,
  });

  // ===== 各层级表单数据 =====
  const [level1, setLevel1] = useState({ description: '', criteria: '' });
  const [level2, setLevel2] = useState({ description: '', criteria: '' });
  const [level3Customs, setLevel3Customs] = useState([{ description: '', criteria: '' }]);
  const [level3InputMode, setLevel3InputMode] = useState('custom');
  const [selectedSkills, setSelectedSkills] = useState([]);

  // ===== 技能库列表 =====
  const availableSkills = useMemo(() => {
    if (!domain || !stage) return [];
    const levelNum = Number(stage);
    if (!levelNum) return [];
    return getAllSkillsForDomain(domain).filter(s => s.level === levelNum);
  }, [domain, stage]);

  // ===== 技能多选切换 =====
  const toggleSkillSelection = (skill) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.code === skill.code);
      if (exists) return prev.filter(s => s.code !== skill.code);
      return [...prev, skill];
    });
  };

  // ===== 三级目标自定义项操作 =====
  const addLevel3Item = () => {
    setLevel3Customs(prev => [...prev, { description: '', criteria: '' }]);
  };
  const removeLevel3Item = (index) => {
    setLevel3Customs(prev => prev.filter((_, i) => i !== index));
  };
  const updateLevel3Item = (index, field, value) => {
    setLevel3Customs(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // ===== 表单验证：只要编辑了任何字段就可以保存 =====
  const isValid = useMemo(() => {
    if (!endDate) return false;
    // 一级目标有内容
    if (enabled.level1 && level1.description.trim()) return true;
    // 二级目标有内容
    if (enabled.level2 && level2.description.trim()) return true;
    // 三级目标：自定义模式只要有一个有描述，或技能库模式有选中
    if (enabled.level3) {
      if (level3InputMode === 'custom' && level3Customs.some(item => item.description.trim())) return true;
      if (level3InputMode === 'library' && selectedSkills.length > 0) return true;
    }
    return false;
  }, [enabled, level1, level2, level3Customs, level3InputMode, selectedSkills, endDate]);

  // ===== 保存逻辑 =====
  const handleSubmit = () => {
    const commonFields = {
      studentId,
      domain,
      stage,
      startDate,
      endDate,
      status: 'active',
      progressPct: 0,
    };

    let createdLevel1Id = null;
    let createdLevel2Id = null;

    // 1. 创建一级目标
    if (enabled.level1 && level1.description.trim()) {
      const goalData = {
        ...commonFields,
        type: 'level1',
        description: level1.description.trim(),
        criteria: level1.criteria.trim(),
        locked: true,
        parentGoalId: '',
      };
      addGoal(goalData);
      // 获取刚创建的一级目标 ID
      const l1Goals = getGoalsByType(studentId, 'level1');
      createdLevel1Id = l1Goals[l1Goals.length - 1]?.id || null;
    }

    // 2. 创建二级目标
    if (enabled.level2 && level2.description.trim()) {
      const goalData = {
        ...commonFields,
        type: 'level2',
        description: level2.description.trim(),
        criteria: level2.criteria.trim(),
        locked: true,
        parentGoalId: createdLevel1Id || '',
      };
      addGoal(goalData);
      // 获取刚创建的二级目标 ID
      const l2Goals = getGoalsByType(studentId, 'level2');
      createdLevel2Id = l2Goals[l2Goals.length - 1]?.id || null;
    }

    // 3. 创建三级目标
    if (enabled.level3) {
      // 自定义输入模式：遍历所有已填写的训练项
      if (level3InputMode === 'custom') {
        level3Customs.forEach((item) => {
          if (item.description.trim()) {
            const goalData = {
              ...commonFields,
              type: 'level3',
              description: item.description.trim(),
              criteria: item.criteria.trim(),
              locked: false,
              parentGoalId: createdLevel2Id || '',
            };
            // 自动匹配 VB-MAPP 技能库
            const matched = findSkillByDescription(item.description.trim());
            if (matched) {
              goalData.vbmappCode = matched.code;
            }
            addGoal(goalData);
          }
        });
      }

      // 技能库多选模式
      if (level3InputMode === 'library' && selectedSkills.length > 0) {
        selectedSkills.forEach((skill) => {
          const goalData = {
            ...commonFields,
            type: 'level3',
            description: skill.description,
            criteria: '',
            locked: false,
            parentGoalId: createdLevel2Id || '',
            vbmappCode: skill.code,
          };
          addGoal(goalData);
        });
      }
    }

    onAdd();
  };

  // ===== 切换层级启用 =====
  const toggleEnabled = (level) => {
    setEnabled(prev => ({ ...prev, [level]: !prev[level] }));
  };

  // ===== 教师模式：只显示三级目标 =====
  const showLevel1 = isSupervisor;
  const showLevel2 = isSupervisor;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-bold">新增课程目标</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* ===== 公共字段 ===== */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">领域</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="input"
              >
                {VB_MAPP_DOMAIN_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">阶段</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="input"
              >
                <option value="">-- 请选择阶段 --</option>
                {VB_MAPP_LEVEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">结束日期 *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* ===== 一级目标卡片 ===== */}
          {showLevel1 && (
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">一级目标（里程碑）</h3>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled.level1}
                    onChange={() => toggleEnabled('level1')}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  创建一级目标
                </label>
              </div>
              {enabled.level1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                    <input
                      value={level1.description}
                      onChange={(e) => setLevel1(prev => ({ ...prev, description: e.target.value }))}
                      className="input"
                      placeholder="例如：提升语言提要求能力"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">达成标准</label>
                    <textarea
                      value={level1.criteria}
                      onChange={(e) => setLevel1(prev => ({ ...prev, criteria: e.target.value }))}
                      className="input h-20 resize-none"
                      placeholder="具体、可衡量的成功标准..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== 二级目标卡片 ===== */}
          {showLevel2 && (
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">二级目标（课程框架）</h3>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled.level2}
                    onChange={() => toggleEnabled('level2')}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  创建二级目标
                </label>
              </div>
              {enabled.level2 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                    <input
                      value={level2.description}
                      onChange={(e) => setLevel2(prev => ({ ...prev, description: e.target.value }))}
                      className="input"
                      placeholder="例如：命名常见物品并提要求"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">达成标准</label>
                    <textarea
                      value={level2.criteria}
                      onChange={(e) => setLevel2(prev => ({ ...prev, criteria: e.target.value }))}
                      className="input h-20 resize-none"
                      placeholder="具体、可衡量的成功标准..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== 三级目标卡片 ===== */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">三级目标（训练项）</h3>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled.level3}
                  onChange={() => toggleEnabled('level3')}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                创建三级目标
              </label>
            </div>
            {enabled.level3 && (
              <div className="space-y-3">
                {/* 输入模式切换 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                      level3InputMode === 'custom'
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setLevel3InputMode('custom')}
                  >
                    自定义输入
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                      level3InputMode === 'library'
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setLevel3InputMode('library')}
                  >
                    从技能库选取
                  </button>
                </div>

                {/* 自定义输入 - 支持多个训练项 */}
                {level3InputMode === 'custom' && (
                  <div className="space-y-3">
                    {level3Customs.map((item, index) => (
                      <div key={index} className="relative border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500">训练项 #{index + 1}</span>
                          {level3Customs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLevel3Item(index)}
                              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="删除此项"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            value={item.description}
                            onChange={(e) => updateLevel3Item(index, 'description', e.target.value)}
                            className="input"
                            placeholder="例如：在自然环境中独立命名10种常见物品"
                          />
                          <textarea
                            value={item.criteria}
                            onChange={(e) => updateLevel3Item(index, 'criteria', e.target.value)}
                            className="input h-16 resize-none"
                            placeholder="达成标准（选填）..."
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addLevel3Item}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-dashed border-slate-300 text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-colors w-full justify-center"
                    >
                      <Plus size={14} />
                      添加一个训练项
                    </button>
                    {level3Customs.filter(item => item.description.trim()).length > 0 && (
                      <p className="text-xs text-slate-500">
                        已填写 {level3Customs.filter(item => item.description.trim()).length} 个训练项，将分别创建为三级目标
                      </p>
                    )}
                  </div>
                )}

                {/* 技能库多选 */}
                {level3InputMode === 'library' && (
                  <div>
                    {(!domain || !stage) ? (
                      <p className="text-sm text-slate-400 italic">请先选择领域和阶段</p>
                    ) : availableSkills.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">该领域和阶段暂无技能条目</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1.5">
                        {availableSkills.map((skill) => {
                          const isSelected = selectedSkills.some(s => s.code === skill.code);
                          return (
                            <button
                              key={skill.code}
                              type="button"
                              className={`block w-full text-left px-3 py-2 rounded-md text-sm border transition-colors ${
                                isSelected
                                  ? 'bg-primary-50 border-primary-400 text-primary-700'
                                  : 'border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                              onClick={() => toggleSkillSelection(skill)}
                            >
                              <span className="text-xs text-slate-400 mr-2">{skill.code}</span>
                              {skill.description}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {selectedSkills.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        已选择 {selectedSkills.length} 个技能项，将分别创建为三级目标
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 shrink-0">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
