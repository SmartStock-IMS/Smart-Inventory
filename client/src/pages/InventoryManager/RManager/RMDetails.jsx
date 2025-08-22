import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, User, Mail, Phone, MapPin, Hash, Edit, Target, TrendingUp, Calendar, Award, Building, DollarSign, BarChart3, Sparkles, Star, Activity, Users, CheckCircle, AlertCircle, Save, X, Truck, Package, Boxes, Weight, Clock, ShoppingBag } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import OrderDetails from "@components/InventoryManager/orders/OrderDetails";
import "react-toastify/dist/ReactToastify.css";

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

// Mock sales reps data matching SalesRepList
const mockSalesReps = [
  {
    emp_code: "EMP001",
    sales_area: "Mumbai Central",
    commission_rate: 5.5,
    target_amount: 500000,
    achievements: 420000,
    join_date: "2022-01-15",
    status: "Active",
    is_active: true,
    monthly_performance: [45000, 52000, 48000, 55000, 42000, 47000],
    total_clients: 25,
    active_deals: 8,
    closed_deals: 17,
    users: {
      name: "Arjun Singh",
      email: "arjun.singh@company.com",
      phone: "+91 98765 43210",
      contact: "+91 98765 43210",
      address: "Plot 123, Sector 15, Navi Mumbai, Maharashtra 400614"
    }
  },
  {
    emp_code: "EMP002",
    sales_area: "Delhi North",
    commission_rate: 6.0,
    target_amount: 450000,
    achievements: 465000,
    join_date: "2021-08-20",
    status: "Active",
    is_active: true,
    monthly_performance: [38000, 42000, 51000, 48000, 55000, 61000],
    total_clients: 32,
    active_deals: 12,
    closed_deals: 28,
    users: {
      name: "Sneha Patel",
      email: "sneha.patel@company.com",
      phone: "+91 87654 32109",
      contact: "+91 87654 32109",
      address: "House 456, Block A, Rohini, New Delhi 110085"
    }
  },
  {
    emp_code: "EMP003",
    sales_area: "Bangalore East",
    commission_rate: 5.8,
    target_amount: 600000,
    achievements: 580000,
    join_date: "2020-12-10",
    status: "Active",
    is_active: true,
    monthly_performance: [62000, 58000, 65000, 72000, 68000, 75000],
    total_clients: 40,
    active_deals: 15,
    closed_deals: 35,
    users: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@company.com",
      phone: "+91 76543 21098",
      contact: "+91 76543 21098",
      address: "Flat 789, Whitefield, Bangalore, Karnataka 560066"
    }
  }
];

// Mock services
// const toast = {
//   success: (message) => console.log(`✅ ${message}`),
//   error: (message) => console.log(`❌ ${message}`)
// };

