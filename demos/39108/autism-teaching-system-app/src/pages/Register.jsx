import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../data/store';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      setError('请输入正确的手机号');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = registerUser({ name: name.trim(), phone, password, role });
    if (result.success) {
      setSuccess('注册成功，请登录');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md p-8">
        {/* Logo 区域 */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#0d9488] rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">AT</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">教师注册</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名</label>
            <input
              type="text"
              className="input"
              placeholder="请输入姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">手机号</label>
            <input
              type="tel"
              className="input"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">角色</label>
            <div className="flex gap-2">
              {[
                { key: 'teacher', label: '教师' },
                { key: 'assistant', label: '助教' },
              ].map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                    role === r.key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
            <input
              type="password"
              className="input"
              placeholder="至少6位"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">确认密码</label>
            <input
              type="password"
              className="input"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? '注册中...' : '注 册'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1">
            <ArrowLeft size={14} />
            已有账号，去登录
          </Link>
        </div>
      </div>
    </div>
  );
}
