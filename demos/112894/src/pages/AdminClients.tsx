import { useState, useEffect } from 'react'
import { clientApi } from '../utils/api'
import { Check, X, Clock, Search, RefreshCw, Plus, Edit, Trash2, Lock, User } from 'lucide-react'

interface Client {
  id: string
  username: string | null
  company_name: string
  phone: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [newClient, setNewClient] = useState({
    username: '',
    password: '',
    companyName: '',
    phone: ''
  })
  const [resetPassword, setResetPassword] = useState('')

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = filter === 'all' ? {} : { status: filter }
      const response = await clientApi.getClients(params.status)
      setClients(response.data.clients)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [filter])

  const handleApprove = async (clientId: string) => {
    try {
      await clientApi.updateClientStatus(clientId, 'approved')
      fetchClients()
    } catch (error) {
      console.error('Failed to approve client:', error)
    }
  }

  const handleReject = async (clientId: string) => {
    try {
      await clientApi.updateClientStatus(clientId, 'rejected')
      fetchClients()
    } catch (error) {
      console.error('Failed to reject client:', error)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.username || !newClient.password || !newClient.companyName || !newClient.phone) {
      alert('请填写完整信息')
      return
    }

    try {
      await clientApi.createClient(newClient.username, newClient.password, newClient.companyName, newClient.phone)
      setShowCreateModal(false)
      setNewClient({ username: '', password: '', companyName: '', phone: '' })
      fetchClients()
    } catch (error: any) {
      alert(error.response?.data?.error || '创建失败')
    }
  }

  const handleResetPassword = async () => {
    if (!selectedClient || !resetPassword) {
      alert('请输入新密码')
      return
    }

    try {
      await clientApi.resetPassword(selectedClient.id, resetPassword)
      setShowResetPasswordModal(false)
      setResetPassword('')
      setSelectedClient(null)
      fetchClients()
    } catch (error: any) {
      alert(error.response?.data?.error || '重置密码失败')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('确定要删除该客户吗？')) {
      return
    }

    try {
      await clientApi.deleteClient(clientId)
      fetchClients()
    } catch (error: any) {
      alert(error.response?.data?.error || '删除失败')
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.username && client.username.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const stats = {
    total: clients.length,
    pending: clients.filter((c) => c.status === 'pending').length,
    approved: clients.filter((c) => c.status === 'approved').length,
    rejected: clients.filter((c) => c.status === 'rejected').length,
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部 ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            待审核 ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            已通过 ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            已拒绝 ({stats.rejected})
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索用户名、单位名称或电话"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={fetchClients}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加客户
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">用户名</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">单位名称</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">手机号码</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">注册时间</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  暂无客户数据
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    {client.username ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-800">{client.username}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-800">{client.company_name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{client.phone}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        client.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : client.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {client.status === 'pending' && <Clock className="w-3 h-3" />}
                      {client.status === 'approved' && <Check className="w-3 h-3" />}
                      {client.status === 'rejected' && <X className="w-3 h-3" />}
                      {client.status === 'pending' && '待审核'}
                      {client.status === 'approved' && '已通过'}
                      {client.status === 'rejected' && '已拒绝'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(client.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {client.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(client.id)}
                            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            批准
                          </button>
                          <button
                            onClick={() => handleReject(client.id)}
                            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            拒绝
                          </button>
                        </>
                      )}
                      {client.username && (
                        <button
                          onClick={() => {
                            setSelectedClient(client)
                            setShowResetPasswordModal(true)
                          }}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <Lock className="w-4 h-4" />
                          重置密码
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">添加客户账号</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                <input
                  type="text"
                  value={newClient.username}
                  onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                <input
                  type="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="请输入密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">单位名称</label>
                <input
                  type="text"
                  value={newClient.companyName}
                  onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="请输入单位名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="请输入手机号码"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewClient({ username: '', password: '', companyName: '', phone: '' })
                  }}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPasswordModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-2">重置密码</h2>
            <p className="text-gray-500 mb-6">为用户 "{selectedClient.username}" 设置新密码</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="请输入新密码"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false)
                    setResetPassword('')
                    setSelectedClient(null)
                  }}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleResetPassword}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  确认重置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}