import { Routes, Route } from "react-router-dom";
import Header from "../components/general/Header";
import Home from "../pages/SalesRep/home/Home";
import Order from "../pages/SalesRep/order/Order";
import AddItems from "../components/order/AddItems";
import ViewQuotation from "../components/order/ViewQuotation";
import OrderList from "../components/order/OrderList";
import BillingDetails from "../components/order/BillingDetails";
import OrderConfirmation from "../components/order/OrderConfirmation";
import Product from "../pages/SalesRep/product/Product";
import History from "../pages/SalesRep/history/History.jsx";
import AddCustomer from "../pages/SalesRep/customer/AddCustomer";
import { CartProvider } from "../context/cart/CartContext";

function MainRoutes() {
  return (
    <>
      <CartProvider>
        <Header />
        <Routes>
          {/* route: homepage */}
          <Route path="/" element={<Home />} />
          {/* route: order */}
          <Route path="/order" element={<Order />}>
            <Route path="add-items" element={<AddItems />} />
            <Route path="billing-details" element={<BillingDetails />} />
            <Route path="confirmation" element={<OrderConfirmation />} />
          </Route>
          <Route path="/order-listing" element={<OrderList />} />
          <Route path="/view-quotation" element={<ViewQuotation />} />

          {/* route: add customer */}
          <Route path="/addcustomer" element={<AddCustomer />} />
          {/* route: product */}
          <Route path="/product" element={<Product />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </CartProvider>
    </>
  );
}

export default MainRoutes;
