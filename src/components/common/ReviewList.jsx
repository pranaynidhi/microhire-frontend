import { List, Card, Button, Typography, Space, Avatar, Tag } from 'antd'
import { FlagOutlined, UserOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import { useAuth } from '../../contexts/AuthContextUtils'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography

const ReviewList = ({ reviews, entityType, entityId, onReportSuccess, onReport }) => {
  const { user } = useAuth()

  return (
    <div>
      <List
        dataSource={reviews}
        renderItem={review => (
          <List.Item
            actions={
              user?.id !== review.userId && onReport
                ? [
                    <Button
                      key="report"
                      type="text"
                      icon={<FlagOutlined style={{ color: '#DC143C' }} />}
                      onClick={() => onReport(review)}
                    >
                      Report
                    </Button>
                  ]
                : []
            }
            style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
          >
            <List.Item.Meta
              avatar={
                <Avatar src={review.userAvatar} icon={<UserOutlined />} style={{ backgroundColor: '#DC143C' }} />
              }
              title={
                <Space>
                  <Text strong>{review.userName}</Text>
                  <Tag color="blue" style={{ marginLeft: 8 }}>{review.rating}★</Tag>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(review.createdAt).fromNow()}</Text>
                </Space>
              }
              description={<Paragraph style={{ margin: 0 }}>{review.comment}</Paragraph>}
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No reviews yet' }}
      />
    </div>
  )
}

ReviewList.propTypes = {
  reviews: PropTypes.array.isRequired,
  entityType: PropTypes.string, // e.g., 'user', 'internship', 'company'
  entityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onReportSuccess: PropTypes.func,
  onReport: PropTypes.func // callback for reporting a review
}

export default ReviewList 