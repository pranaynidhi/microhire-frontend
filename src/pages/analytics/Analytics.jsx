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
  Divider,
  Table,
  Empty,
  Button
} from 'antd'
import {
  LineChart,
  Line,
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
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContextUtils'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import api from '../../services/api';
import React from 'react';

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const COLORS = ['#DC143C', '#1E3A8A', '#059669', '#EA580C', '#0EA5E9', '#16A34A', '#EC4899', '#FFC658', '#722ed1', '#1890ff']

const Analytics = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState([null, null])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState(null)

  // Fetch analytics data (platform/company/user) and breakdowns
  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (user?.role === 'admin') {
        // Platform analytics
        res = await api.get('/analytics/platform', {
          params: dateRange[0] && dateRange[1] ? {
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD')
          } : {}
        })
      } else if (user?.role === 'business' || user?.role === 'company') {
        res = await api.get('/analytics/company')
      } else {
        res = await api.get('/analytics/user')
      }
      setAnalytics(res.data.data)
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when dateRange changes
  React.useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line
  }, [user?.role, dateRange])

  if (loading) return <LoadingSpinner />
  if (error) return <div style={{ color: 'red', textAlign: 'center', margin: '40px 0' }}>{error}</div>
  if (!analytics) return <Empty description="No analytics data" style={{ margin: '40px 0' }} />

  // Helper: Pie chart renderer
  const renderPieChart = (data, dataKey, nameKey, title) => (
    <Card title={title} style={{ height: 340 }}>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : <Empty description="No data" />}
    </Card>
  )

  // Helper: Bar/Line chart renderer
  const renderLineChart = (data, xKey, yKey, title, color='#DC143C') => (
    <Card title={title} style={{ height: 340 }}>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      ) : <Empty description="No data" />}
    </Card>
  )

  // Helper: Top list table
  const renderTopTable = (data, columns, title) => (
    <Card title={title} style={{ minHeight: 340 }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={columns[0].dataIndex}
        pagination={false}
        size="small"
        locale={{ emptyText: <Empty description="No data" /> }}
      />
    </Card>
  )

  // --- Platform Analytics ---
  if (user?.role === 'admin') {
    const { overview = {}, userRoleStats = [], applicationStats = [], categoryStats = [], typeStats = [], locationStats = [], monthlyTrends = [], monthlyApplications = [] } = analytics
    return (
      <div>
        <Title level={2}>Platform Analytics</Title>
        <Divider />
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
          <Col xs={24} md={12} lg={8}>
            <Statistic title="Total Users" value={overview.totalUsers} />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Statistic title="Total Internships" value={overview.totalInternships} />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Statistic title="Total Applications" value={overview.totalApplications} />
          </Col>
          <Col xs={24} md={24} lg={24}>
            <Space>
              <Text strong>Date Range:</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                allowClear
                style={{ minWidth: 260 }}
              />
              <Button onClick={fetchAnalytics}>Refresh</Button>
            </Space>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>{renderPieChart(userRoleStats, 'count', 'role', 'User Role Distribution')}</Col>
          <Col xs={24} md={12} lg={8}>{renderPieChart(applicationStats, 'count', 'status', 'Application Status Distribution')}</Col>
          <Col xs={24} md={12} lg={8}>{renderPieChart(categoryStats, 'count', 'category', 'Internship Categories')}</Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12} lg={8}>{renderPieChart(typeStats, 'count', 'type', 'Internship Types')}</Col>
          <Col xs={24} md={12} lg={8}>{renderPieChart(locationStats, 'count', 'location', 'Internship Locations')}</Col>
          <Col xs={24} md={24} lg={8}></Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>{renderLineChart(monthlyTrends, 'month', 'count', 'Internship Posting Trends')}</Col>
          <Col xs={24} md={12}>{renderLineChart(monthlyApplications, 'month', 'count', 'Application Trends')}</Col>
        </Row>
      </div>
    )
  }

  // --- Company Analytics ---
  if (user?.role === 'business' || user?.role === 'company') {
    const { totalInternships, totalApplications, topInternships = [], recentApplications = [], hiringRate, pendingApplications, activeInternships } = analytics
    return (
      <div>
        <Title level={2}>Company Analytics</Title>
        <Divider />
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}><Statistic title="Total Internships" value={totalInternships} /></Col>
          <Col xs={24} md={8}><Statistic title="Total Applications" value={totalApplications} /></Col>
          <Col xs={24} md={8}><Statistic title="Hiring Rate" value={hiringRate + '%'} /></Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>{renderTopTable(topInternships, [
            { title: 'Internship', dataIndex: 'title', key: 'title' },
            { title: 'Applications', dataIndex: 'applicationCount', key: 'applicationCount' }
          ], 'Top Performing Internships')}</Col>
          <Col xs={24} md={12}>{renderTopTable(recentApplications, [
            { title: 'Applicant', dataIndex: ['student', 'fullName'], key: 'student' },
            { title: 'Internship', dataIndex: ['internship', 'title'], key: 'internship' },
            { title: 'Status', dataIndex: 'status', key: 'status' },
            { title: 'Applied', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('MMM DD, YYYY') }
          ], 'Recent Applications')}</Col>
        </Row>
      </div>
    )
  }

  // --- User Analytics ---
  if (user?.role === 'student') {
    const { totalApplications, accepted, rejected, pending, statusDistribution = [], recentApplications = [], successRate } = analytics
    return (
      <div>
        <Title level={2}>My Analytics</Title>
        <Divider />
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
          <Col xs={24} md={6}><Statistic title="Total Applications" value={totalApplications} /></Col>
          <Col xs={24} md={6}><Statistic title="Accepted" value={accepted} /></Col>
          <Col xs={24} md={6}><Statistic title="Rejected" value={rejected} /></Col>
          <Col xs={24} md={6}><Statistic title="Pending" value={pending} /></Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>{renderPieChart(statusDistribution, 'count', 'status', 'Application Status Distribution')}</Col>
          <Col xs={24} md={12}>{renderTopTable(recentApplications, [
            { title: 'Internship', dataIndex: ['internship', 'title'], key: 'internship' },
            { title: 'Status', dataIndex: 'status', key: 'status' },
            { title: 'Applied', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('MMM DD, YYYY') }
          ], 'Recent Applications')}</Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24}><Statistic title="Success Rate" value={successRate + '%'} /></Col>
        </Row>
      </div>
    )
  }

  return null
}

export default Analytics