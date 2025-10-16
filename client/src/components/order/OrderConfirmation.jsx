import { useState, useEffect } from "react";
import { useCart } from "../../context/cart/CartContext";
import { useAuth } from "../../context/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Invoice from "./Invoice";
import { ToastContainer, toast } from "react-toastify";
import generateId from "@lib/generate-id.js";
import { cn } from "@lib/utils.js";
import { createNewQuotation } from "@services/quotation-service.js";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaReceipt,
  FaCreditCard,
  FaBuilding,
  FaCheckCircle,
  FaSpinner,
  FaCalendarAlt,
  FaTags,
  FaPercentage,
  FaRocket,
  FaStar,
  FaGift
} from "react-icons/fa";

const OrderConfirmation = () => {
  const { customer, cartState, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [quotationData, setQuotationData] = useState({});
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [savedCartState, setSavedCartState] = useState(null);
  const [savedCustomer, setSavedCustomer] = useState(null);
  const [orderTerm, setOrderTerm] = useState("");
  const [orderTermError, setOrderTermError] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyError, setCompanyError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Clear cart when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (showDownloadButton) {
        // Only clear cart if quotation was generated
        clearCart();
      }
    };
  }, [showDownloadButton, clearCart]);

  const quotationId = generateId("QT");
  const currentDate = new Date().toISOString().split("T")[0];
  const initDueDate = new Date();
  initDueDate.setMonth(new Date().getMonth() + 1);
  const dueDate = initDueDate.toISOString().split("T")[0];

  const handleNewOrder = () => {
    clearCart();
    navigate('/sales-rep/add-items');
  };

  if (!cartState || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Data Found</h3>
          <p className="text-gray-500">Please add items to cart and select customer first.</p>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    
    try {
      if (orderTerm === "") {
        setOrderTermError(true);
        toast.error("Please select payment term");
        setIsProcessing(false);
        return;
      }

      if (companyName === "") {
        setCompanyError(true);
        toast.error("Please select billing company");
        setIsProcessing(false);
        return;
      }

      const qtData = {
        quotation_id: quotationId,
        quotation_date: currentDate,
        quotation_due_date: dueDate,
        subtotal: cartState.subtotal,
        discount: Number(cartState.discount),
        selected_items: cartState.selectedItems,
        customer_code: customer.user_code,
        sales_rep_id: user?.user_code || "SR001", // Fallback for when user is not available
        payment_term: orderTerm,
        company: companyName,
      };

      setQuotationData(qtData);
      console.log("quotation-data: ", qtData);

      // Temporarily use mock API call since backend is not connected
      // TODO: Replace with real API when backend is connected
      // const response = await createNewQuotation(qtData);
      // if (response.success) {
      //   console.log("Quotation created successfully");
      //   toast.success("Order placed successfully! 🎉");
      //   setOrderTermError(false);
      //   setCompanyError(false);
      //   
      //   setShowDownloadButton(true);
      //   
      //   // DON'T clear cart here - we need the data to show the quotation
      //   // The cart will be cleared when the user navigates away
      // } else {
      //   console.error("Create quotation failed: ", response.error);
      //   toast.error("Failed to place order. Please try again.");
      // }
      
      // Mock successful response for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResponse = { success: true, data: qtData };
      
      if (mockResponse.success) {
        console.log("Quotation created successfully (mock)");
        toast.success("Order placed successfully! 🎉");
        setOrderTermError(false);
        setCompanyError(false);
        
        setShowDownloadButton(true);
        
        // DON'T clear cart here - we need the data to show the quotation
        // The cart will be cleared when the user navigates away
      } else {
        console.error("Create quotation failed: ", mockResponse.error);
        toast.error("Failed to place order. Please try again.");
      }
      
    } catch (error) {
      console.error("Place order failed: ", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {!showDownloadButton && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-6 lg:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6">
                <FaCheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Order Confirmation
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Review your order details and complete your purchase
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Order Details */}
              <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                
                {/* Customer Details Card */}
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 lg:px-8 py-6 lg:py-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <FaUser className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-white">Customer Details</h3>
                        <p className="text-indigo-100">Billing information</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaUser className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Full Name</p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {customer.firstName} {customer.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaEnvelope className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Email</p>
                          <p className="font-semibold text-gray-900">{customer.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <FaPhone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Phone</p>
                          <p className="font-semibold text-gray-900">{customer.contactNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 sm:col-span-2">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mt-1">
                          <FaMapMarkerAlt className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Address</p>
                          <p className="font-semibold text-gray-900 leading-relaxed">
                            {customer.addressLine1}
                            {customer.addressLine2 && `, ${customer.addressLine2}`}
                            <br />
                            {customer.city}, {customer.district}, {customer.province} {customer.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Card */}
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-600 px-6 lg:px-8 py-6 lg:py-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <FaShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl lg:text-2xl font-bold text-white">Order Items</h3>
                          <p className="text-orange-100">{cartState.selectedItems.length} items selected</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                        <FaStar className="w-4 h-4 text-yellow-300" />
                        <span className="text-white font-medium">Premium</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 lg:p-8">
                    <div className="space-y-6">
                      {cartState.selectedItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-6 p-4 lg:p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="relative">
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover border-2 border-white shadow-lg"
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {item.quantity}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">{item.name}</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              {item.weight && (
                                <div className="flex items-center gap-1">
                                  <FaTags className="w-3 h-3" />
                                  <span>Weight: {item.weight}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-gray-600">
                                {item.quantity} × Rs. {item.price.toLocaleString()}
                              </p>
                              <p className="font-bold text-xl text-orange-600">
                                Rs. {(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Payment & Summary */}
              <div className="xl:col-span-1 space-y-6 lg:space-y-8">
                
                {/* Payment Details Card */}
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FaCreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Payment Details</h3>
                        <p className="text-emerald-100">Configure payment options</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Payment Term */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FaCalendarAlt className="w-4 h-4 text-emerald-500" />
                        Payment Term
                      </label>
                      <div className={cn(
                        "relative border-2 rounded-xl transition-all",
                        orderTermError 
                          ? "border-red-300 bg-red-50" 
                          : "border-gray-200 hover:border-emerald-300 focus-within:border-emerald-500"
                      )}>
                        <select
                          className="w-full px-4 py-3 bg-transparent focus:outline-none appearance-none cursor-pointer"
                          value={orderTerm}
                          onChange={(e) => {
                            setOrderTerm(e.target.value);
                            if (e.target.value !== "") {
                              setOrderTermError(false);
                            }
                          }}
                        >
                          <option value="">Select payment term...</option>
                          <option value="Cash">💵 Cash Payment</option>
                          <option value="Credit">💳 Credit Payment</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {orderTermError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span>⚠️</span> Please select a payment term
                        </p>
                      )}
                    </div>

                    {/* Billing Company */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FaBuilding className="w-4 h-4 text-blue-500" />
                        Billing Company
                      </label>
                      <div className={cn(
                        "relative border-2 rounded-xl transition-all",
                        companyError 
                          ? "border-red-300 bg-red-50" 
                          : "border-gray-200 hover:border-blue-300 focus-within:border-blue-500"
                      )}>
                        <select
                          className="w-full px-4 py-3 bg-transparent focus:outline-none appearance-none cursor-pointer"
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            if (e.target.value !== "") {
                              setCompanyError(false);
                            }
                          }}
                        >
                          <option value="">Select company...</option>
                          <option value="Trollius">🏢 Matara Branch</option>
                          <option value="Mehera">🏢 Galle Branch</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {companyError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span>⚠️</span> Please select a billing company
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FaReceipt className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Order Summary</h3>
                        <p className="text-purple-100">Final pricing breakdown</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <FaTags className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Subtotal</span>
                        </div>
                        <span className="font-semibold">Rs. {cartState.subtotal.toLocaleString()}</span>
                      </div>
                      
                      {cartState.discount > 0 && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <FaPercentage className="w-4 h-4 text-green-500" />
                            <span className="text-green-600">Discount ({cartState.discount}%)</span>
                          </div>
                          <span className="font-semibold text-green-600">
                            -Rs. {((cartState.subtotal * cartState.discount) / 100).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center py-4 border-t-2 border-gray-200">
                        <div className="flex items-center gap-2">
                          <FaGift className="w-5 h-5 text-purple-500" />
                          <span className="text-lg font-bold text-gray-900">Total Amount</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">
                          Rs. {cartState.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-4 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl transition-all duration-300 flex items-center justify-center gap-3",
                    isProcessing
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="w-5 h-5 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <FaRocket className="w-5 h-5" />
                      Place Order Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDownloadButton && (
        <Invoice 
          cartState={cartState} 
          billingDetails={customer} 
          quotationData={quotationData}
          onNewOrder={handleNewOrder}
        />
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
    </>
  );
};

export default OrderConfirmation;