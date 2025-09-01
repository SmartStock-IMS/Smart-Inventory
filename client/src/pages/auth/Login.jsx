import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaUser, FaLock, FaShieldAlt } from "react-icons/fa";
import { cn } from "@lib/utils";


const SalesRepLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // login form input data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      alert("Login successful!");
    }, 2000);
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
          {/* develop branch
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/10 rounded-full blur-lg animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-500/10 rounded-full blur-lg animate-bounce delay-2000"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Inventory Pro
          </h1>
          <p className="text-gray-300 text-sm">
            Smart Inventory Management System
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-300 text-sm">Sign in to access your dashboard</p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-600 bg-white/10" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center justify-center py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-white font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02]">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <div className="ml-2 transform group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </>
                  )}
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                  Contact Admin
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>© 2025 Inventory Pro. All rights reserved.</p>
        </div>
      </div> */}
           

    </div>
  );
};

export default SalesRepLogin;