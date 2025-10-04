import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Building,
  Target,
  Briefcase,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  Sparkles,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Avatar component
const Avatar = ({
  firstName,
  lastName,
  imageUrl,
  editable,
  size,
  onImageUpload,
}) => {
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
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageUpload && onImageUpload(e.target.files[0])}
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

// Fetch RM details from list
const getRMDetails = async (resourceManagerId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3000/api/users/resource-manager",
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    const rmList = response.data.data.users;
    const foundRM = rmList.find(
      (rm) => rm.resource_manager_id === resourceManagerId
    );

    if (foundRM) {
      return { success: true, data: foundRM };
    } else {
      return { success: false, message: "Resource manager not found" };
    }
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Update RM details
const updateRMDetails = async (resourceManagerId, updateData) => {
  try {
    const token = localStorage.getItem("token");

    // Split full_name into first_name and last_name
    const nameParts = updateData.full_name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Prepare the request body matching API expectations
    const requestBody = {
      resourceManagerId: resourceManagerId,
      first_name: firstName,
      last_name: lastName,
      email: updateData.email,
      phone: updateData.phone,
      address: updateData.address,
      branch: updateData.branch || "Head Office",
      performance_rating: updateData.performance_rating || null,
    };

    console.log("Sending update request:", requestBody);

    const response = await axios.put(
      `http://localhost:3000/api/users/resource-manager/${resourceManagerId}`,
      requestBody,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log("Update response:", response.data);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

const EditRM = () => {
  const { repCode } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rep, setRep] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    performance_rating: "",
    photo: null,
  });

  useEffect(() => {
    const fetchRM = async () => {
      try {
        setIsLoading(true);
        const result = await getRMDetails(repCode);

        if (result.success && result.data) {
          const rmData = result.data;
          setRep(rmData);
          setFormData({
            full_name: rmData.full_name || "",
            email: rmData.email || "",
            phone: rmData.phone || "",
            address: rmData.address || "",
            performance_rating: rmData.performance_rating
              ? parseFloat(rmData.performance_rating) / 10
              : "",
            photo: null,
          });
        } else {
          toast.error(result.message || "Resource manager not found");
          navigate("/inventorymanager/rm-list");
        }
      } catch (error) {
        console.error("Error fetching RM:", error);
        toast.error("Error loading resource manager details");
        navigate("/inventorymanager/rm-list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRM();
  }, [repCode, navigate]);

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

  const handleImageUpload = (file) => {
    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));
    toast.info("Photo upload feature coming soon!");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim())
      newErrors.full_name = "Full name is required";
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

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      setIsSaving(true);

      // Prepare update data (only send what API expects)
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        performance_rating: formData.performance_rating || null,
      };

      const result = await updateRMDetails(rep.resource_manager_id, updateData);

      if (result.success) {
        toast.success("Resource manager updated successfully!");
        setTimeout(() => {
          navigate(`/inventorymanager/rm-details/${repCode}`);
        }, 1500);
      } else {
        toast.error(result.message || "Failed to update resource manager");
      }
    } catch (error) {
      console.error("Error updating RM:", error);
      toast.error("Error updating resource manager");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/inventorymanager/rm-details/${repCode}`);
  };

  const InputField = ({
    label,
    name,
    type = "text",
    icon: Icon,
    error,
    required = true,
    ...props
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
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
  );

  const TextAreaField = ({
    label,
    name,
    icon: Icon,
    error,
    required = true,
    ...props
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:border-gray-400 ${
            error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaSpinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium text-xl">
            Loading resource manager details...
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rep) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl border border-red-200 shadow-xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-red-700 font-semibold text-lg mb-2">
            Resource Manager Not Found
          </h3>
          <p className="text-red-600 mb-4">
            The requested resource manager could not be loaded
          </p>
          <button
            onClick={() => navigate("/inventorymanager/rm-list")}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Back to Resource Managers
          </button>
        </div>
      </div>
    );
  }

  const getFirstName = () => formData.full_name?.split(" ")[0] || "";
  const getLastName = () =>
    formData.full_name?.split(" ").slice(1).join(" ") || "";

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      <div className="relative w-full max-w-none px-4">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-8 text-white relative">
            {/* Back button - positioned at top */}
            <div className="relative z-10 mb-6">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Details</span>
              </button>

            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Edit Resource Manager Details
                  </h1>
                  <p className="text-white/80 text-lg">
                    {formData.full_name}
                  </p>
                </div>
              </div>
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/40 animate-pulse" />

            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">

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

              <InputField
                label="Full Name"
                name="full_name"
                icon={User}
                error={errors.full_name}
                placeholder="Enter full name"
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
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
                  placeholder="Enter email address"
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  icon={Phone}
                  error={errors.phone}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Address Information
                </h3>
              </div>

              <TextAreaField
                label="Address"
                name="address"
                icon={MapPin}
                error={errors.address}
                placeholder="Enter complete address"
              />
            </div>

            {/* Performance Rating */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Performance Rating
                </h3>
              </div>

              <InputField
                label="Performance Rating"
                name="performance_rating"
                type="number"
                icon={Target}
                error={errors.performance_rating}
                placeholder="Enter performance rating (e.g., 8.5)"
                min="0"
                max="10"
                step="0.1"
                required={false}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter a percentage value between 0 and 10, or leave blank if not
                rated yet.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel Changes
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="w-5 h-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
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
    </div>
  );
};

export default EditRM;
