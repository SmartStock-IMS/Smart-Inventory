import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, BookText } from "lucide-react";
import home from "../../../assets/images/dashboard/genaral/home-3.png";
import products from "../../../assets/images/dashboard/genaral/home1.png";
import customers from "../../../assets/images/dashboard/genaral/home2-customers.png";
import Salesrep from "../../../assets/images/dashboard/genaral/Salesrep.png";
import reports from "../../../assets/images/dashboard/genaral/Report.png";
import users from "../../../assets/images/dashboard/genaral/User.png";
import downArrow from "../../../assets/images/dashboard/genaral/down-arrow.png";
import upArrow from "../../../assets/images/dashboard/genaral/upload.png";
import help from "../../../assets/images/dashboard/genaral/help.png";
import iconLogout from "@assets/images/dashboard/genaral/logout.png";
import { useAuth } from "../../../context/auth/AuthContext";
import logoTrollius from "@assets/images/general/logo.png";
import logoMehera from "@assets/images/general/logo_mehera.png";

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout(); // init logout in auth context
    console.log("user logged out");
    navigate("/");
  };

  return (
    <div className="h-full">
      {/* navigation: logo */}
      <div className="h-[10%] flex flex-row items-center justify-center gap-4">
        <div>
          <img src={logoTrollius} alt="logo-trollius" className="w-24 -mt-2" />
        </div>
        <div>
          <img src={logoMehera} alt="logo-mehera" className="w-24 -mb-1"/>
        </div>
      </div>

      {/* navigation: content-links */}
      <div className="h-[90%] p-2 flex flex-col bg-white">
        {/* side-nav: main-options */}
        <div className="">
          {/* Dashboard */}
          <div>
            <Link
              to="/dashboard"
              className={`flex items-center gap-4 p-3 rounded-lg transition ${
                location.pathname === "/dashboard"
                  ? "bg-navyblue text-black"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <img src={home} alt="Dashboard" className="w-6 h-6" />
              <p>Dashboard</p>
            </Link>
          </div>
          {/* orders */}
          <div>
            <Link
              to="/dashboard/orders"
              className={`flex items-center gap-4 p-3 rounded-lg transition ${
                location.pathname === "/orders"
                  ? "bg-navyblue text-black"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookText className="w-6 h-6" />
              <p>Orders</p>
            </Link>
          </div>
          {/* products */}
          <div>
            <div
              className={`flex items-center justify-between p-3 rounded-lg transition cursor-pointer ${
                activeMenu === "products" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() => toggleMenu("products")}
            >
              <div className="flex items-center gap-4">
                <img src={products} alt="E-Commerce" className="w-6 h-6" />
                <p>Products</p>
              </div>
              <img
                src={activeMenu === "products" ? upArrow : downArrow}
                alt="Toggle"
                className="w-3 h-3"
              />
            </div>
            {activeMenu === "products" && (
              <div className="ml-8 mt-2">
                <Link
                  to="/dashboard/addproduct"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/addproduct"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Add Product
                </Link>
                <Link
                  to="/dashboard/bulk"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/bulk"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Add Bulk
                </Link>
                <Link
                  to="/dashboard/productlist"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/productlist"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Product List
                </Link>
              </div>
            )}
          </div>
          {/* Customers */}
          <div>
            <div
              className={`flex items-center justify-between p-3 rounded-lg transition cursor-pointer ${
                activeMenu === "customers" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() => toggleMenu("customers")}
            >
              <div className="flex items-center gap-4">
                <img src={customers} alt="E-Commerce" className="w-6 h-6" />
                <p>Customers</p>
              </div>
              <img
                src={activeMenu === "customers" ? upArrow : downArrow}
                alt="Toggle"
                className="w-3 h-3"
              />
            </div>
            {activeMenu === "customers" && (
              <div className="ml-8 mt-2">
                <Link
                  to="/dashboard/addcustomer"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/addcustomer"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Add Customer
                </Link>
                <Link
                  to="/dashboard/customer-list"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/customer-list"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Customer List
                </Link>
              </div>
            )}
          </div>
          {/* Sales Reps */}
          <div>
            <div
              className={`flex items-center justify-between p-3 rounded-lg transition cursor-pointer ${
                activeMenu === "salesreps" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() => toggleMenu("salesreps")}
            >
              <div className="flex items-center gap-4">
                <img src={Salesrep} alt="salesreps" className="w-6 h-6" />
                <p>Sales Reps</p>
              </div>
              <img
                src={activeMenu === "salesreps" ? upArrow : downArrow}
                alt="Toggle"
                className="w-3 h-3"
              />
            </div>
            {activeMenu === "salesreps" && (
              <div className="ml-8 mt-2">
                <Link
                  to="/dashboard/addrep"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/addrep"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Add Rep
                </Link>
                <Link
                  to="/dashboard/repslist"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/repslist"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sales-Rep List
                </Link>
              </div>
            )}
          </div>
          {/* Reports */}
          <div>
            <div
              className={`flex items-center justify-between p-3 rounded-lg transition cursor-pointer ${
                activeMenu === "reports" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() => toggleMenu("reports")}
            >
              <div className="flex items-center gap-4">
                <img src={reports} alt="reports" className="w-6 h-6" />
                <p>Reports</p>
              </div>
              <img
                src={activeMenu === "reports" ? upArrow : downArrow}
                alt="Toggle"
                className="w-3 h-3"
              />
            </div>
            {activeMenu === "reports" && (
              <div className="ml-8 mt-2">
                <Link
                  to="/dashboard/daily-summary"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/daily-summary"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Daily Summary
                </Link>
                <Link
                  to="/dashboard/qb-export"
                  className={`flex items-center gap-4 p-3 rounded-lg transition ${
                    location.pathname === "/dashboard/qb-export"
                      ? "text-black underline"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  QB Export
                </Link>
              </div>
            )}
          </div>
          {/* Users */}
          {/*<div>*/}
          {/*  <div*/}
          {/*    className={`flex items-center justify-between p-3 rounded-lg transition cursor-pointer ${*/}
          {/*      activeMenu === "users" ? "bg-gray-200" : "hover:bg-gray-100"*/}
          {/*    }`}*/}
          {/*    onClick={() => toggleMenu("users")}*/}
          {/*  >*/}
          {/*    <div className="flex items-center gap-4">*/}
          {/*      <img src={users} alt="Users" className="w-6 h-6" />*/}
          {/*      <p>Users</p>*/}
          {/*    </div>*/}
          {/*    <img*/}
          {/*      src={activeMenu === "users" ? upArrow : downArrow}*/}
          {/*      alt="Toggle"*/}
          {/*      className="w-3 h-3"*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*  {activeMenu === "users" && (*/}
          {/*    <div className="ml-8 mt-2">*/}
          {/*      <Link*/}
          {/*        to="/dashboard/userdetails"*/}
          {/*        className={`flex items-center gap-4 p-3 rounded-lg transition ${*/}
          {/*          location.pathname === "/dashboard/userdetails"*/}
          {/*            ? "text-black underline"*/}
          {/*            : "hover:bg-gray-200"*/}
          {/*        }`}*/}
          {/*        onClick={() => setMobileMenuOpen(false)}*/}
          {/*      >*/}
          {/*        User Details*/}
          {/*      </Link>*/}
          {/*      <Link*/}
          {/*        to="/dashboard/adduser"*/}
          {/*        className={`flex items-center gap-4 p-3 rounded-lg transition ${*/}
          {/*          location.pathname === "/dashboard/adduser"*/}
          {/*            ? "text-black underline"*/}
          {/*            : "hover:bg-gray-200"*/}
          {/*        }`}*/}
          {/*        onClick={() => setMobileMenuOpen(false)}*/}
          {/*      >*/}
          {/*        Add User*/}
          {/*      </Link>*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}
        </div>
        {/* side-nav: help-options */}
        <div className="mt-auto pt-1 border-t border-gray-300">
          <Link
            to="/dashboard/help"
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200"
          >
            <img src={help} alt="help" className="w-6 h-6" /> <p>Help</p>
          </Link>
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 w-full"
          >
            <img src={iconLogout} alt="logout" className="w-6 h-6" /> <p>Logout</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
