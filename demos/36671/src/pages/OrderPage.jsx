import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStorage } from '../hooks/useStorage';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';

// 打印尺寸选项
const PRINT_SIZES = [
  { id: 'small', name: '小号', size: '5×5cm', price: 9.9, desc: '迷你可爱' },
  { id: 'medium', name: '中号', size: '8×8cm', price: 15.9, desc: '经典尺寸' },
  { id: 'large', name: '大号', size: '10×10cm', price: 22.9, desc: '醒目大气' },
  { id: 'custom', name: '异形', size: '定制', price: 29.9, desc: '心形/星形等' },
];

// 材质选项
const MATERIALS = [
  { id: 'matte', name: '磨砂软磁', price: 0, desc: '质感温润，可弯折' },
  { id: 'glossy', name: '亮面硬磁', price: 3, desc: '色彩鲜艳，光泽度高' },
  { id: 'metal', name: '金属质感', price: 8, desc: '高级金属拉丝效果' },
  { id: 'acrylic', name: '亚克力', price: 12, desc: '通透晶莹，立体感强' },
];

// 快递选项
const SHIPPING_OPTIONS = [
  { id: 'standard', name: '标准快递', days: '5-7天', price: 6 },
  { id: 'express', name: '加急快递', days: '2-3天', price: 12 },
  { id: 'sameday', name: '同城闪送', days: '当日达', price: 18 },
];

export default function OrderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [magnets] = useStorage('fm_created_magnets', []);
  const [orders, setOrders] = useStorage('fm_orders', []);

  const magnet = magnets.find(m => m.id === id);

  // 表单状态
  const [size, setSize] = useState('medium');
  const [material, setMaterial] = useState('matte');
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState('standard');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // 计算价格
  const sizeOption = PRINT_SIZES.find(s => s.id === size);
  const materialOption = MATERIALS.find(m => m.id === material);
  const shippingOption = SHIPPING_OPTIONS.find(s => s.id === shipping);
  const unitPrice = sizeOption.price + materialOption.price;
  const totalPrice = (unitPrice * quantity) + shippingOption.price;

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('请填写完整的收货信息');
      return;
    }

    const order = {
      id: `order_${Date.now()}`,
      magnetId: id,
      magnetName: magnet?.name || '自定义冰箱贴',
      magnetImage: magnet?.image || '',
      size: sizeOption.name,
      sizeDetail: sizeOption.size,
      material: materialOption.name,
      quantity,
      shipping: shippingOption.name,
      shippingDays: shippingOption.days,
      unitPrice,
      totalPrice,
      recipient: { name: name.trim(), phone: phone.trim(), address: address.trim() },
      note: note.trim(),
      status: 'pending', // pending, paid, producing, shipped, delivered
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [...prev, order]);
    setSubmitted(true);
  };

  if (!magnet) {
    return (
      <AnimatedPage type="fade">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-sm text-text-secondary mb-4">未找到该冰箱贴</p>
          <button onClick={() => navigate('/home')} className="px-6 py-3 btn-primary text-white rounded-xl text-sm font-medium tap-active">
            返回首页
          </button>
        </div>
      </AnimatedPage>
    );
  }

  if (submitted) {
    return (
      <AnimatedPage type="scale">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 spring-in">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">下单成功！</h2>
          <p className="text-sm text-text-secondary mb-2">预计 {shippingOption.days} 送达</p>
          <p className="text-2xl font-bold text-blue-500 mb-6">¥{totalPrice.toFixed(2)}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/home')} className="px-6 py-3 btn-primary text-white rounded-xl text-sm font-medium tap-active">
              返回首页
            </button>
            <button onClick={() => navigate('/profile')} className="px-6 py-3 bg-gray-100 text-text-secondary rounded-xl text-sm font-medium tap-active">
              查看订单
            </button>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage type="slideUp">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold">打印下单</h2>
          <p className="text-text-secondary text-xs">定制专属冰箱贴</p>
        </div>
      </div>

      {/* 冰箱贴预览 */}
      <Card className="mb-4 glass-card">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-200 shrink-0">
            {magnet.image ? (
              <img src={magnet.image} alt={magnet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-2xl">🧲</div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{magnet.name || '自定义冰箱贴'}</p>
            <p className="text-xs text-text-secondary mt-1">{magnet.location || '未知位置'}</p>
            <p className="text-xs text-text-secondary">{magnet.date}</p>
          </div>
        </div>
      </Card>

      {/* 尺寸选择 */}
      <Card className="mb-4 glass-card">
        <p className="text-xs font-medium text-text-secondary mb-3">选择尺寸</p>
        <div className="grid grid-cols-2 gap-2">
          {PRINT_SIZES.map(s => (
            <button
              key={s.id}
              onClick={() => setSize(s.id)}
              className={`p-3 rounded-xl text-left tap-active transition-all ${
                size === s.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-xs text-blue-500 font-bold">¥{s.price}</span>
              </div>
              <p className="text-[10px] text-text-secondary mt-1">{s.size} · {s.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* 材质选择 */}
      <Card className="mb-4 glass-card">
        <p className="text-xs font-medium text-text-secondary mb-3">选择材质</p>
        <div className="space-y-2">
          {MATERIALS.map(m => (
            <button
              key={m.id}
              onClick={() => setMaterial(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left tap-active transition-all ${
                material === m.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-[10px] text-text-secondary">{m.desc}</p>
              </div>
              <span className="text-xs text-blue-500 font-bold">
                {m.price === 0 ? '标配' : `+¥${m.price}`}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* 数量 */}
      <Card className="mb-4 glass-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">购买数量</p>
            <p className="text-[10px] text-text-secondary">单价 ¥{unitPrice.toFixed(2)}/个</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center tap-active"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
              </svg>
            </button>
            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center tap-active"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </Card>

      {/* 快递方式 */}
      <Card className="mb-4 glass-card">
        <p className="text-xs font-medium text-text-secondary mb-3">配送方式</p>
        <div className="space-y-2">
          {SHIPPING_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setShipping(s.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left tap-active transition-all ${
                shipping === s.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-[10px] text-text-secondary">{s.days}</p>
              </div>
              <span className="text-xs text-blue-500 font-bold">¥{s.price}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* 收货信息 */}
      <Card className="mb-4 glass-card">
        <p className="text-xs font-medium text-text-secondary mb-3">收货信息</p>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-text-secondary block mb-1">收货人</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="请输入收货人姓名"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-secondary block mb-1">手机号码</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="请输入手机号码"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-secondary block mb-1">收货地址</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="请输入详细收货地址"
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-secondary block mb-1">备注</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="选填，如有特殊要求请备注"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none"
            />
          </div>
        </div>
      </Card>

      {/* 价格汇总 */}
      <Card className="mb-4 glass-card">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">单价</span>
            <span>¥{unitPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">数量</span>
            <span>×{quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">运费</span>
            <span>¥{shippingOption.price}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
            <span className="font-medium">合计</span>
            <span className="text-xl font-bold text-blue-500">¥{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-2xl text-base font-bold tap-active shadow-lg shadow-blue-500/30 mb-4"
      >
        提交订单 · ¥{totalPrice.toFixed(2)}
      </button>
    </AnimatedPage>
  );
}
