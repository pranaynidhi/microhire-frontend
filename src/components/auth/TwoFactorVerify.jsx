import React, { useState } from 'react';
import { Modal, Button, Typography, Input, Alert, Space, Divider, message } from 'antd';
import { KeyOutlined, ReloadOutlined, LockOutlined } from '@ant-design/icons';
import { twoFactorAPI } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const TwoFactorVerify = ({ 
  visible, 
  email,
  onSuccess,
  onCancel,
  onUseRecoveryCode,
  loading: externalLoading
}) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await twoFactorAPI.verifyLogin(email, token);
      
      if (response.data && response.data.data && response.data.data.accessToken) {
        onSuccess(response.data.data);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setError(error.response?.data?.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryCode = async () => {
    if (!recoveryCode || recoveryCode.trim() === '') {
      setError('Please enter a recovery code');
      return;
    }

    try {
      setRecoveryLoading(true);
      setError('');
      
      const response = await twoFactorAPI.verifyRecoveryCode(email, recoveryCode.trim());
      
      if (response.data && response.data.data && response.data.data.accessToken) {
        onSuccess(response.data.data);
      } else {
        setError('Invalid recovery code. Please try again.');
      }
    } catch (error) {
      console.error('Recovery code error:', error);
      setError(error.response?.data?.message || 'Failed to verify recovery code. Please try again.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResendCode = () => {
    // In a real app, you might want to implement a resend code functionality
    message.info('A new code has been sent to your authenticator app');
  };

  const renderVerificationForm = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <LockOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
        <Title level={4} style={{ marginBottom: 8 }}>Two-Factor Authentication</Title>
        <Text type="secondary">
          Enter the 6-digit code from your authenticator app
        </Text>
      </div>

      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 24, textAlign: 'left' }}
          closable
          onClose={() => setError('')}
        />
      )}

      <div style={{ marginBottom: 24 }}>
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

      <Button 
        type="primary" 
        block 
        size="large"
        onClick={handleVerify}
        loading={loading || externalLoading}
        style={{ marginBottom: 16 }}
      >
        Verify & Continue
      </Button>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <Button 
          type="link" 
          onClick={handleResendCode}
          icon={<ReloadOutlined />}
          disabled={loading || externalLoading}
        >
          Resend Code
        </Button>
      </div>

      <Divider>or</Divider>

      <Button 
        type="text" 
        onClick={() => setShowRecovery(true)}
        disabled={loading || externalLoading}
      >
        Use a recovery code
      </Button>
    </div>
  );

  const renderRecoveryForm = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <KeyOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 16 }} />
        <Title level={4} style={{ marginBottom: 8 }}>Use Recovery Code</Title>
        <Text type="secondary">
          Enter one of your recovery codes to sign in
        </Text>
      </div>

      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 24, textAlign: 'left' }}
          closable
          onClose={() => setError('')}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <Input
          placeholder="Enter recovery code"
          value={recoveryCode}
          onChange={(e) => setRecoveryCode(e.target.value)}
          style={{ height: 40, textAlign: 'center', letterSpacing: 1 }}
          autoFocus
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Button 
          block 
          onClick={() => {
            setShowRecovery(false);
            setRecoveryCode('');
            setError('');
          }}
          disabled={recoveryLoading || externalLoading}
        >
          Back
        </Button>
        <Button 
          type="primary" 
          block
          onClick={handleRecoveryCode}
          loading={recoveryLoading || externalLoading}
        >
          Verify Recovery Code
        </Button>
      </div>

      <Button 
        type="link" 
        onClick={onUseRecoveryCode}
        disabled={recoveryLoading || externalLoading}
      >
        Lost your recovery codes?
      </Button>
    </div>
  );

  return (
    <Modal
      title="Two-Factor Authentication Required"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
      closable={!loading && !recoveryLoading && !externalLoading}
      maskClosable={false}
    >
      {!showRecovery ? renderVerificationForm() : renderRecoveryForm()}
    </Modal>
  );
};

export default TwoFactorVerify;
