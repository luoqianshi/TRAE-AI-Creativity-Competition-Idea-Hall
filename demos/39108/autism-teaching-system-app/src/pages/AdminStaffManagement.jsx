import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Shield, Trash2, KeyRound, Edit3, ChevronDown, ChevronUp,
  UserCog, Phone, CheckCircle, AlertCircle,
} from 'lucide-react';
import {
  getCurrentUser, getAllStaff, deleteUser, updateUserRole,
  adminResetUserPassword, ROLE_LABELS,
} from '../data/store';

const ROLE_COLORS = {
  supervisor: 'bg-amber-100 text-amber-700 border-amber-200',
  teacher: 'bg-primary-100 text-primary-700 border-primary-200',
  assistant: 'bg-slate-100 text-slate-600 border-slate-200',
};

const AVATAR_COLORS = ['bg-primary-500', 'bg-accent-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-amber-500'];

export default function AdminStaffManagement() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [staff, setStaff] = useState(() => getAllStaff());
  const [expandedId, setExpandedId] = useState(null);
  const [editRole, setEditRole] = useState({});
  const [resetPwd, setResetPwd] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield size={48} className="text-slate-300 mb-4" />
        <p className="text-lg text-slate-500">仅管理员可访问此页面</p>
      </div>
    );
  }

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 2500);
  };

  const refresh = () => setStaff(getAllStaff());

  const handleDelete = (userId, name) => {
    if (window.confirm(`确定要删除用户「${name}」吗？删除后不可恢复。`)) {
      deleteUser(userId);
      refresh();
      showMessage('success', `已删除用户「${name}」`);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
    setEditRole({});
    refresh();
    showMessage('success', '角色已更新');
  };

  const handleResetPwd = (userId) => {
    const pwd = resetPwd[userId];
    if (!pwd || pwd.length < 6) {
      showMessage('error', '密码至少6位');
      return;
    }
    adminResetUserPassword(userId, pwd);
    setResetPwd({});
    showMessage('success', '密码已重置');
  };

  const supervisors = staff.filter(u => u.role === 'supervisor');
  const teachers = staff.filter(u => u.role === 'teacher');
  const assistants = staff.filter(u => u.role === 'assistant');

  const renderStaffGroup = (title, list, icon) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
        {icon}
        {title}
        <span className="text-sm font-normal text-slate-400">({list.length}人)</span>
      </h2>
      {list.length === 0 ? (
        <div className="card p-6 text-center text-slate-400">暂无{title}</div>
      ) : (
        <div className="space-y-3">
          {list.map(user => {
            const isExpanded = expandedId === user.id;
            const avatarColor = AVATAR_COLORS[user.name.charCodeAt(0) % AVATAR_COLORS.length];
            return (
              <div key={user.id} className="card overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{user.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_COLORS[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                        <Phone size={13} />
                        {user.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50">
                    {/* 修改角色 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">修改角色</label>
                      <div className="flex gap-2">
                        {['supervisor', 'teacher', 'assistant'].map(role => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(user.id, role)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                              user.role === role
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {ROLE_LABELS[role]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 重置密码 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">重置密码</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input flex-1 text-sm"
                          placeholder="输入新密码（至少6位）"
                          value={resetPwd[user.id] || ''}
                          onChange={(e) => setResetPwd(prev => ({ ...prev, [user.id]: e.target.value }))}
                        />
                        <button
                          onClick={() => handleResetPwd(user.id)}
                          className="btn-secondary text-sm flex items-center gap-1"
                        >
                          <KeyRound size={14} />
                          重置
                        </button>
                      </div>
                    </div>

                    {/* 删除用户 */}
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        删除此用户
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* 消息提示 */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-pulse ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* 页面头部 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <UserCog size={24} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-slate-800">人员管理</h1>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{supervisors.length}</div>
          <div className="text-sm text-slate-500 mt-1">督导</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{teachers.length}</div>
          <div className="text-sm text-slate-500 mt-1">教师</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-slate-600">{assistants.length}</div>
          <div className="text-sm text-slate-500 mt-1">助教</div>
        </div>
      </div>

      {/* 督导列表 */}
      {renderStaffGroup('督导', supervisors, <Shield size={18} className="text-amber-600" />)}
      {/* 教师列表 */}
      {renderStaffGroup('教师', teachers, <Users size={18} className="text-primary-600" />)}
      {/* 助教列表 */}
      {renderStaffGroup('助教', assistants, <Users size={18} className="text-slate-500" />)}
    </div>
  );
}
