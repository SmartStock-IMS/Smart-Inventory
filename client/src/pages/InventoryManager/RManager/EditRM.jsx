import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, User, Mail, Phone, MapPin, Hash, Building, Target, Briefcase, Save, X, CheckCircle, AlertCircle, Camera, Upload, Lock, Eye, EyeOff, AlertTriangle, Check } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { getAllResourceManagers, updateUser } from "@services/user-services";
import "react-toastify/dist/ReactToastify.css";

// Mock Avatar component
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
          <span className="text-2xl">{initials || '👨‍💼'}</span>
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

const EditRM = () => {
  const { repCode } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rep, setRep] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nicNo: '',
    email: '',
    phone: '',
    address: '',
    salesRegion: '',
    status: 'Active',
    photo: null
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);

  useEffect(() => {
    const fetchResourceManager = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 Fetching resource manager with ID:", repCode);
        
        // Check if user is authenticated
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) {
          console.error("❌ No authentication token found");
          toast.error("Please log in to edit resource manager details");
          navigate("/inventorymanager/rm-list");
          return;
        }
        
        // Fetch all resource managers and find the specific one
        const result = await getAllResourceManagers();
        console.log("📥 Resource managers result:", result);
        
        if (result.success && result.data) {
          // Convert repCode to string for comparison since URL params are always strings
          const targetId = String(repCode);
          const foundRep = result.data.find(rm => 
            String(rm.userID) === targetId || 
            String(rm.id) === targetId ||
            String(rm.user_id) === targetId
          );
          
          if (foundRep) {
            console.log("✅ Found resource manager:", foundRep);
            console.log("🔍 Checking NIC field values:");
            console.log("foundRep.nic_no:", foundRep.nic_no);
            console.log("foundRep.nicNo:", foundRep.nicNo);
            console.log("foundRep.nic:", foundRep.nic);
            console.log("foundRep.NIC:", foundRep.NIC);
            console.log("All foundRep keys:", Object.keys(foundRep));
            
            setRep(foundRep);
            const newFormData = {
              firstName: foundRep.first_name || foundRep.firstName || '',
              lastName: foundRep.last_name || foundRep.lastName || '',
              nicNo: foundRep.nic_no || foundRep.nicNo || foundRep.nic || foundRep.NIC || '',
              email: foundRep.email || '',
              phone: foundRep.phone || '',
              address: foundRep.address || '',
              salesRegion: foundRep.branch || foundRep.salesRegion || 'Resource Management',
              status: foundRep.status || 'Active',
              photo: null
            };
            
            console.log("📋 Setting form data:", newFormData);
            setFormData(newFormData);
          } else {
            console.error("❌ Resource manager not found with ID:", repCode);
            toast.error("Resource manager not found");
            navigate("/inventorymanager/rm-list");
          }
        } else {
          console.error("❌ Failed to fetch resource managers:", result.message);
          toast.error(result.message || "Failed to fetch resource manager details");
          navigate("/inventorymanager/rm-list");
        }
      } catch (error) {
        console.error("💥 Error fetching resource manager:", error);
        
        // Handle network and authentication errors
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. You don't have permission to edit this resource manager.");
          navigate("/inventorymanager/rm-list");
        } else if (error.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Error loading resource manager details");
        }
        navigate("/inventorymanager/rm-list");
      } finally {
        setIsLoading(false);
      }
    };

    if (repCode) {
      fetchResourceManager();
    } else {
      toast.error("Invalid resource manager ID");
      navigate("/inventorymanager/rm-list");
    }
  }, [repCode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (file) => {
    setFormData(prev => ({
      ...prev,
      photo: file
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
    
    // Mark that password has been changed only if both fields have content
    if (value.trim() && (passwordData.newPassword.trim() || passwordData.confirmPassword.trim())) {
      setPasswordChanged(true);
    } else if (!passwordData.newPassword.trim() && !passwordData.confirmPassword.trim()) {
      setPasswordChanged(false);
    }
  };

  const validatePassword = () => {
    // If user hasn't entered any password data, skip validation
    if (!passwordData.newPassword.trim() && !passwordData.confirmPassword.trim()) {
      setPasswordChanged(false);
      return true;
    }
    
    // If user started entering password, validate it
    if (passwordData.newPassword.trim() || passwordData.confirmPassword.trim()) {
      setPasswordChanged(true);
      
      if (!passwordData.newPassword.trim()) {
        setPasswordError('New password is required');
        return false;
      }
      if (passwordData.newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters long');
        return false;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.nicNo.trim()) newErrors.nicNo = 'NIC number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.salesRegion.trim()) newErrors.salesRegion = 'Sales region is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Validate password if it was changed
    if (!validatePassword()) {
      return;
    }
    
    // Show confirmation dialog if password was changed
    if (passwordChanged) {
      setShowPasswordConfirmModal(true);
      return;
    }
    
    // If no password change, submit directly
    submitForm();
  };

  const submitForm = async () => {
    try {
      setIsSaving(true);
      console.log("💾 Saving resource manager updates...");
      
      // Prepare the update data
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        nic_no: formData.nicNo,
        branch: formData.salesRegion,
        status: formData.status,
        role: "RESOURCE_MANAGER" // Ensure the role stays correct
      };

      // Add password if it was changed
      if (passwordChanged && passwordData.newPassword.trim()) {
        updateData.password = passwordData.newPassword;
      }
      
      console.log("📤 Update data:", updateData);
      
      // Call the update API
      const result = await updateUser(rep.userID || rep.id, updateData);
      console.log("✅ Update result:", result);
      
      if (result.success) {
        toast.success(passwordChanged 
          ? "Resource manager and password updated successfully!" 
          : "Resource manager updated successfully!");
        
        setTimeout(() => {
          navigate(`/inventorymanager/rm-details/${repCode}`);
        }, 1500);
      } else {
        toast.error(result.message || "Failed to update resource manager");
      }
      
    } catch (error) {
      console.error("💥 Error updating resource manager:", error);
      
      // Handle specific error types
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("Access denied. You don't have permission to update this resource manager.");
      } else if (error.response?.status === 404) {
        toast.error("Resource manager not found.");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Error updating resource manager");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordConfirm = () => {
    setShowPasswordConfirmModal(false);
    submitForm();
  };

  const handlePasswordCancel = () => {
    setShowPasswordConfirmModal(false);
  };

  const handleCancel = () => {
    navigate(`/inventorymanager/rm-details/${repCode}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl border border-gray-200 shadow-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <FaSpinner className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading resource manager details...</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-0"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
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
          <h3 className="text-red-700 font-semibold text-lg mb-2">Resource Manager Not Found</h3>
          <p className="text-red-600 mb-4">The requested resource manager could not be loaded</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 py-3">
      <div className="relative w-full px-3">
        {/* Compact Page Header */}
        <div className="mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Edit Resource Manager</h1>
                <p className="text-gray-600 text-sm">Update resource manager information and settings</p>
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
                {formData.firstName && formData.lastName ? 
                  `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}` : 
                  'RM'}
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Resource Manager Profile</h2>
                <p className="text-blue-100 text-sm font-medium">
                  {formData.firstName && formData.lastName ? 
                    `Update ${formData.firstName} ${formData.lastName}'s information` : 
                    'Update resource manager information'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Compact Form Content */}
          <div className="p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
            <form onSubmit={handleSave} className="space-y-4">
              {/* Avatar Section */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Camera className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Manager Photo</h3>
                </div>
                
                <div className="flex flex-col items-center">
                  <Avatar
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                    imageUrl={formData.photo ? URL.createObjectURL(formData.photo) : ''}
                    editable={true}
                    onImageUpload={handleImageUpload}
                    size={96}
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
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="firstName">
                      <User className="w-3 h-3" />
                      First Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="lastName">
                      <User className="w-3 h-3" />
                      Last Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="nicNo">
                      <Hash className="w-3 h-3" />
                      NIC Number
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="nicNo"
                      name="nicNo"
                      value={formData.nicNo}
                      onChange={handleInputChange}
                      placeholder="Enter NIC number (e.g., 199512345678)"
                    />
                    {errors.nicNo && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.nicNo}
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
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="phone">
                      <Phone className="w-3 h-3" />
                      Phone Number
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.phone}
                      </p>
                    )}
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
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
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

              {/* Resource Management Information */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Resource Management Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="salesRegion">
                      <Target className="w-3 h-3" />
                      Resource Area
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="salesRegion"
                      name="salesRegion"
                      value={formData.salesRegion}
                      onChange={handleInputChange}
                      placeholder="Enter assigned resource management area"
                    />
                    {errors.salesRegion && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.salesRegion}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="status">
                      <Briefcase className="w-3 h-3" />
                      Employment Status
                    </label>
                    <div className="relative">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
                      <div className={`absolute top-1/2 right-8 transform -translate-y-1/2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(formData.status)}`}>
                        {formData.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Management Section */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Lock className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Password Management</h3>
                  <div className="ml-auto">
                    {passwordChanged && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Password will be changed
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 text-blue-600 mt-0.5">ℹ️</div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Optional Password Change</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        You can leave the password fields empty to keep the current password. Only fill them if you want to change the resource manager's password.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="newPassword">
                      <Lock className="w-3 h-3" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password (optional)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                      <Lock className="w-3 h-3" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password (optional)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {passwordError && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <X className="w-3 h-3" />
                      {passwordError}
                    </p>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-600">
                  <p>• Password fields are optional - leave blank to keep current password</p>
                  <p>• If changing password, it must be at least 6 characters long</p>
                  <p>• Make sure both password fields match when changing password</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className={`flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  } transition-all duration-200 font-medium text-sm`}
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex items-center justify-center gap-2 px-4 py-2 ${
                    isSaving 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } text-white rounded-lg transition-all duration-200 font-medium shadow-lg text-sm`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Custom Password Confirmation Modal */}
      {showPasswordConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-t-xl text-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Confirm Password Change</h3>
                  <p className="text-orange-100 text-sm">This action requires confirmation</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {formData.firstName && formData.lastName ? 
                      `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}` : 
                      'RM'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {formData.firstName && formData.lastName ? 
                        `${formData.firstName} ${formData.lastName}` : 
                        'Resource Manager'}
                    </p>
                    <p className="text-xs text-gray-500">{formData.email}</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800 mb-1">
                        Are you sure you want to change this resource manager's password?
                      </p>
                      <ul className="text-orange-700 space-y-1 text-xs">
                        <li>• The resource manager will need to use the new password to log in</li>
                        <li>• This action cannot be undone</li>
                        <li>• Make sure to inform the resource manager about this change</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <Lock className="w-3 h-3" />
                    <span className="font-medium">New Password Length:</span>
                    <span className="text-gray-800">{passwordData.newPassword.length} characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className="w-3 h-3" />
                    <span className="font-medium">Password Confirmation:</span>
                    <span className={passwordData.newPassword === passwordData.confirmPassword ? "text-green-600" : "text-red-600"}>
                      {passwordData.newPassword === passwordData.confirmPassword ? "Matched" : "Not matched"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handlePasswordCancel}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
                <button
                  onClick={handlePasswordConfirm}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Check className="w-3 h-3" />
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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

export default EditRM;