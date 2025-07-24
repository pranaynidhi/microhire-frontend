import { useState } from 'react'
import { Dropdown, List, Button, Typography, Badge, Empty } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useSocket } from '../../contexts/SocketContextUtils'
import { notificationAPI } from '../../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import PropTypes from 'prop-types'

dayjs.extend(relativeTime)

const { Text } = Typography

const NotificationList = () => {
  const { notifications, markNotificationRead } = useSocket()

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      markNotificationRead(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      notifications.forEach(notif => {
        if (!notif.read) {
          markNotificationRead(notif.id)
        }
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  return (
    <div style={{ 
      width: '380px', 
      maxHeight: '500px', 
      overflow: 'hidden',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong style={{ fontSize: '16px' }}>
          Notifications
        </Text>
        {notifications.some(n => !n.read) && (
          <Button 
            type="link" 
            size="small"
            onClick={handleMarkAllAsRead}
            style={{ padding: 0 }}
          >
            Mark all as read
          </Button>
        )}
      </div>
      {/* Notifications List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Empty 
            description="No notifications"
            style={{ padding: '40px 20px' }}
          />
        ) : (
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(notification) => (
              <List.Item
                style={{
                  padding: '12px 20px',
                  backgroundColor: notification.read ? 'white' : '#f8fafc',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer'
                }}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                actions={[
                  !notification.read && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.id)
                      }}
                    />
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!notification.read && (
                        <Badge color="#DC143C" />
                      )}
                      <Text strong={!notification.read} style={{ fontSize: '14px' }}>
                        {notification.title}
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      <Text style={{ 
                        fontSize: '13px', 
                        color: '#666',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {notification.message}
                      </Text>
                      <Text style={{ 
                        fontSize: '12px', 
                        color: '#999'
                      }}>
                        {dayjs(notification.createdAt).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      {/* Footer */}
      {notifications.length > 10 && (
        <div style={{ 
          padding: '12px 20px', 
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <Button type="link" size="small">
            View all notifications
          </Button>
        </div>
      )}
    </div>
  )
}

const NotificationDropdown = ({ children }) => {
  const [open, setOpen] = useState(false)
  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      dropdown={<NotificationList />}
      placement="bottomRight"
      trigger={['click']}
    >
      {children}
    </Dropdown>
  )
}

NotificationDropdown.propTypes = {
  children: PropTypes.node
}

export { NotificationList }

export default NotificationDropdown