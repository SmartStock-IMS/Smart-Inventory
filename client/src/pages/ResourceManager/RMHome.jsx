import React, { useState, useEffect } from "react";
import { 
  Package, 
  Truck, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Users, 
  BarChart3,
  TrendingUp,
  MapPin,
  Calendar,
  Target,
  AlertCircle,
  Boxes,
  Weight,
  FileText,
  Timer,
  Activity,
  ShoppingBag,
  User
} from "lucide-react";
import { useTheme } from "../../context/theme/ThemeContext.jsx";
import { jwtDecode } from "jwt-decode";

function getRMIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return "RM001";
  try {
    const payload = jwtDecode(token);
    return payload.role_id || "RM001";
  } catch {
    return "RM001";
  }
}

// Get current RM (Test RM - EMP001 from Mumbai Central)
const getCurrentRM = () => ({
  id: "EMP001",
  emp_code: "EMP001", 
  name: "Arjun Singh",
  sales_area: "Mumbai Central",
  email: "arjun.singh@company.com",
  phone: "+91 98765 43210"
});

// Transform API order data to match the expected format
function transformApiOrderToLocalFormat(apiOrder) {
  return {
    id: apiOrder.order_id,
    quotation_id: apiOrder.order_id,
    customer: apiOrder.customer_name,
    customerName: apiOrder.customer_name,
    status: apiOrder.order_status,
    date: apiOrder.order_date,
    quotation_date: apiOrder.order_date,
    net_total: parseFloat(apiOrder.total_amount),
    no_items: parseInt(apiOrder.no_of_products),
    assignedTo: getRMIdFromToken(),
    assignedResourceManager: {
      id: getRMIdFromToken(),
      name: getCurrentRM().name,
      assignedAt: apiOrder.created_at
    },
    assignedAt: apiOrder.created_at,
    items: apiOrder.products_json?.map(product => ({
      name: product.product_name,
      description: product.product_name,
      qty: product.quantity,
      item_qty: product.quantity,
      unit_price: product.unit_price,
      total_amount: product.total_amount,
      item_code: product.product_id,
      variant_details: {
        color: "N/A",
        weight: "N/A",
        category: product.category_name,
        batch_no: "N/A",
        exp_date: "N/A",
        image_url: "/products/default.jpg"
      }
    })) || []
  };
}

// Get the actual status of an order considering completion status from localStorage
function getOrderStatus(order) {
  const orderStatuses = JSON.parse(localStorage.getItem('orderStatuses') || '{}');
  const completionStatus = orderStatuses[order.quotation_id];
  
  // If the order is marked as complete in localStorage, return "Complete"
  if (completionStatus === 'Complete') {
    return 'Complete';
  }
  
  // Check API status
  const apiStatus = order.status || '';
  
  // If API status indicates completion
  if (apiStatus.toLowerCase() === 'completed' || 
      apiStatus.toLowerCase() === 'delivered' ||
      apiStatus === 'Complete') {
    return 'Complete';
  }
  
  // For orders with inprogress status from API
  if (apiStatus.toLowerCase() === 'inprogress') {
    return 'In Progress';
  }
  
  // Default status
  return 'Pending';
}

// Enrich order with detailed information
const enrichOrderWithDetails = (order) => {
  // Check localStorage for completion status
  const orderStatuses = JSON.parse(localStorage.getItem('orderStatuses') || '{}');
  const isCompleted = orderStatuses[order.quotation_id] === 'Complete';
  
  return {
    ...order,
    // Preserve the actual status from localStorage completion if it exists, otherwise keep original
    status: isCompleted ? 'Complete' : (order.status || "In Progress"), 
    quotationItems: order.quotationItems || order.items?.map((item, index) => ({
      id: index + 1,
      item_code: item.item_code || item.code || `ITEM-${String(index + 1).padStart(3, '0')}`,
      description: item.description || item.name || `Item ${index + 1}`,
      item_qty: item.item_qty || item.qty || 1,
      unit_price: item.unit_price || (item.total_amount ? Math.round(item.total_amount / (item.item_qty || item.qty || 1)) : 0),
      total_amount: item.total_amount || ((item.unit_price || 0) * (item.item_qty || item.qty || 1)),
      delivery_status: item.delivery_status || "Ready to Pack",
      priority: item.priority || "Normal",
      variant_details: item.variant_details || {
        category: item.category || "General",
        weight: item.weight ? `${item.weight}kg` : "N/A",
        batch_no: item.batch_no || `B${new Date().getFullYear()}${String(index + 1).padStart(3, '0')}`,
        exp_date: item.exp_date || "N/A",
        manufacturing_date: item.manufacturing_date || "N/A",
        supplier: item.supplier || "N/A",
        quality_grade: item.quality_grade || "Standard",
        color: item.color || "N/A",
        size: item.size || "Standard"
      }
    })) || []
  };
};

