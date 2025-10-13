import { useEffect, useState } from "react";
import { BookOpenCheck, Search, Filter, Eye, Calendar, Hash, User, Users, DollarSign, Package, Activity, Sparkles, ChevronDown, RefreshCw, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import OrderDetails from "@components/InventoryManager/orders/OrderDetails";

const OrderSummary = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResourceManager, setSelectedResourceManager] = useState("");
  const [showResourceManagerModal, setShowResourceManagerModal] = useState(false);
  const [orderToPass, setOrderToPass] = useState(null);
  const [rmSearchQuery, setRmSearchQuery] = useState("");
  const [lockedResourceManager, setLockedResourceManager] = useState("");
  const [assignedOrders, setAssignedOrders] = useState(new Set());
  const [orderResourceManagers, setOrderResourceManagers] = useState(new Map());
  const [resourceManagers, setResourceManagers] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchResourceManagers();
  }, []);

  // Auto-assign approved orders when both orders and resource managers are loaded
  useEffect(() => {
    if (orders.length > 0 && resourceManagers.length > 0) {
      const approvedOrders = orders.filter(order => order.order_status === "approved");
      const existingAssigned = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      
      // Only auto-assign if no orders are already assigned
      if (approvedOrders.length > 0 && existingAssigned.length === 0) {
        const firstRM = resourceManagers[0];
        const ordersToPass = approvedOrders.map(order => ({
          id: order.order_id,
          quotation_id: order.order_id,
          customer: order.customer_name,
          customerName: order.customer_name,
          status: order.order_status,
          date: order.order_date,
          quotation_date: order.order_date,
          net_total: parseFloat(order.total_amount),
          no_items: parseInt(order.no_of_products),
          assignedTo: firstRM.id,
          assignedResourceManager: {
            id: firstRM.id,
            name: firstRM.name,
            assignedAt: new Date().toISOString()
          },
          assignedAt: new Date().toISOString(),
          items: order.products_json?.map(product => ({
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
        }));
        
        localStorage.setItem("assignedOrders", JSON.stringify(ordersToPass));
        console.log(`Auto-assigned ${ordersToPass.length} approved orders to ${firstRM.name} (${firstRM.id})`);
        
        // Dispatch custom event to notify ResourceOrders page
        window.dispatchEvent(new CustomEvent('orderAssigned', {
          detail: {
            count: ordersToPass.length,
            resourceManager: firstRM.name,
            type: 'auto-assignment',
            assignedAt: new Date().toISOString()
          }
        }));
        
        // Update the assigned orders state
        const assignedIds = new Set(ordersToPass.map(order => order.quotation_id));
        setAssignedOrders(assignedIds);
        
        // Update the resource manager mapping
        const rmMap = new Map();
        ordersToPass.forEach(order => {
          rmMap.set(order.quotation_id, order.assignedResourceManager);
        });
        setOrderResourceManagers(rmMap);
      }
    }
  }, [orders, resourceManagers]);

  // Restore Resource Manager assignments from localStorage
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
    if (storedOrders.length > 0) {
      const restoredAssignments = new Set();
      const restoredRMMap = new Map();
      
      storedOrders.forEach(order => {
        if (order.assignedResourceManager) {
          restoredAssignments.add(order.quotation_id);
          restoredRMMap.set(order.quotation_id, order.assignedResourceManager);
        }
      });
      
      setAssignedOrders(restoredAssignments);
      setOrderResourceManagers(restoredRMMap);
    }
  }, [orders]);

  // Listen for order completion updates from Resource Manager
  useEffect(() => {
    const handleOrderCompletion = () => {
      console.log("Order completion detected, refreshing UI...");
      // Force a re-render to update button states
      setAssignedOrders(new Set(assignedOrders));
    };

    // Listen for storage changes (when RM completes orders)
    const handleStorageChange = (event) => {
      if (event.key === 'assignedOrders') {
        handleOrderCompletion();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [assignedOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/all-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log("Orders fetched: ", result.data);
        setOrders(result.data);
      } else {
        console.error("Error fetching orders:", result.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/resource-manager`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success && result.data && result.data.users) {
        console.log("Resource managers fetched: ", result.data.users);
        
        const transformedRMs = result.data.users.map(staff => ({
          id: staff.resource_manager_id,
          name: staff.full_name,
          area: 'Sales Area', // Not provided in API response
          email: staff.email,
          phone: staff.phone,
          // target: staff.target,
          achieved: staff.achieved,
          performance_rating: staff.performance_rating
        }));
        
        setResourceManagers(transformedRMs);
      } else {
        console.error("Failed to fetch resource managers:", result.message);
        setResourceManagers([]);
      }
    } catch (error) {
      console.error("Error loading resource managers:", error);
      setResourceManagers([]);
    }
  };

  const handleOrderView = (orderItem) => {
    console.log("Order view: ", orderItem);
    
    // Add resource manager information to the order if it's assigned
    const rmInfo = orderResourceManagers.get(orderItem.order_id);
    // Calculate sub_total and discount if possible
    let sub_total = 0;
    let discount = 0;
    if (Array.isArray(orderItem.products_json)) {
      sub_total = orderItem.products_json.reduce((sum, p) => sum + (typeof p.total_amount === 'number' ? p.total_amount : parseFloat(p.total_amount) || 0), 0);
    }
    if (typeof orderItem.discount === 'number') {
      discount = orderItem.discount;
    } else if (orderItem.discount) {
      discount = parseFloat(orderItem.discount) || 0;
    }
    const orderWithRM = {
      ...orderItem,
      quotation_id: orderItem.order_id, // Map order_id to quotation_id for OrderDetails component
      customer_id: orderItem.customer_id || orderItem.customer_name,
      sales_rep_id: orderItem.sales_rep_id || orderItem.sales_rep_name,
      quotation_date: orderItem.order_date,
      net_total: parseFloat(orderItem.total_amount),
      no_items: parseInt(orderItem.no_of_products),
      status: orderItem.order_status,
      sub_total,
      discount,
      quotationItems: orderItem.products_json?.map(product => ({
        id: typeof product.product_id === 'number' ? product.product_id : parseInt(product.product_id) || product.product_id,
        quotation_id: orderItem.order_id,
        item_code: product.product_id,
        description: product.product_name,
        item_qty: product.quantity,
        unit_price: product.unit_price,
        total_amount: product.total_amount,
        variant_details: {
          color: "N/A",
          weight: "N/A",
          category: product.category_name,
          batch_no: "N/A",
          exp_date: "N/A",
          image_url: "/products/default.jpg"
        }
      })) || [],
      assignedResourceManager: rmInfo || null
    };
    setIsOpen(true);
    setSelectedItem(orderWithRM);
  };

  const statusOptions = ["All", ...new Set((orders || []).map((item) => item.order_status))];

  const filteredOrders = (orders || []).filter((item) => {
    const matchesSearch = searchQuery
      ? item.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sales_rep_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus = statusFilter === "All" || item.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setIsOpen(false);
    fetchOrders();
  };

  // Function to check if an order is completed by Resource Manager
  const isOrderCompletedByRM = (orderId) => {
    try {
      const assignedOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      const order = assignedOrders.find(o => o.quotation_id === orderId);
      return order && order.status === "Complete";
    } catch (error) {
      console.error("Error checking order completion status:", error);
      return false;
    }
  };

  // Function to get completion statistics
  const getCompletionStats = () => {
    try {
      const assignedOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      const totalAssigned = assignedOrders.length;
      const completedOrders = assignedOrders.filter(o => o.status === "Complete").length;
      const pendingOrders = totalAssigned - completedOrders;
      
      return {
        totalAssigned,
        completedOrders,
        pendingOrders,
        completionRate: totalAssigned > 0 ? Math.round((completedOrders / totalAssigned) * 100) : 0
      };
    } catch (error) {
      console.error("Error calculating completion stats:", error);
      return { totalAssigned: 0, completedOrders: 0, pendingOrders: 0, completionRate: 0 };
    }
  };

  // Calculate summary statistics from actual orders data
  const getSummaryStats = () => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalItems: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
        rejectedOrders: 0,
        totalCustomers: 0,
        totalVariants: 0,
        monthlyGrowth: 0,
        dailyOrders: 0,
        topProduct: "N/A"
      };
    }

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const totalItems = orders.reduce((sum, order) => sum + parseInt(order.no_of_products || 0), 0);
    const uniqueCustomers = new Set(orders.map(order => order.customer_id)).size;
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {});

    // Calculate product frequency for top product
    const productCounts = {};
    orders.forEach(order => {
      if (order.products_json) {
        order.products_json.forEach(product => {
          productCounts[product.product_name] = (productCounts[product.product_name] || 0) + product.quantity;
        });
      }
    });
    const topProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b, "N/A");

    return {
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
      totalItems: totalItems,
      averageOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
      pendingOrders: statusCounts['pending'] || 0,
      approvedOrders: statusCounts['approved'] || 0,
      inProgressOrders: statusCounts['inprogress'] || 0,
      completedOrders: statusCounts['completed'] || 0,
      rejectedOrders: statusCounts['rejected'] || 0,
      totalCustomers: uniqueCustomers,
      totalVariants: Object.keys(productCounts).length,
      monthlyGrowth: 15.8, // This would need historical data to calculate
      dailyOrders: orders.length > 0 ? Math.round((orders.length / 30) * 10) / 10 : 0, // Rough estimate
      topProduct: topProduct
    };
  };

  // Filter resource managers based on search query
  const filteredResourceManagers = resourceManagers.filter((rm) => {
    if (!rmSearchQuery) return true;
    const query = rmSearchQuery.toLowerCase();
    return (
      rm.name.toLowerCase().includes(query) ||
      rm.id.toLowerCase().includes(query) ||
      rm.email.toLowerCase().includes(query)
    );
  });

  // Function to initiate passing a single order
  const initiatePassOrder = (order) => {
    if (lockedResourceManager) {
      // If resource manager is locked, directly assign
      assignOrderToLockedManager(order);
    } else {
      // Show modal to select resource manager
      setOrderToPass(order);
      setShowResourceManagerModal(true);
    }
  };

  // Function to assign order to locked resource manager
  const assignOrderToLockedManager = async (order) => {
    try {
      const lockedRM = resourceManagers.find(rm => rm.id === lockedResourceManager);
      
      // Call the API to assign the order
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.order_id,
          resourceManagerId: lockedResourceManager
        })
      });

      const result = await response.json();

      if (!result.success) {
        alert(`Failed to assign order: ${result.message}`);
        return;
      }

      // Transform order data for localStorage (keeping existing functionality)
      const orderData = {
        id: order.order_id,
        quotation_id: order.order_id,
        customer: order.customer_name,
        customerName: order.customer_name,
        status: 'inprogress', // Updated status from API
        date: order.order_date,
        quotation_date: order.order_date,
        net_total: parseFloat(order.total_amount),
        no_items: parseInt(order.no_of_products),
        assignedTo: lockedResourceManager,
        assignedResourceManager: {
          id: lockedResourceManager,
          name: lockedRM.name,
          assignedAt: new Date().toISOString()
        },
        assignedAt: new Date().toISOString(),
        items: order.products_json?.map(product => ({
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

      // Update localStorage (keeping existing functionality for ResourceOrders page)
      const existingOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      const filteredOrders = existingOrders.filter(o => o.quotation_id !== orderData.quotation_id);
      const updatedOrders = [...filteredOrders, orderData];
      localStorage.setItem("assignedOrders", JSON.stringify(updatedOrders));
      
      alert(`Successfully assigned Order ${order.order_id} to ${lockedRM.name}!`);
      
      // Dispatch custom event to notify ResourceOrders page
      window.dispatchEvent(new CustomEvent('orderAssigned', {
        detail: {
          orderId: order.order_id,
          resourceManager: lockedRM.name,
          type: 'locked-assignment',
          assignedAt: new Date().toISOString()
        }
      }));
      
      // Update UI state
      setAssignedOrders(prev => new Set([...prev, order.order_id]));
      setOrderResourceManagers(prev => new Map(prev.set(order.order_id, {
        id: lockedResourceManager,
        name: lockedRM.name,
        assignedAt: new Date().toISOString()
      })));
      
      // Refresh orders to show updated status
      fetchOrders();
    } catch (error) {
      console.error("Error assigning order:", error);
      alert("Error assigning order");
    }
  };

  // Function to change resource manager for a specific order
  const changeResourceManager = (order) => {
    setOrderToPass(order);
    setShowResourceManagerModal(true);
  };

  const confirmPassOrder = async () => {
    if (!selectedResourceManager || !orderToPass) {
      alert("Please select a Resource Manager");
      return;
    }

    try {
      // Get selected Resource Manager details
      const chosenRM = resourceManagers.find(rm => rm.id === selectedResourceManager);
      
      // Call the API to assign the order
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderToPass.order_id,
          resourceManagerId: selectedResourceManager
        })
      });

      const result = await response.json();

      if (!result.success) {
        alert(`Failed to assign order: ${result.message}`);
        return;
      }

      // Transform order data for localStorage (keeping existing functionality)
      const orderData = {
        id: orderToPass.order_id,
        quotation_id: orderToPass.order_id,
        customer: orderToPass.customer_name,
        customerName: orderToPass.customer_name,
        status: 'inprogress', // Updated status from API
        date: orderToPass.order_date,
        quotation_date: orderToPass.order_date,
        net_total: parseFloat(orderToPass.total_amount),
        no_items: parseInt(orderToPass.no_of_products),
        assignedTo: selectedResourceManager,
        assignedResourceManager: {
          id: selectedResourceManager,
          name: chosenRM.name,
          assignedAt: new Date().toISOString()
        },
        assignedAt: new Date().toISOString(),
        items: orderToPass.products_json?.map(product => ({
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

      // Update localStorage (keeping existing functionality for ResourceOrders page)
      const existingOrders = JSON.parse(localStorage.getItem("assignedOrders") || "[]");
      const filteredOrders = existingOrders.filter(o => o.quotation_id !== orderData.quotation_id);
      const updatedOrders = [...filteredOrders, orderData];
      localStorage.setItem("assignedOrders", JSON.stringify(updatedOrders));
      
      alert(`Successfully assigned Order ${orderToPass.order_id} to ${chosenRM.name}!`);
      
      // Dispatch custom event to notify ResourceOrders page
      window.dispatchEvent(new CustomEvent('orderAssigned', {
        detail: {
          orderId: orderToPass.order_id,
          resourceManager: chosenRM.name,
          assignedAt: new Date().toISOString()
        }
      }));
      
      // Update UI state
      setAssignedOrders(prev => new Set([...prev, orderToPass.order_id]));
      setOrderResourceManagers(prev => new Map(prev.set(orderToPass.order_id, {
        id: selectedResourceManager,
        name: chosenRM.name,
        assignedAt: new Date().toISOString()
      })));
      
      // Lock the selected resource manager for future assignments
      setLockedResourceManager(selectedResourceManager);
      
      // Reset states
      setShowResourceManagerModal(false);
      setSelectedResourceManager("");
      setOrderToPass(null);
      setRmSearchQuery("");
      
      // Refresh orders to show updated status
      fetchOrders();
    } catch (error) {
      console.error("Error assigning order to Resource Manager:", error);
      alert("Error assigning order to Resource Manager");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const LoadingSpinner = () => (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
          <RefreshCw size={32} color="white" className="animate-spin" />
        </div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-full animate-ping opacity-75"></div>
      </div>
      <div className="flex items-center gap-3 text-gray-600">
        <span className="text-xl font-medium">Loading orders data</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );

  const summaryStats = getSummaryStats();

  return (
    <div className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {isOpen ? (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-white p-6">
          <OrderDetails item={selectedItem} changeOpen={() => handleRefresh()} />
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-white/10"></div>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Order Summary</h2>
                <p className="text-white/80">Track and manage all orders</p>
              </div>
              <div className="ml-auto">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="flex-1 p-6 flex flex-col gap-6">
              {/* Summary Statistics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Orders */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.totalOrders}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">+{summaryStats.monthlyGrowth}%</span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Overview */}
              <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Order Status Overview</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity className="w-4 h-4" />
                    Real-time data
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">{summaryStats.pendingOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Approved</p>
                        <p className="text-2xl font-bold text-green-900">{summaryStats.approvedOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">In Progress</p>
                        <p className="text-2xl font-bold text-blue-900">{summaryStats.inProgressOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-purple-800">Completed</p>
                        <p className="text-2xl font-bold text-purple-900">{summaryStats.completedOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Rejected</p>
                        <p className="text-2xl font-bold text-red-900">{summaryStats.rejectedOrders}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Status Filter */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter by Status
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white shadow-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search Orders
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        placeholder="Search by Order ID, Customer Name, or Sales Rep..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Orders List ({filteredOrders.length} results)
                    </h3>
                    <div className="text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Only approved orders can be assigned
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-purple-600" />
                          Completed orders cannot be reassigned
                        </div>
                        {(() => {
                          const stats = getCompletionStats();
                          if (stats.totalAssigned > 0) {
                            return (
                              <div className="flex items-center gap-2 text-xs mt-1 text-blue-600">
                                <Activity className="w-3 h-3" />
                                {stats.completedOrders}/{stats.totalAssigned} assigned orders completed ({stats.completionRate}%)
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Order Date
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Order ID
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer Name
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Sales Rep
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Total Amount
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            No of Products
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Assigned RM
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((item) => (
                        <tr key={item.order_id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {new Date(item.order_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {item.order_id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.customer_name}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.sales_rep_name}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                            Rs. {parseFloat(item.total_amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 text-center">
                            {item.no_of_products}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {assignedOrders.has(item.order_id) ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="font-medium text-gray-900">
                                    {orderResourceManagers.get(item.order_id)?.name || 'Assigned'}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {orderResourceManagers.get(item.order_id)?.id || 'N/A'} • {orderResourceManagers.get(item.order_id)?.assignedAt ? 
                                    new Date(orderResourceManagers.get(item.order_id).assignedAt).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 'Recently'
                                  }
                                </div>
                                {isOrderCompletedByRM(item.order_id) && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600 font-medium">Completed</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span className="text-sm">Not assigned</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.order_status)}`}>
                              {item.order_status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOrderView(item)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              {item.order_status === "approved" || item.order_status === "inprogress" ? (
                                assignedOrders.has(item.order_id) ? (
                                  // Check if order is completed by Resource Manager
                                  isOrderCompletedByRM(item.order_id) ? (
                                    <button
                                      disabled
                                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg cursor-default border border-green-200"
                                      title="Order completed by Resource Manager"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Completed
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => changeResourceManager(item)}
                                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                      <User className="w-4 h-4" />
                                      Change RM
                                    </button>
                                  )
                                ) : (
                                  <button
                                    onClick={() => initiatePassOrder(item)}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <Package className="w-4 h-4" />
                                    Assign
                                  </button>
                                )
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
                                  title={`Only approved orders can be assigned. Current status: ${item.order_status}`}
                                >
                                  <Package className="w-4 h-4" />
                                  Assign
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredOrders.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpenCheck className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-500 font-medium mb-2">No orders found</h3>
                    <p className="text-sm text-gray-400">Try adjusting your search criteria or filters</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resource Manager Selection Modal */}
      {showResourceManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Select Resource Manager</h3>
                <p className="text-sm text-gray-600">Choose who will handle this order</p>
              </div>
            </div>

            {orderToPass && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Order: {orderToPass.order_id}</p>
                <p className="text-sm text-gray-600">Customer: {orderToPass.customer_name}</p>
                <p className="text-sm text-gray-600">Total: Rs. {parseFloat(orderToPass.total_amount).toLocaleString()}</p>
              </div>
            )}

            {/* Search Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Resource Managers
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or email..."
                  value={rmSearchQuery}
                  onChange={(e) => setRmSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {rmSearchQuery && (
                  <button
                    onClick={() => setRmSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Resource Managers List with Scroll */}
            <div className="flex-1 overflow-hidden">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Resource Managers ({filteredResourceManagers.length})
              </label>
              
              {filteredResourceManagers.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {filteredResourceManagers.map((manager) => (
                    <label key={manager.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200">
                      <input
                        type="radio"
                        name="resourceManager"
                        value={manager.id}
                        checked={selectedResourceManager === manager.id}
                        onChange={(e) => setSelectedResourceManager(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {manager.id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{manager.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Target: Rs. {parseFloat(manager.target).toLocaleString()} | Performance: {manager.performance_rating}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 font-medium">No resource managers found</p>
                  <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowResourceManagerModal(false);
                  setSelectedResourceManager("");
                  setOrderToPass(null);
                  setRmSearchQuery("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPassOrder}
                disabled={!selectedResourceManager}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
              >
                Assign Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;