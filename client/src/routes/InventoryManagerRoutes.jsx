import { Routes, Route } from "react-router-dom";
import DashboardHome from "../pages/InventoryManager/home/DashboardHome.jsx";
import Sidebar from "../components/InventoryManager/genaral/Sidebar.jsx";
import Header from "../components/InventoryManager/genaral/Header.jsx";
import { ThemeProvider } from "../context/theme/ThemeContext.jsx";
import { SidebarProvider } from "../context/sidebar/SidebarContext.jsx";
import AddUser from "../pages/InventoryManager/user/AddUser.jsx";
import UserDetails from "../pages/InventoryManager/user/UserDetails.jsx";
import ProductList from "../pages/InventoryManager/products/ProductList.jsx";
import AddProduct from "../pages/InventoryManager/products/AddProduct.jsx";
import AddBulk from "../pages/InventoryManager/products/AddBulk.jsx";
import CustomerList from "../pages/InventoryManager/customer/CustomerList.jsx";
import EditCustomer from "../pages/InventoryManager/customer/EditCustomer.jsx";
import CustomerDetails from "../pages/InventoryManager/customer/CustomerDetails.jsx";
import AddCustomer from "../pages/InventoryManager/customer/Addcustomer.jsx";
import RepsList from "../pages/InventoryManager/sales-rep/SalesRepList.jsx";
import RepDetails from "../pages/InventoryManager/sales-rep/RepDetails.jsx";
import EditRep from "../pages/InventoryManager/sales-rep/EditRep.jsx";
import AddRep from "../pages/InventoryManager/sales-rep/AddRep.jsx";
import AddRM from "../pages/InventoryManager/RManager/AddRM.jsx";
import RMList from "../pages/InventoryManager/RManager/RMList.jsx";
import RMDetails from "../pages/InventoryManager/RManager/RMDetails.jsx";
import EditRM from "../pages/InventoryManager/RManager/EditRM.jsx";
import Product from "../pages/InventoryManager/products/Product.jsx";
import EditUser from "../pages/InventoryManager/user/EditUser.jsx";
import OrderSummary from "../pages/InventoryManager/orders/OrderSummary.jsx";
import DailySummary from "../pages/InventoryManager/reports/DailySummary.jsx";
import WeeklySummary from "../pages/InventoryManager/reports/WeeklySummary.jsx";
import YearlySummary from "../pages/InventoryManager/reports/YearlySummary.jsx";
import QBExport from "../pages/InventoryManager/reports/QBExport.jsx";
import BulkList from "../pages/InventoryManager/products/BulkList.jsx";

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
                    {/* item: products */}
                    <Route path="/addproduct" element={<AddProduct />} />
                    <Route path="/productlist" element={<ProductList />} />
                    <Route path="/bulk" element={<AddBulk />} />
                    <Route path="/bulklist" element={<BulkList />} />
                    <Route path="/product">
                      <Route path=":id" element={<Product />} />
                    </Route>
                    {/* item: customers */}
                    <Route path="/addcustomer" element={<AddCustomer />} />
                    <Route path="/customer-list" element={<CustomerList />} />
                    <Route path="/customer/:customer_id" element={<CustomerDetails />} />
                    <Route path="/customer/edit/:customer_id" element={<EditCustomer />} />
                    {/* item: sales-reps */}
                    <Route path="/addrep" element={<AddRep />} />
                    <Route path="/sales-rep" element={<RepsList />} />
                    <Route path="/sales-rep/:repCode" element={<RepDetails />} />
                    <Route path="/sales-rep/edit/:repCode" element={<EditRep />} />
                    {/* item: resource managers */}
                    <Route path="/addrm" element={<AddRM />} />
                    <Route path="/rm-list" element={<RMList />} />
                    <Route path="/rm-details/:repCode" element={<RMDetails />} />
                    <Route path="/rm-edit/:repCode" element={<EditRM />} />
                    
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
