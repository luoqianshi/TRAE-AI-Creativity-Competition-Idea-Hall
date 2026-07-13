import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Callback from './pages/Callback'
import Calculator from './pages/Calculator'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminClients from './pages/AdminClients'
import AdminSettings from './pages/AdminSettings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/calculator" element={<Calculator />} />
      
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />}>
        <Route index element={<AdminClients />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}