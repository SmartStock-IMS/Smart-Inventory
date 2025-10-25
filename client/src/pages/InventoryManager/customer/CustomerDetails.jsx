import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, User, Mail, Phone, MapPin, Edit, Package, Calendar, Hash, 
  DollarSign, FileText, Star, Award, Crown, Gift, TrendingUp, Zap, Target
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../../../context/theme/ThemeContext";

// Loyalty program configuration
const LOYALTY_CONFIG = {
  pointsPerRupee: 0.001, // Points = total spent / 1000
  tiers: {
    bronze: { min: 0, name: 'Bronze', icon: Star, color: 'amber', description: 'Welcome Member' },
    silver: { min: 50, name: 'Silver', icon: Award, color: 'gray', description: 'Valued Customer' },
    gold: { min: 200, name: 'Gold', icon: Crown, color: 'yellow', description: 'Premium Member' },
    platinum: { min: 500, name: 'Platinum', icon: Gift, color: 'purple', description: 'Elite Member' }
  }
};

// Calculate loyalty information from orders
const calculateLoyalty = (orders) => {
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const totalPoints = Math.floor(totalSpent * LOYALTY_CONFIG.pointsPerRupee);
  
  let currentTier = 'bronze';
  for (const [tierKey, tierData] of Object.entries(LOYALTY_CONFIG.tiers)) {
    if (totalPoints >= tierData.min) {
      currentTier = tierKey;
    }
  }
  
  // Calculate next tier progress
  const tierKeys = Object.keys(LOYALTY_CONFIG.tiers);
  const currentTierIndex = tierKeys.indexOf(currentTier);
  const nextTierKey = tierKeys[currentTierIndex + 1];
  
  let progressToNext = 100;
  let pointsToNext = 0;
  
  if (nextTierKey) {
    const nextTierMin = LOYALTY_CONFIG.tiers[nextTierKey].min;
    const currentTierMin = LOYALTY_CONFIG.tiers[currentTier].min;
    const pointsInCurrentTier = totalPoints - currentTierMin;
    const pointsNeededForTier = nextTierMin - currentTierMin;
    progressToNext = (pointsInCurrentTier / pointsNeededForTier) * 100;
    pointsToNext = nextTierMin - totalPoints;
  }
  
  return {
    totalPoints,
    currentTier,
    nextTier: nextTierKey,
    progressToNext: Math.min(progressToNext, 100),
    pointsToNext: Math.max(pointsToNext, 0),
    totalSpent,
    tierData: LOYALTY_CONFIG.tiers[currentTier]
  };
};

