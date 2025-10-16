import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Save,
  X,
  Camera,
  Upload,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Building,
  Hash,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../../../context/theme/ThemeContext";

// Avatar component
const Avatar = ({ name, imageUrl, editable, size, onImageUpload }) => {
  const fileInputRef = useState(null)[0];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const getInitials = (fullName) => {
    const names = fullName?.split(" ") || [];
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return fullName?.substring(0, 2).toUpperCase() || "👤";
  };

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
          <span className="text-3xl">{getInitials(name)}</span>
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
            <span className="text-xs font-medium">Update Photo</span>
          </div>
        </div>
      )}
    </div>
  );
};

const EditCustomer = () => {
  const { user_code } = useParams(); // This is customer_id from backend
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: "",
    name: "",
    email: "",
    contact_no: "",
    address: "",
    photo: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch all customers
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/customers`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        // Find the specific customer by customer_id
        const foundCustomer = response.data.data.customers.find(
          (c) => c.customer_id === user_code
        );

        if (foundCustomer) {
          setFormData({
            customer_id: foundCustomer.customer_id || "",
            name: foundCustomer.name || "",
            email: foundCustomer.email || "",
            contact_no: foundCustomer.contact_no || "",
            address: foundCustomer.address || "",
            photo: foundCustomer.photo || "",
          });
          setPreviewImage(foundCustomer.photo || null);
          console.log("Customer loaded:", foundCustomer);
        } else {
          setError("Customer not found");
        }
      } catch (err) {
        setError("Error loading customer data");
        console.error("API error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [user_code]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.contact_no.trim())
      newErrors.contact_no = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      contact_no: formData.contact_no,
      address: formData.address,
      // photo: previewImage // Include if your API supports photo upload
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      // Update customer - adjust endpoint based on your actual API
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/customers/${formData.customer_id}`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log("Customer updated successfully:", response.data);
      alert("Customer updated successfully!");

      // Navigate back to customer details
      navigate(`/inventorymanager/customer/${formData.customer_id}`);
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert(
        "Error updating customer: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    icon: Icon,
    error,
    required = false,
    ...props
  }) => (
    <div className="space-y-2">
      <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} items-center gap-2 transition-colors duration-300`}>
        {Icon && <Icon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 ${isDarkMode ? 'focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500' : 'focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'} shadow-sm ${
            error 
              ? "border-red-500 bg-red-50" 
              : isDarkMode 
                ? "border-gray-600 bg-gray-700 text-gray-200" 
                : "border-gray-300 bg-white text-gray-800"
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

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">
            Loading customer details...
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl border border-red-200 shadow-xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-red-700 font-semibold text-lg mb-2">
            Error Loading Customer
          </h3>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate("/inventorymanager/customer-list")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Customer List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'} rounded-3xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-xl overflow-hidden transition-colors duration-300`}>
      <div className="relative w-full max-w-none px-4">
        {/* Header Section */}
        <div className={`${isDarkMode ? 'bg-gray-800/80 border-gray-600/20' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-2xl shadow-2xl border mb-8 overflow-hidden transition-colors duration-300`}>
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-500 to-blue-400'} p-8 text-white relative transition-colors duration-300`}>
            {/* Back button - positioned at top */}
            <div className="relative z-10 mb-6">
              <button
                onClick={() =>
                  navigate(`/inventorymanager/customer/${user_code}`)
                }
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Customer Details
              </button>
            </div>

            {/* Header content */}
            <div className="relative flex gap-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-wide">
                  Edit Customer Profile
                </h2>
                <p className="text-indigo-100 mt-2">{formData.name}</p>
              </div>
            </div>

            {/* Decorative elements */}
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/40 animate-pulse" />
          </div>
        </div>

        {/* Content Section */}
        <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-600/20' : 'bg-white/90 border-white/20'} backdrop-blur-sm rounded-2xl shadow-2xl border overflow-hidden transition-colors duration-300`}>
          <div className="p-8">
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

                <div className="space-y-6">
                  <div>
                    <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 items-center gap-2 transition-colors duration-300`}>
                      <Hash className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                      Customer ID
                    </label>
                    <input
                      type="text"
                      name="customer_id"
                      value={formData.customer_id}
                      disabled
                      className={`w-full px-4 py-3 border rounded-xl cursor-not-allowed transition-colors duration-300 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-600'}`}
                    />
                  </div>

                  <InputField
                    label="Full Name"
                    name="name"
                    icon={User}
                    error={errors.name}
                    required={true}
                    placeholder="Enter customer's full name"
                  />
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
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={Mail}
                    error={errors.email}
                    required={true}
                    placeholder="customer@email.com"
                  />

                  <InputField
                    label="Phone Number"
                    name="contact_no"
                    type="tel"
                    icon={Phone}
                    error={errors.contact_no}
                    required={true}
                    placeholder="+94 71 234 5678"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <div className={`flex items-center gap-3 pb-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-300`}>
                  <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} rounded-lg transition-colors duration-300`}>
                    <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-blue-600'} transition-colors duration-300`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>
                    Address Information
                  </h3>
                </div>

                <div>
                  <label className={`flex text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 items-center gap-2 transition-colors duration-300`}>
                    <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                    Full Address
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Enter complete address including street, city, and postal code..."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${isDarkMode ? 'focus:ring-gray-500 focus:border-gray-500' : 'focus:ring-blue-500 focus:border-blue-500'} shadow-sm resize-none transition-all duration-200 ${
                      errors.address
                        ? "border-red-500 bg-red-50"
                        : isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-gray-200" 
                          : "border-gray-300 bg-white text-gray-800"
                    }`}
                  ></textarea>
                  {errors.address && (
                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl border shadow-sm p-6 transition-colors duration-300`}>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/inventorymanager/customer/${user_code}`)
                    }
                    className={`px-6 py-3 ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'} rounded-xl transition-colors font-medium flex items-center gap-2 duration-300`}
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                    Cancel Changes
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`px-8 py-3 text-white ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} rounded-xl transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;
