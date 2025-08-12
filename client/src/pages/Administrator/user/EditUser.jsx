import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Mail, Phone, Building, Globe, MapPin, Calendar, Users } from 'lucide-react';

const EditProfileForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    address: '',
    role: '',
    joinDate: ''
  });

  // Get user data from location state or provide defaults
  useEffect(() => {
    if (location.state && location.state.user) {
      const user = location.state.user;
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        website: user.website || '',
        address: user.address || '',
        role: user.role || '',
        joinDate: user.joinDate || ''
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // After successful save, navigate back to user details with updated data
    navigate('/administrator/userdetails', { 
      state: { updatedUser: formData, message: 'User updated successfully!' }
    });
  };

  const handleCancel = () => {
    navigate('/administrator/userdetails');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-6">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full px-4">
        {/* Enhanced Page Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-full transition-all duration-200 shadow-lg"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Edit User Profile</h1>
                <p className="text-gray-600 mt-1">Update user information and settings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center space-x-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30">
                {formData.firstName && formData.lastName ? 
                  `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}` : 
                  'U'}
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-wide">Edit Profile</h2>
                <p className="text-indigo-100 font-medium">
                  {formData.firstName && formData.lastName ? 
                    `Update ${formData.firstName} ${formData.lastName}'s information` : 
                    'Update user information'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Form Content */}
          <div className="p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="firstName">
                      <User className="w-4 h-4" />
                      First Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="lastName">
                      <User className="w-4 h-4" />
                      Last Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="email">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="phone">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="company">
                      <Building className="w-4 h-4" />
                      Company
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="website">
                      <Globe className="w-4 h-4" />
                      Website
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Location Information</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="address">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role Information Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Role Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="role">
                      <Users className="w-4 h-4" />
                      Role
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="Admin">👑 Administrator</option>
                      <option value="Manager">📊 Inventory Manager</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="joinDate">
                      <Calendar className="w-4 h-4" />
                      Join Date
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="joinDate"
                      name="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;