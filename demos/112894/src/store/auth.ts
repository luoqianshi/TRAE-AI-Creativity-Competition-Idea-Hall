import { create } from 'zustand'

interface AuthState {
  token: string | null
  openid: string | null
  role: 'client' | 'admin' | null
  companyName: string | null
  phone: string | null
  status: 'pending' | 'approved' | 'rejected' | null
  setAuth: (token: string, openid: string, role: 'client' | 'admin') => void
  setProfile: (companyName: string, phone: string, status: 'pending' | 'approved' | 'rejected') => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token') || null,
  openid: localStorage.getItem('openid') || null,
  role: (localStorage.getItem('role') as 'client' | 'admin') || null,
  companyName: localStorage.getItem('companyName') || null,
  phone: localStorage.getItem('phone') || null,
  status: (localStorage.getItem('status') as 'pending' | 'approved' | 'rejected') || null,
  
  setAuth: (token, openid, role) => {
    localStorage.setItem('token', token)
    localStorage.setItem('openid', openid)
    localStorage.setItem('role', role)
    set({ token, openid, role })
  },
  
  setProfile: (companyName, phone, status) => {
    localStorage.setItem('companyName', companyName)
    localStorage.setItem('phone', phone)
    localStorage.setItem('status', status)
    set({ companyName, phone, status })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('openid')
    localStorage.removeItem('role')
    localStorage.removeItem('companyName')
    localStorage.removeItem('phone')
    localStorage.removeItem('status')
    set({
      token: null,
      openid: null,
      role: null,
      companyName: null,
      phone: null,
      status: null
    })
  }
}))