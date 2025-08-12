import React, { useState } from 'react';
import { Loader2, AlertCircle, UserPlus, User, Mail, Phone, MapPin, Shield, Lock, CheckCircle, Sparkles, Camera, CreditCard } from "lucide-react";

const AddUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        nicNo: "",
        profilePicture: null,
        role: "user",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        
        if (type === 'file') {
            console.log(`Profile picture selected: ${files[0]?.name || 'none'}`);
            setFormData(prevData => ({
                ...prevData,
                [name]: files[0] || null
            }));
        } else {
            console.log(`Field '${name}' changed to: ${value}`);
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
        
        if (error) setError("");
    };

    const validateForm = () => {
        console.log('Validating form...');
        if (!formData.firstName || !formData.lastName) {
            console.error('Validation failed: First name and last name are required');
            setError("First name and last name are required");
            return false;
        }
        if (!formData.email) {
            console.error('Validation failed: Email is required');
            setError("Email is required");
            return false;
        }
        if (!formData.email.includes('@')) {
            console.error('Validation failed: Invalid email format');
            setError("Please enter a valid email address");
            return false;
        }
        if (formData.password.length < 6) {
            console.error('Validation failed: Password too short');
            setError("Password must be at least 6 characters long");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            console.error('Validation failed: Passwords do not match');
            setError("Passwords do not match");
            return false;
        }
        console.log('Form validation successful');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submit button clicked');
        
        if (!validateForm()) {
            console.log('Form validation failed, submission cancelled');
            return;
        }

        setLoading(true);
        console.log('Starting submission process...', formData);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log("Form submitted successfully:", {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                nicNo: formData.nicNo,
                profilePicture: formData.profilePicture?.name || null,
                role: formData.role
            });
            
            setSuccess(true);
            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: "",
                nicNo: "",
                profilePicture: null,
                role: "user",
                password: "",
                confirmPassword: ""
            });
        } catch (err) {
            console.error('Submission failed:', err);
            setError("Failed to add user. Please try again.");
        } finally {
            setLoading(false);
            console.log('Submission process completed');
        }
    };

    const handleClear = () => {
        console.log('Clear button clicked - Resetting form');
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            nicNo: "",
            profilePicture: null,
            role: "user",
            password: "",
            confirmPassword: ""
        });
        setError("");
        setSuccess(false);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return '👑';
            case 'manager': return '📊';
            default: return '👤';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'from-red-500 to-pink-500';
            case 'manager': return 'from-blue-500 to-indigo-500';
            default: return 'from-green-500 to-emerald-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-6">
            {/* Floating Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-none px-4">
                {/* Enhanced Header Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex items-center justify-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-3xl font-bold tracking-wide">Add New User</h2>
                                <p className="text-indigo-100 mt-2">Create a new team member account</p>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/40 animate-pulse" />
                        <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-white/40 animate-pulse delay-500" />
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    <div className="p-8">
                        {/* Enhanced Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-lg shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Success Alert */}
                        {success && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <p className="text-green-700 font-medium">User successfully added! 🎉</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Personal Information Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        NIC Number
                                    </label>
                                    <input
                                        type="text"
                                        name="nicNo"
                                        value={formData.nicNo}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                        placeholder="Enter NIC number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Camera className="w-4 h-4 text-blue-500" />
                                        Profile Picture <span className="text-gray-400 text-xs">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            name="profilePicture"
                                            onChange={handleChange}
                                            accept="image/*"
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {formData.profilePicture && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>{formData.profilePicture.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Mail className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-green-500" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="user@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-500" />
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-green-500" />
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-300 resize-none"
                                        placeholder="Enter full address"
                                    />
                                </div>
                            </div>

                            {/* Role & Security Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Role & Security</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-purple-500" />
                                        Role
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-gray-300 appearance-none bg-white"
                                        >
                                            <option value="user">👤 User</option>
                                            <option value="admin">👑 Admin</option>
                                            <option value="manager">📊 Manager</option>
                                        </select>
                                        <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gradient-to-r ${getRoleColor(formData.role)} rounded-full`}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-purple-500" />
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="Min. 6 characters"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-purple-500" />
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="Confirm password"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    className="group px-6 py-3 text-sm font-medium border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                                    onClick={handleClear}
                                >
                                    <span className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-gray-500 transition-colors"></span>
                                    Clear Form
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="group px-6 py-3 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Adding User...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="w-4 h-4 group-hover:animate-pulse" />
                                            <span>Add User</span>
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

export default AddUser;