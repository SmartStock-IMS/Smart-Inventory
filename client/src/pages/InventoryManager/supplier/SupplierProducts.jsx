import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Package,
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
import api from "../../../lib/api";

const SupplierProducts = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { supplierId } = useParams();

  // State management
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productSuppliers, setProductSuppliers] = useState({}); // Track product-supplier assignments
  const [restockAmounts, setRestockAmounts] = useState({}); // Track restock amounts for each product/variant
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

      // Fetch data in parallel using the api instance like other components
      const [productsRes, suppliersRes, categoriesRes, assignmentsRes] = await Promise.all([
        api.get('/products', { params: { limit: 1000, page: 1 } }),
        api.get('/suppliers'),
        api.get('/categories'),
        api.get('/suppliers/product-assignments').catch(() => ({ data: { data: [] } }))
      ]);

      const fetchedProducts = productsRes.data?.data?.products || [];
      
      setProducts(fetchedProducts);
      // Treat products as variants - each product is essentially a variant
      setVariants(fetchedProducts);
      setSuppliers(suppliersRes.data?.data || []);
      setCategories(categoriesRes.data?.data?.categories || []); 

      // Initialize product-supplier assignments from backend
      const assignments = assignmentsRes.data?.data || [];
      const initialAssignments = {};
      const initialRestockAmounts = {};
      
      assignments.forEach(assignment => {
        initialAssignments[assignment.product_id] = assignment.supplier_id;
      });
      
      // Initialize restock amounts for all products (following Product page pattern)
      fetchedProducts.forEach(product => {
        initialRestockAmounts[`product_${product.product_id}`] = 0;
      });

      setProductSuppliers(initialAssignments);
      setRestockAmounts(initialRestockAmounts);
      setCurrentAssignments(assignments);

    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentAssignments = async () => {
    try {
      setIsLoadingAssignments(true);
      const response = await api.get('/suppliers/product-assignments');
      const assignments = response.data?.data || [];
      setCurrentAssignments(assignments);
    } catch (error) {
      console.error('Error fetching current assignments:', error);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  // Filter products based on search and category (products ARE variants)
  const getFilteredItems = () => {
    const filteredProducts = products.filter(product => {
      const lowerSearch = (searchTerm || "").toLowerCase();
      const matchesSearch = !lowerSearch || (
        (product.product_name || "").toLowerCase().includes(lowerSearch) ||
        (product.product_code || "").toLowerCase().includes(lowerSearch)
      );

      // Normalize both sides to string to avoid number/string mismatches coming from DB
      const prodCatId = product.category_id !== undefined && product.category_id !== null ? String(product.category_id) : "";
      const selCat = categoryFilter !== undefined && categoryFilter !== null ? String(categoryFilter) : "";

      // Match either by category id (preferred) or by category name as a fallback
      const matchesCategory = !selCat || prodCatId === selCat || (product.category_name && String(product.category_name) === selCat) || (product.category_name && product.category_name.toLowerCase() === selCat.toLowerCase());

      return matchesSearch && matchesCategory;
    });
    
    // Transform products to match the variant display format used in Product page
    return filteredProducts.map(product => ({
      ...product,
      type: 'product', // Keep for backward compatibility
      id: product.product_id,
      name: product.product_name || product.name,
      code: product.product_code || product.code,
      stock: product.quantity || product.current_stock || 0,
      category_id: product.category_id,
      // Add fields expected by variant display logic
      product_id: product.product_id,
      product_name: product.product_name || product.name,
      product_code: product.product_code || product.code,
      selling_price: product.selling_price || 0,
      cost_price: product.cost_price || 0,
      current_stock: product.quantity || product.current_stock || 0,
      min_stock_level: product.min_stock_level || 0,
      max_stock_level: product.max_stock_level || null,
      reorder_point: product.reorder_point || 0,
      shelf_life: product.shelf_life || null,
      category_name: product.category_name,
      // Ensure quantity field is available for both old and new field names
      quantity: product.quantity || product.current_stock || 0
    }));
  };

  const filteredItems = getFilteredItems();

  // Update restock amount for product or variant
  const updateRestockAmount = useCallback((itemId, itemType, amount) => {
    const key = `${itemType}_${itemId}`;
    setRestockAmounts(prev => ({
      ...prev,
      [key]: parseFloat(amount) || 0
    }));
  }, []);

  // Assign supplier to product
  const assignSupplierToProduct = useCallback((productId, supplierId) => {
    setProductSuppliers(prev => ({
      ...prev,
      [productId]: supplierId
    }));
  }, []);

  // Remove supplier assignment from product
  const removeSupplierFromProduct = useCallback((productId) => {
    setProductSuppliers(prev => ({
      ...prev,
      [productId]: ""
    }));
  }, []);

  // Save all supplier assignments and restock orders
  const handleSaveAssignments = async () => {
    try {
      setSaving(true);
      
      // Prepare assignments data with restock amounts
      const assignments = Object.entries(productSuppliers)
        .filter(([productId, supplierId]) => supplierId !== "")
        .map(([productId, supplierId]) => {
          const restockKey = `product_${productId}`;
          const restockAmount = restockAmounts[restockKey] || 0;
          return {
            product_id: productId,
            supplier_id: supplierId,
            restock_amount: restockAmount > 0 ? restockAmount : 1 // Default to 1 if no restock amount
          };
        });

      // Prepare restock orders data (simplified to match Product page pattern)
      const restockOrders = Object.entries(restockAmounts)
        .filter(([key, amount]) => amount > 0)
        .map(([key, amount]) => {
          const productId = key.replace('product_', ''); // Extract product_id from key
          return {
            product_id: productId,
            restock_amount: amount
          };
        });

      // Save assignments and restock orders
      const requests = [];
      
      if (assignments.length > 0) {
        requests.push(
          api.post('/suppliers/product-assignments', { assignments })
        );
      }

      if (restockOrders.length > 0) {
        requests.push(
          api.post('/restock-orders', { restock_orders: restockOrders })
        );
      }

      if (requests.length > 0) {
        await Promise.all(requests);
        setSuccess(`Successfully saved ${assignments.length} supplier assignments and ${restockOrders.length} restock orders!`);
        
        // Refresh current assignments after saving
        await fetchCurrentAssignments();
      } else {
        setError("No changes to save. Please assign suppliers or set restock amounts.");
        return;
      }

      // Reset restock amounts after successful save
      const resetAmounts = {};
      Object.keys(restockAmounts).forEach(key => {
        resetAmounts[key] = 0;
      });
      setRestockAmounts(resetAmounts);

      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to save assignments and restock orders");
      console.error("Error saving:", err);
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
            <h1 className="text-3xl font-bold mb-2">Product-Supplier Assignment</h1>
            <p className="text-white/80">Assign suppliers to products for inventory restocking management</p>
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

        {/* Summary & Statistics - Moved to top */}
        <div className={`rounded-2xl border shadow-sm p-6 mb-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
          <div className="space-y-4">
            <h4 className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Summary & Statistics
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {Object.values(productSuppliers).filter(Boolean).length}
                </div>
                <div className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Assigned Products
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {products.length - Object.values(productSuppliers).filter(Boolean).length}
                </div>
                <div className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Unassigned Products
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {Object.values(restockAmounts).filter(amount => amount > 0).length}
                </div>
                <div className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Restock Orders
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {Object.values(restockAmounts).reduce((sum, amount) => sum + amount, 0)}
                </div>
                <div className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Restock Qty
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveAssignments}
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Assignments & Restock Orders
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Products Assignment Panel - Full Width */}
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
                  <Package className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Product Assignment
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products & Variants Grid */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-gray-200'}`}>
                <h3 className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Product Variants ({filteredItems.length})
                  {categoryFilter && (
                    <span className={`ml-2 text-sm font-normal transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      - {categories.find(c => c.category_id === categoryFilter)?.category_name || 'Category'}
                    </span>
                  )}
                </h3>
              </div>

              <div className="p-6">
                {filteredItems.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredItems.map(item => {
                      // Use product_id directly (following Product page pattern)
                      const assignedSupplier = productSuppliers[item.product_id];
                      const supplierName = assignedSupplier ? 
                        suppliers.find(s => s.supplier_id === assignedSupplier)?.name || "Unknown Supplier" : 
                        "No Supplier Assigned";
                      
                      const restockKey = `product_${item.product_id}`;
                      const restockAmount = restockAmounts[restockKey] || 0;

                      return (
                        <div
                          key={`product_${item.product_id}`}
                          className={`border rounded-lg p-4 transition-all duration-200 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                        >
                          {/* Header with product info */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                  {item.name || item.product_name}
                                </h4>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Product Variant
                                </span>
                                {/* Weight Badge */}
                                {item.name?.match(/\d+g/) && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                    item.name?.includes("100g") ? "bg-blue-100 text-blue-800 border-blue-200" :
                                    item.name?.includes("250g") ? "bg-green-100 text-green-800 border-green-200" :
                                    item.name?.includes("500g") ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    item.name?.includes("1kg") ? "bg-red-100 text-red-800 border-red-200" :
                                    "bg-gray-100 text-gray-800 border-gray-200"
                                  }`}>
                                    {item.name?.match(/\d+g/)?.[0]}
                                  </span>
                                )}
                              </div>
                              
                              <div className="mt-1 space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="font-medium">Code:</span> {item.code || item.product_code || 'N/A'}
                                  </p>
                                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="font-medium">Price:</span> Rs. {item.selling_price || 0}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="font-medium">Min Stock:</span> {item.min_stock_level || 0}
                                  </p>
                                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="font-medium">Reorder Point:</span> {item.reorder_point || 0}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <p className={`text-sm font-medium transition-colors duration-300 ${
                                    item.current_stock <= (item.min_stock_level || 10) ? 'text-red-600' : 
                                    item.current_stock <= (item.min_stock_level || 10) * 2 ? 'text-orange-600' : 'text-green-600'
                                  }`}>
                                    Current Stock: {item.current_stock || item.quantity || 0}
                                  </p>
                                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                                    item.current_stock <= (item.min_stock_level || 10) ? 'bg-red-100 text-red-800' : 
                                    item.current_stock <= (item.min_stock_level || 10) * 2 ? 'bg-orange-100 text-orange-800' : 
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {item.current_stock <= (item.min_stock_level || 10) ? 'Low Stock' : 
                                     item.current_stock <= (item.min_stock_level || 10) * 2 ? 'Medium Stock' : 'In Stock'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              assignedSupplier 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {assignedSupplier ? "Assigned" : "Unassigned"}
                            </div>
                          </div>

                          {/* Supplier assignment and restock amount */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {/* Supplier Assignment */}
                            <div className="lg:col-span-2">
                              <label className={`block text-xs font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Assigned Supplier
                              </label>
                              <div className="flex items-center gap-2">
                                <select
                                  value={assignedSupplier || ""}
                                  onChange={(e) => assignSupplierToProduct(item.product_id, e.target.value)}
                                  className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'}`}
                                >
                                  <option value="">Select Supplier...</option>
                                  {suppliers.map(supplier => (
                                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                      {supplier.name}
                                    </option>
                                  ))}
                                </select>
                                {assignedSupplier && (
                                  <button
                                    onClick={() => removeSupplierFromProduct(item.product_id)}
                                    className="px-3 py-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Restock Amount */}
                            <div>
                              <label className={`block text-xs font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Restock Amount
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  value={restockAmount}
                                  onChange={(e) => updateRestockAmount(item.product_id, 'product', e.target.value)}
                                  placeholder="0"
                                  className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'}`}
                                />
                                {restockAmount > 0 && (
                                  <div className={`mt-1 text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    New Stock: {(item.current_stock || 0) + restockAmount}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`mt-2 text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Current Supplier: {supplierName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      No product variants found
                    </p>
                    {categoryFilter && (
                      <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Try selecting a different category or adjusting your search
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Assignments Section */}
        <div className="mt-8">
          <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-800' : 'bg-green-100'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Current Assignments
                </h2>
              </div>
              <button
                onClick={fetchCurrentAssignments}
                disabled={isLoadingAssignments}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAssignments ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {isLoadingAssignments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : currentAssignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <thead>
                    <tr className={`border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Product ID
                      </th>
                      <th className={`text-left py-3 px-4 font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Supplier
                      </th>
                      <th className={`text-left py-3 px-4 font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Assigned Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssignments.map((assignment, index) => (
                      <tr 
                        key={assignment.id || index}
                        className={`border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td className={`py-3 px-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {assignment.product_id}
                        </td>
                        <td className={`py-3 px-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {assignment.supplier_name || 'Unknown Supplier'}
                        </td>
                        <td className={`py-3 px-4 text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No supplier assignments found
                </p>
                <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Start by assigning suppliers to products above
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProducts;
