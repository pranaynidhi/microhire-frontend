import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Space, Divider, Radio } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContextUtils'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const result = await register(values)
      if (result.success) {
        navigate('/dashboard')
      }
    } catch {
      // Error is handled by the register function
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
              Join MicroHire
            </Title>
            <Text style={{ color: '#666' }}>
              Start your journey in Nepal&apos;s growing tech ecosystem
            </Text>
          </div>

          <Form
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="I am a"
              name="role"
              rules={[{ required: true, message: 'Please select your role' }]}
              initialValue="student"
            >
              <Radio.Group>
                <Radio value="student">Student</Radio>
                <Radio value="business">Business</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                { required: true, message: 'Please enter your full name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

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

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Create a strong password"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
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
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text style={{ color: '#999', fontSize: '12px' }}>
              OR CONTINUE WITH
            </Text>
          </Divider>

          <Space style={{ width: '100%' }} direction="vertical" size="middle">
            <Button
              icon={<GoogleOutlined />}
              block
              size="large"
              style={{ 
                borderRadius: '8px',
                height: '48px',
                border: '1px solid #e5e7eb'
              }}
            >
              Continue with Google
            </Button>

            <Button
              icon={<GithubOutlined />}
              block
              size="large"
              style={{ 
                borderRadius: '8px',
                height: '48px',
                border: '1px solid #e5e7eb'
              }}
            >
              Continue with GitHub
            </Button>
          </Space>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Text style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
              Already have an account?{' '}
              <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
                Sign in here
              </Button>
            </Text>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default RegisterPage