import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  getStudentById,
  getBarrierStats,
  getTrainingRecordsByStudent,
  BARRIER_TAGS,
  getGoalsByType,
} from '../data/store';
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

export default function BarrierAnalysis() {
  const { id } = useParams();
  const student = getStudentById(id);

  if (!student) {
    return <div className="text-center py-12 text-slate-500">学生不存在</div>;
  }

  const barrierStats = getBarrierStats(id);
  const allRecords = getTrainingRecordsByStudent(id);
  const goals = getGoalsByType(id, 'level3');

  // 带障碍标签的记录
  const recordsWithBarriers = allRecords
    .filter((r) => r.barrierTags && r.barrierTags.length > 0)
    .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

  // 障碍总数
  const totalBarrierCount = barrierStats.reduce((sum, s) => sum + s.count, 0);

  // 获取最近出现日期
  const getMostRecentDate = (tagId) => {
    const records = recordsWithBarriers.filter((r) => r.barrierTags.includes(tagId));
    if (records.length === 0) return '-';
    return records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate))[0].recordDate;
  };

  // 获取目标描述
  const getGoalDescription = (goalId) => {
    const goal = goals.find((g) => g.id === goalId);
    return goal ? goal.description : '未知目标';
  };

  // 获取辅助层级名称
  const getPromptName = (level) => {
    const names = ['独立', '视觉提示', '听觉提示', '肢体辅助'];
    return names[level] || '-';
  };

  // 获取准确率
  const getAccuracy = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // 根据最高障碍类型给出教学策略建议
  const getStrategySuggestions = () => {
    if (barrierStats.length === 0) return [];

    const topBarrier = barrierStats[0];
    const topTag = BARRIER_TAGS.find((t) => t.name === topBarrier.name);
    const topTagId = topTag ? topTag.id : null;
    const suggestions = {
      bt1: {
        title: '视觉注意力问题 - 教学策略建议',
        content: '减少视觉干扰，使用高对比度材料。确保教学环境整洁，移除多余视觉刺激。使用大字体、清晰图片，并在学生注意力集中时快速呈现教学材料。',
      },
      bt2: {
        title: '辅助依赖问题 - 教学策略建议',
        content: '逐步撤除辅助，使用最小有效提示层级。从最强辅助开始，逐步过渡到最弱辅助。确保学生在独立条件下也能完成任务后再撤除辅助。',
      },
      bt3: {
        title: '动机情绪问题 - 教学策略建议',
        content: '建立有效强化物清单，使用偏好评估。定期进行强化物偏好评估，确保使用高动机强化物。在情绪稳定时安排高难度任务，提供情绪调节支持。',
      },
      bt4: {
        title: '泛化不足问题 - 教学策略建议',
        content: '跨环境、跨人员、跨材料泛化训练。在不同环境（教室、家庭、社区）、由不同人员（教师、家长）使用不同材料进行训练，确保技能真正泛化。',
      },
      bt5: {
        title: '环境感官干扰 - 教学策略建议',
        content: '调整教室环境，减少感官刺激。降低噪音水平，使用柔和灯光，提供感官友好座位。必要时使用降噪耳机或感官调节工具。',
      },
    };

    return topTagId && suggestions[topTagId]
      ? [suggestions[topTagId]]
      : Object.values(suggestions);
  };

  const suggestions = getStrategySuggestions();

  // 图表数据
  const chartData = barrierStats.map((s) => ({
    name: s.name,
    count: s.count,
    color: s.color,
  }));

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
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {student.name} - 障碍分析
      </h1>

      {/* 障碍分布图表 */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800">障碍分布</h2>
        </div>
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 13 }} />
                <Tooltip
                  formatter={(value) => [`${value} 次`, '出现次数']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <AlertTriangle size={40} className="mx-auto mb-3 text-slate-300" />
            <p>暂无障碍数据</p>
            <p className="text-sm mt-1">当训练记录中标记障碍标签后，此处将显示分析结果</p>
          </div>
        )}
      </div>

      {/* 障碍详情表格 */}
      {barrierStats.length > 0 && (
        <div className="card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">障碍详情</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">障碍类型</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">出现次数</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">占比%</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">最近出现</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {barrierStats.map((stat) => {
                  const tag = BARRIER_TAGS.find((t) => t.name === stat.name);
                  const percentage = totalBarrierCount > 0
                    ? ((stat.count / totalBarrierCount) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={stat.name} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: stat.color }}
                          />
                          <span className="font-medium text-slate-800">{stat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-800">{stat.count}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-600">{percentage}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-600">{getMostRecentDate(tag?.id)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 带障碍标签的近期记录 */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">近期障碍记录</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {recordsWithBarriers.map((record) => (
            <div key={record.id} className="px-6 py-4 hover:bg-slate-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-slate-500">{record.recordDate}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-medium text-slate-800">
                      {getGoalDescription(record.goalId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    {(record.barrierTags || []).map((tagId) => {
                      const tag = BARRIER_TAGS.find((t) => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tagId}
                          className="tag text-xs"
                          style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color,
                            border: `1px solid ${tag.color}40`,
                          }}
                        >
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm text-slate-500">
                    辅助：{getPromptName(record.promptLevel)}
                  </div>
                  <div className="text-lg font-bold text-primary-600">
                    {getAccuracy(record.value, record.totalTrials)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
          {recordsWithBarriers.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              暂无带障碍标签的训练记录
            </div>
          )}
        </div>
      </div>

      {/* 教学策略建议 */}
      {suggestions.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold text-slate-800">教学策略建议</h2>
          </div>
          <div className="space-y-4">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500"
              >
                <h3 className="font-bold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
