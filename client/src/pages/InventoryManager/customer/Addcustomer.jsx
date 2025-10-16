import { useState, useCallback } from "react";
import {
  UserRoundCheck,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Users,
  Briefcase,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useTheme } from "../../../context/theme/ThemeContext";

// Mock Avatar component for demo
const Avatar = ({
  firstName,
  lastName,
  imageUrl,
  editable,
  size,
  onImageUpload,
}) => {
  const fileInputRef = useState(null)[0];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const initials =
    `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="relative group">
      <div
        className={`w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold transition-transform duration-300 group-hover:scale-105`}
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">{initials || "👤"}</span>
        )}
      </div>

      {editable && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-white text-center">
            <Camera className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-medium">Upload Photo</span>
          </div>
        </div>
      )}
    </div>
  );
};



// Fixed API service with proper data handling
const API_URL = `${import.meta.env.VITE_API_URL}/customers`;

const createCustomer = async (payload) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    console.log("Customer data being sent:", payload);

    // Don't use FormData for this API - send as JSON
    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create customer",
      errors: error.response?.data?.errors || [],
    };
  }
};

const toast = {
  success: (message) => alert(`✅ ${message}`),
  error: (message) => alert(`❌ ${message}`),
};

const AddCustomer = () => {
  const { isDarkMode } = useTheme();
  const navigate = {
    // Mock navigate function
    push: (path) => console.log(`Navigate to: ${path}`),
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    notes: "",
    photo: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      //console.log(`Updating ${name}:`, value, 'New form data:', newData);
      return newData;
    });

    // Clear error when user starts typing
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleClear = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
      notes: "",
    });
    setErrors({});
  };

  const handleImageUpload = useCallback((file) => {
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));
    }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (validateForm()) {
        const payload = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          // status: formData.status,
          // notes: formData.notes,
          // profile_picture: formData.photo || null,
        };

        console.log("customer payload: ", payload);

        const res = await createCustomer(payload);
        console.log("response text: ", res);
        if (res.success) {
          toast.success(res.data.message);
          setTimeout(() => {
            setIsLoading(false);
            navigate.push("/dashboard/customer-list");
          }, 3000);
        } else {
          toast.error(res.message.response.data.error);
        }
      }
    } catch (error) {
      console.error("error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    icon: Icon,
    error,
    ...props
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
        <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-400 ${
            error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
          }`}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100'} py-6 transition-colors duration-300`}>
      <div className="relative w-full max-w-none px-4">
        {/* Header Section */}
        <div className={`${isDarkMode ? 'bg-gray-800/80 border-gray-600/20' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-2xl shadow-2xl border mb-8 overflow-hidden transition-colors duration-300`}>
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-500 to-blue-400'} p-8 text-white relative transition-colors duration-300`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-center gap-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <UserRoundCheck className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-wide">
                  Add New Customer
                </h2>
                <p className="text-indigo-100 mt-2">
                  Create a new customer profile
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/40 animate-pulse" />
            <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-white/40 animate-pulse delay-500" />
          </div>
        </div>

        {/* Main Content */}
        <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-600/20' : 'bg-white/90 border-white/20'} backdrop-blur-sm rounded-2xl shadow-2xl border overflow-hidden transition-colors duration-300`}>
          <div className="p-8">
            {/* Enhanced Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-lg shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Enhanced Success Alert */}
            {success && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-green-700 font-medium">
                    Customer successfully added! 🎉
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className={`flex items-center gap-3 pb-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-300`}>
                  <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} rounded-lg transition-colors duration-300`}>
                    <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-blue-600'} transition-colors duration-300`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} items-center gap-2 transition-colors duration-300`}>
                      <span className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-blue-500'} rounded-full transition-colors duration-300`}></span>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-gray-500/20 hover:border-gray-500' : 'border-gray-200 bg-white text-gray-800 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'}`}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} items-center gap-2 transition-colors duration-300`}>
                      <span className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-blue-500'} rounded-full transition-colors duration-300`}></span>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-gray-500/20 hover:border-gray-500' : 'border-gray-200 bg-white text-gray-800 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'}`}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} items-center gap-2 transition-colors duration-300`}>
                    <Camera className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'} transition-colors duration-300`} />
                    Profile Picture{" "}
                    <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs transition-colors duration-300`}>(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={handleInputChange}
                      accept="image/*"
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-gray-500/20 hover:border-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500' : 'border-gray-200 bg-white text-gray-800 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'}`}
                    />
                    {formData.profilePicture && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>{formData.profilePicture.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className={`flex items-center gap-3 pb-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-300`}>
                  <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} rounded-lg transition-colors duration-300`}>
                    <Mail className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-blue-600'} transition-colors duration-300`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} items-center gap-2 transition-colors duration-300`}>
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'} transition-colors duration-300`} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-gray-500/20 hover:border-gray-500' : 'border-gray-200 bg-white text-gray-800 focus:border-green-500 focus:ring-green-500/20 hover:border-gray-300'}`}
                      placeholder="customer@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} items-center gap-2 transition-colors duration-300`}>
                      <Phone className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'} transition-colors duration-300`} />
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-gray-500/20 hover:border-gray-500' : 'border-gray-200 bg-white text-gray-800 focus:border-green-500 focus:ring-green-500/20 hover:border-gray-300'}`}
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} items-center gap-2 transition-colors duration-300`}>
                    <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'} transition-colors duration-300`} />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-gray-500/20 hover:border-gray-500' : 'border-gray-200 bg-white text-gray-800 focus:border-green-500 focus:ring-green-500/20 hover:border-gray-300'}`}
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <div className={`flex items-center gap-3 pb-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-300`}>
                  <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} rounded-lg transition-colors duration-300`}>
                    <FileText className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-blue-600'} transition-colors duration-300`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>
                    Additional Information
                  </h3>
                </div>
              </div>

              <div>
                <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 items-center gap-2 transition-colors duration-300`}>
                  <Briefcase className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                  Customer Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 shadow-sm appearance-none transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 focus:ring-gray-500 focus:border-gray-500' : 'border-gray-300 bg-white text-gray-800 focus:ring-green-500 focus:border-green-500'}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                  <div
                    className={`absolute top-1/2 right-12 transform -translate-y-1/2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(formData.status)}`}
                  >
                    {formData.status.charAt(0).toUpperCase() +
                      formData.status.slice(1)}
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 flex items-center gap-2 transition-colors duration-300`}>
                  <FileText className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 shadow-sm resize-none transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500' : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:ring-green-500 focus:border-green-500'}`}
                  placeholder="Add any additional notes about this customer..."
                />
              </div>

              {/* Submit Button */}
              <div className={`flex justify-end space-x-4 pt-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <button
                  type="button"
                  className={`group px-6 py-3 text-sm font-medium border-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'}`}
                  onClick={handleClear} 
                >
                  <span className={`w-2 h-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-400 group-hover:bg-gray-300' : 'bg-gray-400 group-hover:bg-gray-500'}`}></span>
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding Customer...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserRoundCheck className="w-4 h-4 group-hover:animate-pulse" />
                      <span>Add Customer</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
