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
import AddRep from "../pages/InventoryManager/sales-rep/AddRep.jsx";
import Product from "../pages/InventoryManager/products/Product.jsx";
import EditUser from "../pages/InventoryManager/user/EditUser.jsx";
import OrderSummary from "../pages/InventoryManager/orders/OrderSummary.jsx";
import DailySummary from "../pages/InventoryManager/reports/DailySummary.jsx";
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
            <div className="flex-1">
              <main className="w-full h-full p-2 lg:p-4 overflow-y-auto bg-slate-100">
                <Routes>
                  {/* item: dashboard */}
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/orders" element={<OrderSummary />} />
                  {/* item: products */}
                  <Route path="/addproduct" element={<AddProduct />} />
                  <Route path="/productlist" element={<ProductList />} />
                  <Route path="/bulk" element={<AddBulk />}>
                    <Route path="add" element={<BulkList />} />
                  </Route>
                  <Route path="/product">
                    <Route path=":id" element={<Product />} />
                  </Route>
                  {/* item: customers */}
                  <Route path="/addcustomer" element={<AddCustomer />} />
                  <Route path="/customer-list" element={<CustomerList />} />
                  <Route path="/customer/:user_code" element={<CustomerDetails />} />
                  <Route path="/customer/edit/:user_code" element={<EditCustomer />} />
                  {/* item: sales-reps */}
                  <Route path="/addrep" element={<AddRep />} />
                  <Route path="/repslist" element={<RepsList />} />
                  <Route path="/sales-reps">
                    <Route path=":id" element={<RepDetails />} />
                  </Route>
                  {/* item: users */}
                  <Route path="/adduser" element={<AddUser />} />
                  <Route path="/userdetails" element={<UserDetails />} />
                  <Route path="/edituser" element={<EditUser />} />
                  {/* item: reports */}
                  <Route path="/daily-summary" element={<DailySummary />} />
                  <Route path="/qb-export" element={<QBExport />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default InventoryManagerRoutes;
