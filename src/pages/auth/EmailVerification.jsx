import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Alert, 
  Spin,
  Result,
  Divider
} from 'antd'
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  MailOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { authAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContextUtils'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography

const EmailVerification = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  
  const [verificationStatus, setVerificationStatus] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else if (user && !user.emailVerified) {
      setVerificationStatus('no-token')
    } else if (user && user.emailVerified) {
      setVerificationStatus('already-verified')
    }
  }, [token, user])

  const verifyEmail = async (verificationToken) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authAPI.verifyEmail(verificationToken)
      
      if (response.data.success) {
        setVerificationStatus('success')
        
        // Update user context if user is logged in
        if (user) {
          updateUser({ emailVerified: true })
        }
        
        toast.success('Email verified successfully!')
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setVerificationStatus('error')
        setError(response.data.message || 'Verification failed')
      }
    } catch (err) {
      setVerificationStatus('error')
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    
    try {
      const emailToVerify = email || user?.email
      await authAPI.resendVerificationEmail(emailToVerify)
      
      toast.success('Verification email sent! Please check your inbox.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification email')
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  const renderPendingState = () => (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size="large" />
      <Title level={4} style={{ marginTop: 16 }}>
        Verifying your email...
      </Title>
      <Text type="secondary">
        Please wait while we verify your email address.
      </Text>
    </div>
  )

  const renderSuccessState = () => (
    <Result
      status="success"
      icon={<CheckCircleOutlined />}
      title="Email Verified Successfully!"
      subTitle="Your email address has been verified. You can now access all features of MicroHire."
      extra={[
        <Button type="primary" key="dashboard" onClick={handleGoToDashboard}>
          Go to Dashboard
        </Button>
      ]}
    />
  )

  const renderErrorState = () => (
    <Result
      status="error"
      icon={<ExclamationCircleOutlined />}
      title="Verification Failed"
      subTitle={error || "The verification link is invalid or has expired."}
      extra={[
        <Button key="resend" onClick={handleResendVerification} loading={resendLoading}>
          <MailOutlined /> Resend Verification Email
        </Button>,
        <Button key="login" onClick={handleGoToLogin}>
          Go to Login
        </Button>
      ]}
    />
  )

  const renderNoTokenState = () => (
    <Result
      status="info"
      icon={<MailOutlined />}
      title="Email Verification Required"
      subTitle="Please verify your email address to access all features."
      extra={[
        <Button type="primary" key="resend" onClick={handleResendVerification} loading={resendLoading}>
          <MailOutlined /> Resend Verification Email
        </Button>,
        <Button key="dashboard" onClick={handleGoToDashboard}>
          Go to Dashboard
        </Button>
      ]}
    />
  )

  const renderAlreadyVerifiedState = () => (
    <Result
      status="success"
      icon={<CheckCircleOutlined />}
      title="Email Already Verified"
      subTitle="Your email address is already verified."
      extra={[
        <Button type="primary" key="dashboard" onClick={handleGoToDashboard}>
          Go to Dashboard
        </Button>
      ]}
    />
  )

  const renderContent = () => {
    switch (verificationStatus) {
      case 'pending':
        return renderPendingState()
      case 'success':
        return renderSuccessState()
      case 'error':
        return renderErrorState()
      case 'no-token':
        return renderNoTokenState()
      case 'already-verified':
        return renderAlreadyVerifiedState()
      default:
        return renderPendingState()
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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>
            <MailOutlined /> Email Verification
          </Title>
          <Text type="secondary">
            Verify your email address to complete your registration
          </Text>
        </div>

        <Divider />

        {renderContent()}

        {/* Additional Information */}
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Title level={5}>Need Help?</Title>
          <Paragraph type="secondary">
            If you're having trouble verifying your email, please check your spam folder 
            or contact our support team.
          </Paragraph>
          
          <Space>
            <Button 
              type="link" 
              onClick={handleResendVerification}
              loading={resendLoading}
              icon={<ReloadOutlined />}
            >
              Resend Email
            </Button>
            <Button 
              type="link" 
              onClick={() => navigate('/contact')}
            >
              Contact Support
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default EmailVerification 