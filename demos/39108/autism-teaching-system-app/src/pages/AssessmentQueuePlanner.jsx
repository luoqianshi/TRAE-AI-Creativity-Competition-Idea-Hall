import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, ChevronUp, ChevronDown, Trash2, Check } from 'lucide-react';
import { getStudentById, createAssessmentQueue } from '../data/store';
import { VB_MAPP_DOMAINS, VB_MAPP_LEVELS, VB_MAPP_SKILLS, SECONDARY_DOMAINS } from '../data/vbmapp';

export default function AssessmentQueuePlanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = getStudentById(id);

  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]); // [{code, domainKey, level, index, description}]
  const [step, setStep] = useState(1); // 1=选领域, 2=选技能, 3=排列顺序

  const primaryDomains = Object.entries(VB_MAPP_DOMAINS).filter(([k]) => !SECONDARY_DOMAINS.includes(k));
  const secondaryDomains = Object.entries(VB_MAPP_DOMAINS).filter(([k]) => SECONDARY_DOMAINS.includes(k));

  // 当前选中领域的技能列表
  const currentSkills = useMemo(() => {
    if (!selectedDomains.length || !selectedLevel) return [];
    const skills = [];
    selectedDomains.forEach(domainKey => {
      const domainSkills = VB_MAPP_SKILLS[domainKey];
      if (domainSkills && domainSkills[`level${selectedLevel}`]) {
        domainSkills[`level${selectedLevel}`].forEach((desc, idx) => {
          skills.push({
            code: `${domainKey}-L${selectedLevel}-${idx + 1}`,
            domainKey,
            level: selectedLevel,
            index: idx + 1,
            description: desc,
          });
        });
      }
    });
    return skills;
  }, [selectedDomains, selectedLevel]);

  const toggleDomain = (key) => {
    setSelectedDomains(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.code === skill.code);
      if (exists) return prev.filter(s => s.code !== skill.code);
      return [...prev, skill];
    });
  };

  const selectAllCurrent = () => {
    const newSkills = currentSkills.filter(s => !selectedSkills.find(es => es.code === s.code));
    setSelectedSkills(prev => [...prev, ...newSkills]);
  };

  const clearAllCurrent = () => {
    const currentCodes = new Set(currentSkills.map(s => s.code));
    setSelectedSkills(prev => prev.filter(s => !currentCodes.has(s.code)));
  };

  const moveSkill = (index, direction) => {
    setSelectedSkills(prev => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const removeSkill = (code) => {
    setSelectedSkills(prev => prev.filter(s => s.code !== code));
  };

  const handleStart = () => {
    if (selectedSkills.length === 0) return;
    const queue = createAssessmentQueue({
      studentId: id,
      name: `${VB_MAPP_LEVELS[selectedLevel]?.name || ''}评估`,
      items: selectedSkills.map(s => ({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2) + s.code,
        skillCode: s.code,
        domainKey: s.domainKey,
        level: s.level,
        index: s.index,
        description: s.description,
        status: 'pending',
        result: null,
        assessedAt: null,
        notes: '',
      })),
    });
    navigate(`/students/${id}/assessment/run/${queue.id}`);
  };

  if (!student) return <div className="p-6">学生不存在</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <Link to={`/students/${id}/assessment`} className="p-1 rounded-md hover:bg-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold">规划评估队列</h1>
          <p className="text-xs text-slate-500">{student.name}</p>
        </div>
        {selectedSkills.length > 0 && (
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
            已选 {selectedSkills.length} 项
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* 步骤1：选择领域 */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">选择评估领域</h2>
          <div className="grid grid-cols-3 gap-2">
            {primaryDomains.map(([key, d]) => (
              <button
                key={key}
                onClick={() => toggleDomain(key)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                  selectedDomains.includes(key)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{d.icon}</span>
                <span className="text-xs font-medium truncate w-full text-center">{d.name}</span>
              </button>
            ))}
          </div>
          {/* 次要领域 */}
          <div className="mt-2">
            <p className="text-xs text-slate-400 mb-1">次要领域</p>
            <div className="grid grid-cols-3 gap-2">
              {secondaryDomains.map(([key, d]) => (
                <button
                  key={key}
                  onClick={() => toggleDomain(key)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    selectedDomains.includes(key)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-xs font-medium truncate w-full text-center">{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 步骤2：选择阶段 */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">选择评估阶段</h2>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${
                  selectedLevel === level
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {VB_MAPP_LEVELS[level]?.name || `${level}阶`}
              </button>
            ))}
          </div>
        </div>

        {/* 步骤3：勾选技能 */}
        {selectedDomains.length > 0 && selectedLevel && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-700">选择评估项目</h2>
              <div className="flex gap-2">
                <button onClick={selectAllCurrent} className="text-xs text-primary-600 hover:text-primary-700">
                  全选当前
                </button>
                <button onClick={clearAllCurrent} className="text-xs text-slate-400 hover:text-slate-600">
                  清除当前
                </button>
              </div>
            </div>
            {currentSkills.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center">所选领域和阶段暂无技能条目</p>
            ) : (
              <div className="space-y-1.5">
                {currentSkills.map(skill => {
                  const isSelected = selectedSkills.some(s => s.code === skill.code);
                  const domainInfo = VB_MAPP_DOMAINS[skill.domainKey];
                  return (
                    <button
                      key={skill.code}
                      onClick={() => toggleSkill(skill)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm text-slate-700 truncate">{skill.description}</p>
                        <p className="text-xs text-slate-400">{domainInfo?.name} · {skill.code}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 已选队列预览 */}
        {selectedSkills.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">评估顺序预览（可调整）</h2>
            <div className="space-y-1.5">
              {selectedSkills.map((skill, index) => {
                const domainInfo = VB_MAPP_DOMAINS[skill.domainKey];
                return (
                  <div key={skill.code} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-xs font-bold text-slate-400 w-5 text-center">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{skill.description}</p>
                      <p className="text-xs text-slate-400">{domainInfo?.name}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveSkill(index, -1)}
                        disabled={index === 0}
                        className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveSkill(index, 1)}
                        disabled={index === selectedSkills.length - 1}
                        className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeSkill(skill.code)}
                      className="p-1 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 吸底按钮 */}
      {selectedSkills.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom">
          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <Play size={18} />
            开始评估（{selectedSkills.length} 项）
          </button>
        </div>
      )}
    </div>
  );
}
