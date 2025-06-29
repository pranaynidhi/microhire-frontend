import { useState } from 'react'
import { Layout, Badge, Avatar, Dropdown, Button } from 'antd'
import { 
  BellOutlined, 
  MessageOutlined, 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  MenuOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useSocket } from '../../contexts/SocketContextUtils'
import { useSidebar } from '../../contexts/SidebarContext'
import { useNavigate } from 'react-router-dom'
import NotificationDropdown from '../common/NotificationDropdown'

const { Header } = Layout

const Navbar = () => {
  const { user, logout } = useAuth()
  const { notifications } = useSocket()
  const { toggleSidebar, isMobile } = useSidebar()
  const navigate = useNavigate()

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'profile':
        navigate('/profile')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'logout':
        logout()
        break
      default:
        break
    }
  }

  const userMenuItems = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600 }}>{user?.fullName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{user?.email}</div>
          <div style={{ 
            color: '#DC143C', 
            fontSize: '11px', 
            textTransform: 'uppercase',
            fontWeight: 500
          }}>
            {user?.role}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ]

  return (
    <Header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Logo and Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={toggleSidebar}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            height: '40px',
            borderRadius: '8px'
          }}
        />
        
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            gap: '12px'
          }}
          onClick={() => navigate('/dashboard')}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            MH
          </div>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            MicroHire
          </span>
        </div>
      </div>

      {/* Right Side Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Messages */}
        <Button
          type="text"
          icon={<MessageOutlined />}
          onClick={() => navigate('/messages')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            height: '40px',
            borderRadius: '8px'
          }}
        />

        {/* Notifications */}
        <NotificationDropdown>
          <Badge count={unreadCount} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                height: '40px',
                borderRadius: '8px'
              }}
            />
          </Badge>
        </NotificationDropdown>

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
          }}>
            <Avatar 
              size={36}
              src={user?.avatar}
              style={{ 
                backgroundColor: '#DC143C',
                color: 'white'
              }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div style={{ 
              marginLeft: '8px',
              display: isMobile ? 'none' : 'block'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500,
                lineHeight: 1.2
              }}>
                {user?.fullName?.split(' ')[0]}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                textTransform: 'capitalize'
              }}>
                {user?.role}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}

export default Navbar