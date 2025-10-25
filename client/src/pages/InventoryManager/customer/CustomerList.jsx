import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookUser,
  Search,
  Trash2,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Users,
  Sparkles,
  AlertCircle,
  UserCheck,
  Building,
  Grid3X3,
  TableProperties,
  Star,
  Award,
  Crown,
  Gift,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import { useTheme } from "../../../context/theme/ThemeContext";

const getAllCustomersNoPage = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/customers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log("API response:", response.data.data.customers);
    return { success: true, data: response.data.data.customers };
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Fetch all orders for loyalty calculation (like CustomerDetails)
const getAllOrders = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/orders/all-data?limit=10000&offset=0`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
};

const deleteCustomer = async (userCode) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/customers/${userCode}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log("Delete response:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Delete error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

const toast = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`),
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Loyalty Program Configuration
const LOYALTY_CONFIG = {
  pointsPerRupee: 0.001, // Points = total spent / 1000
  tiers: [
    { name: "Bronze", minPoints: 0, color: "from-orange-400 to-orange-600", icon: Star, benefits: "5% discount" },
    { name: "Silver", minPoints: 50, color: "from-gray-400 to-gray-600", icon: Award, benefits: "10% discount + priority support" },
    { name: "Gold", minPoints: 200, color: "from-yellow-400 to-yellow-600", icon: Crown, benefits: "15% discount + free shipping" },
    { name: "Platinum", minPoints: 500, color: "from-purple-400 to-purple-600", icon: Gift, benefits: "20% discount + exclusive access" },
  ]
};

