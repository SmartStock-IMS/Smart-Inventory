import { useForm } from "react-hook-form";
import { useState } from "react";
import { User, Mail, Phone, MessageCircle, MapPin, FileText, UserPlus, Loader2 } from "lucide-react";

// Utility function for classnames
const cn = (...classes) => classes.filter(Boolean).join(' ');

// API call function
const createCustomer = async (data) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

const AddCustomerForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
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
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Combine address fields into a single address string
      const addressParts = [
        data.addressLine1,
        data.addressLine2,
        data.city,
      ].filter(Boolean);

      // Prepare data according to API requirements
      const apiData = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.contactNumber || data.whatsappNumber,
        email: data.email,
        address: addressParts.join(', '),
      };

      // Validate required fields
      if (!apiData.name) {
        showToast("Please enter at least first name or last name", "error");
        return;
      }
      if (!apiData.phone) {
        showToast("Please enter a contact number", "error");
        return;
      }
      if (!apiData.email) {
        showToast("Please enter an email address", "error");
        return;
      }
      if (!apiData.address) {
        showToast("Please enter at least one address field", "error");
        return;
      }

      const response = await createCustomer(apiData);
      console.log("Customer created successfully: ", response);
      showToast("Customer added successfully!", "success");

      // Reset form after successful submission
      setTimeout(() => {
        reset();
      }, 2000);
      
    } catch (error) {
      console.error("Error creating customer: ", error);
      if (error.message.includes('Authentication token not found')) {
        showToast("Please login to continue", "error");
      } else if (error.message.includes('401')) {
        showToast("Session expired. Please login again", "error");
      } else {
        showToast(error.message || "Failed to create customer. Please try again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        } transition-all duration-300 ease-in-out`}>
          {toast.message}
        </div>
      )}

      {/* Form Section */}
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">ADD CUSTOMER</h1>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6 sm:p-8">
              
              {/* Customer Information Section */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mr-4">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Customer Information</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("firstName", { required: "First name is required" })}
                        placeholder="Enter first name"
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700",
                          errors.firstName ? "border-red-300" : "border-gray-300"
                        )}
                      />
                      <User className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("lastName")}
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                      />
                      <User className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register("email", { 
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Please enter a valid email address"
                          }
                        })}
                        placeholder="Enter email address"
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700",
                          errors.email ? "border-red-300" : "border-gray-300"
                        )}
                      />
                      <Mail className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...register("contactNumber", { required: "Contact number is required" })}
                        placeholder="Enter contact number"
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700",
                          errors.contactNumber ? "border-red-300" : "border-gray-300"
                        )}
                      />
                      <Phone className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.contactNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...register("whatsappNumber")}
                        placeholder="Enter WhatsApp number (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                      />
                      <MessageCircle className="absolute right-3 top-3.5 w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-8"></div>

              {/* Address Section */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg mr-4">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Address Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("addressLine1", { required: "Address line 1 is required" })}
                      placeholder="Enter address line 1"
                      className={cn(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700",
                        errors.addressLine1 ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.addressLine1 && (
                      <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      {...register("addressLine2")}
                      placeholder="Enter address line 2 (optional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                    <input
                      type="text"
                      {...register("city")}
                      placeholder="Enter city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">District</label>
                    <select
                      {...register("district")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700"
                    >
                      <option value="">Select District (optional)</option>
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
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Province</label>
                    <input
                      type="text"
                      {...register("province")}
                      placeholder="Enter province"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      {...register("postalCode")}
                      placeholder="Enter postal code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-8"></div>

              {/* Additional Note Section */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg mr-4">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Additional Notes</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea
                    {...register("additionalNote")}
                    placeholder="Add any additional notes or comments here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-700 h-32 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit(onSubmit)}
                  className={cn(
                    "inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-slate-800 rounded-lg shadow-sm",
                    "hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] transition-colors"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Customer...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Add Customer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerForm;