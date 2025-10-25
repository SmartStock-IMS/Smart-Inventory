import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, Trash2, List, Sparkles, Package, Scale, Eye, AlertCircle, CheckCircle, Filter, Grid3X3, TableProperties, Edit3 } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import api from "../../../lib/api";
import axios from "axios";
import { useTheme } from "../../../context/theme/ThemeContext";

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

const getProducts = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get('/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: {
        limit: 1000, // Request a high limit to get all products
        page: 1
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: error.message };
  }
};

const getAllProducts = async (page = 1, limit = 15) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get('/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: {
        page: page,
        limit: limit,
      }
    });

    const data = response.data.data || response.data;
    const products = data.products || [];
    const total = data.total || products.length;
    const hasMore = page * limit < total;
    
    return { 
      success: true, 
      data: products, 
      hasMore, 
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    return { success: false, error: error.message };
  }
};

const deleteProductsByCategory = async (categoryName) => {
  try {
    const token = localStorage.getItem("token");
    // First, get all products to find products in this category
    const productsResponse = await api.get('/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (productsResponse.data?.data?.products) {
      const productsInCategory = productsResponse.data.data.products.filter(
        product => product.category_name === categoryName
      );
      
      if (productsInCategory.length === 0) {
        return { success: false, error: `No products found in category "${categoryName}"` };
      }
      
      // Delete each product in the category
      const deletePromises = productsInCategory.map(product => 
        api.delete(`/products/${product.product_id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      );
      
      await Promise.all(deletePromises);
      
      return { 
        success: true, 
        message: `All ${productsInCategory.length} products in category "${categoryName}" deleted successfully`,
        deletedCount: productsInCategory.length
      };
    }
    
    return { success: false, error: "No products found" };
  } catch (error) {
    console.error('Error deleting products by category:', error);
    return { success: false, error: error.message };
  }
};

const toast = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`)
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const ProductList = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(0);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [dataSource, setDataSource] = useState('api'); // Track data source

useEffect(() => {
  // Function to fetch and process products from API
  const fetchAndProcessProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both products and categories
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        fetchCategories()
      ]);
      
      // Set categories data first
      let categoryData = [];
      if (categoriesResponse.success) {
        categoryData = categoriesResponse.data;
        setCategoriesData(categoryData);
        console.log('Categories data loaded:', categoryData);
      }
      
      // Helper function to get category image from database
      const getCategoryImage = (name) => {
        const category = categoryData.find(cat => cat.category_name === name);
        if (category?.pic_url) {
          console.log(`Found image for ${name}:`, category.pic_url);
          return category.pic_url;
        }
        
        console.log(`No image found for category: ${name}`);
        // Return null if no database image found (no hardcoded fallbacks)
        return null;
      };
      
      if (productsResponse.success && productsResponse.data?.data?.products) {
        const apiProducts = productsResponse.data.data.products;
        console.log('API Products Response:', apiProducts);
        
        // Group products by category
        const categoryGroups = {};
        apiProducts.forEach(product => {
          const categoryName = product.category_name;
          if (!categoryGroups[categoryName]) {
            categoryGroups[categoryName] = [];
          }
          categoryGroups[categoryName].push(product);
        });
        
        // Create one representative product per category
        const mappedCategories = Object.keys(categoryGroups).map(categoryName => {
          const products = categoryGroups[categoryName];
          const categoryImage = getCategoryImage(categoryName);
          
          return {
            id: `category_${categoryName}`,
            name: categoryName,
            main_image: categoryImage,
            no_variants: products.length,
            variants: [],
            description: `${categoryName} category with ${products.length} products`,
            category_name: categoryName,
            product_count: products.length,
            isApiData: true // Flag to identify API data
          };
        });
        
        console.log('Mapped categories from API:', mappedCategories);
        setAllProducts(mappedCategories);
        setDataSource('api');
        return true;
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
    } finally {
      setIsLoading(false); // ✅ important to hide loader
    }
  };
  
  fetchAndProcessProducts();
}, []);


  const fetchAndProcessProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both products and categories
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        fetchCategories()
      ]);
      
      // Set categories data first
      let categoryData = [];
      if (categoriesResponse.success) {
        categoryData = categoriesResponse.data;
        setCategoriesData(categoryData);
        console.log('Categories data loaded:', categoryData);
      }
      
      // Helper function to get category image from database
      const getCategoryImage = (name) => {
        const category = categoryData.find(cat => cat.category_name === name);
        if (category?.pic_url) {
          console.log(`Found image for ${name}:`, category.pic_url);
          return category.pic_url;
        }
        
        console.log(`No image found for category: ${name}`);
        // Return null if no database image found (no hardcoded fallbacks)
        return null;
      };
      
      if (productsResponse.success && productsResponse.data?.data?.products) {
        const apiProducts = productsResponse.data.data.products;
        console.log('API Products Response:', apiProducts);
        
        // Group products by category
        const categoryGroups = {};
        apiProducts.forEach(product => {
          const categoryName = product.category_name;
          if (!categoryGroups[categoryName]) {
            categoryGroups[categoryName] = [];
          }
          categoryGroups[categoryName].push(product);
        });
        
        // Create one representative product per category
        const mappedCategories = Object.keys(categoryGroups).map(categoryName => {
          const products = categoryGroups[categoryName];
          const categoryImage = getCategoryImage(categoryName);
          
          return {
            id: `category_${categoryName}`,
            name: categoryName,
            main_image: categoryImage,
            no_variants: products.length,
            variants: [],
            description: `${categoryName} category with ${products.length} products`,
            category_name: categoryName,
            product_count: products.length,
            isApiData: true // Flag to identify API data
          };
        });
        
        console.log('Mapped categories from API:', mappedCategories);
        setAllProducts(mappedCategories);
        setDataSource('api');
        return true;
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProduct = async (categoryName) => {
    // Prevent deletion if not using API data
    if (dataSource !== 'api') {
      toast.error("Cannot delete categories when using mock data. Please ensure API is connected.");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Attempting to delete category: ${categoryName}`);
      
      // Use the deleteProductsByCategory function
      const result = await deleteProductsByCategory(categoryName);
      
      if (result.success) {
        console.log(`Successfully deleted category "${categoryName}"`);
        toast.success(`${result.deletedCount} products deleted successfully`);
        
        // Refresh the products list after deletion
        await fetchAndProcessProducts();
        
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } else {
        console.log("Error deleting products:", result.error);
        toast.error("Error deleting products: " + result.error);
      }
    } catch (error) {
      console.error("Error removing products: ", error);
      toast.error("Error removing products: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = (allProducts || []).filter((item) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const openDeleteDialog = (product) => {
    if (dataSource !== 'api') {
      toast.error("Cannot delete categories when using mock data. Please ensure API is connected.");
      return;
    }
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleViewProduct = async (category) => {
    try {
      setIsLoading(true);
      
      // Fetch all products in this category
      const response = await getProducts();
      if (response.success && response.data?.data?.products) {
        const apiProducts = response.data.data.products;
        
        // Filter products by category
        const categoryProducts = apiProducts.filter(product => 
          product.category_name === category.category_name
        );
        
        console.log('Category products:', categoryProducts);
        
        // Navigate to detail view with all products in this category
        navigate(`/inventorymanager/product/${encodeURIComponent(category.category_name)}`, { 
          state: {
            categoryName: category.category_name,
            products: categoryProducts,
            categoryImage: category.main_image
          } 
        });
      } else {
        toast.error('Unable to fetch category products');
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
      toast.error('Error loading category details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('Refreshing data...');
    await fetchAndProcessProducts();
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product, index) => (
        <div key={index} className={`rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 hover:border-orange-500/50' 
            : 'bg-white border-gray-200 hover:border-orange-300'
        }`}>
          <div className="aspect-square overflow-hidden">
            {product.main_image ? (
              <img
                src={product.main_image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <Package className={`w-16 h-16 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                  isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                }`}>
                  {product.product_count || product.no_variants} products
                </div>
                {product.isApiData && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                    isDarkMode ? 'bg-green-600/20 text-green-300' : 'bg-green-100 text-green-800'
                  }`}>
                    Live
                  </div>
                )}
              </div>
            </div>
            
            <h3 className={`font-semibold mb-2 line-clamp-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>{product.name}</h3>
            <p className={`text-sm mb-4 line-clamp-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{product.description}</p>
            
            <div className={`flex items-center justify-between text-sm mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center gap-1">
                <Scale className="w-4 h-4" />
                <span>{product.product_count || product.no_variants} products</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                Category
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewProduct(product)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => openDeleteDialog(product)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-red-400 border border-red-500/50 hover:bg-red-600/20' 
                    : 'text-red-600 border border-red-200 hover:bg-red-50'
                }`}
                disabled={!product.isApiData}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`border-b transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-gray-700' 
              : 'bg-gradient-to-r from-orange-50 to-red-50 border-gray-200'
          }`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Category
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Products Count
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Status
              </th>
              <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y transition-colors duration-300 ${
            isDarkMode 
              ? 'divide-gray-700' 
              : 'divide-gray-200'
          }`}>
            {filteredProducts.map((product, index) => (
              <tr key={index} className={`transition-colors duration-300 ${
                isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl overflow-hidden shadow-sm border transition-colors duration-300 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-100'
                    }`}>
                      {product.main_image ? (
                        <img
                          src={product.main_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <Package className={`w-4 h-4 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-400'
                          }`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className={`font-medium hover:underline text-left transition-colors duration-300 ${
                          isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        {product.name}
                      </button>
                      <p className={`text-sm mt-1 line-clamp-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Scale className={`w-4 h-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{product.product_count || product.no_variants}</span>
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>products</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {product.isApiData ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
                      isDarkMode ? 'bg-green-600/20 text-green-300' : 'bg-green-100 text-green-800'
                    }`}>
                      Live Data
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
                      isDarkMode ? 'bg-yellow-600/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Mock Data
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white'
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => openDeleteDialog(product)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode 
                          ? 'text-red-400 border border-red-500/50 hover:bg-red-600/20' 
                          : 'text-red-600 border border-red-200 hover:bg-red-50'
                      }`}
                      disabled={isLoading || !product.isApiData}
                      title={!product.isApiData ? "Cannot delete mock data" : "Delete category"}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`h-full w-full rounded-3xl border shadow-xl overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-700' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50 border-gray-200'
    }`}>
      {/* Header Section */}
      <div className={`text-white p-5 relative overflow-hidden transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
          : 'bg-gradient-to-r from-blue-500 to-blue-400'
      }`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <List className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Product Categories</h2>
                <p className="text-white/80">Manage your product categories and inventory</p>
                {dataSource !== 'api' && (
                  <p className="text-yellow-200 text-sm mt-1">⚠️ Using mock data - API connection needed for full functionality</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search categories by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-3 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors duration-200 disabled:opacity-50"
                  title="Refresh Data"
                >
                  {isLoading ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-200",
                    viewMode === 'table' 
                      ? "bg-white/30 text-white" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <TableProperties className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-200",
                    viewMode === 'grid' 
                      ? "bg-white/30 text-white" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-170px)] p-5 overflow-y-auto">
        {filteredProducts.length > 0 ? (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`rounded-xl p-4 border shadow-sm transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                    isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
                  }`}>
                    <Package className={`w-5 h-5 transition-colors duration-300 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{filteredProducts.length}</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Categories</p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-4 border shadow-sm transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                    isDarkMode ? 'bg-green-600/20' : 'bg-green-100'
                  }`}>
                    <CheckCircle className={`w-5 h-5 transition-colors duration-300 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {filteredProducts.reduce((total, category) => total + (category.product_count || category.no_variants), 0)}
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Products</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border shadow-sm transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                    dataSource === 'api' 
                      ? (isDarkMode ? 'bg-green-600/20' : 'bg-green-100')
                      : (isDarkMode ? 'bg-yellow-600/20' : 'bg-yellow-100')
                  }`}>
                    <AlertCircle className={`w-5 h-5 transition-colors duration-300 ${
                      dataSource === 'api' 
                        ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                        : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')
                    }`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{dataSource === 'api' ? 'Live' : 'Mock'}</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Data Source</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Display */}
            {viewMode === 'table' ? <TableView /> : <GridView />}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-orange-600 to-red-600' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}>
                  <FaSpinner className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className={`font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Loading categories...</p>
              </div>
            ) : (
              <div className="text-center">
                <Package className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <p className={`font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>No categories found</p>
                <p className={`text-sm mt-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Try adjusting your search criteria or refresh the data</p>
                <button
                  onClick={handleRefresh}
                  className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`text-white p-6 rounded-t-2xl transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-red-600 to-red-700' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Confirm Category Deletion</h3>
                  <p className="text-white/80 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl overflow-hidden shadow-sm border transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-100'
                }`}>
                  {productToDelete.main_image ? (
                    <img
                      src={productToDelete.main_image}
                      alt={productToDelete.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <Package className={`w-4 h-4 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{productToDelete.name}</h4>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Products: {productToDelete.product_count || productToDelete.no_variants} items</p>
                </div>
              </div>
              
              <p className={`mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Are you sure you want to delete this category? This will permanently remove all products in this category from your inventory.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleRemoveProduct(productToDelete.name)}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white' 
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Category
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setProductToDelete(null);
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border border-gray-600 hover:bg-gray-700 text-gray-300' 
                      : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;