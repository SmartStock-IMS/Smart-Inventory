import { useAuth } from "../../context/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const LogoutButton = ({ className = "", showIcon = true, children = "Logout" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data
    logout();
    
    // Redirect to login page
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center justify-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 ${className}`}
      title="Logout"
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

export default LogoutButton;