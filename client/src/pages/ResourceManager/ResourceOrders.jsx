import { useEffect, useState } from "react";
import { useTheme } from "../../context/theme/ThemeContext";
import { 
  Package, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Phone,
  RefreshCw,
  FileText,
  Hash,
  Calendar,
  DollarSign,
  Truck,
  Scale,
  Tag
} from "lucide-react";

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

// Current logged-in Resource Manager (simulate authentication)
const getCurrentRM = () => {
  // Test RM - EMP001 from Mumbai Central (for testing purpose)
  // In a real app, this would come from authentication context/JWT token
  return {
    id: "EMP001",
    emp_code: "EMP001",
    name: "Arjun Singh",
    sales_area: "Mumbai Central",
    email: "arjun.singh@company.com",
    phone: "+91 98765 43210"
  };
};

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

// Enrich order data with calculated fields
const enrichOrderWithDetails = (order) => {
  // Check localStorage for completion status
  const orderStatuses = JSON.parse(localStorage.getItem('orderStatuses') || '{}');
  const isCompleted = orderStatuses[order.quotation_id] === 'Complete';
  
  return {
    ...order,
    // Preserve the actual status from localStorage completion if it exists, otherwise keep original
    status: isCompleted ? 'Complete' : (order.status === 'inprogress' ? 'In Progress' : order.status),
    // Calculate sub_total from net_total if available
    sub_total: order.sub_total || (order.net_total ? Math.round(order.net_total / 0.945) : order.net_total),
    // Use actual discount or calculate from sub_total and net_total
    discount: order.discount || (order.sub_total && order.net_total ? 
      ((order.sub_total - order.net_total) / order.sub_total * 100) : 0),
    // Use existing item count
    no_items: order.no_items || order.items?.length || 0,
    // Calculate variants from actual items
    total_variants: order.items ? new Set(order.items.map(item => item.variant || 'Standard')).size : 0,
    // Calculate estimated weight from items or use default
    estimated_weight: order.estimated_weight || (order.items ? 
      order.items.reduce((total, item) => total + ((item.weight || 0.1) * (item.item_qty || item.qty || 1)), 0) : 0),
    // Transform items to quotationItems format if needed
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
    })) || [],
    // Use provided packaging notes or generate basic one
    packaging_notes: order.packaging_notes || (order.items && order.items.length > 0 ? 
      `Handle ${order.items.length} item(s) with care during delivery.` : "Handle with care.")
  };
};

const ResourceOrders = () => {
  const { isDarkMode } = useTheme();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRM, setCurrentRM] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState(null);

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

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      
      // Get current logged-in RM
      const rm = getCurrentRM();
      setCurrentRM(rm);
      
      // Get orders from API
      const apiOrders = await fetchOrdersFromAPI();
      
      if (apiOrders.length > 0) {
        // Enrich orders with detailed quotation information
        const enrichedOrders = apiOrders.map(enrichOrderWithDetails);
        setAssignedOrders(enrichedOrders);
        setSelectedOrder(enrichedOrders[0]); // Select first order by default
      } else {
        setAssignedOrders([]);
        setSelectedOrder(null);
      }
      
      setLoading(false);
    };

    loadOrders();

    // Listen for localStorage changes to automatically refresh when orders are completed
    const handleStorageChange = (event) => {
      if (event.key === 'orderStatuses') {
        console.log('Detected order status change, refreshing...');
        loadOrders();
      }
    };

    // Listen for custom events from Inventory Manager order assignment
    const handleOrderAssigned = (event) => {
      console.log('Order assigned event received:', event.detail);
      loadOrders();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('orderAssigned', handleOrderAssigned);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('orderAssigned', handleOrderAssigned);
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const rm = getCurrentRM();
    setCurrentRM(rm);
    
    const apiOrders = await fetchOrdersFromAPI();
    
    if (apiOrders.length > 0) {
      const enrichedOrders = apiOrders.map(enrichOrderWithDetails);
      setAssignedOrders(enrichedOrders);
      // Keep the same selected order if it still exists
      if (selectedOrder) {
        const updatedSelectedOrder = enrichedOrders.find(
          order => order.quotation_id === selectedOrder.quotation_id
        );
        setSelectedOrder(updatedSelectedOrder || enrichedOrders[0]);
      } else {
        setSelectedOrder(enrichedOrders[0]);
      }
    } else {
      setAssignedOrders([]);
      setSelectedOrder(null);
    }
    
    setLoading(false);
  };

  const handleCompleteOrder = (orderToComplete) => {
    if (!orderToComplete) return;
    setOrderToComplete(orderToComplete);
    setShowConfirmModal(true);
  };

  const confirmCompleteOrder = async () => {
    if (!orderToComplete) return;

    try {
      // Call the API to update order status to completed
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/orders/status/${orderToComplete.quotation_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'completed'
        })
      });

      const result = await response.json();

      if (!result.success) {
        alert(`Failed to complete order: ${result.message}`);
        setShowConfirmModal(false);
        setOrderToComplete(null);
        return;
      }

      // Update order status in localStorage (for UI consistency)
      const orderStatuses = JSON.parse(localStorage.getItem('orderStatuses') || '{}');
      orderStatuses[orderToComplete.quotation_id] = 'Complete';
      localStorage.setItem('orderStatuses', JSON.stringify(orderStatuses));
      
      // Update local state
      const updatedOrders = assignedOrders.map(order => {
        if (order.quotation_id === orderToComplete.quotation_id) {
          return {
            ...order,
            status: "Complete",
            completedAt: new Date().toISOString(),
            completedBy: currentRM?.name || "Resource Manager"
          };
        }
        return order;
      });
      
      setAssignedOrders(updatedOrders);
      
      // Update selected order if it's the one being completed
      if (selectedOrder && selectedOrder.quotation_id === orderToComplete.quotation_id) {
        const updatedSelectedOrder = updatedOrders.find(
          order => order.quotation_id === orderToComplete.quotation_id
        );
        if (updatedSelectedOrder) {
          setSelectedOrder(enrichOrderWithDetails(updatedSelectedOrder));
        }
      }
      
      // Show success message
      alert(`Order ${orderToComplete.quotation_id} has been marked as completed successfully!`);
      
      // Close modal and reset
      setShowConfirmModal(false);
      setOrderToComplete(null);
      
      // Refresh orders from API to get updated data
      handleRefresh();
      
    } catch (error) {
      console.error("Error completing order:", error);
      alert("Error completing order. Please try again.");
      setShowConfirmModal(false);
      setOrderToComplete(null);
    }
  };

  const cancelCompleteOrder = () => {
    setShowConfirmModal(false);
    setOrderToComplete(null);
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Dark mode classes
  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const textLightClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverClass = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} max-w-7xl mx-auto p-3 sm:p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 animate-pulse ${textLightClass}`} />
            <p className={`font-medium text-sm sm:text-base ${textMutedClass}`}>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h2 className="text-xl sm:text-3xl font-bold">Resource Orders</h2>
                {currentRM && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <span className="text-sm sm:text-base text-blue-100">
                      Welcome, <strong>{currentRM.name}</strong> ({currentRM.emp_code})
                    </span>
                    <span className="text-xs sm:text-sm text-blue-200">
                      📍 {currentRM.sales_area}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-blue-100 text-sm sm:text-base">
              {currentRM 
                ? `Orders assigned to you for delivery preparation.`
                : "View order details and quotation information for delivery preparation."
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm text-sm"
              title="Refresh order data from API"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Order Selection and Details */}
      {assignedOrders.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile Order Selection Dropdown */}
          <div className="block lg:hidden">
            <div className={`rounded-xl shadow-lg p-4 ${cardBgClass}`}>
              <h3 className={`font-semibold text-lg mb-3 flex items-center gap-2 ${textClass}`}>
                <FileText className="w-5 h-5 text-blue-600" />
                Select Order
              </h3>
              <select
                value={selectedOrder?.quotation_id || ''}
                onChange={(e) => {
                  const order = assignedOrders.find(o => o.quotation_id.toString() === e.target.value);
                  setSelectedOrder(order);
                }}
                className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Choose an order...</option>
                {assignedOrders.map((order, index) => (
                  <option key={order.id || order.quotation_id || index} value={order.quotation_id}>
                    Order #{order.quotation_id} - {order.customerName || order.customer} - {order.net_total ? formatCurrency(order.net_total) : 'Amount N/A'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {/* Desktop Order List Sidebar */}
            <div className="lg:col-span-1">
              <div className={`rounded-xl shadow-lg p-4 ${cardBgClass}`}>
                <h3 className={`font-semibold text-lg mb-4 flex items-center gap-2 ${textClass}`}>
                  <FileText className="w-5 h-5 text-blue-600" />
                  Assigned Orders
                </h3>
                
                <div className="space-y-3">
                  {assignedOrders.map((order, index) => (
                    <div
                      key={order.id || order.quotation_id || index}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedOrder?.quotation_id === order.quotation_id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : `${borderClass} ${hoverClass} ${textClass}`
                      } ${isDarkMode && selectedOrder?.quotation_id === order.quotation_id ? '!bg-blue-900 !text-white' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="font-medium">
                        Order #{order.quotation_id || order.id}
                      </div>
                      <div className={`text-sm mt-1 ${textMutedClass}`}>
                        {order.customerName || order.customer}
                      </div>
                      <div className={`text-xs mt-1 ${textLightClass}`}>
                        {order.net_total ? formatCurrency(order.net_total) : 'Amount N/A'}
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'Complete' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        } ${isDarkMode ? '!bg-green-900 !text-green-100' : ''}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Order Details */}
            <div className="lg:col-span-3">
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Status */}
                  <div className={`rounded-xl shadow-lg p-6 ${cardBgClass}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`w-8 h-8 ${
                          selectedOrder.status === 'Complete' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                        <div>
                          <h3 className={`text-2xl font-bold ${
                            selectedOrder.status === 'Complete' 
                              ? 'text-green-800' 
                              : textClass
                          } ${isDarkMode && selectedOrder.status === 'Complete' ? '!text-green-400' : ''}`}>
                            {selectedOrder.status}
                          </h3>
                          <p className={textMutedClass}>Order #{selectedOrder.quotation_id}</p>
                          {selectedOrder.status === 'Complete' && selectedOrder.completedAt && (
                            <p className="text-sm text-green-600">
                              ✅ Completed on {new Date(selectedOrder.completedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Complete Order Button */}
                      {selectedOrder.status !== 'Complete' && (
                        <button
                          onClick={() => handleCompleteOrder(selectedOrder)}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Complete Order
                        </button>
                      )}
                      
                      {selectedOrder.status === 'Complete' && (
                        <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                          <CheckCircle className="w-5 h-5" />
                          Order Completed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Product Table */}
                  <div className={`rounded-xl shadow-lg p-6 ${cardBgClass}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className={`text-xl font-bold ${textClass}`}>📦 Product Details for Delivery</h3>
                        <p className={textMutedClass}>Complete variant information for accurate delivery</p>
                      </div>
                    </div>

                    {/* Desktop Product Table */}
                    <div className="overflow-x-auto">
                      <table className={`w-full border-collapse border rounded-lg ${borderClass}`}>
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}>
                          <tr>
                            <th className={`border px-4 py-3 text-left text-sm font-semibold ${
                              isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                            }`}>Product Code</th>
                            <th className={`border px-4 py-3 text-left text-sm font-semibold ${
                              isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                            }`}>Product Name</th>
                            <th className={`border px-4 py-3 text-left text-sm font-semibold ${
                              isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                            }`}>Variant Details</th>
                            <th className={`border px-4 py-3 text-center text-sm font-semibold ${
                              isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                            }`}>Quantity</th>
                            <th className={`border px-4 py-3 text-center text-sm font-semibold ${
                              isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                            }`}>Unit Price</th>
                            <th className={`border px-4 py-3 text-center text-sm font-semibold ${
                              isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                            }`}>Total</th>
                            <th className={`border px-4 py-3 text-center text-sm font-semibold ${
                              isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                            }`}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.quotationItems?.map((item, index) => (
                            <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              <td className={`border px-4 py-4 ${borderClass}`}>
                                <div className="space-y-1">
                                  <div className={`font-mono text-sm font-medium px-2 py-1 rounded ${
                                    isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-800'
                                  }`}>
                                    {item.item_code}
                                  </div>
                                  <div className={`text-xs ${textLightClass}`}>SKU</div>
                                </div>
                              </td>
                              <td className={`border px-4 py-4 ${borderClass}`}>
                                <div className="space-y-2">
                                  <div className={`font-medium ${textClass}`}>{item.description}</div>
                                  <div className={`text-xs ${textLightClass}`}>Product Name</div>
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                                    isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'
                                  }`}>
                                    <span className={`text-xs ${textLightClass}`}>IMG</span>
                                  </div>
                                </div>
                              </td>
                              <td className={`border px-4 py-4 ${borderClass}`}>
                                <div className="space-y-1">
                                  <div className={`text-sm font-medium ${textClass}`}>Variant Info</div>
                                  <div className={`text-xs ${textLightClass} mb-2`}>Color/Weight/Size</div>
                                  <div className={`space-y-1 text-xs ${textMutedClass}`}>
                                    <div><span className="font-medium">Category:</span> {item.variant_details?.category}</div>
                                    <div><span className="font-medium">Weight:</span> {item.variant_details?.weight}</div>
                                    <div><span className="font-medium">Batch:</span> {item.variant_details?.batch_no}</div>
                                    <div><span className="font-medium">Exp:</span> {item.variant_details?.exp_date}</div>
                                  </div>
                                </div>
                              </td>
                              <td className={`border px-4 py-4 text-center ${borderClass}`}>
                                <div className="space-y-1">
                                  <div className={`text-2xl font-bold ${textClass}`}>{item.item_qty}</div>
                                  <div className={`text-xs ${textLightClass}`}>units</div>
                                  <div className="text-xs text-green-600 font-medium">In Stock</div>
                                </div>
                              </td>
                              <td className={`border px-4 py-4 text-center ${borderClass}`}>
                                <div className="space-y-1">
                                  <div className={`text-lg font-bold ${textClass}`}>{formatCurrency(item.unit_price)}</div>
                                  <div className={`text-xs ${textLightClass}`}>per unit</div>
                                </div>
                              </td>
                              <td className={`border px-4 py-4 text-center ${borderClass}`}>
                                <div className="space-y-1">
                                  <div className={`text-lg font-bold ${textClass}`}>{formatCurrency(item.total_amount)}</div>
                                  <div className={`text-xs ${textLightClass}`}>line total</div>
                                </div>
                              </td>
                              <td className={`border px-4 py-4 text-center ${borderClass}`}>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-green-700">Ready to Pack</div>
                                  <div className={`text-xs ${textLightClass}`}>Priority: Normal</div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Desktop Summary Sections */}
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                      {/* Package Info */}
                      <div className="space-y-4">
                        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <h4 className={`font-semibold mb-2 flex items-center gap-2 ${textClass}`}>
                            <Package className="w-4 h-4" />
                            Package Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className={textMutedClass}>Total Items:</span>
                              <span className={`font-medium ${textClass}`}>{selectedOrder.no_items} units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={textMutedClass}>Product Variants:</span>
                              <span className={`font-medium ${textClass}`}>{selectedOrder.total_variants}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={textMutedClass}>Estimated Weight:</span>
                              <span className={`font-medium ${textClass}`}>{selectedOrder.estimated_weight} kg</span>
                            </div>
                          </div>
                        </div>
                        <div className={`p-4 border-l-4 ${
                          isDarkMode 
                            ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300' 
                            : 'bg-yellow-50 border-yellow-400 text-yellow-700'
                        }`}>
                          <h4 className="font-semibold mb-2">📦 Packaging Notes:</h4>
                          <p className="text-sm">{selectedOrder.packaging_notes}</p>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="space-y-4">
                        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <h4 className={`font-semibold mb-4 ${textClass}`}>Financial Summary</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                              <span className={textMutedClass}>Sub Total</span>
                              <span className={`font-medium ${textClass}`}>{formatCurrency(selectedOrder.sub_total)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className={textMutedClass}>Discount ({selectedOrder.discount}%)</span>
                              <span className="font-medium text-red-600">-{formatCurrency((selectedOrder.sub_total * selectedOrder.discount) / 100)}</span>
                            </div>
                            <div className={`border-t pt-3 ${borderClass}`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-lg font-semibold ${textClass}`}>Net Total</span>
                                <span className="text-lg font-bold text-green-600">{formatCurrency(selectedOrder.net_total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Order Information */}
                  <div className={`rounded-xl shadow-lg p-6 ${cardBgClass}`}>
                    <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${textClass}`}>
                      <FileText className="w-5 h-5 text-blue-600" />
                      Order Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${textMutedClass}`}>Order ID</span>
                        </div>
                        <p className={`font-semibold ${textClass}`}>{selectedOrder.quotation_id}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${textMutedClass}`}>Customer</span>
                        </div>
                        <p className={`font-semibold ${textClass}`}>{selectedOrder.customerName}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${textMutedClass}`}>Order Date</span>
                        </div>
                        <p className={`font-semibold ${textClass}`}>
                          {new Date(selectedOrder.quotation_date || selectedOrder.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${textMutedClass}`}>Total Value</span>
                        </div>
                        <p className="font-semibold text-green-600">{formatCurrency(selectedOrder.net_total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Order Details */}
          <div className="block lg:hidden">
            {selectedOrder && (
              <div className="space-y-4">
                {/* Mobile Status Card */}
                <div className={`rounded-xl shadow-lg p-4 ${cardBgClass}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-6 h-6 ${
                        selectedOrder.status === 'Complete' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                      <div>
                        <h3 className={`text-lg font-bold ${
                          selectedOrder.status === 'Complete' 
                            ? 'text-green-800' 
                            : textClass
                        } ${isDarkMode && selectedOrder.status === 'Complete' ? '!text-green-400' : ''}`}>
                          {selectedOrder.status}
                        </h3>
                        <p className={`text-sm ${textMutedClass}`}>Order #{selectedOrder.quotation_id}</p>
                        {selectedOrder.status === 'Complete' && selectedOrder.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            ✅ Completed {new Date(selectedOrder.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Complete Order Button - Mobile */}
                  {selectedOrder.status !== 'Complete' && (
                    <button
                      onClick={() => handleCompleteOrder(selectedOrder)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Complete Order
                    </button>
                  )}
                  
                  {selectedOrder.status === 'Complete' && (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Order Completed
                    </div>
                  )}
                </div>

                {/* Mobile Order Info */}
                <div className={`rounded-xl shadow-lg p-4 ${cardBgClass}`}>
                  <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${textClass}`}>
                    <FileText className="w-5 h-5 text-blue-600" />
                    Order Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${textMutedClass}`}>Order ID</span>
                      </div>
                      <p className={`font-semibold ${textClass}`}>{selectedOrder.quotation_id}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${textMutedClass}`}>Customer</span>
                      </div>
                      <p className={`font-semibold ${textClass} text-xs`}>{selectedOrder.customerName}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${textMutedClass}`}>Date</span>
                      </div>
                      <p className={`font-semibold ${textClass} text-xs`}>
                        {new Date(selectedOrder.quotation_date || selectedOrder.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${textMutedClass}`}>Total</span>
                      </div>
                      <p className="font-semibold text-green-600 text-sm">{formatCurrency(selectedOrder.net_total)}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Product Cards */}
                <div className={`rounded-xl shadow-lg p-4 ${cardBgClass}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className={`text-lg font-bold ${textClass}`}>📦 Products</h3>
                  </div>

                  <div className="space-y-4">
                    {selectedOrder.quotationItems?.map((item, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${borderClass}`}>
                        {/* Product Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className={`font-mono text-sm font-medium px-2 py-1 rounded mb-1 inline-block ${
                              isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-800'
                            }`}>
                              {item.item_code}
                            </div>
                            <h4 className={`font-medium ${textClass} text-sm`}>{item.description}</h4>
                          </div>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ml-2 ${
                            isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'
                          }`}>
                            <span className={`text-xs ${textLightClass}`}>IMG</span>
                          </div>
                        </div>

                        {/* Quantity and Pricing */}
                        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                          <div>
                            <p className={`text-xl font-bold ${textClass}`}>{item.item_qty}</p>
                            <p className={`text-xs ${textLightClass}`}>Quantity</p>
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${textClass}`}>{formatCurrency(item.unit_price)}</p>
                            <p className={`text-xs ${textLightClass}`}>Unit Price</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-green-600">{formatCurrency(item.total_amount)}</p>
                            <p className={`text-xs ${textLightClass}`}>Total</p>
                          </div>
                        </div>

                        {/* Variant Details */}
                        <div className={`rounded-lg p-3 text-xs ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <p className={`font-medium ${textClass} mb-2`}>Variant Details:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div><span className="font-medium">Category:</span> {item.variant_details?.category || 'N/A'}</div>
                            <div><span className="font-medium">Weight:</span> {item.variant_details?.weight || 'N/A'}</div>
                            <div><span className="font-medium">Batch:</span> {item.variant_details?.batch_no || 'N/A'}</div>
                            <div><span className="font-medium">Exp:</span> {item.variant_details?.exp_date || 'N/A'}</div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="mt-3 flex justify-between items-center text-xs">
                          <span className="font-medium text-green-700">Ready to Pack</span>
                          <span className={textLightClass}>Priority: Normal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Package Summary */}
                  <div className={`rounded-xl shadow-lg p-4 ${cardBgClass}`}>
                    <h4 className={`font-semibold mb-3 flex items-center gap-2 ${textClass}`}>
                      <Package className="w-4 h-4" />
                      Package Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={textMutedClass}>Items:</span>
                        <span className={`font-medium ${textClass}`}>{selectedOrder.no_items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMutedClass}>Variants:</span>
                        <span className={`font-medium ${textClass}`}>{selectedOrder.total_variants || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMutedClass}>Weight:</span>
                        <span className={`font-medium ${textClass}`}>{selectedOrder.estimated_weight || 'N/A'} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className={`rounded-xl shadow-lg p-4 ${cardBgClass}`}>
                    <h4 className={`font-semibold mb-3 ${textClass}`}>Financial</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={textMutedClass}>Sub Total</span>
                        <span className={`font-medium ${textClass}`}>{formatCurrency(selectedOrder.sub_total || selectedOrder.net_total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMutedClass}>Discount</span>
                        <span className="font-medium text-red-600">-{formatCurrency((selectedOrder.sub_total || selectedOrder.net_total) * (selectedOrder.discount || 0) / 100)}</span>
                      </div>
                      <div className={`border-t pt-2 ${borderClass}`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${textClass}`}>Net Total</span>
                          <span className="font-bold text-green-600">{formatCurrency(selectedOrder.net_total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Packaging Notes */}
                {selectedOrder.packaging_notes && (
                  <div className={`p-4 rounded-lg border-l-4 ${
                    isDarkMode 
                      ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300' 
                      : 'bg-yellow-50 border-yellow-400 text-yellow-700'
                  }`}>
                    <h4 className="font-semibold mb-2">📦 Packaging Notes:</h4>
                    <p className="text-sm">{selectedOrder.packaging_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No orders message */
        <div className={`rounded-xl shadow-lg p-8 sm:p-12 text-center ${cardBgClass}`}>
          <Package className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${textLightClass}`} />
          <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${textClass}`}>
            No Orders Assigned
          </h3>
          <p className={`mb-2 text-sm sm:text-base ${textMutedClass}`}>
            {currentRM 
              ? `No orders have been assigned to ${currentRM.name} (${currentRM.emp_code}) yet.`
              : "There are currently no orders assigned to this resource manager."
            }
          </p>
          {currentRM && (
            <div className={`border rounded-lg p-4 mb-4 text-sm ${
              isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className={`flex items-center justify-center gap-2 font-medium mb-2 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-700'
              }`}>
                <User className="w-4 h-4" />
                Your Profile
              </div>
              <div className={`space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                <p><strong>Name:</strong> {currentRM.name}</p>
                <p><strong>Employee ID:</strong> {currentRM.emp_code}</p>
                <p><strong>Area:</strong> {currentRM.sales_area}</p>
                <p><strong>Contact:</strong> {currentRM.phone}</p>
              </div>
            </div>
          )}
          <p className={`text-xs sm:text-sm mb-4 ${textLightClass}`}>
            Orders will appear here once the Inventory Manager assigns them to you.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all text-sm sm:text-base"
          >
            Refresh Orders
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && orderToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'
              }`}>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${textClass}`}>
                Complete Order?
              </h3>
              
              <p className={`mb-2 ${textMutedClass}`}>
                Are you sure you want to mark <strong>Order #{orderToComplete.quotation_id}</strong> as <span className="text-green-600 font-semibold">COMPLETE</span>?
              </p>
              
              <div className={`border rounded-lg p-3 mb-6 ${
                isDarkMode ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <p className="text-sm">
                  ⚠️ This action cannot be undone. The order status will be permanently changed to "Complete".
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelCompleteOrder}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                
                <button
                  onClick={confirmCompleteOrder}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg transition-colors"
                >
                  ✅ Complete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceOrders;