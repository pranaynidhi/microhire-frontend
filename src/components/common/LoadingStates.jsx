import React from 'react'
import { 
  Spin, 
  Skeleton, 
  Card, 
  Typography, 
  Space, 
  Progress,
  Row,
  Col
} from 'antd'
import { 
  LoadingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

// Loading spinner with custom text
export const LoadingSpinner = ({ 
  text = 'Loading...', 
  size = 'large',
  spinning = true 
}) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px 20px' 
  }}>
    <Spin 
      size={size} 
      spinning={spinning}
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
    />
    {text && (
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">{text}</Text>
      </div>
    )}
  </div>
)

// Skeleton loading for content
export const ContentSkeleton = ({ 
  rows = 3, 
  title = true,
  avatar = false,
  paragraph = true 
}) => (
  <Card>
    <Skeleton 
      active 
      title={title}
      avatar={avatar}
      paragraph={{ rows }}
    />
  </Card>
)

// Skeleton loading for list items
export const ListSkeleton = ({ 
  count = 5, 
  avatar = true,
  title = true,
  paragraph = { rows: 2 }
}) => (
  <div>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} style={{ marginBottom: 16 }}>
        <Skeleton 
          active 
          avatar={avatar}
          title={title}
          paragraph={paragraph}
        />
      </Card>
    ))}
  </div>
)

// Skeleton loading for table
export const TableSkeleton = ({ 
  columns = 5, 
  rows = 10 
}) => (
  <div>
    <Skeleton 
      active 
      paragraph={{ rows: 1 }}
      title={false}
      style={{ marginBottom: 16 }}
    />
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton 
        key={index}
        active 
        paragraph={{ rows: 1 }}
        title={false}
        style={{ marginBottom: 8 }}
      />
    ))}
  </div>
)

// Progress loading with steps
export const ProgressLoading = ({ 
  current = 0, 
  total = 3,
  steps = [],
  title = 'Processing...'
}) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <Title level={4}>{title}</Title>
    <Progress 
      percent={Math.round((current / total) * 100)} 
      status="active"
      style={{ marginBottom: 24 }}
    />
    {steps.length > 0 && (
      <Space direction="vertical" style={{ width: '100%' }}>
        {steps.map((step, index) => (
          <div 
            key={index}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px 0'
            }}
          >
            <Text>{step}</Text>
            {index < current ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : index === current ? (
              <LoadingOutlined spin />
            ) : (
              <div style={{ width: 16, height: 16 }} />
            )}
          </div>
        ))}
      </Space>
    )}
  </div>
)

// Loading overlay for modals or forms
export const LoadingOverlay = ({ 
  visible = false, 
  text = 'Saving...',
  children 
}) => (
  <div style={{ position: 'relative' }}>
    {children}
    {visible && (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>{text}</Text>
          </div>
        </div>
      </div>
    )}
  </div>
)

// Error state with retry option
export const ErrorState = ({ 
  error = 'Something went wrong',
  onRetry,
  showRetry = true
}) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px 20px' 
  }}>
    <ExclamationCircleOutlined 
      style={{ 
        fontSize: 48, 
        color: '#ff4d4f',
        marginBottom: 16 
      }} 
    />
    <Title level={4} style={{ color: '#ff4d4f' }}>
      Error
    </Title>
    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
      {error}
    </Text>
    {showRetry && onRetry && (
      <button 
        onClick={onRetry}
        style={{
          background: 'none',
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          padding: '8px 16px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <ReloadOutlined />
        Try Again
      </button>
    )}
  </div>
)

// Empty state with action
export const EmptyState = ({ 
  title = 'No data found',
  description = 'There are no items to display',
  action,
  icon = null
}) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px 20px' 
  }}>
    {icon && (
      <div style={{ marginBottom: 16 }}>
        {icon}
      </div>
    )}
    <Title level={4}>{title}</Title>
    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
      {description}
    </Text>
    {action && action}
  </div>
)

// Dashboard loading skeleton
export const DashboardSkeleton = () => (
  <div>
    <Row gutter={[16, 16]}>
      <Col xs={24} md={6}>
        <Card>
          <Skeleton active paragraph={{ rows: 1 }} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card>
          <Skeleton active paragraph={{ rows: 1 }} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card>
          <Skeleton active paragraph={{ rows: 1 }} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card>
          <Skeleton active paragraph={{ rows: 1 }} />
        </Card>
      </Col>
    </Row>
    
    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
      <Col xs={24} md={16}>
        <Card>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </Col>
    </Row>
  </div>
)

// Form loading skeleton
export const FormSkeleton = ({ fields = 5 }) => (
  <Card>
    <Skeleton active paragraph={{ rows: 1 }} style={{ marginBottom: 24 }} />
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} style={{ marginBottom: 16 }}>
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    ))}
    <div style={{ marginTop: 24 }}>
      <Skeleton.Button active size="large" />
    </div>
  </Card>
)

export default {
  LoadingSpinner,
  ContentSkeleton,
  ListSkeleton,
  TableSkeleton,
  ProgressLoading,
  LoadingOverlay,
  ErrorState,
  EmptyState,
  DashboardSkeleton,
  FormSkeleton
} 