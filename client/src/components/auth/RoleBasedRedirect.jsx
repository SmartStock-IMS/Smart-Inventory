import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";
import { getDashboardUrl } from "../../utils/authUtils";

/**
 * Component that redirects users to their role-appropriate dashboard
 * Useful for handling root route access
 */
const RoleBasedRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Get the appropriate dashboard URL for the user's role
  const dashboardUrl = getDashboardUrl(user.type || user.role);
  
  console.log("🔄 RoleBasedRedirect - Redirecting user to:", dashboardUrl, "based on role:", user.type || user.role);
  
  return <Navigate to={dashboardUrl} replace />;
};

export default RoleBasedRedirect;