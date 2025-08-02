import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building, Globe, User, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDetails = () => {
    const navigate = useNavigate();
    const [users] = useState([
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

    const filteredUsers = users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const UserDetails = ({ user, onBack }) => (
        <div className="bg-white rounded-lg shadow-md h-full">
            <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Back button for mobile */}
                        <button 
                            onClick={onBack}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <img
                                src={user.avatarUrl}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-12 w-12 lg:h-16 lg:w-16 rounded-full"
                            />
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</h2>
                                <p className="text-gray-500">{user.role}</p>
                            </div>
                        </div>
                    </div>
                    <button className="hidden sm:block px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => navigate('/dashboard/edituser')}>
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="p-4 lg:p-6 overflow-y-auto">
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-gray-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-gray-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium truncate">{user.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Building className="h-5 w-5 text-gray-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">Company</p>
                                    <p className="font-medium truncate">{user.company}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Globe className="h-5 w-5 text-gray-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">Website</p>
                                    <p className="font-medium truncate">{user.website}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-5 w-5 text-gray-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium truncate">{user.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role & Join Date */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Role Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="font-medium">{user.role}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Join Date</p>
                                <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">User Management</h1>
                
                <div className={`flex flex-col lg:flex-row gap-6 ${showMobileDetails ? 'lg:gap-8' : ''}`}>
                    {/* Left Side - user List */}
                    <div className={`${showMobileDetails ? 'hidden lg:block' : ''} w-full lg:w-1/3`}>
                        <div className="bg-white rounded-lg shadow-md">
                            {/* Search Bar */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            {/* user List */}
                            <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                                {filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowMobileDetails(true);
                                        }}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                                            selectedUser?.id === user.id ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={user.avatarUrl}
                                                alt={`${user.firstName} ${user.lastName}`}
                                                className="h-10 w-10 rounded-full"
                                            />
                                            <div className="min-w-0">
                                                <h3 className="font-medium truncate">{`${user.firstName} ${user.lastName}`}</h3>
                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - user Details */}
                    {selectedUser && (
                        <div className={`${!showMobileDetails ? 'hidden lg:block' : ''} w-full lg:w-2/3`}>
                            <UserDetails 
                                user={selectedUser} 
                                onBack={() => setShowMobileDetails(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetails;