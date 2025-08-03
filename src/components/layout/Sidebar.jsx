import { Layout, Menu, Button } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useSidebar } from '../../contexts/SidebarContext'
import {
  DashboardOutlined,
  FolderOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  PlusOutlined,
  TeamOutlined,
  TrophyOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined
} from '@ant-design/icons'

const { Sider } = Layout

const Sidebar = () => {
  const { user } = useAuth()
  const { collapsed, mobileOpen, toggleSidebar, closeMobileSidebar, isMobile } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick = ({ key }) => {
    if (key === 'certificates-link') {
      if (user?.role === 'admin') {
        navigate('/admin?tab=certificates');
      } else {
        navigate('/profile');
      }
      if (isMobile) closeMobileSidebar();
      return;
    }
    // Handle admin tab links
    if (key.startsWith('/admin?tab=')) {
      navigate(key);
      if (isMobile) closeMobileSidebar();
      return;
    }
    navigate(key);
    if (isMobile) {
      closeMobileSidebar();
    }
  }

  const getMenuItems = () => {
    const commonItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        key: '/internships',
        icon: <FolderOutlined />,
        label: 'Internships',
      },
      {
        key: '/search',
        icon: <SearchOutlined />,
        label: 'Search',
      },
      {
        key: '/applications',
        icon: <FileTextOutlined />,
        label: 'Applications',
      },
      {
        key: '/messages',
        icon: <MessageOutlined />,
        label: 'Messages',
      },
    ]

    const studentItems = [
      ...commonItems,
      {
        key: 'certificates-link', // dummy key
        icon: <TrophyOutlined />,
        label: 'Certificates',
      },
    ]

    const businessItems = [
      ...commonItems,
      {
        key: '/create-internship',
        icon: <PlusOutlined />,
        label: 'Create Internship',
      },
      {
        key: '/analytics',
        icon: <BarChartOutlined />,
        label: 'Analytics',
      },
    ]

    const adminItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        key: '/admin',
        icon: <TeamOutlined />,
        label: 'Admin Panel',
        children: [
          {
            key: '/admin?tab=users',
            label: 'Users',
          },
          {
            key: '/admin?tab=internships',
            label: 'Internships',
          },
          {
            key: '/admin?tab=reports',
            label: 'Reports',
          },
          {
            key: '/admin?tab=certificates',
            label: 'Certificates',
          },
          {
            key: '/admin?tab=settings',
            label: 'Settings',
          },
        ]
      },
      {
        key: '/analytics',
        icon: <BarChartOutlined />,
        label: 'Analytics',
      },
    ]

    const bottomItems = [
      {
        type: 'divider',
      },
      {
        key: '/profile',
        icon: <UserOutlined />,
        label: 'Profile',
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Settings',
      },
    ]

    let items = []
    
    switch (user?.role) {
      case 'student':
        items = [...studentItems, ...bottomItems]
        break
      case 'business':
        items = [...businessItems, ...bottomItems]
        break
      case 'admin':
        items = [...adminItems, ...bottomItems]
        break
      default:
        items = [...commonItems, ...bottomItems]
    }

    return items
  }

  // Don't render sidebar on mobile when closed
  if (isMobile && !mobileOpen) {
    return null
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
          }}
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <Sider
        collapsed={collapsed}
        onCollapse={toggleSidebar}
        width={250}
        collapsedWidth={80}
        style={{
          position: 'fixed',
          left: 0,
          top: 64,
          bottom: 0,
          zIndex: 999,
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          overflow: 'auto',
          transition: 'all 0.2s ease'
        }}
        trigger={null}
      >
        {/* Collapse Trigger Button */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{
              fontSize: '16px',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </div>

        <div style={{ padding: '16px 0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              background: 'transparent'
            }}
          />
        </div>

        {/* Nepal-inspired decoration */}
        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              🇳🇵 Made with love for Nepal&apos;s future
            </div>
          </div>
        )}
      </Sider>
    </>
  )
}

export default Sidebar