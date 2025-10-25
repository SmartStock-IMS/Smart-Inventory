import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { Search, Minus, Plus, Layers, Sparkles, Package, ShoppingCart, Filter, Grid, Eye, X, CheckCircle, AlertCircle, Scale, Truck } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../../context/theme/ThemeContext";

// Backend API: fetch products via API Gateway
const fetchAllProducts = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: { page: 1, limit: 500 }
    });
    const data = res.data?.data?.products || [];
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: error.message };
  }
};

// Fetch categories to get Cloudinary images
const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, data: [] };

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;
    if (result.success && result.data) {
      const categories = result.data.categories || [];
      return { success: true, data: categories };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, data: [] };
  }
};

// Mock toast function
const toast = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`)
};

// Mock BulkList component
const BulkList = ({ bulkList, isProcessed, setBulk }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`h-full ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-green-50 to-emerald-50'} rounded-2xl p-6 transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-600' : 'bg-green-500'} rounded-xl flex items-center justify-center transition-colors duration-300`}>
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>Bulk Order Summary</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Review and confirm your bulk order</p>
          </div>
        </div>
        <button
          onClick={() => isProcessed(false)}
          className={`px-6 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg transition-colors duration-200`}
        >
          Back to Products
        </button>
      </div>
      
      <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} rounded-xl shadow-sm border overflow-hidden transition-colors duration-300`}>
        <div className={`${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'} px-6 py-4 border-b transition-colors duration-300`}>
          <h4 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>Items in Bulk Order ({bulkList.length})</h4>
        </div>
        <div className="p-6">
          {bulkList.length > 0 ? (
            <div className="space-y-4">
              {bulkList.map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'} rounded-lg transition-colors duration-300`}>
                  <div className="flex items-center gap-4">
                    <Scale className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} transition-colors duration-300`} />
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>{item.item_code}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBulk(prev => prev.filter((_, i) => i !== index))}
                    className={`p-2 text-red-500 ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} rounded-lg transition-colors duration-300`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
              <Package className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
              <p>No items in bulk order</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const AddBulk = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [productBulk, setProductBulk] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedItemCode, setSelectedItemCode] = useState("");
  const [isProcessed, setIsProcessed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Helper function to get category image from database
  const getCategoryImage = (categoryName) => {
    const category = categoriesData.find(cat => cat.category_name === categoryName);
    return category?.pic_url || null;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Fetch both products and categories
        const [productsRes, categoriesRes] = await Promise.all([
          fetchAllProducts(),
          fetchCategories()
        ]);
        
        if (productsRes.success) {
          setProducts(productsRes.data);
        } else {
          console.error("Error fetching products: ", productsRes.message);
        }
        
        if (categoriesRes.success) {
          setCategoriesData(categoriesRes.data);
        } else {
          console.error("Error fetching categories: ", categoriesRes.message);
        }
      } catch (error) {
        console.error("Error getting products and categories.", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const filteredRows = filterProducts(products || [], searchQuery);
    const filteredCategoriesMap = (filteredRows || []).reduce((acc, p) => {
      const key = p.category_name || 'Uncategorized';
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});

    const filterCategories = Object.entries(filteredCategoriesMap).map(
      ([name, rows]) => ({
        name,
        products: rows.map(p => ({
          id: p.product_id,
          name: p.name,
          category: name,
          main_image: getCategoryImage(name), // Use database image
          variants: [
            { product_id: p.product_id, product_code: p.product_id, weight: p.name, quantity: p.current_stock }
          ],
          _raw: p
        }))
      })
    );

    const filteredCategories = selectedCategory
      ? filterCategories.filter(
        (category) => category.name === selectedCategory.value
      )
      : filterCategories;

    setFilteredCategories(filteredCategories);
  }, [products, searchQuery, selectedCategory, categoriesData]);

  // Build categories from backend products (each product is a variant row)
  const categoriesMap = (products || []).reduce((acc, p) => {
    const key = p.category_name || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    // Normalize to UI shape
    acc[key].push({
      id: p.product_id,
      name: p.name,
      category: key,
      main_image: getCategoryImage(key), // Use database image
      variants: [
        { product_id: p.product_id, product_code: p.product_id, weight: p.name, quantity: p.current_stock }
      ],
      _raw: p
    });
    return acc;
  }, {});

  const categories = Object.entries(categoriesMap).map(([name, products]) => ({
    name,
    products,
  }));

  const filterProducts = (rows, keyword) => {
    if (!rows || !Array.isArray(rows)) return [];
    if (!keyword) return rows;
    const q = keyword.toLowerCase();
    return rows.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category_name || '').toLowerCase().includes(q) ||
      (p.product_id || '').toLowerCase().includes(q)
    );
  };

  const handleCategoryChange = (selectedOption) => {
    if (selectedOption.value === "") {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(selectedOption);
    }
  };

  const handleAddBulk = (itemCode, quantity) => {
    setProductBulk((prev) => {
      const updatedBulk = Array.isArray(prev) ? [...prev] : [];
      return [...updatedBulk, { item_code: itemCode, quantity }];
    });

    setQuantity(1);
    setSelectedItemCode("");
    setDialogOpen(false);
    toast.success("Added to bulk order!");
  };

  const handleSelectWeight = (code) => {
    setSelectedItemCode(code);
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleDialogClose = () => {
    setSelectedItemCode("");
    setQuantity(1);
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleBulkAddFunction = async () => {
    // Navigate to BulkList page with the bulk data
    navigate("/inventorymanager/bulklist", { 
      state: { bulkList: productBulk } 
    });
  };

  const openCategoryDialog = (categoryName) => {
    const rows = categoriesMap[categoryName] || [];
    const variants = rows.map(r => ({
      product_id: r.id,
      product_code: r.id,
      weight: r.name,
      quantity: r.variants?.[0]?.quantity ?? r._raw?.current_stock ?? 0
    }));
    setSelectedProduct({
      name: categoryName,
      main_image: getCategoryImage(categoryName), // Use database image
      variants
    });
    setSelectedItemCode(variants?.[0]?.product_code || "");
    setQuantity(1);
    setDialogOpen(true);
  };

  const getWeightBadgeColor = (weight) => {
    if (weight.includes('25g') || weight.includes('50g')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (weight.includes('100g')) return 'bg-green-100 text-green-800 border-green-200';
    if (weight.includes('250g')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (weight.includes('500g')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (weight.includes('1kg')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'} rounded-3xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-xl overflow-hidden transition-colors duration-300`}>
      {/* Header Section */}
      <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-500 to-blue-400'} text-white p-5 relative overflow-hidden transition-colors duration-300`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Spices Bulk Management</h2>
                <p className="text-white/80">Add products to bulk inventory update</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <button
                className={cn(
                  "px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2",
                  productBulk.length > 0
                    ? "bg-white text-orange-600 hover:bg-gray-100 hover:shadow-xl"
                    : "bg-white/20 text-white/50 cursor-not-allowed"
                )}
                onClick={handleBulkAddFunction}
                disabled={productBulk.length === 0}
              >
                <Truck className="w-4 h-4" />
                Process Bulk ({productBulk.length})
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search spices, blends, or product codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
              <div className="w-64 relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <select
                  value={selectedCategory?.value || ""}
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value
                        ? { value: e.target.value, label: e.target.value }
                        : { value: "", label: "All Categories" },
                    )
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                >
                  <option value="" className="text-gray-800">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.name} value={category.name} className="text-gray-800">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100%-170px)] p-5 overflow-y-auto">
        {isProcessed ? (
          <BulkList bulkList={productBulk} isProcessed={setIsProcessed} setBulk={setProductBulk} />
        ) : (
          <div className="h-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-16 h-16 ${isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-500' : 'bg-gradient-to-r from-orange-500 to-red-500'} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse transition-colors duration-300`}>
                    <FaSpinner className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium transition-colors duration-300`}>Loading spices inventory...</p>
                </div>
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {(filteredCategories || []).map(({ name }) => (
                <div key={name} className="group">
                  <button
                    onClick={() => openCategoryDialog(name)}
                    className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-orange-500 hover:bg-gray-700' : 'bg-white border-gray-200 hover:border-orange-300'} rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:scale-105`}
                  >
                    <div className="aspect-square overflow-hidden">
                      {getCategoryImage(name) ? (
                        <img
                          src={getCategoryImage(name)}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center transition-colors duration-300`}>
                          <Package className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-sm mb-2 line-clamp-2 transition-colors duration-300`}>
                        {name}
                      </h4>
                      <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                        <span>{(categoriesMap[name]?.length) || 0} items</span>
                        <Scale className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium transition-colors duration-300`}>No products available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Dialog */}
      {dialogOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden transition-colors duration-300`}>
            <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} text-white p-6 transition-colors duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Add to Bulk Order</h3>
                  <p className="text-white/80">{selectedProduct.name}</p>
                </div>
                <button
                  onClick={handleDialogClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-center mb-6">
                <div className={`w-48 h-48 rounded-xl overflow-hidden shadow-lg border-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} transition-colors duration-300`}>
                  <img
                    src={selectedProduct.main_image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 transition-colors duration-300`}>
                    Selected Size: {selectedItemCode || "Please select a size"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProduct.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectWeight(variant.product_code)}
                        className={cn(
                          "p-4 border-2 rounded-xl transition-all duration-200 text-left",
                          selectedItemCode === variant.product_code
                            ? `border-orange-500 ${isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'} ring-2 ring-orange-200`
                            : `${isDarkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getWeightBadgeColor(variant.weight)}`}>
                              {variant.weight}
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>{variant.product_code}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>{variant.quantity}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>in stock</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 transition-colors duration-300`}>
                    Quantity to Add
                  </label>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleDecrement}
                      className={`p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'} rounded-l-xl transition-colors duration-300`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className={`w-24 py-3 text-center border-y ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-800 focus:ring-orange-500'} focus:outline-none focus:ring-2 transition-colors duration-300`}
                    />
                    <button
                      onClick={handleIncrement}
                      className={`p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'} rounded-r-xl transition-colors duration-300`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => handleAddBulk(selectedItemCode, quantity)}
                    disabled={!selectedItemCode}
                    className={cn(
                      "flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                      selectedItemCode
                        ? `${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'} text-white shadow-lg hover:shadow-xl`
                        : `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                    )}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Bulk
                  </button>
                  <button
                    onClick={handleDialogClose}
                    className={`px-6 py-3 border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} rounded-xl transition-colors duration-300`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBulk;