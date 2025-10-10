import { useAuth } from "../context/auth/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 text-lg">Authenticating...</p>
    </div>
  </div>
);

// eslint-disable-next-line react/prop-types
const ProtectedRoutes = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("🔒 ProtectedRoutes - isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "user:", user);

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("❌ User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user object exists
  if (!user) {
    console.log("❌ No user object found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check user role/type
  const userRole = user.type || user.role;
  console.log("🔍 Checking user role:", userRole, "against allowed roles:", allowedRoles);

  // eslint-disable-next-line react/prop-types
  if (!allowedRoles.includes(userRole)) {
    console.log("❌ User role not authorized, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ User authorized, rendering protected content");
  return <Outlet />;
};

export default ProtectedRoutes;
