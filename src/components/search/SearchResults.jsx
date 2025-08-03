import { useState } from 'react'
import { 
  Card, 
  List, 
  Avatar, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Select, 
  Pagination,
  Empty,
  Skeleton,
  Tooltip,
  Badge,
  Divider
} from 'antd'
import { 
  EyeOutlined, 
  BookOutlined, 
  StarOutlined,
  LocationOutlined,
  DollarOutlined,
  CalendarOutlined,
  CompanyOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const SearchResults = ({ 
  results = [], 
  loading = false, 
  total = 0, 
  currentPage = 1, 
  pageSize = 10,
  onPageChange,
  onSortChange,
  searchType = 'internships'
}) => {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('relevance')

  const handleSortChange = (value) => {
    setSortBy(value)
    onSortChange?.(value)
  }

  const handlePageChange = (page) => {
    onPageChange?.(page)
  }

  const renderInternshipCard = (item) => (
    <Card 
      key={item.id} 
      hoverable 
      style={{ marginBottom: 16 }}
      actions={[
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => navigate(`/internships/${item.id}`)}
        >
          View Details
        </Button>,
        <Button 
          icon={<BookOutlined />}
          onClick={() => navigate(`/internships/${item.id}`)}
        >
          Apply Now
        </Button>
      ]}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ marginBottom: 8 }}>
            {item.title}
            {item.isNew && (
              <Badge 
                count="NEW" 
                style={{ marginLeft: 8, backgroundColor: '#52c41a' }} 
              />
            )}
          </Title>
          
          <Space style={{ marginBottom: 8 }}>
            <Tag color="blue">{item.company?.companyName}</Tag>
            <Tag color="green">{item.type}</Tag>
            <Tag color="orange">{item.category}</Tag>
          </Space>
          
          <Paragraph 
            ellipsis={{ rows: 2 }} 
            style={{ marginBottom: 12 }}
          >
            {item.description}
          </Paragraph>
          
          <Space wrap style={{ marginBottom: 12 }}>
            <Text>
              <LocationOutlined /> {item.location}
            </Text>
            <Text>
              <DollarOutlined /> ${item.stipend?.toLocaleString()}/month
            </Text>
            <Text>
              <CalendarOutlined /> {item.duration}
            </Text>
          </Space>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">
              Posted {dayjs(item.createdAt).fromNow()}
            </Text>
            <Text type="secondary">
              {item.applicationCount || 0} applications
            </Text>
          </div>
        </div>
        
        <div style={{ textAlign: 'right', marginLeft: 16 }}>
          <Avatar 
            size={64} 
            src={item.company?.logoUrl}
            icon={<CompanyOutlined />}
          />
        </div>
      </div>
    </Card>
  )

  const renderCompanyCard = (item) => (
    <Card 
      key={item.id} 
      hoverable 
      style={{ marginBottom: 16 }}
      actions={[
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => navigate(`/companies/${item.id}`)}
        >
          View Company
        </Button>,
        <Button 
          icon={<BookOutlined />}
          onClick={() => navigate(`/internships?company=${item.id}`)}
        >
          View Internships
        </Button>
      ]}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ marginBottom: 8 }}>
            {item.companyName}
          </Title>
          
          <Space style={{ marginBottom: 8 }}>
            <Tag color="blue">{item.industry}</Tag>
            <Tag color="green">{item.size}</Tag>
            <Tag color="orange">{item.location}</Tag>
          </Space>
          
          <Paragraph 
            ellipsis={{ rows: 2 }} 
            style={{ marginBottom: 12 }}
          >
            {item.description}
          </Paragraph>
          
          <Space wrap style={{ marginBottom: 12 }}>
            <Text>
              <LocationOutlined /> {item.location}
            </Text>
            <Text>
              <UserOutlined /> {item.employeeCount} employees
            </Text>
            <Text>
              <BookOutlined /> {item.internshipCount} internships
            </Text>
          </Space>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">
              Joined {dayjs(item.createdAt).fromNow()}
            </Text>
            <Text type="secondary">
              {item.rating ? `${item.rating}/5` : 'No ratings yet'}
            </Text>
          </div>
        </div>
        
        <div style={{ textAlign: 'right', marginLeft: 16 }}>
          <Avatar 
            size={64} 
            src={item.logoUrl}
            icon={<CompanyOutlined />}
          />
        </div>
      </div>
    </Card>
  )

  const renderStudentCard = (item) => (
    <Card 
      key={item.id} 
      hoverable 
      style={{ marginBottom: 16 }}
      actions={[
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => navigate(`/students/${item.id}`)}
        >
          View Profile
        </Button>,
        <Button 
          icon={<BookOutlined />}
          onClick={() => navigate(`/messages?user=${item.id}`)}
        >
          Send Message
        </Button>
      ]}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ marginBottom: 8 }}>
            {item.fullName}
          </Title>
          
          <Space style={{ marginBottom: 8 }}>
            <Tag color="blue">{item.education?.level}</Tag>
            <Tag color="green">{item.location}</Tag>
            <Tag color="orange">{item.experienceLevel}</Tag>
          </Space>
          
          <Paragraph 
            ellipsis={{ rows: 2 }} 
            style={{ marginBottom: 12 }}
          >
            {item.bio}
          </Paragraph>
          
          <Space wrap style={{ marginBottom: 12 }}>
            <Text>
              <LocationOutlined /> {item.location}
            </Text>
            <Text>
              <BookOutlined /> {item.skills?.length || 0} skills
            </Text>
            <Text>
              <StarOutlined /> {item.completedInternships || 0} internships
            </Text>
          </Space>
          
          <div style={{ marginBottom: 8 }}>
            <Text strong>Skills: </Text>
            <Space wrap>
              {item.skills?.slice(0, 5).map((skill, index) => (
                <Tag key={index} size="small">{skill}</Tag>
              ))}
              {item.skills?.length > 5 && (
                <Text type="secondary">+{item.skills.length - 5} more</Text>
              )}
            </Space>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">
              Member since {dayjs(item.createdAt).fromNow()}
            </Text>
            <Text type="secondary">
              {item.rating ? `${item.rating}/5` : 'No ratings yet'}
            </Text>
          </div>
        </div>
        
        <div style={{ textAlign: 'right', marginLeft: 16 }}>
          <Avatar 
            size={64} 
            src={item.profilePicture}
            icon={<UserOutlined />}
          />
        </div>
      </div>
    </Card>
  )

  const renderCard = (item) => {
    switch (searchType) {
      case 'internships':
        return renderInternshipCard(item)
      case 'companies':
        return renderCompanyCard(item)
      case 'students':
        return renderStudentCard(item)
      default:
        return renderInternshipCard(item)
    }
  }

  if (loading) {
    return (
      <div>
        {[...Array(5)].map((_, index) => (
          <Card key={index} style={{ marginBottom: 16 }}>
            <Skeleton active />
          </Card>
        ))}
      </div>
    )
  }

  if (!results.length) {
    return (
      <Empty
        description="No results found"
        style={{ margin: '40px 0' }}
      />
    )
  }

  return (
    <div>
      {/* Results Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16 
      }}>
        <div>
          <Title level={4}>
            {total} {searchType} found
          </Title>
          <Text type="secondary">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} results
          </Text>
        </div>
        
        <Space>
          <Text>Sort by:</Text>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            style={{ width: 150 }}
          >
            <Option value="relevance">Relevance</Option>
            <Option value="date">Date Posted</Option>
            <Option value="salary">Salary</Option>
            <Option value="applications">Applications</Option>
            <Option value="rating">Rating</Option>
          </Select>
        </Space>
      </div>

      <Divider />

      {/* Results List */}
      <div>
        {results.map(renderCard)}
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: 32 
        }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} items`
            }
          />
        </div>
      )}
    </div>
  )
}

export default SearchResults 