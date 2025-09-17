import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, User, Save, Camera, Upload, Mail, Phone, MapPin, Hash, FileText, AlertCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCustomerByUserCode, updateCustomer } from "@services/customer-services";

// Mock Avatar component for demo
const Avatar = ({ firstName, lastName, imageUrl, editable, size, onImageUpload }) => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  
  return (
    <div className="relative group">
      <div 
        className={`w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold transition-transform duration-300 group-hover:scale-105`}
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{initials || '👤'}</span>
        )}
      </div>
      
      {editable && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageUpload && onImageUpload(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-white text-center">
            <Camera className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Upload Photo</span>
          </div>
        </div>
      )}
    </div>
  );
};

const EditCustomer = () => {
  const { customer_id } = useParams(); // Get customer customer_id from URL params
  const navigate = useNavigate();
  
  console.log("Raw customer_id from params:", customer_id);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_id: "",
    first_name: "",
    last_name: "",
    email: "",
    contact_no: "",
    contact2: "",
    address: "",
    status: "ACTIVE",
    notes: "",
    profile_pic: ""
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        console.log("Fetching customer with customer_id:", customer_id);
        
        const response = await getCustomerByUserCode(customer_id);
        
        if (response.success && response.data) {
          const customer = response.data.customer || response.data.data?.customer || response.data;
          setFormData({
            customer_id: customer.customer_id || "",
            first_name: customer.first_name || "",
            last_name: customer.last_name || "",
            email: customer.email || "",
            contact_no: customer.contact_no || "",
            contact2: customer.contact2 || "",
            address: customer.address || "",
            status: customer.status || "ACTIVE",
            notes: customer.notes || "",
            profile_pic: customer.profile_pic || ""
          });
          setPreviewImage(customer.profile_pic || null);
          console.log("Customer loaded:", customer);
        } else {
          setError("Customer not found");
          toast.error("Customer not found");
        }
      } catch (err) {
        setError("Error loading customer data");
        toast.error("Error loading customer data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (customer_id) {
      fetchCustomer();
    }
  }, [customer_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.contact_no.trim()) newErrors.contact_no = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = {
        customer_id: formData.customer_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        contact_no: formData.contact_no,
        contact2: formData.contact2 || null,
        address: formData.address,
        status: formData.status,
        notes: formData.notes || null,
        profile_pic: previewImage || null
      };

      try {
        console.log("Updating customer:", payload);
        
        const response = await updateCustomer(customer_id, payload);
        
        if (response.success) {
          toast.success(response.data?.message || "Customer updated successfully!");
          
          // Navigate back to customer details
          navigate(`/inventorymanager/customer/${formData.customer_id}`);
        } else {
          toast.error(response.message || "Failed to update customer");
        }
      } catch (err) {
        toast.error(err.message || "Error updating customer");
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 py-3 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Customer</h2>
          <p className="text-gray-600">Please wait while we fetch the customer details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 py-3 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Customer</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/inventorymanager/customer-list')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Customer List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 py-3">
      <div className="relative w-full px-3">
        {/* Compact Page Header */}
        <div className="mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/inventorymanager/customer/${customer_id}`)}
                className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Edit Customer</h1>
                <p className="text-gray-600 text-sm">Update customer information and settings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white/30">
                {formData.first_name && formData.last_name ? 
                  `${formData.first_name.charAt(0)}${formData.last_name.charAt(0)}` : 
                  'CU'}
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Customer Profile</h2>
                <p className="text-blue-100 text-sm font-medium">
                  {formData.first_name && formData.last_name ? 
                    `Update ${formData.first_name} ${formData.last_name}'s information` : 
                    'Update customer information'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Compact Form Content */}
          <div className="p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Avatar Section */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Camera className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Customer Photo</h3>
                </div>
                
                <div className="flex flex-col items-center">
                  <Avatar
                    firstName={formData.first_name}
                    lastName={formData.last_name}
                    imageUrl={previewImage}
                    editable={true}
                    size={96}
                    onImageUpload={(file) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreviewImage(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <div className="mt-3 text-center">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Update Profile Photo</h4>
                    <p className="text-gray-600 text-xs mb-2">Add or change the profile photo for easy identification</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Upload className="w-3 h-3" />
                      Click on avatar to upload new image
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="customer_id">
                      <Hash className="w-3 h-3" />
                      Customer ID
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
                      id="customer_id"
                      name="customer_id"
                      value={formData.customer_id}
                      disabled
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="first_name">
                      <User className="w-3 h-3" />
                      First Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.first_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="last_name">
                      <User className="w-3 h-3" />
                      Last Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="email">
                      <Mail className="w-3 h-3" />
                      Email Address
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="contact_no">
                      <Phone className="w-3 h-3" />
                      Phone Number
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="contact_no"
                      name="contact_no"
                      value={formData.contact_no}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                    {errors.contact_no && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.contact_no}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="contact2">
                      <Phone className="w-3 h-3" />
                      Additional Phone
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="contact2"
                      name="contact2"
                      value={formData.contact2}
                      onChange={handleInputChange}
                      placeholder="Enter additional phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Address Information</h3>
                </div>
                
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="address">
                    <MapPin className="w-3 h-3" />
                    Address
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter complete address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Additional Information</h3>
                </div>
                
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="notes">
                    <FileText className="w-3 h-3" />
                    Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any additional notes about this customer..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/inventorymanager/customer/${customer_id}`)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
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
      />
    </div>
  );
};

export default EditCustomer;