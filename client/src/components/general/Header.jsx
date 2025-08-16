import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "../../constants";
import { HiMenu } from "react-icons/hi";
import { HiX } from "react-icons/hi";
import { useAuth } from "../../context/auth/AuthContext.jsx";

const Header = () => {
  const { logout } = useAuth();

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
    if (id === "4") {
      logout(); // init logout in auth context
      console.log("user logged out");
    }
    navigate(url); // navigate to url
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-0 w-full z-50 shadow-lg"
    >
      {/* Creative White Background with Subtle Pattern */}
      <div className="relative bg-white border-b-2 border-slate-100">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white to-purple-50/30" />
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, #8b5cf6 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Brand Logo Section */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer flex items-center"
              onClick={() => navigate("/")}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {/* Creative Icon */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                        <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-sm" />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  
                  {/* Brand Text */}
                  <div className="hidden sm:block">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        InventoryPro
                      </span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                    <div className="text-xs text-slate-500 font-medium tracking-wide -mt-1">
                      Management System
                    </div>
                  </div>
                </div>
                
                {/* Mobile Brand Text */}
                <div className="sm:hidden">
                  <div className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    InventoryPro
                  </div>
                  <div className="text-xs text-slate-500 font-medium -mt-1">
                    Management
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center">
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-2">
                {navigation.map((item) => (
                  <motion.a
                    key={item.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                      item.url === pathname.pathname
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    onClick={() => handleNavigation(item.id, item.url)}
                  >
                    {item.url === pathname.pathname && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg"
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <span className="relative z-10">{item.title}</span>
                  </motion.a>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={toggleNavigation}
              >
                {openNavigation ? (
                  <HiX size={24} className="text-slate-700" />
                ) : (
                  <HiMenu size={24} className="text-slate-700" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {openNavigation && (
            <motion.nav
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="lg:hidden absolute top-full inset-x-0 bg-white border-t border-slate-200 shadow-xl"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                {navigation.map((item) => (
                  <motion.a
                    key={item.id}
                    variants={menuItemVariants}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                      item.url === pathname.pathname
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
                    }`}
                    onClick={() => {
                      handleNavigation(item.id, item.url);
                      setOpenNavigation(false);
                    }}
                  >
                    <span>{item.title}</span>
                    {item.url === pathname.pathname && (
                      <motion.div
                        layoutId="activeMobileTab"
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;