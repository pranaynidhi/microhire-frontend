import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Avatar,
  Modal,
  Input,
  Select,
  Tabs,
  Alert,
  Progress,
  List,
  Badge,
  Tooltip,
  Dropdown,
} from "antd";
import {
  UserOutlined,
  FolderOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserDeleteOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../services/api";
import { reviewAPI } from '../../services/api'
import ReviewModal from '../../components/common/ReviewModal'
import LoadingSpinner from "../../components/common/LoadingSpinner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import ReviewModerationModal from '../../components/common/ReviewModerationModal';
import api from '../../services/api';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const AdminPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "users"
  );
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  // Review modal state for reporting/moderation
  const [reviewModal, setReviewModal] = useState({ open: false, mode: 'report', review: null })
  const [reviewLoading, setReviewLoading] = useState(false)

  // Handler to open modal for reporting/moderating a review
  const openReviewModal = (review) => {
    setReviewModal({ open: true, mode: 'report', review })
  }
  const closeReviewModal = () => setReviewModal({ open: false, mode: 'report', review: null })

  // Handle review report submit
  const handleReviewSubmit = async (values) => {
    setReviewLoading(true)
    try {
      await reviewAPI.reportReview(reviewModal.review.id, { reason: values.reason })
      toast.success('Review reported!')
      closeReviewModal()
      queryClient.invalidateQueries(["admin-reports"])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report review')
    } finally {
      setReviewLoading(false)
    }
  }

  // Handle review moderation actions
  const handleModerateReview = async (action) => {
    setReviewLoading(true)
    try {
      if (action === 'delete') {
        await reviewAPI.deleteReview(reviewModal.review.id)
        toast.success('Review deleted!')
      } else {
        await reviewAPI.moderateReview(reviewModal.review.id, { action })
        toast.success(`Review ${action === 'approve' ? 'approved' : 'rejected'}!`)
      }
      closeReviewModal()
      queryClient.invalidateQueries(["admin-reports"])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to moderate review')
    } finally {
      setReviewLoading(false)
    }
  }

  // Update URL when tab changes
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  // Handle URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["users", "internships", "reports", "settings"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Fetch admin dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminAPI.getDashboard().then(res => res.data),
    onError: (error) => {
      console.error("Dashboard API Error:", error);
      console.error("Dashboard Error Response:", error.response?.data);
    },
  });

  // Fetch users
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["admin-users", searchTerm, statusFilter],
    queryFn: () =>
      adminAPI.getUsers({ search: searchTerm, status: statusFilter }).then(res => res.data),
    onError: (error) => {
      console.error("Users API Error:", error);
      console.error("Users Error Response:", error.response?.data);
    },
  });

  // Fetch internships
  const {
    data: internshipsData,
    isLoading: internshipsLoading,
    error: internshipsError,
  } = useQuery({
    queryKey: ["admin-internships"],
    queryFn: () => adminAPI.getInternships().then(res => res.data),
    onError: (error) => {
      console.error("Internships API Error:", error);
      console.error("Internships Error Response:", error.response?.data);
    },
  });

  // Fetch reports
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
  } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => adminAPI.getReports().then(res => res.data),
    onError: (error) => {
      console.error("Reports API Error:", error);
      console.error("Reports Error Response:", error.response?.data);
    },
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: adminAPI.banUser,
    onSuccess: () => {
      toast.success("User banned successfully");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to ban user");
    },
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: adminAPI.unbanUser,
    onSuccess: () => {
      toast.success("User unbanned successfully");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to unban user");
    },
  });

  // Delete internship mutation
  const deleteInternshipMutation = useMutation({
    mutationFn: adminAPI.deleteInternship,
    onSuccess: () => {
      toast.success("Internship deleted successfully");
      queryClient.invalidateQueries(["admin-internships"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete internship"
      );
    },
  });

  const handleBanUser = (userId) => {
    Modal.confirm({
      title: "Ban User",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to ban this user? They will not be able to access the platform.",
      okText: "Ban User",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        banUserMutation.mutate(userId);
      },
    });
  };

  const handleUnbanUser = (userId) => {
    unbanUserMutation.mutate(userId);
  };

  const handleDeleteInternship = (internshipId) => {
    Modal.confirm({
      title: "Delete Internship",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to delete this internship? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteInternshipMutation.mutate(internshipId);
      },
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserModalVisible(true);
  };

  const userColumns = [
    {
      title: "User",
      dataIndex: "fullName",
      key: "fullName",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar src={record.avatar} style={{ backgroundColor: "#DC143C" }}>
            {name?.charAt(0)?.toUpperCase()}
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
      render: (role) => (
        <Tag
          color={
            role === "admin" ? "red" : role === "business" ? "blue" : "green"
          }
        >
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "active" ? "success" : "error"}
          text={status?.charAt(0)?.toUpperCase() + status?.slice(1)}
        />
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                icon: <EyeOutlined />,
                label: "View Details",
                onClick: () => handleViewUser(record),
              },
              {
                key: "edit",
                icon: <EditOutlined />,
                label: "Edit User",
                onClick: () => toast.info("Edit user feature coming soon"),
              },
              { type: "divider" },
              record.status === "active"
                ? {
                    key: "ban",
                    icon: <UserDeleteOutlined />,
                    label: "Ban User",
                    danger: true,
                    onClick: () => handleBanUser(record.id),
                  }
                : {
                    key: "unban",
                    icon: <CheckCircleOutlined />,
                    label: "Unban User",
                    onClick: () => handleUnbanUser(record.id),
                  },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const internshipColumns = [
    {
      title: "Internship",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary">{record.companyName}</Text>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Applications",
      dataIndex: "applicationsCount",
      key: "applicationsCount",
      render: (count) => <Badge count={count || 0} showZero />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Posted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).fromNow(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteInternship(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: "Review",
      dataIndex: "reviewText",
      key: "reviewText",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">
            By {record.reviewerName} on {dayjs(record.createdAt).fromNow()}
          </Text>
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <Tag color="blue" style={{ fontSize: "14px" }}>
          {rating} Stars
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "approved" ? "green" : status === "rejected" ? "red" : "orange"}
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, review) => (
        <Button type="link" onClick={() => openModerationModal(review)}>
          Moderate
        </Button>
      ),
    },
  ];

  if (dashboardLoading) {
    return <LoadingSpinner />;
  }

  // Log any errors
  if (dashboardError) console.error("Dashboard Error:", dashboardError);
  if (usersError) console.error("Users Error:", usersError);
  if (internshipsError) console.error("Internships Error:", internshipsError);
  if (reportsError) console.error("Reports Error:", reportsError);

  const stats = dashboardData?.systemHealth || {};
  const pendingItems = dashboardData?.pendingItems || {};

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Title level={2}>Admin Panel</Title>
        <Text style={{ fontSize: "16px", color: "#666" }}>
          Monitor and manage the MicroHire platform
        </Text>
      </div>

      {/* Overview Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers || 0}
              prefix={<UserOutlined style={{ color: "#DC143C" }} />}
              valueStyle={{ color: "#DC143C" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Internships"
              value={stats.activeInternships || 0}
              prefix={<FolderOutlined style={{ color: "#1E3A8A" }} />}
              valueStyle={{ color: "#1E3A8A" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Internships"
              value={stats.totalInternships || 0}
              prefix={<FileTextOutlined style={{ color: "#059669" }} />}
              valueStyle={{ color: "#059669" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Reports"
              value={pendingItems.reports || 0}
              prefix={
                <ExclamationCircleOutlined style={{ color: "#D97706" }} />
              }
              valueStyle={{ color: "#D97706" }}
            />
          </Card>
        </Col>
      </Row>

      {/* System Health */}
      <Card style={{ marginBottom: "32px" }}>
        <Title level={4}>System Health</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div>
              <Text>Database Performance</Text>
              <Progress percent={92} status="active" />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div>
              <Text>API Response Time</Text>
              <Progress percent={85} />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div>
              <Text>User Satisfaction</Text>
              <Progress percent={96} strokeColor="#52c41a" />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Users" key="users">
            <div style={{ marginBottom: "16px" }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={8}>
                  <Input.Search
                    placeholder="Search users..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} md={6}>
                  <Select
                    placeholder="Filter by status"
                    style={{ width: "100%" }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                  >
                    <Option value="active">Active</Option>
                    <Option value="banned">Banned</Option>
                    <Option value="pending">Pending</Option>
                  </Select>
                </Col>
                <Col xs={24} md={10}>
                  <Space>
                    <Button icon={<ReloadOutlined />}>Refresh</Button>
                    <Button icon={<DownloadOutlined />}>Export</Button>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              columns={userColumns}
              dataSource={usersData?.users || []}
              loading={usersLoading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} users`,
              }}
            />
          </TabPane>

          <TabPane tab="Internships" key="internships">
            <div style={{ marginBottom: "16px" }}>
              <Space>
                <Button icon={<ReloadOutlined />}>Refresh</Button>
                <Button icon={<DownloadOutlined />}>Export</Button>
              </Space>
            </div>

            <Table
              columns={internshipColumns}
              dataSource={internshipsData?.internships || []}
              loading={internshipsLoading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} internships`,
              }}
            />
          </TabPane>

          <TabPane tab="Reports" key="reports">
            <List
              loading={reportsLoading}
              dataSource={reportsData?.reports || []}
              locale={{ emptyText: "No reports to review" }}
              renderItem={(report) => (
                <List.Item
                  actions={[
                    <Button key="review" type="primary" size="small" onClick={() => {
                      if (report.type === 'review' && report.review) {
                        openReviewModal(report.review)
                      } else {
                        toast.info('Only review reports can be handled here for now.')
                      }
                    }}>
                      Review
                    </Button>,
                    <Button key="dismiss" size="small">
                      Dismiss
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#DC143C" }}>
                        {report.reporterName?.charAt(0)}
                      </Avatar>
                    }
                    title={report.title}
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{report.description}</Text>
                        <Text type="secondary">
                          Reported by {report.reporterName} •{" "}
                          {dayjs(report.createdAt).fromNow()}
                        </Text>
                      </Space>
                    }
                  />
                  <Tag
                    color={
                      report.priority === "high"
                        ? "red"
                        : report.priority === "medium"
                        ? "orange"
                        : "blue"
                    }
                  >
                    {report.priority?.toUpperCase()}
                  </Tag>
                </List.Item>
              )}
            />
            <ReviewModal
              open={reviewModal.open}
              onCancel={closeReviewModal}
              onSubmit={handleReviewSubmit}
              mode={reviewModal.mode}
              initialValues={{ reason: '' }}
              loading={reviewLoading}
              actions={[
                <Button key="approve" type="primary" loading={reviewLoading} onClick={() => handleModerateReview('approve')}>
                  Approve
                </Button>,
                <Button key="reject" danger loading={reviewLoading} onClick={() => handleModerateReview('reject')}>
                  Reject
                </Button>,
                <Button key="delete" type="default" loading={reviewLoading} onClick={() => handleModerateReview('delete')}>
                  Delete
                </Button>,
                <Button key="cancel" onClick={closeReviewModal}>
                  Cancel
                </Button>
              ]}
            />
            <ReviewModerationModal
              open={moderationModal.open}
              onClose={closeModerationModal}
              review={moderationModal.review}
              mode="moderate"
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
              loading={moderationLoading}
            />
          </TabPane>

          <TabPane tab="Settings" key="settings">
            <Alert
              message="System Settings"
              description="Configure platform-wide settings and preferences."
              type="info"
              style={{ marginBottom: "24px" }}
            />

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Platform Settings">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Text strong>Registration:</Text>
                      <br />
                      <Text>Open to all users</Text>
                    </div>
                    <div>
                      <Text strong>Email Verification:</Text>
                      <br />
                      <Text>Required</Text>
                    </div>
                    <div>
                      <Text strong>Maintenance Mode:</Text>
                      <br />
                      <Text>Disabled</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Security Settings">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Text strong>Two-Factor Auth:</Text>
                      <br />
                      <Text>Optional</Text>
                    </div>
                    <div>
                      <Text strong>Session Timeout:</Text>
                      <br />
                      <Text>24 hours</Text>
                    </div>
                    <div>
                      <Text strong>Password Policy:</Text>
                      <br />
                      <Text>Minimum 6 characters</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* User Details Modal */}
      <Modal
        title="User Details"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserModalVisible(false)}>
            Close
          </Button>,
          selectedUser?.status === "active" ? (
            <Button
              key="ban"
              danger
              onClick={() => {
                handleBanUser(selectedUser.id);
                setUserModalVisible(false);
              }}
            >
              Ban User
            </Button>
          ) : (
            <Button
              key="unban"
              type="primary"
              onClick={() => {
                handleUnbanUser(selectedUser.id);
                setUserModalVisible(false);
              }}
            >
              Unban User
            </Button>
          ),
        ]}
        width={600}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Avatar
                size={80}
                src={selectedUser.avatar}
                style={{ backgroundColor: "#DC143C" }}
              >
                {selectedUser.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div style={{ marginTop: "12px" }}>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedUser.fullName}
                </Title>
                <Text type="secondary">{selectedUser.email}</Text>
                <br />
                <Tag
                  color={
                    selectedUser.role === "admin"
                      ? "red"
                      : selectedUser.role === "business"
                      ? "blue"
                      : "green"
                  }
                >
                  {selectedUser.role?.toUpperCase()}
                </Tag>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text strong>Status:</Text>
                <br />
                <Badge
                  status={
                    selectedUser.status === "active" ? "success" : "error"
                  }
                  text={
                    selectedUser.status?.charAt(0)?.toUpperCase() +
                    selectedUser.status?.slice(1)
                  }
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Joined:</Text>
                <br />
                <Text>
                  {dayjs(selectedUser.createdAt).format("MMMM DD, YYYY")}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Last Login:</Text>
                <br />
                <Text>
                  {selectedUser.lastLogin
                    ? dayjs(selectedUser.lastLogin).fromNow()
                    : "Never"}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Location:</Text>
                <br />
                <Text>{selectedUser.location || "Not specified"}</Text>
              </Col>
            </Row>

            {selectedUser.role === "business" && (
              <div style={{ marginTop: "16px" }}>
                <Text strong>Company Information:</Text>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    background: "#f8fafc",
                    borderRadius: "6px",
                  }}
                >
                  <Text>
                    Company: {selectedUser.companyName || "Not specified"}
                  </Text>
                  <br />
                  <Text>
                    Industry: {selectedUser.industry || "Not specified"}
                  </Text>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPanel;
