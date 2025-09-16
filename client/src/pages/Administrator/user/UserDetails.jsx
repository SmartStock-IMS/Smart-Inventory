import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Building, Globe, User, Search, ArrowLeft, Calendar, Edit3, Star, Users } from 'lucide-react';
import axiosInstance from '../../../../src/utills/axiosinstance.jsx';

const UserDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, user: null });

    // Remove user function
    const removeUser = async (userId) => {
        try {
            let token = localStorage.getItem("authToken");
            if (!token) {
                token = localStorage.getItem("token");
            }
            if (!token) {
                setError("Access token not found. Please log in again.");
                return;
            }

            const response = await axiosInstance.delete(`/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                // Remove user from local state
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                
                // If deleted user was selected, select another user or clear selection
                if (selectedUser?.id === userId) {
                    const remainingUsers = users.filter(user => user.id !== userId);
                    setSelectedUser(remainingUsers.length > 0 ? remainingUsers[0] : null);
                    setShowMobileDetails(false);
                }
                
                // Show success message (you can replace this with a toast notification)
                alert('User removed successfully!');
            } else {
                setError('Failed to remove user');
            }
        } catch (err) {
            console.error('Error removing user:', err);
            if (err.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else if (err.response?.status === 404) {
                setError('User not found.');
            } else {
                setError('Error removing user. Please try again.');
            }
        }
    };

    // Fetch users from backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                let token = localStorage.getItem("authToken");
                if (!token) {
                    token = localStorage.getItem("token");
                }
                if (!token) {
                    setError("Access token not found. Please log in again.");
                    setLoading(false);
                    return;
                }
                
                // Fetch users with a higher limit to get all administrators and inventory managers
                const response = await axiosInstance.get('/api/users/', {
                    params: {
                        limit: 100 // Get more users to ensure we capture all admins and managers
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (response.data.success) {
                    // Transform and filter backend data to show only administrators and inventory managers
                    const transformedUsers = response.data.data.users
                        .filter(user => {
                            const userRole = user.role?.toUpperCase();
                            return userRole === 'ADMIN' || userRole === 'INVENTORY_MANAGER';
                        })
                        .map(user => ({
                            id: user.userID,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            email: user.email,
                            phone: user.phone,
                            address: user.address,
                            company: user.branch || 'Not specified', // Use branch as company
                            website: 'Not specified', // Not available in current schema
                            role: user.role,
                            joinDate: user.date_of_employment,
                            avatarUrl: user.pic_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`,
                            nic: user.nic
                        }));
                    setUsers(transformedUsers);
                    if (transformedUsers.length > 0) {
                        setSelectedUser(transformedUsers[0]);
                    }
                } else {
                    setError('Failed to fetch users');
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                if (err.response?.status === 401) {
                    setError('Authentication failed. Please log in again.');
                } else {
                    setError('Error fetching users. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Handle updated user data from EditUser page
    useEffect(() => {
        if (location.state && location.state.updatedUser) {
            const updatedUser = location.state.updatedUser;
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === selectedUser.id ? 
                    { ...user, ...updatedUser, id: user.id, avatarUrl: user.avatarUrl } : 
                    user
                )
            );
            setSelectedUser(prevSelected => ({ ...prevSelected, ...updatedUser }));
            
            // Show success message if provided
            if (location.state.message) {
                console.log(location.state.message);
                // You can add a toast notification here if you have one implemented
            }
            
            // Clear the state to prevent re-triggering
            window.history.replaceState({}, document.title);
        }
    }, [location.state, selectedUser?.id]);

    const filteredUsers = users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleColor = (role) => {
        if (role.toLowerCase().includes('admin')) {
            return 'from-blue-500 to-blue-600';
        } else if (role.toLowerCase().includes('manager')) {
            return 'from-blue-400 to-blue-500';
        } else if (role.toLowerCase().includes('inventory')) {
            return 'from-blue-400 to-blue-500';
        }
        return 'from-blue-400 to-blue-500';
    };

    const getRoleIcon = (role) => {
        if (role.toLowerCase().includes('admin')) {
            return '👑';
        } else if (role.toLowerCase().includes('manager')) {
            return '💼';
        } else if (role.toLowerCase().includes('inventory')) {
            return '📦';
        }
        return '👤';
    };

    const UserDetailsComponent = ({ user, onBack, onEditUser }) => (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 h-full overflow-hidden">
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 p-4 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5"></div>
                
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* Enhanced Back button for mobile */}
                        <button 
                            onClick={onBack}
                            className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src={user.avatarUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-12 w-12 rounded-full border-2 border-white/30 shadow-md"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{`${user.firstName} ${user.lastName}`}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{getRoleIcon(user.role)}</span>
                                    <p className="text-blue-100 text-sm font-medium">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onEditUser}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 text-sm"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span className="font-medium">Edit</span>
                        </button>
                        <button
                            onClick={() => setDeleteConfirmation({ show: true, user })}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 text-sm"
                        >
                            <span className="font-medium">Remove</span>
                        </button>
                    </div>
                </div>
                
                {/* Mobile Action Buttons */}
                <div className="sm:hidden flex gap-2 mt-3">
                    <button 
                        onClick={onEditUser}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 text-sm"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span className="font-medium">Edit</span>
                    </button>
                    <button
                        onClick={() => setDeleteConfirmation({ show: true, user })}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 text-sm"
                    >
                        <span className="font-medium">Remove</span>
                    </button>
                </div>
            </div>

            {/* Compact Content */}
            <div className="p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                            <div className="p-1.5 bg-blue-100 rounded-md">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">Basic Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-md">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-md">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                                    <p className="text-sm font-semibold text-gray-800 truncate">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-md">
                                    <Building className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Company</p>
                                    <p className="text-sm font-semibold text-gray-800 truncate">{user.company}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-md">
                                    <Globe className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase">NIC</p>
                                    <p className="text-sm font-semibold text-gray-800 truncate">{user.nic || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                            <div className="p-1.5 bg-blue-100 rounded-md">
                                <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">Location</h3>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-md">
                                <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase">Address</p>
                                <p className="text-sm font-semibold text-gray-800">{user.address || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Role & Join Date */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                            <div className="p-1.5 bg-blue-100 rounded-md">
                                <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">Role Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{getRoleIcon(user.role)}</span>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Role</p>
                                </div>
                                <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getRoleColor(user.role)}`}>
                                    {user.role}
                                </div>
                            </div>
                            
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <p className="text-xs font-medium text-gray-500 uppercase">Join Date</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">{new Date(user.joinDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 flex items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                    <div className="text-blue-500 text-2xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 py-3">
            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Remove User</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to remove <strong>{deleteConfirmation.user?.firstName} {deleteConfirmation.user?.lastName}</strong>? 
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmation({ show: false, user: null })}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    removeUser(deleteConfirmation.user.id);
                                    setDeleteConfirmation({ show: false, user: null });
                                }}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative w-full max-w-none px-3">
                {/* Compact Page Header */}
                <div className="mb-3">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Administrative Staff</h1>
                                <p className="text-sm text-gray-600">Manage administrators and inventory managers</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={`flex flex-col lg:flex-row gap-4 ${showMobileDetails ? 'lg:gap-6' : ''}`}>
                    {/* Compact Left Side - User List */}
                    <div className={`${showMobileDetails ? 'hidden lg:block' : ''} w-full lg:w-1/3`}>
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                            {/* Compact Search Bar */}
                            <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search staff..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300 text-sm"
                                    />
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-300" />
                                </div>
                            </div>

                            {/* Compact User List */}
                            <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowMobileDetails(true);
                                            }}
                                            className={`p-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group ${
                                                selectedUser?.id === user.id ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-r-4 border-blue-400' : ''
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt={`${user.firstName} ${user.lastName}`}
                                                        className="h-10 w-10 rounded-full border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-200"
                                                    />
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-500 transition-colors">{`${user.firstName} ${user.lastName}`}</h3>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-xs">{getRoleIcon(user.role)}</span>
                                                        <span className="text-xs text-gray-400 font-medium">{user.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No staff found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - User Details */}
                    {selectedUser && (
                        <div className={`${!showMobileDetails ? 'hidden lg:block' : ''} w-full lg:w-2/3`}>
                            <UserDetailsComponent 
                                user={selectedUser} 
                                onBack={() => setShowMobileDetails(false)}
                                onEditUser={() => navigate('/administrator/edituser', { state: { user: selectedUser } })}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetails;