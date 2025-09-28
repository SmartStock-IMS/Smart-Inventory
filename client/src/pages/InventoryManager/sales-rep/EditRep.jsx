import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, User, Mail, Phone, MapPin, Hash, Building, Target, Briefcase, Save, X, CheckCircle, AlertCircle, Camera, Upload, Sparkles, Star, Activity } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mock sales reps data matching the main list
const mockSalesReps = [
  {
    emp_code: "EMP001",
    sales_area: "Mumbai Central",
    commission_rate: 5.5,
    target_amount: 500000,
    achievements: 420000,
    join_date: "2022-01-15",
    status: "Active",
    is_active: true,
    monthly_performance: [45000, 52000, 48000, 55000, 42000, 47000],
    total_clients: 25,
    active_deals: 8,
    closed_deals: 17,
    users: {
      name: "Arjun Singh",
      email: "arjun.singh@company.com",
      phone: "+91 98765 43210",
      contact: "+91 98765 43210",
      address: "Plot 123, Sector 15, Navi Mumbai, Maharashtra 400614",
      first_name: "Arjun",
      last_name: "Singh",
      nic_no: "199512345678",
      city: "Mumbai",
      state: "Maharashtra",
      zip_code: "400614"
    }
  },
  {
    emp_code: "EMP002",
    sales_area: "Delhi North",
    commission_rate: 6.0,
    target_amount: 450000,
    achievements: 465000,
    join_date: "2021-08-20",
    status: "Active",
    is_active: true,
    monthly_performance: [38000, 42000, 51000, 48000, 55000, 61000],
    total_clients: 32,
    active_deals: 12,
    closed_deals: 28,
    users: {
      name: "Sneha Patel",
      email: "sneha.patel@company.com",
      phone: "+91 87654 32109",
      contact: "+91 87654 32109",
      address: "House 456, Block A, Rohini, New Delhi 110085",
      first_name: "Sneha",
      last_name: "Patel",
      nic_no: "198812345679",
      city: "New Delhi",
      state: "Delhi",
      zip_code: "110085"
    }
  },
  {
    emp_code: "EMP003",
    sales_area: "Bangalore East",
    commission_rate: 5.8,
    target_amount: 600000,
    achievements: 580000,
    join_date: "2020-12-10",
    status: "Active",
    is_active: true,
    monthly_performance: [62000, 58000, 65000, 72000, 68000, 75000],
    total_clients: 40,
    active_deals: 15,
    closed_deals: 35,
    users: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@company.com",
      phone: "+91 76543 21098",
      contact: "+91 76543 21098",
      address: "Flat 789, Whitefield, Bangalore, Karnataka 560066",
      first_name: "Rajesh",
      last_name: "Kumar",
      nic_no: "198512345677",
      city: "Bangalore",
      state: "Karnataka",
      zip_code: "560066"
    }
  }
];

