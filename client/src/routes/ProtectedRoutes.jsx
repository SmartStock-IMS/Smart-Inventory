import { useAuth } from "../context/auth/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProtectedRoutes = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  console.log("protected user: ", user);
  // Handle both lowercase and uppercase role values
  const userRole = user.type?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
  
  // eslint-disable-next-line react/prop-types
  if (!normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
