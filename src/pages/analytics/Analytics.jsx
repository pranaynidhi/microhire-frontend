import { useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Select, 
  DatePicker, 
  Space,
  Progress,
  Table,
  Tag,
  Button
} from 'antd'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { 
  EyeOutlined,
  UserOutlined,
  FolderOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UpCircleOutlined,
  DownCircleOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContextUtils'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const Analytics = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ])
  const [selectedMetric, setSelectedMetric] = useState('applications')
  const { user } = useAuth()

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', user?.role, dateRange],
    queryFn: () => {
      if (user?.role === 'business') {
        return analyticsAPI.getCompanyAnalytics().then(res => res.data)
      } else if (user?.role === 'admin') {
        return analyticsAPI.getPlatformAnalytics().then(res => res.data)
      } else {
        return analyticsAPI.getUserAnalytics().then(res => res.data)
      }
    }
  })

  if (isLoading) return <LoadingSpinner />

  const analytics = analyticsData || {}

  // Sample data for charts
  const applicationTrends = [
    { month: 'Jan', applications: 45, interviews: 12, offers: 3 },
    { month: 'Feb', applications: 52, interviews: 15, offers: 5 },
    { month: 'Mar', applications: 38, interviews: 10, offers: 2 },
    { month: 'Apr', applications: 61, interviews: 18, offers: 7 },
    { month: 'May', applications: 55, interviews: 16, offers: 6 },
    { month: 'Jun', applications: 67, interviews: 20, offers: 8 }
  ]

  const skillsData = [
    { name: 'JavaScript', value: 35, color: '#DC143C' },
    { name: 'React', value: 25, color: '#1E3A8A' },
    { name: 'Python', value: 20, color: '#059669' },
    { name: 'Node.js', value: 15, color: '#D97706' },
    { name: 'Others', value: 5, color: '#6B7280' }
  ]

  const performanceData = [
    { metric: 'Profile Views', current: 234, previous: 189, change: 23.8 },
    { metric: 'Application Rate', current: 12.5, previous: 10.2, change: 22.5 },
    { metric: 'Response Rate', current: 68, previous: 72, change: -5.6 },
    { metric: 'Success Rate', current: 15.2, previous: 13.8, change: 10.1 }
  ]

  const topInternships = [
    { title: 'Frontend Developer', applications: 45, views: 234, conversion: 19.2 },
    { title: 'Data Analyst', applications: 38, views: 198, conversion: 19.2 },
    { title: 'UI/UX Designer', applications: 32, views: 167, conversion: 19.2 },
    { title: 'Backend Developer', applications: 28, views: 145, conversion: 19.3 },
    { title: 'Marketing Intern', applications: 25, views: 134, conversion: 18.7 }
  ]

  const renderStudentAnalytics = () => (
    <>
      {/* Key Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Applications Sent"
              value={analytics.totalApplications || 23}
              prefix={<FileTextOutlined style={{ color: '#DC143C' }} />}
              suffix={
                <span style={{ fontSize: '14px', color: '#059669' }}>
                  <UpCircleOutlined /> +12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Profile Views"
              value={analytics.profileViews || 156}
              prefix={<EyeOutlined style={{ color: '#1E3A8A' }} />}
              suffix={
                <span style={{ fontSize: '14px', color: '#059669' }}>
                  <UpCircleOutlined /> +8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Interview Invites"
              value={analytics.interviews || 8}
              prefix={<UserOutlined style={{ color: '#059669' }} />}
              suffix={
                <span style={{ fontSize: '14px', color: '#DC143C' }}>
                  <DownCircleOutlined /> -3%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={analytics.successRate || 15.2}
              prefix={<FolderOutlined style={{ color: '#D97706' }} />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Application Trends */}
        <Col xs={24} lg={16}>
          <Card title="Application Activity">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#DC143C" 
                  strokeWidth={2}
                  name="Applications"
                />
                <Line 
                  type="monotone" 
                  dataKey="interviews" 
                  stroke="#1E3A8A" 
                  strokeWidth={2}
                  name="Interviews"
                />
                <Line 
                  type="monotone" 
                  dataKey="offers" 
                  stroke="#059669" 
                  strokeWidth={2}
                  name="Offers"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Skills Distribution */}
        <Col xs={24} lg={8}>
          <Card title="Skills in Demand">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={skillsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {skillsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="Performance Metrics">
            <Row gutter={[16, 16]}>
              {performanceData.map((item, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <div style={{ 
                    padding: '16px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <Text strong style={{ fontSize: '24px', color: '#DC143C' }}>
                      {item.current}{item.metric.includes('Rate') ? '%' : ''}
                    </Text>
                    <br />
                    <Text>{item.metric}</Text>
                    <br />
                    <Text 
                      style={{ 
                        fontSize: '12px', 
                        color: item.change > 0 ? '#059669' : '#DC143C' 
                      }}
                    >
                      {item.change > 0 ? '+' : ''}{item.change}% from last month
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  )

  const renderBusinessAnalytics = () => (
    <>
      {/* Key Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Internships"
              value={analytics.activeInternships || 12}
              prefix={<FolderOutlined style={{ color: '#DC143C' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={analytics.totalApplications || 234}
              prefix={<FileTextOutlined style={{ color: '#1E3A8A' }} />}
              suffix={
                <span style={{ fontSize: '14px', color: '#059669' }}>
                  <UpCircleOutlined /> +15%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hired Interns"
              value={analytics.hiredInterns || 18}
              prefix={<UserOutlined style={{ color: '#059669' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg. Time to Hire"
              value={analytics.avgTimeToHire || 12}
              prefix={<CalendarOutlined style={{ color: '#D97706' }} />}
              suffix="days"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Application Trends */}
        <Col xs={24} lg={16}>
          <Card 
            title="Application Trends"
            extra={
              <Space>
                <Select defaultValue="applications" style={{ width: 120 }}>
                  <Option value="applications">Applications</Option>
                  <Option value="views">Views</Option>
                  <Option value="hires">Hires</Option>
                </Select>
                <RangePicker 
                  value={dateRange}
                  onChange={setDateRange}
                  size="small"
                />
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#DC143C" 
                  fill="#DC143C"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Top Performing Internships */}
        <Col xs={24} lg={8}>
          <Card title="Top Internships">
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {topInternships.map((internship, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '12px 0', 
                    borderBottom: index < topInternships.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ fontSize: '14px' }}>
                        {internship.title}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {internship.applications} applications
                      </Text>
                    </div>
                    <Tag color="blue">{internship.conversion}%</Tag>
                  </div>
                  <Progress 
                    percent={internship.conversion} 
                    size="small" 
                    showInfo={false}
                    strokeColor="#DC143C"
                    style={{ marginTop: '4px' }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detailed Table */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title="Internship Performance"
            extra={
              <Button icon={<DownloadOutlined />}>
                Export Report
              </Button>
            }
          >
            <Table
              dataSource={topInternships}
              columns={[
                {
                  title: 'Internship Title',
                  dataIndex: 'title',
                  key: 'title',
                },
                {
                  title: 'Views',
                  dataIndex: 'views',
                  key: 'views',
                  sorter: (a, b) => a.views - b.views,
                },
                {
                  title: 'Applications',
                  dataIndex: 'applications',
                  key: 'applications',
                  sorter: (a, b) => a.applications - b.applications,
                },
                {
                  title: 'Conversion Rate',
                  dataIndex: 'conversion',
                  key: 'conversion',
                  render: (rate) => `${rate}%`,
                  sorter: (a, b) => a.conversion - b.conversion,
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: () => <Tag color="green">Active</Tag>,
                },
              ]}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </>
  )

  const renderAdminAnalytics = () => (
    <>
      {/* Platform Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={analytics.totalUsers || 1234}
              prefix={<UserOutlined style={{ color: '#DC143C' }} />}
              suffix={
                <span style={{ fontSize: '14px', color: '#059669' }}>
                  <UpCircleOutlined /> +5%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Internships"
              value={analytics.activeInternships || 89}
              prefix={<FolderOutlined style={{ color: '#1E3A8A' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={analytics.totalApplications || 2567}
              prefix={<FileTextOutlined style={{ color: '#059669' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={analytics.successRate || 18.5}
              prefix={<UpCircleOutlined style={{ color: '#D97706' }} />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Platform Growth */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Platform Growth">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#DC143C" name="Applications" />
                <Bar dataKey="interviews" fill="#1E3A8A" name="Interviews" />
                <Bar dataKey="offers" fill="#059669" name="Offers" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="User Distribution">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '32px', color: '#DC143C', fontWeight: 'bold' }}>
                1,234
              </div>
              <Text type="secondary">Total Active Users</Text>
            </div>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text>Students</Text>
                  <Text strong>856 (69%)</Text>
                </div>
                <Progress percent={69} strokeColor="#DC143C" />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text>Businesses</Text>
                  <Text strong>378 (31%)</Text>
                </div>
                <Progress percent={31} strokeColor="#1E3A8A" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Analytics Dashboard</Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          {user?.role === 'student' ? 
            'Track your application performance and career progress' :
            user?.role === 'business' ?
            'Monitor your internship postings and hiring metrics' :
            'Overview of platform performance and user engagement'
          }
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Space>
              <Text>Date Range:</Text>
              <RangePicker 
                value={dateRange}
                onChange={setDateRange}
              />
            </Space>
          </Col>
          <Col xs={24} sm={8}>
            <Space>
              <Text>Metric:</Text>
              <Select 
                value={selectedMetric}
                onChange={setSelectedMetric}
                style={{ width: 150 }}
              >
                <Option value="applications">Applications</Option>
                <Option value="views">Profile Views</Option>
                <Option value="success">Success Rate</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={8}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              style={{ float: 'right' }}
            >
              Export Report
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Role-based Analytics */}
      {user?.role === 'student' && renderStudentAnalytics()}
      {user?.role === 'business' && renderBusinessAnalytics()}
      {user?.role === 'admin' && renderAdminAnalytics()}
    </div>
  )
}

export default Analytics