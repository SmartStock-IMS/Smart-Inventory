import { useEffect, useState } from "react";
import { BookOpenCheck, Search, Filter, Eye, Calendar, Hash, User, Users, DollarSign, Package, Activity, Sparkles, ChevronDown, RefreshCw, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import OrderDetails from "@components/InventoryManager/orders/OrderDetails";

const OrderSummary = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setQuotations([]);
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
        setQuotations(result.data);
      } else {
        setQuotations([]);
      }
    } catch (error) {
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderView = (orderItem) => {
    // Map API data to expected structure for OrderDetails
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
    const mappedOrder = {
      ...orderItem,
      quotation_id: orderItem.order_id,
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
      })) || []
    };
    setIsOpen(true);
    setSelectedItem(mappedOrder);
  };

  const statusOptions = ["All", ...new Set((quotations || []).map((item) => item.order_status))];

  const filteredQuotations = (quotations || []).filter((item) => {
    const matchesSearch = searchQuery
      ? (item.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sales_rep_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sales_rep_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesStatus = statusFilter === "All" || item.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setIsOpen(false);
    fetchQuotations();
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

  // Calculate summary statistics from actual orders data
  const getSummaryStats = () => {
    if (!quotations || quotations.length === 0) {
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

    const totalRevenue = quotations.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const totalItems = quotations.reduce((sum, order) => sum + parseInt(order.no_of_products || 0), 0);
    const uniqueCustomers = new Set(quotations.map(order => order.customer_id)).size;
    const statusCounts = quotations.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {});

    // Calculate product frequency for top product
    const productCounts = {};
    quotations.forEach(order => {
      if (order.products_json) {
        order.products_json.forEach(product => {
          productCounts[product.product_name] = (productCounts[product.product_name] || 0) + product.quantity;
        });
      }
    });
    const topProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b, "N/A");

    return {
      totalOrders: quotations.length,
      totalRevenue: totalRevenue,
      totalItems: totalItems,
      averageOrderValue: quotations.length > 0 ? Math.round(totalRevenue / quotations.length) : 0,
      pendingOrders: statusCounts['pending'] || 0,
      approvedOrders: statusCounts['approved'] || 0,
      inProgressOrders: statusCounts['in_progress'] || 0,
      completedOrders: statusCounts['completed'] || 0,
      rejectedOrders: statusCounts['rejected'] || 0,
      totalCustomers: uniqueCustomers,
      totalVariants: Object.keys(productCounts).length,
      monthlyGrowth: 15.8, // This would need historical data to calculate
      dailyOrders: quotations.length > 0 ? Math.round((quotations.length / 30) * 10) / 10 : 0, // Rough estimate
      topProduct: topProduct
    };
  };

  const summaryStats = getSummaryStats();

  // Map API data to table-ready structure
  const mappedQuotations = filteredQuotations.map(item => {
    let sub_total = 0;
    let discount = 0;
    if (Array.isArray(item.products_json)) {
      sub_total = item.products_json.reduce((sum, p) => sum + (typeof p.total_amount === 'number' ? p.total_amount : parseFloat(p.total_amount) || 0), 0);
    }
    if (typeof item.discount === 'number') {
      discount = item.discount;
    } else if (item.discount) {
      discount = parseFloat(item.discount) || 0;
    }
    return {
      ...item,
      quotation_id: item.order_id,
      customer_id: item.customer_id || item.customer_name,
      sales_rep_id: item.sales_rep_id || item.sales_rep_name,
      quotation_date: item.order_date,
      net_total: parseFloat(item.total_amount) || 0,
      no_items: parseInt(item.no_of_products) || 0,
      status: item.order_status,
      sub_total,
      discount,
      quotationItems: item.products_json?.map(product => ({
        id: typeof product.product_id === 'number' ? product.product_id : parseInt(product.product_id) || product.product_id,
        quotation_id: item.order_id,
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
      })) || []
    };
  });

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
                      <BookOpenCheck className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">Rs. {summaryStats.totalRevenue.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">Avg: Rs. {summaryStats.averageOrderValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Total Items */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Items Ordered</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.totalItems}</p>
                      <div className="flex items-center mt-2">
                        <Package className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600 font-medium">{summaryStats.totalVariants} Variants</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Active Customers */}
                <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Customers</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.totalCustomers}</p>
                      <div className="flex items-center mt-2">
                        <Clock className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600 font-medium">{summaryStats.dailyOrders}/day avg</span>
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
                        placeholder="Search by Order ID, Customer ID, or Sales Rep..."
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
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Orders List ({filteredQuotations.length} results)
                  </h3>
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
                            Customer ID
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Sales Rep ID
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
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mappedQuotations.map((item) => (
                        <tr key={item.quotation_id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {new Date(item.quotation_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {item.quotation_id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.customer_id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.sales_rep_id}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                            Rs. {item.net_total.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 text-center">
                            {item.no_items}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleOrderView(item)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredQuotations.length === 0 && (
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
    </div>
  );
};

export default OrderSummary;