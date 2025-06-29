import { useState, useEffect, useCallback } from 'react'
import { authAPI, testConnection } from '../services/api'
import { getUserByEmail } from '../data/testUsers'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { AuthContext } from './AuthContextUtils'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [backendConnected, setBackendConnected] = useState(false)

  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('testUser')
    
    if (!savedToken) {
      setLoading(false)
      return
    }

    // If backend is not connected, use test user data
    if (!backendConnected && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setToken(savedToken)
        setLoading(false)
        return
      } catch (error) {
        console.error('Error parsing saved test user:', error)
      }
    }

    // Try real API if backend is connected
    if (backendConnected) {
      try {
        const response = await authAPI.getMe()
        setUser(response.data.user)
        setToken(savedToken)
        localStorage.removeItem('testUser') // Clear test user data when using real backend
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('testUser')
        setToken(null)
        setUser(null)
      }
    }
    
    setLoading(false)
  }, [backendConnected])

  useEffect(() => {
    checkBackendConnection()
    checkAuth()
  }, [checkAuth])

  const checkBackendConnection = async () => {
    try {
      const result = await testConnection()
      setBackendConnected(result.success)
      if (result.success) {
        console.log('✅ Backend connected successfully')
      } else {
        console.warn('⚠️ Backend connection failed, using test data')
      }
    } catch {
      console.warn('⚠️ Backend connection failed, using test data')
      setBackendConnected(false)
    }
  }

  const login = async (credentials) => {
    try {
      // If backend is connected, try real API first
      if (backendConnected) {
        try {
          const response = await authAPI.login(credentials)
          const { token: newToken, user: userData } = response.data
          
          localStorage.setItem('token', newToken)
          localStorage.removeItem('testUser') // Clear any test user data
          setToken(newToken)
          setUser(userData)
          
          toast.success(`Welcome back, ${userData.fullName}!`)
          return { success: true }
        } catch {
          // If real API fails, fall back to test users
          console.warn('Real API login failed, trying test users...')
        }
      }

      // Try test user login (fallback or when backend not connected)
      const testUser = getUserByEmail(credentials.email)
      
      if (testUser && testUser.password === credentials.password) {
        const mockToken = `test-token-${testUser.id}-${Date.now()}`
        
        localStorage.setItem('token', mockToken)
        localStorage.setItem('testUser', JSON.stringify(testUser))
        setToken(mockToken)
        setUser(testUser)
        
        toast.success(`Welcome back, ${testUser.fullName}! ${!backendConnected ? '(Test Mode)' : ''}`)
        return { success: true }
      }

      // If neither worked
      const message = backendConnected ? 'Invalid credentials' : 'Invalid test credentials'
      toast.error(message)
      return { success: false, error: message }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      // Only try real API if backend is connected
      if (backendConnected) {
        const response = await authAPI.register(userData)
        const { token: newToken, user: newUser } = response.data
        
        localStorage.setItem('token', newToken)
        localStorage.removeItem('testUser') // Clear any test user data
        setToken(newToken)
        setUser(newUser)
        
        toast.success(`Welcome to MicroHire, ${newUser.fullName}!`)
        return { success: true }
      } else {
        toast.error('Registration requires backend connection. Please use test accounts for now.')
        return { success: false, error: 'Backend not connected' }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('testUser')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    
    // Update test user data if it exists
    const savedTestUser = localStorage.getItem('testUser')
    if (savedTestUser) {
      localStorage.setItem('testUser', JSON.stringify(updatedUser))
    }
  }

  const forgotPassword = async (email) => {
    try {
      if (!backendConnected) {
        toast.error('Password reset requires backend connection')
        return { success: false, error: 'Backend not connected' }
      }
      
      await authAPI.forgotPassword(email)
      toast.success('Password reset link sent to your email')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      if (!backendConnected) {
        toast.error('Password reset requires backend connection')
        return { success: false, error: 'Backend not connected' }
      }
      
      await authAPI.resetPassword(token, password)
      toast.success('Password reset successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    token,
    backendConnected,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isBusiness: user?.role === 'business',
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}