import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Progress,
  Table,
  Tag,
  Button,
  Space,
  Empty,
  Avatar,
  Tooltip,
  Alert,
  Tabs,
  Badge,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { adminAPI, analyticsAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Chart from "react-apexcharts";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: () => adminAPI.getDashboard().then(res => res.data),
  });

  // Fetch analytics stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => analyticsAPI.getDashboardStats().then(res => res.data),
  });

  if (dashboardLoading || statsLoading) return <LoadingSpinner />;

  const adminData = dashboardData || {};
  const statsData = stats || {};

  const {
    pendingItems = {},
    growth = {},
    metrics = {},
  } = adminData;

  const {
    totalUsers = 0,
    activeUsers = 0,
    studentsCount = 0,
    businessCount = 0,
    totalInternships = 0,
    activeInternships = 0,
    totalApplications = 0,
    recentUsers = [],
    platformHealth = {},
  } = statsData;

  // Chart data for user growth
  const userGrowthOptions = {
    chart: {
      type: "line",
      height: 300,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: ["#1890ff", "#52c41a", "#722ed1"],
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    legend: {
      position: "top",
    },
  };

  const userGrowthSeries = [
    {
      name: "Total Users",
      data: [120, 145, 167, 189, 210, totalUsers],
    },
    {
      name: "Students",
      data: [80, 95, 110, 125, 140, studentsCount],
    },
    {
      name: "Businesses",
      data: [40, 50, 57, 64, 70, businessCount],
    },
  ];

  // Platform health chart
  const healthOptions = {
    chart: {
      type: "radialBar",
      height: 250,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: "22px",
          },
          value: {
            fontSize: "16px",
          },
          total: {
            show: true,
            label: "Health Score",
            formatter: function () {
              return "85%";
            },
          },
        },
      },
    },
    labels: ["Active Users", "Active Internships", "Platform Usage"],
    colors: ["#52c41a", "#1890ff", "#722ed1"],
  };

  const healthSeries = [
    ((activeUsers / Math.max(totalUsers, 1)) * 100).toFixed(0),
    ((activeInternships / Math.max(totalInternships, 1)) * 100).toFixed(0),
    85, // Platform usage score (calculated metric)
  ];

  // Recent activities table columns
  const userColumns = [
    {
      title: "User",
      dataIndex: "fullName",
      key: "fullName",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Avatar size="small" style={{ backgroundColor: "#DC143C" }}>
            {name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const roleColors = {
          student: "blue",
          business: "green",
          admin: "red",
        };
        return <Tag color={roleColors[role]}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Tooltip title={dayjs(date).format("MMMM DD, YYYY HH:mm")}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/admin?tab=users&userId=${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  // Pending items list
  const pendingItemsList = [
    {
      title: "Pending Reports",
      count: pendingItems.reports || 0,
      icon: <WarningOutlined style={{ color: "#ff4d4f" }} />,
      action: () => navigate("/admin?tab=reports"),
    },
    {
      title: "Pending Reviews",
      count: pendingItems.reviews || 0,
      icon: <ExclamationCircleOutlined style={{ color: "#ffc658" }} />,
      action: () => navigate("/admin?tab=reviews"),
    },
    {
      title: "Pending Internships",
      count: pendingItems.internships || 0,
      icon: <FileTextOutlined style={{ color: "#1890ff" }} />,
      action: () => navigate("/admin?tab=internships"),
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Admin Dashboard</Title>
        <Paragraph type="secondary">
          Monitor platform health, user activity, and system performance
        </Paragraph>
      </div>

      {/* System Health Alert */}
      {pendingItems.reports > 5 && (
        <Alert
          message="High Priority"
          description={`You have ${pendingItems.reports} pending reports that require immediate attention.`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: "24px" }}
          action={
            <Button size="small" onClick={() => navigate("/admin?tab=reports")}>
              Review Reports
            </Button>
          }
        />
      )}

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
              suffix={
                <Badge
                  count={`+${growth.newUsersThisMonth || 0}`}
                  style={{ backgroundColor: "#52c41a" }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Internships"
              value={activeInternships}
              prefix={<FileTextOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
              suffix={
                <Badge
                  count={`+${growth.newInternshipsThisMonth || 0}`}
                  style={{ backgroundColor: "#52c41a" }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={totalApplications}
              prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
              suffix={
                <Badge
                  count={`+${growth.newApplicationsThisMonth || 0}`}
                  style={{ backgroundColor: "#52c41a" }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Platform Health"
              value={85}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Growth Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={8}>
          <Card title="User Growth Rate">
            <div style={{ textAlign: "center" }}>
              <Statistic
                value={platformHealth.userGrowthRate || 0}
                suffix="%"
                prefix={
                  parseFloat(platformHealth.userGrowthRate || 0) > 0 ? (
                    <RiseOutlined style={{ color: "#52c41a" }} />
                  ) : (
                    <FallOutlined style={{ color: "#ff4d4f" }} />
                  )
                }
                valueStyle={{
                  color:
                    parseFloat(platformHealth.userGrowthRate || 0) > 0
                      ? "#52c41a"
                      : "#ff4d4f",
                }}
              />
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary">Monthly growth</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="User Distribution">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Students"
                  value={studentsCount}
                  valueStyle={{ fontSize: "20px", color: "#1890ff" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Businesses"
                  value={businessCount}
                  valueStyle={{ fontSize: "20px", color: "#52c41a" }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: "16px" }}>
              <Progress
                percent={(
                  (studentsCount / Math.max(totalUsers, 1)) *
                  100
                ).toFixed(1)}
                strokeColor="#1890ff"
                format={() => `${studentsCount} students`}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Pending Items">
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              {pendingItemsList.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Space>
                    {item.icon}
                    <Text>{item.title}</Text>
                  </Space>
                  <Button type="link" size="small" onClick={item.action}>
                    {item.count}
                  </Button>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card title="Platform Growth Trends">
            <Chart
              options={userGrowthOptions}
              series={userGrowthSeries}
              type="line"
              height={300}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="System Health">
            <Chart
              options={healthOptions}
              series={healthSeries}
              type="radialBar"
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity and Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent User Registrations"
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/admin?tab=users")}
              >
                View All Users
              </Button>
            }
          >
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: <Empty description="No recent registrations" />,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Button
                icon={<UserOutlined />}
                block
                onClick={() => navigate("/admin?tab=users")}
              >
                Manage Users
              </Button>
              <Button
                icon={<FileTextOutlined />}
                block
                onClick={() => navigate("/admin?tab=internships")}
              >
                Review Internships
              </Button>
              <Button
                icon={<WarningOutlined />}
                block
                onClick={() => navigate("/admin?tab=reports")}
              >
                Handle Reports
              </Button>
              <Button
                icon={<BarChartOutlined />}
                block
                onClick={() => navigate("/analytics")}
              >
                View Analytics
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* System Insights */}
      <Row>
        <Col span={24}>
          <Card title="Platform Insights">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic
                    title="Avg Applications per Internship"
                    value={platformHealth.averageApplicationsPerInternship || 0}
                    precision={1}
                    valueStyle={{ fontSize: "20px" }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic
                    title="Active User Rate"
                    value={metrics.activeUserRate || 0}
                    suffix="%"
                    valueStyle={{ fontSize: "20px" }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic
                    title="Platform Utilization"
                    value={85}
                    suffix="%"
                    valueStyle={{ fontSize: "20px", color: "#52c41a" }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
