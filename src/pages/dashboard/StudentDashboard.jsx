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
  Timeline,
  Empty,
  Avatar,
  Tooltip,
  Badge,
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  TrophyOutlined,
  UserOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  analyticsAPI,
  internshipAPI,
} from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Chart from "react-apexcharts";
import { useState } from 'react'
import { reviewAPI } from '../../services/api'
import ReviewModal from '../../components/common/ReviewModal'
import { useAuth } from '../../contexts/AuthContextUtils'
import ReviewList from '../../components/common/ReviewList'

const { Title, Text, Paragraph } = Typography;

dayjs.extend(relativeTime);

const getStatusIcon = (status) => {
  const icons = {
    pending: <ClockCircleOutlined />,
    interviewing: <UserOutlined />,
    accepted: <CheckCircleOutlined />,
    rejected: <CloseCircleOutlined />,
  };
  return icons[status] || <ClockCircleOutlined />;
};

const getStatusColor = (status) => {
  const colors = {
    pending: "orange",
    interviewing: "blue",
    accepted: "green",
    rejected: "red",
  };
  return colors[status] || "gray";
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Review modal state for reporting
  const [reviewModal, setReviewModal] = useState({ open: false, mode: 'report', review: null })
  const [reviewLoading, setReviewLoading] = useState(false)

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["student-dashboard-stats"],
    queryFn: () => analyticsAPI.getDashboardStats().then(res => res.data),
  });

  // Fetch recent internships
  const { data: recentInternships, isLoading: internshipsLoading } = useQuery({
    queryKey: ["recent-internships-student"],
    queryFn: () =>
      internshipAPI.getInternships({ limit: 6, sort: "-createdAt" }).then(res => res.data),
  });

  const { data: userReviews, refetch: refetchUserReviews } = useQuery({
    queryKey: ['student-dashboard-user-reviews', user?.id],
    queryFn: () => user?.id ? reviewAPI.getUserReviews(user.id).then(res => res.data) : Promise.resolve({ reviews: [] }),
    enabled: !!user?.id
  })

  // Handler to open modal for reporting a review
  const openReviewModal = (review) => {
    setReviewModal({ open: true, mode: 'report', review })
  }
  const closeReviewModal = () => setReviewModal({ open: false, mode: 'report', review: null })

  // Handle review report submit
  const handleReviewSubmit = async (values) => {
    setReviewLoading(true)
    try {
      await reviewAPI.reportReview(reviewModal.review.id, { reason: values.reason }).then(res => res.data)
      // Optionally refetch reviews if displayed
      closeReviewModal()
    } catch (err) {
      // Optionally show error toast
    } finally {
      setReviewLoading(false)
    }
  }

  if (statsLoading) return <LoadingSpinner />;

  const dashboardData = stats?.data || {};
  const {
    totalApplications = 0,
    pendingApplications = 0,
    interviews = 0,
    offers = 0,
    recentApplications = [],
    statusDistribution = [],
    successRate = 0,
  } = dashboardData;

  // Chart data for application status
  const chartOptions = {
    chart: {
      type: "donut",
      height: 250,
    },
    labels: statusDistribution.map((item) => item.status),
    colors: ["#ffc658", "#52c41a", "#ff4d4f", "#1890ff"],
    legend: {
      position: "bottom",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const chartSeries = statusDistribution.map((item) => parseInt(item.count));

  // Recent applications table columns
  const applicationColumns = [
    {
      title: "Internship",
      dataIndex: ["internship", "title"],
      key: "title",
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.internship?.company?.fullName}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          color: getStatusColor(status),
          icon: getStatusIcon(status),
        };
        return (
          <Tag color={config.color} icon={config.icon}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Applied",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Tooltip title={dayjs(date).format("MMMM DD, YYYY HH:mm")}> {dayjs(date).fromNow()} </Tooltip>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/internships/${record.internship?.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  // Create timeline for recent applications
  const applicationTimeline = recentApplications.slice(0, 5).map((app) => ({
    dot: getStatusIcon(app.status),
    color: getStatusColor(app.status),
    children: (
      <div>
        <Text strong>{app.internship?.title}</Text>
        <br />
        <Text type="secondary">{app.internship?.company?.fullName}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {dayjs(app.createdAt).fromNow()}
        </Text>
      </div>
    ),
  }));

  return (
    <div style={{ padding: "0" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Student Dashboard</Title>
        <Paragraph type="secondary">
          Track your internship applications and career progress
        </Paragraph>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={totalApplications}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingApplications}
              prefix={<ClockCircleOutlined style={{ color: "#ffc658" }} />}
              valueStyle={{ color: "#ffc658" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Interviews"
              value={interviews}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Offers"
              value={offers}
              prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Success Rate and Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title="Success Rate"
            extra={<Badge count={`${successRate}%`} />}
          >
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Progress
                type="circle"
                percent={parseFloat(successRate)}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
              <div style={{ marginTop: "16px" }}>
                <Text type="secondary">
                  {offers} offers out of {totalApplications} applications
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                onClick={() => navigate("/internships")}
              >
                Browse Internships
              </Button>
              <Button
                icon={<FileTextOutlined />}
                block
                onClick={() => navigate("/applications")}
              >
                View All Applications
              </Button>
              <Button
                icon={<UserOutlined />}
                block
                onClick={() => navigate("/profile")}
              >
                Update Profile
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Application Status Chart and Recent Activity */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="Application Status Distribution">
            {chartSeries.length > 0 ? (
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                height={300}
              />
            ) : (
              <Empty description="No applications yet" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Application Activity">
            {applicationTimeline.length > 0 ? (
              <Timeline items={applicationTimeline} />
            ) : (
              <Empty description="No recent activity" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Applications Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <Card
            title="Recent Applications"
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/applications")}
              >
                View All
              </Button>
            }
          >
            <Table
              columns={applicationColumns}
              dataSource={recentApplications}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
              locale={{
                emptyText: (
                  <Empty
                    description="No applications yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      onClick={() => navigate("/internships")}
                    >
                      Browse Internships
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recommended Internships */}
      <Row>
        <Col span={24}>
          <Card
            title="Recommended Internships"
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/internships")}
              >
                Browse All
              </Button>
            }
          >
            {internshipsLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <Row gutter={[16, 16]}>
                {recentInternships?.internships
                  ?.slice(0, 3)
                  .map((internship) => (
                    <Col xs={24} md={8} key={internship.id}>
                      <Card
                        size="small"
                        hoverable
                        onClick={() =>
                          navigate(`/internships/${internship.id}`)
                        }
                        actions={[
                          <Button type="link" key="view">
                            View Details
                          </Button>,
                        ]}
                      >
                        <Card.Meta
                          avatar={
                            <Avatar src={internship.company?.logoUrl} style={{ backgroundColor: "#DC143C" }}>
                              {internship.company?.fullName?.charAt(0)}
                            </Avatar>
                          }
                          title={internship.title}
                          description={
                            <div>
                              <Text type="secondary">
                                {internship.company?.fullName}
                              </Text>
                              <br />
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                <CalendarOutlined />{" "}
                                {dayjs(internship.createdAt).fromNow()}
                              </Text>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
              </Row>
            )}
            {!internshipsLoading &&
              !recentInternships?.internships?.length && (
                <Empty description="No internships available" />
              )}
          </Card>
        </Col>
      </Row>
      {/* My Reviews Section */}
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="My Reviews">
            <ReviewList
              reviews={userReviews?.reviews || []}
              entityType="user"
              entityId={user?.id}
              onReport={openReviewModal}
            />
          </Card>
        </Col>
      </Row>
      <ReviewModal open={reviewModal.open} onCancel={closeReviewModal} onSubmit={handleReviewSubmit} mode={reviewModal.mode} initialValues={{ reason: '' }} loading={reviewLoading} />
    </div>
  );
};

export default StudentDashboard;
