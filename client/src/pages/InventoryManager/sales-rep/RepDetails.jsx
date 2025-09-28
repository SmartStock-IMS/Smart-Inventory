import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, User, Mail, Phone, MapPin, Hash, Edit, Target, TrendingUp, Calendar, Award, Building, DollarSign, BarChart3, Sparkles, Star, Activity, Users, CheckCircle, AlertCircle, Save, X } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Mock Avatar component for demo
const Avatar = ({ name, size = "lg", className = "" }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SR';
  const sizeClasses = {
    lg: 'w-24 h-24 text-2xl',
    md: 'w-16 h-16 text-xl',
    sm: 'w-12 h-12 text-lg'
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${className}`}>
      {initials}
    </div>
  );
};



const getSalesRepDetails = async () => {  
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3000/api/users/sales-staff",
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

const RepDetails = () => {
  const { repCode } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rep, setRep] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchSalesRep = async () => {
  try {
    const result = await getSalesRepDetails();
    
    if (result.success && result.data) {
      // Map the API data to match your component structure
      const salesRepsData = result.data.data.users.map((user) => ({
        emp_code: user.sales_staff_id,
        commission_rate: parseFloat(user.performance_rating) || 0,
        target_amount: parseFloat(user.target) || 0,
        achievements: parseFloat(user.achieved) || 0,
        join_date: user.join_date || new Date().toISOString(),
        status: user.status || "Active",
        is_active: true,
        monthly_performance: [0, 0, 0, 0, 0, 0], // Default values or calculate from API
        total_clients: 0, // Add from API if available
        active_deals: 0, // Add from API if available  
        closed_deals: 0, // Add from API if available
        users: {
          name: user.full_name,
          email: user.email,
          phone: user.phone,
          contact: user.phone,
          address: user.address || "No address available"  // Add from API if available
        }
      }));

      // Find the specific rep using the repCode parameter
      const foundRep = salesRepsData.find(r => r.emp_code === repCode);
      
      if (foundRep) {
        setRep(foundRep);
        setEditForm({
          name: foundRep.users.name,
          email: foundRep.users.email,
          phone: foundRep.users.phone,
          address: foundRep.users.address,
          commission_rate: foundRep.commission_rate,
          target_amount: foundRep.target_amount
        });
      } else {
        toast.error("Sales representative not found");
        navigate("/inventorymanager/sales-rep");
      }
    } else {
      console.error("Failed to fetch sales reps:", result.message);
      toast.error("Error loading sales representative details");
      navigate("/inventorymanager/sales-rep");
    }
  } catch (error) {
    console.error("Error fetching sales rep:", error);
    toast.error("Error loading sales representative details");
    navigate("/inventorymanager/sales-rep");
  } finally {
    setIsLoading(false);
  }
};

    setTimeout(fetchSalesRep, 1200);
  }, [repCode]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    toast.success("Sales representative updated successfully!");
    setIsEditing(false);
    
    setRep(prev => ({
      ...prev,
      users: {
        ...prev.users,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address
      },
      commission_rate: editForm.commission_rate,
      target_amount: editForm.target_amount
    }));
  };

  const handleCancel = () => {
    setEditForm({
      name: rep.users.name,
      email: rep.users.email,
      phone: rep.users.phone,
      address: rep.users.address,
      commission_rate: rep.commission_rate,
      target_amount: rep.target_amount
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaSpinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium text-xl">Loading sales representative details...</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-0"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rep) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl border border-red-200 shadow-xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-red-700 font-semibold text-lg mb-2">Sales Representative Not Found</h3>
          <p className="text-red-600 mb-4">The requested sales representative could not be loaded</p>
          <button
            onClick={() => navigate("/inventorymanager/sales-rep")}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Back to Sales Reps
          </button>
        </div>
      </div>
    );
  }

  // Calculate performance metrics
  const performancePercentage = Math.round((rep.achievements / rep.target_amount) * 100);
  const isTargetMet = performancePercentage >= 100;
  const totalMonthlySales = rep.monthly_performance.reduce((sum, month) => sum + month, 0);
  const avgMonthlySales = Math.round(totalMonthlySales / rep.monthly_performance.length);
  const commissionEarned = Math.round((rep.achievements * rep.commission_rate) / 100);

  return (
    <div className="h-full w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/inventorymanager/sales-rep")}
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back to Sales Representatives</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Sales Representative Profile</h1>
                <p className="text-white/80 text-lg">Manage performance and information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/inventorymanager/sales-rep/edit/${repCode}`)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-140px)] p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center mb-6">
                <Avatar 
                  name={rep.users.name} 
                  size="lg"
                  className="mx-auto mb-4"
                />
                <h2 className="text-xl font-bold text-gray-900">{rep.users.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    rep.is_active 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {rep.is_active ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                    {rep.status}
                  </span>
                  {isTargetMet && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Top Performer
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Hash className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Employee Code</p>
                    <p className="font-semibold text-gray-900">{rep.emp_code}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900 break-all">{rep.users.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Phone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">{rep.users.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    {isEditing ? (
                      <textarea
                        value={editForm.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">{rep.users.address}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Join Date</p>
                    <p className="font-semibold text-gray-900">{new Date(rep.join_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Performance & Stats Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Target</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.target_amount}
                      onChange={(e) => handleInputChange('target_amount', Number(e.target.value))}
                      className="w-full text-xl font-bold text-blue-600 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-xl font-bold text-blue-600">Rs{rep.target_amount.toLocaleString()}</p>
                  )}
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Achieved</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">Rs{rep.achievements.toLocaleString()}</p>
                </div>
                
                <div className={`bg-gradient-to-br p-4 rounded-xl border ${
                  isTargetMet 
                    ? 'from-green-50 to-green-100 border-green-200' 
                    : 'from-orange-50 to-orange-100 border-orange-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-gray-600">Performance</span>
                  </div>
                  <p className={`text-xl font-bold ${
                    isTargetMet ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {performancePercentage}%
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Commission</span>
                  </div>
                  <p className="text-xl font-bold text-purple-600">Rs{commissionEarned.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Target Progress</span>
                  <span className="text-sm font-medium text-gray-900">{performancePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      isTargetMet 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(performancePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sales Configuration */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sales Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    Sales Area
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.sales_area}
                      onChange={(e) => handleInputChange('sales_area', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-gray-900 font-semibold">{rep.sales_area}</p>
                    </div>
                  )}
                </div> */}
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                    <DollarSign className="w-4 h-4" />
                    Commission Rate
                  </label>
                  {isEditing ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.commission_rate}
                        onChange={(e) => handleInputChange('commission_rate', Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <span className="ml-3 text-gray-600 font-medium">%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-gray-900 font-semibold">{rep.commission_rate}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Client Statistics</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{rep.total_clients}</p>
                  <p className="text-sm text-gray-600 font-medium">Total Clients</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600 mb-1">{rep.active_deals}</p>
                  <p className="text-sm text-gray-600 font-medium">Active Deals</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-1">{rep.closed_deals}</p>
                  <p className="text-sm text-gray-600 font-medium">Closed Deals</p>
                </div>
              </div>
            </div>

            {/* Monthly Performance Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Performance Trend</h3>
              </div>
              
              <div className="space-y-4">
                {rep.monthly_performance.map((sales, index) => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  const maxSales = Math.max(...rep.monthly_performance);
                  const percentage = (sales / maxSales) * 100;
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-12 text-sm font-semibold text-gray-700">
                        {monthNames[index]}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-5 shadow-inner">
                        <div 
                          className="h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      <span className="w-24 text-sm font-semibold text-gray-900 text-right">
                        Rs{sales.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Total 6-Month Sales</p>
                    <p className="text-lg font-bold text-indigo-600">Rs{totalMonthlySales.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Average Monthly Sales</p>
                    <p className="text-lg font-bold text-purple-600">Rs{avgMonthlySales.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default RepDetails;