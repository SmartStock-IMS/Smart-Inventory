import { useEffect, useState } from "react";
import { getQuotationsBySalesRep } from "@services/quotation-service.js";
import { useAuth } from "../../../context/auth/AuthContext.jsx";
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@components/ui/Dialog.jsx";
import OrderDetails from "@components/InventoryManager/orders/OrderDetails.jsx";

// NOTE: Currently using mock data since backend is not connected
// TODO: Replace mock data with real API calls when backend is ready

const History = () => {
  const { user } = useAuth();

  // const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      // Get quotations from localStorage for frontend dev
      const savedQuotations = localStorage.getItem('quotations');
      let quotations = [];
      if (savedQuotations) {
        quotations = JSON.parse(savedQuotations);
      }
      setOrders(quotations);
    } catch (error) {
      console.error("Error fetching quotations from localStorage:", error);
      toast.error("Failed to load quotation history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // const filteredOrders = orders.filter(order =>
  //   order.id.includes(searchQuery) ||
  //   order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   order.date.includes(searchQuery)
  // );

  return (
    <div className="max-w-6xl mx-auto p-6 mt-24 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">View and manage your quotation history</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-indigo-600">{orders.length}</p>
        </div>
      </div>

      {/* Order History Content */}
      {isLoading ? (
        <div className="mt-8 flex flex-row items-center justify-center">
          <FaSpinner size={24} color="#6366f1" className="animate-spin mr-3" />
          <span className="text-gray-600">Loading order history...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500">No completed orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Order ID</div>
              <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Date</div>
              <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Action</div>
            </div>
          </div>
          {orders.map((order, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 gap-4 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                index === orders.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                <span className="font-mono text-sm font-medium text-gray-900">#{order.quotation_id}</span>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(order.quotation_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </DialogTrigger>
                  <DialogContent className="h-screen lg:h-[90%] max-w-screen lg:max-w-[90%] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-900">Order Details - {order.quotation_id}</DialogTitle>
                      <DialogDescription>
                        <OrderDetails item={order} />
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-20"
      />
    </div>
  );
};

export default History;
