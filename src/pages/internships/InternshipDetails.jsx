import { useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Tag, 
  Space, 
  Divider, 
  Badge,
  Descriptions,
  Alert,
  Modal,
  Form,
  message
} from 'antd'
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  DollarOutlined, 
  TeamOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { internshipAPI, applicationAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContextUtils'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const InternshipDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [form] = Form.useForm()
  const [applicationModalVisible, setApplicationModalVisible] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)

  const { data: internship, isLoading, error } = useQuery({
    queryKey: ['internship', id],
    queryFn: () => internshipAPI.getInternshipById(id),
    enabled: !!id
  })

  const { data: applications } = useQuery({
    queryKey: ['applications', id],
    queryFn: () => applicationAPI.getApplicationsByInternshipId(id)
  })

  const applyMutation = useMutation({
    mutationFn: applicationAPI.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries(['applications'])
      message.success('Application submitted successfully!')
      navigate('/applications')
    },
    onError: () => {
      message.error('Failed to submit application. Please try again.')
    }
  })

  const saveMutation = useMutation({
    mutationFn: () => internshipAPI.saveInternship(id),
    onSuccess: () => {
      setSaved(true)
      message.success('Internship saved to your list!')
    }
  })

  const handleSave = () => {
    saveMutation.mutate()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    message.success('Link copied to clipboard!')
  }

  const handleViewApplication = (application) => {
    setSelectedApplication(application)
    setApplicationModalVisible(true)
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <Alert
        message="Error"
        description="Failed to load internship details. Please try again."
        type="error"
        showIcon
      />
    )
  }

  if (!internship?.data?.internship) {
    return (
      <Alert
        message="Not Found"
        description="The internship you're looking for doesn't exist."
        type="warning"
        showIcon
      />
    )
  }

  const internshipData = internship.data.internship

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: '24px' }}>
              <Title level={2}>{internshipData.title}</Title>
              <Text strong style={{ color: '#DC143C', fontSize: '18px' }}>
                {internshipData.companyName}
              </Text>
            </div>

            <Space wrap style={{ marginBottom: '24px' }}>
              <Tag color="blue">{internshipData.type}</Tag>
              <Tag color="green">{internshipData.location}</Tag>
              <Tag color="orange">{internshipData.duration} months</Tag>
              <Tag color="purple">NPR {internshipData.stipend?.toLocaleString()}/month</Tag>
            </Space>

            <Descriptions column={1} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="Company">
                {internshipData.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                <Space>
                  <EnvironmentOutlined />
                  {internshipData.location}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={internshipData.type === 'full-time' ? 'blue' : 'green'}>
                  {internshipData.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {internshipData.duration} months
              </Descriptions.Item>
              <Descriptions.Item label="Stipend">
                <Space>
                  <DollarOutlined />
                  NPR {internshipData.stipend?.toLocaleString()}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Deadline">
                <Space>
                  <CalendarOutlined />
                  {dayjs(internshipData.deadline).format('MMM DD, YYYY')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Posted">
                {dayjs(internshipData.createdAt).fromNow()}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Title level={4}>About the Role</Title>
              <Text>{internshipData.description}</Text>
            </div>

            <Divider />

            <div>
              <Title level={4}>Requirements</Title>
              <Text>{internshipData.requirements}</Text>
            </div>

            <Divider />

            <div>
              <Title level={4}>Responsibilities</Title>
              <Text>{internshipData.responsibilities}</Text>
            </div>

            <Divider />

            <div>
              <Title level={4}>Required Skills</Title>
              <Space wrap>
                {internshipData.skills?.map((skill) => (
                  <Tag key={skill} color="blue">{skill}</Tag>
                ))}
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={4}>Benefits</Title>
              <ul>
                {internshipData.benefits?.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            {user?.role === 'business' && user?.id === internshipData.companyId && (
              <>
                <Divider />
                <div>
                  <Title level={4}>Applications ({applications?.data?.applications?.length || 0})</Title>
                  {applications?.data?.applications?.length > 0 ? (
                    <div>
                      {applications.data.applications.map((application) => (
                        <Card key={application.id} size="small" style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text strong>{application.studentName}</Text>
                              <br />
                              <Text type="secondary">Applied {dayjs(application.appliedAt).fromNow()}</Text>
                            </div>
                            <Space>
                              <Badge 
                                status={
                                  application.status === 'accepted' ? 'success' :
                                  application.status === 'rejected' ? 'error' :
                                  application.status === 'interviewing' ? 'processing' : 'default'
                                }
                                text={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              />
                              <Button 
                                type="link" 
                                onClick={() => handleViewApplication(application)}
                              >
                                View Details
                              </Button>
                            </Space>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert
                      message="No applications yet"
                      description="Students haven&apos;t applied to this internship yet."
                      type="info"
                      showIcon
                    />
                  )}
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              {user?.role === 'student' && (
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  onClick={() => form.submit()}
                  loading={applyMutation.isLoading}
                >
                  Apply Now
                </Button>
              )}
              
              <Button 
                icon={saved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                onClick={handleSave}
                loading={saveMutation.isLoading}
                block
              >
                {saved ? 'Saved' : 'Save for Later'}
              </Button>
              
              <Button 
                icon={<TeamOutlined />}
                onClick={handleShare}
                block
              >
                Share
              </Button>
            </Space>

            <Divider />

            <div>
              <Title level={5}>Quick Facts</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Posted</Text>
                  <br />
                  <Text strong>{dayjs(internshipData.createdAt).format('MMM DD, YYYY')}</Text>
                </div>
                <div>
                  <Text type="secondary">Deadline</Text>
                  <br />
                  <Text strong>{dayjs(internshipData.deadline).format('MMM DD, YYYY')}</Text>
                </div>
                <div>
                  <Text type="secondary">Applications</Text>
                  <br />
                  <Text strong>{internshipData.applicationsCount || 0}</Text>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Application Modal */}
      <Modal
        title="Application Details"
        open={applicationModalVisible}
        onCancel={() => setApplicationModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedApplication && (
          <div>
            <Descriptions column={1}>
              <Descriptions.Item label="Student Name">
                {selectedApplication.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedApplication.studentEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Applied Date">
                {dayjs(selectedApplication.appliedAt).format('MMM DD, YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge 
                  status={
                    selectedApplication.status === 'accepted' ? 'success' :
                    selectedApplication.status === 'rejected' ? 'error' :
                    selectedApplication.status === 'interviewing' ? 'processing' : 'default'
                  }
                  text={selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                />
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Title level={5}>Cover Letter</Title>
              <Text>{selectedApplication.coverLetter}</Text>
            </div>

            {selectedApplication.resume && (
              <>
                <Divider />
                <div>
                  <Title level={5}>Resume</Title>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(selectedApplication.resume, '_blank')}
                  >
                    Download Resume
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InternshipDetails