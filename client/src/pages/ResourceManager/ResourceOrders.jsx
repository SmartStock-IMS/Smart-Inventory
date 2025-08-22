import { useEffect, useState } from "react";
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

// Read assigned orders from localStorage (simulate Inventory Manager passing orders)
function getAssignedOrders() {
  try {
    const data = localStorage.getItem("assignedOrders");
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

// Get orders assigned to specific Resource Manager
function getOrdersForRM(rmId) {
  const allOrders = getAssignedOrders();
  return allOrders.filter(order => {
    // Check if order is assigned to this specific RM
    return order.assignedTo === rmId || 
           order.assignedResourceManager?.id === rmId;
  });
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

// Enrich order data with calculated fields
const enrichOrderWithDetails = (order) => {
  // Check localStorage for completion status
  const orderStatuses = JSON.parse(localStorage.getItem('orderStatuses') || '{}');
  const isCompleted = orderStatuses[order.quotation_id] === 'Complete';
  
  return {
    ...order,
    // Preserve the actual status from localStorage completion if it exists, otherwise keep original
    status: isCompleted ? 'Complete' : (order.status || "In Progress"),
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
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRM, setCurrentRM] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      
      // Get current logged-in RM
      const rm = getCurrentRM();
      setCurrentRM(rm);
      
      // Get orders assigned specifically to this RM
      const orders = getOrdersForRM(rm.id);
      
      if (orders.length > 0) {
        // Enrich orders with detailed quotation information
        const enrichedOrders = orders.map(enrichOrderWithDetails);
        setAssignedOrders(enrichedOrders);
        setSelectedOrder(enrichedOrders[0]); // Select first order by default
      } else {
        setAssignedOrders([]);
        setSelectedOrder(null);
      }
      
      setLoading(false);
    };

    loadOrders();

    // Listen for localStorage changes to automatically refresh when new orders are assigned
    const handleStorageChange = (event) => {
      if (event.key === 'assignedOrders') {
        console.log('Detected new order assignment, refreshing...');
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

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCompleteOrder = (orderToComplete) => {
    if (!orderToComplete) return;
    setOrderToComplete(orderToComplete);
    setShowConfirmModal(true);
  };

  const confirmCompleteOrder = () => {
    if (!orderToComplete) return;

    try {
      // Get all assigned orders from localStorage
      const allOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      
      // Find and update the specific order
      const updatedOrders = allOrders.map(order => {
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

      // Save updated orders back to localStorage
      localStorage.setItem("assignedOrders", JSON.stringify(updatedOrders));
      
      // Update local state
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
      
      // Close modal and reset
      setShowConfirmModal(false);
      setOrderToComplete(null);
      
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-600 font-medium text-sm sm:text-base">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h2 className="text-xl sm:text-3xl font-bold">Resource Orders</h2>
                {currentRM && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <span className="text-sm sm:text-base text-purple-100">
                      Welcome, <strong>{currentRM.name}</strong> ({currentRM.emp_code})
                    </span>
                    <span className="text-xs sm:text-sm text-purple-200">
                      📍 {currentRM.sales_area}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-purple-100 text-sm sm:text-base">
              {currentRM 
                ? `Orders assigned to you for delivery preparation.`
                : "View order details and quotation information for delivery preparation."
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.removeItem('assignedOrders');
                localStorage.removeItem('orderStatuses');
                alert('Test data cleared! Refresh the page.');
                window.location.reload();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors duration-200 backdrop-blur-sm text-sm"
              title="Clear test data from localStorage"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Clear Test Data
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm text-sm"
              title="Refresh page data"
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
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Select Order
              </h3>
              <select
                value={selectedOrder?.quotation_id || ''}
                onChange={(e) => {
                  const order = assignedOrders.find(o => o.quotation_id.toString() === e.target.value);
                  setSelectedOrder(order);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Assigned Orders
                </h3>
                
                <div className="space-y-3">
                  {assignedOrders.map((order, index) => (
                    <div
                      key={order.id || order.quotation_id || index}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedOrder?.quotation_id === order.quotation_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="font-medium text-gray-900">
                        Order #{order.quotation_id || order.id}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {order.customerName || order.customer}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.net_total ? formatCurrency(order.net_total) : 'Amount N/A'}
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
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
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`w-8 h-8 ${selectedOrder.status === 'Complete' ? 'text-green-600' : 'text-blue-600'}`} />
                        <div>
                          <h3 className={`text-2xl font-bold ${selectedOrder.status === 'Complete' ? 'text-green-800' : 'text-gray-900'}`}>
                            {selectedOrder.status}
                          </h3>
                          <p className="text-gray-600">Order #{selectedOrder.quotation_id}</p>
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
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">📦 Product Details for Delivery</h3>
                        <p className="text-gray-600">Complete variant information for accurate delivery</p>
                      </div>
                    </div>

                    {/* Desktop Product Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200 rounded-lg">
                        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                          <tr>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Code</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Variant Details</th>
                            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity</th>
                            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Unit Price</th>
                            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Total</th>
                            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.quotationItems?.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-4 py-4">
                                <div className="space-y-1">
                                  <div className="font-mono text-sm font-medium text-blue-800 bg-blue-50 px-2 py-1 rounded">
                                    {item.item_code}
                                  </div>
                                  <div className="text-xs text-gray-500">SKU</div>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-4">
                                <div className="space-y-2">
                                  <div className="font-medium text-gray-900">{item.description}</div>
                                  <div className="text-xs text-gray-500">Product Name</div>
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border">
                                    <span className="text-xs text-gray-500">IMG</span>
                                  </div>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-4">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-700">Variant Info</div>
                                  <div className="text-xs text-gray-500 mb-2">Color/Weight/Size</div>
                                  <div className="space-y-1 text-xs">
                                    <div><span className="font-medium">Category:</span> {item.variant_details?.category}</div>
                                    <div><span className="font-medium">Weight:</span> {item.variant_details?.weight}</div>
                                    <div><span className="font-medium">Batch:</span> {item.variant_details?.batch_no}</div>
                                    <div><span className="font-medium">Exp:</span> {item.variant_details?.exp_date}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-4 text-center">
                                <div className="space-y-1">
                                  <div className="text-2xl font-bold text-gray-900">{item.item_qty}</div>
                                  <div className="text-xs text-gray-500">units</div>
                                  <div className="text-xs text-green-600 font-medium">In Stock</div>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-4 text-center">
                                <div className="space-y-1">
                                  <div className="text-lg font-bold text-gray-900">{formatCurrency(item.unit_price)}</div>
                                  <div className="text-xs text-gray-500">per unit</div>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-4 text-center">
                                <div className="space-y-1">
                                  <div className="text-lg font-bold text-gray-900">{formatCurrency(item.total_amount)}</div>
                                  <div className="text-xs text-gray-500">line total</div>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-4 text-center">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-green-700">{item.delivery_status}</div>
                                  <div className="text-xs text-gray-600">Priority: {item.priority}</div>
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
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Package Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Items:</span>
                              <span className="font-medium">{selectedOrder.no_items} units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Product Variants:</span>
                              <span className="font-medium">{selectedOrder.total_variants}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated Weight:</span>
                              <span className="font-medium">{selectedOrder.estimated_weight} kg</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">📦 Packaging Notes:</h4>
                          <p className="text-sm text-yellow-700">{selectedOrder.packaging_notes}</p>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-4">Financial Summary</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600">Sub Total</span>
                              <span className="font-medium text-gray-900">{formatCurrency(selectedOrder.sub_total)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600">Discount ({selectedOrder.discount}%)</span>
                              <span className="font-medium text-red-600">-{formatCurrency((selectedOrder.sub_total * selectedOrder.discount) / 100)}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">Net Total</span>
                                <span className="text-lg font-bold text-green-600">{formatCurrency(selectedOrder.net_total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Order Information */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Order Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Order ID</span>
                        </div>
                        <p className="font-semibold text-gray-900">{selectedOrder.quotation_id}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Customer</span>
                        </div>
                        <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Order Date</span>
                        </div>
                        <p className="font-semibold text-gray-900">
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
                          <span className="text-sm font-medium text-gray-600">Total Value</span>
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
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-6 h-6 ${selectedOrder.status === 'Complete' ? 'text-green-600' : 'text-blue-600'}`} />
                      <div>
                        <h3 className={`text-lg font-bold ${selectedOrder.status === 'Complete' ? 'text-green-800' : 'text-gray-900'}`}>
                          {selectedOrder.status}
                        </h3>
                        <p className="text-sm text-gray-600">Order #{selectedOrder.quotation_id}</p>
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
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Order Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-600">Order ID</span>
                      </div>
                      <p className="font-semibold text-gray-900">{selectedOrder.quotation_id}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-600">Customer</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-xs">{selectedOrder.customerName}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-600">Date</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-xs">
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
                        <span className="font-medium text-gray-600">Total</span>
                      </div>
                      <p className="font-semibold text-green-600 text-sm">{formatCurrency(selectedOrder.net_total)}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Product Cards */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">📦 Products</h3>
                  </div>

                  <div className="space-y-4">
                    {selectedOrder.quotationItems?.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        {/* Product Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-mono text-sm font-medium text-blue-800 bg-blue-50 px-2 py-1 rounded mb-1 inline-block">
                              {item.item_code}
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm">{item.description}</h4>
                          </div>
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border flex-shrink-0 ml-2">
                            <span className="text-xs text-gray-500">IMG</span>
                          </div>
                        </div>

                        {/* Quantity and Pricing */}
                        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                          <div>
                            <p className="text-xl font-bold text-gray-900">{item.item_qty}</p>
                            <p className="text-xs text-gray-500">Quantity</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(item.unit_price)}</p>
                            <p className="text-xs text-gray-500">Unit Price</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-green-600">{formatCurrency(item.total_amount)}</p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                        </div>

                        {/* Variant Details */}
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                          <p className="font-medium text-gray-700 mb-2">Variant Details:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div><span className="font-medium">Category:</span> {item.variant_details?.category || 'N/A'}</div>
                            <div><span className="font-medium">Weight:</span> {item.variant_details?.weight || 'N/A'}</div>
                            <div><span className="font-medium">Batch:</span> {item.variant_details?.batch_no || 'N/A'}</div>
                            <div><span className="font-medium">Exp:</span> {item.variant_details?.exp_date || 'N/A'}</div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="mt-3 flex justify-between items-center text-xs">
                          <span className="font-medium text-green-700">{item.delivery_status || 'Ready'}</span>
                          <span className="text-gray-600">Priority: {item.priority || 'Normal'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Package Summary */}
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Package Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium">{selectedOrder.no_items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Variants:</span>
                        <span className="font-medium">{selectedOrder.total_variants || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{selectedOrder.estimated_weight || 'N/A'} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Financial</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sub Total</span>
                        <span className="font-medium">{formatCurrency(selectedOrder.sub_total || selectedOrder.net_total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-red-600">-{formatCurrency((selectedOrder.sub_total || selectedOrder.net_total) * (selectedOrder.discount || 0) / 100)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Net Total</span>
                          <span className="font-bold text-green-600">{formatCurrency(selectedOrder.net_total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Packaging Notes */}
                {selectedOrder.packaging_notes && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">📦 Packaging Notes:</h4>
                    <p className="text-sm text-yellow-700">{selectedOrder.packaging_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No orders message */
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No Orders Assigned
          </h3>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">
            {currentRM 
              ? `No orders have been assigned to ${currentRM.name} (${currentRM.emp_code}) yet.`
              : "There are currently no orders assigned to this resource manager."
            }
          </p>
          {currentRM && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
              <div className="flex items-center justify-center gap-2 text-blue-700 font-medium mb-2">
                <User className="w-4 h-4" />
                Your Profile
              </div>
              <div className="text-blue-600 space-y-1">
                <p><strong>Name:</strong> {currentRM.name}</p>
                <p><strong>Employee ID:</strong> {currentRM.emp_code}</p>
                <p><strong>Area:</strong> {currentRM.sales_area}</p>
                <p><strong>Contact:</strong> {currentRM.phone}</p>
              </div>
            </div>
          )}
          <p className="text-gray-500 text-xs sm:text-sm mb-4">
            Orders will appear here once the Inventory Manager assigns them to you.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all text-sm sm:text-base"
          >
            Refresh Orders
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && orderToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Complete Order?
              </h3>
              
              <p className="text-gray-600 mb-2">
                Are you sure you want to mark <strong>Order #{orderToComplete.quotation_id}</strong> as <span className="text-green-600 font-semibold">COMPLETE</span>?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ This action cannot be undone. The order status will be permanently changed to "Complete".
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelCompleteOrder}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-300"
                >
                  Cancel
                </button>
                
                <button
                  onClick={confirmCompleteOrder}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium shadow-lg"
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
