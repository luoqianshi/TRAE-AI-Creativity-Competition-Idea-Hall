import { useState, useEffect } from 'react'
import { API_BASE } from '../api'

export default function RecordPage({ user }) {
  const [records, setRecords] = useState([])
  const [dishes, setDishes] = useState([])
  const [users, setUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ dish_id: '', cooking_date: new Date().toISOString().slice(0, 10), note: '' })

  useEffect(() => {
    loadRecords()
    fetch(`${API_BASE}/dishes`).then(r => r.json()).then(d => d.code === 0 && setDishes(d.data))
    fetch(`${API_BASE}/users`).then(r => r.json()).then(d => d.code === 0 && setUsers(d.data))
  }, [])

  function loadRecords() {
    fetch(`${API_BASE}/cooking`).then(r => r.json()).then(d => d.code === 0 && setRecords(d.data))
  }

  async function addRecord() {
    if (!user || !form.dish_id) return
    await fetch(`${API_BASE}/cooking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, dish_id: Number(form.dish_id), cooking_date: form.cooking_date, note: form.note })
    })
    setForm({ dish_id: '', cooking_date: new Date().toISOString().slice(0, 10), note: '' })
    setShowAdd(false)
    loadRecords()
  }

  const grouped = records.reduce((acc, r) => {
    if (!acc[r.cooking_date]) acc[r.cooking_date] = []
    acc[r.cooking_date].push(r)
    return acc
  }, {})

  return (
    <div className="page record-page">
      <div className="page-header">
        <h1>📋 做菜记录</h1>
        {user && <button className="add-btn" onClick={() => setShowAdd(true)}>+ 记录做菜</button>}
      </div>

      {showAdd && (
        <div className="modal-mask" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>记录今日做菜</h3>
            <select value={form.dish_id} onChange={e => setForm({...form, dish_id: e.target.value})}>
              <option value="">选择菜品</option>
              {dishes.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
            </select>
            <input type="date" value={form.cooking_date} onChange={e => setForm({...form, cooking_date: e.target.value})} />
            <input placeholder="备注（可选）" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAdd(false)}>取消</button>
              <button className="btn-confirm" onClick={addRecord}>确认</button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="empty">暂无做菜记录</div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="record-group">
            <div className="record-date">{new Date(date + 'T00:00:00').toLocaleDateString('zh-CN', {month:'long', day:'numeric', weekday:'short'})}</div>
            {items.map(r => (
              <div key={r.id} className="record-card">
                <span className="record-emoji">{r.emoji}</span>
                <div className="record-info">
                  <span className="record-name">{r.dish_name}</span>
                  <span className="record-cook">👨‍🍳 {r.nickname}{r.note ? ` · ${r.note}` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
