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
  Progress,
  Table,
  Tag,
  Button,
  Divider
} from 'antd'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
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
import { 
  EyeOutlined,
  UserOutlined,
  FolderOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UpCircleOutlined,
  DownCircleOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContextUtils'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import api from '../../services/api';

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const Analytics = () => {
  const { user } = useAuth();

  // Fetch analytics based on role
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', user?.role],
    queryFn: () => {
      if (user?.role === 'admin') {
        return api.get('/analytics/platform').then(res => res.data);
      } else if (user?.role === 'business' || user?.role === 'company') {
        return api.get('/analytics/company').then(res => res.data);
      } else {
        return api.get('/analytics/user').then(res => res.data);
      }
    },
    enabled: !!user?.role
  });

  if (isLoading) return <div>Loading analytics...</div>;

  const stats = analyticsData?.data || {};

  return (
    <div>
      <Typography.Title level={2}>Analytics Dashboard</Typography.Title>
      <Divider />
      <Row gutter={[24, 24]}>
        {user?.role === 'admin' && (
          <>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Total Users" value={stats.totalUsers} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Total Internships" value={stats.totalInternships} prefix={<FolderOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Total Applications" value={stats.totalApplications} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
          </>
        )}
        {(user?.role === 'business' || user?.role === 'company') && (
          <>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="My Internships" value={stats.totalInternships} prefix={<FolderOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Applications to My Internships" value={stats.totalApplications} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
          </>
        )}
        {user?.role === 'student' && (
          <>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="My Applications" value={stats.totalApplications} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Accepted" value={stats.accepted} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Rejected" value={stats.rejected} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Pending" value={stats.pending} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default Analytics;