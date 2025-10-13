import { useRef, useState, useCallback, memo } from "react";
import {
  UserRoundCheck,
  CreditCard,
  UserPlus,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Target,
  Camera,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Lock,
  Shield,
} from "lucide-react";
import axios from "axios";

// Memoized Avatar component to prevent unnecessary re-renders
const Avatar = memo(
  ({ firstName, lastName, imageUrl, editable, size, onImageUpload }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = useCallback(
      (e) => {
        const file = e.target.files[0];
        if (file && onImageUpload) {
          onImageUpload(file);
        }
        e.target.value = "";
      },
      [onImageUpload]
    );

    const initials =
      `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

    return (
      <div className="relative group">
        <div
          className={`w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold transition-transform duration-300 group-hover:scale-105`}
          style={{ width: size, height: size }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">{initials || "👨‍💼"}</span>
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
  }
);

Avatar.displayName = "Avatar";

// Fixed API service with proper data handling
const API_URL = `${import.meta.env.VITE_API_URL}/auth/register`;

const createSalesRep = async (salesRepData) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    console.log("Sales rep data being sent:", salesRepData);

    // Don't use FormData for this API - send as JSON
    const response = await axios.post(API_URL, salesRepData, {
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
      message: error.response?.data?.message || "Failed to create sales rep",
      errors: error.response?.data?.errors || [],
    };
  }
};

const toast = {
  success: (message) => alert(`✅ ${message}`),
  error: (message) => {
    // Handle array of messages or single message
    if (Array.isArray(message)) {
      alert(`❌ Validation Errors:\n\n${message.join('\n')}`);
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
          value={value || ""}
          onChange={onChange}
          autoComplete="off"
          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:border-gray-400 ${
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
  )
);

InputField.displayName = "InputField";

const AddSalesRep = () => {
  const navigate = {
    push: (path) => console.log(`Navigate to: ${path}`),
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nicNo: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    region: "",
    status: "active",
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Stabilized input change handler
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
      nicNo: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      city: "",
      state: "",
      zipCode: "",
      region: "",
      status: "active",
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

    // Check required fields with proper length validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.nicNo?.trim()) {
      newErrors.nicNo = "NIC number is required";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.password?.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }


    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        const firstError = Object.values(errors)[0];
        console.log("Validation errors:", errors);
        toast.error(firstError || "Please fix the validation errors");
        return;
      }

      setIsLoading(true);

      try {
        console.log("Submitting form with data:", formData);

        // Map form data to API format
        const salesRepData = {
          username: `${formData.firstName} ${formData.lastName}`,
          password: formData.password,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          role: "sales_staff",
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          nic: formData.nicNo.trim(),
        };

        console.log("Mapped API data:", salesRepData);

        const result = await createSalesRep(salesRepData);

        if (result.success) {
          toast.success("Sales representative added successfully!");
          // Reset form after successful submission
          setFormData({
            firstName: "",
            lastName: "",
            nicNo: "",
            email: "",
            phone: "",
            address: "",
            password: "",
            city: "",
            state: "",
            zipCode: "",
            region: "",
            status: "active",
            photo: null,
          });
          setErrors({});

          setTimeout(() => {
            navigate.push("/inventorymanager/sales-rep");
          }, 2000);
        } else {
          console.log("API validation errors:", result.errors);
          toast.error(result.message || "Failed to create sales rep");

          // Map API errors to form errors if available
          if (result.errors && Array.isArray(result.errors)) {
            const apiErrors = {};
            result.errors.forEach((error) => {
              const field = error.path;
              apiErrors[field] = error.msg;
            });
            setErrors(apiErrors);
          }
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("An error occurred while creating the sales rep");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, navigate]
  );

  const getStatusColor = useCallback((status) => {
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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-6">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-none px-4">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-8 text-white relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-center gap-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-wide">
                  Add New Sales Staff
                </h2>
                <p className="text-indigo-100 mt-2">
                  Create a new sales team member
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/40 animate-pulse" />
            <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-white/40 animate-pulse delay-500" />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
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
                    User successfully added! 🎉
                  </p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    NIC Number
                  </label>
                  <input
                    type="text"
                    name="nicNo"
                    value={formData.nicNo}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter NIC number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-500" />
                    Profile Picture{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-300"
                      placeholder="salesrep@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-300"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-300 resize-none"
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              {/* Sales Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Sales Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Sales Region
                  </label>
                  <textarea
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-300 resize-none"
                    placeholder="Enter assigned sales region"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    Employment Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm bg-white appearance-none"
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

                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Security
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-500" />
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                        placeholder="Min. 6 characters"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-500" />
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6"></div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="group px-6 py-3 text-sm font-medium border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                  onClick={handleClear}
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-gray-500 transition-colors"></span>
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
                      <span>Adding Sales Rep...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserRoundCheck className="w-4 h-4 group-hover:animate-pulse" />
                      <span>Add Sales Rep</span>
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

export default AddSalesRep;