const RMDetails = () => {
  const { repCode } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rep, setRep] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deliveryStats, setDeliveryStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showOrdersSection, setShowOrdersSection] = useState(true);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Utility functions for formatting
  const formatCurrency = (amount) => `Rs. ${amount?.toLocaleString() || 0}`;
  const formatWeight = (weight) => weight < 1 ? `${Math.round(weight * 1000)}g` : `${weight?.toFixed(1)}kg`;

  // Get assigned orders from localStorage
  const getAssignedOrders = () => {
    try {
      const data = localStorage.getItem("assignedOrders");
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  };

  // Get the actual status of an order considering completion status from localStorage
  const getOrderStatus = (order) => {
    const orderStatuses = JSON.parse(localStorage.getItem('orderStatuses') || '{}');
    const completionStatus = orderStatuses[order.quotation_id];
    
    if (completionStatus === 'Complete') {
      return 'Complete';
    }
    
    const originalStatus = order.status || '';
    
    if (originalStatus.toLowerCase().includes('completed') || 
        originalStatus.toLowerCase().includes('delivered') ||
        originalStatus === 'Complete') {
      return 'Complete';
    }
    
    if (order.assignedTo || order.assignedResourceManager) {
      return 'In Progress';
    }
    
    return 'Pending';
  };

  // Calculate delivery statistics for this specific RM
  const calculateDeliveryStats = (rmCode) => {
    const allOrders = getAssignedOrders();
    const rmOrders = allOrders.filter(order => 
      order.assignedTo === rmCode || 
      order.assignedResourceManager?.id === rmCode
    );

    // Group items by product name for delivery summary
    const itemSummary = {};
    let totalAmount = 0;
    let totalOrders = rmOrders.length;
    let totalItems = 0;
    let totalWeight = 0;
    let completedOrders = 0;
    let inProgressOrders = 0;
    let inProgressValue = 0;

    rmOrders.forEach(order => {
      totalAmount += order.net_total || 0;
      
      const status = getOrderStatus(order);
      
      if (status === 'Complete') {
        completedOrders++;
      } else if (status === 'In Progress') {
        inProgressOrders++;
        inProgressValue += order.net_total || 0;
        
        // Count items and estimate weight for in-progress orders
        const items = order.quotationItems || order.items || [];
        items.forEach(item => {
          const quantity = item.item_qty || item.qty || 1;
          totalItems += quantity;
          
          // Extract product info
          const description = item.description || item.name || `Item ${totalItems}`;
          const itemCode = item.item_code || item.code || `ITEM-${totalItems}`;
          
          const productKey = `${itemCode}_${description}`;
          
          if (!itemSummary[productKey]) {
            itemSummary[productKey] = {
              name: description,
              code: itemCode,
              totalQty: 0,
              totalValue: 0
            };
          }
          
          itemSummary[productKey].totalQty += quantity;
          itemSummary[productKey].totalValue += (item.total_amount || item.unit_price * quantity || 0);
          
          // Simple weight estimation
          const desc = description.toLowerCase();
          let unitWeight = 0.1; // Default 100g
          if (desc.includes('250g')) unitWeight = 0.25;
          if (desc.includes('100g')) unitWeight = 0.1;
          if (desc.includes('500g')) unitWeight = 0.5;
          
          totalWeight += unitWeight * quantity;
        });
      }
    });

    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      completedOrders,
      inProgressOrders,
      totalAmount,
      totalItems,
      totalWeight,
      inProgressValue,
      completionRate,
      itemSummary: Object.values(itemSummary).sort((a, b) => b.totalQty - a.totalQty)
    };
  };

  // Get all orders assigned to this specific RM
  const getMyOrders = (rmCode) => {
    const allOrders = getAssignedOrders();
    return allOrders.filter(order => 
      order.assignedTo === rmCode || 
      order.assignedResourceManager?.id === rmCode
    );
  };

  // Filter orders by selected date
  const filterOrdersByDate = (orders, dateString) => {
    if (!dateString) return orders;
    
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      const orderDate = new Date(order.quotation_date || order.created_at || Date.now());
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === selectedDate.getTime();
    });
  };

  // Handle date change
  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
    if (rep) {
      const myOrders = getMyOrders(rep.emp_code);
      const filtered = filterOrdersByDate(myOrders, dateString);
      setFilteredOrders(filtered);
    }
  };

  // Handle viewing order details
  const handleViewOrderDetails = (order) => {
    // Transform the order data to match OrderDetails expected format
    const orderForDetails = {
      ...order,
      quotation_id: order.quotation_id || order.id,
      customer_id: order.customer || order.customer_name,
      quotationItems: order.quotationItems || order.items || [],
      assignedResourceManager: order.assignedResourceManager || {
        id: rep?.emp_code,
        name: rep?.users?.name,
        assignedAt: new Date().toISOString()
      }
    };
    
    setSelectedOrder(orderForDetails);
    setIsOrderDetailsOpen(true);
    toast.success('Loading order details...');
  };

  // Handle closing order details
  const handleCloseOrderDetails = () => {
    setIsOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    const fetchSalesRep = () => {
      try {
        const foundRep = mockSalesReps.find(r => r.emp_code === repCode);
        if (foundRep) {
          setRep(foundRep);
          setEditForm({
            name: foundRep.users.name,
            email: foundRep.users.email,
            phone: foundRep.users.phone,
            address: foundRep.users.address,
            sales_area: foundRep.sales_area,
            commission_rate: foundRep.commission_rate,
            target_amount: foundRep.target_amount
          });
          
          // Calculate delivery statistics for this RM
          const stats = calculateDeliveryStats(foundRep.emp_code);
          setDeliveryStats(stats);
          
          // Load all orders for this RM
          const myOrders = getMyOrders(foundRep.emp_code);
          setFilteredOrders(myOrders);
          
        } else {
          toast.error("Resource manager not found");
          navigate("/inventorymanager/rm-list");
        }
      } catch (error) {
        console.error("Error fetching sales rep:", error);
        toast.error("Error loading resource manager details");
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
    toast.success("Resource manager updated successfully!");
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
      sales_area: editForm.sales_area,
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
      sales_area: rep.sales_area,
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
          <p className="text-gray-600 font-medium text-xl">Loading resource manager details...</p>
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
          <h3 className="text-red-700 font-semibold text-lg mb-2">Resource Manager Not Found</h3>
          <p className="text-red-600 mb-4">The requested resource manager could not be loaded</p>
          <button
            onClick={() => navigate("/inventorymanager/rm-list")}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Back to Resource Managers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {isOrderDetailsOpen && selectedOrder ? (
        // Order Details View
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          <OrderDetails 
            item={selectedOrder} 
            changeOpen={handleCloseOrderDetails}
          />
        </div>
      ) : (
        // Main Dashboard View
        <>
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-white/10"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigate("/inventorymanager/rm-list")}
                  className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Resource Managers</span>
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
                <h1 className="text-3xl font-bold mb-2">Resource Manager Profile</h1>
                <p className="text-white/80 text-lg">Manage performance and information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/inventorymanager/rm-edit/${repCode}`)}
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
                <p className="text-gray-600 font-medium">{rep.sales_area}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    rep.is_active 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {rep.is_active ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                    {rep.status}
                  </span>
                  {deliveryStats && deliveryStats.completionRate >= 80 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Top Deliverer
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

          {/* Delivery Dashboard Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Dashboard Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery Dashboard Overview</h3>
                <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-2 py-1 rounded-full">
                  Live Data
                </span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Total Orders</span>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{deliveryStats?.totalOrders || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Assigned to RM</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Completed</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">{deliveryStats?.completedOrders || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600">In Progress</span>
                  </div>
                  <p className="text-xl font-bold text-orange-600">{deliveryStats?.inProgressOrders || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Currently delivering</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Total Value</span>
                  </div>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(deliveryStats?.totalAmount || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">All assigned orders</p>
                </div>
              </div>

              {/* Delivery Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">{deliveryStats?.completionRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                    className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-green-500"
                    style={{ width: `${Math.min(deliveryStats?.completionRate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Additional Delivery Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Boxes className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{deliveryStats?.totalItems || 0}</p>
                  <p className="text-sm text-gray-600">Items to Deliver</p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Weight className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {deliveryStats?.totalWeight 
                      ? (deliveryStats.totalWeight < 1 
                          ? `${Math.round(deliveryStats.totalWeight * 1000)}g` 
                          : `${deliveryStats.totalWeight.toFixed(1)}kg`)
                      : '0g'}
                  </p>
                  <p className="text-sm text-gray-600">Est. Weight</p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(deliveryStats?.inProgressValue || 0)}</p>
                  <p className="text-sm text-gray-600">In Progress Value</p>
                </div>
              </div>
            </div>

            {/* Items In Progress for Delivery */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Boxes className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Items In Progress for Delivery</h3>
                <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2 py-1 rounded-full">
                  {deliveryStats?.inProgressOrders || 0} orders
                </span>
              </div>

              {deliveryStats?.itemSummary && deliveryStats.itemSummary.length > 0 ? (
                <div className="space-y-4">
                  {deliveryStats.itemSummary.slice(0, 5).map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">Code: {item.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{item.totalQty} units</p>
                          <p className="text-sm text-gray-500">{formatCurrency(item.totalValue)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {deliveryStats.itemSummary.length > 5 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        ... and {deliveryStats.itemSummary.length - 5} more items
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No items assigned for delivery yet</p>
                </div>
              )}
            </div>

            {/* Delivery Status Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery Status Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 flex-1">Completed Orders</span>
                  <span className="font-bold text-green-600">{deliveryStats?.completedOrders || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 flex-1">In Progress Deliveries</span>
                  <span className="font-bold text-orange-600">{deliveryStats?.inProgressOrders || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 flex-1">In Progress Value</span>
                  <span className="font-bold text-blue-600">{formatCurrency(deliveryStats?.inProgressValue || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              My Allocated Orders
            </h3>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Filter by Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedDate ? "No orders found for the selected date." : "No orders allocated to you yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">
                          Order #{order.order_id || order.id}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Customer:</span> {order.customer_name}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(order.quotation_date || order.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {formatCurrency(order.total)}
                        </div>
                        <div>
                          <span className="font-medium">Items:</span> {order.quotation_items?.length || order.items?.length || 0}
                        </div>
                      </div>
                      {order.quotation_items && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">
                            Items: {order.quotation_items.slice(0, 3).map(item => item.product_name).join(', ')}
                            {order.quotation_items.length > 3 && ` and ${order.quotation_items.length - 3} more...`}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-all duration-200 hover:shadow-md"
                      >
                        <Package className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
        </>
      )}
    </div>
  );
};

export default RMDetails;