// Calculate delivery statistics
function calculateDeliveryStats(orders) {
  // Enrich orders to ensure proper structure
  const enrichedOrders = orders.map(order => enrichOrderWithDetails(order));
  
  // Group items by product name and size
  const itemSummary = {};
  let totalAmount = 0;
  let totalOrders = enrichedOrders.length;
  let totalItems = 0;
  let totalWeight = 0;
  let pendingOrders = 0;
  let inProgressOrders = 0;
  let completedOrders = 0;

  // Separate orders by status
  const pendingOrdersList = [];
  const inProgressOrdersList = [];
  const completedOrdersList = [];

  enrichedOrders.forEach(order => {
    totalAmount += order.net_total || 0;
    
    // Order status using consistent logic
    const status = getOrderStatus(order);
    
    if (status === 'Complete') {
      completedOrders++;
      completedOrdersList.push(order);
    } else if (status === 'In Progress') {
      inProgressOrders++;
      inProgressOrdersList.push(order);
    } else {
      pendingOrders++;
      pendingOrdersList.push(order);
    }
  });

  // Only process items from IN PROGRESS orders for delivery summary
  inProgressOrdersList.forEach(order => {
    // Use quotationItems (which should now be available after enrichment)
    const items = order.quotationItems || [];
    
    items.forEach((item, index) => {
      const quantity = item.item_qty || item.qty || item.quantity || 1;
      totalItems += quantity;
      
      // Extract product info with better fallbacks
      const description = item.description || item.name || item.product_name || `Product ${index + 1}`;
      const itemCode = item.item_code || item.code || item.product_code || `ITEM-${index + 1}`;
      
      // Create unique key for similar products
      const productKey = `${itemCode}_${description}`;
      
      if (!itemSummary[productKey]) {
        itemSummary[productKey] = {
          name: description,
          code: itemCode,
          totalQty: 0,
          variants: {},
          totalValue: 0
        };
      }
      
      itemSummary[productKey].totalQty += quantity;
      itemSummary[productKey].totalValue += (item.total_amount || item.unit_price * quantity || 0);
      
      // Track variants (sizes, weights, etc)
      const variant = extractVariant(description);
      if (variant) {
        if (!itemSummary[productKey].variants[variant]) {
          itemSummary[productKey].variants[variant] = 0;
        }
        itemSummary[productKey].variants[variant] += quantity;
      }
      
      // Estimate weight
      totalWeight += estimateWeight(description, quantity);
    });
  });

  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    inProgressOrders,
    totalAmount,
    totalItems: totalItems, // Only items from in-progress orders
    totalWeight: totalWeight, // Only weight from in-progress orders
    inProgressValue: inProgressOrdersList.reduce((sum, order) => sum + (order.net_total || 0), 0), // Value of in-progress orders only
    itemSummary: Object.values(itemSummary).sort((a, b) => b.totalQty - a.totalQty), // Only in-progress order items
    completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
  };
}

// Extract variant info (weight, size) from product description
function extractVariant(description) {
  const variants = [];
  
  // Look for weight patterns (250g, 100g, 1kg, etc.)
  const weightMatch = description.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l)\b/i);
  if (weightMatch) {
    variants.push(weightMatch[0]);
  }
  
  // Look for size patterns (Small, Medium, Large, XL, etc.)
  const sizeMatch = description.match(/\b(small|medium|large|xl|xxl|s|m|l)\b/i);
  if (sizeMatch) {
    variants.push(sizeMatch[0].toUpperCase());
  }
  
  // Look for color/variant after dash
  const dashVariant = description.split(' - ')[1];
  if (dashVariant && dashVariant.length < 20) {
    variants.push(dashVariant);
  }
  
  return variants.length > 0 ? variants.join(' ') : null;
}

// Estimate product weight for logistics
function estimateWeight(description, quantity) {
  const desc = description.toLowerCase();
  let unitWeight = 0.1; // Default 100g
  
  // Weight-based estimation
  if (desc.includes('cream') || desc.includes('serum')) unitWeight = 0.05; // 50g
  if (desc.includes('lipstick') || desc.includes('mascara')) unitWeight = 0.02; // 20g
  if (desc.includes('foundation') || desc.includes('palette')) unitWeight = 0.15; // 150g
  if (desc.includes('250g')) unitWeight = 0.25;
  if (desc.includes('100g')) unitWeight = 0.1;
  if (desc.includes('500g')) unitWeight = 0.5;
  if (desc.includes('1kg')) unitWeight = 1.0;
  
  return unitWeight * quantity;
}

