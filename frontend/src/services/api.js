import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: d => api.post('/auth/register', d),
  login:    d => api.post('/auth/login', d),
  me:       () => api.get('/auth/me'),
}

export const transactionsAPI = {
  list:   p => api.get('/transactions/', { params: p }),
  create: d => api.post('/transactions/', d),
  update: (id, d) => api.patch(`/transactions/${id}`, d),
  delete: id => api.delete(`/transactions/${id}`),
}

export const analyticsAPI = {
  summary:      p => api.get('/analytics/summary',      { params: p }),
  byCategory:   p => api.get('/analytics/by-category',  { params: p }),
  monthlyTrend: p => api.get('/analytics/monthly-trend', { params: p }),
  recent:       n => api.get('/analytics/recent-transactions', { params: { limit: n } }),
}

export default api
