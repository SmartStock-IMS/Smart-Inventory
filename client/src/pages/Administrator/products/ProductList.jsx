import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, Trash2, List, Sparkles, Package, Scale, Eye, AlertCircle, CheckCircle, Filter, Grid3X3, TableProperties } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import { getCategoryImage } from "../../../assets/product/categoryImages";


const getProducts = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
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
    const productsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (productsResponse.data?.data?.products) {
      const productsInCategory = productsResponse.data.data.products.filter(
        product => product.category_name === categoryName
      );
      
      // Delete each product in the category
      const deletePromises = productsInCategory.map(product => 
        axios.delete(`${import.meta.env.VITE_API_URL}/products/${product.product_id}`, {
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
    
    return { success: false, error: "No products found in category" };
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
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(0);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
  (async () => {
    try {
      const response = await getProducts();
      const apiProducts = response.data.data.products || [];
      // Find least stocked product per category
      const leastStockedByCategory = {};
      for (const product of apiProducts) {
        const cat = product.category_name;
        if (
          !leastStockedByCategory[cat] ||
          product.current_stock < leastStockedByCategory[cat].current_stock
        ) {
          leastStockedByCategory[cat] = product;
        }
      }
      // Count products per category
      const categoryCounts = apiProducts.reduce((acc, item) => {
        const key = item?.category_name || "";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Removed local categoryImage, now using getCategoryImage

      // Use only the least stocked product per category for display
      if (response.success && response.data && response.data.data && Array.isArray(response.data.data.products)) {
        const mapped = Object.values(leastStockedByCategory).map(product => ({
          id: product.product_id,
          name: product.category_name,
          main_image: getCategoryImage(product.category_name),
          no_variants: categoryCounts[product.category_name] || 1,
          variants: [],
          description: `${product.category_name} | Cost: ₹${product.cost_price} | Sell: ₹${product.selling_price}`,
          //stock_quantity: product.current_stock,
          current_stock: product.current_stock,
          min_stock_level: product.min_stock_level,
          max_stock_level: product.max_stock_level,
          
        }));
        setAllProducts(mapped);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
    }
  })();

}, []);

  const handleRemoveProduct = async (categoryName) => {
  try {
    setIsLoading(true);
    // Use the new deleteProductsByCategory function
    const result = await deleteProductsByCategory(categoryName);
    if (result.success) {
      console.log(`All products in category "${categoryName}" deleted successfully`);
      toast.success(`${result.deletedCount} products deleted successfully`);
      
      // Refresh the products list after deletion
      const response = await getProducts();
      const apiProducts = response.data.data.products || [];
      
      // Rebuild the category-based product list
      const leastStockedByCategory = {};
      for (const product of apiProducts) {
        const cat = product.category_name;
        if (
          !leastStockedByCategory[cat] ||
          product.current_stock < leastStockedByCategory[cat].current_stock
        ) {
          leastStockedByCategory[cat] = product;
        }
      }
      
      const categoryCounts = apiProducts.reduce((acc, item) => {
        const key = item?.category_name || "";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      
      const mapped = Object.values(leastStockedByCategory).map(product => ({
        id: product.product_id,
        name: product.category_name,
        main_image: `https://loremflickr.com/400/400/${product.category_name}`,
        no_variants: categoryCounts[product.category_name] || 1,
        variants: [],
        description: `${product.category_name} | Cost: ₹${product.cost_price} | Sell: ₹${product.selling_price}`,
        current_stock: product.current_stock,
        min_stock_level: product.min_stock_level,
        max_stock_level: product.max_stock_level,
      }));
      
      setAllProducts(mapped);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } else {
      console.log("Error deleting products");
      toast.error("Error deleting products: " + result.error);
    }
  } catch (error) {
    console.error("Error removing products: ", error);
    toast.error("Error removing products");
  } finally {
    setIsLoading(false);
  }
};

  const filteredProducts = (allProducts || []).filter((item) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.variants || []).some((variant) =>
        variant.product_code.toLowerCase().includes(query)
      )
    );
  });

  const getStockStatusColor = (current_stock, min_stock_level, max_stock_level) => {
    if (current_stock > max_stock_level) return 'bg-green-100 text-green-800';
    if (current_stock < min_stock_level) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStockStatus = (current_stock, min_stock_level, max_stock_level) => {
    if (current_stock > max_stock_level) return 'High Stock';
    if (current_stock < min_stock_level) return 'Low Stock';
    return 'Medium Stock';
  };
 
  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleViewProduct = (product) => {
    // Navigate to product detail page with product data
    navigate(`/administrator/product/${product.id}`, { state: {...product} });
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product, index) => (
        <div key={index} className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.main_image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.current_stock, product.min_stock_level, product.max_stock_level)}`}>
                {product.current_stock}
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Scale className="w-4 h-4" />
                <span>{product.no_variants} sizes</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStockStatusColor(product.current_stock, product.min_stock_level, product.max_stock_level)}`}>
                {getStockStatus(product.current_stock, product.min_stock_level, product.max_stock_level)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewProduct(product)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => openDeleteDialog(product)}
                className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors duration-200"
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variants
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <img
                        src={product.main_image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left"
                      >
                        {product.name}
                      </button>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                    Live Data
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{product.no_variants}</span>
                    <span className="text-sm text-gray-500">sizes</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
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
    <div className="h-full w-full bg-gradient-to-br from-orange-50 via-white to-yellow-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <List className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Spices Inventory</h2>
                <p className="text-white/80">Manage your spice products and stock levels</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search spices by name or product code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
              
              <div className="flex items-center gap-2">
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
      <div className="h-[calc(100%-200px)] p-6 overflow-y-auto">
        {filteredProducts.length > 0 ? (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{filteredProducts.length}</p>
                    <p className="text-sm text-gray-600">Total Categories</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {filteredProducts.filter(p => p.current_stock > p.min_stock_level).length}
                    </p>
                    <p className="text-sm text-gray-600">High Stock</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {filteredProducts.filter(p => p.current_stock >= p.min_stock_level && p.current_stock <= p.max_stock_level).length}
                    </p>
                    <p className="text-sm text-gray-600">Medium Stock</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {filteredProducts.filter(p => p.current_stock < p.min_stock_level).length}
                    </p>
                    <p className="text-sm text-gray-600">Low Stock</p>
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
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FaSpinner className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Loading spices inventory...</p>
              </div>
            ) : (
              <div className="text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">No spices found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
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
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img
                    src={productToDelete.main_image}
                    alt={productToDelete.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{productToDelete.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Stock: {productToDelete.current_stock} units</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this spice product? This will permanently remove it from your inventory.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleRemoveProduct(productToDelete.name)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete All Variants
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setProductToDelete(null);
                  }}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-colors duration-200"
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