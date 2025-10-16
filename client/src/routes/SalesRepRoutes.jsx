import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
import Profile from "../pages/auth/Profile";
import { CartProvider } from "../context/cart/CartContext";
import { ThemeProvider } from "../context/theme/ThemeContext";

function MainRoutes() {
  console.log("🛍️ SalesRepRoutes component rendering");
  const location = useLocation();
  
  // Cleanup PDF artifacts on route change to prevent navigation issues
  useEffect(() => {
    const cleanupOnRouteChange = () => {
      // Remove any PDF-related artifacts that might interfere with navigation
      const artifactsToRemove = [
        'canvas[data-html2canvas-ignore]',
        'canvas[style*="position: absolute"]', 
        '[data-pdf-generator]',
        '[style*="top: -9999px"]:not(#root *)'
      ];
      
      artifactsToRemove.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.parentNode && !el.closest('#root')) {
            el.parentNode.removeChild(el);
          }
        });
      });
      
      // Reset any blocked event handlers
      document.body.style.pointerEvents = 'auto';
      document.documentElement.style.pointerEvents = 'auto';
      
      // Clear any remaining timers or intervals from PDF generation
      if (window.pdfGenerationTimer) {
        clearTimeout(window.pdfGenerationTimer);
        delete window.pdfGenerationTimer;
      }
    };

    // Run cleanup on every route change
    cleanupOnRouteChange();
    
    // Also run cleanup after a short delay to catch any delayed artifacts
    const timeoutId = setTimeout(cleanupOnRouteChange, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ThemeProvider>
        <CartProvider>
          <Header />
          <div className="pt-20 px-4">
            <Routes>
            {/* route: homepage */}
            <Route path="/" element={<Home />} />
            {/* route: profile */}
            <Route path="/profile" element={<Profile />} />
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
          </div>
        </CartProvider>
      </ThemeProvider>
    </div>
  );
}

export default MainRoutes;
