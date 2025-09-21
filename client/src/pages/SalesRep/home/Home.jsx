import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaSearch, FaFilter, FaTh, FaList } from "react-icons/fa";

// API base URL
const API_BASE_URL = "http://localhost:3000/api";

const Home = () => {
  const navigate = useNavigate();
  
  // State management
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories from API
  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return [];
    }
    try {
      const response = await fetch(`${API_BASE_URL}/categories`,{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success && data.data?.categories) {
        return data.data.categories;
      }
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  // Fetch products for a specific category
  const fetchProductsByCategory = async (categoryId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return [];
    }
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`,{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success && data.data?.product) {
        // Convert the object-indexed products to array format
        const productsArray = Object.values(data.data.product).map(product => ({
          ...product,
          category_id: categoryId
        }));
        return productsArray;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      return [];
    }
  };

  // Transform API data to match component structure
  const transformCategoriesForDisplay = (categoriesData, productsData) => {
    return categoriesData.map(category => {
      // Get products for this category
      const categoryProducts = productsData.filter(product => 
        product.category_id === category.category_id
      );

      // Create variants array from products
      const variants = categoryProducts.map(product => ({
        id: product.product_id,
        name: product.name,
        price: parseFloat(product.selling_price || 0),
        weight: extractWeight(product.name),
        quantity: product.quantity || 0,
        product_code: product.product_id
      }));

      return {
        id: category.category_id,
        category: category.category_name,
        name: category.category_name,
        main_image: category.pic_url || getDefaultImage(category.category_name),
        variants: variants,
        description: category.description
      };
    });
  };

  // Helper function to extract weight from product name
  const extractWeight = (productName) => {
    const weightMatch = productName.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l)\b/i);
    return weightMatch ? `${weightMatch[1]}${weightMatch[2].toLowerCase()}` : "N/A";
  };

  // Helper function to get default image based on category
  const getDefaultImage = (categoryName) => {
    const imageMap = {
      'Black Pepper': 'https://images.unsplash.com/photo-1599909533096-d0417a0bbb5c?w=400&h=400&fit=crop',
      'Cardamom': 'https://images.unsplash.com/photo-1609501676725-7186f08b4e57?w=400&h=400&fit=crop',
      'Cinnamon': 'https://images.unsplash.com/photo-1588346828312-7dca30804b73?w=400&h=400&fit=crop',
      'Spices': 'https://images.unsplash.com/photo-1596040798370-7d01bd6461ae?w=400&h=400&fit=crop',
      'Herbs': 'https://images.unsplash.com/photo-1629127013135-e4f1c8b5f5e1?w=400&h=400&fit=crop',
      'Blends': 'https://images.unsplash.com/photo-1596040798370-7d01bd6461ae?w=400&h=400&fit=crop',
      'white pepper': 'https://images.unsplash.com/photo-1599909533096-d0417a0bbb5c?w=400&h=400&fit=crop'
    };
    return imageMap[categoryName] || 'https://images.unsplash.com/photo-1596040798370-7d01bd6461ae?w=400&h=400&fit=crop';
  };

  // Optimized filtering with useMemo
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    return products.filter((product) => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.variants?.some(variant => 
          variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          variant.product_code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Flat list of products (no grouping)
  const flatProducts = filteredProducts;

  // Get unique categories for filter dropdown
  const categoryNames = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // Optimized handlers with useCallback
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  }, []);

  const handleProductSelect = useCallback((product) => {
    // Pass the first variant's name as 'name' property for Product page compatibility
    const productWithName = {
      ...product,
      name: product.variants?.[0]?.name || product.category
    };
    console.log("product selected:", productWithName);
    navigate("/product", { state: productWithName });
  }, [navigate]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
  }, []);

  // Fetch data effect
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // First fetch all categories
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        
        if (categoriesData.length > 0) {
          // Then fetch products for each category
          const allProducts = [];
          
          for (const category of categoriesData) {
            const categoryProducts = await fetchProductsByCategory(category.category_id);
            allProducts.push(...categoryProducts);
          }
          
          // Transform data for display
          const transformedProducts = transformCategoriesForDisplay(categoriesData, allProducts);
          setProducts(transformedProducts);
          
          console.log("Loaded categories:", categoriesData);
          console.log("Loaded products:", transformedProducts);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 pt-8 sm:pt-12">
        {/* Header Section - Reduced Height */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-2 mb-2 sm:mb-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Discover Products
              </h1>
            </div>
            {/* View Toggle - Mobile Optimized */}
            <div className="flex items-center justify-center sm:justify-end">
              <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 sm:p-2 rounded-lg transition-all duration-200 touch-manipulation ${
                    viewMode === "grid" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" 
                      : "text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                  }`}
                >
                  <FaTh size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 sm:p-2 rounded-lg transition-all duration-200 touch-manipulation ${
                    viewMode === "list" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" 
                      : "text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                  }`}
                >
                  <FaList size={16} />
                </button>
              </div>
            </div>
          </div>
          {/* Search Bar and Filters */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products or categories..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-11 sm:pl-12 pr-4 py-2 sm:py-2 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {/* Category Filter */}
              {categoryNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
                      selectedCategory === "" 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Categories
                  </button>
                  {categoryNames.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-3 py-1 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
                        selectedCategory === category 
                          ? "bg-blue-500 text-white" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section - Mobile Optimized */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-slate-200"></div>
                <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium text-sm sm:text-base">Loading products...</p>
            </div>
          </div>
        ) : flatProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <FaSearch className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">No products found</h3>
            <p className="text-slate-600 mb-4 text-sm sm:text-base">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg active:shadow-md transition-all duration-200 touch-manipulation"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-12">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-3 sm:p-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                    {flatProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="group cursor-pointer bg-white rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl active:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-300 touch-manipulation"
                      >
                        <div className="aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
                          <img
                            src={product.main_image}
                            alt={product.category}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2 sm:p-4 text-center">
                          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                            {product.category}
                          </h3>
                          <span className="text-xs text-slate-500">
                            {product.variants?.length || 0} variants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {flatProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="group cursor-pointer bg-white rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4 hover:shadow-lg active:shadow-md transition-all duration-200 touch-manipulation"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 flex-shrink-0">
                            <img
                              src={product.main_image}
                              alt={product.category}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-1">
                              {product.category}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500">
                              {product.variants?.length || 0} variants available
                            </p>
                            {product.description && (
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs sm:text-sm font-medium text-blue-600">
                              View Details
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;