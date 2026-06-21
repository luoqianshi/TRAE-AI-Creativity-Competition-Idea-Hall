import { useState } from 'react'
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import OrderPage from './pages/OrderPage'
import RecordPage from './pages/RecordPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  function switchUser(user) {
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  return (
    <HashRouter>
      <div className="app">
        <div className="page-container">
          <Routes>
            <Route path="/" element={<HomePage user={currentUser} />} />
            <Route path="/order" element={<OrderPage user={currentUser} />} />
            <Route path="/record" element={<RecordPage user={currentUser} />} />
            <Route path="/profile" element={<ProfilePage user={currentUser} onSwitchUser={switchUser} />} />
          </Routes>
        </div>

        <nav className="bottom-nav">
          <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">首页</span>
          </NavLink>
          <NavLink to="/order" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🍽️</span>
            <span className="nav-label">点菜</span>
          </NavLink>
          <NavLink to="/record" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📋</span>
            <span className="nav-label">记录</span>
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👤</span>
            <span className="nav-label">我的</span>
          </NavLink>
        </nav>
      </div>
    </HashRouter>
  )
}

export default App
