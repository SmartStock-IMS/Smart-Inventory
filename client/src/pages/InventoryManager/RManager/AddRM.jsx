import React, { useState } from 'react';
import { Loader2, AlertCircle, UserPlus, User, Mail, Phone, MapPin, Shield, Lock, CheckCircle, Sparkles, Camera, CreditCard, Briefcase, Target } from "lucide-react";
import { registerUser } from "../../../services/user-services";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AddRM = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        nicNo: "",
        region: "",
        profilePicture: null,
        status: "active"
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        
        if (type === 'file') {
            setFormData(prevData => ({
                ...prevData,
                [name]: files[0] || null
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
        
        if (error) setError("");
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName) {
            setError("First name and last name are required");
            return false;
        }
        if (!formData.email) {
            setError("Email is required");
            return false;
        }
        if (!formData.email.includes('@')) {
            setError("Please enter a valid email address");
            return false;
        }
        if (!formData.password) {
            setError("Password is required");
            return false;
        }
        if (formData.password.length < 4) {
            setError("Password must be at least 4 characters long");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        if (!formData.phone) {
            setError("Phone number is required");
            return false;
        }
        if (!formData.address) {
            setError("Address is required");
            return false;
        }
        if (!formData.region) {
            setError("Resource management area is required");
            return false;
        }
        return true;
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            address: "",
            nicNo: "",
            region: "",
            profilePicture: null,
            status: "active"
        });
        setError("");
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const userData = {
                username: formData.email, // Use email as username as required by validation
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
                nic: formData.nicNo,
                branch: formData.region, // Use branch instead of region to match validation
                role: "RESOURCE_MANAGER", // Use correct Prisma enum value
                is_active: formData.status === "active"
            };

            console.log("📤 Submitting resource manager data:", userData);

            const result = await registerUser(userData);
            console.log("📥 Registration result:", result);

            if (result.success) {
                setSuccess(true);
                toast.success("Resource Manager added successfully!");
                
                setTimeout(() => {
                    resetForm();
                    navigate('/inventorymanager/rm-list');
                }, 2000);
            } else {
                setError(result.message || "Failed to add resource manager");
                toast.error(result.message || "Failed to add resource manager");
            }
        } catch (error) {
            console.error("💥 Error adding resource manager:", error);
            setError("Failed to add resource manager. Please try again.");
            toast.error("Failed to add resource manager. Please try again.");
        } finally {
            setLoading(false);
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
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold">Add Resource Manager</h2>
                                <p className="text-blue-100 text-sm">Create a new resource management team member</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="p-4">
                        {/* Compact Error Alert */}
                        {error && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-red-100 rounded-lg">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <p className="text-red-700 font-medium text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Compact Success Alert */}
                        {success && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <p className="text-green-700 font-medium text-sm">Resource manager successfully added! 🎉</p>
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
                                            onChange={handleChange}
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
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        NIC Number
                                    </label>
                                    <input
                                        type="text"
                                        name="nicNo"
                                        value={formData.nicNo}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                        placeholder="Enter NIC number"
                                    />
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
                                            onChange={handleChange}
                                            accept="image/*"
                                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {formData.profilePicture && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                                                <CheckCircle className="w-3 h-3" />
                                                <span>{formData.profilePicture.name}</span>
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
                                            onChange={handleChange}
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
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 resize-none"
                                        placeholder="Enter full address"
                                    />
                                </div>
                            </div>

                            {/* Resource Management Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <Target className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-800">Resource Management Information</h3>
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Target className="w-4 h-4 text-blue-500" />
                                        Resource Management Area
                                    </label>
                                    <input
                                        type="text"
                                        name="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                        placeholder="Enter assigned resource management area"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                        Status
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 appearance-none bg-white"
                                        >
                                            <option value="active">✅ Active</option>
                                            <option value="inactive">❌ Inactive</option>
                                            <option value="pending">⏳ Pending</option>
                                        </select>
                                        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r ${getStatusColor(formData.status)} rounded-full`}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-800">Security</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Lock className="w-4 h-4 text-blue-500" />
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="Min. 4 characters"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Lock className="w-4 h-4 text-blue-500" />
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                                            placeholder="Confirm password"
                                            required
                                        />
                                    </div>
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
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="group px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Adding Manager...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="w-4 h-4 group-hover:animate-pulse" />
                                            <span>Add Resource Manager</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Toast Container */}
                <ToastContainer 
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </div>
    );
};

export default AddRM;