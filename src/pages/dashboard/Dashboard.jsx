import { useAuth } from '../../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import BusinessDashboard from './BusinessDashboard';
import AdminDashboard from './AdminDashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Render role-specific dashboard
  switch (user?.role) {
    case 'student':
      return <StudentDashboard />;
    case 'business':
      return <BusinessDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default Dashboard;
