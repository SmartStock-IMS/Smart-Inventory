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

// Get assigned orders from localStorage
function getAssignedOrders() {
  try {
    const data = localStorage.getItem("assignedOrders");
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

// Get current RM (Arjun Singh - EMP001)
const getCurrentRM = () => ({
  id: "EMP001",
  emp_code: "EMP001", 
  name: "Arjun Singh",
  sales_area: "Mumbai Central",
  email: "arjun.singh@company.com",
  phone: "+91 98765 43210"
});

// Get orders assigned to current RM
function getMyOrders() {
  const allOrders = getAssignedOrders();
  const currentRM = getCurrentRM();
  return allOrders.filter(order => 
    order.assignedTo === currentRM.id || 
    order.assignedResourceManager?.id === currentRM.id
  );
}

// Calculate delivery statistics
function calculateDeliveryStats(orders) {
  const today = new Date().toDateString();
  
  // Group items by product name and size
  const itemSummary = {};
  let totalAmount = 0;
  let totalOrders = orders.length;
  let totalItems = 0;
  let totalWeight = 0;
  let pendingOrders = 0;
  let completedOrders = 0;

  // Separate pending and completed orders
  const pendingOrdersList = [];
  const completedOrdersList = [];

  orders.forEach(order => {
    totalAmount += order.net_total || 0;
    
    // Order status
    const status = order.status || "Pending";
    if (status === 'Complete' || status.toLowerCase().includes('completed') || status.toLowerCase().includes('delivered')) {
      completedOrders++;
      completedOrdersList.push(order);
    } else {
      pendingOrders++;
      pendingOrdersList.push(order);
    }
  });

  // Only process items from PENDING orders for delivery summary
  pendingOrdersList.forEach(order => {
    // Process items
    const items = order.items || order.quotationItems || [];
    items.forEach(item => {
      const quantity = item.item_qty || item.qty || 1;
      totalItems += quantity;
      
      // Extract product info
      const description = item.description || item.name || 'Unknown Product';
      const itemCode = item.item_code || '';
      
      // Create unique key for similar products
      const productKey = description;
      
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
    totalAmount,
    totalItems: totalItems, // Only items from pending orders
    totalWeight: totalWeight, // Only weight from pending orders
    pendingValue: pendingOrdersList.reduce((sum, order) => sum + (order.net_total || 0), 0), // Value of pending orders only
    itemSummary: Object.values(itemSummary).sort((a, b) => b.totalQty - a.totalQty), // Only pending order items
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
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentRM, setCurrentRM] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refreshData = () => {
    const rm = getCurrentRM();
    const myOrders = getMyOrders();
    const deliveryStats = calculateDeliveryStats(myOrders);
    
    setCurrentRM(rm);
    setOrders(myOrders);
    setStats(deliveryStats);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      refreshData();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-8 h-8" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Delivery Dashboard</h1>
                <p className="text-emerald-100">
                  Welcome, <strong>{currentRM?.name}</strong> ({currentRM?.emp_code}) • 📍 {currentRM?.sales_area}
                </p>
              </div>
            </div>
            <p className="text-emerald-100 text-sm">
              Your daily delivery summary and logistics overview
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-emerald-100 text-sm">Today's Date</p>
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
              <Activity className="w-6 h-6 text-emerald-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats?.totalAmount || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Item Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Boxes className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Items Pending for Delivery</h2>
              <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2 py-1 rounded-full">
                {stats?.pendingOrders || 0} orders
              </span>
            </div>

            {stats?.itemSummary && stats.itemSummary.length > 0 ? (
              <div className="space-y-4">
                {stats.itemSummary.slice(0, 10).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Code: {item.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{item.totalQty} units</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.totalValue)}</p>
                      </div>
                    </div>
                    
                    {Object.keys(item.variants).length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Variants:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.variants).map(([variant, qty]) => (
                            <span key={variant} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
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
                    <p className="text-sm text-gray-500">
                      ... and {stats.itemSummary.length - 10} more items
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
        </div>

        {/* Right Side Stats */}
        <div className="space-y-6">
          {/* Daily Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Pending Deliveries</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Orders to Deliver</span>
                <span className="font-bold text-orange-600">{stats?.pendingOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items to Deliver</span>
                <span className="font-bold text-blue-600">{stats?.totalItems || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Est. Weight</span>
                <span className="font-bold text-purple-600">{formatWeight(stats?.totalWeight || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Value</span>
                <span className="font-bold text-orange-600">{formatCurrency(stats?.pendingValue || 0)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-bold text-blue-600">{stats?.completionRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Delivery Status</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed Orders</span>
                <span className="ml-auto font-bold text-green-600">{stats?.completedOrders || 0}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending Deliveries</span>
                <span className="ml-auto font-bold text-orange-600">{stats?.pendingOrders || 0}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ready to Deliver</span>
                <span className="ml-auto font-bold text-blue-600">{stats?.pendingOrders || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="space-y-3">
              <a 
                href="/resourcemanager/orders" 
                className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium text-center hover:bg-purple-700 transition-colors"
              >
                📦 View All Orders
              </a>
              <a 
                href="/resourcemanager/resources" 
                className="block w-full px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium text-center hover:bg-yellow-700 transition-colors"
              >
                🔧 Vehicle Maintenance
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          💡 Dashboard updates automatically every 30 seconds • Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Click the refresh button above or complete orders to see updates immediately
        </p>
      </div>
    </div>
  );
};

export default RMHome;