// Loyalty Badge Component
const LoyaltyBadge = ({ tier, size = 'md' }) => {
  const tierConfig = LOYALTY_CONFIG.tiers[tier];
  const Icon = tierConfig.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[tierConfig.color]}`}>
      <Icon className="w-3 h-3" />
      {tierConfig.name}
    </span>
  );
};

const CustomerDetails = () => {
  const { isDarkMode } = useTheme();
  const { user_code } = useParams(); // This will be customer_id from the backend
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch all customers
        const customersResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/customers`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        
        // Find the specific customer by customer_id
        const foundCustomer = customersResponse.data.data.customers.find(
          c => c.customer_id === user_code
        );
        
        if (!foundCustomer) {
          setError("Customer not found");
          setLoading(false);
          return;
        }
        
        setCustomer(foundCustomer);
        
        // Fetch all orders/quotations
        const ordersResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/all-data?limit=1000&offset=0`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        
        // Filter quotations for this customer
        const customerQuotations = ordersResponse.data.data.filter(
          order => order.customer_id === user_code
        );
        
        setQuotations(customerQuotations);
        
        // Calculate loyalty data
        const loyalty = calculateLoyalty(customerQuotations);
        setLoyaltyData(loyalty);
        
        console.log("Customer found:", foundCustomer);
        console.log("Customer quotations:", customerQuotations);
        console.log("Loyalty data:", loyalty);
        
      } catch (err) {
        setError("Error loading customer data");
        console.error("API error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [user_code]);

  const getInitials = (name) => {
    const names = name?.split(' ') || [];
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name?.substring(0, 2).toUpperCase() || '';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inprogress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`h-full w-full rounded-3xl border shadow-xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-gray-200'}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className={`h-full w-full rounded-3xl border shadow-xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-red-900 via-gray-800 to-red-900 border-red-700' : 'bg-gradient-to-br from-red-50 via-white to-red-50 border-red-200'}`}>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-red-800' : 'bg-red-100'}`}>
            <User className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error || "Customer not found"}</p>
          <button
            onClick={() => navigate('/inventorymanager/customer-list')}
            className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${isDarkMode ? 'bg-red-700 text-red-100 hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            Back to Customer List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-gray-200'}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/inventorymanager/customer-list')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Customer List
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {getInitials(customer.name)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {customer.name}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-white/80 text-lg">Customer ID: {customer.customer_id}</p>
              {loyaltyData && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-white text-sm font-medium">{loyaltyData.tierData.name} Member</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-140px)] p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Customer Information Card */}
          <div className={`lg:col-span-2 rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
                <User className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Customer Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Hash className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer ID</p>
                    <p className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{customer.customer_id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Mail className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</p>
                    <p className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{customer.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Phone className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</p>
                    <p className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{customer.contact_no}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <MapPin className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                    <p className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {customer.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Calendar className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</p>
                    <p className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {new Date(customer.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`mt-6 pt-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <button
                onClick={() => navigate(`/inventorymanager/customer/edit/${customer.customer_id}`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Customer Details
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            {/* Loyalty Status Card */}
            {loyaltyData && (
              <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${loyaltyData.tierData.color === 'purple' ? 'bg-purple-100' : loyaltyData.tierData.color === 'yellow' ? 'bg-yellow-100' : loyaltyData.tierData.color === 'gray' ? 'bg-gray-100' : 'bg-amber-100'}`}>
                    <loyaltyData.tierData.icon className={`w-5 h-5 ${loyaltyData.tierData.color === 'purple' ? 'text-purple-600' : loyaltyData.tierData.color === 'yellow' ? 'text-yellow-600' : loyaltyData.tierData.color === 'gray' ? 'text-gray-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <p className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Loyalty Status
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-purple-200' : 'text-purple-600'}`}>
                      Customer Rewards Program
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Points Display */}
                  <div className="text-center">
                    <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {loyaltyData.totalPoints.toLocaleString()} Points
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-purple-200' : 'text-purple-600'}`}>
                      From Rs {loyaltyData.totalSpent.toLocaleString()} spent
                    </p>
                  </div>

                  {/* Current Tier Badge */}
                  <div className="flex justify-center">
                    <LoyaltyBadge tier={loyaltyData.currentTier} size="lg" />
                  </div>

                  {/* Tier Description */}
                  <div className="text-center">
                    <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-purple-200' : 'text-purple-600'}`}>
                      {loyaltyData.tierData.name} Member
                    </p>
                    <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-purple-300' : 'text-purple-500'}`}>
                      {loyaltyData.tierData.description}
                    </p>
                  </div>
                  
                  {/* Progress to Next Tier */}
                  {loyaltyData.nextTier && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDarkMode ? 'text-purple-200' : 'text-purple-600'}>
                          Progress to {LOYALTY_CONFIG.tiers[loyaltyData.nextTier].name}
                        </span>
                        <span className={isDarkMode ? 'text-purple-200' : 'text-purple-600'}>
                          {loyaltyData.pointsToNext} points to go
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${loyaltyData.progressToNext}%` }}
                        ></div>
                      </div>
                      <div className="text-center">
                        <span className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-purple-300' : 'text-purple-500'}`}>
                          {Math.round(loyaltyData.progressToNext)}% to {LOYALTY_CONFIG.tiers[loyaltyData.nextTier].name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Maximum Tier Reached */}
                  {!loyaltyData.nextTier && (
                    <div className="text-center space-y-1">
                      <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-600'}`}>
                        Maximum Tier Reached
                      </p>
                      <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-500'}`}>
                        Congratulations! 🎉
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{quotations.length}</p>
                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Orders</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Rs {quotations.reduce((sum, q) => sum + parseFloat(q.total_amount || 0), 0).toLocaleString()}
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {quotations.reduce((sum, q) => sum + parseInt(q.no_of_products || 0), 0)}
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Products</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
          <div className={`px-6 py-4 border-b transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
                <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Order History</h2>
            </div>
          </div>
          
          <div className="p-6">
            {quotations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className={`border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Order Date
                        </div>
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Order ID
                        </div>
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Sales Rep
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Products
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Total
                        </div>
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Points Earned
                        </div>
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Delivery Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                    {quotations.map((order) => (
                      <tr key={order.order_id} className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                          {new Date(order.order_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-blue-600 text-xs">
                            {order.order_id.substring(0, 8)}...
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                          {order.sales_rep_name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {order.no_of_products} items
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          Rs {parseFloat(order.total_amount || 0).toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {Math.floor(parseFloat(order.total_amount || 0) * LOYALTY_CONFIG.pointsPerRupee).toLocaleString()}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                          {new Date(order.delivery_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Package className={`w-8 h-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No orders found</p>
                <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This customer hasn't placed any orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;