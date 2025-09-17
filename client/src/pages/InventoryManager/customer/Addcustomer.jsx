import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRoundCheck, User, Mail, Phone, MapPin, FileText, Camera, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { FaSpinner } from "react-icons/fa";

// API services
const API_BASE_URL = 'http://localhost:3000/api'; // API Gateway URL

const createCustomer = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create customer');
    }

    return data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

const getNextCustomerId = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/next-id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch next customer ID');
    }

    const data = await response.json();
    return data.data.nextCustomerId;
  } catch (error) {
    console.error('Error fetching next customer ID:', error);
    // Fallback to local generation
    const existingCustomersCount = 8;
    const nextNumber = existingCustomersCount + 1;
    return `CUS${nextNumber.toString().padStart(5, '0')}`;
  }
};

const toast = {
  success: (message) => {
    // You can replace this with a proper toast library like react-hot-toast
    alert(`✅ ${message}`);
  },
  error: (message) => {
    // You can replace this with a proper toast library like react-hot-toast
    alert(`❌ ${message}`);
  }
};

const AddCustomer = () => {
  const navigate = useNavigate();

  // Function to generate automatic customer code
  const generateCustomerCode = async () => {
    try {
      return await getNextCustomerId();
    } catch (error) {
      console.error('Error generating customer code:', error);
      // Fallback to local generation
      const existingCustomersCount = 8;
      const nextNumber = existingCustomersCount + 1;
      return `CUS${nextNumber.toString().padStart(5, '0')}`;
    }
  };

  // Generate customer code when component mounts
  useEffect(() => {
    const loadCustomerCode = async () => {
      const code = await generateCustomerCode();
      setGeneratedCode(code);
    };
    loadCustomerCode();
  }, []);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contact2: '',
    address: '',
    status: 'active',
    notes: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
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
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      contact2: '',
      address: '',
      status: 'active',
      notes: ''
    });
    setPreviewImage(null);
    setErrors({});
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (validateForm()) {
        const payload = {
          customer_id: generatedCode,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          contact_no: formData.phone,
          contact2: formData.contact2 || null,
          address: formData.address,
          profile_pic: previewImage || null,
          status: formData.status.toUpperCase(), // Convert to uppercase for enum
          notes: formData.notes || null
        };

        console.log("customer payload: ", payload);

        const res = await createCustomer(payload);
        console.log("response: ", res);
        
        if (res.success) {
          toast.success(res.message);
          // Reset form and navigate back to customer list
          resetForm();
          setTimeout(() => {
            navigate('/inventorymanager/customer-list');
          }, 2000);
        } else {
          toast.error(res.message || 'Failed to create customer');
        }
      }
    } catch (error) {
      console.error("Error creating customer: ", error);
      toast.error(error.message || 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'from-green-500 to-emerald-500';
      case 'inactive': return 'from-red-500 to-pink-500';
      case 'pending': return 'from-yellow-500 to-orange-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 py-3">
      <div className="relative w-full max-w-none px-3">
        {/* Compact Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 text-white relative">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative flex items-center justify-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserRoundCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">Add New Customer</h2>
                <p className="text-blue-100 text-sm">Create a new customer profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-4">
            {/* Error Alert */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-red-700 font-medium text-sm">
                    {Object.values(errors)[0]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Camera className="w-4 h-4 text-blue-500" />
                    Profile Picture <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {previewImage && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Profile picture uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Phone className="w-4 h-4 text-blue-500" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Additional Phone <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="contact2"
                    value={formData.contact2}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter additional phone number"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 resize-none"
                    placeholder="Enter full address"
                  />
                </div>
              </div>



              {/* Additional Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Additional Information</h3>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Users className="w-4 h-4 text-blue-500" />
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 appearance-none bg-white"
                    >
                      <option value="active">✅ Active</option>
                      <option value="inactive">❌ Inactive</option>
                      <option value="pending">⏳ Pending</option>
                    </select>
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r ${getStatusColor(formData.status)} rounded-full`}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Notes <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 resize-none"
                    placeholder="Add any additional notes about this customer..."
                  />
                </div>
              </div>

              {/* Compact Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="group px-4 py-2 text-sm font-medium border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                  onClick={handleClear}
                >
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full group-hover:bg-gray-500 transition-colors"></span>
                  Clear Form
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="group px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;