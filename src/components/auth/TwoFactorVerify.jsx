import React, { useState, useEffect } from 'react';
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
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setToken('');
      setError('');
      setShowRecovery(false);
      setRecoveryCode('');
      setAttempts(0);
      setLockoutTime(0);
    }
  }, [visible]);

  // Check if user is locked out
  const isLockedOut = lockoutTime > Date.now();

  const handleVerify = async () => {
    if (isLockedOut) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
      setError(`Too many attempts. Please wait ${remainingTime} seconds before trying again.`);
      return;
    }

    if (!token || token.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await twoFactorAPI.verifyLogin(email, token);
      
      if (response.data?.success && response.data?.data?.accessToken) {
        onSuccess(response.data.data);
      } else {
        setError('Invalid verification code. Please try again.');
        setAttempts(prev => prev + 1);
        
        // Lock out after 5 attempts for 5 minutes
        if (attempts >= 4) {
          setLockoutTime(Date.now() + 5 * 60 * 1000); // 5 minutes
          setError('Too many failed attempts. Please wait 5 minutes before trying again.');
        }
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to verify code. Please try again.';
      setError(errorMessage);
      setAttempts(prev => prev + 1);
      
      // Lock out after 5 attempts for 5 minutes
      if (attempts >= 4) {
        setLockoutTime(Date.now() + 5 * 60 * 1000); // 5 minutes
        setError('Too many failed attempts. Please wait 5 minutes before trying again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryCode = async () => {
    if (isLockedOut) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
      setError(`Too many attempts. Please wait ${remainingTime} seconds before trying again.`);
      return;
    }

    if (!recoveryCode || recoveryCode.trim() === '') {
      setError('Please enter a recovery code');
      return;
    }

    try {
      setRecoveryLoading(true);
      setError('');
      
      const response = await twoFactorAPI.verifyRecoveryCode(email, recoveryCode.trim());
      
      if (response.data?.success && response.data?.data?.accessToken) {
        onSuccess(response.data.data);
      } else {
        setError('Invalid recovery code. Please try again.');
        setAttempts(prev => prev + 1);
        
        // Lock out after 5 attempts for 5 minutes
        if (attempts >= 4) {
          setLockoutTime(Date.now() + 5 * 60 * 1000); // 5 minutes
          setError('Too many failed attempts. Please wait 5 minutes before trying again.');
        }
      }
    } catch (error) {
      console.error('Recovery code error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to verify recovery code. Please try again.';
      setError(errorMessage);
      setAttempts(prev => prev + 1);
      
      // Lock out after 5 attempts for 5 minutes
      if (attempts >= 4) {
        setLockoutTime(Date.now() + 5 * 60 * 1000); // 5 minutes
        setError('Too many failed attempts. Please wait 5 minutes before trying again.');
      }
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResendCode = () => {
    // In a real app, you might want to implement a resend code functionality
    message.info('A new code has been sent to your authenticator app');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showRecovery) {
        handleRecoveryCode();
      } else {
        handleVerify();
      }
    }
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
          onKeyPress={handleKeyPress}
          disabled={isLockedOut}
        />
      </div>

      <Button 
        type="primary" 
        block 
        size="large"
        onClick={handleVerify}
        loading={loading || externalLoading}
        disabled={isLockedOut}
        style={{ marginBottom: 16 }}
      >
        Verify & Continue
      </Button>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <Button 
          type="link" 
          onClick={handleResendCode}
          icon={<ReloadOutlined />}
          disabled={loading || externalLoading || isLockedOut}
        >
          Resend Code
        </Button>
      </div>

      <Divider>or</Divider>

      <Button 
        type="text" 
        onClick={() => setShowRecovery(true)}
        disabled={loading || externalLoading || isLockedOut}
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
          onKeyPress={handleKeyPress}
          style={{ height: 40, textAlign: 'center', letterSpacing: 1 }}
          autoFocus
          disabled={isLockedOut}
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
          disabled={recoveryLoading || externalLoading || isLockedOut}
        >
          Back
        </Button>
        <Button 
          type="primary" 
          block
          onClick={handleRecoveryCode}
          loading={recoveryLoading || externalLoading}
          disabled={isLockedOut}
        >
          Verify Recovery Code
        </Button>
      </div>

      <Button 
        type="link" 
        onClick={onUseRecoveryCode}
        disabled={recoveryLoading || externalLoading || isLockedOut}
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
