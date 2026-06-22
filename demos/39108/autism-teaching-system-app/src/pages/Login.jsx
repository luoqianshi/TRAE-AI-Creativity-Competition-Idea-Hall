import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, resetPassword } from '../data/store';
import { LogIn, Users, KeyRound } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = login(phone, password);
    if (user) {
      navigate('/students', { replace: true });
    } else {
      setError('手机号或密码错误');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);
    if (!resetPhone.trim()) { setResetError('请输入手机号'); return; }
    if (resetCode !== '666666') { setResetError('系统密码错误'); return; }
    if (newPassword.length < 6) { setResetError('新密码至少6位'); return; }
    const result = resetPassword(resetPhone, newPassword);
    if (result.success) {
      setResetSuccess(true);
      setTimeout(() => {
        setShowReset(false);
        setResetPhone('');
        setResetCode('');
        setNewPassword('');
        setResetSuccess(false);
      }, 2000);
    } else {
      setResetError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md p-8">
        {/* Logo 区域 */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#0d9488] rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">AT</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">特教一体化教学管理系统</h1>
        </div>

        {showReset ? (
          /* 重置密码表单 */
          <form onSubmit={handleReset} className="space-y-5">
            <h2 className="text-base font-semibold text-slate-700 text-center">重置密码</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">手机号</label>
              <input
                type="tel"
                className="input"
                placeholder="请输入注册手机号"
                value={resetPhone}
                onChange={(e) => setResetPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">系统密码</label>
              <input
                type="text"
                className="input"
                placeholder="请联系管理员获取"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">新密码</label>
              <input
                type="password"
                className="input"
                placeholder="至少6位"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {resetError && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{resetError}</div>
            )}
            {resetSuccess && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">密码重置成功，请登录</div>
            )}
            <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
              <KeyRound size={18} />
              确认重置
            </button>
            <button type="button" onClick={() => setShowReset(false)} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700">
              返回登录
            </button>
          </form>
        ) : (
          /* 登录表单 */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">手机号</label>
              <input type="text" className="input" placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
              <input type="password" className="input" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}
            <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50" disabled={loading}>
              <LogIn size={18} />
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>
        )}

        {/* 底部链接 */}
        {!showReset && (
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setShowReset(true)} className="text-sm text-slate-500 hover:text-primary-600">
              忘记密码？
            </button>
            <Link to="/register" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              还没有账号？立即注册
            </Link>
          </div>
        )}

        {/* 演示账号信息 */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-500">演示账号</span>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>管理员</span><span className="text-slate-400">188****8888</span></div>
            <div className="flex items-center justify-between"><span>陈督导</span><span className="text-slate-400">130****0001</span></div>
            <div className="flex items-center justify-between"><span>张老师</span><span className="text-slate-400">138****1234</span></div>
            <div className="flex items-center justify-between"><span>王助教</span><span className="text-slate-400">137****9012</span></div>
            <div className="text-xs text-slate-400 pt-1">密码：123456</div>
          </div>
        </div>
      </div>
    </div>
  );
}
