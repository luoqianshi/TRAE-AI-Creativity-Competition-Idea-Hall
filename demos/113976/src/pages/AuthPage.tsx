// 认证页 - 注册 + 登录
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { isValidPhone, isValidPassword } from '@/utils/helpers';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 表单校验错误
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePhone = (value: string) => {
    setPhone(value);
    if (!value) {
      setPhoneError('');
    } else if (!isValidPhone(value)) {
      setPhoneError('请输入正确的手机号');
    } else {
      setPhoneError('');
    }
  };

  const validatePassword = (value: string) => {
    setPassword(value);
    if (!value) {
      setPasswordError('');
    } else if (!isValidPassword(value)) {
      setPasswordError('密码至少 6 位');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 提交前再次校验
    if (!isValidPhone(phone)) {
      setPhoneError('请输入正确的手机号');
      return;
    }
    if (!isValidPassword(password)) {
      setPasswordError('密码至少 6 位');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ phone, password });
      } else {
        await login({ phone, password });
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-xuan-50 to-xuan-200">
      {/* 顶部 Logo 区 */}
      <div className="pt-16 pb-8 px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cinnabar-500 text-white shadow-paper-md mb-4">
          <BookOpen size={28} strokeWidth={1.8} />
        </div>
        <h1 className="text-2xl font-serif font-bold text-ink-800 mb-1">
          亲络家谱
        </h1>
        <p className="text-xs text-ink-500">
          连接家族记忆，传承谱系文化
        </p>
      </div>

      {/* 表单区 */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto">
          {/* 模式切换 */}
          <div className="flex bg-xuan-200/60 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={cn(
                'flex-1 h-10 rounded-md text-sm font-medium transition-all',
                mode === 'login'
                  ? 'bg-white text-cinnabar-600 shadow-paper'
                  : 'text-ink-500',
              )}
            >
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={cn(
                'flex-1 h-10 rounded-md text-sm font-medium transition-all',
                mode === 'register'
                  ? 'bg-white text-cinnabar-600 shadow-paper'
                  : 'text-ink-500',
              )}
            >
              注册
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="tel"
                placeholder="手机号"
                value={phone}
                onChange={(e) => validatePhone(e.target.value)}
                error={phoneError}
                maxLength={11}
                className="pl-10"
              />
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码（至少 6 位）"
                value={password}
                onChange={(e) => validatePassword(e.target.value)}
                error={passwordError}
                className="pl-10 pr-10"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-cinnabar-50 border border-cinnabar-200">
                <p className="text-xs text-cinnabar-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading
                ? '处理中...'
                : mode === 'login'
                  ? '登录'
                  : '注册并登录'}
            </Button>
          </form>

          {/* 说明 */}
          <p className="mt-6 text-center text-xs text-ink-400">
            {mode === 'register'
              ? '注册即表示同意我们的隐私政策，数据仅保存在您的浏览器中'
              : '未注册的手机号将无法登录，请先注册'}
          </p>
        </div>
      </div>
    </div>
  );
}
