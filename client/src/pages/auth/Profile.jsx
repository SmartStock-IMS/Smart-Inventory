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

  // Check if user is SalesRep to add top padding for fixed header
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
        <div className={`text-center p-8 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}>
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={centerClasses}>
        <div className={`text-center p-8 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}>
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-4">Error: {error}</h2>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
        <div className={`text-center p-8 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}>
          <User className="w-8 h-8 mx-auto mb-4 text-gray-500" />
          <p>No profile data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={containerClasses}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className={`rounded-lg p-6 mb-6 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {(profileData.first_name?.charAt(0) || profileData.firstName?.charAt(0) || 'U')}{(profileData.last_name?.charAt(0) || profileData.lastName?.charAt(0) || '')}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h1 className={`text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {profileData.first_name || profileData.firstName || 'Unknown'} {profileData.last_name || profileData.lastName || 'User'}
              </h1>
              <p className={`text-lg mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                @{profileData.username || 'Unknown'}
              </p>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-blue-900 text-blue-200' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <Shield className="w-4 h-4 mr-1" />
                  {profileData.role || profileData.user_type || 'User'}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-green-900 text-green-200' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Personal Information */}
          <div className={`rounded-lg p-6 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {profileData.email || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {profileData.phone || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {profileData.address || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className={`rounded-lg p-6 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <Clock className="w-5 h-5 mr-2" />
              Account Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account Created</p>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</p>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {profileData.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : 'Unknown'}
                  </p>
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