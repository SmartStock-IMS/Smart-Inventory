import { useForm } from "react-hook-form";
import { useState } from "react";
import { User, Mail, Phone, MessageCircle, MapPin, FileText, UserPlus, Loader2 } from "lucide-react";

// Mock functions for the demo
const cn = (...classes) => classes.filter(Boolean).join(' ');
const generateId = (prefix) => `${prefix}${Date.now()}`;
const createCustomer = async (data) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, data: { message: "Customer created successfully" } };
};

const AddCustomerForm = () => {
  const { register, handleSubmit, reset } = useForm({
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
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const customerCode = generateId("C");
      const formData = {
        user_code: customerCode,
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
      const response = await createCustomer(formData);

      if (!response.success) {
        console.error("Error creating customer: ", response.message);
        showToast("Failed to create customer", "error");
        return;
      }
      console.log("success message: ", response.data.message);
      showToast("Customer added successfully!", "success");

      setTimeout(() => {
        reset();
      }, 3000);
    } catch (error) {
      console.error("Error in customer submit: ", error);
      showToast("Failed to create customer. Try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-md ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header Section - Hidden */}
      <div className="bg-slate-50 border-b border-gray-200" style={{display: 'none'}}>
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-lg mb-6">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Add New Customer
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Enter customer details to create a new account in the system
            </p>
          </div>
        </div>
      </div>

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
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("firstName")}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                      />
                      <User className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                      />
                      <Mail className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("contactNumber")}
                        placeholder="Enter contact number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                      />
                      <Phone className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("whatsappNumber")}
                        placeholder="Enter WhatsApp number"
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address Line 1</label>
                    <input
                      type="text"
                      {...register("addressLine1")}
                      placeholder="Enter address line 1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700"
                    />
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
                      required={true}
                      defaultValue=""
                      {...register("district")}
                      className={cn(
                        "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700",
                        "invalid:text-gray-400",
                      )}
                    >
                      <option value="" disabled>Select District</option>
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
                    "disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
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