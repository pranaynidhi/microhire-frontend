import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Row, 
  Col, 
  Card, 
  Tabs, 
  Typography, 
  Space, 
  Button,
  Alert,
  Spin
} from 'antd'
import { 
  SearchOutlined, 
  BookOutlined, 
  CompanyOutlined, 
  UserOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { searchAPI } from '../../services/api'
import AdvancedSearch from '../../components/search/AdvancedSearch'
import SearchResults from '../../components/search/SearchResults'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { TabPane } = Tabs

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Get initial search parameters from URL
  const initialSearchTerm = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || 'internships'
  const initialPage = parseInt(searchParams.get('page')) || 1
  const initialSort = searchParams.get('sort') || 'relevance'
  
  const [searchType, setSearchType] = useState(initialType)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [sortBy, setSortBy] = useState(initialSort)
  const [filters, setFilters] = useState({
    q: initialSearchTerm,
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    type: searchParams.get('internshipType') || '',
    stipendRange: searchParams.get('stipendRange') ? 
      searchParams.get('stipendRange').split(',').map(Number) : [],
    duration: searchParams.get('duration') || '',
    company: searchParams.get('company') || '',
    dateRange: searchParams.get('dateRange') ? 
      searchParams.get('dateRange').split(',').map(date => new Date(date)) : []
  })

  // Perform search based on current parameters
  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['search', searchType, filters, currentPage, sortBy],
    queryFn: () => {
      const params = {
        ...filters,
        page: currentPage,
        sort: sortBy,
        type: searchType
      }
      
      // Clean up empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })
      
      return searchAPI.advancedSearch(params)
    },
    enabled: !!filters.q || Object.values(filters).some(value => 
      value && (Array.isArray(value) ? value.length > 0 : true)
    ),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Update URL when search parameters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams()
    
    if (filters.q) newSearchParams.set('q', filters.q)
    if (filters.location) newSearchParams.set('location', filters.location)
    if (filters.category) newSearchParams.set('category', filters.category)
    if (filters.type) newSearchParams.set('internshipType', filters.type)
    if (filters.duration) newSearchParams.set('duration', filters.duration)
    if (filters.company) newSearchParams.set('company', filters.company)
    if (filters.stipendRange?.length === 2) {
      newSearchParams.set('stipendRange', filters.stipendRange.join(','))
    }
    if (filters.dateRange?.length === 2) {
      newSearchParams.set('dateRange', filters.dateRange.map(date => 
        date.toISOString().split('T')[0]
      ).join(','))
    }
    
    newSearchParams.set('type', searchType)
    newSearchParams.set('page', currentPage.toString())
    newSearchParams.set('sort', sortBy)
    
    setSearchParams(newSearchParams)
  }, [filters, searchType, currentPage, sortBy, setSearchParams])

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
    setCurrentPage(1) // Reset to first page on sort change
  }

  const handleTabChange = (key) => {
    setSearchType(key)
    setCurrentPage(1) // Reset to first page on tab change
  }

  const handleRetry = () => {
    refetch()
  }

  const getSearchTypeLabel = (type) => {
    switch (type) {
      case 'internships':
        return 'Internships'
      case 'companies':
        return 'Companies'
      case 'students':
        return 'Students'
      default:
        return 'All'
    }
  }

  const getSearchTypeIcon = (type) => {
    switch (type) {
      case 'internships':
        return <BookOutlined />
      case 'companies':
        return <CompanyOutlined />
      case 'students':
        return <UserOutlined />
      default:
        return <SearchOutlined />
    }
  }

  return (
    <div className="search-page">
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card>
            <Title level={2}>
              <SearchOutlined /> Advanced Search
            </Title>
            <Text type="secondary">
              Find internships, companies, and students that match your criteria
            </Text>
          </Card>
        </Col>
        
        <Col xs={24}>
          <AdvancedSearch 
            onSearch={handleSearch}
            initialFilters={filters}
          />
        </Col>
        
        <Col xs={24}>
          <Card>
            <Tabs 
              activeKey={searchType} 
              onChange={handleTabChange}
              items={[
                {
                  key: 'internships',
                  label: (
                    <Space>
                      <BookOutlined />
                      Internships
                      {searchResults?.data?.internships?.length > 0 && (
                        <span>({searchResults.data.internships.length})</span>
                      )}
                    </Space>
                  )
                },
                {
                  key: 'companies',
                  label: (
                    <Space>
                      <CompanyOutlined />
                      Companies
                      {searchResults?.data?.companies?.length > 0 && (
                        <span>({searchResults.data.companies.length})</span>
                      )}
                    </Space>
                  )
                },
                {
                  key: 'students',
                  label: (
                    <Space>
                      <UserOutlined />
                      Students
                      {searchResults?.data?.students?.length > 0 && (
                        <span>({searchResults.data.students.length})</span>
                      )}
                    </Space>
                  )
                }
              ]}
            />
            
            {error && (
              <Alert
                message="Search Error"
                description="Failed to load search results. Please try again."
                type="error"
                action={
                  <Button size="small" onClick={handleRetry}>
                    <ReloadOutlined /> Retry
                  </Button>
                }
                style={{ marginBottom: 16 }}
              />
            )}
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>Searching {getSearchTypeLabel(searchType)}...</Text>
                </div>
              </div>
            ) : searchResults?.data ? (
              <SearchResults
                results={searchResults.data[searchType] || []}
                loading={isLoading}
                total={searchResults.total || 0}
                currentPage={currentPage}
                pageSize={10}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
                searchType={searchType}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <SearchOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Start your search
                </Title>
                <Text type="secondary">
                  Enter keywords or use filters to find {getSearchTypeLabel(searchType).toLowerCase()}
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SearchPage 