import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu } from "react-icons/hi";
import { HiX } from "react-icons/hi";
import { BellIcon, UserIcon, SunIcon, MoonIcon, Sparkles } from "lucide-react";
import { useTheme } from "../../context/theme/ThemeContext";

const navItems = [
  { id: "1", title: "Dashboard", url: "/resourcemanager" },
  { id: "2", title: "Resources", url: "/resourcemanager/resources" },
  { id: "3", title: "Orders", url: "/resourcemanager/orders" },
  { id: "4", title: "Vehicles", url: "/resourcemanager/vehicles" },
];

const RMHeader = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = useLocation();
  const navigate = useNavigate();
  const [openNavigation, setOpenNavigation] = useState(false);

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
        <nav className="h-20 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Brand Section - Optimized for Mobile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="block">
              <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                ResourcePro
              </h1>
              <p className={`text-xs transition-colors duration-300 hidden sm:block ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>Management System</p>
            </div>
          </div>

          {/* Right Section: Prioritized for Mobile/Tablet */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tablet Navigation - Show on medium screens and up */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.a
                  key={item.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-all duration-200 ${
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
            <button className={`p-2 rounded-lg transition-colors duration-200 relative group ${
              isDarkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-gray-100'
            }`}>
              <BellIcon className={`h-5 w-5 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 group-hover:text-blue-400' 
                  : 'text-gray-600 group-hover:text-blue-500'
              }`} />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </button>

            {/* Profile Section - Simplified for mobile */}
            <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 cursor-pointer group ${
              isDarkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-gray-100'
            }`}>
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
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ResourcePro
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Mobile Optimized
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      v2.0
                    </div>
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