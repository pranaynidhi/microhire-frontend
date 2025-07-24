import { useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Divider, Table, Empty, Button, DatePicker, Space } from 'antd'
import { useAuth } from '../../contexts/AuthContextUtils'
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RTooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const COLORS = ['#DC143C', '#1E3A8A', '#059669', '#EA580C', '#0EA5E9', '#16A34A', '#EC4899', '#FFC658', '#722ed1', '#1890ff']

const BusinessDashboard = () => {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState([null, null])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState(null)

  // Fetch analytics data (company)
  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/analytics/company', {
        params: dateRange[0] && dateRange[1] ? {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        } : {}
      })
      setAnalytics(res.data.data)
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line
  }, [dateRange])

  if (loading) return <LoadingSpinner />
  if (error) return <div style={{ color: 'red', textAlign: 'center', margin: '40px 0' }}>{error}</div>
  if (!analytics) return <Empty description="No analytics data" style={{ margin: '40px 0' }} />

  // Pie chart helper
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
            <RTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : <Empty description="No data" />}
    </Card>
  )

  // Line chart helper
  const renderLineChart = (data, xKey, yKey, title, color='#DC143C') => (
    <Card title={title} style={{ height: 340 }}>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <RTooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      ) : <Empty description="No data" />}
    </Card>
  )

  // Top list table helper
  const renderTopTable = (data, columns, title) => (
    <Card title={title} style={{ minHeight: 340 }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(row, idx) => row.id || row._id || row.key || idx}
        pagination={false}
        size="small"
        locale={{ emptyText: <Empty description="No data" /> }}
      />
    </Card>
  )

  // Extract analytics data
  const { activeInternships, totalApplications, hiredInterns, hiringRate, topInternships = [], recentApplications = [] } = analytics

  // Safely handle undefined stats for charts
  const applicationStats = analytics.applicationStats || [];
  const typeStats = analytics.typeStats || [];
  const categoryStats = analytics.categoryStats || [];
  const monthlyApplications = analytics.monthlyApplications || [];

  return (
    <div>
      <Title level={2}>Business Dashboard</Title>
      <Divider />
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}><Statistic title="Active Internships" value={activeInternships} /></Col>
        <Col xs={24} md={8}><Statistic title="Total Applications" value={totalApplications} /></Col>
        <Col xs={24} md={8}><Statistic title="Hired Interns" value={hiredInterns} /></Col>
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
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}><Statistic title="Hiring Rate" value={hiringRate + '%'} /></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>{renderPieChart(applicationStats, 'count', 'status', 'Application Status Distribution')}</Col>
        <Col xs={24} md={12} lg={8}>{renderPieChart(typeStats, 'count', 'type', 'Internship Types')}</Col>
        <Col xs={24} md={12} lg={8}>{renderPieChart(categoryStats, 'count', 'category', 'Internship Categories')}</Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>{renderLineChart(monthlyApplications, 'month', 'count', 'Application Trends')}</Col>
        <Col xs={24} md={12}>{renderTopTable(topInternships, [
          { title: 'Internship', dataIndex: 'title', key: 'title' },
          { title: 'Applications', dataIndex: 'applicationCount', key: 'applicationCount' }
        ], 'Top Performing Internships')}</Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>{renderTopTable(recentApplications, [
          { title: 'Applicant', dataIndex: ['student', 'fullName'], key: 'student' },
          { title: 'Internship', dataIndex: ['internship', 'title'], key: 'internship' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
          { title: 'Applied', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('MMM DD, YYYY') }
        ], 'Recent Applications')}</Col>
      </Row>
    </div>
  )
}

export default BusinessDashboard
