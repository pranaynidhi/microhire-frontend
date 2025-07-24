import axios from 'axios'

// Base URL includes the /api prefix
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
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
    
    // Add CSRF token from cookie to header
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]
    
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken
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

// CSRF token management
let csrfTokenPromise = null
let csrfTokenExpiry = 0

// Fetch CSRF token with caching (valid for 1 hour)
export const fetchCsrfToken = async () => {
  const now = Date.now()
  
  // If we have a valid cached promise, return it
  if (csrfTokenPromise && now < csrfTokenExpiry) {
    return csrfTokenPromise
  }
  
  // Fetch new token
  csrfTokenPromise = api.get('/csrf-token')
  csrfTokenExpiry = now + (60 * 60 * 1000) // 1 hour
  
  try {
    await csrfTokenPromise
    return csrfTokenPromise
  } catch (error) {
    // Reset on error
    csrfTokenPromise = null
    csrfTokenExpiry = 0
    throw error
  }
}

// Helper to wrap state-changing requests with CSRF protection
const withCsrf = (fn) => async (...args) => {
  try {
    await fetchCsrfToken()
    return await fn(...args)
  } catch (error) {
    // If CSRF token fetch fails, try one more time
    if (error.response?.status === 403) {
      console.warn('CSRF token expired, fetching new one...')
      csrfTokenPromise = null
      csrfTokenExpiry = 0
      await fetchCsrfToken()
      return await fn(...args)
    }
    throw error
  }
}

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

// 2FA API
export const twoFactorAPI = {
  // Start 2FA setup - get QR code and secret
  setup2FA: withCsrf(() => api.get('/2fa/setup')),
  // Verify 2FA setup with token from authenticator app
  verify2FA: withCsrf((token) => api.post('/2fa/verify', { token })),
  // Disable 2FA for the current user
  disable2FA: withCsrf(() => api.post('/2fa/disable')),
  // Verify 2FA token during login
  verifyLogin: withCsrf((email, token) => api.post('/2fa/verify-login', { email, token })),
  // Generate new recovery codes
  generateRecoveryCodes: withCsrf(() => api.get('/2fa/recovery-codes')),
  // Verify recovery code
  verifyRecoveryCode: withCsrf((email, code) => api.post('/2fa/recover', { email, code })),
};

// Auth API
export const authAPI = {
  login: withCsrf((credentials) => api.post('/auth/login', credentials)),
  register: withCsrf((userData) => api.post('/auth/register', userData)),
  getMe: () => api.get('/auth/me'),
  forgotPassword: withCsrf((email) => api.post('/auth/forgot-password', { email })),
  resetPassword: withCsrf((token, password) => api.post('/auth/reset-password', { token, password })),
  verifyEmail: withCsrf((token) => api.post('/auth/verify-email', { token })),
  updateRole: withCsrf((role) => api.post('/auth/role', { role })),
  logout: withCsrf(() => api.post('/auth/logout')),
  refreshToken: withCsrf(() => api.post('/auth/refresh')),
  // OAuth endpoints
  googleAuth: () => api.get('/auth/oauth/google'),
  githubAuth: () => api.get('/auth/oauth/github'),
  // 2FA endpoints (legacy, use twoFactorAPI instead)
  setup2FA: withCsrf(() => api.post('/auth/2fa/setup')),
  verify2FA: withCsrf((token) => api.post('/auth/2fa/verify', { token })),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  // updateProfile: Accepts userData, including 'education' (array of objects) for students
  updateProfile: withCsrf((userData) => api.put('/users/me', userData)),
  uploadAvatar: withCsrf((formData) => api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })),
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  getSettings: () => api.get('/users/me'),
  updateSettings: withCsrf((settings) => api.put('/users/me', settings)),
  changePassword: withCsrf((passwordData) => api.put('/users/me/password', passwordData)),
  // Delete account now accepts password and sends it in the body
  deleteAccount: withCsrf((password) => api.delete('/users/me/delete', { data: { password } })),
  getMyApplications: () => api.get('/users/me/applications'),
  getMyInternships: () => api.get('/users/me/internships'),
  subscribe: withCsrf((data) => api.post('/users/subscribe', data)),
  notify: withCsrf((data) => api.post('/users/notify', data)),
}

// Internship API
export const internshipAPI = {
  getInternships: (params) => api.get('/internships', { params }),
  getInternshipById: (id) => api.get(`/internships/${id}`),
  createInternship: withCsrf((data) => api.post('/internships', data)),
  updateInternship: withCsrf((id, data) => api.put(`/internships/${id}`, data)),
  deleteInternship: withCsrf((id) => api.delete(`/internships/${id}`)),
  getMyInternships: () => api.get('/internships/me'),
  searchInternships: (params) => api.get('/search/internships', { params }),
  advancedSearch: (params) => api.get('/search/advanced', { params }),
  getSimilarInternships: (id) => api.get(`/search/similar/${id}`),
  getRecommendedInternships: () => api.get('/search/recommendations'),
  getInternshipApplications: (internshipId) => api.get(`/internships/${internshipId}/applications`),
  bookmarkInternship: withCsrf((id) => api.post(`/internships/${id}/bookmark`)),
  removeBookmark: withCsrf((id) => api.delete(`/internships/${id}/bookmark`)),
}

