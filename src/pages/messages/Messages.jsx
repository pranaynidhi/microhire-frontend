import { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  List, 
  Input, 
  Button, 
  Typography, 
  Avatar, 
  Badge,
  Empty,
  Spin
} from 'antd'
import { 
  SendOutlined, 
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useSocket } from '../../contexts/SocketContextUtils'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Text, Title } = Typography
const { TextArea } = Input

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { user } = useAuth()
  const { joinConversation, leaveConversation } = useSocket()
  const queryClient = useQueryClient()

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: messageAPI.getConversations
  })

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => selectedConversation ? messageAPI.getMessages(selectedConversation.id) : null,
    enabled: !!selectedConversation
  })

  const markAsReadMutation = useMutation({
    mutationFn: (conversationId) => messageAPI.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations'])
    }
  })

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => messageAPI.sendMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', selectedConversation?.id])
      queryClient.invalidateQueries(['conversations'])
      setMessage('')
    }
  })

  useEffect(() => {
    if (selectedConversation) {
      joinConversation(selectedConversation.id)
      markAsReadMutation.mutate(selectedConversation.id)
    }

    return () => {
      if (selectedConversation) {
        leaveConversation(selectedConversation.id)
      }
    }
  }, [selectedConversation, joinConversation, leaveConversation, markAsReadMutation])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return

    setSending(true)
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        content: message.trim(),
        receiverId: selectedConversation.participants.find(p => p.id !== user.id)?.id
      })
    } finally {
      setSending(false)
    }
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
  }

  if (conversationsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <MessageOutlined style={{ marginRight: '8px' }} />
        Messages
      </Title>

      <Row gutter={[24, 24]} style={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <Col xs={24} md={8}>
          <Card 
            title="Conversations" 
            style={{ height: '100%' }}
            bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            {conversations?.data?.conversations?.length === 0 ? (
              <Empty 
                description="No conversations yet"
                style={{ padding: '40px 20px' }}
              />
            ) : (
              <List
                dataSource={conversations?.data?.conversations || []}
                renderItem={(conversation) => {
                  const otherParticipant = conversation.participants.find(p => p.id !== user.id)
                  return (
                    <List.Item
                      key={conversation.id}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedConversation?.id === conversation.id ? '#f0f0f0' : 'transparent',
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge count={conversation.unreadCount || 0} size="small">
                            <Avatar 
                              src={otherParticipant?.avatar}
                              icon={<UserOutlined />}
                            />
                          </Badge>
                        }
                        title={otherParticipant?.fullName || 'Unknown User'}
                        description={
                          <div>
                            <Text style={{ fontSize: '12px', color: '#666' }}>
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </Text>
                            {conversation.lastMessage && (
                              <Text style={{ fontSize: '11px', color: '#999', display: 'block' }}>
                                {dayjs(conversation.lastMessage.createdAt).fromNow()}
                              </Text>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>
        </Col>

        {/* Messages */}
        <Col xs={24} md={16}>
          <Card 
            title={selectedConversation ? 
              conversations?.data?.conversations?.find(c => c.id === selectedConversation.id)?.participants?.find(p => p.id !== user.id)?.fullName || 'Unknown User'
              : 'Select a conversation'
            }
            style={{ height: '100%' }}
            bodyStyle={{ 
              padding: 0, 
              height: 'calc(100% - 57px)', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            {!selectedConversation ? (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Empty 
                  description="Select a conversation to start messaging"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <>
                {/* Messages List */}
                <div style={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {messagesLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Spin />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {messages?.data?.messages?.map((msg) => (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                            marginBottom: '8px'
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              backgroundColor: msg.senderId === user.id ? '#DC143C' : '#f0f0f0',
                              color: msg.senderId === user.id ? 'white' : '#333'
                            }}
                          >
                            <Text style={{ fontSize: '14px' }}>
                              {msg.content}
                            </Text>
                            <div style={{ 
                              fontSize: '11px', 
                              opacity: 0.7, 
                              marginTop: '4px',
                              textAlign: msg.senderId === user.id ? 'right' : 'left'
                            }}>
                              {dayjs(msg.createdAt).format('HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div style={{ 
                  padding: '16px', 
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <TextArea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    style={{ borderRadius: '8px' }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={sending}
                    disabled={!message.trim()}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Messages