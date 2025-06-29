import { useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { SocketContext } from './SocketContextUtils'

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [connectionError, setConnectionError] = useState(null)
  const socketRef = useRef(null)
  const listenersRef = useRef({})
  const reconnectTimeoutRef = useRef(null)

  const connect = useCallback((token) => {
    if (socketRef.current?.connected) {
      return
    }

    // Clear any existing connection error
    setConnectionError(null)

    // Use environment variable or fallback to localhost
    const serverUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    
    console.log('🔌 Attempting to connect to Socket.IO server:', serverUrl)
    
    socketRef.current = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'], // Allow fallback to polling
      timeout: 10000, // 10 second timeout
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
      forceNew: true
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      setConnectionError(null)
      console.log('✅ Socket.IO connected successfully')
      
      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    })

    socketRef.current.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('🔌 Socket.IO disconnected:', reason)
      
      // Only show error toast for unexpected disconnections
      if (reason === 'io server disconnect') {
        setConnectionError('Server disconnected')
      }
    })

    socketRef.current.on('connect_error', (error) => {
      setIsConnected(false)
      setConnectionError(`Connection failed: ${error.message}`)
      console.warn('⚠️ Socket.IO connection error:', error.message)
      
      // Don't show toast for every connection attempt
      if (!reconnectTimeoutRef.current) {
        console.log('💡 Real-time features unavailable. App will work without Socket.IO.')
      }
    })

    socketRef.current.on('reconnect_failed', () => {
      setConnectionError('Failed to reconnect to server')
      console.warn('❌ Socket.IO reconnection failed. Real-time features disabled.')
    })

    // Handle new messages
    socketRef.current.on('new_message', (message) => {
      setMessages(prev => [...prev, message])
      toast(`New message from ${message.senderName}`, {
        icon: '💬',
        duration: 3000
      })
    })

    // Handle notifications
    socketRef.current.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev])
      toast(notification.title, {
        icon: '🔔',
        duration: 4000
      })
    })

    // Handle application updates
    socketRef.current.on('application_update', (data) => {
      toast(`Application ${data.status}: ${data.internshipTitle}`, {
        icon: data.status === 'accepted' ? '✅' : data.status === 'rejected' ? '❌' : '📝',
        duration: 5000
      })
    })

    // Handle user status changes
    socketRef.current.on('user_status_change', (data) => {
      setOnlineUsers(prev => {
        if (data.status === 'online') {
          return [...prev, data.userId]
        } else {
          return prev.filter(id => id !== data.userId)
        }
      })
    })

    // Handle errors
    socketRef.current.on('error', (error) => {
      console.error('Socket.IO error:', error)
      setConnectionError(`Socket error: ${error.message || error}`)
    })

  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setConnectionError(null)
      setNotifications([])
      setMessages([])
      setOnlineUsers([])
      console.log('🔌 Socket.IO disconnected manually')
    }
  }, [])

  const sendMessage = useCallback((messageData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', messageData)
    } else {
      console.warn('⚠️ Cannot send message: Socket.IO not connected')
      // Don't show error toast as this is expected when backend is not running
    }
  }, [])

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', conversationId)
    }
  }, [])

  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_conversation', conversationId)
    }
  }, [])

  const markNotificationRead = useCallback((notificationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_notification_read', notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
    }
  }, [])

  const addEventListener = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
      
      // Store listener for cleanup
      if (!listenersRef.current[event]) {
        listenersRef.current[event] = []
      }
      listenersRef.current[event].push(callback)
    }
  }, [])

  const removeEventListener = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
      
      // Remove from listeners ref
      if (listenersRef.current[event]) {
        listenersRef.current[event] = listenersRef.current[event].filter(
          listener => listener !== callback
        )
      }
    }
  }, [])

  const retry = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect()
    }
  }, [])

  const value = {
    isConnected,
    connectionError,
    notifications,
    messages,
    onlineUsers,
    connect,
    disconnect,
    retry,
    sendMessage,
    joinConversation,
    leaveConversation,
    markNotificationRead,
    addEventListener,
    removeEventListener,
    clearMessages: () => setMessages([]),
    clearNotifications: () => setNotifications([])
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired
}