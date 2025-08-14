import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Building, Globe, User, Search, ArrowLeft, Calendar, Edit3, Star, Users } from 'lucide-react';

const UserDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [users, setUsers] = useState([
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            address: '123 Main Street, City, Country',
            company: 'Tech Solutions Inc.',
            website: 'www.johndoe.com',
            role: 'Senior Developer',
            joinDate: '2023-01-15',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=JD'
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 987-6543',
            address: '456 Oak Avenue, Town, Country',
            company: 'Design Studio',
            website: 'www.janesmith.com',
            role: 'UI Designer',
            joinDate: '2023-02-20',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=JS'
        },
    ]);

    const [selectedUser, setSelectedUser] = useState(users[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileDetails, setShowMobileDetails] = useState(false);

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
    }, [location.state, selectedUser.id]);

    const filteredUsers = users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleColor = (role) => {
        if (role.toLowerCase().includes('senior') || role.toLowerCase().includes('lead')) {
            return 'from-purple-500 to-indigo-600';
        } else if (role.toLowerCase().includes('designer')) {
            return 'from-pink-500 to-rose-600';
        } else if (role.toLowerCase().includes('developer')) {
            return 'from-blue-500 to-cyan-600';
        }
        return 'from-gray-500 to-slate-600';
    };

    const getRoleIcon = (role) => {
        if (role.toLowerCase().includes('senior') || role.toLowerCase().includes('lead')) {
            return '👑';
        } else if (role.toLowerCase().includes('designer')) {
            return '🎨';
        } else if (role.toLowerCase().includes('developer')) {
            return '💻';
        }
        return '👤';
    };

    const UserDetailsComponent = ({ user, onBack, onEditUser }) => (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 h-full overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 lg:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 right-4 opacity-20">
                    <Star className="w-20 h-20 animate-pulse" />
                </div>
                
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Enhanced Back button for mobile */}
                        <button 
                            onClick={onBack}
                            className="lg:hidden p-3 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img
                                    src={user.avatarUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-16 w-16 lg:h-20 lg:w-20 rounded-full border-4 border-white/30 shadow-xl"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold tracking-wide">{`${user.firstName} ${user.lastName}`}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg">{getRoleIcon(user.role)}</span>
                                    <p className="text-indigo-100 font-medium">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onEditUser}
                        className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 border border-white/20"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span className="font-medium">Edit Profile</span>
                    </button>
                </div>
            </div>

            {/* Enhanced Content */}
            <div className="p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
                <div className="space-y-8">
                    {/* Enhanced Basic Information */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="group">
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                        <p className="font-semibold text-gray-800 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                                        <Phone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                                        <p className="font-semibold text-gray-800 truncate">{user.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                                        <Building className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Company</p>
                                        <p className="font-semibold text-gray-800 truncate">{user.company}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                                        <Globe className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Website</p>
                                        <p className="font-semibold text-gray-800 truncate">{user.website}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Address Information */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <MapPin className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Location Information</h3>
                        </div>
                        
                        <div className="group">
                            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-200">
                                <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                                    <MapPin className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</p>
                                    <p className="font-semibold text-gray-800">{user.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Role & Join Date */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Role Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="group">
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{getRoleIcon(user.role)}</span>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Role</p>
                                    </div>
                                    <div className={`inline-block px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r ${getRoleColor(user.role)} shadow-lg`}>
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="group">
                                <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar className="w-6 h-6 text-teal-600" />
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Join Date</p>
                                    </div>
                                    <p className="font-bold text-lg text-gray-800">{new Date(user.joinDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-6">
            {/* Floating Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-none px-4">
                {/* Enhanced Page Header */}
                <div className="mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                                <p className="text-gray-600 mt-1">Manage and view user information</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={`flex flex-col lg:flex-row gap-6 ${showMobileDetails ? 'lg:gap-8' : ''}`}>
                    {/* Enhanced Left Side - User List */}
                    <div className={`${showMobileDetails ? 'hidden lg:block' : ''} w-full lg:w-1/3`}>
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                            {/* Enhanced Search Bar */}
                            <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-300 transition-all duration-200"
                                    />
                                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" />
                                </div>
                            </div>

                            {/* Enhanced User List */}
                            <div className="divide-y divide-gray-100 max-h-[calc(100vh-250px)] overflow-y-auto">
                                {filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowMobileDetails(true);
                                        }}
                                        className={`p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group ${
                                            selectedUser?.id === user.id ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    className="h-12 w-12 rounded-full border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-200 shadow-md"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors">{`${user.firstName} ${user.lastName}`}</h3>
                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm">{getRoleIcon(user.role)}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{user.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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