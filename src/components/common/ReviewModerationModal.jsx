import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import PropTypes from 'prop-types';

const { Text } = Typography;

const ReviewModerationModal = ({
  open,
  onClose,
  review,
  mode, // 'moderate' | 'report'
  onApprove,
  onReject,
  onDelete,
  onReport,
  loading,
  actions
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={mode === 'moderate' ? 'Moderate Review' : 'Report Review'}
      footer={actions || null}
      destroyOnHidden
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text strong>Reviewer:</Text>
        <Text>{review?.userName || review?.reviewerName || 'Unknown'}</Text>
        <Text strong>Rating:</Text>
        <Text>{review?.rating} ★</Text>
        <Text strong>Comment:</Text>
        <Text>{review?.comment}</Text>
        {mode === 'moderate' && (
          <Space style={{ marginTop: 24 }}>
            <Button type="primary" onClick={onApprove} loading={loading}>
              Approve
            </Button>
            <Button danger onClick={onReject} loading={loading}>
              Reject
            </Button>
            <Button type="default" onClick={onDelete} loading={loading}>
              Delete
            </Button>
          </Space>
        )}
        {mode === 'report' && (
          <Space style={{ marginTop: 24 }}>
            <Button type="primary" onClick={onReport} loading={loading}>
              Report
            </Button>
          </Space>
        )}
      </Space>
    </Modal>
  );
};

ReviewModerationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  review: PropTypes.object,
  mode: PropTypes.oneOf(['moderate', 'report']).isRequired,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onDelete: PropTypes.func,
  onReport: PropTypes.func,
  loading: PropTypes.bool,
  actions: PropTypes.node
};

export default ReviewModerationModal; 