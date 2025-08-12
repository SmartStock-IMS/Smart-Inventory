import { useState } from 'react';
import { UserRoundCheck, User, Mail, Phone, MapPin, Building, Target, Users, Camera, Upload, Sparkles, CheckCircle, AlertCircle, Hash, Briefcase } from 'lucide-react';
import { FaSpinner } from "react-icons/fa";

// Mock Avatar component for demo
const Avatar = ({ firstName, lastName, imageUrl, editable, size, onImageUpload }) => {
  const fileInputRef = useState(null)[0];
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

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

// Mock services for demo
const createSalesRep = async (salesRepData) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, data: { message: "Sales representative added successfully!" } };
};

const generateId = (prefix) => {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
};

const toast = {
  success: (message) => alert(`✅ ${message}`),
  error: (message) => alert(`❌ ${message}`)
};

const AddSalesRep = () => {
  const navigate = { // Mock navigate function
    push: (path) => console.log(`Navigate to: ${path}`)
  };
  
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
    region: '',
    status: 'active',
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      photo: file,
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
    if (!formData.region.trim()) newErrors.region = 'Region is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (validateForm()) {
        const salesRepData = {
          user_code: generateId("SR"),
          first_name: formData.firstName,
          last_name: formData.lastName,
          nic_no: formData.nicNo,
          email: formData.email,
          contact: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.state,
          postal_code: formData.zipCode,
          sales_area: formData.region,
          status: formData.status,
          photo: formData.photo,
        };

        const result = await createSalesRep(salesRepData);
        if (result.success) {
          toast.success(result.data.message);
          setTimeout(() => {
            setIsLoading(false);
            navigate.push('/inventorymanager/sales-rep');
          }, 3000);
        } else {
          console.error('Failed to create sales rep:', result.message);
        }
      }
    } catch (error) {
      console.error("error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", icon: Icon, error, ...props }) => (
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
      {error && <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <UserRoundCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Add Sales Representative</h2>
            <p className="text-white/80">Create a new sales team member profile</p>
          </div>
          <div className="ml-auto">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100%-96px)] p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
                  <h4 className="font-semibold text-gray-800 mb-2">Upload Profile Photo</h4>
                  <p className="text-gray-600 text-sm mb-3">Add a professional photo for the sales representative</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Upload className="w-4 h-4" />
                    Click on avatar to upload image
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Sales Information</h3>
              </div>
              
              <div className="space-y-6">
                <InputField
                  label="Sales Region"
                  name="region"
                  icon={Target}
                  error={errors.region}
                  placeholder="Enter assigned sales region"
                />

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
                    <div className={`absolute top-1/2 right-12 transform -translate-y-1/2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(formData.status)}`}>
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    Adding Sales Rep...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Add Sales Rep
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSalesRep;