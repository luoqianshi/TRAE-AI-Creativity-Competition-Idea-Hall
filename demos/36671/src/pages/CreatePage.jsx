import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { useStorage } from '../hooks/useStorage';

/* ============================
   常量定义
   ============================ */

// 冰箱贴形状配置
const SHAPES = [
  { id: 'circle', name: '圆形', icon: '●' },
  { id: 'square', name: '方形', icon: '■' },
  { id: 'heart', name: '心形', icon: '♥' },
  { id: 'star', name: '星形', icon: '★' },
  { id: 'hexagon', name: '六边形', icon: '⬡' },
  { id: 'rounded', name: '圆角矩形', icon: '▢' },
];

// 边框样式配置
const BORDER_STYLES = [
  { id: 'none', name: '无边框', color: 'transparent' },
  { id: 'white', name: '白色', color: '#ffffff' },
  { id: 'black', name: '黑色', color: '#1e293b' },
  { id: 'colorful', name: '彩色', color: '#3b82f6' },
];

// 滤镜效果配置（对应 Canvas CSS filter）
const FILTERS = [
  { id: 'none', name: '原图', filter: 'none' },
  { id: 'grayscale', name: '黑白', filter: 'grayscale(100%)' },
  { id: 'sepia', name: '复古', filter: 'sepia(80%)' },
  { id: 'warm', name: '暖色', filter: 'sepia(30%) saturate(140%) brightness(105%)' },
  { id: 'cool', name: '冷色', filter: 'saturate(80%) hue-rotate(180deg) brightness(105%)' },
  { id: 'contrast', name: '高对比', filter: 'contrast(150%) brightness(105%)' },
];

// 文字位置配置
const TEXT_POSITIONS = [
  { id: 'top', name: '顶部' },
  { id: 'center', name: '居中' },
  { id: 'bottom', name: '底部' },
];

// 预览画布尺寸
const PREVIEW_SIZE = 200;

/* ============================
   SVG 形状路径生成
   ============================ */

/**
 * 根据形状 ID 生成 SVG clipPath 的 path d 属性
 * @param {string} shapeId - 形状标识
 * @param {number} size - 画布尺寸
 * @returns {string} SVG path d 属性字符串
 */
function getShapePath(shapeId, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2; // 留出边距

  switch (shapeId) {
    case 'circle':
      // 圆形
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;

    case 'square':
      // 方形
      return `M 2 2 L ${size - 2} 2 L ${size - 2} ${size - 2} L 2 ${size - 2} Z`;

    case 'heart': {
      // 心形
      const s = size * 0.45;
      const topY = cy - s * 0.4;
      return `M ${cx} ${cy + s * 0.8}
              C ${cx - s * 0.05} ${cy + s * 0.6}, ${cx - s * 0.8} ${cy + s * 0.2}, ${cx - s * 0.8} ${topY}
              C ${cx - s * 0.8} ${cy - s * 0.6}, ${cx - s * 0.2} ${cy - s * 0.7}, ${cx} ${cy - s * 0.3}
              C ${cx + s * 0.2} ${cy - s * 0.7}, ${cx + s * 0.8} ${cy - s * 0.6}, ${cx + s * 0.8} ${topY}
              C ${cx + s * 0.8} ${cy + s * 0.2}, ${cx + s * 0.05} ${cy + s * 0.6}, ${cx} ${cy + s * 0.8}
              Z`;
    }

    case 'star': {
      // 五角星
      const outerR = r;
      const innerR = r * 0.4;
      const points = [];
      for (let i = 0; i < 5; i++) {
        // 外顶点
        const outerAngle = (Math.PI / 2 * 3) + (i * 2 * Math.PI / 5);
        points.push(`${cx + outerR * Math.cos(outerAngle)},${cy + outerR * Math.sin(outerAngle)}`);
        // 内顶点
        const innerAngle = outerAngle + Math.PI / 5;
        points.push(`${cx + innerR * Math.cos(innerAngle)},${cy + innerR * Math.sin(innerAngle)}`);
      }
      return `M ${points.join(' L ')} Z`;
    }

    case 'hexagon': {
      // 六边形
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      return `M ${points.join(' L ')} Z`;
    }

    case 'rounded': {
      // 圆角矩形
      const rr = size * 0.12; // 圆角半径
      return `M ${2 + rr} 2
              L ${size - 2 - rr} 2
              Q ${size - 2} 2, ${size - 2} ${2 + rr}
              L ${size - 2} ${size - 2 - rr}
              Q ${size - 2} ${size - 2}, ${size - 2 - rr} ${size - 2}
              L ${2 + rr} ${size - 2}
              Q 2 ${size - 2}, 2 ${size - 2 - rr}
              L 2 ${2 + rr}
              Q 2 2, ${2 + rr} 2
              Z`;
    }

    default:
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  }
}

