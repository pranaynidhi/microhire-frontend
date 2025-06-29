import { useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Divider,
  Space,
  Alert,
  Modal,
  Tabs,
  List,
  Badge
} from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  BellOutlined, 
  SecurityScanOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  GlobalOutlined,
  MobileOutlined,
  MailOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TabPane } = Tabs

const Settings = () => {
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  // Fetch user settings
  const { data: settingsData } = useQuery({
    queryKey: ['user-settings'],
    queryFn: userAPI.getSettings
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: userAPI.updateSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully!')
      queryClient.invalidateQueries(['user-settings'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!')
      passwordForm.resetFields()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  })

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: userAPI.deleteAccount,
    onSuccess: () => {
      toast.success('Account deleted successfully')
      logout()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    }
  })

  const handleSettingsUpdate = (values) => {
    updateSettingsMutation.mutate(values)
  }

  const handlePasswordChange = (values) => {
    changePasswordMutation.mutate(values)
  }

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate()
    setDeleteModalVisible(false)
  }

  const settings = settingsData?.data?.settings || {}

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Settings</Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          Manage your account preferences and security settings
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="account">
            <TabPane tab="Account" key="account">
              <Card title="Account Information">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    fullName: user?.fullName,
                    email: user?.email,
                    phone: user?.phone,
                    location: user?.location,
                    ...settings
                  }}
                  onFinish={handleSettingsUpdate}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Full Name"
                        name="fullName"
                        rules={[{ required: true, message: 'Please enter your full name' }]}
                      >
                        <Input prefix={<UserOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Phone" name="phone">
                        <Input prefix={<MobileOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Location" name="location">
                        <Select placeholder="Select location">
                          <Option value="kathmandu">Kathmandu</Option>
                          <Option value="pokhara">Pokhara</Option>
                          <Option value="chitwan">Chitwan</Option>
                          <Option value="butwal">Butwal</Option>
                          <Option value="dharan">Dharan</Option>
                          <Option value="biratnagar">Biratnagar</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={updateSettingsMutation.isLoading}
                    >
                      Update Account
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>

            <TabPane tab="Security" key="security">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Change Password */}
                <Card title="Change Password">
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                  >
                    <Form.Item
                      label="Current Password"
                      name="currentPassword"
                      rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                      label="New Password"
                      name="newPassword"
                      rules={[
                        { required: true, message: 'Please enter a new password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                      label="Confirm New Password"
                      name="confirmPassword"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve()
                            }
                            return Promise.reject(new Error('Passwords do not match'))
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={changePasswordMutation.isLoading}
                      >
                        Change Password
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>

                {/* Two-Factor Authentication */}
                <Card title="Two-Factor Authentication">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Enable 2FA</Text>
                        <br />
                        <Text type="secondary">Add an extra layer of security to your account</Text>
                      </div>
                      <Switch 
                        checked={settings.twoFactorEnabled} 
                        onChange={(checked) => {
                          updateSettingsMutation.mutate({ twoFactorEnabled: checked })
                        }}
                      />
                    </div>
                    
                    {settings.twoFactorEnabled && (
                      <Alert
                        message="Two-factor authentication is enabled"
                        description="Your account is protected with 2FA. You&apos;ll need to enter a code from your authenticator app when signing in."
                        type="success"
                        showIcon
                      />
                    )}
                  </Space>
                </Card>

                {/* Login Sessions */}
                <Card title="Active Sessions">
                  <List
                    dataSource={[
                      {
                        id: 1,
                        device: 'Chrome on Windows',
                        location: 'Kathmandu, Nepal',
                        lastActive: '2 minutes ago',
                        current: true
                      },
                      {
                        id: 2,
                        device: 'Safari on iPhone',
                        location: 'Pokhara, Nepal',
                        lastActive: '2 hours ago',
                        current: false
                      }
                    ]}
                    renderItem={(session) => (
                      <List.Item
                        actions={[
                          !session.current && (
                            <Button type="text" danger size="small">
                              Revoke
                            </Button>
                          )
                        ].filter(Boolean)}
                      >
                        <List.Item.Meta
                          avatar={<SecurityScanOutlined style={{ fontSize: '20px', color: '#DC143C' }} />}
                          title={
                            <Space>
                              <Text>{session.device}</Text>
                              {session.current && <Badge status="success" text="Current" />}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size="small">
                              <Text type="secondary">{session.location}</Text>
                              <Text type="secondary">Last active: {session.lastActive}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            </TabPane>

            <TabPane tab="Notifications" key="notifications">
              <Card title="Notification Preferences">
                <Form
                  layout="vertical"
                  initialValues={settings}
                  onValuesChange={(changedValues) => {
                    updateSettingsMutation.mutate(changedValues)
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                      <Title level={5}>Email Notifications</Title>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text>New internship opportunities</Text>
                            <br />
                            <Text type="secondary">Get notified about new internships matching your profile</Text>
                          </div>
                          <Form.Item name="emailNewInternships" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch />
                          </Form.Item>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text>Application updates</Text>
                            <br />
                            <Text type="secondary">Updates on your application status</Text>
                          </div>
                          <Form.Item name="emailApplicationUpdates" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch />
                          </Form.Item>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text>Messages</Text>
                            <br />
                            <Text type="secondary">New messages from companies or students</Text>
                          </div>
                          <Form.Item name="emailMessages" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch />
                          </Form.Item>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text>Marketing emails</Text>
                            <br />
                            <Text type="secondary">Tips, news, and platform updates</Text>
                          </div>
                          <Form.Item name="emailMarketing" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch />
                          </Form.Item>
                        </div>
                      </Space>
                    </div>

                    <Divider />

                    <div>
                      <Title level={5}>Push Notifications</Title>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text>Real-time messages</Text>
                            <br />
                            <Text type="secondary">Instant notifications for new messages</Text>
                          </div>
                          <Form.Item name="pushMessages" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch />
                          </Form.Item>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text>Application deadlines</Text>
                            <br />
                            <Text type="secondary">Reminders about upcoming deadlines</Text>
                          </div>
                          <Form.Item name="pushDeadlines" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch />
                          </Form.Item>
                        </div>
                      </Space>
                    </div>
                  </Space>
                </Form>
              </Card>
            </TabPane>

            <TabPane tab="Privacy" key="privacy">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card title="Profile Visibility">
                  <Form
                    layout="vertical"
                    initialValues={settings}
                    onValuesChange={(changedValues) => {
                      updateSettingsMutation.mutate(changedValues)
                    }}
                  >
                    <Form.Item label="Who can see your profile?" name="profileVisibility">
                      <Select>
                        <Option value="public">Everyone</Option>
                        <Option value="companies">Companies only</Option>
                        <Option value="private">Private</Option>
                      </Select>
                    </Form.Item>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <Text>Show online status</Text>
                        <br />
                        <Text type="secondary">Let others see when you&apos;re online</Text>
                      </div>
                      <Form.Item name="showOnlineStatus" valuePropName="checked" style={{ margin: 0 }}>
                        <Switch />
                      </Form.Item>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text>Allow search engines to index your profile</Text>
                        <br />
                        <Text type="secondary">Make your profile discoverable on search engines</Text>
                      </div>
                      <Form.Item name="searchEngineIndexing" valuePropName="checked" style={{ margin: 0 }}>
                        <Switch />
                      </Form.Item>
                    </div>
                  </Form>
                </Card>

                <Card title="Data & Privacy">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button icon={<GlobalOutlined />} block>
                      Download Your Data
                    </Button>
                    <Button icon={<EyeInvisibleOutlined />} block>
                      Privacy Policy
                    </Button>
                    <Button icon={<SecurityScanOutlined />} block>
                      Terms of Service
                    </Button>
                  </Space>
                </Card>

                <Card title="Danger Zone">
                  <Alert
                    message="Delete Account"
                    description="Once you delete your account, there is no going back. Please be certain."
                    type="error"
                    style={{ marginBottom: '16px' }}
                  />
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => setDeleteModalVisible(true)}
                  >
                    Delete Account
                  </Button>
                </Card>
              </Space>
            </TabPane>
          </Tabs>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<UserOutlined />}>
                Edit Profile
              </Button>
              <Button block icon={<BellOutlined />}>
                Notification Center
              </Button>
              <Button block icon={<SecurityScanOutlined />}>
                Security Checkup
              </Button>
              <Button block icon={<GlobalOutlined />}>
                Language Settings
              </Button>
            </Space>
          </Card>

          <Card title="Account Status" style={{ marginTop: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Email Verified</Text>
                <Badge status="success" text="Verified" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Phone Verified</Text>
                <Badge status="warning" text="Pending" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Profile Complete</Text>
                <Badge status="success" text="85%" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>2FA Enabled</Text>
                <Badge status={settings.twoFactorEnabled ? "success" : "error"} text={settings.twoFactorEnabled ? "Yes" : "No"} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Delete Account Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            Delete Account
          </Space>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="delete" 
            danger 
            loading={deleteAccountMutation.isLoading}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="This action cannot be undone"
            description="Deleting your account will permanently remove all your data, including applications, messages, and profile information."
            type="error"
            showIcon
          />
          <Paragraph>
            Are you sure you want to delete your account? This will:
          </Paragraph>
          <ul>
            <li>Permanently delete your profile and all associated data</li>
            <li>Remove all your applications and messages</li>
            <li>Cancel any active internships (for businesses)</li>
            <li>Revoke access to all certificates</li>
          </ul>
          <Text strong>Type &quot;DELETE&quot; to confirm:</Text>
          <Input placeholder="Type DELETE to confirm" />
        </Space>
      </Modal>
    </div>
  )
}

export default Settings