// Calculate loyalty info from orders (match CustomerDetails)
const calculateLoyalty = (orders = []) => {
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const points = Math.floor(totalSpent * LOYALTY_CONFIG.pointsPerRupee);
  let tier = LOYALTY_CONFIG.tiers[0];
  for (let i = LOYALTY_CONFIG.tiers.length - 1; i >= 0; i--) {
    if (points >= LOYALTY_CONFIG.tiers[i].minPoints) {
      tier = LOYALTY_CONFIG.tiers[i];
      break;
    }
  }
  const nextTier = LOYALTY_CONFIG.tiers.find(t => t.minPoints > points);
  const progressToNext = nextTier
    ? ((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
    : 100;
  return { points, tier, nextTier, progressToNext, orderCount: orders.length };
};

const CustomerList = () => {
  const { isDarkMode } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [customerLoyalty, setCustomerLoyalty] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showLoyaltyDetails, setShowLoyaltyDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customerResult, allOrders] = await Promise.all([
          getAllCustomersNoPage(),
          getAllOrders()
        ]);
        if (customerResult.success) {
          setCustomers(customerResult.data || []);
          // Group orders by customer_id
          const ordersByCustomer = {};
          for (const order of allOrders) {
            if (!ordersByCustomer[order.customer_id]) ordersByCustomer[order.customer_id] = [];
            ordersByCustomer[order.customer_id].push(order);
          }
          // Calculate loyalty for each customer
          const loyaltyData = {};
          for (const customer of customerResult.data) {
            const orders = ordersByCustomer[customer.customer_id] || [];
            loyaltyData[customer.customer_id] = calculateLoyalty(orders);
          }
          setCustomerLoyalty(loyaltyData);
        } else {
          console.error(customerResult.message);
        }
      } catch (error) {
        console.error(error);
        console.log("Backend error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClick = (user_code) => {
    navigate(`/inventorymanager/customer/${user_code}`);
  };

  const handleDelete = async (userCode) => {
    console.log(userCode);
    try {
      setIsLoading(true);
      const result = await deleteCustomer(userCode);
      if (result.success) {
        toast.success(result.data.message);
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      } else {
        toast.error("Error removing customer");
      }
    } catch (error) {
      console.error("Error remove product: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = (customers || []).filter((customer) => {
    return searchQuery
      ? customer.customer_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.address.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  const openDeleteDialog = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase() || ""
    );
  };

  const LoyaltyBadge = ({ customerId, compact = false }) => {
    const loyalty = customerLoyalty[customerId];
    if (!loyalty) return null;

    const { tier, points } = loyalty;
    const TierIcon = tier.icon;

    if (compact) {
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tier.color} text-white`}>
          <TierIcon className="w-3 h-3" />
          <span>{tier.name}</span>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r ${tier.color} text-white shadow-sm`}>
        <TierIcon className="w-4 h-4" />
        <span>{tier.name}</span>
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{points.toLocaleString()} pts</span>
      </div>
    );
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCustomers.map((customer) => (
        <div
          key={customer.customer_id}
          className={`rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${isDarkMode ? 'bg-gray-800 border-gray-600 hover:border-blue-400' : 'bg-white border-gray-200 hover:border-blue-300'}`}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {getInitials(customer.name)}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleClick(customer.customer_id)}
                  className="text-left hover:text-blue-600 transition-colors duration-200"
                >
                  <h3 className={`font-semibold truncate transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {customer.name}
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {customer.customer_id}
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className={`flex items-center gap-3 text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Phone className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className="truncate">{customer.contact_no}</span>
              </div>
              <div className={`flex items-center gap-3 text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Mail className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-300'}`}
                >
                  {customer.address}
                </span>
              </div>
              
              {/* Loyalty Information */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <LoyaltyBadge customerId={customer.customer_id} />
                {customerLoyalty[customer.customer_id] && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {customerLoyalty[customer.customer_id].orderCount} orders • {customerLoyalty[customer.customer_id].points.toLocaleString()} points
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleClick(customer.customer_id)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => openDeleteDialog(customer)}
                className={`px-4 py-2 text-red-600 border rounded-lg text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'border-red-500 hover:bg-red-900/20' : 'border-red-200 hover:bg-red-50'}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className={`border-b transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'}`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Code
                </div>
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer
                </div>
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact
                </div>
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </div>
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Loyalty Status
                </div>
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y transition-colors duration-300 ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.customer_id}
                className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(customer.name)}
                    </div>
                    <span className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {customer.customer_id}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleClick(customer.customer_id)}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left transition-colors duration-200"
                  >
                    {customer.name}
                  </button>
                </td>
                <td className={`px-6 py-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {customer.contact_no}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Mail className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{customer.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{customer.address}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <LoyaltyBadge customerId={customer.customer_id} compact />
                    {customerLoyalty[customer.customer_id] && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {customerLoyalty[customer.customer_id].orderCount} orders • {customerLoyalty[customer.customer_id].points.toLocaleString()} points
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleClick(customer.customer_id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => openDeleteDialog(customer)}
                      disabled={isLoading}
                      className={`px-4 py-2 text-red-600 border rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${isDarkMode ? 'border-red-500 hover:bg-red-900/20' : 'border-red-200 hover:bg-red-50'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`h-full w-full rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-gray-200'}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookUser className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Customer Management</h2>
                <p className="text-white/80">
                  Manage and view all customer information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search customers by name, code, email, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-200",
                    viewMode === "table"
                      ? "bg-white/30 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <TableProperties className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-200",
                    viewMode === "grid"
                      ? "bg-white/30 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-200px)] p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FaSpinner className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading customers...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`rounded-xl p-4 border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {filteredCustomers.length}
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Customers</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {
                        new Set(
                          customers.map((c) => {
                            const parts = c.address.trim().split(" ");
                            return parts[parts.length - 1]; // take last word (city)
                          })
                        ).size
                      }
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cities Covered</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {Object.values(customerLoyalty).filter(l => l.tier.name === 'Gold' || l.tier.name === 'Platinum').length}
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>VIP Customers</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {Object.values(customerLoyalty).reduce((sum, l) => sum + l.points, 0).toLocaleString()}
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Points Earned</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Program Overview */}
            <div className={`rounded-2xl border shadow-sm p-6 mb-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Loyalty Program Overview
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Customer reward tiers and benefits
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoyaltyDetails(!showLoyaltyDetails)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  {showLoyaltyDetails ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {showLoyaltyDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {LOYALTY_CONFIG.tiers.map((tier) => {
                    const TierIcon = tier.icon;
                    const customerCount = Object.values(customerLoyalty).filter(l => l.tier.name === tier.name).length;
                    
                    return (
                      <div
                        key={tier.name}
                        className={`p-4 rounded-xl border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${tier.color} rounded-xl flex items-center justify-center mb-3`}>
                          <TierIcon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className={`font-bold text-lg mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {tier.name}
                        </h4>
                        <p className={`text-sm mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {tier.minPoints.toLocaleString()}+ points
                        </p>
                        <p className={`text-xs mb-3 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {tier.benefits}
                        </p>
                        <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {customerCount}
                        </div>
                        <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          customers
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customers Display */}
            {filteredCustomers.length > 0 ? (
              viewMode === "table" ? (
                <TableView />
              ) : (
                <GridView />
              )
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No customers found
                  </p>
                  <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Try adjusting your search criteria
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && customerToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Remove Customer</h3>
                  <p className="text-white/80 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(customerToDelete.name)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {customerToDelete.name}
                  </h4>
                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {customerToDelete.customer_id}
                  </p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {customerToDelete.email}
                  </p>
                </div>
              </div>

              <p className={`mb-6 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to remove this customer from your
                database? This will permanently delete all customer information.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(customerToDelete.customer_id)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Remove Customer
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setCustomerToDelete(null);
                  }}
                  className={`px-6 py-3 border rounded-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