// Application API
export const applicationAPI = {
  getApplications: (params) => api.get('/applications', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  createApplication: withCsrf((data) => api.post('/applications', data)),
  updateApplication: withCsrf((id, data) => api.put(`/applications/${id}`, data)),
  withdrawApplication: withCsrf((id) => api.delete(`/applications/${id}`)),
  getMyApplications: () => api.get('/applications/me'),
  getInternshipApplications: (internshipId) => api.get(`/internships/${internshipId}/applications`),
  updateApplicationStatus: withCsrf((id, status) => api.patch(`/applications/${id}/status`, { status })),
  addFeedback: withCsrf((id, feedback) => api.post(`/applications/${id}/feedback`, feedback)),
  scheduleInterview: withCsrf((id, interviewData) => api.post(`/applications/${id}/interview`, interviewData)),
}

// Message API
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, params) => api.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage: withCsrf((data) => api.post(`/messages/conversations/${data.conversationId}`, data)),
  markAsRead: withCsrf((conversationId) => api.patch(`/messages/conversations/${conversationId}/read`)),
  deleteMessage: withCsrf((messageId) => api.delete(`/messages/${messageId}`)),
  updateMessage: withCsrf((messageId, data) => api.put(`/messages/${messageId}`, data)),
  deleteConversation: withCsrf((conversationId) => api.delete(`/messages/conversations/${conversationId}`)),
  getUnreadCount: () => api.get('/messages/unread-count'),
}

// Notification API
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: withCsrf((id) => api.patch(`/notifications/${id}/read`)),
  markAllAsRead: withCsrf(() => api.patch('/notifications/read-all')),
  deleteNotification: withCsrf((id) => api.delete(`/notifications/${id}`)),
  deleteAllNotifications: withCsrf(() => api.delete('/notifications')),
  getUnreadCount: () => api.get('/notifications/unread-count'),
}

// Analytics API
export const analyticsAPI = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getCompanyAnalytics: () => api.get('/analytics/company'),
  getPlatformAnalytics: () => api.get('/analytics/platform'),
  getInternshipAnalytics: (id) => api.get(`/analytics/internships/${id}`),
  getDashboardStats: () => api.get('/analytics/dashboard'),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: withCsrf((id, role) => api.patch(`/admin/users/${id}/role`, { role })),
  suspendUser: withCsrf((id) => api.patch(`/admin/users/${id}/suspend`)),
  unsuspendUser: withCsrf((id) => api.patch(`/admin/users/${id}/unsuspend`)),
  deleteUser: withCsrf((id) => api.delete(`/admin/users/${id}`)),
  banUser: withCsrf((userId) => api.put(`/admin/users/${userId}/ban`)),
  unbanUser: withCsrf((userId) => api.put(`/admin/users/${userId}/unban`)),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: withCsrf((id) => api.post(`/admin/reports/${id}/resolve`)),
  getInternships: (params) => api.get('/admin/internships', { params }),
  moderateInternship: withCsrf((id, data) => api.patch(`/admin/internships/${id}/moderate`, data)),
  deleteInternship: withCsrf((id) => api.delete(`/admin/internships/${id}`)),
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: withCsrf((settings) => api.put('/admin/settings', settings)),
  moderateReview: withCsrf((reviewId, data) => api.patch(`/reviews/${reviewId}/moderate`, data)),
  getCertificates: (params) => api.get('/admin/certificates', { params }),
  addCertificate: withCsrf((data) => api.post('/admin/certificates', data)),
  updateCertificate: withCsrf((id, data) => api.put(`/admin/certificates/${id}`, data)),
  revokeCertificate: withCsrf((id, reason) => api.patch(`/admin/certificates/${id}/revoke`, { reason })),
}

// Certificate API
export const certificateAPI = {
  getCertificates: () => api.get('/certificates'),
  getCertificateById: (id) => api.get(`/certificates/${id}`),
  verifyCertificate: (code) => api.get(`/certificates/verify/${code}`),
  downloadCertificate: (id) => api.get(`/certificates/${id}/download`),
  addCertificate: withCsrf((data) => api.post('/certificates', data)),
  updateCertificate: withCsrf((id, data) => api.put(`/certificates/${id}`, data)),
  deleteCertificate: withCsrf((id) => api.delete(`/certificates/${id}`)),
  getUserCertificates: () => api.get('/certificates/me'),
  generateShareLink: withCsrf((id) => api.post(`/certificates/${id}/share`)),
  getCertificateAnalytics: (id) => api.get(`/certificates/${id}/analytics`),
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

// Search API
export const searchAPI = {
  searchInternships: (params) => api.get('/search/internships', { params }),
  searchCompanies: (params) => api.get('/search/companies', { params }),
  searchStudents: (params) => api.get('/search/students', { params }),
  advancedSearch: (params) => api.get('/search/advanced', { params }),
  getRecommendations: () => api.get('/search/recommendations'),
  getSimilarInternships: (id) => api.get(`/search/similar/${id}`),
  getSearchSuggestions: (params) => api.get('/search/suggestions', { params }),
  saveSearch: (id) => api.post(`/search/history/${id}/save`),
  getSearchHistory: () => api.get('/search/history'),
  getSavedSearches: () => api.get('/search/saved'),
  trackSearchClick: (data) => api.post('/search/track-click', data),
}

// Review API
export const reviewAPI = {
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  getCompanyReviews: (companyId) => api.get(`/reviews/company/${companyId}`),
  getInternshipReviews: (internshipId) => api.get(`/reviews/internship/${internshipId}`),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  reportReview: (reviewId, data) => api.post(`/reviews/${reviewId}/report`, data),
  moderateReview: (reviewId, data) => api.patch(`/reviews/${reviewId}/moderate`, data),
  getReports: () => api.get('/reviews/reports'),
  getReviewStats: (userId) => api.get(`/reviews/stats/${userId}`),
}

export default api