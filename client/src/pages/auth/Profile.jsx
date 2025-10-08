import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth/AuthContext';
import { useTheme } from '../../context/theme/ThemeContext';
import { getUserProfile } from '../../services/user-services';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Loader,
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSalesRep = user?.role === 'sales_rep';
  const containerClasses = `min-h-screen ${isSalesRep ? 'pt-24' : ''} ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`;
  const centerClasses = `min-h-screen ${isSalesRep ? 'pt-24' : ''} flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`;

  useEffect(() => {
    console.log('Profile useEffect - user:', user);
    
    if (user) {
      const userId = user.user_code || user.userCode || user.userid || user.id;
      console.log('Profile useEffect - extracted userId:', userId);
      
      if (userId) {
        fetchUserProfile(userId);
      } else {
        setLoading(false);
        setError('No user ID found in user object');
      }
    } else {
      setLoading(false);
      setError('No user found');
    }
  }, [user]);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for userId:', userId);
      const response = await getUserProfile(userId);
      console.log('Profile API response:', response);
      
      if (response.success && response.user) {
        console.log('Setting profile data:', response.user);
        setProfileData(response.user);
      } else {
        setError('Failed to load profile data');
        console.error('Profile fetch failed:', response);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={centerClasses}>
        <div className={`text-center p-8 rounded-2xl shadow-xl ${
          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}>
          <Loader className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={centerClasses}>
        <div className={`text-center p-8 rounded-2xl shadow-xl ${
          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Error: {error}</h2>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={centerClasses}>
        <div className={`text-center p-8 rounded-2xl shadow-xl ${
          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}>
          <User className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p className="text-lg">No profile data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={containerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Card with Profile Header */}
        <div className={`relative rounded-2xl overflow-hidden shadow-lg mb-6 ${
          isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'
        }`}>
          {/* Blue accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar with gradient border */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl blur opacity-40"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(profileData.first_name?.charAt(0) || profileData.firstName?.charAt(0) || 'U')}{(profileData.last_name?.charAt(0) || profileData.lastName?.charAt(0) || '')}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className={`text-2xl font-bold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {profileData.first_name || profileData.firstName || 'Unknown'} {profileData.last_name || profileData.lastName || 'User'}
                </h1>
                <p className={`text-base mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  @{profileData.username || 'Unknown'}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500 text-white shadow">
                    <Shield className="w-3 h-3 mr-1" />
                    {profileData.role || profileData.user_type || 'User'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-400 text-white shadow">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Personal Information Card */}
          <div className={`rounded-2xl p-5 shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mr-3 shadow">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Personal Information
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="group">
                <div className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className="w-8 h-8 bg-blue-400 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Email Address
                    </p>
                    <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profileData.email || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <div className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className="w-8 h-8 bg-blue-400 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Phone Number
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profileData.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <div className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className="w-8 h-8 bg-blue-400 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Address
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profileData.address || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className={`rounded-2xl p-5 shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mr-3 shadow">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Account Information
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="group">
                <div className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className="w-8 h-8 bg-blue-400 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Account Created
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <div className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className="w-8 h-8 bg-blue-400 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Last Updated
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {profileData.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;