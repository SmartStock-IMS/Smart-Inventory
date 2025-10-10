import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaUser, FaLock, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { cn } from "@lib/utils";
import { getDashboardUrl } from "../../utils/authUtils.js";
import axios from "axios";

const SalesRepLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // login form input data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("🔄 Starting login process...");
      // Use the AuthContext login function for proper state management
      const result = await login(email, password);
      
      console.log("🔄 Login result:", result);
      
      if (result && result.success) {
        console.log("✅ Login successful!");
        toast.success("Login successful!");
        
        // Extract user data from the result
        const userData = result.user?.user || result.user;
        const role = userData?.role || userData?.type;
        
        console.log("🔄 User role:", role, "User data:", userData);
        
        // Use utility function to get the appropriate dashboard URL
        const dashboardUrl = getDashboardUrl(role);
        console.log("🔄 Redirecting user to:", dashboardUrl, "based on role:", role);
        
        // Navigate to the appropriate dashboard
        navigate(dashboardUrl, { replace: true });
      } else {
        console.error("❌ Login failed:", result);
        toast.error(result?.message || "Login failed");
      }
    } catch (error) {
      toast.error("Server error or invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-60"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 shadow-2xl">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Smart Stock
            </h1>
            <p className="text-gray-400 text-base">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="relative">
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl blur-xl opacity-20"></div>
            
            {/* Main card */}
            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full relative group mt-8"
                  disabled={isLoading}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition duration-300 group-disabled:opacity-40"></div>
                  <div className={cn(
                    "relative flex items-center justify-center py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl text-white font-semibold transition-all duration-300",
                    {
                      "cursor-not-allowed opacity-70": isLoading,
                      "transform group-hover:scale-[1.02]": !isLoading,
                    }
                  )}>
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-3 text-lg" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Footer Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  Need help?{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              © 2025 Smart Stock. All rights reserved.
            </p>
          </div>
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
        theme="dark"
      />
    </div>
  );
};

export default SalesRepLogin;