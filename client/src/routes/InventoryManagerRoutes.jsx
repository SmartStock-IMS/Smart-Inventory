import { Routes, Route } from "react-router-dom";
import DashboardHome from "../pages/dashboard/home/DashboardHome.jsx";
import Sidebar from "../components/dashboard/genaral/Sidebar.jsx";
import Header from "../components/dashboard/genaral/Header.jsx";
import AddUser from "../pages/dashboard/user/AddUser.jsx";
import UserDetails from "../pages/dashboard/user/UserDetails.jsx";
import ProductList from "../pages/dashboard/products/ProductList.jsx";
import AddProduct from "../pages/dashboard/products/AddProduct.jsx";
import AddBulk from "../pages/dashboard/products/AddBulk.jsx";
import CustomerList from "../pages/dashboard/customer/CustomerList.jsx";
import EditCustomer from "../pages/dashboard/customer/EditCustomer.jsx";
import CustomerDetails from "../pages/dashboard/customer/CustomerDetails.jsx";
import AddCustomer from "../pages/dashboard/customer/Addcustomer.jsx";
import RepsList from "../pages/dashboard/sales-rep/SalesRepList.jsx";
import RepDetails from "../pages/dashboard/sales-rep/RepDetails.jsx";
import AddRep from "../pages/dashboard/sales-rep/AddRep.jsx";
import Product from "../pages/dashboard/products/Product.jsx";
import EditUser from "../pages/dashboard/user/EditUser.jsx";
import OrderSummary from "../pages/dashboard/orders/OrderSummary.jsx";
import DailySummary from "../pages/dashboard/reports/DailySummary.jsx";
import QBExport from "../pages/dashboard/reports/QBExport.jsx";
import BulkList from "../pages/dashboard/products/BulkList.jsx";

function DashboardRoutes() {
  return (
    <div className="h-screen w-screen">
      {/*<div className="h-[10%]">*/}
      {/*  <Header />*/}
      {/*</div>*/}
      <div className="h-screen flex flex-row items-center">
        <div className="w-1/5 h-full">
          <Sidebar />
        </div>
        <div className="w-4/5 h-full bg-green-400">
          <main className="w-full h-full p-2 overflow-y-auto bg-slate-100">
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
  );
}

export default DashboardRoutes;
