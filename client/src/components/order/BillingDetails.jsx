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
import { cn } from "@lib/utils.js";
import generateId from "@lib/generate-id.js";
import { FaSpinner, FaSearch, FaUser, FaPlus, FaMapMarkerAlt, FaStickyNote, FaArrowRight } from "react-icons/fa";

const BillingDetails = () => {
  const navigate = useNavigate();
  const { setCustomer } = useCart();
  
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

  // Mock customer data for development
  const mockCustomers = [
    {
      id: 1,
      user_code: "C001",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@email.com",
      contact1: "0771234567",
      contact2: "0771234567",
      address_line1: "123 Main Street",
      address_line2: "Apt 4B",
      city: "Colombo",
      district: "Colombo",
      province: "Western",
      postal_code: "00100",
      note: "Regular customer"
    },
    {
      id: 2,
      user_code: "C002", 
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@email.com",
      contact1: "0777654321",
      contact2: "0777654321",
      address_line1: "456 Oak Avenue",
      address_line2: "",
      city: "Kandy",
      district: "Kandy",
      province: "Central",
      postal_code: "20000",
      note: "Wholesale customer"
    },
    {
      id: 3,
      user_code: "C003",
      first_name: "Michael",
      last_name: "Johnson",
      email: "michael.j@email.com", 
      contact1: "0712345678",
      contact2: "0712345678",
      address_line1: "789 Pine Road",
      address_line2: "Unit 12",
      city: "Galle",
      district: "Galle", 
      province: "Southern",
      postal_code: "80000",
      note: "VIP customer"
    }
  ];

  // Use mock data instead of API call
  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setCustomers(mockCustomers);
    }, 500);
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
    };
    reset(selectedCustomer);
    setCustomer({
      ...selectedCustomer,
      user_code: customer.user_code,
    });
    setIsCustomer(true);
    setSearchQuery("");
    setFilteredCustomers([]);
    setShowCustomerSearch(false);
  };

  // Mock customer creation for development
  const customerSubmit = async (data) => {
    setIsLoading(true);

    try {
      if (!isCustomer) {
        // Simulate customer creation without API call
        const newCustomerCode = generateId("C");
        const newCustomer = {
          user_code: newCustomerCode,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          contact1: data.contactNumber,
          contact2: data.whatsappNumber,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2,
          city: data.city,
          district: data.district,
          province: data.province,
          postal_code: data.postalCode,
          note: data.additionalNote,
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("Mock customer created: ", newCustomer);
        toast.success("Customer added successfully!");
        setIsCustomer(true);
        setCustomer({
          ...data,
          user_code: newCustomerCode
        });
      }
      
      // Navigate to confirmation after short delay
      setTimeout(() => {
        reset();
        navigate("/order/confirmation");
      }, 2000);
    } catch (error) {
      console.error("Error in customer submit: ", error);
      toast.error("Failed to create customer. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search existing customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                
                {/* Search Results Dropdown */}
                {filteredCustomers.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-4 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-sm text-slate-600">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Customer Button */}
              <button
                onClick={() => setShowCustomerSearch(false)}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 touch-manipulation"
              >
                <FaPlus className="w-4 h-4" />
                Add New Customer
              </button>
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
      />
    </div>
  );
};

export default BillingDetails;