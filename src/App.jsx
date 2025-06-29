import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import { useEffect } from 'react'

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

// Components
import ProtectedRoute from './components/common/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'
import TestUserLogin from './components/common/TestUserLogin'
import BackendStatus from './components/common/BackendStatus'

const { Content } = Layout

function AppContent() {
  const { user, loading, token, backendConnected } = useAuth()
  const { connect, disconnect } = useSocket()
  const { collapsed, mobileOpen, isMobile } = useSidebar()

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

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>

      {/* Test User Login Component - Only show on public pages */}
      {!isAuthenticated && <TestUserLogin />}
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App