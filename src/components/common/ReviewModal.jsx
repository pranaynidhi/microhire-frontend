import { useEffect } from 'react'
import { Modal, Form, Input, Rate, Button, Typography } from 'antd'
import PropTypes from 'prop-types'

const { TextArea } = Input
const { Text } = Typography

/**
 * ReviewModal - supports add, edit, and report modes for reviews.
 * @param {object} props
 * @param {boolean} props.open - Modal visibility
 * @param {function} props.onCancel - Cancel callback
 * @param {function} props.onSubmit - Submit callback (values)
 * @param {string} props.mode - 'add' | 'edit' | 'report'
 * @param {object} [props.initialValues] - Initial form values
 * @param {boolean} [props.loading] - Loading state for submit
 */
const ReviewModal = ({ open, onCancel, onSubmit, mode, initialValues = {}, loading = false, actions }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues)
    } else {
      form.resetFields()
    }
  }, [open, initialValues, form])

  // Form fields for each mode
  const isReport = mode === 'report'
  const isEdit = mode === 'edit'
  const isAdd = mode === 'add'

  const handleFinish = (values) => {
    onSubmit(values)
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        isAdd ? 'Write a Review' :
        isEdit ? 'Edit Review' :
        isReport ? 'Report Review' : 'Review'
      }
      footer={actions || null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        {isReport ? (
          <Form.Item
            label="Reason for Reporting"
            name="reason"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea rows={4} placeholder="Describe the issue with this review..." />
          </Form.Item>
        ) : (
          <>
            <Form.Item
              label="Rating"
              name="rating"
              rules={[{ required: true, message: 'Please provide a rating' }]}
            >
              <Rate allowClear allowHalf />
            </Form.Item>
            <Form.Item
              label="Comment"
              name="comment"
              rules={[{ required: true, message: 'Please write your review' }]}
            >
              <TextArea rows={4} placeholder="Share your experience..." />
            </Form.Item>
          </>
        )}
        {!actions && (
          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isAdd ? 'Submit Review' : isEdit ? 'Update Review' : 'Submit Report'}
            </Button>
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

ReviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'edit', 'report']).isRequired,
  initialValues: PropTypes.object,
  loading: PropTypes.bool,
  actions: PropTypes.node
}

export default ReviewModal 