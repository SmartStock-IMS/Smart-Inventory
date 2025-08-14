import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Mail, Phone, Building, Globe, MapPin, Calendar, Users, Lock, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';

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

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);

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
    
    // Mark that password has been changed
    if (!passwordChanged && (name === 'newPassword' || name === 'confirmPassword')) {
      setPasswordChanged(true);
    }
  };

  const validatePassword = () => {
    if (passwordChanged) {
      if (!passwordData.newPassword) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

  const submitForm = () => {
    const updatedData = { ...formData };
    if (passwordChanged) {
      updatedData.passwordChanged = true;
      // In a real app, you would hash the password on the server
      console.log('New password would be updated:', passwordData.newPassword);
    }
    
    console.log('Form submitted:', updatedData);
    
    // After successful save, navigate back to user details with updated data
    navigate('/administrator/userdetails', { 
      state: { 
        updatedUser: updatedData, 
        message: passwordChanged 
          ? 'User profile and password updated successfully!' 
          : 'User profile updated successfully!' 
      }
    });
  };

  const handlePasswordConfirm = () => {
    setShowPasswordConfirmModal(false);
    submitForm();
  };

  const handlePasswordCancel = () => {
    setShowPasswordConfirmModal(false);
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

              {/* Password Management Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Password Management</h3>
                  <div className="ml-auto">
                    {passwordChanged && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Password will be changed
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Password Change Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Changing the password will require the user to log in with the new credentials. Make sure to inform them about the password change.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="newPassword">
                      <Lock className="w-4 h-4" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {passwordError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {passwordError}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>• Password must be at least 6 characters long</p>
                  <p>• Make sure both password fields match</p>
                  <p>• Leave blank to keep the current password</p>
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

      {/* Custom Password Confirmation Modal */}
      {showPasswordConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Confirm Password Change</h3>
                  <p className="text-orange-100 text-sm">This action requires confirmation</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {formData.firstName && formData.lastName ? 
                      `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}` : 
                      'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {formData.firstName && formData.lastName ? 
                        `${formData.firstName} ${formData.lastName}` : 
                        'User'}
                    </p>
                    <p className="text-sm text-gray-500">{formData.email}</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800 mb-1">
                        Are you sure you want to change this user's password?
                      </p>
                      <ul className="text-orange-700 space-y-1">
                        <li>• The user will need to use the new password to log in</li>
                        <li>• This action cannot be undone</li>
                        <li>• Make sure to inform the user about this change</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">New Password Length:</span>
                    <span className="text-gray-800">{passwordData.newPassword.length} characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Password Confirmation:</span>
                    <span className={passwordData.newPassword === passwordData.confirmPassword ? "text-green-600" : "text-red-600"}>
                      {passwordData.newPassword === passwordData.confirmPassword ? "Matched" : "Not matched"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handlePasswordConfirm}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfileForm;