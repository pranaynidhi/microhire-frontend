import { useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Button, 
  Typography, 
  Space, 
  Select,
  Input,
  Avatar,
  Empty,
  Descriptions,
  Timeline
} from 'antd'
import { 
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { applicationAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import { 
  EyeOutlined, 
  MessageOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { Modal, Tooltip } from 'antd'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Title, Text } = Typography
const { Option } = Select

const Applications = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: null
  })
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', filters],
    queryFn: () =>
      applicationAPI.getMyApplications().then(res => ({
        ...res.data,
        applications: res.data.applications.map(app => ({
          ...app,
          internshipTitle: app.internship?.title || 'Unknown Internship',
          company: app.internship?.company || null,
        })),
      })),
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateRange: null
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange'
      case 'reviewing': return 'blue'
      case 'interviewing': return 'purple'
      case 'accepted': return 'green'
      case 'rejected': return 'red'
      case 'withdrawn': return 'gray'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />
      case 'reviewing': return <EyeOutlined />
      case 'interviewing': return <ExclamationCircleOutlined />
      case 'accepted': return <CheckCircleOutlined />
      case 'rejected': return <CloseCircleOutlined />
      case 'withdrawn': return <CloseCircleOutlined />
      default: return <ClockCircleOutlined />
    }
  }

  const handleViewDetails = (application) => {
    setSelectedApplication(application)
    setDetailsModalVisible(true)
  }

  const handleMessage = (application) => {
    navigate('/messages', { 
      state: { 
        recipientId: user?.role === 'student' ? application.companyId : application.studentId 
      } 
    })
  }

  const filteredApplications = applications?.applications || []

  const columns = [
    {
      title: 'Internship',
      dataIndex: 'internshipTitle',
      key: 'internshipTitle',
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user?.role === 'student' ? (record.company?.fullName || 'Unknown Company') : record.studentName}
          </Text>
        </div>
      ),
    },
    ...(user?.role === 'business' ? [{
      title: 'Applicant',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" style={{ backgroundColor: '#DC143C' }}>
            {name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.studentEmail}
            </Text>
          </div>
        </div>
      ),
    }] : []),
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={getStatusColor(status)} 
          icon={getStatusIcon(status)}
          style={{ textTransform: 'capitalize' }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date) => (
        <div>
          <Text>{dayjs(date).format('MMM DD, YYYY')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(date).fromNow()}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Message">
            <Button 
              type="text" 
              icon={<MessageOutlined />}
              onClick={() => handleMessage(record)}
            />
          </Tooltip>
          {user?.role === 'student' && record.status === 'pending' && (
            <Button 
              type="text" 
              danger
              size="small"
              onClick={() => {
                Modal.confirm({
                  title: 'Withdraw Application',
                  content: 'Are you sure you want to withdraw this application?',
                  onOk: () => {
                    // Handle withdrawal
                  }
                })
              }}
            >
              Withdraw
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const getApplicationStats = () => {
    const stats = {
      total: filteredApplications.length,
      pending: filteredApplications.filter(app => app.status === 'pending').length,
      reviewing: filteredApplications.filter(app => app.status === 'reviewing').length,
      interviewing: filteredApplications.filter(app => app.status === 'interviewing').length,
      accepted: filteredApplications.filter(app => app.status === 'accepted').length,
      rejected: filteredApplications.filter(app => app.status === 'rejected').length,
    }
    return stats
  }

  const stats = getApplicationStats()

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>
          {user?.role === 'student' ? 'My Applications' : 'Manage Applications'}
        </Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          {user?.role === 'student' 
            ? 'Track your internship applications and their progress'
            : 'Review and manage applications for your internships'
          }
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC143C' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
              {stats.pending}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Pending</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {stats.reviewing}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Reviewing</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
              {stats.interviewing}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Interviewing</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {stats.accepted}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Accepted</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
              {stats.rejected}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Rejected</div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Input.Search
              placeholder="Search applications..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="reviewing">Reviewing</Option>
              <Option value="interviewing">Interviewing</Option>
              <Option value="accepted">Accepted</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="withdrawn">Withdrawn</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button 
              icon={<FilterOutlined />}
              onClick={clearFilters}
              disabled={!filters.search && !filters.status}
            >
              Clear
            </Button>
          </Col>
          <Col xs={24} md={4}>
            <Text type="secondary">
              Showing {filteredApplications.length} of {applications?.applications.length} applications
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Applications Table */}
      <Card>
        {filteredApplications.length === 0 ? (
          <Empty 
            description={
              applications?.applications.length === 0 
                ? user?.role === 'student' 
                  ? "You haven't applied to any internships yet"
                  : "No applications received yet"
                : "No applications match your filters"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredApplications}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} applications`
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      {/* Application Details Modal */}
      <Modal
        title="Application Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          user?.role === 'business' && selectedApplication?.status === 'pending' && (
            <Button key="accept" type="primary" style={{ backgroundColor: '#52c41a' }}>
              Accept
            </Button>
          ),
          user?.role === 'business' && selectedApplication?.status === 'pending' && (
            <Button key="reject" danger>
              Reject
            </Button>
          ),
        ].filter(Boolean)}
        width={800}
      >
        {selectedApplication && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Internship" span={2}>
                <Text strong>{selectedApplication.internshipTitle}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Company">
                {selectedApplication.company?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedApplication.status)}>
                  {selectedApplication.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Applied Date">
                {dayjs(selectedApplication.appliedAt).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(selectedApplication.updatedAt).format('MMMM DD, YYYY')}
              </Descriptions.Item>
            </Descriptions>

            {selectedApplication.coverLetter && (
              <div style={{ marginTop: '24px' }}>
                <Title level={5}>Cover Letter</Title>
                <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                  <Text>{selectedApplication.coverLetter}</Text>
                </Card>
              </div>
            )}

            {selectedApplication.timeline && (
              <div style={{ marginTop: '24px' }}>
                <Title level={5}>Application Timeline</Title>
                <Timeline
                  items={[
                    {
                      color: 'blue',
                      children: `Application submitted - ${dayjs(selectedApplication.appliedAt).format('MMM DD, YYYY')}`
                    },
                    ...(selectedApplication.timeline || []).map(item => ({
                      color: item.type === 'accepted' ? 'green' : item.type === 'rejected' ? 'red' : 'blue',
                      children: `${item.action} - ${dayjs(item.date).format('MMM DD, YYYY')}`
                    })),
                  ]}
                />
              </div>
            )}

            {user?.role === 'business' && (
              <div style={{ marginTop: '24px' }}>
                <Title level={5}>Applicant Information</Title>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Name">
                    {selectedApplication.studentName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedApplication.studentEmail}
                  </Descriptions.Item>
                  <Descriptions.Item label="Skills">
                    <Space wrap>
                      {selectedApplication.studentSkills?.map((skill, index) => (
                        <Tag key={index} color="blue">{skill}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Applications