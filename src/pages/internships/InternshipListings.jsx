import { useState } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Select, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Avatar, 
  Pagination,
  Empty,
  Slider,
  Checkbox
} from 'antd'
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  FilterOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { internshipAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { searchAPI } from '../../services/api'
import { useEffect } from 'react'

dayjs.extend(relativeTime)

const { Title, Text } = Typography
const { Option } = Select

const InternshipListings = () => {
  const [searchParams, setSearchParams] = useState({
    search: '',
    location: '',
    type: '',
    category: '',
    stipendRange: [0, 50000],
    page: 1,
    limit: 12
  })
  const [savedInternships, setSavedInternships] = useState(new Set())
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['internships', searchParams],
    queryFn: () => internshipAPI.searchInternships(searchParams).then(res => res.data),
    onError: (error) => {
      console.error('Internship search error:', error);
    }
  })

  // Fetch recommendations when no search/filter is active
  useEffect(() => {
    if (!searchParams.search && !searchParams.location && !searchParams.type && !searchParams.category) {
      setRecommendationsLoading(true)
      setRecommendationsError(null)
      searchAPI.getRecommendations()
        .then(res => setRecommendations(res.data.data?.internships || []))
        .catch(() => setRecommendationsError('Failed to load recommendations'))
        .finally(() => setRecommendationsLoading(false))
    } else {
      setRecommendations([])
    }
  }, [searchParams.search, searchParams.location, searchParams.type, searchParams.category])

  // Fetch suggestions as user types
  const handleSearchInputChange = async (e) => {
    const value = e.target.value
    setSearchParams(prev => ({ ...prev, search: value }))
    if (value.length > 1) {
      setSuggestionsLoading(true)
      setShowSuggestions(true)
      try {
        const res = await searchAPI.getSearchSuggestions({ query: value })
        setSuggestions(res.data.data?.suggestions || [])
      } catch {
        setSuggestions([])
      } finally {
        setSuggestionsLoading(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchParams(prev => ({ ...prev, search: suggestion, page: 1 }))
    setShowSuggestions(false)
  }

  const handleSearch = (value) => {
    setSearchParams(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setSearchParams(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleSaveInternship = (internshipId) => {
    setSavedInternships(prev => {
      const newSet = new Set(prev)
      if (newSet.has(internshipId)) {
        newSet.delete(internshipId)
      } else {
        newSet.add(internshipId)
      }
      return newSet
    })
  }

  const clearFilters = () => {
    setSearchParams({
      search: '',
      location: '',
      type: '',
      category: '',
      stipendRange: [0, 50000],
      page: 1,
      limit: 12
    })
  }

  if (isLoading) return <LoadingSpinner />

  console.log('API Response:', data);
  console.log('Error:', error);

  const internships = data?.internships || []

  console.log('Internships:', internships);

  return (
    <div>
      {/* Recommendations */}
      {recommendationsLoading ? (
        <Card style={{ marginBottom: '24px' }}><LoadingSpinner size="small" /></Card>
      ) : recommendations.length > 0 && (
        <Card title="Recommended Internships" style={{ marginBottom: '24px' }}>
          <Row gutter={[24, 24]}>
            {recommendations.map((internship) => {
              const companyName = internship.company?.companyName || 'Unknown Company';
              const companyLogo = internship.company?.logoUrl;
              const skills = Array.isArray(internship.skills) ? internship.skills : [];
              return (
                <Col xs={24} lg={12} xl={8} key={internship.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      <Button
                        key="apply"
                        type="primary"
                        onClick={() => navigate(`/internships/${internship.id}`)}
                      >
                        View Details
                      </Button>
                    ]}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                      <Avatar 
                        size={48}
                        src={companyLogo}
                        style={{ backgroundColor: '#DC143C' }}
                      >
                        {companyName.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                          {internship.title}
                        </Title>
                        <Text strong style={{ color: '#DC143C' }}>
                          {companyName}
                        </Text>
                      </div>
                    </div>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <EnvironmentOutlined style={{ color: '#666' }} />
                        <Text type="secondary">{internship.location}</Text>
                        <Tag color="blue">{internship.type}</Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarOutlined style={{ color: '#666' }} />
                        <Text type="secondary">
                          NPR {Number(internship.stipend).toLocaleString()} /month
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Card>
      )}
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Find Your Perfect Internship</Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          Discover amazing opportunities across Nepal&apos;s growing ecosystem
        </Text>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px', position: 'relative' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8} style={{ position: 'relative' }}>
            <Input.Search
              placeholder="Search internships..."
              prefix={<SearchOutlined />}
              onSearch={handleSearch}
              value={searchParams.search}
              onChange={handleSearchInputChange}
              size="large"
              onFocus={() => searchParams.search && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              autoComplete="off"
            />
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 48,
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {suggestionsLoading ? (
                  <div style={{ padding: '12px', textAlign: 'center' }}>Loading...</div>
                ) : (
                  suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: idx !== suggestions.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                      onMouseDown={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </div>
                  ))
                )}
              </div>
            )}
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Location"
              style={{ width: '100%' }}
              value={searchParams.location}
              onChange={(value) => handleFilterChange('location', value)}
              allowClear
            >
              <Option value="kathmandu">Kathmandu</Option>
              <Option value="pokhara">Pokhara</Option>
              <Option value="chitwan">Chitwan</Option>
              <Option value="butwal">Butwal</Option>
              <Option value="dharan">Dharan</Option>
              <Option value="remote">Remote</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Type"
              style={{ width: '100%' }}
              value={searchParams.type}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear
            >
              <Option value="full-time">Full-time</Option>
              <Option value="part-time">Part-time</Option>
              <Option value="remote">Remote</Option>
              <Option value="hybrid">Hybrid</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Category"
              style={{ width: '100%' }}
              value={searchParams.category}
              onChange={(value) => handleFilterChange('category', value)}
              allowClear
            >
              <Option value="technology">Technology</Option>
              <Option value="marketing">Marketing</Option>
              <Option value="design">Design</Option>
              <Option value="business">Business</Option>
              <Option value="finance">Finance</Option>
              <Option value="education">Education</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={4}>
            <Space>
              <Button 
                icon={<FilterOutlined />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Advanced Filters */}
        <Row gutter={[16, 16]} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Col xs={24} md={8}>
            <div>
              <Text strong>Stipend Range (NPR)</Text>
              <Slider
                range
                min={0}
                max={100000}
                step={5000}
                value={searchParams.stipendRange}
                onChange={(value) => handleFilterChange('stipendRange', value)}
                tooltip={{
                  formatter: (value) => `NPR ${value.toLocaleString()}`
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                <span>NPR {searchParams.stipendRange[0].toLocaleString()}</span>
                <span>NPR {searchParams.stipendRange[1].toLocaleString()}</span>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Duration</Text>
            <div style={{ marginTop: '8px' }}>
              <Checkbox.Group
                options={[
                  { label: '1-3 months', value: '1-3' },
                  { label: '3-6 months', value: '3-6' },
                  { label: '6+ months', value: '6+' }
                ]}
              />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Skills Required</Text>
            <div style={{ marginTop: '8px' }}>
              <Checkbox.Group
                options={[
                  { label: 'JavaScript', value: 'javascript' },
                  { label: 'Python', value: 'python' },
                  { label: 'React', value: 'react' },
                  { label: 'Node.js', value: 'nodejs' }
                ]}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Results Summary */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text>
          Showing <strong>{internships.length}</strong> of <strong>{data?.total || 0}</strong> internships
        </Text>
        <Select defaultValue="newest" style={{ width: 120 }}>
          <Option value="newest">Newest</Option>
          <Option value="deadline">Deadline</Option>
          <Option value="stipend">Stipend</Option>
          <Option value="applications">Applications</Option>
        </Select>
      </div>

      {/* Internship Cards */}
      {internships.length === 0 ? (
        <Empty 
          description="No internships found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {internships.map((internship) => {
              const companyName = internship.company?.companyName || 'Unknown Company';
              const companyLogo = internship.company?.logoUrl;
              const skills = Array.isArray(internship.skills) ? internship.skills : [];
              return (
                <Col xs={24} lg={12} xl={8} key={internship.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      <Button
                        key="save"
                        type="text"
                        icon={savedInternships.has(internship.id) ? <HeartFilled /> : <HeartOutlined />}
                        onClick={() => handleSaveInternship(internship.id)}
                      >
                        {savedInternships.has(internship.id) ? 'Saved' : 'Save'}
                      </Button>,
                      <Button 
                        key="apply"
                        type="primary" 
                        onClick={() => navigate(`/internships/${internship.id}`)}
                      >
                        Apply Now
                      </Button>
                    ]}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                      <Avatar 
                        size={48}
                        src={companyLogo}
                        style={{ backgroundColor: '#DC143C' }}
                      >
                        {companyName.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                          {internship.title}
                        </Title>
                        <Text strong style={{ color: '#DC143C' }}>
                          {companyName}
                        </Text>
                      </div>
                    </div>

                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <EnvironmentOutlined style={{ color: '#666' }} />
                        <Text type="secondary">{internship.location}</Text>
                        <Tag color="blue">{internship.type}</Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarOutlined style={{ color: '#666' }} />
                        <Text type="secondary">
                          NPR {Number(internship.stipend).toLocaleString()} /month
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarOutlined style={{ color: '#666' }} />
                        <Text type="secondary">
                          Deadline: {dayjs(internship.deadline).format('MMM DD, YYYY')}
                        </Text>
                      </div>
                    </Space>

                    <div style={{ marginTop: '12px' }}>
                      <Text 
                        ellipsis={{ rows: 2 }} 
                        style={{ color: '#666', fontSize: '14px' }}
                      >
                        {internship.description}
                      </Text>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <Space wrap size="small">
                        {skills.slice(0, 3).map((skill, index) => (
                          <Tag key={index} color="geekblue" size="small">
                            {skill}
                          </Tag>
                        ))}
                        {skills.length > 3 && (
                          <Tag size="small">+{skills.length - 3} more</Tag>
                        )}
                      </Space>
                    </div>

                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Posted {dayjs(internship.createdAt).fromNow()}
                      </Text>
                      <Text style={{ fontSize: '12px', color: '#DC143C' }}>
                        {internship.applicationsCount || 0} applications
                      </Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Pagination */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Pagination
              current={searchParams.page}
              total={data?.pagination?.totalItems || 0}
              pageSize={searchParams.limit}
              onChange={(page) => handleFilterChange('page', page)}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} internships`
              }
            />
          </div>
        </>
      )}
    </div>
  )
}

export default InternshipListings