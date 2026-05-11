import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ─── Transactions ──────────────────────────────────────────────────────────
export const transactionsAPI = {
  list: (params) => api.get('/transactions/', { params }),
  create: (data) => api.post('/transactions/', data),
  update: (id, data) => api.patch(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
}

// ─── Analytics ────────────────────────────────────────────────────────────
export const analyticsAPI = {
  summary: (params) => api.get('/analytics/summary', { params }),
  byCategory: (params) => api.get('/analytics/by-category', { params }),
  monthlyTrend: (params) => api.get('/analytics/monthly-trend', { params }),
  recent: (limit) => api.get('/analytics/recent-transactions', { params: { limit } }),
}

export default api
