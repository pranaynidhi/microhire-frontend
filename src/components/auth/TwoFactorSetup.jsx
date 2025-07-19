import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Input, QRCode, Alert, Divider, Space, message } from 'antd';
import { CheckCircleTwoTone, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { twoFactorAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

const TwoFactorSetup = ({ visible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Show QR, 2: Verify token, 3: Show recovery codes
  const [qrCodeData, setQrCodeData] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const { user } = useAuth();

  // Initialize 2FA setup
  useEffect(() => {
    if (visible && step === 1) {
      start2FASetup();
    }
  }, [visible, step]);

  const start2FASetup = async () => {
    try {
      setLoading(true);
      const response = await twoFactorAPI.setup2FA();
      setQrCodeData(response.data.qrCodeUrl);
      setSecret(response.data.secret);
    } catch (error) {
      message.error('Failed to start 2FA setup. Please try again.');
      console.error('2FA setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!token || token.length !== 6) {
      message.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await twoFactorAPI.verify2FA(token);
      setRecoveryCodes(response.data.recoveryCodes);
      setStep(3); // Move to recovery codes step
      message.success('Two-factor authentication enabled successfully!');
    } catch (error) {
      message.error('Invalid verification code. Please try again.');
      console.error('2FA verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onSuccess && onSuccess();
    onClose();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const downloadRecoveryCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'microhire-recovery-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderStep1 = () => (
    <div style={{ textAlign: 'center' }}>
      <Title level={4} style={{ marginBottom: 16 }}>Set Up Two-Factor Authentication</Title>
      <Paragraph>
        Scan the QR code below with your authenticator app, then enter the 6-digit code to verify.
      </Paragraph>
      
      <div style={{ margin: '24px 0', display: 'flex', justifyContent: 'center' }}>
        {qrCodeData ? (
          <QRCode value={qrCodeData} size={200} />
        ) : (
          <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #d9d9d9', borderRadius: 8 }}>
            Loading QR code...
          </div>
        )}
      </div>

      <div style={{ margin: '16px 0', textAlign: 'left' }}>
        <Text strong>Can't scan the QR code?</Text>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input.Password
            value={secret}
            readOnly
            style={{ flex: 1 }}
            addonAfter={
              <Button 
                type="text" 
                icon={<CopyOutlined />} 
                onClick={() => copyToClipboard(secret)}
                size="small"
              />
            }
          />
        </div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
          Enter this code manually in your authenticator app
        </Text>
      </div>

      <div style={{ marginTop: 24 }}>
        <Button type="primary" onClick={() => setStep(2)}>
          I've scanned the QR code
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ textAlign: 'center' }}>
      <Title level={4} style={{ marginBottom: 16 }}>Verify Your Authenticator App</Title>
      <Paragraph>
        Enter the 6-digit code from your authenticator app to complete setup.
      </Paragraph>
      
      <div style={{ margin: '24px 0' }}>
        <Input.OTP
          length={6}
          value={token}
          onChange={setToken}
          inputType="numeric"
          inputStyle={{
            width: 40,
            height: 40,
            fontSize: 18,
            textAlign: 'center',
            margin: '0 4px',
          }}
        />
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <Button onClick={() => setStep(1)}>Back</Button>
        <Button 
          type="primary" 
          onClick={handleVerifyToken}
          loading={loading}
          disabled={!token || token.length !== 6}
        >
          Verify & Enable
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 48, marginBottom: 16 }} />
        <Title level={4}>Two-Factor Authentication Enabled</Title>
        <Paragraph>
          You've successfully enabled two-factor authentication for your account.
        </Paragraph>
      </div>

      <Alert
        type="warning"
        showIcon
        message="Save Your Recovery Codes"
        description={
          <div>
            <p>Store these recovery codes in a safe place. You can use them to access your account if you lose access to your authenticator app.</p>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', margin: '12px 0' }}>
              {recoveryCodes.map((code, index) => (
                <div key={index} style={{ fontFamily: 'monospace', margin: '4px 0' }}>{code}</div>
              ))}
            </div>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={downloadRecoveryCodes}
              >
                Download
              </Button>
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => copyToClipboard(recoveryCodes.join('\n'))}
              >
                Copy
              </Button>
            </Space>
          </div>
        }
        style={{ marginBottom: 24 }}
      />

      <div style={{ textAlign: 'center' }}>
        <Button type="primary" onClick={handleComplete}>
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      title={step === 1 ? 'Set Up 2FA' : step === 2 ? 'Verify Authenticator' : '2FA Enabled'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      destroyOnClose
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderRecoveryCodes()}
    </Modal>
  );
};

export default TwoFactorSetup;
