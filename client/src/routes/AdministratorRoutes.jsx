import { Routes, Route } from "react-router-dom";
import DashboardHome from "../pages/Administrator/home/DashboardHome.jsx";
import Sidebar from "../components/Administrator/genaral/Sidebar.jsx";
import Header from "../components/Administrator/genaral/Header.jsx";
import { ThemeProvider } from "../context/theme/ThemeContext.jsx";
import { SidebarProvider } from "../context/sidebar/SidebarContext.jsx";
import AddUser from "../pages/Administrator/user/AddUser.jsx";
import UserDetails from "../pages/Administrator/user/UserDetails.jsx";
import EditUser from "../pages/Administrator/user/EditUser.jsx";
import OrderSummary from "../pages/Administrator/orders/OrderSummary.jsx";
import DailySummary from "../pages/Administrator/reports/DailySummary.jsx";
import WeeklySummary from "../pages/Administrator/reports/WeeklySummary.jsx";
import YearlySummary from "../pages/Administrator/reports/YearlySummary.jsx";
import QBExport from "../pages/Administrator/reports/QBExport.jsx";
import SalesRepList from "../pages/Administrator/sales-rep/SalesRepList.jsx";
import RepDetails from "../pages/Administrator/sales-rep/RepDetails.jsx";
import ProductList from "../pages/Administrator/products/ProductList.jsx";
import Product from "../pages/Administrator/products/Product.jsx";

function InventoryManagerRoutes() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="h-screen w-screen flex flex-col">
          <div className="h-16 flex-shrink-0">
            <Header />
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-shrink-0 hidden md:block">
              <Sidebar />
            </div>
            <div className="flex-1 overflow-hidden">
              <main className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-100">
                <div className="min-h-full p-2 lg:p-4">
                  <Routes>
                    {/* item: dashboard */}
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/orders" element={<OrderSummary />} />
                    <Route path="/sales-rep" element={<SalesRepList />} />
                    <Route path="/sales-rep/:repCode" element={<RepDetails />} />

                    <Route path="/productlist" element={<ProductList />} />
                    <Route path="/product">
                      <Route path=":id" element={<Product />} />
                    </Route>
                    {/* item: users */}
                    <Route path="/adduser" element={<AddUser />} />
                    <Route path="/userdetails" element={<UserDetails />} />
                    <Route path="/edituser" element={<EditUser />} />
                    {/* item: reports */}
                    <Route path="/daily-summary" element={<DailySummary />} />
                    <Route path="/weekly-summary" element={<WeeklySummary />} />
                    <Route path="/yearly-summary" element={<YearlySummary />} />
                    <Route path="/qb-export" element={<QBExport />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default InventoryManagerRoutes;
