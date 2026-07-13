import { useState, useEffect } from 'react'
import { useNavigate, Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { LayoutDashboard, Users, Settings, LogOut, Menu, X } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { token, role, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState('clients')

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/admin/login')
    }
  }, [token, role, navigate])

  if (!token || role !== 'admin') {
    return null
  }

  const menuItems = [
    { id: 'clients', label: '客户管理', icon: Users },
    { id: 'settings', label: '参数设置', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside
          className={`fixed lg:relative bg-white shadow-md transition-all duration-300 z-50 ${
            sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className={`p-4 border-b ${sidebarOpen ? '' : 'hidden lg:flex'} justify-center`}>
              {sidebarOpen ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-800">报价系统</h1>
                    <p className="text-xs text-gray-500">管理后台</p>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeMenu === item.id
                return (
                  <Link
                    key={item.id}
                    to={`/admin/${item.id}`}
                    onClick={() => setActiveMenu(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className={`${sidebarOpen ? '' : 'hidden lg:block'}`}>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 w-full"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className={`${sidebarOpen ? '' : 'hidden lg:block'}`}>退出登录</span>
              </button>
            </div>
          </div>
        </aside>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md lg:hidden"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <main className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <header className="bg-white shadow-sm px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeMenu === 'clients' ? '客户管理' : '参数设置'}
            </h2>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}