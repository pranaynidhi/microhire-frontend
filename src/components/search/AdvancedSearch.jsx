import { useState, useEffect } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Space, 
  Row, 
  Col, 
  Tag, 
  AutoComplete,
  Divider,
  Typography,
  Tooltip,
  Badge
} from 'antd'
import { 
  SearchOutlined, 
  FilterOutlined, 
  ClearOutlined,
  HistoryOutlined,
  StarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { searchAPI } from '../../services/api'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const { Option } = Select
const { RangePicker } = DatePicker
const { Title, Text } = Typography

const AdvancedSearch = ({ onSearch, initialFilters = {} }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    type: '',
    stipendRange: [],
    duration: '',
    company: '',
    dateRange: [],
    ...initialFilters
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  // Fetch search suggestions
  const { data: searchSuggestions } = useQuery({
    queryKey: ['search-suggestions', searchTerm],
    queryFn: () => searchAPI.getSearchSuggestions({ q: searchTerm }),
    enabled: searchTerm.length > 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch saved searches
  const { data: savedSearches } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: () => searchAPI.getSavedSearches(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  // Fetch search history
  const { data: searchHistory } = useQuery({
    queryKey: ['search-history'],
    queryFn: () => searchAPI.getSearchHistory(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  useEffect(() => {
    if (searchSuggestions?.data) {
      setSuggestions(searchSuggestions.data)
    }
  }, [searchSuggestions])

  const handleSearch = async () => {
    try {
      const searchParams = {
        q: searchTerm,
        ...filters,
        dateRange: filters.dateRange?.map(date => date?.format('YYYY-MM-DD'))
      }
      
      // Track search click
      await searchAPI.trackSearchClick({
        searchTerm,
        filters: searchParams
      })
      
      onSearch(searchParams)
    } catch (error) {
      toast.error('Search failed. Please try again.')
    }
  }

  const handleSaveSearch = async () => {
    try {
      await searchAPI.saveSearch({
        name: `Search: ${searchTerm}`,
        searchTerm,
        filters
      })
      toast.success('Search saved successfully!')
    } catch (error) {
      toast.error('Failed to save search.')
    }
  }

  const handleLoadSavedSearch = (savedSearch) => {
    setSearchTerm(savedSearch.searchTerm)
    setFilters(savedSearch.filters)
    handleSearch()
  }

  const handleClearFilters = () => {
    setFilters({
      location: '',
      category: '',
      type: '',
      stipendRange: [],
      duration: '',
      company: '',
      dateRange: []
    })
    setSearchTerm('')
  }

  const getFilterCount = () => {
    return Object.values(filters).filter(value => 
      value && (Array.isArray(value) ? value.length > 0 : true)
    ).length
  }

  return (
    <Card className="advanced-search">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <AutoComplete
            value={searchTerm}
            onChange={setSearchTerm}
            onSelect={(value) => setSearchTerm(value)}
            onSearch={setSearchTerm}
            options={suggestions.map(suggestion => ({
              label: suggestion.text,
              value: suggestion.text
            }))}
            style={{ width: '100%' }}
          >
            <Input
              size="large"
              placeholder="Search internships, companies, or skills..."
              prefix={<SearchOutlined />}
              onPressEnter={handleSearch}
            />
          </AutoComplete>
        </Col>
        
        <Col xs={24} md={8}>
          <Space>
            <Button 
              type="primary" 
              size="large" 
              onClick={handleSearch}
              icon={<SearchOutlined />}
            >
              Search
            </Button>
            
            <Button
              size="large"
              onClick={() => setShowAdvanced(!showAdvanced)}
              icon={<FilterOutlined />}
            >
              Filters
              {getFilterCount() > 0 && (
                <Badge count={getFilterCount()} size="small" />
              )}
            </Button>
            
            <Button
              size="large"
              onClick={handleClearFilters}
              icon={<ClearOutlined />}
            >
              Clear
            </Button>
          </Space>
        </Col>
      </Row>

      {showAdvanced && (
        <div style={{ marginTop: 16 }}>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Text strong>Location</Text>
              <Input
                placeholder="City, Country"
                prefix={<EnvironmentOutlined />}
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </Col>
            
            <Col xs={24} md={6}>
              <Text strong>Category</Text>
              <Select
                placeholder="Select category"
                value={filters.category}
                onChange={(value) => setFilters({ ...filters, category: value })}
                style={{ width: '100%' }}
              >
                <Option value="web-development">Web Development</Option>
                <Option value="mobile-development">Mobile Development</Option>
                <Option value="data-science">Data Science</Option>
                <Option value="design">Design</Option>
                <Option value="marketing">Marketing</Option>
                <Option value="business">Business</Option>
              </Select>
            </Col>
            
            <Col xs={24} md={6}>
              <Text strong>Type</Text>
              <Select
                placeholder="Select type"
                value={filters.type}
                onChange={(value) => setFilters({ ...filters, type: value })}
                style={{ width: '100%' }}
              >
                <Option value="remote">Remote</Option>
                <Option value="onsite">On-site</Option>
                <Option value="hybrid">Hybrid</Option>
              </Select>
            </Col>
            
            <Col xs={24} md={6}>
              <Text strong>Duration</Text>
              <Select
                placeholder="Select duration"
                value={filters.duration}
                onChange={(value) => setFilters({ ...filters, duration: value })}
                style={{ width: '100%' }}
              >
                <Option value="1-3-months">1-3 months</Option>
                <Option value="3-6-months">3-6 months</Option>
                <Option value="6-12-months">6-12 months</Option>
                <Option value="12+months">12+ months</Option>
              </Select>
            </Col>
            
            <Col xs={24} md={8}>
              <Text strong>Stipend Range</Text>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Min', 'Max']}
                value={filters.stipendRange}
                onChange={(dates) => setFilters({ ...filters, stipendRange: dates })}
              />
            </Col>
            
            <Col xs={24} md={8}>
              <Text strong>Posted Date</Text>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['From', 'To']}
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              />
            </Col>
            
            <Col xs={24} md={8}>
              <Text strong>Company</Text>
              <Input
                placeholder="Company name"
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              />
            </Col>
          </Row>
          
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleSaveSearch} icon={<StarOutlined />}>
                Save Search
              </Button>
              <Button type="primary" onClick={handleSearch}>
                Apply Filters
              </Button>
            </Space>
          </div>
        </div>
      )}

      {/* Search History & Saved Searches */}
      {(searchHistory?.data?.length > 0 || savedSearches?.data?.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <Divider />
          <Row gutter={[16, 16]}>
            {searchHistory?.data?.length > 0 && (
              <Col xs={24} md={12}>
                <Title level={5}>
                  <HistoryOutlined /> Recent Searches
                </Title>
                <Space wrap>
                  {searchHistory.data.slice(0, 5).map((history, index) => (
                    <Tag
                      key={index}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSearchTerm(history.searchTerm)
                        setFilters(history.filters || {})
                        handleSearch()
                      }}
                    >
                      {history.searchTerm}
                    </Tag>
                  ))}
                </Space>
              </Col>
            )}
            
            {savedSearches?.data?.length > 0 && (
              <Col xs={24} md={12}>
                <Title level={5}>
                  <StarOutlined /> Saved Searches
                </Title>
                <Space wrap>
                  {savedSearches.data.slice(0, 5).map((saved, index) => (
                    <Tooltip key={index} title={saved.name}>
                      <Tag
                        color="blue"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleLoadSavedSearch(saved)}
                      >
                        {saved.name}
                      </Tag>
                    </Tooltip>
                  ))}
                </Space>
              </Col>
            )}
          </Row>
        </div>
      )}
    </Card>
  )
}

export default AdvancedSearch 