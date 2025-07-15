import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const SidebarContext = createContext({})

export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      
      if (mobile) {
        setCollapsed(false)
        setMobileOpen(false)
      } else {
        setMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  const closeMobileSidebar = () => {
    setMobileOpen(false)
  }

  const value = {
    collapsed,
    mobileOpen,
    toggleSidebar,
    closeMobileSidebar,
    isMobile
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired
} 

export { SidebarProvider, useSidebar } 