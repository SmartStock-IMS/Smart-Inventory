import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "../../constants";
import { HiMenu } from "react-icons/hi";
import { HiX } from "react-icons/hi";
// import { FaUser } from "react-icons/fa";
import logo from "../../assets/images/general/logo.png";
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
      className="fixed top-0 w-full z-50"
    >
      <div className="backdrop-blur-md bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
            >
              {/* <img
                src={lacunaLogo}
                width={100}
                height={70}
                alt="logo"
                className="h-12 w-auto"
                onClick={() => navigate("/")}
              /> */}
              <img
                src={logo}
                className="text-3xl text-n-1 font-grotesk font-semibold text-white w-40"
                onClick={() => navigate("/")}
              />
            </motion.div>
            <div className="flex items-center">
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8 text-white">
                {navigation.map((item) => (
                  <motion.a
                    key={item.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-3 py-2 text-sm font-medium rounded-md cursor-pointer
                      ${
                        item.url === pathname.pathname
                          ? "text-yellow-1"
                          : "text-white hover:text-yellow-1"
                      }`}
                    // onClick={() => navigate(item.url)}
                    onClick={() => handleNavigation(item.id, item.url)}
                  >
                    {item.url === pathname.pathname && (
                      <motion.span
                        layoutId="underline"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-black"
                      />
                    )}
                    {item.title}
                  </motion.a>
                ))}
              </nav>

              {/* <FaUser className="ml-8 mr-4 lg:mr-0 text-4xl cursor-pointer text-white border border-white rounded-full" onClick={() => navigate('/profile')} /> */}

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="lg:hidden p-2"
                onClick={toggleNavigation}
              >
                {/* <MenuSvg openNavigation={openNavigation} /> */}
                {openNavigation ? (
                  <HiX size={24} color="white" />
                ) : (
                  <HiMenu size={24} color="white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {openNavigation && (
            <motion.nav
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="lg:hidden absolute top-20 inset-x-0 bg-white"
            >
              <div className="px-4 pt-2 pb-6 space-y-1 h-screen">
                {navigation.map((item) => (
                  <motion.a
                    key={item.id}
                    variants={menuItemVariants}
                    className={`block px-3 py-4 text-base font-medium rounded-md cursor-pointer
                      ${
                        item.url === pathname.pathname
                          ? "text-n-4 bg-n-4/10"
                          : "text-gray-600 hover:bg-purple-3 hover:text-n-4"
                      }`}
                    onClick={() => {
                      handleNavigation(item.id, item.url);
                      setOpenNavigation(false);
                    }}
                  >
                    {item.title}
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
