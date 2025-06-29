import { useState } from 'react'
import { Card, Button, Typography, Space, Divider, Tag, Collapse } from 'antd'
import { UserOutlined, LoginOutlined, CopyOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { testUsers } from '../../data/testUsers'
import { useAuth } from '../../contexts/AuthContextUtils'
import toast from 'react-hot-toast'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

const TestUserLogin = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleTestLogin = async (credentials) => {
    setLoading(true)
    try {
      const result = await login(credentials)
      if (result.success) {
        toast.success(`✅ Logged in as ${credentials.role}`)
      } else {
        toast.error('❌ Login failed')
      }
    } catch {
      toast.error('❌ Login failed')
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = (email, password) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`)
    toast.success('📋 Credentials copied to clipboard!')
  }

  const renderUserCard = (user, type) => (
    <Card 
      key={user.email}
      size="small" 
      style={{ marginBottom: '12px' }}
      actions={[
        <Button 
          key="login"
          type="primary" 
          size="small"
          icon={<LoginOutlined />}
          loading={loading}
          onClick={() => handleTestLogin(user)}
        >
          Login
        </Button>,
        <Button 
          key="copy"
          size="small"
          icon={<CopyOutlined />}
          onClick={() => copyCredentials(user.email, user.password)}
        >
          Copy
        </Button>
      ]}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <UserOutlined />
        <Text strong style={{ fontSize: '13px' }}>{user.email}</Text>
        <Tag 
          color={
            type === 'students' ? 'green' : 
            type === 'businesses' ? 'blue' : 'red'
          }
          size="small"
        >
          {user.role.toUpperCase()}
        </Tag>
      </div>
      <Text type="secondary" style={{ fontSize: '11px' }}>
        Password: {user.password}
      </Text>
    </Card>
  )

  return (
    <Card 
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <Text strong style={{ fontSize: '14px' }}>Test Accounts</Text>
        </Space>
      }
      style={{ 
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '350px',
        zIndex: 1001,
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
      size="small"
    >
      <Paragraph style={{ fontSize: '12px', color: '#666', margin: '0 0 16px 0' }}>
        🚀 <strong>Ready to test!</strong> Use these accounts to explore different user roles and features.
      </Paragraph>

      <Collapse size="small" ghost defaultActiveKey={['students']}>
        <Panel 
          header={
            <Space>
              <span>👨‍🎓 Students</span>
              <Tag color="green" size="small">{testUsers.students.length}</Tag>
            </Space>
          } 
          key="students"
        >
          {testUsers.students.map(user => renderUserCard(user, 'students'))}
        </Panel>

        <Panel 
          header={
            <Space>
              <span>🏢 Businesses</span>
              <Tag color="blue" size="small">{testUsers.businesses.length}</Tag>
            </Space>
          } 
          key="businesses"
        >
          {testUsers.businesses.map(user => renderUserCard(user, 'businesses'))}
        </Panel>

        <Panel 
          header={
            <Space>
              <span>👑 Admins</span>
              <Tag color="red" size="small">{testUsers.admins.length}</Tag>
            </Space>
          } 
          key="admins"
        >
          {testUsers.admins.map(user => renderUserCard(user, 'admins'))}
        </Panel>
      </Collapse>

      <Divider style={{ margin: '16px 0 12px 0' }} />
      
      <div style={{ textAlign: 'center' }}>
        <Text style={{ fontSize: '11px', color: '#999' }}>
          💡 Click &quot;Login&quot; to sign in instantly or &quot;Copy&quot; for manual testing
        </Text>
      </div>
    </Card>
  )
}

export default TestUserLogin