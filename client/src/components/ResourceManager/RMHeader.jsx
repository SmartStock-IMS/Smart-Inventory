import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu } from "react-icons/hi";
import { HiX } from "react-icons/hi";
import { BellIcon, UserIcon, SunIcon, MoonIcon, Sparkles, LogOut, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useTheme } from "../../context/theme/ThemeContext";
import { useAuth } from "../../context/auth/AuthContext";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const navItems = [
  { id: "1", title: "Dashboard", url: "/resourcemanager" },
  { id: "2", title: "Resources", url: "/resourcemanager/resources" },
  { id: "3", title: "Orders", url: "/resourcemanager/orders" },
  { id: "4", title: "Vehicles", url: "/resourcemanager/vehicles" },
];

const RMHeader = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const pathname = useLocation();
  const navigate = useNavigate();
  const [openNavigation, setOpenNavigation] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNavigation = () => {
    setOpenNavigation(!openNavigation);
  };

  useEffect(() => {
    setOpenNavigation(false);
  }, [pathname]);

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 },
  };

  const handleNavigation = (id, url) => {
    navigate(url); // navigate to url
  };

  function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return "RM001";
    try {
      const payload = jwtDecode(token);
      return payload.id || "RM001";
    } catch {
      return "RM001";
    }
  }

  async function fetchNotifications() {
    const userId = getUserIdFromToken();
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/users/notifications/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const fetchedNotifications = res.data.data || [];
      setNotifications(fetchedNotifications);
      const unread = fetchedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function handleNotificationsClick() {
    await fetchNotifications();
    setShowNotifications((prev) => !prev);
    if (!showNotifications) {
      setUnreadCount(0);
      const userId = getUserIdFromToken();
      try {
        await axios.put(
          `${import.meta.env.VITE_URL}/api/users/notifications/${userId}/read`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-0 w-full z-50 shadow-lg"
    >
      {/* Header with InventoryManager style */}
      <div className={`h-full w-full transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      } border-b shadow-sm`}>
        <nav className="h-20 px-6 sm:px-8 lg:px-12 flex items-center justify-between gap-4 sm:gap-6">
          {/* Logo/Brand Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Smart Stock
              </h1>
              <p className={`text-xs transition-colors duration-300 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>Management System</p>
            </div>
          </div>

          {/* Right Section: Prioritized for Mobile/Tablet */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
            {/* Tablet Navigation - Show on medium screens and up */}
            <nav className="hidden md:flex items-center space-x-2 lg:space-x-3">
              {navItems.map((item) => (
                <motion.a
                  key={item.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ${
                    item.url === pathname.pathname
                      ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg"
                      : isDarkMode 
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  onClick={() => handleNavigation(item.id, item.url)}
                >
                  {item.url === pathname.pathname && (
                    <motion.div
                      layoutId="activeTabRM"
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg shadow-lg"
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span className="relative z-10">{item.title}</span>
                </motion.a>
              ))}
            </nav>

            {/* Dark/Light Mode Toggle - Always visible */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 group ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5 text-gray-400 group-hover:text-yellow-500 transition-colors duration-200" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-500 transition-colors duration-200" />
              )}
            </button>

            {/* Notifications - Always visible */}
            <div className="relative">
              <button 
                className={`p-2 rounded-lg transition-colors duration-200 relative group ${
                  isDarkMode 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={handleNotificationsClick}
              >
                <BellIcon className={`h-5 w-5 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 group-hover:text-blue-400' 
                    : 'text-gray-600 group-hover:text-blue-500'
                }`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {/* Notification dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-2xl border backdrop-blur-sm overflow-hidden z-50 ${
                  isDarkMode 
                    ? 'bg-gray-800/95 border-gray-700' 
                    : 'bg-white/95 border-gray-200'
                }`}>
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <h3 className={`font-semibold text-sm ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Notifications
                      {notifications.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-blue-500">
                          ({notifications.length})
                        </span>
                      )}
                    </h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className={`p-1 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <BellIcon className={`h-12 w-12 mx-auto mb-3 ${
                          isDarkMode ? 'text-gray-600' : 'text-gray-300'
                        }`} />
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notif, idx) => (
                          <li 
                            key={idx} 
                            className={`p-4 transition-colors cursor-pointer ${
                              isDarkMode 
                                ? 'hover:bg-gray-700/50' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                notif.type === 'success' 
                                  ? 'bg-green-500/10 text-green-500' 
                                  : notif.type === 'warning' 
                                  ? 'bg-yellow-500/10 text-yellow-500'
                                  : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {notif.type === 'success' ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : notif.type === 'warning' ? (
                                  <AlertCircle className="h-4 w-4" />
                                ) : (
                                  <Info className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium mb-1 ${
                                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                  {notif.title || 'Notification'}
                                </p>
                                <p className={`text-xs mb-2 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {notif.message || JSON.stringify(notif)}
                                </p>
                                {notif.time && (
                                  <p className={`text-xs ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                    {notif.time}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className={`px-4 py-3 border-t ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <button className={`w-full text-center text-xs font-medium transition-colors ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}>
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Section - Simplified for mobile */}
            <div 
              onClick={() => navigate('/resourcemanager/profile')}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 cursor-pointer group ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-blue-900 group-hover:bg-blue-800'
                  : 'bg-blue-100 group-hover:bg-blue-200'
              }`}>
                <UserIcon className={`h-4 w-4 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <span className={`font-medium text-sm hidden lg:block transition-colors duration-200 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>RM</span>
            </div>

            {/* Logout Button */}
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className={`p-2 rounded-lg transition-colors duration-200 group ${
                isDarkMode 
                  ? 'hover:bg-red-900/20 text-gray-400 hover:text-red-400' 
                  : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
              }`}
              title="Logout"
            >
              <LogOut className="h-5 w-5 transition-colors duration-200" />
            </button>

            {/* Mobile Menu Button - Only show on small/medium screens */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
              onClick={toggleNavigation}
            >
              {openNavigation ? (
                <HiX size={24} className={isDarkMode ? 'text-gray-300' : 'text-slate-700'} />
              ) : (
                <HiMenu size={24} className={isDarkMode ? 'text-gray-300' : 'text-slate-700'} />
              )}
            </motion.button>
          </div>
        </nav>

        {/* Mobile Navigation Menu - Enhanced for Mobile/Tablet */}
        <AnimatePresence>
          {openNavigation && (
            <motion.nav
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className={`md:hidden absolute top-full inset-x-0 border-t shadow-xl z-50 ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="px-4 py-6 space-y-4">
                {/* Navigation Items - Mobile optimized */}
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.id}
                    variants={menuItemVariants}
                    className={`flex items-center justify-between px-4 py-4 text-lg font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                      item.url === pathname.pathname
                        ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg"
                        : isDarkMode
                          ? "text-gray-300 hover:bg-gray-800 active:bg-gray-700"
                          : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
                    }`}
                    onClick={() => {
                      handleNavigation(item.id, item.url);
                      setOpenNavigation(false);
                    }}
                  >
                    <span className="text-base font-semibold">{item.title}</span>
                    {item.url === pathname.pathname && (
                      <motion.div
                        layoutId="activeMobileTabRM"
                        className="w-3 h-3 bg-white rounded-full shadow-lg"
                      />
                    )}
                  </motion.a>
                ))}
                
                {/* Mobile Footer Info */}
                <div className={`mt-6 pt-4 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Smart Stock
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Management System
                        </p>
                      </div>
                    </div>
                    
                    {/* Mobile Logout Button */}
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/login');
                        setOpenNavigation(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default RMHeader;