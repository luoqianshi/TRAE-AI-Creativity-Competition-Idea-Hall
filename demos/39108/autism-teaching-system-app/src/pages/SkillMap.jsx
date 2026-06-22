import { useParams } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { getStudentById, getAssessmentsByStudent, getSkillStatusesByStudent } from '../data/store';

export default function SkillMap() {
  const { id } = useParams();
  const student = getStudentById(id);
  const assessments = getAssessmentsByStudent(id);
  const skills = getSkillStatusesByStudent(id);

  if (!student) return <div className="text-center py-12 text-slate-500">学生不存在</div>;

  // 准备雷达图数据
  const latestAssessment = assessments[0];
  const previousAssessment = assessments[1];

  const radarData = latestAssessment ? [
    { domain: '提要求', current: latestAssessment.results.mand?.score || 0, previous: previousAssessment?.results.mand?.score || 0 },
    { domain: '命名', current: latestAssessment.results.tact?.score || 0, previous: previousAssessment?.results.tact?.score || 0 },
    { domain: '听者反应', current: latestAssessment.results.listener?.score || 0, previous: previousAssessment?.results.listener?.score || 0 },
    { domain: '视觉匹配', current: latestAssessment.results.visual?.score || 0, previous: previousAssessment?.results.visual?.score || 0 },
    { domain: '独立游戏', current: latestAssessment.results.play?.score || 0, previous: previousAssessment?.results.play?.score || 0 },
    { domain: '社交', current: latestAssessment.results.social?.score || 0, previous: previousAssessment?.results.social?.score || 0 },
    { domain: '模仿', current: latestAssessment.results.imitation?.score || 0, previous: previousAssessment?.results.imitation?.score || 0 },
    { domain: '自发行为', current: latestAssessment.results.spontaneous?.score || 0, previous: previousAssessment?.results.spontaneous?.score || 0 },
  ] : [];

  const domainGroups = {
    '提要求': skills.filter(s => s.domain === '提要求'),
    '命名': skills.filter(s => s.domain === '命名'),
    '听者反应': skills.filter(s => s.domain === '听者反应'),
    '视觉匹配': skills.filter(s => s.domain === '视觉匹配'),
    '独立游戏': skills.filter(s => s.domain === '独立游戏'),
    '社交': skills.filter(s => s.domain === '社交'),
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'mastered': return <span className="tag-success">已掌握</span>;
      case 'partial': return <span className="tag-warn">学习中</span>;
      default: return <span className="tag-danger">待达成</span>;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{student.name} - 技能图谱</h1>
      <p className="text-slate-500 mb-6">基于最新评估结果（{latestAssessment?.assessmentDate}）</p>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">能力雷达图</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: '#475569', fontSize: 13 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar
                  name="当前评估"
                  dataKey="current"
                  stroke="#0d9488"
                  fill="#0d9488"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                {previousAssessment && (
                  <Radar
                    name="上次评估"
                    dataKey="previous"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                )}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Skill List by Domain */}
      <div className="space-y-6">
        {Object.entries(domainGroups).map(([domain, domainSkills]) => (
          domainSkills.length > 0 && (
            <div key={domain} className="card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{domain}</h3>
              <div className="space-y-3">
                {domainSkills.map(skill => (
                  <div key={skill.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="font-medium text-slate-700">{skill.skillName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{skill.skillCode} · 评估于 {skill.evaluatedAt}</div>
                    </div>
                    {getStatusBadge(skill.status)}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Summary */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">技能统计</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {skills.filter(s => s.status === 'mastered').length}
            </div>
            <div className="text-sm text-emerald-700 mt-1">已掌握</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {skills.filter(s => s.status === 'partial').length}
            </div>
            <div className="text-sm text-amber-700 mt-1">学习中</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-500">
              {skills.filter(s => s.status === 'not_mastered').length}
            </div>
            <div className="text-sm text-red-700 mt-1">待达成</div>
          </div>
        </div>
      </div>
    </div>
  );
}
