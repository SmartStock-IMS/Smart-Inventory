import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// import { getProducts } from "@services/product-services";
import { FaSpinner, FaSearch, FaFilter, FaTh, FaList } from "react-icons/fa";

// Hardcoded sample data for development
const SAMPLE_PRODUCTS = [
  {
    id: 11,
    name: "Red Chili Powder",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1596040798370-7d01bd6461ae?w=400&h=400&fit=crop",
    variants: [
      { id: 20, product_code: "SPC-RCP-100G", price: 150, weight: "100g", quantity: 45 },
      { id: 21, product_code: "SPC-RCP-250G", price: 350, weight: "250g", quantity: 32 },
      { id: 22, product_code: "SPC-RCP-500G", price: 650, weight: "500g", quantity: 18 }
    ]
  },
  {
    id: 12,
    name: "Turmeric Powder",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop",
    variants: [
      { id: 23, product_code: "SPC-TUR-100G", price: 180, weight: "100g", quantity: 52 },
      { id: 24, product_code: "SPC-TUR-250G", price: 420, weight: "250g", quantity: 28 },
      { id: 25, product_code: "SPC-TUR-500G", price: 800, weight: "500g", quantity: 15 }
    ]
  },
  {
    id: 13,
    name: "Cumin Seeds",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop",
    variants: [
      { id: 26, product_code: "SPC-CUM-100G", price: 250, weight: "100g", quantity: 38 },
      { id: 27, product_code: "SPC-CUM-250G", price: 580, weight: "250g", quantity: 22 },
      { id: 28, product_code: "SPC-CUM-500G", price: 1100, weight: "500g", quantity: 12 }
    ]
  },
  {
    id: 14,
    name: "Coriander Seeds",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1596040801058-eca845fd5d8d?w=400&h=400&fit=crop",
    variants: [
      { id: 29, product_code: "SPC-COR-100G", price: 120, weight: "100g", quantity: 67 },
      { id: 30, product_code: "SPC-COR-250G", price: 280, weight: "250g", quantity: 41 },
      { id: 31, product_code: "SPC-COR-500G", price: 520, weight: "500g", quantity: 25 }
    ]
  },
  {
    id: 15,
    name: "Black Pepper",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1599909533096-d0417a0bbb5c?w=400&h=400&fit=crop",
    variants: [
      { id: 32, product_code: "SPC-BPP-50G", price: 200, weight: "50g", quantity: 34 },
      { id: 33, product_code: "SPC-BPP-100G", price: 380, weight: "100g", quantity: 19 },
      { id: 34, product_code: "SPC-BPP-250G", price: 900, weight: "250g", quantity: 8 }
    ]
  },
  {
    id: 16,
    name: "Garam Masala",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1596040798370-7d01bd6461ae?w=400&h=400&fit=crop",
    variants: [
      { id: 35, product_code: "SPC-GAR-100G", price: 320, weight: "100g", quantity: 29 },
      { id: 36, product_code: "SPC-GAR-250G", price: 750, weight: "250g", quantity: 16 },
      { id: 37, product_code: "SPC-GAR-500G", price: 1400, weight: "500g", quantity: 7 }
    ]
  },
  {
    id: 17,
    name: "Cardamom (Green)",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1609501676725-7186f08b4e57?w=400&h=400&fit=crop",
    variants: [
      { id: 38, product_code: "SPC-CAR-25G", price: 500, weight: "25g", quantity: 42 },
      { id: 39, product_code: "SPC-CAR-50G", price: 950, weight: "50g", quantity: 23 },
      { id: 40, product_code: "SPC-CAR-100G", price: 1800, weight: "100g", quantity: 11 }
    ]
  },
  {
    id: 18,
    name: "Cinnamon Sticks",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1588346828312-7dca30804b73?w=400&h=400&fit=crop",
    variants: [
      { id: 41, product_code: "SPC-CIN-50G", price: 180, weight: "50g", quantity: 55 },
      { id: 42, product_code: "SPC-CIN-100G", price: 340, weight: "100g", quantity: 31 },
      { id: 43, product_code: "SPC-CIN-250G", price: 800, weight: "250g", quantity: 14 }
    ]
  },
  {
    id: 19,
    name: "Bay Leaves",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1629127013135-e4f1c8b5f5e1?w=400&h=400&fit=crop",
    variants: [
      { id: 44, product_code: "SPC-BAY-25G", price: 120, weight: "25g", quantity: 73 },
      { id: 45, product_code: "SPC-BAY-50G", price: 220, weight: "50g", quantity: 48 },
      { id: 46, product_code: "SPC-BAY-100G", price: 400, weight: "100g", quantity: 26 }
    ]
  },
  {
    id: 20,
    name: "Cloves",
    category: "Spices",
    main_image: "https://images.unsplash.com/photo-1599909533096-d0417a0bbb5c?w=400&h=400&fit=crop",
    variants: [
      { id: 47, product_code: "SPC-CLV-25G", price: 150, weight: "25g", quantity: 61 },
      { id: 48, product_code: "SPC-CLV-50G", price: 280, weight: "50g", quantity: 37 },
      { id: 49, product_code: "SPC-CLV-100G", price: 520, weight: "100g", quantity: 20 }
    ]
  }
];

