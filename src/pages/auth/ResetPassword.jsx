import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Alert,
  Result,
  Divider,
  Progress
} from 'antd'
import { 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { Password } = Input

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  
  const [resetStatus, setResetStatus] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token) {
      setResetStatus('no-token')
    }
  }, [token])

  const validatePassword = (password) => {
    let strength = 0
    
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9!@#$%^&*]/.test(password)) strength += 25
    
    setPasswordStrength(strength)
    return strength === 100
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return '#ff4d4f'
    if (passwordStrength < 75) return '#faad14'
    return '#52c41a'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Weak'
    if (passwordStrength < 75) return 'Fair'
    return 'Strong'
  }

  const handleSubmit = async (values) => {
    if (!token) {
      toast.error('Invalid reset link')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await authAPI.resetPassword(token, values.password)
      
      if (response.data.success) {
        setResetStatus('success')
        toast.success('Password reset successfully!')
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(response.data.message || 'Password reset failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e) => {
    const password = e.target.value
    validatePassword(password)
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  const handleGoToForgotPassword = () => {
    navigate('/forgot-password')
  }

  const renderPasswordRequirements = () => (
    <div style={{ marginBottom: 16 }}>
      <Text strong>Password Requirements:</Text>
      <ul style={{ marginTop: 8, marginBottom: 0 }}>
        <li>At least 8 characters long</li>
        <li>Contains at least one lowercase letter</li>
        <li>Contains at least one uppercase letter</li>
        <li>Contains at least one number or special character</li>
      </ul>
    </div>
  )

  const renderPasswordStrength = () => (
    <div style={{ marginBottom: 16 }}>
      <Text>Password Strength: </Text>
      <Text strong style={{ color: getPasswordStrengthColor() }}>
        {getPasswordStrengthText()}
      </Text>
      <Progress 
        percent={passwordStrength} 
        strokeColor={getPasswordStrengthColor()}
        size="small"
        style={{ marginTop: 4 }}
      />
    </div>
  )

  const renderResetForm = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>
          <LockOutlined /> Reset Your Password
        </Title>
        <Text type="secondary">
          Enter your new password below
        </Text>
      </div>

      {error && (
        <Alert
          message="Reset Error"
          description={error}
          type="error"
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter your new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
              message: 'Password must contain uppercase, lowercase, number, and special character'
            }
          ]}
        >
          <Password
            prefix={<LockOutlined />}
            placeholder="Enter your new password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {passwordStrength > 0 && renderPasswordStrength()}

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match'))
              }
            })
          ]}
        >
          <Password
            prefix={<LockOutlined />}
            placeholder="Confirm your new password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        {renderPasswordRequirements()}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Space>
          <Button type="link" onClick={handleGoToLogin}>
            Back to Login
          </Button>
          <Button type="link" onClick={handleGoToForgotPassword}>
            Request New Reset Link
          </Button>
        </Space>
      </div>
    </div>
  )

  const renderSuccessState = () => (
    <Result
      status="success"
      icon={<CheckCircleOutlined />}
      title="Password Reset Successfully!"
      subTitle="Your password has been updated. You can now log in with your new password."
      extra={[
        <Button type="primary" key="login" onClick={handleGoToLogin}>
          Go to Login
        </Button>
      ]}
    />
  )

  const renderNoTokenState = () => (
    <Result
      status="error"
      icon={<ExclamationCircleOutlined />}
      title="Invalid Reset Link"
      subTitle="The password reset link is invalid or has expired. Please request a new one."
      extra={[
        <Button type="primary" key="forgot" onClick={handleGoToForgotPassword}>
          Request New Reset Link
        </Button>,
        <Button key="login" onClick={handleGoToLogin}>
          Go to Login
        </Button>
      ]}
    />
  )

  const renderContent = () => {
    switch (resetStatus) {
      case 'success':
        return renderSuccessState()
      case 'no-token':
        return renderNoTokenState()
      default:
        return renderResetForm()
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: 500 }}>
        {renderContent()}
      </Card>
    </div>
  )
}

export default ResetPassword 