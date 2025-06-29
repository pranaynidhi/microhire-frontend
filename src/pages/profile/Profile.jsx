import { useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Button, 
  Typography, 
  Form, 
  Input, 
  Select, 
  Upload, 
  Space, 
  Tag, 
  Divider,
  Tabs,
  List,
  Progress
} from 'antd'
import { 
  EditOutlined, 
  SaveOutlined, 
  UploadOutlined, 
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  FolderOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI, certificateAPI } from '../../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const Profile = () => {
  const [editMode, setEditMode] = useState(false)
  const [form] = Form.useForm()
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()

  // Fetch user profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userAPI.getProfile
  })

  // Fetch user certificates
  const { data: certificates } = useQuery({
    queryKey: ['user-certificates'],
    queryFn: certificateAPI.getCertificates,
    enabled: user?.role === 'student'
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (response) => {
      toast.success('Profile updated successfully!')
      updateUser(response.data.user)
      setEditMode(false)
      queryClient.invalidateQueries(['user-profile'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: userAPI.uploadAvatar,
    onSuccess: (response) => {
      toast.success('Avatar updated successfully!')
      updateUser({ avatar: response.data.avatarUrl })
      queryClient.invalidateQueries(['user-profile'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    }
  })

  const profile = profileData?.data?.user || user

  const handleSave = async (values) => {
    updateProfileMutation.mutate(values)
  }

  const handleAvatarUpload = ({ file }) => {
    const formData = new FormData()
    formData.append('avatar', file)
    uploadAvatarMutation.mutate(formData)
  }

  const renderStudentProfile = () => (
    <Row gutter={[24, 24]}>
      {/* Basic Info */}
      <Col xs={24} lg={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Upload
              showUploadList={false}
              customRequest={handleAvatarUpload}
              accept="image/*"
            >
              <Avatar 
                size={120} 
                src={profile?.avatar}
                style={{ 
                  backgroundColor: '#DC143C',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                {profile?.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Upload>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {profile?.fullName}
              </Title>
              <Text type="secondary">{profile?.email}</Text>
              <br />
              <Tag color="blue" style={{ marginTop: '8px' }}>
                {profile?.role?.toUpperCase()}
              </Tag>
            </div>
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            {profile?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneOutlined style={{ color: '#666' }} />
                <Text>{profile.phone}</Text>
              </div>
            )}
            {profile?.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EnvironmentOutlined style={{ color: '#666' }} />
                <Text>{profile.location}</Text>
              </div>
            )}
            {profile?.dateOfBirth && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarOutlined style={{ color: '#666' }} />
                <Text>{dayjs(profile.dateOfBirth).format('MMM DD, YYYY')}</Text>
              </div>
            )}
          </Space>

          <Divider />

          <div>
            <Text strong>Profile Completion</Text>
            <Progress 
              percent={85} 
              size="small" 
              style={{ marginTop: '8px' }}
              strokeColor="#DC143C"
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Complete your profile to get better opportunities
            </Text>
          </div>
        </Card>

        {/* Skills */}
        <Card title="Skills" style={{ marginTop: '24px' }}>
          <Space wrap>
            {profile?.skills?.map((skill, index) => (
              <Tag key={index} color="geekblue">
                {skill}
              </Tag>
            )) || <Text type="secondary">No skills added</Text>}
          </Space>
        </Card>
      </Col>

      {/* Main Content */}
      <Col xs={24} lg={16}>
        <Tabs defaultActiveKey="about">
          <TabPane tab="About" key="about">
            <Card 
              title="Personal Information"
              extra={
                <Button 
                  icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                  onClick={() => editMode ? form.submit() : setEditMode(true)}
                  loading={updateProfileMutation.isLoading}
                >
                  {editMode ? 'Save' : 'Edit'}
                </Button>
              }
            >
              {editMode ? (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={profile}
                  onFinish={handleSave}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Full Name" name="fullName">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Phone" name="phone">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Location" name="location">
                        <Select placeholder="Select location">
                          <Option value="kathmandu">Kathmandu</Option>
                          <Option value="pokhara">Pokhara</Option>
                          <Option value="chitwan">Chitwan</Option>
                          <Option value="butwal">Butwal</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Date of Birth" name="dateOfBirth">
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label="Bio" name="bio">
                        <TextArea rows={4} placeholder="Tell us about yourself..." />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Bio</Text>
                    <Paragraph style={{ marginTop: '8px' }}>
                      {profile?.bio || 'No bio added yet.'}
                    </Paragraph>
                  </div>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Text strong>Phone:</Text>
                      <br />
                      <Text>{profile?.phone || 'Not provided'}</Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Location:</Text>
                      <br />
                      <Text>{profile?.location || 'Not provided'}</Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Date of Birth:</Text>
                      <br />
                      <Text>
                        {profile?.dateOfBirth ? 
                          dayjs(profile.dateOfBirth).format('MMM DD, YYYY') : 
                          'Not provided'
                        }
                      </Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Member Since:</Text>
                      <br />
                      <Text>{dayjs(profile?.createdAt).format('MMM DD, YYYY')}</Text>
                    </Col>
                  </Row>
                </Space>
              )}
            </Card>
          </TabPane>

          <TabPane tab="Education" key="education">
            <Card 
              title="Education"
              extra={<Button icon={<PlusOutlined />}>Add Education</Button>}
            >
              <List
                dataSource={profile?.education || []}
                locale={{ emptyText: 'No education records added' }}
                renderItem={(edu) => (
                  <List.Item
                    actions={[
                      <Button key="edit" type="text" icon={<EditOutlined />} />,
                      <Button key="delete" type="text" danger icon={<DeleteOutlined />} />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<BookOutlined style={{ fontSize: '24px', color: '#DC143C' }} />}
                      title={edu.degree}
                      description={
                        <Space direction="vertical" size="small">
                          <Text>{edu.institution}</Text>
                          <Text type="secondary">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </Text>
                          {edu.grade && <Text>Grade: {edu.grade}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>

          <TabPane tab="Documents" key="documents">
            <Card title="Documents">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card size="small" title="Resume">
                    {profile?.resume ? (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>{profile.resume.name}</Text>
                        <Space>
                          <Button icon={<EyeOutlined />} size="small">View</Button>
                          <Button icon={<DownloadOutlined />} size="small">Download</Button>
                          <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
                        </Space>
                      </Space>
                    ) : (
                      <Upload>
                        <Button icon={<UploadOutlined />}>Upload Resume</Button>
                      </Upload>
                    )}
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card size="small" title="Portfolio">
                    {profile?.portfolio ? (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>{profile.portfolio.name}</Text>
                        <Space>
                          <Button icon={<EyeOutlined />} size="small">View</Button>
                          <Button icon={<DownloadOutlined />} size="small">Download</Button>
                          <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
                        </Space>
                      </Space>
                    ) : (
                      <Upload>
                        <Button icon={<UploadOutlined />}>Upload Portfolio</Button>
                      </Upload>
                    )}
                  </Card>
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane tab="Certificates" key="certificates">
            <Card title="Certificates">
              <Row gutter={[16, 16]}>
                {certificates?.data?.certificates?.map((cert, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card
                      size="small"
                      cover={
                        <div style={{
                          height: '120px',
                          background: 'linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <TrophyOutlined style={{ fontSize: '48px' }} />
                        </div>
                      }
                      actions={[
                        <Button key="view" type="text" icon={<EyeOutlined />}>View</Button>,
                        <Button key="download" type="text" icon={<DownloadOutlined />}>Download</Button>
                      ]}
                    >
                      <Card.Meta
                        title={cert.internshipTitle}
                        description={
                          <Space direction="vertical" size="small">
                            <Text>{cert.companyName}</Text>
                            <Text type="secondary">
                              {dayjs(cert.issueDate).format('MMM DD, YYYY')}
                            </Text>
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                )) || (
                  <Col xs={24}>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <TrophyOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                      <Text type="secondary">No certificates earned yet</Text>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  )

  const renderBusinessProfile = () => (
    <Row gutter={[24, 24]}>
      {/* Company Info */}
      <Col xs={24} lg={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Upload
              showUploadList={false}
              customRequest={handleAvatarUpload}
              accept="image/*"
            >
              <Avatar 
                size={120} 
                src={profile?.companyLogo}
                style={{ 
                  backgroundColor: '#DC143C',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                {profile?.companyName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Upload>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {profile?.companyName || profile?.fullName}
              </Title>
              <Text type="secondary">{profile?.email}</Text>
              <br />
              <Tag color="green" style={{ marginTop: '8px' }}>
                BUSINESS
              </Tag>
            </div>
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            {profile?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneOutlined style={{ color: '#666' }} />
                <Text>{profile.phone}</Text>
              </div>
            )}
            {profile?.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EnvironmentOutlined style={{ color: '#666' }} />
                <Text>{profile.location}</Text>
              </div>
            )}
            {profile?.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOutlined style={{ color: '#666' }} />
                <Text>{profile.website}</Text>
              </div>
            )}
          </Space>

          <Divider />

          <div>
            <Text strong>Company Rating</Text>
            <div style={{ marginTop: '8px' }}>
              <Text style={{ fontSize: '24px', color: '#DC143C' }}>4.5</Text>
              <Text type="secondary"> / 5.0</Text>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Based on 23 reviews
            </Text>
          </div>
        </Card>
      </Col>

      {/* Main Content */}
      <Col xs={24} lg={16}>
        <Tabs defaultActiveKey="company">
          <TabPane tab="Company Info" key="company">
            <Card 
              title="Company Information"
              extra={
                <Button 
                  icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                  onClick={() => editMode ? form.submit() : setEditMode(true)}
                  loading={updateProfileMutation.isLoading}
                >
                  {editMode ? 'Save' : 'Edit'}
                </Button>
              }
            >
              {editMode ? (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={profile}
                  onFinish={handleSave}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Company Name" name="companyName">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Industry" name="industry">
                        <Select placeholder="Select industry">
                          <Option value="technology">Technology</Option>
                          <Option value="finance">Finance</Option>
                          <Option value="healthcare">Healthcare</Option>
                          <Option value="education">Education</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Company Size" name="companySize">
                        <Select placeholder="Select size">
                          <Option value="1-10">1-10 employees</Option>
                          <Option value="11-50">11-50 employees</Option>
                          <Option value="51-200">51-200 employees</Option>
                          <Option value="200+">200+ employees</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Website" name="website">
                        <Input placeholder="https://company.com" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label="Company Description" name="companyDescription">
                        <TextArea rows={4} placeholder="Describe your company..." />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>About Company</Text>
                    <Paragraph style={{ marginTop: '8px' }}>
                      {profile?.companyDescription || 'No company description added yet.'}
                    </Paragraph>
                  </div>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Text strong>Industry:</Text>
                      <br />
                      <Text>{profile?.industry || 'Not specified'}</Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Company Size:</Text>
                      <br />
                      <Text>{profile?.companySize || 'Not specified'}</Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Website:</Text>
                      <br />
                      <Text>{profile?.website || 'Not provided'}</Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Founded:</Text>
                      <br />
                      <Text>{profile?.founded || 'Not specified'}</Text>
                    </Col>
                  </Row>
                </Space>
              )}
            </Card>
          </TabPane>

          <TabPane tab="Statistics" key="stats">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '32px', color: '#DC143C', fontWeight: 'bold' }}>
                      12
                    </Text>
                    <br />
                    <Text type="secondary">Active Internships</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '32px', color: '#1E3A8A', fontWeight: 'bold' }}>
                      156
                    </Text>
                    <br />
                    <Text type="secondary">Total Applications</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '32px', color: '#059669', fontWeight: 'bold' }}>
                      23
                    </Text>
                    <br />
                    <Text type="secondary">Hired Interns</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  )

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Text>Loading profile...</Text>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Profile</Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          Manage your profile information and settings
        </Text>
      </div>

      {user?.role === 'student' ? renderStudentProfile() : renderBusinessProfile()}
    </div>
  )
}

export default Profile