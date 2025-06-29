import { Spin } from 'antd'
import PropTypes from 'prop-types'

const LoadingSpinner = ({ size = 'large', tip = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      width: '100%'
    }}>
      <Spin size={size} />
      {tip && (
        <div style={{ 
          marginTop: '16px', 
          color: '#666', 
          fontSize: '14px' 
        }}>
          {tip}
        </div>
      )}
    </div>
  )
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  tip: PropTypes.string
}

export default LoadingSpinner