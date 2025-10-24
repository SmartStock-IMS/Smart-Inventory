import { SearchIcon, BellIcon, UserIcon, SunIcon, MoonIcon, Sparkles, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useTheme } from "../../../context/theme/ThemeContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react"; // <-- add useEffect
import axios from "axios"; // added

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  function getUserIdFromToken() {
      const token = localStorage.getItem("token");
      if (!token) return "SR001";
      try {
        const payload = jwtDecode(token);
        return payload.id || "SR001";
      } catch {
        return "SR001";
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
      // Count unread notifications
      const unread = fetchedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      console.log("Fetched notifications:", res.data);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }

  // load notifications on first render
  useEffect(() => {
    fetchNotifications();
  }, []);

  async function handleNotificationsClick() {
    await fetchNotifications();
    setShowNotifications((prev) => !prev);
    // Mark all as read when dropdown opens
    if (!showNotifications) {
      setUnreadCount(0);
      // Optionally: send API request to mark as read on backend
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
    <header className={`h-full w-full transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    } border-b shadow-sm`}>
      <nav className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4">
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

        {/* Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-lg lg:max-w-2xl mx-2 sm:mx-4">
          <div className="relative">
            <div className={`flex items-center rounded-lg px-3 sm:px-4 py-2 border transition-all duration-200 focus-within:ring-2 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600 focus-within:border-blue-400 focus-within:ring-blue-400/20 text-gray-200'
                : 'bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:ring-blue-200'
            }`}>
              <SearchIcon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mr-2 sm:mr-3 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search or type a command"
                className={`flex-grow bg-transparent focus:outline-none text-xs sm:text-sm transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-200 placeholder-gray-400' 
                    : 'text-gray-700 placeholder-gray-400'
                }`}
              />
              <button className={`ml-2 sm:ml-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 hidden sm:block ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Dark/Light Mode, Notifications, Profile */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Dark/Light Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 group ${
              isDarkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-gray-100'
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <SunIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-yellow-500 transition-colors duration-200" />
            ) : (
              <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-blue-500 transition-colors duration-200" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 relative group ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={handleNotificationsClick}
            >
              <BellIcon className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 group-hover:text-blue-400' 
                  : 'text-gray-600 group-hover:text-blue-500'
              }`} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
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

          {/* Profile Section */}
          <div 
            onClick={() => navigate('/inventorymanager/profile')}
            className={`flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg transition-colors duration-200 cursor-pointer group ml-1 sm:ml-2 ${
              isDarkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-gray-100'
            }`}
          >
            <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
              isDarkMode
                ? 'bg-blue-900 group-hover:bg-blue-800'
                : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <UserIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <span className={`font-medium text-xs sm:text-sm hidden lg:block transition-colors duration-200 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>Profile</span>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;