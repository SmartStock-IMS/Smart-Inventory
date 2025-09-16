import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, User, Mail, Phone, MapPin, Hash, Edit, Target, TrendingUp, Calendar, Award, Building, DollarSign, BarChart3, Sparkles, Star, Activity, Users, CheckCircle, AlertCircle, Save, X, Truck, Package, Boxes, Weight, Clock, ShoppingBag } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { getAllResourceManagers } from "@services/user-services";
import OrderDetails from "@components/InventoryManager/orders/OrderDetails";
import "react-toastify/dist/ReactToastify.css";

// Avatar component for displaying user initials
const Avatar = ({ name, size = "lg", className = "" }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'RM';
  const sizeClasses = {
    lg: 'w-24 h-24 text-2xl',
    md: 'w-16 h-16 text-xl',
    sm: 'w-12 h-12 text-lg'
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${className}`}>
      {initials}
    </div>
  );
};

const RMDetails = () => {
  const { repCode } = useParams(); // This will be the user ID from the route
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [rmData, setRmData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rep, setRep] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deliveryStats, setDeliveryStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showOrdersSection, setShowOrdersSection] = useState(true);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  console.log("🔍 RMDetails component loaded with repCode:", repCode);

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
    const fetchResourceManager = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 Fetching resource manager with ID:", repCode);
        
        // Check if repCode exists
        if (!repCode) {
          console.error("❌ No resource manager ID provided in URL");
          toast.error("Invalid resource manager ID");
          navigate("/inventorymanager/rm-list");
          return;
        }
        
        // Check if user is authenticated
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) {
          console.error("❌ No authentication token found");
          toast.error("Please log in to view resource manager details");
          navigate("/inventorymanager/rm-list");
          return;
        }
        
        // Fetch all resource managers and find the specific one
        const result = await getAllResourceManagers();
        console.log("📥 Resource managers result:", result);
        
        if (result.success && result.data) {
          // Convert repCode to string for comparison since URL params are always strings
          const targetId = String(repCode);
          const foundRep = result.data.find(rm => 
            String(rm.userID) === targetId || 
            String(rm.id) === targetId ||
            String(rm.user_id) === targetId
          );
          console.log("🔍 Found resource manager:", foundRep);
          console.log("🎯 Searching for ID:", targetId, "Available IDs:", result.data.map(rm => ({
            userID: rm.userID, 
            id: rm.id, 
            user_id: rm.user_id
          })));
          
          if (foundRep) {
            // Transform the data to match expected structure
            const transformedRep = {
              userID: foundRep.userID || foundRep.id,
              emp_code: foundRep.userID || foundRep.id,
              sales_area: foundRep.branch || "Resource Management",
              commission_rate: 0, // Resource managers don't have commission
              target_amount: 0, // Resource managers don't have sales targets
              achievements: 0,
              join_date: foundRep.date_of_employment || new Date().toISOString().split('T')[0],
              status: "Active",
              is_active: true,
              monthly_performance: [0, 0, 0, 0, 0, 0], // No sales performance for RMs
              total_clients: 0,
              active_deals: 0,
              closed_deals: 0,
              users: {
                name: `${foundRep.first_name || ''} ${foundRep.last_name || ''}`.trim() || foundRep.username,
                email: foundRep.email,
                phone: foundRep.phone,
                contact: foundRep.phone,
                address: foundRep.address
              }
            };
            
            setRep(transformedRep);
            setEditForm({
              name: transformedRep.users.name,
              email: transformedRep.users.email,
              phone: transformedRep.users.phone,
              address: transformedRep.users.address,
              sales_area: transformedRep.sales_area,
              commission_rate: transformedRep.commission_rate,
              target_amount: transformedRep.target_amount
            });
            
            // Calculate delivery statistics for this RM
            const stats = calculateDeliveryStats(transformedRep.emp_code);
            setDeliveryStats(stats);
            
            // Load all orders for this RM
            const myOrders = getMyOrders(transformedRep.emp_code);
            setFilteredOrders(myOrders);
            
          } else {
            console.error("❌ Resource manager not found with ID:", repCode);
            toast.error("Resource manager not found");
            navigate("/inventorymanager/rm-list");
          }
        } else {
          console.error("❌ Failed to fetch resource managers:", result.message);
          toast.error(result.message || "Failed to fetch resource manager details");
          navigate("/inventorymanager/rm-list");
        }
      } catch (error) {
        console.error("💥 Error fetching resource manager:", error);
        
        // Handle network and authentication errors
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. You don't have permission to view this resource manager.");
          navigate("/inventorymanager/rm-list");
        } else if (error.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Error loading resource manager details");
        }
        navigate("/inventorymanager/rm-list");
      } finally {
        setIsLoading(false);
      }
    };

    if (repCode) {
      fetchResourceManager();
    } else {
      toast.error("Invalid resource manager ID");
      navigate("/inventorymanager/rm-list");
    }
  }, [repCode, navigate]);

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
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl border border-gray-200 shadow-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <FaSpinner className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading resource manager details...</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-0"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
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
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
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
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-white/10"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigate("/inventorymanager/rm-list")}
                  className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Resource Managers</span>
                </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Resource Manager Profile</h1>
                <p className="text-white/80">Manage performance and information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/inventorymanager/rm-edit/${repCode}`)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-all duration-200 backdrop-blur-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-120px)] p-4 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
              <div className="text-center mb-4">
                <Avatar 
                  name={rep.users.name} 
                  size="md"
                  className="mx-auto mb-3"
                />
                <h2 className="text-lg font-bold text-gray-900">{rep.users.name}</h2>
                <p className="text-gray-600 text-sm">{rep.sales_area}</p>
                <div className="flex items-center justify-center gap-2 mt-2">\
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    rep.is_active 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
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
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Hash className="w-3 h-3 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Employee Code</p>
                    <p className="text-sm font-semibold text-gray-900">{rep.emp_code}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-3 h-3 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 break-all">{rep.users.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-3 h-3 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{rep.users.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Address</p>
                    {isEditing ? (
                      <textarea
                        value={editForm.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={2}
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{rep.users.address}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Join Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(rep.join_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Dashboard Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Dashboard Overview */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Delivery Dashboard</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  Live Data
                </span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">Total Orders</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{deliveryStats?.totalOrders || 0}</p>
                  <p className="text-xs text-gray-500">Assigned to RM</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">Completed</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{deliveryStats?.completedOrders || 0}</p>
                  <p className="text-xs text-gray-500">Successfully delivered</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">In Progress</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{deliveryStats?.inProgressOrders || 0}</p>
                  <p className="text-xs text-gray-500">Currently delivering</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">Total Value</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(deliveryStats?.totalAmount || 0)}</p>
                  <p className="text-xs text-gray-500">All assigned orders</p>
                </div>
              </div>

              {/* Delivery Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">Completion Rate</span>
                  <span className="text-xs font-medium text-gray-900">{deliveryStats?.completionRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-500"
                    style={{ width: `${Math.min(deliveryStats?.completionRate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Additional Delivery Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Boxes className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-base font-bold text-gray-900">{deliveryStats?.totalItems || 0}</p>
                  <p className="text-xs text-gray-600">Items to Deliver</p>
                </div>
                
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Weight className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-base font-bold text-gray-900">
                    {deliveryStats?.totalWeight 
                      ? (deliveryStats.totalWeight < 1 
                          ? `${Math.round(deliveryStats.totalWeight * 1000)}g` 
                          : `${deliveryStats.totalWeight.toFixed(1)}kg`)
                      : '0g'}
                  </p>
                  <p className="text-xs text-gray-600">Est. Weight</p>
                </div>
                
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-base font-bold text-gray-900">{formatCurrency(deliveryStats?.inProgressValue || 0)}</p>
                  <p className="text-xs text-gray-600">In Progress Value</p>
                </div>
              </div>
            </div>

            {/* Items In Progress for Delivery */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Boxes className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Items In Progress</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {deliveryStats?.inProgressOrders || 0} orders
                </span>
              </div>

              {deliveryStats?.itemSummary && deliveryStats.itemSummary.length > 0 ? (
                <div className="space-y-3">
                  {deliveryStats.itemSummary.slice(0, 3).map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="text-xs text-gray-500">Code: {item.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{item.totalQty} units</p>
                          <p className="text-xs text-gray-500">{formatCurrency(item.totalValue)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {deliveryStats.itemSummary.length > 3 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500">
                        ... and {deliveryStats.itemSummary.length - 3} more items
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 text-sm">No items assigned for delivery yet</p>
                </div>
              )}
            </div>

            {/* Delivery Status Summary */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Status Summary</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 flex-1">Completed Orders</span>
                  <span className="text-sm font-bold text-blue-600">{deliveryStats?.completedOrders || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 flex-1">In Progress Deliveries</span>
                  <span className="text-sm font-bold text-blue-600">{deliveryStats?.inProgressOrders || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 flex-1">In Progress Value</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(deliveryStats?.inProgressValue || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="mt-4 bg-white rounded-lg shadow-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium text-gray-900">
              My Allocated Orders
            </h3>
            <div className="flex items-center space-x-3">
              <label className="text-xs font-medium text-gray-700">
                Filter by Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="p-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-6">
              <ShoppingBag className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-xs text-gray-500">
                {selectedDate ? "No orders found for the selected date." : "No orders allocated to you yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredOrders.map((order, index) => (
                <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          Order #{order.order_id || order.id}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' 
                            ? 'bg-blue-100 text-blue-800' 
                            : order.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-gray-600">
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
                        <div className="mt-1">
                          <div className="text-xs text-gray-500">
                            Items: {order.quotation_items.slice(0, 2).map(item => item.product_name).join(', ')}
                            {order.quotation_items.length > 2 && ` and ${order.quotation_items.length - 2} more...`}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center gap-1 transition-all duration-200"
                      >
                        <Package className="w-3 h-3" />
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