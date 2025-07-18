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
  Badge,
} from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  UserOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  BarChartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  analyticsAPI,
  internshipAPI,
} from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from 'react'
import { reviewAPI } from '../../services/api'
import ReviewModal from '../../components/common/ReviewModal'
import ReviewList from '../../components/common/ReviewList'
import { useAuth } from '../../contexts/AuthContextUtils'

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth()

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["business-dashboard-stats"],
    queryFn: () => analyticsAPI.getDashboardStats().then(res => res.data),
  });

  // Fetch company's internships
  const { data: myInternships, isLoading: internshipsLoading } = useQuery({
    queryKey: ["my-internships-dashboard"],
    queryFn: () => internshipAPI.getMyInternships().then(res => res.data),
  });

  // Fetch company reviews
  const { data: companyReviews, refetch: refetchCompanyReviews } = useQuery({
    queryKey: ['business-dashboard-company-reviews', user?.id],
    queryFn: () => user?.id ? reviewAPI.getCompanyReviews(user.id).then(res => res.data) : Promise.resolve({ reviews: [] }),
    enabled: !!user?.id
  })

  // Review modal state for reporting
  const [reviewModal, setReviewModal] = useState({ open: false, mode: 'report', review: null })
  const [reviewLoading, setReviewLoading] = useState(false)

  // Handler to open modal for reporting a review
  const openReviewModal = (review) => {
    setReviewModal({ open: true, mode: 'report', review })
  }
  const closeReviewModal = () => setReviewModal({ open: false, mode: 'report', review: null })

  // Handle review report submit
  const handleReviewSubmit = async (values) => {
    setReviewLoading(true)
    try {
      await reviewAPI.reportReview(reviewModal.review.id, { reason: values.reason })
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
    activeInternships = 0,
    totalInternships = 0,
    totalApplications = 0,
    pendingApplications = 0,
    hiredInterns = 0,
    recentApplications = [],
    topInternships = [],
    hiringRate = 0,
  } = dashboardData;

  // Performance metrics for internships
  const performanceColumns = [
    {
      title: "Internship",
      dataIndex: "title",
      key: "title",
      render: (title) => <Text strong>{title}</Text>,
    },
    {
      title: "Applications",
      dataIndex: "applicationCount",
      key: "applicationCount",
      render: (count) => <Badge count={count} showZero />,
    },
    {
      title: "Performance",
      key: "performance",
      render: (_, record) => {
        const performance =
          (parseInt(record.applicationCount) / Math.max(totalApplications, 1)) *
          100;
        return (
          <Progress
            percent={performance.toFixed(1)}
            size="small"
            format={(percent) => `${percent}%`}
          />
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/internships/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  // Recent applications table
  const applicationColumns = [
    {
      title: "Applicant",
      dataIndex: ["student", "fullName"],
      key: "student",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Avatar size="small" style={{ backgroundColor: "#DC143C" }}>
            {name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.student?.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Internship",
      dataIndex: ["internship", "title"],
      key: "internship",
      render: (title) => <Text strong>{title}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          pending: { color: "orange", icon: <ClockCircleOutlined /> },
          interviewing: { color: "blue", icon: <UserOutlined /> },
          accepted: { color: "green", icon: <CheckCircleOutlined /> },
          rejected: { color: "red", icon: <ClockCircleOutlined /> },
        };
        const config = statusConfig[status] || { color: "default", icon: null };
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
        <Tooltip title={dayjs(date).format("MMMM DD, YYYY HH:mm")}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() =>
              navigate(`/applications?student=${record.student?.id}`)
            }
          >
            Review
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Business Dashboard</Title>
        <Paragraph type="secondary">
          Monitor your internship postings and track hiring performance
        </Paragraph>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Internships"
              value={activeInternships}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={totalApplications}
              prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Reviews"
              value={pendingApplications}
              prefix={<ClockCircleOutlined style={{ color: "#ffc658" }} />}
              valueStyle={{ color: "#ffc658" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hired Interns"
              value={hiredInterns}
              prefix={<TrophyOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Hiring Rate and Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title="Hiring Success Rate"
            extra={<Badge count={`${hiringRate}%`} />}
          >
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Progress
                type="circle"
                percent={parseFloat(hiringRate)}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  "0%": "#ff4d4f",
                  "50%": "#ffc658",
                  "100%": "#52c41a",
                }}
              />
              <div style={{ marginTop: "16px" }}>
                <Text type="secondary">
                  {hiredInterns} hired out of {totalApplications} applications
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
                onClick={() => navigate("/create-internship")}
              >
                Post New Internship
              </Button>
              <Button
                icon={<TeamOutlined />}
                block
                onClick={() => navigate("/applications")}
              >
                Review Applications
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

      {/* Performance Analytics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="Top Performing Internships">
            <Table
              columns={performanceColumns}
              dataSource={topInternships}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    description="No internships posted yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      onClick={() => navigate("/create-internship")}
                    >
                      Post Your First Internship
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Application Insights">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Avg Applications"
                  value={
                    totalInternships > 0
                      ? (totalApplications / totalInternships).toFixed(1)
                      : 0
                  }
                  suffix="per internship"
                  valueStyle={{ fontSize: "20px" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Response Rate"
                  value={
                    totalApplications > 0
                      ? (
                          ((totalApplications - pendingApplications) /
                            totalApplications) *
                          100
                        ).toFixed(1)
                      : 0
                  }
                  suffix="%"
                  valueStyle={{ fontSize: "20px" }}
                />
              </Col>
              <Col span={24}>
                <div style={{ marginTop: "16px" }}>
                  <Text type="secondary">
                    Keep engaging with applicants to improve your response rate!
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Applications */}
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
                    description="No applications received yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      onClick={() => navigate("/create-internship")}
                    >
                      Post an Internship
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* My Internships Overview */}
      <Row>
        <Col span={24}>
          <Card
            title="My Internships"
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/internships?filter=mine")}
              >
                Manage All
              </Button>
            }
          >
            {internshipsLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <Row gutter={[16, 16]}>
                {myInternships?.internships
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
                          <Button
                            type="link"
                            key="applications"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/applications?internship=${internship.id}`
                              );
                            }}
                          >
                            Applications ({internship.applications?.length || 0}
                            )
                          </Button>,
                        ]}
                      >
                        <Card.Meta
                          avatar={
                            <Badge
                              count={internship.applications?.length || 0}
                              offset={[-5, 5]}
                            >
                              <Avatar style={{ backgroundColor: "#1890ff" }}>
                                <FileTextOutlined />
                              </Avatar>
                            </Badge>
                          }
                          title={internship.title}
                          description={
                            <div>
                              <Tag
                                color={
                                  internship.status === "active"
                                    ? "green"
                                    : "orange"
                                }
                              >
                                {internship.status?.toUpperCase()}
                              </Tag>
                              <br />
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                <CalendarOutlined /> Posted{" "}
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
              !myInternships?.internships?.length && (
                <Empty
                  description="No internships posted yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    onClick={() => navigate("/create-internship")}
                  >
                    Post Your First Internship
                  </Button>
                </Empty>
              )}
          </Card>
        </Col>
      </Row>
      {/* Company Reviews Section */}
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="Company Reviews">
            <ReviewList
              reviews={companyReviews?.reviews || []}
              entityType="company"
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

export default BusinessDashboard;
