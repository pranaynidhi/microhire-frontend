import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout, ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

// Context Providers
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { SidebarProvider } from './contexts/SidebarContext'

// Context Hooks
import { useAuth } from './contexts/AuthContextUtils'
import { useSocket } from './contexts/SocketContextUtils'
import { useSidebar } from './contexts/SidebarContext'

// Layout Components
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import EmailVerification from './pages/auth/EmailVerification'
import ResetPassword from './pages/auth/ResetPassword'

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard'
import InternshipListings from './pages/internships/InternshipListings'
import InternshipDetails from './pages/internships/InternshipDetails'
import CreateInternship from './pages/internships/CreateInternship'
import Applications from './pages/applications/Applications'
import Messages from './pages/messages/Messages'
import Profile from './pages/profile/Profile'
import Analytics from './pages/analytics/Analytics'
import AdminPanel from './pages/admin/AdminPanel'
import Settings from './pages/settings/Settings'
import SearchPage from './pages/search/SearchPage'

// Components
import ProtectedRoute from './components/common/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'
import BackendStatus from './components/common/BackendStatus'
import ErrorBoundary from './components/common/ErrorBoundary'

const { Content } = Layout

function AppContent() {
  const { user, loading, token, backendConnected } = useAuth()
  const { connect, disconnect } = useSocket()
  const { collapsed, isMobile } = useSidebar()

  useEffect(() => {
    if (token && user && backendConnected) {
      connect(token)
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [token, user, backendConnected, connect, disconnect])

  if (loading) {
    return <LoadingSpinner />
  }

  const isAuthenticated = !!user

  // Calculate content margin based on sidebar state
  const getContentMargin = () => {
    if (!isAuthenticated) return '0'
    if (isMobile) return '0'
    return collapsed ? '80px' : '250px'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isAuthenticated && <Navbar />}
      
      <Layout>
        {isAuthenticated && <Sidebar />}
        
        <Layout>
          <Content style={{ 
            padding: isAuthenticated ? '24px' : '0',
            marginLeft: getContentMargin(),
            marginTop: isAuthenticated ? '64px' : '0',
            transition: 'margin-left 0.2s ease'
          }}>
            {/* Backend Status Alert */}
            {isAuthenticated && <BackendStatus />}
            
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} 
              />
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
              />
              <Route 
                path="/register" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
              />
              <Route 
                path="/forgot-password" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} 
              />
              <Route 
                path="/verify-email" 
                element={<EmailVerification />} 
              />
              <Route 
                path="/reset-password" 
                element={<ResetPassword />} 
              />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/internships" element={
                <ProtectedRoute>
                  <InternshipListings />
                </ProtectedRoute>
              } />
              
              <Route path="/internships/:id" element={
                <ProtectedRoute>
                  <InternshipDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/create-internship" element={
                <ProtectedRoute roles={['business']}>
                  <CreateInternship />
                </ProtectedRoute>
              } />
              
              <Route path="/applications" element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              } />
              
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute roles={['business', 'admin']}>
                  <Analytics />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/search" element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>

    </Layout>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <SidebarProvider>
            <ConfigProvider>
              <Toaster />
              <AppContent />
            </ConfigProvider>
          </SidebarProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App