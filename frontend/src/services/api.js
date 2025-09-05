import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (userData) => api.post('/auth/signup', userData),
  verifyToken: () => api.get('/auth/me'),
}

// Farms API
export const farmsAPI = {
  getAll: () => api.get('/farms'),
  getById: (id) => api.get(`/farms/${id}`),
  create: (farmData) => api.post('/farms', farmData),
  update: (id, farmData) => api.patch(`/farms/${id}`, farmData),
  delete: (id) => api.delete(`/farms/${id}`),
  getStats: () => api.get('/farms/stats/farm-stats'),
}

// Carbon API
export const carbonAPI = {
  getForFarm: (farmId) => api.get(`/carbon/farm/${farmId}`),
  calculate: (farmId) => api.post(`/carbon/calculate/${farmId}`),
  verify: (farmId, verificationData) => api.post(`/carbon/verify/${farmId}`, verificationData),
  getPending: () => api.get('/carbon/pending-verification'),
}

// Satellite API
export const satelliteAPI = {
  getForFarm: (farmId) => api.get(`/satellite/farm/${farmId}`),
  requestImagery: (farmId) => api.post(`/satellite/request-imagery/${farmId}`),
}

export default api