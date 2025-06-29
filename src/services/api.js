import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('testUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Test backend connection
export const testConnection = async () => {
  try {
    const response = await api.get('/health')
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Backend connection failed:', error)
    return { success: false, error: error.message }
  }
}

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me/profile', userData),
  uploadAvatar: (formData) => api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  getSettings: () => api.get('/users/me/settings'),
  updateSettings: (settings) => api.put('/users/me/settings', settings),
  changePassword: (passwordData) => api.put('/users/me/password', passwordData),
  deleteAccount: () => api.delete('/users/me'),
}

// Internship API
export const internshipAPI = {
  getInternships: (params) => api.get('/internships', { params }),
  getInternshipById: (id) => api.get(`/internships/${id}`),
  createInternship: (data) => api.post('/internships', data),
  updateInternship: (id, data) => api.put(`/internships/${id}`, data),
  deleteInternship: (id) => api.delete(`/internships/${id}`),
  getMyInternships: () => api.get('/internships/my'),
  searchInternships: (params) => api.get('/search/internships', { params }),
  advancedSearch: (params) => api.get('/search/advanced', { params }),
  getSimilarInternships: (id) => api.get(`/internships/${id}/similar`),
  getRecommendedInternships: () => api.get('/internships/recommended'),
}

// Application API
export const applicationAPI = {
  getApplications: (params) => api.get('/applications', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  createApplication: (data) => api.post('/applications', data),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  withdrawApplication: (id) => api.delete(`/applications/${id}`),
  getMyApplications: () => api.get('/applications/my'),
  getInternshipApplications: (internshipId) => api.get(`/internships/${internshipId}/applications`),
}

// Message API
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (conversationId) => api.put(`/messages/${conversationId}/read`),
  deleteMessage: (messageId) => api.delete(`/messages/message/${messageId}`),
}

// Notification API
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
}

// Analytics API
export const analyticsAPI = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getCompanyAnalytics: () => api.get('/analytics/company'),
  getPlatformAnalytics: () => api.get('/analytics/platform'),
  getInternshipAnalytics: (id) => api.get(`/analytics/internship/${id}`),
  getDashboardStats: () => api.get('/analytics/dashboard'),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (userId) => api.put(`/admin/users/${userId}/ban`),
  unbanUser: (userId) => api.put(`/admin/users/${userId}/unban`),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReportStatus: (id, status) => api.put(`/admin/reports/${id}`, { status }),
  getInternships: (params) => api.get('/admin/internships', { params }),
  deleteInternship: (id) => api.delete(`/admin/internships/${id}`),
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (settings) => api.put('/admin/settings', settings),
}

// Review API
export const reviewAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getInternshipReviews: (internshipId) => api.get(`/reviews/internship/${internshipId}`),
  getCompanyReviews: (companyId) => api.get(`/reviews/company/${companyId}`),
}

// Certificate API
export const certificateAPI = {
  generateCertificate: (data) => api.post('/certificates/generate', data),
  getCertificates: () => api.get('/certificates'),
  getCertificateById: (id) => api.get(`/certificates/${id}`),
  verifyCertificate: (code) => api.get(`/certificates/verify/${code}`),
  downloadCertificate: (id) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
}

// Upload API
export const uploadAPI = {
  uploadResume: (formData) => api.post('/upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadPortfolio: (formData) => api.post('/upload/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadLogo: (formData) => api.post('/upload/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (fileId) => api.delete(`/upload/${fileId}`),
  getFiles: () => api.get('/upload/files'),
}

export default api