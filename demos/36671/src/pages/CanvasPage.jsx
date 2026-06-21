import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStorage } from '../hooks/useStorage'
import AnimatedPage from '../components/AnimatedPage'
import Card from '../components/Card'
import html2canvas from 'html2canvas'

/* ==================== 常量定义 ==================== */
const GRID_SIZE = 40           // 网格线间距（像素）
const MIN_SCALE = 0.1          // 最小缩放比例
const MAX_SCALE = 3            // 最大缩放比例
const DEFAULT_SCALE = 1        // 默认缩放比例
const MAGNET_SIZE = 120         // 冰箱贴在画布上的默认尺寸
const ZOOM_STEP = 0.15         // 缩放步长
const CANVAS_BG_COLOR = '#f1f5f9' // 画布背景色

/* ==================== 工具函数 ==================== */

// 生成唯一ID
const genId = () => `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

// 限制数值范围
const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

/* ==================== 冰箱贴画布项组件 ==================== */
function CanvasMagnetItem({ item, isSelected, onSelect, onDragStart, onDelete }) {
  const isCircle = item.shape === 'circle'

  return (
    <div
      className={`absolute cursor-grab active:cursor-grabbing transition-shadow duration-150 ${
        isSelected ? 'ring-3 ring-blue-500 ring-offset-2 shadow-lg' : 'shadow-md hover:shadow-lg'
      }`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width || MAGNET_SIZE,
        height: item.height || MAGNET_SIZE,
        zIndex: isSelected ? 10 : 1,
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        onSelect(item.id)
        onDragStart(e, item.id)
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        onSelect(item.id)
        onDragStart(e, item.id)
      }}
    >
      {/* 冰箱贴图片 */}
      <div
        className={`w-full h-full overflow-hidden ${
          isCircle ? 'rounded-full' : 'rounded-xl'
        } bg-white border-2 border-gray-200`}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* 冰箱贴名称标签 */}
      <div
        className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-text-secondary font-medium px-2 py-0.5 rounded-full ${
          isSelected ? 'bg-blue-50 text-blue-600' : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        {item.name || '未命名'}
      </div>

      {/* 选中时显示删除按钮 */}
      {isSelected && (
        <button
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md tap-active z-20"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          x
        </button>
      )}
    </div>
  )
}

/* ==================== 无限画布页面 ==================== */
export default function CanvasPage() {
  const navigate = useNavigate()
  const [magnets] = useStorage('fm_created_magnets', [])
  const [canvasState, setCanvasState] = useStorage('fm_canvas_state', {
    items: [],       // 画布上的冰箱贴列表
    offset: { x: 0, y: 0 },  // 画布平移偏移
    scale: DEFAULT_SCALE,    // 画布缩放比例
  })

  const [selectedId, setSelectedId] = useState(null)
  const [tool, setTool] = useState('move')    // 当前工具：move / select
  const [showAddModal, setShowAddModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const canvasRef = useRef(null)       // 画布容器引用
  const isDraggingCanvas = useRef(false) // 是否正在拖拽画布
  const isDraggingItem = useRef(false)  // 是否正在拖拽冰箱贴
  const dragStartPos = useRef({ x: 0, y: 0 }) // 拖拽起始位置
  const dragItemId = useRef(null)        // 正在拖拽的冰箱贴ID
  const dragItemOffset = useRef({ x: 0, y: 0 }) // 冰箱贴拖拽偏移
  const lastTouchDist = useRef(0)       // 上次触摸距离（用于双指缩放）
  const lastTouchCenter = useRef({ x: 0, y: 0 }) // 上次触摸中心点

  // 当前选中的冰箱贴
  const selectedItem = canvasState.items.find(item => item.id === selectedId)

  /* ---------- 画布状态更新辅助函数 ---------- */
  const updateCanvas = useCallback((updater) => {
    setCanvasState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }, [setCanvasState])

  /* ---------- 鼠标/触摸事件：拖拽画布平移 ---------- */
  const handleCanvasPointerDown = useCallback((e) => {
    // 如果点击的不是画布背景（即点击了冰箱贴），不处理
    if (e.target !== canvasRef.current && !e.target.classList.contains('canvas-bg')) return

    // 取消选中
    setSelectedId(null)

    // 开始拖拽画布
    isDraggingCanvas.current = true
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragStartPos.current = { x: clientX, y: clientY }
  }, [])

  const handleCanvasPointerMove = useCallback((e) => {
    // 拖拽冰箱贴
    if (isDraggingItem.current && dragItemId.current) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      updateCanvas(prev => ({
        ...prev,
        items: prev.items.map(item => {
          if (item.id !== dragItemId.current) return item
          return {
            ...item,
            x: clientX - dragItemOffset.current.x,
            y: clientY - dragItemOffset.current.y,
          }
        }),
      }))
      return
    }

    // 拖拽画布平移
    if (isDraggingCanvas.current) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const dx = clientX - dragStartPos.current.x
      const dy = clientY - dragStartPos.current.y

      updateCanvas(prev => ({
        ...prev,
        offset: {
          x: prev.offset.x + dx,
          y: prev.offset.y + dy,
        },
      }))

      dragStartPos.current = { x: clientX, y: clientY }
    }
  }, [updateCanvas])

  const handleCanvasPointerUp = useCallback(() => {
    isDraggingCanvas.current = false
    isDraggingItem.current = false
    dragItemId.current = null
  }, [])

  /* ---------- 拖拽冰箱贴开始 ---------- */
  const handleItemDragStart = useCallback((e, itemId) => {
    isDraggingItem.current = true
    dragItemId.current = itemId

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    // 计算鼠标点击位置与冰箱贴左上角的偏移
    const item = canvasState.items.find(i => i.id === itemId)
    if (item) {
      dragItemOffset.current = {
        x: clientX - item.x,
        y: clientY - item.y,
      }
    }
  }, [canvasState.items])

  /* ---------- 双指缩放（触摸事件） ---------- */
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // 双指触摸开始
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy)
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (lastTouchDist.current > 0) {
        const scaleFactor = dist / lastTouchDist.current
        updateCanvas(prev => ({
          ...prev,
          scale: clamp(prev.scale * scaleFactor, MIN_SCALE, MAX_SCALE),
        }))
      }

      lastTouchDist.current = dist
    }
  }, [updateCanvas])

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = 0
  }, [])

  /* ---------- 鼠标滚轮缩放 ---------- */
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    updateCanvas(prev => ({
      ...prev,
      scale: clamp(prev.scale + delta, MIN_SCALE, MAX_SCALE),
    }))
  }, [updateCanvas])

  // 绑定滚轮事件（需要 passive: false 才能阻止默认行为）
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  /* ---------- 缩放控制 ---------- */
  const handleZoomIn = () => {
    updateCanvas(prev => ({
      ...prev,
      scale: clamp(prev.scale + ZOOM_STEP, MIN_SCALE, MAX_SCALE),
    }))
  }

  const handleZoomOut = () => {
    updateCanvas(prev => ({
      ...prev,
      scale: clamp(prev.scale - ZOOM_STEP, MIN_SCALE, MAX_SCALE),
    }))
  }

  const handleZoomReset = () => {
    updateCanvas(prev => ({
      ...prev,
      scale: DEFAULT_SCALE,
      offset: { x: 0, y: 0 },
    }))
  }

  /* ---------- 添加冰箱贴到画布 ---------- */
  const handleAddMagnet = (magnet) => {
    // 在画布中心附近随机放置
    const centerX = window.innerWidth / 2 - (MAGNET_SIZE / 2)
    const centerY = window.innerHeight / 2 - (MAGNET_SIZE / 2)
    const randomOffset = () => (Math.random() - 0.5) * 200

    const newItem = {
      id: genId(),
      magnetId: magnet.id,
      name: magnet.name || '未命名',
      imageUrl: magnet.imageUrl,
      shape: magnet.shape || 'circle',
      x: centerX + randomOffset(),
      y: centerY + randomOffset(),
      width: MAGNET_SIZE,
      height: MAGNET_SIZE,
    }

    updateCanvas(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
    setShowAddModal(false)
  }

  /* ---------- 删除选中冰箱贴 ---------- */
  const handleDeleteSelected = () => {
    if (!selectedId) return
    updateCanvas(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== selectedId),
    }))
    setSelectedId(null)
  }

  /* ---------- 清空画布 ---------- */
  const handleClearCanvas = () => {
    if (canvasState.items.length === 0) return
    if (window.confirm('确定要清空画布上的所有冰箱贴吗？')) {
      updateCanvas(prev => ({ ...prev, items: [] }))
      setSelectedId(null)
    }
  }

  /* ---------- 导出画布为图片 ---------- */
  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)

    try {
      // 临时隐藏UI控件，只保留画布内容
      const canvasEl = canvasRef.current
      if (!canvasEl) return

      const result = await html2canvas(canvasEl, {
        backgroundColor: CANVAS_BG_COLOR,
        scale: 2,
        useCORS: true,
        logging: false,
      })

      // 下载图片
      const link = document.createElement('a')
      link.download = `冰箱贴画布_${new Date().toLocaleDateString()}.png`
      link.href = result.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('导出失败:', err)
      alert('导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  /* ---------- 键盘快捷键 ---------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete / Backspace 删除选中项
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        handleDeleteSelected()
      }
      // Escape 取消选中
      if (e.key === 'Escape') {
        setSelectedId(null)
        setShowAddModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- 生成网格背景样式 ---------- */
  const gridStyle = {
    backgroundImage: `
      linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
    backgroundPosition: `${canvasState.offset.x % GRID_SIZE}px ${canvasState.offset.y % GRID_SIZE}px`,
  }

  return (
    <AnimatedPage type="fade">
      {/* 顶部导航栏 */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold">冰箱贴回忆</h2>
          <p className="text-text-secondary text-xs">自由摆放你的冰箱贴收藏</p>
        </div>
      </div>

      {/* 画布容器 */}
      <div
        className="relative rounded-2xl overflow-hidden border border-gray-200"
        style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}
      >
        {/* 网格背景画布 */}
        <div
          ref={canvasRef}
          className="canvas-bg absolute inset-0 w-full h-full"
          style={{
            backgroundColor: CANVAS_BG_COLOR,
            cursor: tool === 'move' ? 'grab' : 'default',
            ...gridStyle,
            overflow: 'hidden',
          }}
          onMouseDown={handleCanvasPointerDown}
          onMouseMove={handleCanvasPointerMove}
          onMouseUp={handleCanvasPointerUp}
          onMouseLeave={handleCanvasPointerUp}
          onTouchStart={(e) => {
            handleTouchStart(e)
            handleCanvasPointerDown(e)
          }}
          onTouchMove={(e) => {
            handleTouchMove(e)
            handleCanvasPointerMove(e)
          }}
          onTouchEnd={() => {
            handleTouchEnd()
            handleCanvasPointerUp()
          }}
        >
          {/* 变换层：应用缩放和平移 */}
          <div
            className="absolute origin-top-left"
            style={{
              transform: `translate(${canvasState.offset.x}px, ${canvasState.offset.y}px) scale(${canvasState.scale})`,
              width: '1px',
              height: '1px',
            }}
          >
            {/* 渲染画布上的冰箱贴 */}
            {canvasState.items.map(item => (
              <CanvasMagnetItem
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onSelect={setSelectedId}
                onDragStart={handleItemDragStart}
                onDelete={handleDeleteSelected}
              />
            ))}

            {/* 空画布提示 */}
            {canvasState.items.length === 0 && (
              <div
                className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <p className="text-4xl mb-2">🧲</p>
                <p className="text-sm text-text-secondary">点击右上角按钮添加冰箱贴</p>
              </div>
            )}
          </div>
        </div>

        {/* 左上角：缩放控制 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-sm font-bold tap-active shadow-sm"
            title="放大"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-sm font-bold tap-active shadow-sm"
            title="缩小"
          >
            -
          </button>
          <button
            onClick={handleZoomReset}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-[10px] font-medium tap-active shadow-sm"
            title="重置视图"
          >
            1:1
          </button>
        </div>

        {/* 缩放比例显示 */}
        <div className="absolute top-3 left-14 glass rounded-lg px-2 py-1 text-[10px] text-text-secondary z-20 shadow-sm">
          {Math.round(canvasState.scale * 100)}%
        </div>

        {/* 右上角：添加冰箱贴按钮 */}
        <button
          onClick={() => setShowAddModal(true)}
          className="absolute top-3 right-3 px-3 py-2 btn-primary text-white rounded-xl text-xs font-medium tap-active flex items-center gap-1.5 z-20 shadow-md"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          添加冰箱贴
        </button>

        {/* 添加冰箱贴弹窗 */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-30 flex items-start justify-center pt-16">
            <Card className="w-72 max-h-[60%] overflow-hidden" glass={true}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">选择冰箱贴</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center tap-active"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {magnets.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-text-secondary mb-3">还没有创建冰箱贴</p>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      navigate('/add-magnet')
                    }}
                    className="px-4 py-2 btn-primary text-white rounded-xl text-xs font-medium tap-active"
                  >
                    去创建
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {magnets.map(magnet => (
                    <button
                      key={magnet.id}
                      onClick={() => handleAddMagnet(magnet)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 tap-active text-left"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={magnet.imageUrl}
                          alt={magnet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{magnet.name || '未命名'}</p>
                        <p className="text-[10px] text-text-secondary">
                          {magnet.shape === 'circle' ? '圆形' : '方形'}
                        </p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 flex-shrink-0">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* 底部工具栏 */}
      <div className="mt-3">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            {/* 工具切换 */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setTool('move')}
                className={`px-3 py-2 rounded-xl text-xs font-medium tap-active flex items-center gap-1.5 ${
                  tool === 'move' ? 'btn-primary text-white' : 'glass text-text-secondary'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                </svg>
                移动
              </button>
              <button
                onClick={() => setTool('select')}
                className={`px-3 py-2 rounded-xl text-xs font-medium tap-active flex items-center gap-1.5 ${
                  tool === 'select' ? 'btn-primary text-white' : 'glass text-text-secondary'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
                选择
              </button>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-1.5">
              <button
                onClick={handleDeleteSelected}
                disabled={!selectedId}
                className={`px-3 py-2 rounded-xl text-xs font-medium tap-active flex items-center gap-1.5 ${
                  selectedId ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-300'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                </svg>
                删除
              </button>

              <button
                onClick={handleExport}
                disabled={isExporting || canvasState.items.length === 0}
                className={`px-3 py-2 rounded-xl text-xs font-medium tap-active flex items-center gap-1.5 ${
                  canvasState.items.length > 0 && !isExporting
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-50 text-gray-300'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {isExporting ? '导出中...' : '导出'}
              </button>

              <button
                onClick={handleClearCanvas}
                disabled={canvasState.items.length === 0}
                className={`px-3 py-2 rounded-xl text-xs font-medium tap-active flex items-center gap-1.5 ${
                  canvasState.items.length > 0
                    ? 'bg-gray-100 text-text-secondary'
                    : 'bg-gray-50 text-gray-300'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                清空
              </button>
            </div>
          </div>
        </Card>
      </div>
    </AnimatedPage>
  )
}
