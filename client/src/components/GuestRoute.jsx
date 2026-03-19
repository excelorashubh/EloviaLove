import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects logged-in users away from login/signup pages
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default GuestRoute;
