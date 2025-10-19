import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Package,
  Building,
  ShoppingCart,
  Plus,
  Minus,
  DollarSign,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calculator,
  Eye,
  Filter,
  RefreshCw,
  Truck,
  Box
} from "lucide-react";
import { useTheme } from "../../../context/theme/ThemeContext";
import axios from "axios";

const SupplierProducts = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { supplierId } = useParams();

  // State management
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(supplierId || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch products, suppliers, and categories in parallel
      const [productsRes, suppliersRes, categoriesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/products?limit=1000`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/suppliers`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/categories`, { headers })
      ]);

      setProducts(productsRes.data?.data?.products || []);
      setSuppliers(suppliersRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Add product to order
  const addToOrder = useCallback((product) => {
    setOrderItems(prev => {
      const existingItem = prev.find(item => item.product_id === product.product_id);
      if (existingItem) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          product_id: product.product_id,
          product_name: product.product_name,
          product_code: product.product_code,
          current_stock: product.quantity || 0,
          quantity: 1,
          unit_price: 0,
          total_amount: 0
        }];
      }
    });
  }, []);

  // Remove product from order
  const removeFromOrder = useCallback((productId) => {
    setOrderItems(prev => prev.filter(item => item.product_id !== productId));
  }, []);

  // Update order item
  const updateOrderItem = useCallback((productId, field, value) => {
    setOrderItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        const updatedItem = { ...item, [field]: parseFloat(value) || 0 };
        // Calculate total amount
        updatedItem.total_amount = updatedItem.quantity * updatedItem.unit_price;
        return updatedItem;
      }
      return item;
    }));
  }, []);

  // Calculate total order amount
  const totalOrderAmount = orderItems.reduce((sum, item) => sum + item.total_amount, 0);

  // Submit supplier order
  const handleSubmitOrder = async () => {
    if (!selectedSupplier) {
      setError("Please select a supplier");
      return;
    }

    if (orderItems.length === 0) {
      setError("Please add at least one product to the order");
      return;
    }

    const invalidItems = orderItems.filter(item => item.quantity <= 0 || item.unit_price <= 0);
    if (invalidItems.length > 0) {
      setError("All items must have valid quantity and unit price");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      const orderData = {
        supplier_id: selectedSupplier,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_amount: item.total_amount
        })),
        total_amount: totalOrderAmount
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/supplier-orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess("Supplier order created successfully!");
      setOrderItems([]);
      setTimeout(() => {
        setSuccess("");
        // Navigate to orders list (when created)
        // navigate("/inventorymanager/supplier-orders");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to create supplier order");
      console.error("Error creating order:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`h-full w-full rounded-3xl border shadow-xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-gray-200'}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-gray-200'}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Supplier Product Management</h1>
            <p className="text-white/80">Assign suppliers and manage product restocking orders</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-140px)] p-6 overflow-y-auto">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Selection Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters and Search */}
            <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
                  <Filter className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Product Selection
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Supplier Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Supplier *
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'}`}
                  >
                    <option value="">Choose supplier...</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or code..."
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'}`}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category Filter
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'}`}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-gray-200'}`}>
                <h3 className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Available Products ({filteredProducts.length})
                </h3>
              </div>

              <div className="p-6">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <div
                        key={product.product_id}
                        className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className={`font-semibold truncate transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {product.product_name}
                            </h4>
                            <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Code: {product.product_code}
                            </p>
                            <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Stock: {product.quantity || 0}
                            </p>
                          </div>
                          <button
                            onClick={() => addToOrder(product)}
                            disabled={orderItems.some(item => item.product_id === product.product_id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              orderItems.some(item => item.product_id === product.product_id)
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                          >
                            {orderItems.some(item => item.product_id === product.product_id) ? "Added" : "Add"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      No products found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Panel */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
                    <ShoppingCart className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h3 className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Order Items ({orderItems.length})
                  </h3>
                </div>
              </div>

              <div className="p-6">
                {orderItems.length > 0 ? (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {orderItems.map(item => (
                      <div
                        key={item.product_id}
                        className={`border rounded-lg p-4 space-y-3 transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium truncate transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {item.product_name}
                          </h4>
                          <button
                            onClick={() => removeFromOrder(item.product_id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(item.product_id, 'quantity', e.target.value)}
                              className={`w-full px-2 py-1 text-sm border rounded transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Unit Price
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateOrderItem(item.product_id, 'unit_price', e.target.value)}
                              className={`w-full px-2 py-1 text-sm border rounded transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'}`}
                            />
                          </div>
                        </div>
                        
                        <div className={`text-right transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="text-sm font-medium">
                            Total: Rs {item.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      No items added yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Total & Submit */}
            <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Total Amount:
                  </span>
                  <span className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Rs {totalOrderAmount.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={saving || !selectedSupplier || orderItems.length === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Order...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      Create Supplier Order
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProducts;
