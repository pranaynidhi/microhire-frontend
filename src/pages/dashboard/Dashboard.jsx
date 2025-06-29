import { Row, Col, Card, Statistic, Typography, Button, List, Avatar, Badge, Space, Progress } from 'antd'
import { 
  FolderOutlined, 
  FileTextOutlined, 
  MessageOutlined, 
  TrophyOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI, internshipAPI, applicationAPI, messageAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Title, Text } = Typography

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsAPI.getDashboardStats
  })

  const { data: recentInternships, isLoading: internshipsLoading } = useQuery({
    queryKey: ['recent-internships'],
    queryFn: () => internshipAPI.getInternships({ limit: 5, sort: '-createdAt' })
  })

  const { data: recentApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: () => applicationAPI.getMyApplications(),
    enabled: user?.role === 'student'
  })

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['recent-conversations'],
    queryFn: messageAPI.getConversations
  })

  if (statsLoading) {
    return <LoadingSpinner />
  }

  const renderStudentDashboard = () => (
    <>
      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Applications Sent"
              value={stats?.data?.applications || 0}
              prefix={<FileTextOutlined style={{ color: '#DC143C' }} />}
              valueStyle={{ color: '#DC143C' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Interviews Scheduled"
              value={stats?.data?.interviews || 0}
              prefix={<ClockCircleOutlined style={{ color: '#1E3A8A' }} />}
              valueStyle={{ color: '#1E3A8A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Offers Received"
              value={stats?.data?.offers || 0}
              prefix={<CheckCircleOutlined style={{ color: '#059669' }} />}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Certificates Earned"
              value={stats?.data?.certificates || 0}
              prefix={<TrophyOutlined style={{ color: '#D97706' }} />}
              valueStyle={{ color: '#D97706' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: '32px' }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<FolderOutlined />}
            onClick={() => navigate('/internships')}
          >
            Browse Internships
          </Button>
          <Button 
            icon={<FileTextOutlined />}
            onClick={() => navigate('/applications')}
          >
            View Applications
          </Button>
          <Button 
            icon={<MessageOutlined />}
            onClick={() => navigate('/messages')}
          >
            Messages
          </Button>
          <Button 
            icon={<TrophyOutlined />}
            onClick={() => navigate('/certificates')}
          >
            Certificates
          </Button>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Recent Internships */}
        <Col xs={24} lg={12}>
          <Card 
            title="Latest Internships" 
            extra={<Button type="link" onClick={() => navigate('/internships')}>View All</Button>}
          >
            {internshipsLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <List
                dataSource={recentInternships?.data?.internships || []}
                renderItem={(internship) => (
                  <List.Item
                    key={internship.id}
                    actions={[
                      <Button 
                        key="view"
                        type="link" 
                        onClick={() => navigate(`/internships/${internship.id}`)}
                      >
                        View
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={internship.title}
                      description={
                        <Space direction="vertical" size="small">
                          <Text>{internship.companyName}</Text>
                          <Text type="secondary">{internship.location}</Text>
                          <Text type="secondary">
                            Deadline: {dayjs(internship.deadline).format('MMM DD, YYYY')}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Recent Applications */}
        <Col xs={24} lg={12}>
          <Card 
            title="My Applications" 
            extra={<Button type="link" onClick={() => navigate('/applications')}>View All</Button>}
          >
            {applicationsLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <List
                dataSource={recentApplications?.data?.applications?.slice(0, 5) || []}
                renderItem={(application) => (
                  <List.Item key={application.id}>
                    <List.Item.Meta
                      title={application.internshipTitle}
                      description={
                        <Space direction="vertical" size="small">
                          <Badge 
                            status={
                              application.status === 'accepted' ? 'success' :
                              application.status === 'rejected' ? 'error' :
                              application.status === 'interviewing' ? 'processing' : 'default'
                            }
                            text={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          />
                          <Text type="secondary">
                            Applied {dayjs(application.appliedAt).fromNow()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </>
  )

  const renderBusinessDashboard = () => (
    <>
      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Internships"
              value={stats?.data?.activeInternships || 0}
              prefix={<FolderOutlined style={{ color: '#DC143C' }} />}
              valueStyle={{ color: '#DC143C' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={stats?.data?.totalApplications || 0}
              prefix={<FileTextOutlined style={{ color: '#1E3A8A' }} />}
              valueStyle={{ color: '#1E3A8A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hired Interns"
              value={stats?.data?.hiredInterns || 0}
              prefix={<UserOutlined style={{ color: '#059669' }} />}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Profile Views"
              value={stats?.data?.profileViews || 0}
              prefix={<EyeOutlined style={{ color: '#D97706' }} />}
              valueStyle={{ color: '#D97706' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: '32px' }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/create-internship')}
          >
            Post New Internship
          </Button>
          <Button 
            icon={<FileTextOutlined />}
            onClick={() => navigate('/applications')}
          >
            Manage Applications
          </Button>
          <Button 
            icon={<MessageOutlined />}
            onClick={() => navigate('/messages')}
          >
            Messages
          </Button>
          <Button 
            icon={<TrophyOutlined />}
            onClick={() => navigate('/analytics')}
          >
            View Analytics
          </Button>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        {/* My Internships */}
        <Col xs={24} lg={12}>
          <Card 
            title="My Internships" 
            extra={<Button type="link" onClick={() => navigate('/internships')}>Manage All</Button>}
          >
            {internshipsLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <List
                dataSource={recentInternships?.data?.internships || []}
                renderItem={(internship) => (
                  <List.Item
                    key={internship.id}
                    actions={[
                      <Button 
                        key="view"
                        type="link" 
                        onClick={() => navigate(`/internships/${internship.id}`)}
                      >
                        View
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={internship.title}
                      description={
                        <Space direction="vertical" size="small">
                          <Text>{internship.applicationsCount || 0} applications</Text>
                          <Text type="secondary">
                            Posted {dayjs(internship.createdAt).fromNow()}
                          </Text>
                          <Progress
                            percent={Math.min(100, ((internship.applicationsCount || 0) / 10) * 100)}
                            size="small"
                            format={() => `${internship.applicationsCount || 0} apps`}
                          />
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Recent Conversations */}
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Messages" 
            extra={<Button type="link" onClick={() => navigate('/messages')}>View All</Button>}
          >
            {conversationsLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <List
                dataSource={conversations?.data?.conversations?.slice(0, 5) || []}
                renderItem={(conversation) => (
                  <List.Item
                    onClick={() => navigate('/messages')}
                    style={{ cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar>{conversation.otherUser?.fullName?.charAt(0)}</Avatar>}
                      title={conversation.otherUser?.fullName}
                      description={
                        <Space direction="vertical" size="small">
                          <Text ellipsis>{conversation.lastMessage?.content}</Text>
                          <Text type="secondary">
                            {dayjs(conversation.lastMessage?.createdAt).fromNow()}
                          </Text>
                        </Space>
                      }
                    />
                    {conversation.unreadCount > 0 && (
                      <Badge count={conversation.unreadCount} />
                    )}
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </>
  )

  const renderAdminDashboard = () => (
    <>
      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats?.data?.totalUsers || 0}
              prefix={<UserOutlined style={{ color: '#DC143C' }} />}
              valueStyle={{ color: '#DC143C' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Internships"
              value={stats?.data?.activeInternships || 0}
              prefix={<FolderOutlined style={{ color: '#1E3A8A' }} />}
              valueStyle={{ color: '#1E3A8A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={stats?.data?.totalApplications || 0}
              prefix={<FileTextOutlined style={{ color: '#059669' }} />}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Reports Pending"
              value={stats?.data?.pendingReports || 0}
              prefix={<ClockCircleOutlined style={{ color: '#D97706' }} />}
              valueStyle={{ color: '#D97706' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Admin Actions" style={{ marginBottom: '32px' }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<UserOutlined />}
            onClick={() => navigate('/admin/users')}
          >
            Manage Users
          </Button>
          <Button 
            icon={<FolderOutlined />}
            onClick={() => navigate('/admin/internships')}
          >
            Moderate Internships
          </Button>
          <Button 
            icon={<FileTextOutlined />}
            onClick={() => navigate('/admin/reports')}
          >
            Handle Reports
          </Button>
          <Button 
            icon={<TrophyOutlined />}
            onClick={() => navigate('/analytics')}
          >
            Platform Analytics
          </Button>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        {/* System Health */}
        <Col xs={24} lg={12}>
          <Card title="System Health">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Database Performance</Text>
                <Progress percent={92} status="active" />
              </div>
              <div>
                <Text>API Response Time</Text>
                <Progress percent={85} />
              </div>
              <div>
                <Text>User Satisfaction</Text>
                <Progress percent={96} strokeColor="#52c41a" />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card title="Recent Platform Activity">
            <List
              dataSource={[
                { action: 'New user registered', time: '2 minutes ago', type: 'user' },
                { action: 'Internship posted', time: '5 minutes ago', type: 'internship' },
                { action: 'Application submitted', time: '10 minutes ago', type: 'application' },
                { action: 'Report filed', time: '15 minutes ago', type: 'report' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.action}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  )

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>
          Welcome back, {user?.fullName?.split(' ')[0]}! 👋
        </Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          {user?.role === 'student' ? 
            "Ready to find your next opportunity?" :
            user?.role === 'business' ?
            "Let's connect with talented students today." :
            "Monitor and manage the MicroHire platform."
          }
        </Text>
      </div>

      {user?.role === 'student' && renderStudentDashboard()}
      {user?.role === 'business' && renderBusinessDashboard()}
      {user?.role === 'admin' && renderAdminDashboard()}
    </div>
  )
}

export default Dashboard