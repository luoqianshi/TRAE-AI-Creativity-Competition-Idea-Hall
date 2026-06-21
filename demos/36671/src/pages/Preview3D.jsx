import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, RoundedBox } from '@react-three/drei'
import { TextureLoader, DoubleSide } from 'three'
import { useParams, useNavigate } from 'react-router-dom'
import { useStorage } from '../hooks/useStorage'
import AnimatedPage from '../components/AnimatedPage'
import Card from '../components/Card'

/* ==================== 3D 冰箱贴模型组件 ==================== */
function MagnetModel({ imageUrl, shape = 'circle' }) {
  const groupRef = useRef()
  const frontTexture = useLoader(TextureLoader, imageUrl)

  // 冰箱贴尺寸参数（单位近似厘米）
  const radius = 2.5        // 半径
  const thickness = 0.35    // 厚度（约3.5mm比例）
  const bevelSize = 0.08    // 倒角大小

  // 自动缓慢旋转动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
  })

  // 磁铁背面材质（灰色金属质感）
  const backMaterial = useMemo(() => ({
    color: '#8a8a8a',
    metalness: 0.85,
    roughness: 0.3,
  }), [])

  // 冰箱贴侧面材质（白色塑料边缘）
  const sideMaterial = useMemo(() => ({
    color: '#f0f0f0',
    metalness: 0.1,
    roughness: 0.5,
  }), [])

  return (
    <group ref={groupRef}>
      {/* 冰箱贴主体 - 使用 RoundedBox 模拟扁平圆柱体 */}
      <RoundedBox
        args={[radius * 2, radius * 2, thickness]}
        radius={bevelSize}
        smoothness={4}
      >
        {/* 正面 - 显示用户上传的图片 */}
        <meshPhysicalMaterial
          map={frontTexture}
          attach="material-0"
          side={DoubleSide}
          roughness={0.4}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
        {/* 背面 - 磁铁金属质感 */}
        <meshStandardMaterial
          attach="material-1"
          {...backMaterial}
        />
        {/* 侧面 - 白色塑料边缘 */}
        <meshStandardMaterial
          attach="material-2"
          {...sideMaterial}
        />
      </RoundedBox>

      {/* 磁铁背面纹理细节 - 凹槽圆环 */}
      <mesh position={[0, 0, -(thickness / 2 + 0.001)]} rotation={[Math.PI, 0, 0]}>
        <ringGeometry args={[radius * 0.6, radius * 0.7, 64]} />
        <meshStandardMaterial
          color="#6a6a6a"
          metalness={0.9}
          roughness={0.2}
          side={DoubleSide}
        />
      </mesh>

      {/* 阴影平面 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -(radius + 0.5), 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <shadowMaterial opacity={0.15} />
      </mesh>
    </group>
  )
}

/* ==================== 加载状态组件 ==================== */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-text-secondary">加载3D模型中...</p>
      </div>
    </div>
  )
}

/* ==================== 3D 冰箱贴预览页面 ==================== */
export default function Preview3D() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [magnets] = useStorage('fm_created_magnets', [])

  // 根据 id 查找对应的冰箱贴数据
  const magnet = magnets.find(m => m.id === id)

  // 如果没有找到数据，显示提示
  if (!magnet) {
    return (
      <AnimatedPage type="fade">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-4xl mb-3">🧲</p>
          <p className="text-sm text-text-secondary mb-4">未找到冰箱贴数据</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 btn-primary text-white rounded-xl text-sm font-medium tap-active"
          >
            返回
          </button>
        </div>
      </AnimatedPage>
    )
  }

  // 保存到相册（截图下载）
  const handleSaveToAlbum = () => {
    // 获取 Canvas 元素截图
    const canvas = document.querySelector('.preview-canvas canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `${magnet.name || '冰箱贴'}_3D预览.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  // 下单打印（模拟操作）
  const handleOrderPrint = () => {
    alert(`已提交打印订单：${magnet.name || '未命名冰箱贴'}`)
  }

  return (
    <AnimatedPage type="slideUp">
      {/* 顶部导航栏 */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{magnet.name || '3D 预览'}</h2>
          <p className="text-text-secondary text-xs">拖拽旋转查看冰箱贴</p>
        </div>
      </div>

      {/* 冰箱贴信息卡片 */}
      <Card className="mb-4 glass-card">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={magnet.imageUrl}
              alt={magnet.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{magnet.name || '未命名'}</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {magnet.shape === 'circle' ? '圆形' : magnet.shape === 'square' ? '方形' : '自定义'} ·
              {magnet.size || '标准尺寸'}
            </p>
            {magnet.origin && (
              <p className="text-[10px] text-text-secondary mt-0.5">来源：{magnet.origin}</p>
            )}
          </div>
        </div>
      </Card>

      {/* 3D 画布区域 */}
      <div
        className="preview-canvas rounded-2xl overflow-hidden mb-4"
        style={{
          height: '360px',
          background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #1e293b 100%)',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            shadows
            camera={{ position: [0, 0, 7], fov: 45 }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
          >
            {/* 环境光 - 提供基础照明 */}
            <ambientLight intensity={0.4} />

            {/* 主方向光 - 模拟自然光 */}
            <directionalLight
              position={[5, 5, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />

            {/* 补光 - 填充暗部 */}
            <directionalLight
              position={[-3, 2, -3]}
              intensity={0.4}
              color="#b0e0e6"
            />

            {/* 顶部柔光 */}
            <pointLight position={[0, 4, 0]} intensity={0.3} color="#ffffff" />

            {/* 冰箱贴模型 */}
            <MagnetModel imageUrl={magnet.imageUrl} shape={magnet.shape} />

            {/* 轨道控制器 - 支持鼠标拖拽旋转 */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={4}
              maxDistance={12}
              autoRotate={false}
              dampingFactor={0.08}
              enableDamping
            />

            {/* 环境贴图 - 提供反射效果 */}
            <Environment preset="studio" />
          </Canvas>
        </Suspense>
      </div>

      {/* 操作提示 */}
      <div className="text-center mb-4">
        <p className="text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            拖拽旋转 · 滚轮缩放
          </span>
        </p>
      </div>

      {/* 底部操作按钮 */}
      <div className="space-y-2">
        <button
          onClick={handleSaveToAlbum}
          className="w-full py-3.5 btn-primary text-white rounded-xl text-sm font-medium tap-active flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          保存到相册
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleOrderPrint}
            className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium tap-active flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            下单打印
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-xl text-sm font-medium tap-active flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            返回编辑
          </button>
        </div>
      </div>
    </AnimatedPage>
  )
}
