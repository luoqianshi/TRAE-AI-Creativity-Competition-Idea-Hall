import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { authApi } from '../utils/api'
import { QrCode, Loader2, Smartphone, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { token, role, setAuth } = useAuthStore()
  const [qrcodeUrl, setQrcodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState<'qr' | 'password'>('qr')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token && role === 'client') {
      navigate('/calculator')
    } else if (token && role === 'admin') {
      navigate('/admin')
    }
  }, [token, role, navigate])

  useEffect(() => {
    if (loginType === 'qr') {
      const getQrcode = async () => {
        try {
          const response = await authApi.getQrcode()
          setQrcodeUrl(response.data.qrcodeUrl)
        } catch (error) {
          console.error('Failed to get QR code:', error)
        }
      }
      getQrcode()
    }
  }, [loginType])

  const handleTestLogin = () => {
    setLoading(true)
    setTimeout(() => {
      const testToken = 'test_token_' + Date.now()
      const testOpenid = 'test_openid_' + Date.now()
      setAuth(testToken, testOpenid, 'client')
      navigate('/register')
      setLoading(false)
    }, 1000)
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.clientLogin(username, password)
      const data = response.data
      
      setAuth(data.token, '', 'client')
      
      if (data.status === 'approved') {
        navigate('/calculator')
      } else {
        navigate('/register')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = () => {
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-accent-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">无纺布袋报价系统</h1>
          <p className="text-gray-500 mt-2">登录获取报价</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => {
              setLoginType('qr')
              setError('')
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              loginType === 'qr'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            扫码登录
          </button>
          <button
            onClick={() => {
              setLoginType('password')
              setError('')
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              loginType === 'password'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            账号密码登录
          </button>
        </div>

        {loginType === 'qr' ? (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <Smartphone className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">使用微信扫码登录</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center aspect-square">
              {qrcodeUrl ? (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrcodeUrl)}`}
                  alt="WeChat QR Code"
                  className="w-full max-w-[180px] rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm mt-2">加载中...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">请使用微信扫描二维码</p>
          </div>
        ) : (
          <form onSubmit={handlePasswordLogin} className="mb-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                <span>登录</span>
              )}
            </button>
          </form>
        )}

        {loginType === 'qr' && (
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>登录中...</span>
              </>
            ) : (
              <span>测试登录（跳过微信扫码）</span>
            )}
          </button>
        )}

        <button
          onClick={handleAdminLogin}
          className="w-full mt-3 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
        >
          管理员登录
        </button>
      </div>
    </div>
  )
}