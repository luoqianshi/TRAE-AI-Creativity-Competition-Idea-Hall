import axios from 'axios'
import { useAuthStore } from '../store/auth'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  getQrcode: () => api.get('/auth/qrcode'),
  clientLogin: (username: string, password: string) => api.post('/auth/client/login', { username, password }),
  adminLogin: (username: string, password: string) => api.post('/auth/admin/login', { username, password })
}

export const clientApi = {
  register: (openid: string, companyName: string, phone: string) => 
    api.post('/clients', { openid, companyName, phone }),
  createClient: (username: string, password: string, companyName: string, phone: string) =>
    api.post('/clients/create', { username, password, companyName, phone }),
  getClients: (status?: string) => api.get('/clients', { params: { status } }),
  updateClientStatus: (id: string, status: 'approved' | 'rejected') => 
    api.put(`/clients/${id}/status`, { status }),
  resetPassword: (id: string, password: string) =>
    api.put(`/clients/${id}/password`, { password }),
  deleteClient: (id: string) => api.delete(`/clients/${id}`),
  getMe: () => api.get('/clients/me')
}

export const priceApi = {
  calculate: (length: number, width: number, height: number, quantity: number) => 
    api.post('/price/calculate', { length, width, height, quantity }),
  getParameters: () => api.get('/price/parameters'),
  updateParameters: (params: {
    rawMaterialPrice?: number
    markupRatio?: number
    wasteCost?: number
    shippingCost?: number
  }) => api.put('/price/parameters', params)
}

export default api