import { useState } from "react";
import { Alert, Button, Space, Typography } from "antd";
import {
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContextUtils";
import { testConnection } from "../../services/api";

const { Text } = Typography;

const BackendStatus = () => {
  const { backendConnected } = useAuth();
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const result = await testConnection();
      setLastCheck(new Date());
      if (result.success) {
        window.location.reload(); // Reload to update connection status
      }
    } catch (error) {
      console.error("Connection check failed:", error);
    } finally {
      setChecking(false);
    }
  };

  if (backendConnected) {
    return null; // Don't show anything if backend is connected
  }

  return (
    <Alert
      message="Backend Not Connected"
      description={
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>
            The frontend is running in test mode. Some features may be limited.
            Make sure your backend server is running on{" "}
            <code>http://localhost:5000</code>
          </Text>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={checkConnection}
              loading={checking}
              size="small"
            >
              Check Connection
            </Button>
            {lastCheck && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Last checked: {lastCheck.toLocaleTimeString()}
              </Text>
            )}
          </Space>
        </Space>
      }
      type="warning"
      showIcon
      icon={<ExclamationCircleOutlined />}
      style={{
        margin: "16px 24px",
        borderRadius: "8px",
      }}
      closable
    />
  );
};

export default BackendStatus;
