import { useState } from 'react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { forgotPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const result = await forgotPassword(values.email)
      if (result.success) {
        setEmailSent(true)
      }
    } catch {
      // Error is handled by the forgotPassword function
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Logo and Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '24px'
            }}>
              MH
            </div>
            <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
              Forgot Password
            </Title>
            <Text style={{ color: '#666' }}>
              Enter your email to receive a password reset link
            </Text>
          </div>

          {emailSent ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircleOutlined 
                style={{ 
                  fontSize: '64px', 
                  color: '#52c41a', 
                  marginBottom: '24px' 
                }} 
              />
              <Title level={3} style={{ marginBottom: '16px' }}>
                Check Your Email
              </Title>
              <Text style={{ color: '#666', fontSize: '16px' }}>
                We&apos;ve sent a password reset link to your email address.
              </Text>
            </div>
          ) : (
            <Form
              name="forgot-password"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email address"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{ 
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  Send Reset Link
                </Button>
              </Form.Item>
            </Form>
          )}

          <Text style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
            Remember your password?{' '}
            <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
              Sign in here
            </Button>
          </Text>
        </Card>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage