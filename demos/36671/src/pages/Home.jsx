import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import AnimatedPage from '../components/AnimatedPage';
import { useStorage } from '../hooks/useStorage';

/* 预设示例数据 - 当 localStorage 没有数据时展示 */
const PRESET_MAGNETS = [
  {
    id: 'preset-beijing',
    name: '北京·故宫',
    image: '',
    lat: 39.9042,
    lng: 116.4074,
    location: '北京市东城区',
    date: '2025-01-15',
    shape: 'circle',
    color: '#ef4444',
    text: '京',
  },
  {
    id: 'preset-shanghai',
    name: '上海·东方明珠',
    image: '',
    lat: 31.2304,
    lng: 121.4737,
    location: '上海市浦东新区',
    date: '2025-03-20',
    shape: 'circle',
    color: '#3b82f6',
    text: '沪',
  },
  {
    id: 'preset-guangzhou',
    name: '广州·小蛮腰',
    image: '',
    lat: 23.1291,
    lng: 113.2644,
    location: '广州市海珠区',
    date: '2025-05-10',
    shape: 'circle',
    color: '#22c55e',
    text: '穗',
  },
  {
    id: 'preset-chengdu',
    name: '成都·熊猫基地',
    image: '',
    lat: 30.5728,
    lng: 104.0668,
    location: '成都市成华区',
    date: '2025-07-08',
    shape: 'circle',
    color: '#f59e0b',
    text: '蓉',
  },
  {
    id: 'preset-xian',
    name: '西安·兵马俑',
    image: '',
    lat: 34.3416,
    lng: 108.9398,
    location: '西安市临潼区',
    date: '2025-09-12',
    shape: 'circle',
    color: '#8b5cf6',
    text: '秦',
  },
  {
    id: 'preset-hangzhou',
    name: '杭州·西湖',
    image: '',
    lat: 30.2741,
    lng: 120.1551,
    location: '杭州市西湖区',
    date: '2025-11-05',
    shape: 'circle',
    color: '#06b6d4',
    text: '杭',
  },
];

/* 根据冰箱贴数据创建自定义 divIcon */
function createMagnetIcon(magnet) {
  /* 如果有图片则显示图片，否则显示带文字的彩色圆形 */
  const html = magnet.image
    ? `<div class="magnet-marker"><img src="${magnet.image}" alt="${magnet.name}" /></div>`
    : `<div class="magnet-marker" style="background:${magnet.color || '#6366f1'};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">${magnet.text || '🧲'}</div>`;

  return L.divIcon({
    html,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
  });
}

