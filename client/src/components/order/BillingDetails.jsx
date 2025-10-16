// Remove unused imports since we're using mock data
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import {
//   createCustomer,
//   getAllCustomers,
// } from "../../services/user-services.js";
import { useCart } from "../../context/cart/CartContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { cn } from "../../lib/utils.js";
import generateId from "../../lib/generate-id.js";
import { FaSpinner, FaSearch, FaUser, FaPlus, FaMapMarkerAlt, FaStickyNote, FaArrowRight } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const BillingDetails = () => {
  console.log("🛒 BillingDetails component rendering");
  
  const navigate = useNavigate();
  const { setCustomer, cartState } = useCart();
  
  console.log("🛒 Cart state in BillingDetails:", cartState);
  
  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      whatsappNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      district: "",
      province: "",
      postalCode: "",
      additionalNote: "",
    },
  });
  
  // State management
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(true);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Remove mock customer data and use API
  // const mockCustomers = [ ... ];

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/customers`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const result = await response.json();
        if (result && result.data && Array.isArray(result.data.customers)) {
          // Map API data to expected structure
          const mappedCustomers = result.data.customers.map((c, idx) => ({
            id: c.customer_id,
            user_code: c.customer_id, 
            first_name: c.name?.split(" ")[0] || "",
            last_name: c.name?.split(" ").slice(1).join(" ") || "",
            email: c.email || "",
            contact1: c.contact_no || "",
            contact2: c.contact_no || "",
            address_line1: c.address || "",
            address_line2: "",
            city: "", // Not provided in API
            district: "",
            province: "",
            postal_code: "",
            note: "",
          }));
          setCustomers(mappedCustomers);
        } else {
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers: ", error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Filter customers by search
  useEffect(() => {
    console.log("customers: ", customers);
    if (searchQuery.trim()) {
      const filtered = customers.filter(
        (customer) =>
          `${customer.first_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [searchQuery, customers]);

  // Remove unused API import and function since we're using mock data
  // const getCustomers = async () => {
  //   try {
  //     const response = await getAllCustomers();
  //     if (response.success) {
  //       return response.data;
  //     } else {
  //       console.error("Error fetching customers: ", response.message);
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error("Error getting customers.", error);
  //     return null;
  //   }
  // };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    const selectedCustomer = {
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      contactNumber: customer.contact1,
      whatsappNumber: customer.contact2,
      addressLine1: customer.address_line1,
      addressLine2: customer.address_line2,
      city: customer.city,
      district: customer.district,
      province: customer.province,
      postalCode: customer.postal_code,
      additionalNote: customer.note,
      user_code: customer.user_code,
      id: customer.id,
    };
    reset(selectedCustomer);
    setCustomer(selectedCustomer);
    setIsCustomer(true);
    setSearchQuery("");
    setFilteredCustomers([]);
    setShowCustomerSearch(false);
  };

  // Helper to decode JWT and extract role_id (sales_staff_id)
  function getSalesStaffIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return "SR001";
    try {
      const payload = jwtDecode(token);
      return payload.role_id || "SR001";
    } catch {
      return "SR001";
    }
  }

  // Mock customer creation for development
  const customerSubmit = async (data) => {
    setIsLoading(true);

    try {
      let customerId = "";
      let salesStaffId = getSalesStaffIdFromToken();
      let selectedCustomer = null;

      if (!isCustomer) {
        // Simulate customer creation without API call
        const newCustomerCode = generateId("C");
        customerId = newCustomerCode;
        selectedCustomer = {
          ...data,
          user_code: newCustomerCode
        };
        toast.success("Customer added successfully!");
        setIsCustomer(true);
        setCustomer(selectedCustomer);
      } else {
        // If customer was selected from search
        selectedCustomer = {
          ...data,
          user_code: data.user_code
        };
        // Prefer user_code, fallback to id
        customerId = data.user_code || data.id;
        setCustomer(selectedCustomer);
      }

      // Use selected items from cartState
      const items = (cartState?.selectedItems || []).map(item => ({
        product_id: item.code,
        quantity: item.quantity
      }));

      if (!customerId || !salesStaffId || !items.length) {
        toast.error("Customer, sales staff, and items are required.");
        setIsLoading(false);
        return;
      }

      // Use today's date + 7 days as delivery_date for demo
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);
      const deliveryDateStr = deliveryDate.toISOString().split("T")[0];

      const orderPayload = {
        customer_id: customerId,
        sales_staff_id: salesStaffId,
        items,
        order_type: "quotation",
        delivery_date: deliveryDateStr
      };

      // Call API endpoint
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();
      if (response.ok && result && result.success !== false) {
        toast.success("Quotation created successfully!");
        // Proceed to confirmation after short delay
        setTimeout(() => {
          reset();
          navigate("/order/confirmation");
        }, 1500);
      } else {
        throw new Error(result?.message || "Failed to create quotation");
      }
    } catch (error) {
      console.error("Error in customer submit: ", error);
      toast.error("Failed to create quotation. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Always show step 2 of 3 for BillingDetails
  let progress = 2 / 3;

  console.log("🛒 About to render BillingDetails, progress:", progress);

  // Test render - if you see this, the component is working
  if (!cartState) {
    console.log("🛒 No cart state found, showing fallback");
    return (
      <div className="min-h-screen bg-red-100 p-8">
        <h1 className="text-2xl font-bold text-red-800">BillingDetails - No Cart State</h1>
        <p>Cart state is: {JSON.stringify(cartState)}</p>
        <button 
          onClick={() => navigate("/order/add-items")} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go Back to Add Items
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24">
        
        {/* Customer Search Section */}
        {showCustomerSearch && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 lg:px-12 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FaSearch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Find Customer</h2>
                  <p className="text-blue-100 text-sm sm:text-base">Search existing customers or add new</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-12">
              {/* Search Input */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FaSearch className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Type customer name to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 text-base border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Customer List Dropdown */}
              <div className="relative mb-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <FaSpinner className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-blue-500">Loading customers...</span>
                  </div>
                ) : (
                  (searchQuery.trim() || customers.length > 0) && (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-2xl backdrop-blur-sm max-h-80 overflow-hidden">
                      {/* Dropdown Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            {searchQuery.trim() 
                              ? `${filteredCustomers.length} customer(s) found`
                              : `${customers.length} total customer(s)`
                            }
                          </span>
                          {searchQuery.trim() && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                        
                      {/* Customer Items */}
                      <div className="max-h-64 overflow-y-auto">
                        {(() => {
                          const displayCustomers = searchQuery.trim() ? filteredCustomers : customers;
                          return displayCustomers.length > 0 ? (
                            displayCustomers.map((customer, index) => (
                              <button
                                key={customer.id}
                                onClick={() => handleCustomerSelect(customer)}
                                className="w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 focus:outline-none transition-all duration-200 border-b border-slate-100 last:border-b-0 group"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Avatar */}
                                  <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                      <FaUser className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                  </div>
                                  
                                  {/* Customer Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                        {customer.first_name} {customer.last_name}
                                      </h4>
                                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                        #{customer.user_code || customer.id}
                                      </span>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      {customer.email && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                          <span className="truncate">{customer.email}</span>
                                        </div>
                                      )}
                                      
                                      {customer.contact1 && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                          <span>{customer.contact1}</span>
                                        </div>
                                      )}
                                      
                                      {customer.address_line1 && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                          <span className="truncate">{customer.address_line1}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Select Arrow */}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaArrowRight className="w-4 h-4 text-blue-500" />
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-6 py-8 text-center">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                {searchQuery.trim() ? (
                                  <FaSearch className="w-6 h-6 text-slate-400" />
                                ) : (
                                  <FaUser className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              <p className="text-slate-500 font-medium">
                                {searchQuery.trim() ? "No customers found" : "No customers available"}
                              </p>
                              <p className="text-slate-400 text-sm">
                                {searchQuery.trim() ? "Try a different search term" : "Create your first customer"}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Dropdown Footer */}
                      {(() => {
                        const displayCustomers = searchQuery.trim() ? filteredCustomers : customers;
                        return displayCustomers.length > 0 && (
                          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                            <button
                              onClick={() => setShowCustomerSearch(false)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                            >
                              <FaPlus className="w-3 h-3" />
                              Add New Customer Instead
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )
                )}
              </div>

              {/* Add New Customer Button */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={() => setShowCustomerSearch(false)}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 touch-manipulation group"
                >
                  <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                    <FaPlus className="w-4 h-4" />
                  </div>
                  Add New Customer
                  <FaArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <div className="text-center text-slate-500">
                  <p className="text-sm">Can't find the customer?</p>
                  <p className="text-xs">Create a new customer profile</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Form Section */}
        {!showCustomerSearch && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 sm:px-8 lg:px-12 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FaUser className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Add Customer</h2>
                    <p className="text-slate-200 text-sm sm:text-base">Create new customer profile</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowCustomerSearch(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                >
                  <FaSearch className="w-4 h-4" />
                  Search Instead
                </button>
              </div>
              
              {/* Mobile Search Button */}
              <button
                onClick={() => setShowCustomerSearch(true)}
                className="sm:hidden mt-4 flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
              >
                <FaSearch className="w-4 h-4" />
                Search Customer
              </button>
            </div>

            <form onSubmit={handleSubmit(customerSubmit)} className="p-6 sm:p-8 lg:p-12">
              
              <div className="space-y-8">
                
                {/* Customer Information Section */}
                <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Customer Information</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">First Name *</label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      {...register("firstName", {
                        required: "First name required.",
                      })}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200",
                        errors.firstName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      {...register("lastName")}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200",
                        errors.lastName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      {...register("email")}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200",
                        errors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Contact Number</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      {...register("contactNumber")}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200",
                        errors.contactNumber
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      )}
                    />
                    {errors.contactNumber && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.contactNumber.message}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Number */}
                  <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 space-y-2">
                    <label className="text-sm font-medium text-slate-700">WhatsApp Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="Enter WhatsApp number"
                      {...register("whatsappNumber")}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:outline-none focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Address Information</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                  {/* Combined Address Field */}
                  <div className="col-span-6 space-y-2">
                    <label className="text-sm font-medium text-slate-700">Address</label>
                    <input
                      type="text"
                      placeholder="Address (e.g. No 34, Kanaththagoda Road, Madiha, City)"
                      {...register("addressLine1")}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200",
                        errors.addressLine1
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      )}
                    />
                    {errors.addressLine1 && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.addressLine1.message}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">District</label>
                    <select
                      {...register("district")}
                      defaultValue=""
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 bg-white",
                        "invalid:text-slate-400",
                        errors.district
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-200",
                      )}
                    >
                      <option value="" disabled className="text-slate-400">
                        Select District
                      </option>
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Matale">Matale</option>
                      <option value="Nuwara-eliya">Nuwara Eliya</option>
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Hambantota">Hambantota</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kilinochchi">Kilinochchi</option>
                      <option value="Mannar">Mannar</option>
                      <option value="Mullaitivu">Mullaitivu</option>
                      <option value="Vavuniya">Vavuniya</option>
                      <option value="Trincomalee">Trincomalee</option>
                      <option value="Batticaloa">Batticaloa</option>
                      <option value="Ampara">Ampara</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Puttalam">Puttalam</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Polonnaruwa">Polonnaruwa</option>
                      <option value="Badulla">Badulla</option>
                      <option value="Monaragala">Monaragala</option>
                      <option value="Ratnapura">Ratnapura</option>
                      <option value="Kegalle">Kegalle</option>
                    </select>
                    {errors.district && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.district.message}
                      </p>
                    )}
                  </div>

                  {/* Province */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Province</label>
                    <input
                      type="text"
                      placeholder="Enter province"
                      {...register("province")}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:outline-none focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Postal Code</label>
                    <input
                      type="text"
                      placeholder="Enter postal code"
                      {...register("postalCode")}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200",
                        errors.postalCode
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      )}
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Notes Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FaStickyNote className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Additional Notes</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Special Instructions or Notes</label>
                  <textarea
                    placeholder="Any additional information about the customer..."
                    rows={4}
                    {...register("additionalNote")}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:outline-none focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 touch-manipulation",
                    isLoading
                      ? "bg-slate-400 text-slate-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:shadow-lg active:shadow-md"
                  )}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Customer
                      <FaArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              </div>
            </form>
          </div>
        )}
      </div>
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
        progress={progress}
      />
    </div>
  );
};

export default BillingDetails;