const getSalesRepDetails = async () => {  
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3000/api/users/sales-staff",
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// Mock Avatar component
const Avatar = ({ firstName, lastName, imageUrl, editable, size, onImageUpload }) => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  
  return (
    <div className="relative group">
      <div 
        className={`w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold transition-transform duration-300 group-hover:scale-105`}
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{initials || '👨‍💼'}</span>
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

// Mock services
// const toast = {
//   success: (message) => console.log(`✅ ${message}`),
//   error: (message) => console.log(`❌ ${message}`)
// };

const EditRep = () => {
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
    city: '',
    state: '',
    zipCode: '',
    salesRegion: '',
    status: 'Active',
    photo: null
  });

  useEffect(() => {
    const fetchSalesRep = async () => {
  try {
    // Get data from API instead of using mockSalesReps
    const result = await getSalesRepDetails();
    
    if (result.success && result.data) {
      // Map the API data to match your component structure
      const salesRepsData = result.data.data.users.map((user) => ({
        emp_code: user.sales_staff_id,
        sales_area: "N/A", // Add default or get from API if available
        commission_rate: parseFloat(user.performance_rating) || 0,
        target_amount: parseFloat(user.target) || 0,
        achievements: parseFloat(user.achieved) || 0,
        join_date: user.join_date || new Date().toISOString(),
        status: user.status || "Active",
        is_active: true,
        monthly_performance: [0, 0, 0, 0, 0, 0], // Default values or calculate from API
        total_clients: 0, // Add from API if available
        active_deals: 0, // Add from API if available  
        closed_deals: 0, // Add from API if available
        users: {
          name: user.full_name,
          email: user.email,
          phone: user.phone,
          contact: user.phone,
          address: "N/A", // Add from API if available
          first_name: user.full_name?.split(' ')[0] || '',
          last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
          nic_no: "N/A", // Add from API if available
          city: "N/A", // Add from API if available
          state: "N/A", // Add from API if available
          zip_code: "N/A" // Add from API if available
        }
      }));

      // Find the specific rep using the repCode parameter
      const foundRep = salesRepsData.find(r => r.emp_code === repCode);
      
      if (foundRep) {
        setRep(foundRep);
        setFormData({
          firstName: foundRep.users.first_name || foundRep.users.name.split(' ')[0] || '',
          lastName: foundRep.users.last_name || foundRep.users.name.split(' ').slice(1).join(' ') || '',
          nicNo: foundRep.users.nic_no || '',
          email: foundRep.users.email || '',
          phone: foundRep.users.phone || foundRep.users.contact || '',
          address: foundRep.users.address || '',
          city: foundRep.users.city || '',
          state: foundRep.users.state || '',
          zipCode: foundRep.users.zip_code || '',
          salesRegion: foundRep.sales_area || '',
          status: foundRep.status || 'Active',
          photo: null
        });
      } else {
        toast.error("Sales representative not found");
        navigate("/inventorymanager/sales-rep");
      }
    } else {
      console.error("Failed to fetch sales reps:", result.message);
      toast.error("Error loading sales representative details");
      navigate("/inventorymanager/sales-rep");
    }
  } catch (error) {
    console.error("Error fetching sales rep:", error);
    toast.error("Error loading sales representative details");
    navigate("/inventorymanager/sales-rep");
  } finally {
    setIsLoading(false);
  }
};

    setTimeout(fetchSalesRep, 1200);
  }, [repCode]);

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
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.salesRegion.trim()) newErrors.salesRegion = 'Sales region is required';

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
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Sales representative updated successfully!");
      
      setTimeout(() => {
        navigate(`/inventorymanager/sales-rep/${repCode}`);
      }, 1500);
      
    } catch (error) {
      console.error("Error updating sales rep:", error);
      toast.error("Error updating sales representative");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/inventorymanager/sales-rep/${repCode}`);
  };

  const InputField = ({ label, name, type = "text", icon: Icon, error, required = true, ...props }) => (
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
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
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
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaSpinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium text-xl">Loading sales representative details...</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-0"></div>
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
          <h3 className="text-red-700 font-semibold text-lg mb-2">Sales Representative Not Found</h3>
          <p className="text-red-600 mb-4">The requested sales representative could not be loaded</p>
          <button
            onClick={() => navigate("/inventorymanager/sales-rep")}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Back to Sales Reps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back to Details</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Edit Sales Representative</h1>
                <p className="text-white/80 text-lg">Update sales representative information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-white text-green-600 hover:bg-gray-100 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
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
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-140px)] p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Representative Photo</h3>
            </div>
            
            <div className="flex flex-col items-center">
              <Avatar
                firstName={formData.firstName}
                lastName={formData.lastName}
                imageUrl={formData.photo ? URL.createObjectURL(formData.photo) : ''}
                editable={true}
                onImageUpload={handleImageUpload}
                size={128}
              />
              <div className="mt-4 text-center">
                <h4 className="font-semibold text-gray-800 mb-2">Update Profile Photo</h4>
                <p className="text-gray-600 text-sm mb-3">Add or change the profile photo for easy identification</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Upload className="w-4 h-4" />
                  Click on avatar to upload new image
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                icon={User}
                error={errors.firstName}
                placeholder="Enter first name"
              />
              <InputField
                label="Last Name"
                name="lastName"
                icon={User}
                error={errors.lastName}
                placeholder="Enter last name"
              />
            </div>
            
            <div className="mt-6">
              <InputField
                label="NIC Number"
                name="nicNo"
                icon={Hash}
                error={errors.nicNo}
                placeholder="Enter NIC number (e.g., 199512345678)"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
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
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
            </div>
            
            <div className="space-y-6">
              <InputField
                label="Street Address"
                name="address"
                icon={MapPin}
                error={errors.address}
                placeholder="Enter street address"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="City"
                  name="city"
                  icon={Building}
                  error={errors.city}
                  placeholder="Enter city"
                />
                <InputField
                  label="State/Province"
                  name="state"
                  icon={MapPin}
                  error={errors.state}
                  placeholder="Enter state"
                />
                <InputField
                  label="ZIP Code"
                  name="zipCode"
                  icon={Hash}
                  error={errors.zipCode}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>

          {/* Sales Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Sales Information</h3>
            </div>
            
            <div className="space-y-6">
              <InputField
                label="Sales Region"
                name="salesRegion"
                icon={Target}
                error={errors.salesRegion}
                placeholder="Enter assigned sales region"
              />

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Employment Status
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm bg-white appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <div className={`absolute top-1/2 right-12 transform -translate-y-1/2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(formData.status)}`}>
                    {formData.status}
                  </div>
                </div>
              </div>
            </div>
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
  );
};

export default EditRep;