/* ============================
   主组件：CreatePage
   ============================ */

export default function CreatePage() {
  const navigate = useNavigate();
  const [, setCreatedMagnets] = useStorage('fm_created_magnets', []);

  // ---------- 照片相关状态 ----------
  const [photoTab, setPhotoTab] = useState('camera'); // 当前选项卡：camera / upload
  const [originalImage, setOriginalImage] = useState(null); // 原始图片对象 (HTMLImageElement)
  const [croppedBase64, setCroppedBase64] = useState(null); // 裁剪后的正方形 base64
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }); // 图片拖拽偏移量
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ---------- 编辑工具状态 ----------
  const [shape, setShape] = useState('circle'); // 形状
  const [borderStyle, setBorderStyle] = useState('none'); // 边框样式
  const [borderWidth, setBorderWidth] = useState(4); // 边框宽度
  const [borderColor, setBorderColor] = useState('#3b82f6'); // 彩色边框颜色
  const [filter, setFilter] = useState('none'); // 滤镜
  const [text, setText] = useState(''); // 文字内容
  const [textColor, setTextColor] = useState('#ffffff'); // 文字颜色
  const [textSize, setTextSize] = useState(16); // 文字大小
  const [textPosition, setTextPosition] = useState('bottom'); // 文字位置

  // ---------- 位置信息状态 ----------
  const [locationName, setLocationName] = useState(''); // 位置名称
  const [lat, setLat] = useState(null); // 纬度
  const [lng, setLng] = useState(null); // 经度
  const [locating, setLocating] = useState(false); // 定位中

  // ---------- Canvas 引用 ----------
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // ---------- 获取地理位置 ----------
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationName('定位不可用');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocating(false);
        // 尝试反向地理编码获取位置名称
        fetchLocationName(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn('定位失败:', error.message);
        setLocating(false);
        setLocationName('定位失败');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /**
   * 通过经纬度进行反向地理编码，获取位置名称
   */
  const fetchLocationName = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh`
      );
      const data = await res.json();
      if (data.display_name) {
        // 取前两个层级作为位置名称
        const parts = data.display_name.split(',').slice(0, 2);
        setLocationName(parts.join(',').trim());
      }
    } catch {
      setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  // ---------- 处理图片文件 ----------
  /**
   * 读取图片文件并加载为 Image 对象
   */
  const handleImageFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImageOffset({ x: 0, y: 0 });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // ---------- 裁剪图片为正方形 ----------
  /**
   * 将原始图片按当前偏移量裁剪为正方形，返回 base64
   */
  const cropToSquare = useCallback(() => {
    if (!originalImage) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 400; // 裁剪输出尺寸

    canvas.width = size;
    canvas.height = size;

    // 计算裁剪区域：以图片中心为基准，取正方形区域
    const imgW = originalImage.width;
    const imgH = originalImage.height;
    const cropSize = Math.min(imgW, imgH);

    // 偏移量映射到原图坐标
    const offsetX = (imgW - cropSize) / 2 + imageOffset.x * (imgW / 400);
    const offsetY = (imgH - cropSize) / 2 + imageOffset.y * (imgH / 400);

    ctx.drawImage(
      originalImage,
      offsetX, offsetY, cropSize, cropSize,
      0, 0, size, size
    );

    return canvas.toDataURL('image/jpeg', 0.85);
  }, [originalImage, imageOffset]);

  // ---------- 拖拽处理 ----------
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    setImageOffset((prev) => ({
      x: Math.max(-100, Math.min(100, prev.x + dx)),
      y: Math.max(-100, Math.min(100, prev.y + dy)),
    }));
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // ---------- 渲染预览 ----------
  /**
   * 在 Canvas 上渲染冰箱贴最终效果
   */
  const renderPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = PREVIEW_SIZE;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // 获取当前滤镜
    const filterObj = FILTERS.find((f) => f.id === filter);
    ctx.filter = filterObj ? filterObj.filter : 'none';

    // 创建形状裁剪路径
    ctx.save();
    const path = new Path2D(getShapePath(shape, size));
    ctx.clip(path);

    // 绘制背景色（白色）
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);

    // 绘制裁剪后的图片
    if (croppedBase64) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        // 绘制文字（在裁剪区域内）
        ctx.filter = 'none'; // 文字不应用滤镜
        drawText(ctx, size);
        // 绘制边框
        ctx.restore();
        drawBorder(ctx, size);
      };
      img.src = croppedBase64;
    } else {
      // 没有图片时显示占位
      ctx.fillStyle = '#d1d5db';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('请添加照片', size / 2, size / 2);
      ctx.filter = 'none';
      drawText(ctx, size);
      ctx.restore();
      drawBorder(ctx, size);
    }
  }, [shape, filter, croppedBase64, text, textColor, textSize, textPosition, borderStyle, borderWidth, borderColor]);

  /**
   * 在 Canvas 上绘制文字
   */
  const drawText = (ctx, size) => {
    if (!text.trim()) return;

    ctx.fillStyle = textColor;
    ctx.font = `bold ${textSize}px sans-serif`;
    ctx.textAlign = 'center';

    // 文字背景半透明条
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const padding = 6;

    let y;
    switch (textPosition) {
      case 'top':
        y = textSize + 8;
        break;
      case 'center':
        y = size / 2 + textSize / 3;
        break;
      case 'bottom':
      default:
        y = size - 12;
        break;
    }

    // 绘制文字阴影增强可读性
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(text, size / 2, y);

    // 清除阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  /**
   * 在 Canvas 上绘制边框
   */
  const drawBorder = (ctx, size) => {
    if (borderStyle === 'none') return;

    const bColor = borderStyle === 'colorful' ? borderColor : BORDER_STYLES.find((b) => b.id === borderStyle)?.color || '#ffffff';

    ctx.strokeStyle = bColor;
    ctx.lineWidth = borderWidth;
    const path = new Path2D(getShapePath(shape, size));
    ctx.stroke(path);
  };

  // ---------- 更新裁剪图片和预览 ----------
  useEffect(() => {
    if (originalImage) {
      const base64 = cropToSquare();
      setCroppedBase64(base64);
    }
  }, [originalImage, imageOffset, cropToSquare]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // ---------- 保存冰箱贴 ----------
  const handleSave = () => {
    if (!croppedBase64) {
      alert('请先添加照片');
      return;
    }

    const magnet = {
      id: `created_${Date.now()}`,
      name: locationName || '未命名冰箱贴',
      image: croppedBase64,
      lat,
      lng,
      location: locationName || '未知位置',
      date: new Date().toISOString().slice(0, 10),
      shape,
      borderColor: borderStyle === 'colorful' ? borderColor : BORDER_STYLES.find((b) => b.id === borderStyle)?.color || '',
      borderWidth,
      filter,
      text: text.trim(),
      textColor,
      textSize,
      textPosition,
    };

    setCreatedMagnets((prev) => [...(prev || []), magnet]);
    navigate(`/preview-3d/${magnet.id}`);
  };

  /* ============================
     渲染 UI
     ============================ */

  return (
    <AnimatedPage type="slideUp">
      {/* ---------- 顶部导航栏 ---------- */}
      <div className="flex items-center gap-3 mb-6 glass-card p-3 rounded-2xl">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold">创建冰箱贴</h2>
          <p className="text-text-secondary text-xs">制作你的专属冰箱贴</p>
        </div>
      </div>

      {/* ---------- 照片输入区域 ---------- */}
      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">照片</label>

        {/* 选项卡切换 */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPhotoTab('camera')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium tap-active transition-colors ${
              photoTab === 'camera'
                ? 'btn-primary text-white'
                : 'bg-gray-100 text-text-secondary'
            }`}
          >
            拍照
          </button>
          <button
            onClick={() => setPhotoTab('upload')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium tap-active transition-colors ${
              photoTab === 'upload'
                ? 'btn-primary text-white'
                : 'bg-gray-100 text-text-secondary'
            }`}
          >
            上传照片
          </button>
        </div>

        {/* 隐藏的 input 元素 */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleImageFile(e.target.files[0])}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageFile(e.target.files[0])}
        />

        {/* 照片预览 / 拍照按钮 */}
        {originalImage ? (
          <div
            className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* 使用 CSS object-fit + object-position 模拟拖拽裁剪 */}
            <img
              src={originalImage.src}
              alt="预览"
              className="w-full h-full object-cover pointer-events-none"
              style={{
                objectPosition: `${50 + imageOffset.x * 0.25}% ${50 + imageOffset.y * 0.25}%`,
              }}
              draggable={false}
            />
            {/* 裁剪框指示 */}
            <div className="absolute inset-0 border-2 border-dashed border-blue-400/50 rounded-xl pointer-events-none" />
            {/* 提示文字 */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-xs text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                拖拽调整位置
              </span>
            </div>
            {/* 重新选择按钮 */}
            <button
              onClick={() => {
                setOriginalImage(null);
                setCroppedBase64(null);
                setImageOffset({ x: 0, y: 0 });
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center tap-active"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (photoTab === 'camera') {
                cameraInputRef.current?.click();
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="w-full aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 tap-active border-2 border-dashed border-gray-200"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
              {photoTab === 'camera' ? (
                <>
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </>
              ) : (
                <>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </>
              )}
            </svg>
            <span className="text-sm text-text-secondary">
              {photoTab === 'camera' ? '点击拍照' : '点击上传照片'}
            </span>
          </button>
        )}
      </Card>

      {/* ---------- 编辑工具栏 ---------- */}

      {/* 形状选择 */}
      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">形状</label>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setShape(s.id)}
              className={`p-3 rounded-xl text-center tap-active transition-colors ${
                shape === s.id
                  ? 'bg-blue-100 ring-2 ring-blue-500'
                  : 'bg-gray-50'
              }`}
            >
              <span className="text-xl block mb-1">{s.icon}</span>
              <p className="text-[10px] font-medium">{s.name}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* 边框样式 */}
      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">边框</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {BORDER_STYLES.map((b) => (
            <button
              key={b.id}
              onClick={() => setBorderStyle(b.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tap-active transition-colors ${
                borderStyle === b.id
                  ? 'text-white btn-primary'
                  : 'bg-gray-100 text-text-secondary'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* 边框宽度滑块（仅在有边框时显示） */}
        {borderStyle !== 'none' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-16 shrink-0">宽度</span>
            <input
              type="range"
              min="2"
              max="10"
              value={borderWidth}
              onChange={(e) => setBorderWidth(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-text-secondary w-8 text-right">{borderWidth}px</span>
          </div>
        )}

        {/* 彩色边框颜色选择 */}
        {borderStyle === 'colorful' && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-text-secondary w-16 shrink-0">颜色</span>
            <input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs text-text-secondary">{borderColor}</span>
          </div>
        )}
      </Card>

      {/* 添加文字 */}
      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">文字</label>

        {/* 文字输入 */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入文字内容"
          maxLength={20}
          className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none mb-3"
        />

        {/* 文字大小滑块 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-text-secondary w-16 shrink-0">字号</span>
          <input
            type="range"
            min="10"
            max="32"
            value={textSize}
            onChange={(e) => setTextSize(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-xs text-text-secondary w-8 text-right">{textSize}px</span>
        </div>

        {/* 文字颜色和位置 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">颜色</span>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex-1 flex gap-2 ml-2">
            {TEXT_POSITIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setTextPosition(p.id)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium tap-active transition-colors ${
                  textPosition === p.id
                    ? 'btn-primary text-white'
                    : 'bg-gray-100 text-text-secondary'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 滤镜效果 */}
      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">滤镜</label>
        <div className="grid grid-cols-3 gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`p-2.5 rounded-xl text-center tap-active transition-colors ${
                filter === f.id
                  ? 'bg-blue-100 ring-2 ring-blue-500'
                  : 'bg-gray-50'
              }`}
            >
              <p className="text-xs font-medium">{f.name}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ---------- 实时预览 ---------- */}
      <Card className="mb-4 glass-strong">
        <label className="text-xs font-medium text-text-secondary block mb-3">预览</label>
        <div className="flex justify-center">
          <div className="relative">
            {/* SVG 形状遮罩预览 */}
            <svg
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              viewBox={`0 0 ${PREVIEW_SIZE} ${PREVIEW_SIZE}`}
              className="absolute top-0 left-0 pointer-events-none"
            >
              <defs>
                <clipPath id="previewClip">
                  <path d={getShapePath(shape, PREVIEW_SIZE)} />
                </clipPath>
              </defs>
            </svg>
            {/* Canvas 预览画布 */}
            <canvas
              ref={previewCanvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              className="rounded-lg"
              style={{
                clipPath: `path('${getShapePath(shape, PREVIEW_SIZE)}')`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* ---------- 位置信息 ---------- */}
      <Card className="mb-4">
        <label className="text-xs font-medium text-text-secondary block mb-3">位置</label>

        <div className="flex gap-2 mb-2">
          <button
            onClick={getLocation}
            disabled={locating}
            className={`px-4 py-2 rounded-xl text-sm font-medium tap-active transition-colors ${
              locating
                ? 'bg-gray-200 text-text-secondary'
                : 'btn-primary text-white'
            }`}
          >
            {locating ? '定位中...' : '获取当前位置'}
          </button>
          {lat !== null && lng !== null && (
            <span className="flex-1 flex items-center text-xs text-text-secondary truncate">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          )}
        </div>

        {/* 手动输入位置名称 */}
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="输入或自动获取位置名称"
          className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none"
        />
      </Card>

      {/* ---------- 保存按钮 ---------- */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 py-3 btn-primary text-white rounded-xl text-sm font-medium tap-active"
        >
          保存冰箱贴
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-xl text-sm font-medium tap-active"
        >
          取消
        </button>
      </div>
    </AnimatedPage>
  );
}
