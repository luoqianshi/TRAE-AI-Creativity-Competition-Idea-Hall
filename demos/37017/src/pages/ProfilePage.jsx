import { useState, useEffect } from 'react'
import { API_BASE } from '../api'

export default function ProfilePage({ user, onSwitchUser }) {
  const [users, setUsers] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({ nickname: '', role_name: '' })

  useEffect(() => {
    fetch(`${API_BASE}/users`).then(r => r.json()).then(d => d.code === 0 && setUsers(d.data))
  }, [])

  function selectUser(u) {
    onSwitchUser(u)
  }

  function startEdit() {
    if (!user) return
    setForm({ nickname: user.nickname, role_name: user.role_name })
    setShowEdit(true)
  }

  async function saveProfile() {
    if (!user || !form.nickname.trim()) return
    await fetch(`${API_BASE}/users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, nickname: form.nickname, role_name: form.role_name })
    })
    const updated = {...user, nickname: form.nickname, role_name: form.role_name}
    onSwitchUser(updated)
    setShowEdit(false)
    fetch(`${API_BASE}/users`).then(r => r.json()).then(d => d.code === 0 && setUsers(d.data))
  }

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h1>👤 我的</h1>
      </div>

      {user ? (
        <div className="profile-card">
          <div className="profile-avatar">{user.nickname[0]}</div>
          <div className="profile-info">
            <div className="profile-name">{user.nickname}</div>
            <div className="profile-role">{user.role_name}</div>
          </div>
          <button className="edit-btn" onClick={startEdit}>编辑</button>
        </div>
      ) : (
        <div className="empty">请先选择一个身份</div>
      )}

      {showEdit && (
        <div className="modal-mask" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>编辑资料</h3>
            <input placeholder="昵称" value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})} />
            <input placeholder="角色（如：爸爸、妈妈、孩子）" value={form.role_name} onChange={e => setForm({...form, role_name: e.target.value})} />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowEdit(false)}>取消</button>
              <button className="btn-confirm" onClick={saveProfile}>保存</button>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>切换身份</h2>
        <div className="user-list">
          {users.map(u => (
            <div key={u.id} className={`user-card ${user?.id === u.id ? 'selected' : ''}`} onClick={() => selectUser(u)}>
              <div className="user-avatar">{u.nickname[0]}</div>
              <div className="user-detail">
                <span className="user-name">{u.nickname}</span>
                <span className="user-role">{u.role_name}</span>
              </div>
              {user?.id === u.id && <span className="check-mark">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
