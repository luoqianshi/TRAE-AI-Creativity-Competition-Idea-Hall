import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Loader2 } from 'lucide-react'

export default function Callback() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')
    const openid = searchParams.get('openid')
    const hasProfile = searchParams.get('hasProfile') === 'true'

    if (token && openid) {
      setAuth(token, openid, 'client')
      
      if (hasProfile) {
        navigate('/calculator')
      } else {
        navigate('/register')
      }
    } else {
      navigate('/')
    }
  }, [navigate, location.search, setAuth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-gray-500 mt-4">登录中...</p>
      </div>
    </div>
  )
}