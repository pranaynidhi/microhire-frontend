import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Switch, 
  Button, 
  Alert, 
  Space, 
  Divider, 
  List, 
  Modal, 
  Tooltip,
  message
} from 'antd';
import { 
  LockOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContextUtils';
import TwoFactorSetup from '../../components/auth/TwoFactorSetup';
import { twoFactorAPI } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const SecuritySettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);

  // Check if 2FA is enabled
  const is2FAEnabled = user?.twoFAEnabled || false;

  // Handle 2FA toggle
  const handle2FAToggle = async (checked) => {
    if (checked) {
      // Show 2FA setup modal
      setShow2FASetup(true);
    } else {
      // Show confirmation before disabling 2FA
      Modal.confirm({
        title: 'Disable Two-Factor Authentication',
        icon: <ExclamationCircleOutlined />,
        content: 'Are you sure you want to disable two-factor authentication? This will reduce the security of your account.',
        okText: 'Disable',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: disable2FA
      });
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    try {
      setLoading(true);
      await twoFactorAPI.disable2FA();
      
      // Update user context
      updateUser({ twoFAEnabled: false });
      message.success('Two-factor authentication has been disabled');
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      message.error('Failed to disable two-factor authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful 2FA setup
  const handle2FASetupComplete = (codes) => {
    setRecoveryCodes(codes);
    setShowRecoveryCodes(true);
    setShow2FASetup(false);
    
    // Update user context
    updateUser({ twoFAEnabled: true });
    
    message.success('Two-factor authentication has been enabled successfully!');
  };

  // Generate new recovery codes
  const generateNewRecoveryCodes = async () => {
    try {
      setRegeneratingCodes(true);
      const response = await twoFactorAPI.generateRecoveryCodes();
      setRecoveryCodes(response.data.recoveryCodes);
      setShowRecoveryCodes(true);
      message.success('New recovery codes generated successfully');
    } catch (error) {
      console.error('Failed to generate recovery codes:', error);
      message.error('Failed to generate new recovery codes. Please try again.');
    } finally {
      setRegeneratingCodes(false);
    }
  };

  // Copy recovery codes to clipboard
  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    message.success('Recovery codes copied to clipboard');
  };

  // Download recovery codes as a text file
  const downloadRecoveryCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'microhire-recovery-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Security Settings</Title>
      
      <Card 
        title={
          <Space>
            <LockOutlined />
            <span>Two-Factor Authentication (2FA)</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
        extra={
          <Tooltip title={is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}>
            <Switch 
              checked={is2FAEnabled} 
              onChange={handle2FAToggle}
              loading={loading}
            />
          </Tooltip>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Status: </Text>
          {is2FAEnabled ? (
            <span style={{ color: '#52c41a' }}>
              <CheckCircleOutlined /> Enabled
            </span>
          ) : (
            <span style={{ color: '#faad14' }}>
              <ExclamationCircleOutlined /> Disabled
            </span>
          )}
        </div>
        
        <Paragraph type="secondary">
          Two-factor authentication adds an extra layer of security to your account by 
          requiring more than just a password to log in.
        </Paragraph>
        
        {is2FAEnabled && (
          <div style={{ marginTop: 16 }}>
            <Button 
              type="link" 
              onClick={() => setShowRecoveryCodes(true)}
              style={{ padding: 0 }}
            >
              View recovery codes
            </Button>
            
            <Divider type="vertical" />
            
            <Button 
              type="link" 
              onClick={generateNewRecoveryCodes}
              loading={regeneratingCodes}
              icon={<ReloadOutlined />}
              style={{ padding: 0 }}
            >
              Generate new codes
            </Button>
          </div>
        )}
      </Card>
      
      <Card title="Recent Security Activity" style={{ marginBottom: 24 }}>
        <List
          size="small"
          dataSource={[
            `Last login: ${user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Unknown'}`,
            `Account created: ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}`,
            `Two-factor authentication: ${is2FAEnabled ? 'Enabled' : 'Disabled'}`
          ]}
          renderItem={item => (
            <List.Item>
              {item}
            </List.Item>
          )}
        />
      </Card>
      
      <Alert
        type="info"
        showIcon
        message="Security Tips"
        description={
          <div>
            <p>• Use a strong, unique password for your account</p>
            <p>• Enable two-factor authentication for added security</p>
            <p>• Never share your password or verification codes with anyone</p>
            <p>• Be cautious of suspicious emails or messages asking for your credentials</p>
          </div>
        }
        style={{ marginBottom: 24 }}
      />
      
      {/* 2FA Setup Modal */}
      <TwoFactorSetup
        visible={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        onSuccess={handle2FASetupComplete}
      />
      
      {/* Recovery Codes Modal */}
      <Modal
        title="Recovery Codes"
        open={showRecoveryCodes}
        onCancel={() => setShowRecoveryCodes(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={copyRecoveryCodes}>
            Copy
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={downloadRecoveryCodes}
          >
            Download
          </Button>,
        ]}
      >
        <Alert
          type="warning"
          showIcon
          message="Save these recovery codes"
          description="These codes can be used to access your account if you lose access to your authenticator app. Each code can only be used once."
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ 
          background: '#f5f5f5', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px',
          textAlign: 'center',
          fontFamily: 'monospace',
          lineHeight: '2'
        }}>
          {recoveryCodes.map((code, index) => (
            <div key={index}>{code}</div>
          ))}
        </div>
        
        <Text type="secondary">
          Store these codes in a secure place. If you lose your device and don't have the recovery codes, you may lose access to your account.
        </Text>
      </Modal>
    </div>
  );
};

export default SecuritySettings;
