import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { clientApi, priceApi } from '../utils/api'
import { Calculator as CalculatorIcon, LogOut, AlertCircle, ArrowRight, Package, Ruler, Hash } from 'lucide-react'

export default function Calculator() {
  const navigate = useNavigate()
  const { token, role, status, logout, setProfile } = useAuthStore()
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    unitPrice: number
    totalPrice: number
    breakdown: {
      materialCost: number
      markup: number
      wasteCost: number
      shippingCost: number
    }
  } | null>(null)
  const [clientInfo, setClientInfo] = useState<{
    companyName: string
    phone: string
    status: 'pending' | 'approved' | 'rejected'
  } | null>(null)

  useEffect(() => {
    if (!token || role !== 'client') {
      navigate('/')
      return
    }

    const fetchClientInfo = async () => {
      try {
        const response = await clientApi.getMe()
        const data = response.data
        setClientInfo({
          companyName: data.companyName,
          phone: data.phone,
          status: data.status
        })
        setProfile(data.companyName, data.phone, data.status)
      } catch (error) {
        console.error('Failed to fetch client info:', error)
      }
    }
    fetchClientInfo()
  }, [token, role, navigate, setProfile])

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!length || !width || !height || !quantity) {
      alert('请填写完整尺寸信息')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await priceApi.calculate(
        parseFloat(length),
        parseFloat(width),
        parseFloat(height),
        parseInt(quantity)
      )
      setResult(response.data)
    } catch (error) {
      console.error('Calculation failed:', error)
      alert('计算失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!token || role !== 'client') {
    return null
  }

  if (status === 'rejected' || (clientInfo && clientInfo.status === 'rejected')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">审核未通过</h2>
          <p className="text-gray-500 mb-6">您的申请未通过审核，请联系管理员了解详情。</p>
          <button
            onClick={logout}
            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            返回登录
          </button>
        </div>
      </div>
    )
  }

  if (status === 'pending' || (clientInfo && clientInfo.status === 'pending')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">待审核</h2>
          <p className="text-gray-500 mb-6">您的申请正在审核中，请等待管理员批准后再查询报价。</p>
          <button
            onClick={logout}
            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            返回登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
              <CalculatorIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">无纺布袋报价系统</h1>
              <p className="text-sm text-gray-500">{clientInfo?.companyName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary-600" />
              输入袋子尺寸
            </h2>

            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    长度 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="cm"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    宽度 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="cm"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    高度 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="cm"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数量 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="个"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white py-4 rounded-xl font-medium hover:from-primary-700 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>计算中...</span>
                ) : (
                  <>
                    <span>计算报价</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">报价结果</h2>

            {result ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-80 mb-1">单价</p>
                  <p className="text-4xl font-bold">¥{result.unitPrice.toFixed(2)}</p>
                  <p className="text-sm opacity-80 mt-2">/个</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">总数量</span>
                    <span className="font-semibold text-gray-800">{quantity} 个</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">总金额</span>
                    <span className="text-2xl font-bold text-accent-500">¥{result.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 mb-3">费用明细</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">原材料成本</span>
                        <span className="text-gray-700">¥{result.breakdown.materialCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">加价 ({(clientInfo?.status === 'approved' ? 30 : 0)}%)</span>
                        <span className="text-gray-700">¥{result.breakdown.markup.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">损耗费用</span>
                        <span className="text-gray-700">¥{result.breakdown.wasteCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">运费分摊</span>
                        <span className="text-gray-700">¥{result.breakdown.shippingCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Package className="w-16 h-16 mb-4" />
                <p>请输入尺寸信息计算报价</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}