/* 生成弹出窗口内容 */
function createPopupContent(magnet) {
  const imgSrc = magnet.image || '';
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${magnet.name}" style="width:100%;height:140px;object-fit:cover;border-radius:12px 12px 0 0;" />`
    : `<div style="width:100%;height:140px;background:${magnet.color || '#6366f1'};border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:center;font-size:48px;color:white;font-weight:bold;">${magnet.text || '🧲'}</div>`;

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-width:220px;">
      ${imgHtml}
      <div style="padding:12px 14px;">
        <div style="font-size:15px;font-weight:600;color:#1e293b;margin-bottom:6px;">${magnet.name}</div>
        <div style="font-size:12px;color:#64748b;display:flex;align-items:center;gap:4px;margin-bottom:4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${magnet.location || '未知位置'}
        </div>
        <div style="font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${magnet.date || '未知日期'}
        </div>
      </div>
    </div>
  `;
}

export default function Home() {
  const navigate = useNavigate();
  const [magnets] = useStorage('fm_created_magnets', []);
  const [searchText, setSearchText] = useState('');
  const [filterShape, setFilterShape] = useState('all');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  /* 合并数据：有用户数据用用户的，没有则用预设 */
  const displayMagnets = useMemo(() => {
    const source = magnets.length > 0 ? magnets : PRESET_MAGNETS;
    return source.filter((m) => {
      /* 搜索过滤 */
      if (searchText && !m.name.toLowerCase().includes(searchText.toLowerCase()) && !(m.location || '').includes(searchText)) {
        return false;
      }
      /* 形状过滤 */
      if (filterShape !== 'all' && m.shape !== filterShape) {
        return false;
      }
      return true;
    });
  }, [magnets, searchText, filterShape]);

  /* 获取所有不重复的形状，用于筛选 */
  const shapes = useMemo(() => {
    const source = magnets.length > 0 ? magnets : PRESET_MAGNETS;
    const set = new Set(source.map((m) => m.shape).filter(Boolean));
    return [...set];
  }, [magnets]);

  /* 初始化地图 */
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      /* 创建地图实例，默认中心点为中国，缩放级别4 */
      const map = L.map(mapRef.current, {
        center: [35.86, 104.19],
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
      });

      /* 使用高德瓦片图层 - 电子地图（区域面+路网+注记+楼块） */
      L.tileLayer('https://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&style=7&ltype=0&scl=0&size=0', {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
      }).addTo(map);

      /* 添加缩放控件到右下角 */
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      /* 创建标记图层组 */
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      /* 自动定位到当前城市 */
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 12, { animate: true });
          },
          () => {
            /* 定位失败，保持默认视图 */
          },
          { timeout: 5000, maximumAge: 300000 }
        );
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /* 更新标记点 */
  useEffect(() => {
    if (!markersLayerRef.current) return;

    /* 清除旧标记 */
    markersLayerRef.current.clearLayers();

    /* 添加新标记 */
    displayMagnets.forEach((magnet) => {
      if (magnet.lat && magnet.lng) {
        const marker = L.marker([magnet.lat, magnet.lng], {
          icon: createMagnetIcon(magnet),
        });

        /* 绑定弹出窗口 */
        marker.bindPopup(createPopupContent(magnet), {
          maxWidth: 260,
          minWidth: 220,
          closeButton: true,
          className: '',
        });

        markersLayerRef.current.addLayer(marker);
      }
    });

    /* 如果有标记点，自动调整视图以包含所有标记 */
    if (displayMagnets.length > 0 && mapInstanceRef.current) {
      const validMagnets = displayMagnets.filter((m) => m.lat && m.lng);
      if (validMagnets.length > 0) {
        const bounds = L.latLngBounds(validMagnets.map((m) => [m.lat, m.lng]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [displayMagnets]);

  return (
    <AnimatedPage type="fade">
      {/* 地图全屏 fixed 铺底，不依赖父容器高度 */}
      <div ref={mapRef} className="fixed inset-0 z-0" />

      {/* 顶部搜索栏和筛选 - 浮在地图上方 */}
      <div className="fixed top-0 left-0 right-0 z-[1000] safe-top">
        <div className="px-4 pt-3 pb-2">
          {/* 搜索栏 - 毛玻璃效果 */}
          <div
            className="glass-strong flex items-center gap-2.5 px-4 py-3 mb-2"
            style={{ borderRadius: 24, boxShadow: '0 8px 32px rgba(59,130,246,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="搜索冰箱贴名称或地点..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            )}
          </div>

          {/* 筛选标签 */}
          {shapes.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-0.5">
              <button
                onClick={() => setFilterShape('all')}
                className={`shrink-0 px-4 py-1.5 text-xs font-semibold transition-all ${
                  filterShape === 'all' ? 'btn-chip-active' : 'btn-chip'
                }`}
              >
                全部
              </button>
              {shapes.map((shape) => (
                <button
                  key={shape}
                  onClick={() => setFilterShape(shape)}
                  className={`shrink-0 px-4 py-1.5 text-xs font-semibold transition-all ${
                    filterShape === shape ? 'btn-chip-active' : 'btn-chip'
                  }`}
                >
                  {shape === 'circle' ? '圆形' : shape === 'square' ? '方形' : shape === 'heart' ? '心形' : shape}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 数据统计标签 - 浮在地图右上角 */}
      <div className="fixed top-[100px] right-4 z-[1000]">
        <div
          className="glass px-3.5 py-2"
          style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <span className="text-xs text-slate-500">
            共 <span className="font-bold text-blue-500">{displayMagnets.length}</span> 个冰箱贴
          </span>
        </div>
      </div>
    </AnimatedPage>
  );
}
