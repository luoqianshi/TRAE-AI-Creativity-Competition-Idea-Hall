import { useState, useEffect } from 'react'
import { API_BASE } from '../api'

const categories = [
  { key: 'all', label: '全部', icon: '🍽️' },
  { key: 'meat', label: '肉类', icon: '🥩' },
  { key: 'veg', label: '蔬菜', icon: '🥬' },
  { key: 'soup', label: '汤品', icon: '🍲' },
  { key: 'drink', label: '饮品', icon: '🥤' },
]

export default function OrderPage({ user }) {
  const [dishes, setDishes] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [toast, setToast] = useState('')
  const [todayOrders, setTodayOrders] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/dishes`).then(r => r.json()).then(d => d.code === 0 && setDishes(d.data))
    loadTodayOrders()
  }, [])

  function loadTodayOrders() {
    const today = new Date().toISOString().slice(0, 10)
    fetch(`${API_BASE}/orders?date=${today}`).then(r => r.json()).then(d => d.code === 0 && setTodayOrders(d.data))
  }

  const filteredDishes = activeCategory === 'all'
    ? dishes
    : dishes.filter(d => d.category === activeCategory)

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  function addToCart(dish) {
    setCart(prev => {
      const exists = prev.find(item => item.id === dish.id)
      if (exists) return prev.map(item => item.id === dish.id ? {...item, qty: item.qty + 1} : item)
      return [...prev, {...dish, qty: 1}]
    })
    showToast(`已添加 ${dish.name}`)
  }

  function updateQty(dishId, delta) {
    setCart(prev => prev.map(item => item.id === dishId ? {...item, qty: item.qty + delta} : item).filter(item => item.qty > 0))
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 1500)
  }

  async function submitOrder() {
    if (!user) { showToast('请先在"我的"选择身份'); return }
    if (totalItems === 0) return
    const today = new Date().toISOString().slice(0, 10)
    for (const item of cart) {
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, dish_id: item.id, quantity: item.qty, order_date: today })
      })
    }
    showToast('已提交点菜！')
    setCart([])
    setShowPanel(false)
    loadTodayOrders()
  }

  return (
    <div className="page order-page">
      <div className="page-header">
        <h1>🍽️ 今日点菜</h1>
        {user && <span className="user-tag">{user.nickname}</span>}
      </div>

      <aside className="sidebar">
        {categories.map(cat => (
          <div key={cat.key} className={`sidebar-item ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}>
            <span className="sidebar-icon">{cat.icon}</span>
            {cat.label}
          </div>
        ))}
      </aside>

      <main className="main">
        <div className="dish-list">
          {filteredDishes.map(dish => (
            <div key={dish.id} className="dish-card">
              <div className="dish-img">{dish.emoji}</div>
              <div className="dish-info">
                <div className="dish-name">{dish.name}</div>
                <div className="dish-desc">{dish.description}</div>
              </div>
              <button className="dish-add-btn" onClick={() => addToCart(dish)}>+</button>
            </div>
          ))}
        </div>
      </main>

      {showPanel && <div className="basket-panel-mask" onClick={() => setShowPanel(false)} />}
      {showPanel && (
        <div className="basket-panel">
          <div className="basket-panel-header">
            <span className="basket-panel-title">已选菜品</span>
            <button className="clear-btn" onClick={() => setCart([])}>清空</button>
          </div>
          <div className="basket-panel-list">
            {cart.length === 0 ? (
              <div className="basket-empty">还没有选择菜品哦</div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="basket-item">
                  <div className="basket-item-img">{item.emoji}</div>
                  <div className="basket-item-name">{item.name}</div>
                  <div className="quantity-control">
                    <button className="qty-btn minus" onClick={() => updateQty(item.id, -1)}>-</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="bottom-bar">
        <div className="basket-left" onClick={() => setShowPanel(!showPanel)}>
          <div className="basket-icon">
            🛒
            {totalItems > 0 && <span className="basket-badge">{totalItems}</span>}
          </div>
          <div className="basket-text">已选 <span>{totalItems}</span> 道菜</div>
        </div>
        <button className="confirm-btn" disabled={totalItems === 0} onClick={submitOrder}>选好了</button>
      </div>

      {todayOrders.length > 0 && (
        <div className="today-orders">
          <h3>📋 今日已点 ({todayOrders.length})</h3>
          {todayOrders.map(o => (
            <span key={o.id} className="order-tag">{o.emoji} {o.dish_name}×{o.quantity}</span>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
