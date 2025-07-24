import { useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Select, 
  DatePicker, 
  Space, 
  Divider,
  InputNumber,
  Alert,
  Steps,
  Row,
  Col,
  Tag,
  message
} from 'antd'
import { 
  PlusOutlined, 
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { internshipAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContextUtils'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { Step } = Steps

const CreateInternship = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState([])
  const [previewData] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const stepFieldNames = [
    ['title', 'category', 'description'], // Step 0
    ['detailedDescription', 'requirements', 'responsibilities'], // Step 1
    ['location', 'type', 'duration', 'stipend', 'deadline'], // Step 2
    [] // Step 3 (review)
  ];

  const createInternshipMutation = useMutation({
    mutationFn: internshipAPI.createInternship,
    onSuccess: () => {
      queryClient.invalidateQueries(['internships'])
      message.success('Internship posted successfully!')
      navigate('/internships')
    },
    onError: () => {
      message.error('Failed to post internship. Please try again.')
    }
  })

  const steps = [
    {
      title: 'Basic Info',
      description: 'Title and company details'
    },
    {
      title: 'Description',
      description: 'Role details and requirements'
    },
    {
      title: 'Details',
      description: 'Location, duration, and compensation'
    },
    {
      title: 'Review',
      description: 'Preview and publish'
    }
  ]

  const handleAddSkill = () => {
    const skill = form.getFieldValue('newSkill')
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
      form.setFieldValue('newSkill', '')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleNext = async () => {
    try {
      await form.validateFields(stepFieldNames[currentStep]);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // Validation failed, do not proceed
    }
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      setLoading(true)
      const values = form.getFieldsValue(true)
      
      const internshipData = {
        title: values.title,
        description: values.detailedDescription || values.description,
        requirements: values.requirements,
        location: values.location,
        duration: values.duration,
        deadline: values.deadline?.toISOString(),
        userId: user.id,
        type: values.type,
        category: values.category,
        stipend: values.stipend || 0,
        maxApplicants: 50,
        status: 'active'
      }

      await createInternshipMutation.mutateAsync(internshipData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Post New Internship</Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          Create an opportunity for talented students across Nepal
        </Text>
      </div>

      <Card>
        <Steps current={currentStep} style={{ marginBottom: '32px' }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={index === 3 ? <EyeOutlined /> : undefined}
            />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          size="large"
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Internship Title"
                    name="title"
                    rules={[
                      { required: true, message: 'Please enter the internship title' },
                      { min: 10, message: 'Title must be at least 10 characters' }
                    ]}
                  >
                    <Input 
                      placeholder="e.g., Frontend Developer Intern"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select placeholder="Select category" size="large">
                      <Option value="technology">Technology</Option>
                      <Option value="marketing">Marketing</Option>
                      <Option value="finance">Finance</Option>
                      <Option value="design">Design</Option>
                      <Option value="content">Content</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Brief Description"
                    name="description"
                    rules={[
                      { required: true, message: 'Please enter a description' },
                      { min: 50, message: 'Description must be at least 50 characters' }
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Provide a brief overview of the internship opportunity..."
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24}>
                  <Form.Item
                    label="Detailed Description"
                    name="detailedDescription"
                    rules={[
                      { required: true, message: 'Please enter a detailed description' },
                      { min: 100, message: 'Description must be at least 100 characters' }
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Provide a comprehensive description of the role, responsibilities, and what the intern will learn..."
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Requirements"
                    name="requirements"
                    rules={[
                      { required: true, message: 'Please enter the requirements' },
                      { min: 50, message: 'Requirements must be at least 50 characters' }
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="List the skills, qualifications, and experience required..."
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Responsibilities"
                    name="responsibilities"
                    rules={[
                      { required: true, message: 'Please enter the responsibilities' },
                      { min: 50, message: 'Responsibilities must be at least 50 characters' }
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Describe the key responsibilities and tasks the intern will handle..."
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Required Skills">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Input
                          placeholder="Add a skill"
                          value={form.getFieldValue('newSkill')}
                          onChange={(e) => form.setFieldValue('newSkill', e.target.value)}
                          onPressEnter={handleAddSkill}
                          style={{ width: '200px' }}
                        />
                        <Button 
                          type="dashed" 
                          icon={<PlusOutlined />}
                          onClick={handleAddSkill}
                        >
                          Add Skill
                        </Button>
                      </Space>
                      <div>
                        {skills.map((skill, index) => (
                          <Tag
                            key={index}
                            closable
                            onClose={() => handleRemoveSkill(skill)}
                            style={{ marginBottom: '8px' }}
                          >
                            {skill}
                          </Tag>
                        ))}
                      </div>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Location"
                    name="location"
                    rules={[{ required: true, message: 'Please enter the location' }]}
                  >
                    <Select placeholder="Select location" size="large">
                      <Option value="kathmandu">Kathmandu</Option>
                      <Option value="pokhara">Pokhara</Option>
                      <Option value="lalitpur">Lalitpur</Option>
                      <Option value="bhaktapur">Bhaktapur</Option>
                      <Option value="remote">Remote</Option>
                      <Option value="hybrid">Hybrid</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Type"
                    name="type"
                    rules={[{ required: true, message: 'Please select the type' }]}
                  >
                    <Select placeholder="Select type" size="large">
                      <Option value="remote">Remote</Option>
                      <Option value="onsite">On-site</Option>
                      <Option value="hybrid">Hybrid</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Duration"
                    name="duration"
                    rules={[{ required: true, message: 'Please enter the duration' }]}
                  >
                    <Input
                      placeholder="e.g., 3 months, 6 months"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Monthly Stipend (NPR)"
                    name="stipend"
                    rules={[{ required: true, message: 'Please enter the stipend' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      size="large"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item
                      label="Application Deadline"
                      name="deadline"
                      rules={[{ required: true, message: 'Please select the deadline' }]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        size="large"
                        disabledDate={(current) => current && current < dayjs().endOf('day')}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Start Date (Optional)"
                      name="startDate"
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        size="large"
                        disabledDate={(current) => current && current < dayjs().endOf('day')}
                      />
                    </Form.Item>

                    <Form.Item
                      label="End Date (Optional)"
                      name="endDate"
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        size="large"
                        disabledDate={(current) => current && current < dayjs().endOf('day')}
                      />
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
            </div>

            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
              <Alert
                message="Review Your Internship Posting"
                description="Please review all details before publishing. You can edit the internship after posting."
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
              />

              {previewData && (
                <Card>
                  <div style={{ marginBottom: '24px' }}>
                    <Title level={3}>{previewData.title}</Title>
                    <Text strong style={{ color: '#DC143C', fontSize: '16px' }}>
                      {user.fullName}
                    </Text>
                  </div>

                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={16}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <Title level={5}>Description</Title>
                          <Paragraph>{previewData.description}</Paragraph>
                        </div>

                        <div>
                          <Title level={5}>Responsibilities</Title>
                          <Paragraph>{previewData.responsibilities}</Paragraph>
                        </div>

                        <div>
                          <Title level={5}>Requirements</Title>
                          <Paragraph>{previewData.requirements}</Paragraph>
                        </div>

                        <div>
                          <Title level={5}>Required Skills</Title>
                          <Space wrap>
                            {skills.map((skill, index) => (
                              <Tag key={index} color="blue">{skill}</Tag>
                            ))}
                          </Space>
                        </div>
                      </Space>
                    </Col>

                    <Col xs={24} md={8}>
                      <Card size="small" title="Internship Details">
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div>
                            <Text strong>Location:</Text>
                            <br />
                            <Text>{previewData.location}</Text>
                          </div>
                          <div>
                            <Text strong>Type:</Text>
                            <br />
                            <Text>{previewData.type}</Text>
                          </div>
                          <div>
                            <Text strong>Stipend:</Text>
                            <br />
                            <Text>NPR {previewData.stipend?.toLocaleString()}/month</Text>
                          </div>
                          <div>
                            <Text strong>Duration:</Text>
                            <br />
                            <Text>{previewData.duration}</Text>
                          </div>
                          <div>
                            <Text strong>Deadline:</Text>
                            <br />
                            <Text>{dayjs(previewData.deadline).format('MMM DD, YYYY')}</Text>
                          </div>
                          {previewData.startDate && (
                            <div>
                              <Text strong>Start Date:</Text>
                              <br />
                              <Text>{dayjs(previewData.startDate).format('MMM DD, YYYY')}</Text>
                            </div>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              )}
            </div>
          </motion.div>
        </Form>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
            size="large"
          >
            Previous
          </Button>

          <Space>
            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                size="large"
              >
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                icon={<CheckCircleOutlined />}
                size="large"
              >
                Publish Internship
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default CreateInternship