import { useState, useEffect } from 'react'
import { priceApi } from '../utils/api'
import { Save, RefreshCw, AlertCircle } from 'lucide-react'

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [parameters, setParameters] = useState({
    rawMaterialPrice: 12000,
    markupRatio: 0.3,
    wasteCost: 0.1,
    shippingCost: 500,
    updatedAt: ''
  })

  const fetchParameters = async () => {
    setLoading(true)
    try {
      const response = await priceApi.getParameters()
      setParameters(response.data)
    } catch (error) {
      console.error('Failed to fetch parameters:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParameters()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await priceApi.updateParameters(parameters)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchParameters()
    } catch (error) {
      console.error('Failed to save parameters:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-500 mt-4">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <Save className="w-5 h-5" />
          <span>保存成功！</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              原材料价格 <span className="text-gray-400">(元/吨)</span>
            </label>
            <input
              type="number"
              value={parameters.rawMaterialPrice}
              onChange={(e) => setParameters({ ...parameters, rawMaterialPrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">无纺布原材料的采购价格</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              加价比例 <span className="text-gray-400">(%)</span>
            </label>
            <input
              type="number"
              value={parameters.markupRatio * 100}
              onChange={(e) => setParameters({ ...parameters, markupRatio: parseFloat(e.target.value) / 100 || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">在原材料成本基础上的加价百分比</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              损耗费用 <span className="text-gray-400">(元/个)</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={parameters.wasteCost}
              onChange={(e) => setParameters({ ...parameters, wasteCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">生产过程中的材料损耗成本</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              运费目标 <span className="text-gray-400">(元)</span>
            </label>
            <input
              type="number"
              value={parameters.shippingCost}
              onChange={(e) => setParameters({ ...parameters, shippingCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">预计的物流运输费用，将分摊到每个袋子</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">价格计算公式说明</p>
              <p className="text-xs text-amber-600 mt-1">
                单价 = 原材料成本 + 加价 + 损耗费用 + 运费分摊<br />
                原材料成本 = 袋子表面积 × 克重(80g/㎡) × 原材料价格 ÷ 1000000<br />
                加价 = 原材料成本 × 加价比例
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              上次更新：{parameters.updatedAt ? new Date(parameters.updatedAt).toLocaleString('zh-CN') : '从未'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchParameters}
              className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              重置
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>保存设置</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}