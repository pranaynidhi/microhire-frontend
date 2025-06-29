import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContextUtils'
import LoadingSpinner from './LoadingSpinner'
import PropTypes from 'prop-types'

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string)
}

export default ProtectedRoute