import { useState, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Hash,
  Building,
  Camera,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Save,
  RotateCcw,
  Briefcase,
} from "lucide-react";
import { useTheme } from "../../../context/theme/ThemeContext";

// Memoized Avatar component to prevent unnecessary re-renders
const Avatar = memo(
  ({ name, imageUrl, editable, size, onImageUpload }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = useCallback(
      (e) => {
        const file = e.target.files[0];
        if (file && onImageUpload) {
          onImageUpload(file);
        }
      },
      [onImageUpload]
    );

    const initials = name
      ?.split(" ")
      .map(n => n.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2) || "SP";

    return (
      <div className="relative group">
        <div
          className={`w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold transition-transform duration-300 group-hover:scale-105`}
          style={{ width: size, height: size }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">{initials || "🏢"}</span>
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
              <span className="text-xs font-medium">Upload Logo</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// Fixed API service with proper data handling
const API_URL = `${import.meta.env.VITE_API_URL}/suppliers`;

const createSupplier = async (supplierData) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.keys(supplierData).forEach(key => {
      if (supplierData[key] !== null && supplierData[key] !== undefined) {
        formData.append(key, supplierData[key]);
      }
    });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error("Create supplier error:", error);
    return {
      success: false,
      data: { message: error.message || "Network error occurred" },
      status: 500,
    };
  }
};

const toast = {
  success: (message) => alert(`✅ ${message}`),
  error: (message) => {
    // Handle array of messages or single message
    if (Array.isArray(message)) {
      alert(`❌ ${message.join(", ")}`);
    } else {
      alert(`❌ ${message}`);
    }
  },
};

// Memoized InputField component
const InputField = memo(
  ({
    label,
    name,
    type = "text",
    icon: Icon,
    error,
    value,
    onChange,
    ...props
  }) => {
    const { isDarkMode } = useTheme();
    
    return (
      <div className="space-y-2">
        <label className={`block text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {Icon && <Icon className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
          {label}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            autoComplete="off"
            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 shadow-sm hover:border-gray-400 ${
              error 
                ? "border-red-500 bg-red-50 focus:ring-red-500" 
                : isDarkMode 
                  ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
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
  }
);

InputField.displayName = "InputField";

const AddSupplier = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    contact_no: "",
    email: "",
    address: "",
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Stabilized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }, [errors]);

  const handleClear = () => {
    setFormData({
      name: "",
      contact_no: "",
      email: "",
      address: "",
      photo: null,
    });
    setErrors({});
  };

  const handleImageUpload = useCallback((file) => {
    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim())
      newErrors.name = "Supplier name is required";
    
    if (!formData.contact_no.trim())
      newErrors.contact_no = "Contact number is required";
    else if (!/^[0-9+\-\s()]+$/.test(formData.contact_no))
      newErrors.contact_no = "Invalid contact number format";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.address.trim())
      newErrors.address = "Address is required";

    return newErrors;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      const newErrors = validateForm();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please fix the form errors before submitting");
        return;
      }

      setIsLoading(true);

      try {
        const result = await createSupplier(formData);

        if (result.success) {
          setSuccess(true);
          toast.success("Supplier added successfully!");
          
          // Clear form after successful submission
          setTimeout(() => {
            handleClear();
            setSuccess(false);
            // Navigate back to supplier list (when created)
            // navigate("/inventorymanager/supplier-list");
          }, 2000);
        } else {
          const errorMessage =
            result.data?.message ||
            result.data?.error ||
            "Failed to add supplier";
          
          setError(errorMessage);
          toast.error(errorMessage);

          // Handle validation errors from server
          if (result.data?.errors) {
            setErrors(result.data.errors);
          }
        }
      } catch (err) {
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Submit error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, navigate]
  );

  return (
    <div className={`h-full w-full rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-gray-200'}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Supplier</h1>
            <p className="text-white/80">Create a new supplier profile for your inventory management system</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-140px)] p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Supplier added successfully! Redirecting...
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          )}

          {/* Main Form Container */}
          <div className={`rounded-2xl border shadow-lg overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
            {/* Form Header */}
            <div className={`px-6 py-4 border-b transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
                    <UserPlus className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Supplier Information
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar
                    name={formData.name}
                    imageUrl={formData.photo ? URL.createObjectURL(formData.photo) : null}
                    editable={true}
                    size="80px"
                    onImageUpload={handleImageUpload}
                  />
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-6">
              {/* Basic Information Section */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 pb-2 border-b transition-colors duration-300 ${isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-800 border-gray-200'}`}>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Supplier Name"
                    name="name"
                    icon={Building}
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    placeholder="Enter supplier company name"
                  />
                  
                  <InputField
                    label="Contact Number"
                    name="contact_no"
                    type="tel"
                    icon={Phone}
                    value={formData.contact_no}
                    onChange={handleInputChange}
                    error={errors.contact_no}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 pb-2 border-b transition-colors duration-300 ${isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-800 border-gray-200'}`}>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    placeholder="Enter email address"
                  />
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MapPin className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      Address
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="4"
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 shadow-sm resize-none ${
                          errors.address
                            ? "border-red-500 bg-red-50 focus:ring-red-500"
                            : isDarkMode
                              ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                              : "border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        placeholder="Enter complete address including city and postal code"
                      />
                      {errors.address && (
                        <div className="absolute top-3 right-3">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.address && (
                      <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className={`flex justify-end space-x-4 pt-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <button
                  type="button"
                  className={`group px-6 py-3 text-sm font-medium border-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'}`}
                  onClick={handleClear}
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group px-8 py-3 text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding Supplier...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4 group-hover:animate-pulse" />
                      <span>Add Supplier</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;