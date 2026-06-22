import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Camera, TrendingUp, Calendar, Target } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getStudentById, getTrainingRecordsByStudent, getGoalsByType } from '../data/store';

export default function ProgressReport() {
  const { id } = useParams();
  const student = getStudentById(id);
  const records = getTrainingRecordsByStudent(id);
  const goals = getGoalsByType(id, 'level3');

  if (!student) return <div className="text-center py-12 text-slate-500">学生不存在</div>;

  // 按目标分组记录，生成趋势数据
  const goalTrends = goals.map(goal => {
    const goalRecords = records.filter(r => r.goalId === goal.id).sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate));
    return {
      goal,
      records: goalRecords,
      avgAccuracy: goalRecords.length > 0
        ? Math.round(goalRecords.reduce((sum, r) => sum + (r.value || 0), 0) / goalRecords.length)
        : 0
    };
  });

  // 生成图表数据 - 按日期聚合
  const chartData = [];
  const allDates = [...new Set(records.map(r => r.recordDate))].sort();
  allDates.forEach(date => {
    const dayData = { date: date.slice(5) }; // 只显示 MM-DD
    goals.forEach(goal => {
      const dayRecords = records.filter(r => r.goalId === goal.id && r.recordDate === date);
      if (dayRecords.length > 0) {
        const avg = dayRecords.reduce((sum, r) => sum + (r.value || 0), 0) / dayRecords.length;
        dayData[goal.id] = Math.round(avg);
      }
    });
    chartData.push(dayData);
  });

  const colors = ['#0d9488', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];

  const handleExport = async () => {
    const element = document.getElementById('progress-report-content');
    if (!element) return;

    try {
      // Add white background for export
      element.style.backgroundColor = '#ffffff';
      element.style.padding = '24px';

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      // Create download link
      const link = document.createElement('a');
      const studentName = student?.name || '学生';
      const today = new Date().toISOString().split('T')[0];
      link.download = `${studentName}_进展报告_${today}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Restore styles
      element.style.backgroundColor = '';
      element.style.padding = '';
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请重试');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{student.name} - 进展报告</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2" onClick={handleExport}>
            <Camera size={18} />
            导出图片
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            导出 PDF
          </button>
        </div>
      </div>

      <div id="progress-report-content">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Target className="text-primary-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{goals.length}</div>
              <div className="text-sm text-slate-500">活跃目标</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-emerald-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{records.length}</div>
              <div className="text-sm text-slate-500">训练记录</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-accent-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {records.length > 0
                  ? Math.round(records.reduce((sum, r) => sum + (r.value || 0), 0) / records.length)
                  : 0}%
              </div>
              <div className="text-sm text-slate-500">平均准确率</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      {chartData.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">技能进展趋势</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, '准确率']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                {goals.slice(0, 5).map((goal, idx) => (
                  <Line
                    key={goal.id}
                    type="monotone"
                    dataKey={goal.id}
                    name={goal.description.length > 10 ? goal.description.slice(0, 10) + '...' : goal.description}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Goal Progress Details */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">目标达成详情</h2>
        <div className="space-y-4">
          {goalTrends.map(({ goal, records: goalRecords, avgAccuracy }) => (
            <div key={goal.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{goal.description}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {goalRecords.length} 次训练记录 · 平均准确率 {avgAccuracy}%
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="text-xl font-bold text-primary-600">{goal.progressPct}%</div>
                  <div className="text-xs text-slate-400">当前进度</div>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-3">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all" 
                  style={{ width: `${goal.progressPct}%` }} 
                />
              </div>
              
              {/* Recent records */}
              {goalRecords.length > 0 && (
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {goalRecords.slice(-7).map((record, idx) => {
                    const accuracy = Math.min(100, Math.max(0, record.value || 0));
                    return (
                      <div key={idx} className="text-center">
                        <div 
                          className={`h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                            accuracy >= 80 ? 'bg-emerald-100 text-emerald-700' :
                            accuracy >= 60 ? 'bg-primary-100 text-primary-700' :
                            accuracy >= 40 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {accuracy}%
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{record.recordDate.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {goalTrends.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            暂无目标数据
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
