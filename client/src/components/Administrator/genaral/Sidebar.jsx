import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  BookText, 
  ChevronDown, 
  ChevronRight,
  Home,
  Package,
  Users,
  UserCheck,
  User,
  BarChart3,
  HelpCircle,
  LogOut,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import home from "../../../assets/images/InventoryManager/genaral/home-3.png";
import products from "../../../assets/images/InventoryManager/genaral/home1.png";
import customers from "../../../assets/images/InventoryManager/genaral/home2-customers.png";
import Salesrep from "../../../assets/images/InventoryManager/genaral/Salesrep.png";
import reports from "../../../assets/images/InventoryManager/genaral/Report.png";
import users from "../../../assets/images/InventoryManager/genaral/User.png";
import { useAuth } from "../../../context/auth/AuthContext";
import { useTheme } from "../../../context/theme/ThemeContext";
import { useSidebar } from "../../../context/sidebar/SidebarContext";

const Sidebar = () => {
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    logout();
    console.log("user logged out");
    navigate("/");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: home,
      lucideIcon: Home,
      path: "/administrator",
      isActive: location.pathname === "/administrator"
    },
    {
      id: "orders",
      label: "Orders",
      icon: null,
      lucideIcon: BookText,
      path: "/administrator/orders",
      isActive: location.pathname === "/orders"
    },
    {
      id: "salesreps",
      label: "Sales Reps",
      icon: Salesrep,
      lucideIcon: UserCheck,
      hasSubmenu: true,
      submenu: [
        //{ label: "Add Rep", path: "/administrator/addrep" },
        { label: "Sales-Rep List", path: "/administrator/sales-rep" }
      ]
    },
    {
      id: "users",
      label: "Users",
      icon: users,
      lucideIcon: User,
      hasSubmenu: true,
      submenu: [
        { label: "Add User", path: "/administrator/adduser" },
        { label: "User Details", path: "/administrator/userdetails" }
      ]
    },
    {
      id: "reports",
      label: "Reports",
      icon: reports,
      lucideIcon: BarChart3,
      hasSubmenu: true,
      submenu: [
        { label: "Daily Summary", path: "/administrator/daily-summary" },
        { label: "Weekly Summary", path: "/administrator/weekly-summary" },
        { label: "Yearly Summary", path: "/administrator/yearly-summary" },
        { label: "QB Export", path: "/administrator/qb-export" }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col relative">
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-4 z-20 p-2 rounded-lg shadow-lg transition-all duration-300 ${
          isDarkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
        } ${
          isCollapsed ? 'right-[-20px]' : 'right-[-20px]'
        }`}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <ChevronLeft 
          className={`w-4 h-4 transition-transform duration-300 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Sidebar Content */}
      <div className={`h-full flex flex-col text-white shadow-2xl relative overflow-hidden transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800'
      } ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Background Pattern */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${
          isDarkMode ? 'opacity-30' : 'opacity-20'
        }`} style={{
          backgroundImage: isDarkMode 
            ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Collapsed Brand Icon */}
        {isCollapsed && (
          <div className="relative z-10 p-4 flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id} className="group">
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => !isCollapsed && toggleMenu(item.id)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-xl transition-all duration-300 ${
                      isDarkMode
                        ? `group-hover:bg-slate-700/50 ${
                            activeMenu === item.id 
                              ? "bg-slate-700/70 shadow-lg" 
                              : "hover:bg-slate-700/30"
                          }`
                        : `group-hover:bg-gray-100 ${
                            activeMenu === item.id 
                              ? "bg-gray-100 shadow-lg" 
                              : "hover:bg-gray-50"
                          }`
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-slate-700/50 group-hover:bg-slate-600/50'
                          : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}>
                        {item.icon ? (
                          <img src={item.icon} alt={item.label} className={`w-5 h-5 ${
                            isDarkMode ? 'filter brightness-0 invert' : 'filter brightness-0'
                          }`} />
                        ) : (
                          <item.lucideIcon className={`w-5 h-5 transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-300' : 'text-gray-600'
                          }`} />
                        )}
                      </div>
                      {!isCollapsed && (
                        <span className={`font-medium transition-colors duration-300 ${
                          isDarkMode 
                            ? 'text-slate-200 group-hover:text-white' 
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      activeMenu === item.id ? (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-500'
                        }`} />
                      ) : (
                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-500'
                        }`} />
                      )
                    )}
                  </button>
                  
                  {/* Submenu with Animation */}
                  {!isCollapsed && (
                    <div className={`overflow-hidden transition-all duration-300 ${
                      activeMenu === item.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}>
                      <div className={`ml-6 mt-2 space-y-1 border-l-2 pl-4 ${
                        isDarkMode ? 'border-slate-600/50' : 'border-gray-300'
                      }`}>
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`block p-2 rounded-lg text-sm transition-all duration-200 ${
                              location.pathname === subItem.path
                                ? isDarkMode
                                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-l-2 border-blue-400 pl-3"
                                  : "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-l-2 border-blue-500 pl-3"
                                : isDarkMode
                                  ? "text-slate-300 hover:text-white hover:bg-slate-700/30"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-xl transition-all duration-300 ${
                    item.isActive
                      ? isDarkMode
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg border border-blue-500/30"
                        : "bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg border border-blue-300"
                      : isDarkMode
                        ? "hover:bg-slate-700/50"
                        : "hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    item.isActive 
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-md" 
                      : isDarkMode
                        ? "bg-slate-700/50 group-hover:bg-slate-600/50"
                        : "bg-gray-200 group-hover:bg-gray-300"
                  }`}>
                    {item.icon ? (
                      <img 
                        src={item.icon} 
                        alt={item.label} 
                        className={`w-5 h-5 ${
                          item.isActive 
                            ? "filter brightness-0 invert" 
                            : isDarkMode 
                              ? "filter brightness-0 invert" 
                              : "filter brightness-0"
                        }`} 
                      />
                    ) : (
                      <item.lucideIcon className={`w-5 h-5 ${
                        item.isActive 
                          ? "text-white" 
                          : isDarkMode 
                            ? "text-slate-300" 
                            : "text-gray-600"
                      }`} />
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className={`font-medium transition-colors duration-300 ${
                      item.isActive 
                        ? isDarkMode
                          ? "text-white" 
                          : "text-blue-800"
                        : isDarkMode
                          ? "text-slate-200 group-hover:text-white"
                          : "text-gray-700 group-hover:text-gray-900"
                    }`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className={`relative z-10 p-4 border-t space-y-2 transition-colors duration-300 ${
          isDarkMode ? 'border-slate-700/50' : 'border-gray-200'
        }`}>
          <Link
            to="/inventorymanager/help"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-xl transition-all duration-300 group ${
              isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100'
            }`}
            title={isCollapsed ? "Help" : ''}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-300 ${
              isDarkMode
                ? 'bg-slate-700/50 group-hover:bg-emerald-500/20'
                : 'bg-gray-200 group-hover:bg-emerald-100'
            }`}>
              <HelpCircle className={`w-5 h-5 transition-colors duration-300 ${
                isDarkMode
                  ? 'text-slate-300 group-hover:text-emerald-400'
                  : 'text-gray-600 group-hover:text-emerald-600'
              }`} />
            </div>
            {!isCollapsed && (
              <span className={`font-medium transition-colors duration-300 ${
                isDarkMode
                  ? 'text-slate-200 group-hover:text-white'
                  : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                Help
              </span>
            )}
          </Link>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-xl transition-all duration-300 group ${
              isDarkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-50'
            }`}
            title={isCollapsed ? "Logout" : ''}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-300 ${
              isDarkMode
                ? 'bg-slate-700/50 group-hover:bg-red-500/20'
                : 'bg-gray-200 group-hover:bg-red-100'
            }`}>
              <LogOut className={`w-5 h-5 transition-colors duration-300 ${
                isDarkMode
                  ? 'text-slate-300 group-hover:text-red-400'
                  : 'text-gray-600 group-hover:text-red-600'
              }`} />
            </div>
            {!isCollapsed && (
              <span className={`font-medium transition-colors duration-300 ${
                isDarkMode
                  ? 'text-slate-200 group-hover:text-red-300'
                  : 'text-gray-700 group-hover:text-red-600'
              }`}>
                Logout
              </span>
            )}
          </button>
        </div>

        {/* Decorative Elements */}
        <div className={`absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t pointer-events-none transition-colors duration-300 ${
          isDarkMode ? 'from-slate-900/50' : 'from-gray-100/50'
        } to-transparent`}></div>
        <div className={`absolute top-20 right-0 w-32 h-32 bg-gradient-to-l rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
          isDarkMode ? 'from-blue-500/10' : 'from-blue-200/20'
        } to-transparent`}></div>
        <div className={`absolute bottom-20 left-0 w-24 h-24 bg-gradient-to-r rounded-full blur-2xl pointer-events-none transition-colors duration-300 ${
          isDarkMode ? 'from-purple-500/10' : 'from-purple-200/20'
        } to-transparent`}></div>
      </div>
    </div>
  );
};

export default Sidebar;