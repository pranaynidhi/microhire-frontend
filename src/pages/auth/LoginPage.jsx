import { useState, useRef } from "react";
import { Form, Input, Button, Card, Typography, Space, Divider, Modal } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  GithubOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContextUtils";
import { motion } from "framer-motion";
import TwoFactorVerify from "../../components/auth/TwoFactorVerify";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAData, setTwoFAData] = useState({
    email: '',
    tempToken: ''
  });
  const formRef = useRef();
  const { login, verify2FALogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);
      
      if (result.twoFARequired) {
        // Show 2FA verification modal
        setTwoFAData({
          email: result.email,
          tempToken: result.tempToken
        });
        setShow2FAModal(true);
        return;
      }
      
      if (result.success) {
        // Get user from context after successful login
        const userData = result.user || JSON.parse(localStorage.getItem("user"));

        // Redirect admin users to admin panel, others to dashboard
        if (userData?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled by the login function
    } finally {
      setLoading(false);
    }
  };
  
  const handle2FASuccess = (result) => {
    if (result.accessToken) {
      // Save token to localStorage
      localStorage.setItem("token", result.accessToken);
      // Optionally, save refreshToken as well
      // localStorage.setItem("refreshToken", result.refreshToken);
      console.log('2FA Success:', result);
      setShow2FAModal(false);
      setTwoFAData({ email: '', tempToken: '' });
      navigate("/dashboard");
    }
  };
  
  const handle2FACancel = () => {
    // Show confirmation before canceling 2FA
    Modal.confirm({
      title: 'Cancel Two-Factor Authentication',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to cancel two-factor authentication? You will need to log in again.',
      okText: 'Yes, cancel',
      cancelText: 'No, continue',
      onOk: () => {
        setShow2FAModal(false);
        setTwoFAData({ email: '', tempToken: '' });
        // Reset form
        if (formRef.current) {
          formRef.current.resetFields();
        }
      }
    });
  };
  
  const handleRecoveryCodeClick = () => {
    // This would typically navigate to a recovery page or show recovery options
    Modal.info({
      title: 'Recovery Options',
      content: (
        <div>
          <p>If you've lost access to your authenticator app, you can use a recovery code.</p>
          <p>Please enter your recovery code in the verification field.</p>
        </div>
      ),
      okText: 'Got it',
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Logo and Title */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #DC143C 0%, #1E3A8A 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "white",
                fontWeight: "bold",
                fontSize: "24px",
              }}
            >
              MH
            </div>
            <Title level={2} style={{ margin: 0, marginBottom: "8px" }}>
              Welcome Back
            </Title>
            <Text style={{ color: "#666" }}>
              Sign in to your MicroHire account
            </Text>
          </div>

          <Form
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            ref={formRef}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email address"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Link to="/forgot-password" style={{ color: "#DC143C" }}>
              Forgot your password?
            </Link>
          </div>

          <Divider>
            <Text style={{ color: "#999", fontSize: "12px" }}>
              OR CONTINUE WITH
            </Text>
          </Divider>

          <Space style={{ width: "100%" }} direction="vertical" size="middle">
            <Button
              icon={<GoogleOutlined />}
              block
              size="large"
              style={{
                borderRadius: "8px",
                height: "48px",
                border: "1px solid #e5e7eb",
              }}
            >
              Continue with Google
            </Button>
            <Button
              icon={<GithubOutlined />}
              block
              size="large"
              style={{
                borderRadius: "8px",
                height: "48px",
                border: "1px solid #e5e7eb",
              }}
            >
              Continue with GitHub
            </Button>
          </Space>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Text
              style={{ fontSize: "14px", color: "#666", textAlign: "center" }}
            >
              Don&apos;t have an account?{" "}
              <Button
                type="link"
                onClick={() => navigate("/register")}
                style={{ padding: 0 }}
              >
                Sign up here
              </Button>
            </Text>
          </div>
        </Card>
      </motion.div>
      
      {/* 2FA Verification Modal */}
      <TwoFactorVerify
        visible={show2FAModal}
        email={twoFAData.email}
        onSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
        onUseRecoveryCode={handleRecoveryCodeClick}
        loading={loading}
      />
    </div>
  );
};

export default LoginPage;