const RMHome = () => {
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentRM, setCurrentRM] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch orders from API
  const fetchOrdersFromAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      const rmId = getRMIdFromToken();
      
      if (!token) {
        console.error('No token found in localStorage');
        return [];
      }

      const response = await fetch(`http://localhost:3000/api/orders/by-resource-manager/${rmId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success && result.data && result.data.orders) {
        console.log("Orders fetched from API: ", result.data.orders);
        // Transform API orders to match the expected format
        return result.data.orders.map(order => transformApiOrderToLocalFormat(order));
      } else {
        console.error("Failed to fetch orders:", result.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching orders from API:", error);
      return [];
    }
  };

  const refreshData = async () => {
    setLoading(true);
    
    const rm = getCurrentRM();
    const apiOrders = await fetchOrdersFromAPI();
    const deliveryStats = calculateDeliveryStats(apiOrders);
    
    setCurrentRM(rm);
    setOrders(apiOrders);
    setStats(deliveryStats);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await refreshData();
    };

    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => `Rs. ${amount.toLocaleString()}`;
  const formatWeight = (weight) => weight < 1 ? `${Math.round(weight * 1000)}g` : `${weight.toFixed(1)}kg`;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Package className={`w-12 h-12 mx-auto mb-4 animate-pulse ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-3 sm:p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-8 h-8" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Delivery Dashboard</h1>
                <p className="text-blue-100">
                  Welcome, <strong>{currentRM?.name}</strong> ({currentRM?.emp_code}) • 📍 {currentRM?.sales_area}
                </p>
              </div>
            </div>
            <p className="text-blue-100 text-sm">
              Your daily delivery summary and logistics overview
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-blue-100 text-sm">Today's Date</p>
                <p className="font-bold text-lg">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
            
            <button
              onClick={refreshData}
              className="bg-white/20 hover:bg-white/30 rounded-lg p-3 backdrop-blur-sm transition-colors"
              title="Refresh Dashboard"
            >
              <Activity className="w-6 h-6 text-blue-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl shadow-lg p-4 border-l-4 border-blue-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Orders</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-4 border-l-4 border-green-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats?.completedOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-4 border-l-4 border-orange-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats?.inProgressOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-4 border-l-4 border-purple-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats?.totalAmount || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Item Summary */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-6">
              <Boxes className="w-6 h-6 text-blue-500" />
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Items In Progress for Delivery</h2>
              <span className="bg-blue-100 text-blue-500 text-sm font-medium px-2 py-1 rounded-full">
                {stats?.inProgressOrders || 0} orders
              </span>
            </div>

            {stats?.itemSummary && stats.itemSummary.length > 0 ? (
              <div className="space-y-4">
                {stats.itemSummary.slice(0, 10).map((item, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Code: {item.code}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.totalQty} units</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatCurrency(item.totalValue)}</p>
                      </div>
                    </div>
                    
                    {Object.keys(item.variants).length > 0 && (
                      <div className="mt-3">
                        <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Variants:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.variants).map(([variant, qty]) => (
                            <span key={variant} className="text-xs px-2 py-1 bg-blue-100 text-blue-500 rounded-full">
                              {variant}: {qty} units
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {stats.itemSummary.length > 10 && (
                  <div className="text-center py-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ... and {stats.itemSummary.length - 10} more items
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No items assigned for delivery yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Stats */}
        <div className="space-y-6">
          {/* Daily Summary */}
          <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>In Progress Deliveries</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Orders to Deliver</span>
                <span className="font-bold text-blue-500">{stats?.inProgressOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Items to Deliver</span>
                <span className="font-bold text-blue-400">{stats?.totalItems || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Est. Weight</span>
                <span className="font-bold text-blue-500">{formatWeight(stats?.totalWeight || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress Value</span>
                <span className="font-bold text-blue-400">{formatCurrency(stats?.inProgressValue || 0)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</span>
                  <span className="font-bold text-blue-500">{stats?.completionRate || 0}%</span>
                </div>
                <div className={`w-full rounded-full h-2 mt-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Status */}
          <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-blue-500" />
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delivery Status</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed Orders</span>
                <span className="ml-auto font-bold text-green-600">{stats?.completedOrders || 0}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress Deliveries</span>
                <span className="ml-auto font-bold text-blue-500">{stats?.inProgressOrders || 0}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Orders</span>
                <span className="ml-auto font-bold text-blue-400">{stats?.pendingOrders || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-500" />
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
            </div>
            
            <div className="space-y-3">
              <a 
                href="/resourcemanager/orders" 
                className="block w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium text-center hover:bg-blue-600 transition-colors"
              >
                📦 View All Orders
              </a>
              <a 
                href="/resourcemanager/resources" 
                className="block w-full px-4 py-3 bg-blue-400 text-white rounded-lg font-medium text-center hover:bg-blue-500 transition-colors"
              >
                🔧 Vehicle Maintenance
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className={`rounded-xl p-4 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          💡 Dashboard updates automatically every 30 seconds • Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Data fetched from server API • Complete orders to see updates immediately
        </p>
      </div>
    </div>
  );
};

export default RMHome;
