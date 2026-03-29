import axios from 'axios'

// Configuration de base
const API = axios.create({
  baseURL: 'http://localhost:8080'
})

// Ajoute le token JWT automatiquement
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ===== AUTH =====
export const login = (data) =>
  API.post('/auth/login', data)

export const register = (data) =>
  API.post('/auth/register', data)

// ===== CHAT =====
export const sendMessage = (data) =>
  API.post('/api/chat', data)

export const getConversations = () =>
  API.get('/api/chat/conversations')

export const getMessages = (id) =>
  API.get(`/api/chat/conversations/${id}/messages`)

// ===== PROFILE =====
export const getProfile = () =>
  API.get('/api/profile')

export const updateProfile = (data) =>
  API.put('/api/profile', data)

export const changePassword = (data) =>
  API.put('/api/profile/password', data)

export const uploadPhoto = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return API.post('/api/profile/photo', formData)
}

// ===== DOCUMENTS (Admin) =====
export const uploadDocument = (formData) =>
  API.post('/api/documents/upload', formData)

export const getDocuments = () =>
  API.get('/api/documents')

export default API