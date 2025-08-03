import React from 'react'
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Alert,
  Result
} from 'antd'
import { 
  ExclamationCircleOutlined,
  ReloadOutlined,
  HomeOutlined,
  BugOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      errorInfo
    })

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo, this.state.errorId)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state
    
    // Create error report
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }

    // Log to console for development
    console.log('Error Report:', errorReport)

    // In production, you would send this to your error reporting service
    // Example: sendErrorReport(errorReport)
    
    // For now, just show a message
    alert('Error report generated. Check console for details.')
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state

      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5'
        }}>
          <Card style={{ width: '100%', maxWidth: 600 }}>
            <Result
              status="error"
              icon={<ExclamationCircleOutlined />}
              title="Something went wrong"
              subTitle="We're sorry, but something unexpected happened. Our team has been notified."
              extra={[
                <Space key="actions">
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={this.handleReload}
                  >
                    Reload Page
                  </Button>
                  <Button 
                    icon={<HomeOutlined />}
                    onClick={this.handleGoHome}
                  >
                    Go Home
                  </Button>
                  <Button 
                    icon={<BugOutlined />}
                    onClick={this.handleReportError}
                  >
                    Report Error
                  </Button>
                </Space>
              ]}
            />

            <div style={{ marginTop: 24 }}>
              <Alert
                message="Error Details"
                description={
                  <div>
                    <Paragraph>
                      <Text strong>Error ID:</Text> {errorId}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Message:</Text> {error?.message}
                    </Paragraph>
                    {process.env.NODE_ENV === 'development' && (
                      <>
                        <Paragraph>
                          <Text strong>Stack:</Text>
                        </Paragraph>
                        <pre style={{ 
                          backgroundColor: '#f6f8fa', 
                          padding: 12, 
                          borderRadius: 4,
                          fontSize: 12,
                          overflow: 'auto',
                          maxHeight: 200
                        }}>
                          {error?.stack}
                        </pre>
                        {errorInfo?.componentStack && (
                          <>
                            <Paragraph>
                              <Text strong>Component Stack:</Text>
                            </Paragraph>
                            <pre style={{ 
                              backgroundColor: '#f6f8fa', 
                              padding: 12, 
                              borderRadius: 4,
                              fontSize: 12,
                              overflow: 'auto',
                              maxHeight: 200
                            }}>
                              {errorInfo.componentStack}
                            </pre>
                          </>
                        )}
                      </>
                    )}
                  </div>
                }
                type="info"
                showIcon
              />
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Text type="secondary">
                If this problem persists, please contact our support team with the Error ID above.
              </Text>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 