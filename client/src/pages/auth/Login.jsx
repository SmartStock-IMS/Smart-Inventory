import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaUser, FaLock, FaShieldAlt } from "react-icons/fa";
import { cn } from "@lib/utils";

const SalesRepLogin = () => {
  const { login } = useAuth(); // context login(username, password) function
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // login form input data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const isAuthenticated = await login(email, password);
    if (isAuthenticated) {
      toast.success("Login successful");
      setTimeout(() => {
        if (isAuthenticated.data.user_type === "002") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
        setIsLoading(false);
      }, 3000);
    } else {
      setTimeout(() => {
        toast.error("Login failed");
        setIsLoading(false);
      }, 3000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Welcome Back</h1>
          <p className="text-blue-600">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email Address
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-blue-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-300 outline-none transition-colors text-gray-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-blue-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-300 outline-none transition-colors text-gray-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={cn(
                "w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2",
                {
                  "bg-blue-400 cursor-not-allowed": isLoading,
                  "bg-blue-700 hover:bg-blue-800 active:bg-blue-800 hover:shadow-lg": !isLoading,
                }
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

      </div>

      <ToastContainer 
        autoClose={3000}
        position="top-right"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default SalesRepLogin;