const Home = () => {
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);

  // Optimized filtering with useMemo
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    return products.filter((product) => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.variants?.some(variant => 
          variant.product_code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Group products by category with useMemo
  const categorizedProducts = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, products]) => ({
      name,
      products
    }));
  }, [filteredProducts]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
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
    console.log("product selected:", product);
    navigate("/product", { state: product });
  }, [navigate]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
  }, []);

  // Fetch products effect
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(SAMPLE_PRODUCTS);
        console.log("Loaded sample products:", SAMPLE_PRODUCTS);
      } catch (error) {
        console.error("Error getting products.", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pt-20 sm:pt-32">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Discover Products
              </h1>
              <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">Find the perfect spices for your culinary adventures</p>
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

          {/* Search and Filter Section - Mobile First */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search Bar - Full Width on Mobile */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filter Button - Full Width on Mobile */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 active:from-slate-300 active:to-slate-400 rounded-lg sm:rounded-xl border border-slate-300 transition-all duration-200 font-medium text-sm sm:text-base touch-manipulation"
                >
                  <FaFilter size={14} />
                  <span>Categories</span>
                  {selectedCategory && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-1">1</span>
                  )}
                </button>

                {/* Filter Modal/Dropdown - Mobile Optimized */}
                {showFilters && (
                  <>
                    {/* Mobile Overlay */}
                    <div 
                      className="fixed inset-0 bg-black/20 z-40 sm:hidden"
                      onClick={() => setShowFilters(false)}
                    />
                    
                    {/* Filter Content */}
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:absolute sm:inset-x-auto sm:top-full sm:translate-y-0 sm:mt-2 sm:right-0 bg-white rounded-xl shadow-xl border border-slate-200 p-4 sm:p-4 sm:min-w-64 z-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 text-lg sm:text-base">Categories</h3>
                        <div className="flex items-center gap-2">
                          {(selectedCategory || searchTerm) && (
                            <button
                              onClick={clearFilters}
                              className="text-xs text-blue-600 hover:text-blue-800 active:text-blue-900 font-medium touch-manipulation"
                            >
                              Clear All
                            </button>
                          )}
                          <button
                            onClick={() => setShowFilters(false)}
                            className="sm:hidden text-slate-400 hover:text-slate-600 text-xl font-light touch-manipulation"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 max-h-64 sm:max-h-none overflow-y-auto">
                        <button
                          onClick={() => handleCategoryChange("")}
                          className={`w-full text-left px-4 py-3 sm:px-3 sm:py-2 rounded-lg transition-colors touch-manipulation ${
                            !selectedCategory ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 active:bg-slate-100"
                          }`}
                        >
                          All Categories
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            className={`w-full text-left px-4 py-3 sm:px-3 sm:py-2 rounded-lg transition-colors touch-manipulation ${
                              selectedCategory === category 
                                ? "bg-blue-50 text-blue-700 font-medium" 
                                : "hover:bg-slate-50 active:bg-slate-100"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Filters - Mobile Optimized */}
            {(selectedCategory || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm">
                    <span className="hidden sm:inline">Search: </span>"{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
                    <button 
                      onClick={() => setSearchTerm("")} 
                      className="ml-1 hover:bg-blue-200 active:bg-blue-300 rounded-full p-0.5 touch-manipulation"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm">
                    <span className="hidden sm:inline">Category: </span>{selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory("")} 
                      className="ml-1 hover:bg-purple-200 active:bg-purple-300 rounded-full p-0.5 touch-manipulation"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
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
        ) : categorizedProducts.length === 0 ? (
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
            {categorizedProducts.map((category) => (
              <div key={category.name} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Category Header - Mobile Optimized */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-white">{category.name}</h2>
                    <span className="bg-white/20 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {category.products.length}
                    </span>
                  </div>
                </div>

                {/* Products Grid/List - Mobile First */}
                <div className="p-3 sm:p-6">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                      {category.products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="group cursor-pointer bg-white rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl active:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-300 touch-manipulation"
                        >
                          <div className="aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
                            <img
                              src={product.main_image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-2 sm:p-4">
                            <h3 className="font-semibold text-slate-800 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Rs. {product.variants?.[0]?.price || 'N/A'}
                              </span>
                              <span className="text-xs text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                {product.variants?.[0]?.weight}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {category.products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="group cursor-pointer bg-white rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4 hover:shadow-lg active:shadow-md transition-all duration-200 touch-manipulation"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 flex-shrink-0">
                              <img
                                src={product.main_image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                                {product.name}
                              </h3>
                              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                                <span className="hidden sm:inline">Available in </span>{product.variants?.length || 0} variants
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Rs. {product.variants?.[0]?.price || 'N/A'}
                              </div>
                              <div className="text-xs text-slate-500">
                                <span className="hidden sm:inline">Starting from </span>{product.variants?.[0]?.weight}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;