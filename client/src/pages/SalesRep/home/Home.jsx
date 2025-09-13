import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// import { getProducts } from "@services/product-services";
import { FaSpinner, FaSearch, FaFilter, FaTh, FaList } from "react-icons/fa";

// Hardcoded sample data for development
const SAMPLE_PRODUCTS = [
  {
    id: 11,
    category: "Red Chili Powder",
    main_image: "https://images.unsplash.com/photo-1596040798370-7d01bd6461ae?w=400&h=400&fit=crop",
    variants: [
  { id: 20, name: "Red Chili Powder 100g", price: 150, weight: "100g", quantity: 45 },
  { id: 21, name: "Red Chili Powder 250g", price: 350, weight: "250g", quantity: 32 },
  { id: 22, name: "Red Chili Powder 500g", price: 650, weight: "500g", quantity: 18 }
    ]
  },
  {
    id: 12,
    category: "Turmeric Powder",
    main_image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop",
    variants: [
  { id: 23, name: "Turmeric Powder 100g", price: 180, weight: "100g", quantity: 52 },
  { id: 24, name: "Turmeric Powder 250g", price: 420, weight: "250g", quantity: 28 },
  { id: 25, name: "Turmeric Powder 500g", price: 800, weight: "500g", quantity: 15 }
    ]
  },
  {
    id: 13,
    category: "Cumin Seeds",
    main_image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop",
    variants: [
  { id: 26, name: "Cumin Seeds 100g", price: 250, weight: "100g", quantity: 38 },
  { id: 27, name: "Cumin Seeds 250g", price: 580, weight: "250g", quantity: 22 },
  { id: 28, name: "Cumin Seeds 500g", price: 1100, weight: "500g", quantity: 12 }
    ]
  },
  {
    id: 14,
    category: "Coriander Seeds",
    main_image: "https://images.unsplash.com/photo-1596040801058-eca845fd5d8d?w=400&h=400&fit=crop",
    variants: [
  { id: 29, name: "Coriander Seeds 100g", price: 120, weight: "100g", quantity: 67 },
  { id: 30, name: "Coriander Seeds 250g", price: 280, weight: "250g", quantity: 41 },
  { id: 31, name: "Coriander Seeds 500g", price: 520, weight: "500g", quantity: 25 }
    ]
  },
  {
    id: 15,
    category: "Black Pepper",
    main_image: "https://images.unsplash.com/photo-1599909533096-d0417a0bbb5c?w=400&h=400&fit=crop",
    variants: [
  { id: 32, name: "Black Pepper 50g", price: 200, weight: "50g", quantity: 34 },
  { id: 33, name: "Black Pepper 100g", price: 380, weight: "100g", quantity: 19 },
  { id: 34, name: "Black Pepper 250g", price: 900, weight: "250g", quantity: 8 }
    ]
  },
  {
    id: 16,
    category: "Garam Masala",
    main_image: "https://images.unsplash.com/photo-1596040798370-7d01bd6461ae?w=400&h=400&fit=crop",
    variants: [
  { id: 35, name: "Garam Masala 100g", price: 320, weight: "100g", quantity: 29 },
  { id: 36, name: "Garam Masala 250g", price: 750, weight: "250g", quantity: 16 },
  { id: 37, name: "Garam Masala 500g", price: 1400, weight: "500g", quantity: 7 }
    ]
  },
  {
    id: 17,
    category: "Cardamom (Green)",
    main_image: "https://images.unsplash.com/photo-1609501676725-7186f08b4e57?w=400&h=400&fit=crop",
    variants: [
  { id: 38, name: "Cardamom (Green) 25g", price: 500, weight: "25g", quantity: 42 },
  { id: 39, name: "Cardamom (Green) 50g", price: 950, weight: "50g", quantity: 23 },
  { id: 40, name: "Cardamom (Green) 100g", price: 1800, weight: "100g", quantity: 11 }
    ]
  },
  {
    id: 18,
    category: "Cinnamon Sticks",
    main_image: "https://images.unsplash.com/photo-1588346828312-7dca30804b73?w=400&h=400&fit=crop",
    variants: [
  { id: 41, name: "Cinnamon Sticks 50g", price: 180, weight: "50g", quantity: 55 },
  { id: 42, name: "Cinnamon Sticks 100g", price: 340, weight: "100g", quantity: 31 },
  { id: 43, name: "Cinnamon Sticks 250g", price: 800, weight: "250g", quantity: 14 }
    ]
  },
  {
    id: 19,
    category: "Bay Leaves",
    main_image: "https://images.unsplash.com/photo-1629127013135-e4f1c8b5f5e1?w=400&h=400&fit=crop",
    variants: [
  { id: 44, name: "Bay Leaves 25g", price: 120, weight: "25g", quantity: 73 },
  { id: 45, name: "Bay Leaves 50g", price: 220, weight: "50g", quantity: 48 },
  { id: 46, name: "Bay Leaves 100g", price: 400, weight: "100g", quantity: 26 }
    ]
  },
  {
    id: 20,
    category: "Cloves",
    main_image: "https://images.unsplash.com/photo-1599909533096-d0417a0bbb5c?w=400&h=400&fit=crop",
    variants: [
  { id: 47, name: "Cloves 25g", price: 150, weight: "25g", quantity: 61 },
  { id: 48, name: "Cloves 50g", price: 280, weight: "50g", quantity: 37 },
  { id: 49, name: "Cloves 100g", price: 520, weight: "100g", quantity: 20 }
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

  // Flat list of products (no grouping)
  const flatProducts = filteredProducts;

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
          {/* Search Bar Only - Reduced Height */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-11 sm:pl-12 pr-4 py-2 sm:py-2 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
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
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2 sm:p-4 text-center">
                          <span className="text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                            {product.category}
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
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0" />
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                              {product.category}
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