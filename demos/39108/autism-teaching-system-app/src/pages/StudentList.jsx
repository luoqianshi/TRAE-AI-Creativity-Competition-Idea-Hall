import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, User } from 'lucide-react';
import { getStudents, getStudentsByTeacher, hasPermission, getCurrentUser } from '../data/store';
import AddStudentModal from '../components/AddStudentModal';

export default function StudentList() {
  const [students, setStudents] = useState(getStudents());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const currentUser = getCurrentUser();
  const canAddStudent = currentUser?.role === 'supervisor'; // 只有督导能添加学生
  const isTeacherOrAssistant = currentUser?.role === 'teacher' || currentUser?.role === 'assistant';

  // 教师/助教只看到自己被分配的学生，督导看到全部
  const visibleStudents = getStudentsByTeacher();

  const filteredStudents = visibleStudents.filter(s =>
    s.name.includes(searchTerm) ||
    s.currentStage.includes(searchTerm)
  );

  const handleStudentAdded = (newStudent) => {
    setStudents([...students, newStudent]);
    setShowAddModal(false);
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'active': return <span className="tag-success">在训</span>;
      case 'graduated': return <span className="tag-primary">已毕业</span>;
      default: return <span className="tag-warn">需评估</span>;
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-primary-500', 'bg-accent-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div>
      {isTeacherOrAssistant && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-4 text-sm">
          当前为{currentUser.role === 'teacher' ? '教师' : '助教'}账号，仅可查看被分配的学生
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">学生档案</h1>
        {canAddStudent && (
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            新增学生
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="搜索学生姓名或当前阶段..."
          className="input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => (
          <Link
            key={student.id}
            to={`/students/${student.id}`}
            className="card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white font-bold text-lg`}>
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 truncate">{student.name}</h3>
                  {getStatusTag(student.status)}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {student.gender} · {student.age}岁
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="tag-primary text-xs">{student.currentStage}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  最近评估：{student.lastAssessmentDate}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500">
            {isTeacherOrAssistant ? '暂无分配的学生，请联系督导分配' : '未找到匹配的学生'}
          </p>
        </div>
      )}

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleStudentAdded}
        />
      )}
    </div>
  );
}
