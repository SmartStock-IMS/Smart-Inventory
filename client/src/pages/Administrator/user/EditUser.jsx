import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Mail, Phone, Building, MapPin, Calendar, Users, Lock, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';
import axiosInstance from '../../../../src/utills/axiosinstance.jsx';

const EditProfileForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
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
  const [loading, setLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [userId, setUserId] = useState(null);

  // Get user data from location state or provide defaults
  useEffect(() => {
    if (location.state && location.state.user) {
      const user = location.state.user;
      setUserId(user.id);
      
      // Debug: Log the raw joinDate value
      console.log('Raw joinDate from user data:', user.joinDate);
      
      // Format joinDate for HTML date input (YYYY-MM-DD)
      let formattedJoinDate = '';
      if (user.joinDate) {
        try {
          const date = new Date(user.joinDate);
          console.log('Parsed date object:', date);
          if (!isNaN(date.getTime())) {
            formattedJoinDate = date.toISOString().split('T')[0];
            console.log('Formatted joinDate for input:', formattedJoinDate);
          }
        } catch (error) {
          console.warn('Invalid date format for joinDate:', user.joinDate);
        }
      }
      
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: user.address || '',
        role: user.role || '',
        joinDate: formattedJoinDate
      });
    }
  }, [location.state]);

  // Debug: Monitor formData changes
  useEffect(() => {
    console.log('FormData updated:', formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field '${name}' changed to:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear update error when user starts typing
    if (updateError) {
      setUpdateError('');
    }
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

  const submitForm = async () => {
    if (!userId) {
      setUpdateError('User ID not found. Cannot update user.');
      return;
    }

    setLoading(true);
    setUpdateError('');

    try {
      // Prepare update data with correct field mapping for backend
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        branch: formData.company, // company maps to branch in backend
        address: formData.address,
        role: formData.role,
        date_of_employment: formData.joinDate
      };

      // Add password if it was changed
      if (passwordChanged && passwordData.newPassword.trim()) {
        updateData.password = passwordData.newPassword;
      }

      // Get auth token from localStorage (same way other parts of the app do it)
      let token = localStorage.getItem("authToken");
      if (!token) {
        token = localStorage.getItem("token");
      }
      
      if (!token) {
        setUpdateError("Access token not found. Please log in again.");
        return;
      }
      
      // Make API call to update user using axiosInstance like other components
      const response = await axiosInstance.put(`/api/users/${userId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = response.data;

      if (response.status !== 200) {
        throw new Error(result.message || 'Failed to update user');
      }

      console.log('User updated successfully:', result);
      
      // Navigate back with success message
      navigate('/administrator/userdetails', { 
        state: { 
          updatedUser: {
            id: userId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            address: formData.address,
            role: formData.role,
            joinDate: formData.joinDate
          }, 
          message: passwordChanged 
            ? 'User profile and password updated successfully!' 
            : 'User profile updated successfully!' 
        }
      });

    } catch (error) {
      console.error('Error updating user:', error);
      setUpdateError(error.message || 'Failed to update user. Please try again.');
    } finally {
      setLoading(false);
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
    navigate('/administrator/userdetails');
  };

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
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Edit User Profile</h1>
                <p className="text-gray-600 text-sm">Update user information and settings</p>
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
                  'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <p className="text-blue-100 text-sm font-medium">
                  {formData.firstName && formData.lastName ? 
                    `Update ${formData.firstName} ${formData.lastName}'s information` : 
                    'Update user information'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Compact Form Content */}
          <div className="p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information Section */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Basic Information</h3>
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
                      onChange={handleChange}
                    />
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
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="email">
                      <Mail className="w-3 h-3" />
                      Email
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="phone">
                      <Phone className="w-3 h-3" />
                      Phone
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="company">
                      <Building className="w-3 h-3" />
                      Company
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Location Information</h3>
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
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role Information Section */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Role Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="role">
                      <Users className="w-3 h-3" />
                      Role
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="ADMIN">👑 Administrator</option>
                      <option value="INVENTORY_MANAGER">📊 Inventory Manager</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700" htmlFor="joinDate">
                      <Calendar className="w-3 h-3" />
                      Join Date
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                        You can leave the password fields empty to keep the current password. Only fill them if you want to change the user's password.
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

              {/* Error Display */}
              {updateError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Update Failed</h4>
                      <p className="text-xs text-red-700 mt-1">{updateError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  } transition-all duration-200 font-medium text-sm`}
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-4 py-2 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } text-white rounded-lg transition-all duration-200 font-medium shadow-lg text-sm`}
                >
                  {loading ? (
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
                      'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {formData.firstName && formData.lastName ? 
                        `${formData.firstName} ${formData.lastName}` : 
                        'User'}
                    </p>
                    <p className="text-xs text-gray-500">{formData.email}</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800 mb-1">
                        Are you sure you want to change this user's password?
                      </p>
                      <ul className="text-orange-700 space-y-1 text-xs">
                        <li>• The user will need to use the new password to log in</li>
                        <li>• This action cannot be undone</li>
                        <li>• Make sure to inform the user about this change</li>
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
    </div>
  );
};

export default EditProfileForm;