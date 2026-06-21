import { useState, useEffect } from 'react'
import { API_BASE } from '../api'

export default function HomePage({ user }) {
  const [announcements, setAnnouncements] = useState([])
  const [dates, setDates] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })

  useEffect(() => {
    fetch(`${API_BASE}/announcements`).then(r => r.json()).then(d => d.code === 0 && setAnnouncements(d.data))
    const month = new Date().getMonth() + 1
    fetch(`${API_BASE}/dates?month=${month}`).then(r => r.json()).then(d => d.code === 0 && setDates(d.data))
  }, [])

  async function addAnnouncement() {
    if (!form.title.trim() || !user) return
    await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, author_id: user.id })
    })
    setForm({ title: '', content: '' })
    setShowAdd(false)
    fetch(`${API_BASE}/announcements`).then(r => r.json()).then(d => d.code === 0 && setAnnouncements(d.data))
  }

  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="page home-page">
      <div className="page-header">
        <h1>🏠 家庭公告</h1>
        <span className="date-text">{today}</span>
      </div>

      {user && (
        <button className="add-btn" onClick={() => setShowAdd(true)}>+ 发布公告</button>
      )}

      {showAdd && (
        <div className="modal-mask" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>发布公告</h3>
            <input placeholder="标题" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <textarea placeholder="内容（可选）" rows={3} value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAdd(false)}>取消</button>
              <button className="btn-confirm" onClick={addAnnouncement}>发布</button>
            </div>
          </div>
        </div>
      )}

      <div className="announcement-list">
        {announcements.length === 0 ? (
          <div className="empty">暂无公告</div>
        ) : (
          announcements.map(a => (
            <div key={a.id} className={`announcement-card ${a.is_pinned ? 'pinned' : ''}`}>
              <div className="ann-header">
                <span className="ann-title">{a.is_pinned ? '📌 ' : ''}{a.title}</span>
                <span className="ann-author">{a.author_name}</span>
              </div>
              {a.content && <div className="ann-content">{a.content}</div>}
              <div className="ann-time">{new Date(a.created_at).toLocaleString('zh-CN')}</div>
            </div>
          ))
        )}
      </div>

      {dates.length > 0 && (
        <div className="section">
          <h2>📅 近期重要日期</h2>
          <div className="date-list">
            {dates.map(d => (
              <div key={d.id} className="date-card">
                <span className="date-icon">
                  {d.date_type === 'birthday' ? '🎂' : d.date_type === 'anniversary' ? '💕' : '📌'}
                </span>
                <span className="date-title">{d.title}</span>
                <span className="date-value">{new Date(d.event_date).toLocaleDateString('zh-CN', {month:'long', day:'numeric'})}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
