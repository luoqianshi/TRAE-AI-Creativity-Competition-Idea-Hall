import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Brain,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getAllBehaviorRecords,
  getBehaviorRecordsByStudent,
  getStudents,
  getStudentById,
  BEHAVIOR_TYPES,
  ANTECEDENT_OPTIONS,
  CONSEQUENCE_OPTIONS,
  SEVERITY_LEVELS,
} from '../data/store';

// ===== 辅助函数 =====

const BEHAVIOR_COLORS = [
  '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6',
  '#10b981', '#ec4899', '#06b6d4', '#f97316',
];

function getBehaviorType(id) {
  return BEHAVIOR_TYPES.find((b) => b.id === id);
}

function getAntecedent(id) {
  return ANTECEDENT_OPTIONS.find((a) => a.id === id);
}

function getConsequence(id) {
  return CONSEQUENCE_OPTIONS.find((c) => c.id === id);
}

function getSeverity(level) {
  return SEVERITY_LEVELS.find((s) => s.level === level);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getDateRange(type) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (type) {
    case 'today':
      return { start: today, end: now };
    case 'week': {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return { start, end: now };
    }
    case 'month': {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 1);
      return { start, end: now };
    }
    default:
      return null;
  }
}

// ===== 主组件 =====

export default function BehaviorAnalysis() {
  const { id: routeStudentId } = useParams();
  const student = routeStudentId ? getStudentById(routeStudentId) : null;
  const [dateRange, setDateRange] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState(routeStudentId || 'all');
  const [expandedRecords, setExpandedRecords] = useState({});

  const students = getStudents();
  const allRecords = getAllBehaviorRecords();

  // 根据筛选条件过滤记录
  const filteredRecords = useMemo(() => {
    let records = selectedStudentId === 'all'
      ? [...allRecords]
      : getBehaviorRecordsByStudent(selectedStudentId);

    const range = getDateRange(dateRange);
    if (range) {
      records = records.filter((r) => {
        const d = new Date(r.createdAt || r.recordDate);
        return d >= range.start && d <= range.end;
      });
    }

    return records.sort((a, b) => new Date(b.createdAt || b.recordDate) - new Date(a.createdAt || a.recordDate));
  }, [allRecords, selectedStudentId, dateRange]);

  // ===== Section 1: 总览统计 =====
  const overviewStats = useMemo(() => {
    const total = filteredRecords.length;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const thisWeek = filteredRecords.filter((r) => {
      const d = new Date(r.createdAt || r.recordDate);
      return d >= weekStart;
    }).length;

    // 最常见行为类型
    const behaviorCountMap = {};
    filteredRecords.forEach((r) => {
      (r.behaviorTypes || []).forEach((bt) => {
        behaviorCountMap[bt] = (behaviorCountMap[bt] || 0) + 1;
      });
    });
    const topBehaviorEntry = Object.entries(behaviorCountMap).sort((a, b) => b[1] - a[1])[0];
    const topBehavior = topBehaviorEntry ? getBehaviorType(topBehaviorEntry[0]) : null;

    // 平均严重程度
    const avgSeverity = total > 0
      ? filteredRecords.reduce((sum, r) => sum + (r.severity || 1), 0) / total
      : 0;

    return { total, thisWeek, topBehavior, avgSeverity };
  }, [filteredRecords]);

  // ===== Section 2: 行为类型分布 =====
  const behaviorDistribution = useMemo(() => {
    const countMap = {};
    filteredRecords.forEach((r) => {
      (r.behaviorTypes || []).forEach((bt) => {
        countMap[bt] = (countMap[bt] || 0) + 1;
      });
    });
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count], idx) => {
        const bt = getBehaviorType(id);
        return {
          id,
          name: bt ? bt.name : id,
          icon: bt ? bt.icon : '',
          count,
          color: BEHAVIOR_COLORS[idx % BEHAVIOR_COLORS.length],
        };
      });
  }, [filteredRecords]);

  // ===== Section 3a: 前事刺激排名 =====
  const antecedentRanking = useMemo(() => {
    const countMap = {};
    const behaviorAssocMap = {};
    filteredRecords.forEach((r) => {
      (r.antecedents || []).forEach((ant) => {
        countMap[ant] = (countMap[ant] || 0) + 1;
        if (!behaviorAssocMap[ant]) behaviorAssocMap[ant] = {};
        (r.behaviorTypes || []).forEach((bt) => {
          behaviorAssocMap[ant][bt] = (behaviorAssocMap[ant][bt] || 0) + 1;
        });
      });
    });

    const totalAntecedentCount = Object.values(countMap).reduce((s, c) => s + c, 0);

    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const ant = getAntecedent(id);
        // 找到与此前事关联最多的行为类型
        const assoc = behaviorAssocMap[id] || {};
        const topAssocEntry = Object.entries(assoc).sort((a, b) => b[1] - a[1])[0];
        const topAssocBehavior = topAssocEntry ? getBehaviorType(topAssocEntry[0]) : null;
        return {
          id,
          name: ant ? ant.name : id,
          count,
          percentage: totalAntecedentCount > 0 ? ((count / totalAntecedentCount) * 100).toFixed(1) : '0.0',
          topAssociatedBehavior: topAssocBehavior,
        };
      });
  }, [filteredRecords]);

  // ===== Section 3b: 行为-前事关联矩阵 =====
  const associationMatrix = useMemo(() => {
    const topAntecedents = antecedentRanking.slice(0, 5).map((a) => a.id);
    const topBehaviors = behaviorDistribution.slice(0, 5).map((b) => b.id);

    // 计算矩阵
    const matrix = {};
    let maxCount = 0;
    topAntecedents.forEach((antId) => {
      matrix[antId] = {};
      topBehaviors.forEach((btId) => {
        let count = 0;
        filteredRecords.forEach((r) => {
          const hasAnt = (r.antecedents || []).includes(antId);
          const hasBt = (r.behaviorTypes || []).includes(btId);
          if (hasAnt && hasBt) count++;
        });
        matrix[antId][btId] = count;
        if (count > maxCount) maxCount = count;
      });
    });

    return { topAntecedents, topBehaviors, matrix, maxCount };
  }, [filteredRecords, antecedentRanking, behaviorDistribution]);

  // ===== Section 3c: 后果有效性分析 =====
  const consequenceEffectiveness = useMemo(() => {
    const conCountMap = {};
    const conRecurrenceMap = {};

    filteredRecords.forEach((r) => {
      (r.consequences || []).forEach((conId) => {
        conCountMap[conId] = (conCountMap[conId] || 0) + 1;
      });
    });

    // 对每条记录，检查使用某后果后，同一学生+行为类型是否在30分钟内再次出现
    const sortedRecords = [...filteredRecords].sort(
      (a, b) => new Date(a.createdAt || a.recordDate) - new Date(b.createdAt || b.recordDate)
    );

    sortedRecords.forEach((record, idx) => {
      const recordTime = new Date(record.createdAt || record.recordDate).getTime();
      const nextRecord = sortedRecords[idx + 1];

      if (!nextRecord) return;
      const nextTime = new Date(nextRecord.createdAt || nextRecord.recordDate).getTime();
      const timeDiff = nextTime - recordTime;

      // 30分钟内
      if (timeDiff <= 30 * 60 * 1000 && record.studentId === nextRecord.studentId) {
        const recurringBehaviors = new Set();
        (nextRecord.behaviorTypes || []).forEach((bt) => {
          if ((record.behaviorTypes || []).includes(bt)) {
            recurringBehaviors.add(bt);
          }
        });

        (record.consequences || []).forEach((conId) => {
          if (!conRecurrenceMap[conId]) conRecurrenceMap[conId] = { total: 0, recurrence: 0 };
          conRecurrenceMap[conId].total++;
          if (recurringBehaviors.size > 0) {
            conRecurrenceMap[conId].recurrence++;
          }
        });
      }
    });

    return Object.entries(conCountMap)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const con = getConsequence(id);
        const recData = conRecurrenceMap[id] || { total: 0, recurrence: 0 };
        const recurrenceRate = recData.total > 0
          ? (recData.recurrence / recData.total) * 100
          : null;
        return {
          id,
          name: con ? con.name : id,
          count,
          recurrenceRate,
          totalChecks: recData.total,
          recurrenceCount: recData.recurrence,
        };
      });
  }, [filteredRecords]);

  // ===== Section 3d: 时间模式分析 =====
  const timePattern = useMemo(() => {
    const hourCount = new Array(24).fill(0);
    filteredRecords.forEach((r) => {
      const d = new Date(r.createdAt || r.recordDate);
      hourCount[d.getHours()]++;
    });

    const maxHourCount = Math.max(...hourCount, 1);

    // 找到高峰时段（连续的小时中数量 >= 最大值的60%）
    const threshold = maxHourCount * 0.6;
    const peakHours = [];
    hourCount.forEach((count, hour) => {
      if (count >= threshold && count > 0) {
        peakHours.push(hour);
      }
    });

    // 合并连续时段
    const peakRanges = [];
    if (peakHours.length > 0) {
      let rangeStart = peakHours[0];
      let rangeEnd = peakHours[0];
      for (let i = 1; i < peakHours.length; i++) {
        if (peakHours[i] === rangeEnd + 1) {
          rangeEnd = peakHours[i];
        } else {
          peakRanges.push([rangeStart, rangeEnd]);
          rangeStart = peakHours[i];
          rangeEnd = peakHours[i];
        }
      }
      peakRanges.push([rangeStart, rangeEnd]);
    }

    const chartData = hourCount.map((count, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      count,
      label: `${String(hour).padStart(2, '0')}:00`,
    }));

    return { hourCount, chartData, peakRanges, maxHourCount };
  }, [filteredRecords]);

  // ===== Section 4: 自动归因分析报告 =====
  const analysisReport = useMemo(() => {
    if (filteredRecords.length === 0) {
      return {
        keyFindings: [],
        functionalHypothesis: '需要更多数据来确定行为功能',
        interventionSuggestions: ['持续进行 ABC 数据记录，定期回顾分析趋势', '与督导讨论数据模式，制定个体化干预计划'],
      };
    }

    const findings = [];

    // 核心发现1：最常见行为 + 最常见前事
    const topBehavior = behaviorDistribution[0];
    const topAntecedent = antecedentRanking[0];
    if (topBehavior && topAntecedent) {
      findings.push(
        `最常见的问题行为是「${topBehavior.name}」(${topBehavior.count}次)，主要发生在「${topAntecedent.name}」之后 (${topAntecedent.percentage}%)`
      );
    }

    // 核心发现2：前事-行为关联
    if (topAntecedent && topBehavior) {
      const assocCount = associationMatrix.matrix[topAntecedent.id]?.[topBehavior.id] || 0;
      if (assocCount > 0) {
        findings.push(
          `数据显示「${topAntecedent.name}」是触发「${topBehavior.name}」的最常见因素 (共${assocCount}次同时出现)`
        );
      }
    }

    // 核心发现3：后果有效性
    const reinforcingConsequences = consequenceEffectiveness.filter(
      (c) => c.recurrenceRate !== null && c.recurrenceRate > 60
    );
    reinforcingConsequences.forEach((c) => {
      findings.push(
        `「${c.name}」使用后行为复发率较高 (${c.recurrenceRate.toFixed(0)}%)，建议减少使用`
      );
    });

    // 核心发现4：时间模式
    if (timePattern.peakRanges.length > 0) {
      const peakStr = timePattern.peakRanges
        .map(([s, e]) => `${String(s).padStart(2, '0')}:00-${String(e + 1).padStart(2, '0')}:00`)
        .join('、');
      findings.push(`问题行为高发时段：${peakStr}，建议在这些时段加强预防措施`);
    }

    // 核心发现5：严重程度
    if (overviewStats.avgSeverity > 2) {
      findings.push(`平均严重程度较高 (${overviewStats.avgSeverity.toFixed(1)}/3)，需要重点关注安全防护`);
    }

    // 行为功能假设
    let functionalHypothesis = '需要更多数据来确定行为功能';
    let functionType = 'general';

    if (topAntecedent) {
      const topConsequence = consequenceEffectiveness[0];
      if (topAntecedent.id === 'ant_demand' && topConsequence?.id === 'con_escape') {
        functionalHypothesis = '逃避功能：学生可能通过问题行为来逃避任务要求';
        functionType = 'escape';
      } else if (topAntecedent.id === 'ant_attention') {
        functionalHypothesis = '关注功能：学生可能通过问题行为来获取老师关注';
        functionType = 'attention';
      } else if (topAntecedent.id === 'ant_remove') {
        functionalHypothesis = '获取功能：学生可能通过问题行为来试图取回物品';
        functionType = 'tangible';
      } else if (topAntecedent.id === 'ant_difficult') {
        functionalHypothesis = '逃避/挫败功能：任务难度可能是触发因素';
        functionType = 'frustration';
      } else if (topAntecedent.id === 'ant_sensory') {
        functionalHypothesis = '感官调节功能：环境感官刺激可能是触发因素';
        functionType = 'sensory';
      } else if (topAntecedent.id === 'ant_transition') {
        functionalHypothesis = '例行转换困难：活动切换可能是触发因素';
        functionType = 'transition';
      } else if (topAntecedent.id === 'ant_wait') {
        functionalHypothesis = '延迟满足困难：等待可能是触发因素';
        functionType = 'wait';
      } else if (topAntecedent.id === 'ant_demand') {
        functionalHypothesis = '逃避功能：学生可能通过问题行为来逃避任务要求';
        functionType = 'escape';
      }
    }

    // 干预建议
    const suggestionsMap = {
      escape: [
        '逐步增加任务难度，使用任务分解法',
        '在任务中穿插学生喜欢的活动，建立正向动机',
        "使用'先...然后...'板帮助理解任务顺序",
        '在学生表现良好时及时给予表扬和休息机会',
      ],
      attention: [
        '在学生安静等待时主动给予关注（DRA 差别强化）',
        '设定固定的关注时间表，减少对问题行为的关注',
        '教导学生用适当方式获取关注（如举手、叫名字）',
      ],
      tangible: [
        '建立功能性沟通训练（FCT），教学生用适当方式表达需求',
        '使用延迟满足训练，逐步延长等待时间',
        '在给予物品前要求学生完成一个简单任务',
      ],
      sensory: [
        '提供感官替代活动（如减压玩具、深压觉活动）',
        '调整教室环境，减少不必要的感官刺激',
        '在感官刺激可能出现的时段提前提供调节活动',
      ],
      transition: [
        '使用视觉时间表预告活动转换',
        '在转换前给予 1-2 分钟的口头提示',
        '在两个活动之间设置过渡活动（如唱歌、小游戏）',
      ],
      frustration: [
        '降低任务难度，确保学生能获得成功体验',
        '使用最小到最大提示层级，减少学生挫败感',
        '在困难任务前先练习简单的相似任务',
      ],
      wait: [
        '逐步延长等待时间，从短时间开始训练',
        '在等待期间提供视觉提示（如沙漏、计时器）',
        '在学生成功等待后给予积极强化',
      ],
      general: [
        '持续进行 ABC 数据记录，定期回顾分析趋势',
        '与督导讨论数据模式，制定个体化干预计划',
      ],
    };

    const suggestions = [
      ...(suggestionsMap[functionType] || []),
      '持续进行 ABC 数据记录，定期回顾分析趋势',
      '与督导讨论数据模式，制定个体化干预计划',
    ];

    return { keyFindings: findings, functionalHypothesis, interventionSuggestions: suggestions };
  }, [filteredRecords, behaviorDistribution, antecedentRanking, consequenceEffectiveness, timePattern, associationMatrix, overviewStats]);

  // ===== 切换展开/折叠 =====
  const toggleRecord = (recordId) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  // ===== 获取学生姓名 =====
  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? student.name : '未知学生';
  };

  // ===== 渲染 =====
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {student && (
            <Link to={`/students/${routeStudentId}`} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
          )}
          <Activity size={24} className="text-red-500" />
          <h1 className="text-2xl font-bold text-slate-800">
            {student ? `${student.name} - 问题行为分析` : '问题行为数据分析'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* 日期范围筛选 */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[
              { key: 'today', label: '今天' },
              { key: 'week', label: '本周' },
              { key: 'month', label: '本月' },
              { key: 'all', label: '全部' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setDateRange(item.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === item.key
                    ? 'bg-white text-primary-600 font-medium shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 学生筛选 */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部学生</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="card p-12 text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-medium text-slate-500 mb-2">暂无行为记录数据</h2>
          <p className="text-sm text-slate-400">
            当有 ABC 行为记录后，此处将自动生成分析报告
          </p>
        </div>
      ) : (
        <>
          {/* Section 1: 总览统计卡片 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BarChart3 size={16} className="text-blue-600" />
                </div>
                <span className="text-sm text-slate-500">总记录数</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{overviewStats.total}</div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <span className="text-sm text-slate-500">本周记录数</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{overviewStats.thisWeek}</div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-amber-600" />
                </div>
                <span className="text-sm text-slate-500">最常见行为</span>
              </div>
              <div className="text-lg font-bold text-slate-800">
                {overviewStats.topBehavior ? (
                  <span>
                    {overviewStats.topBehavior.icon} {overviewStats.topBehavior.name}
                  </span>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Activity size={16} className="text-purple-600" />
                </div>
                <span className="text-sm text-slate-500">平均严重程度</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-800">
                  {overviewStats.avgSeverity.toFixed(1)}
                </span>
                <span className="text-xs">/3</span>
                <span
                  className="tag text-xs font-medium"
                  style={{
                    backgroundColor:
                      overviewStats.avgSeverity >= 2.5
                        ? '#fef2f2'
                        : overviewStats.avgSeverity >= 1.5
                        ? '#fffbeb'
                        : '#f0fdf4',
                    color:
                      overviewStats.avgSeverity >= 2.5
                        ? '#ef4444'
                        : overviewStats.avgSeverity >= 1.5
                        ? '#f59e0b'
                        : '#10b981',
                    border: `1px solid ${
                      overviewStats.avgSeverity >= 2.5
                        ? '#fecaca'
                        : overviewStats.avgSeverity >= 1.5
                        ? '#fde68a'
                        : '#bbf7d0'
                    }`,
                  }}
                >
                  {overviewStats.avgSeverity >= 2.5
                    ? '偏高'
                    : overviewStats.avgSeverity >= 1.5
                    ? '中等'
                    : '偏低'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: 行为类型分布 */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold text-slate-800">行为类型分布</h2>
            </div>
            {behaviorDistribution.length > 0 ? (
              <div style={{ width: '100%', height: Math.max(200, behaviorDistribution.length * 40 + 40) }}>
                <ResponsiveContainer>
                  <BarChart
                    data={behaviorDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 13 }}
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value} 次`, '出现次数']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {behaviorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">暂无行为类型数据</div>
            )}
          </div>

          {/* Section 3: 前事-行为-后果 关联分析 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={22} className="text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800">前事-行为-后果 关联分析</h2>
            </div>

            {/* 3a. 前事刺激排名 */}
            <div className="card overflow-hidden mb-4">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">前事刺激排名</h3>
                <p className="text-sm text-slate-500 mt-1">按出现次数排序，识别最常见的触发因素</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">排名</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">前事刺激</th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">出现次数</th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">占比</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">最关联行为</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {antecedentRanking.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              idx === 0
                                ? 'bg-red-100 text-red-600'
                                : idx === 1
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{item.name}</span>
                            {idx < 2 && (
                              <span className="tag tag-danger text-xs">高发</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="font-bold text-slate-800">{item.count}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="text-slate-600">{item.percentage}%</span>
                        </td>
                        <td className="px-6 py-3">
                          {item.topAssociatedBehavior ? (
                            <span className="text-sm text-slate-700">
                              {item.topAssociatedBehavior.icon} {item.topAssociatedBehavior.name}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3b. 行为-前事关联矩阵 */}
            {associationMatrix.topAntecedents.length > 0 && associationMatrix.topBehaviors.length > 0 && (
              <div className="card overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800">行为-前事关联矩阵</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    颜色越深表示关联越强，帮助识别"当X发生时，Y行为最可能出现"
                  </p>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left px-3 py-2 text-sm font-medium text-slate-500 min-w-[100px]">
                          前事 \ 行为
                        </th>
                        {associationMatrix.topBehaviors.map((btId) => {
                          const bt = getBehaviorType(btId);
                          return (
                            <th
                              key={btId}
                              className="text-center px-3 py-2 text-sm font-medium text-slate-600 min-w-[80px]"
                            >
                              {bt ? bt.name : btId}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {associationMatrix.topAntecedents.map((antId) => {
                        const ant = getAntecedent(antId);
                        return (
                          <tr key={antId}>
                            <td className="px-3 py-2 text-sm font-medium text-slate-700">
                              {ant ? ant.name : antId}
                            </td>
                            {associationMatrix.topBehaviors.map((btId) => {
                              const count = associationMatrix.matrix[antId]?.[btId] || 0;
                              const intensity =
                                associationMatrix.maxCount > 0
                                  ? count / associationMatrix.maxCount
                                  : 0;
                              const bgColor =
                                count === 0
                                  ? '#f8fafc'
                                  : `rgba(239, 68, 68, ${0.1 + intensity * 0.8})`;
                              const textColor =
                                count === 0
                                  ? '#94a3b8'
                                  : intensity > 0.5
                                  ? '#ffffff'
                                  : '#1e293b';
                              return (
                                <td
                                  key={btId}
                                  className="px-3 py-2 text-center text-sm font-medium"
                                  style={{
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    borderRadius: '4px',
                                  }}
                                >
                                  {count}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3c. 后果有效性分析 */}
            <div className="card overflow-hidden mb-4">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">后果有效性分析</h3>
                <p className="text-sm text-slate-500 mt-1">
                  分析每种干预后果使用后行为是否复发，评估干预有效性
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        后果类型
                      </th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">
                        使用次数
                      </th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">
                        检查样本
                      </th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">
                        复发率
                      </th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">
                        评估
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consequenceEffectiveness.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3">
                          <span className="font-medium text-slate-800">{item.name}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="font-bold text-slate-800">{item.count}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="text-slate-600">
                            {item.totalChecks > 0 ? item.totalChecks : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          {item.recurrenceRate !== null ? (
                            <span
                              className="font-bold"
                              style={{
                                color:
                                  item.recurrenceRate > 60
                                    ? '#ef4444'
                                    : item.recurrenceRate < 30
                                    ? '#10b981'
                                    : '#f59e0b',
                              }}
                            >
                              {item.recurrenceRate.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {item.recurrenceRate === null ? (
                            <span className="text-xs text-slate-400">数据不足</span>
                          ) : item.recurrenceRate > 60 ? (
                            <span className="tag tag-danger text-xs">可能强化</span>
                          ) : item.recurrenceRate < 30 ? (
                            <span className="tag tag-success text-xs">可能有效</span>
                          ) : (
                            <span className="tag tag-warn text-xs">效果一般</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3d. 时间模式分析 */}
            <div className="card p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">时间模式分析</h3>
                  <p className="text-sm text-slate-500 mt-1">按小时统计问题行为发生频率</p>
                </div>
                {timePattern.peakRanges.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg">
                    <Clock size={14} className="text-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      高发时段：
                      {timePattern.peakRanges
                        .map(
                          ([s, e]) =>
                            `${String(s).padStart(2, '0')}:00-${String(e + 1).padStart(2, '0')}:00`
                        )
                        .join('、')}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={timePattern.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      interval={1}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${value} 次`, '发生次数']}
                      labelFormatter={(label) => `时段：${label}`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {timePattern.chartData.map((entry, index) => {
                        const hour = index;
                        const isPeak = timePattern.peakRanges.some(
                          ([s, e]) => hour >= s && hour <= e
                        );
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isPeak ? '#ef4444' : '#93c5fd'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 4: 自动归因分析报告 */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Brain size={22} className="text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800">自动归因分析报告</h2>
            </div>

            {/* 4a. 核心发现 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp size={14} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-800">核心发现</h3>
              </div>
              {analysisReport.keyFindings.length > 0 ? (
                <div className="space-y-2">
                  {analysisReport.keyFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{finding}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">数据不足，无法生成核心发现</p>
              )}
            </div>

            {/* 4b. 行为功能假设 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lightbulb size={14} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-800">行为功能假设</h3>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {analysisReport.functionalHypothesis}
                </p>
              </div>
            </div>

            {/* 4c. 干预建议 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Lightbulb size={14} className="text-green-600" />
                </div>
                <h3 className="font-bold text-slate-800">干预建议</h3>
              </div>
              <div className="space-y-2">
                {analysisReport.interventionSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 bg-green-50 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 text-green-700 text-xs flex items-center justify-center font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: 详细记录列表 */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">
                详细记录列表
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({filteredRecords.length} 条)
                </span>
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const isExpanded = expandedRecords[record.id];
                const severity = getSeverity(record.severity);
                return (
                  <div key={record.id} className="hover:bg-slate-50">
                    {/* 记录头部（可点击展开） */}
                    <div
                      className="px-6 py-3 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleRecord(record.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm text-slate-500 flex-shrink-0">
                          {formatDate(record.createdAt || record.recordDate)}
                        </span>
                        <span className="text-slate-300 flex-shrink-0">|</span>
                        <span className="font-medium text-slate-800 flex-shrink-0">
                          {getStudentName(record.studentId)}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {(record.behaviorTypes || []).map((btId) => {
                            const bt = getBehaviorType(btId);
                            if (!bt) return null;
                            return (
                              <span
                                key={btId}
                                className="tag tag-danger text-xs"
                              >
                                {bt.icon} {bt.name}
                              </span>
                            );
                          })}
                        </div>
                        <span
                          className="tag text-xs flex-shrink-0"
                          style={{
                            backgroundColor: severity ? severity.color + '20' : '#f1f5f9',
                            color: severity ? severity.color : '#64748b',
                            border: `1px solid ${severity ? severity.color + '40' : '#e2e8f0'}`,
                          }}
                        >
                          {severity ? severity.name : '-'}
                        </span>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* 展开详情 */}
                    {isExpanded && (
                      <div className="px-6 pb-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* 前事 */}
                          <div>
                            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                              前事 (A)
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(record.antecedents || []).map((antId) => {
                                const ant = getAntecedent(antId);
                                return (
                                  <span key={antId} className="tag tag-warn text-xs">
                                    {ant ? ant.name : antId}
                                  </span>
                                );
                              })}
                              {(!record.antecedents || record.antecedents.length === 0) && (
                                <span className="text-xs text-slate-400">未记录</span>
                              )}
                            </div>
                          </div>

                          {/* 后果 */}
                          <div>
                            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                              后果 (C)
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(record.consequences || []).map((conId) => {
                                const con = getConsequence(conId);
                                return (
                                  <span key={conId} className="tag tag-primary text-xs">
                                    {con ? con.name : conId}
                                  </span>
                                );
                              })}
                              {(!record.consequences || record.consequences.length === 0) && (
                                <span className="text-xs text-slate-400">未记录</span>
                              )}
                            </div>
                          </div>

                          {/* 其他信息 */}
                          <div>
                            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                              其他信息
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <div>
                                记录人：
                                <span className="font-medium text-slate-700">
                                  {record.recorderName || '-'}
                                </span>
                              </div>
                              <div>
                                严重程度：
                                <span
                                  className="font-medium"
                                  style={{ color: severity?.color || '#64748b' }}
                                >
                                  {severity ? `${severity.name} (${record.severity}/3)` : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 备注 */}
                        {record.notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <div className="text-xs font-medium text-slate-500 mb-1">备注</div>
                            <p className="text-sm text-slate-700">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
