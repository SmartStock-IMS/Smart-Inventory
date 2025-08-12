import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { Search, Minus, Plus, Layers, Sparkles, Package, ShoppingCart, Filter, Grid, Eye, X, CheckCircle, AlertCircle, Scale, Truck } from "lucide-react";

// Mock services and spices data
const getProducts = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    data: [
      {
        id: 1,
        name: "Ceylon Cinnamon Sticks",
        category: "Whole Spices",
        main_image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=300&h=300&fit=crop&crop=center",
        variants: [
          { product_code: "CCS001-100G", weight: "100g", quantity: 150 },
          { product_code: "CCS001-250G", weight: "250g", quantity: 80 },
          { product_code: "CCS001-500G", weight: "500g", quantity: 45 },
          { product_code: "CCS001-1KG", weight: "1kg", quantity: 30 }
        ]
      },
      {
        id: 2,
        name: "Black Peppercorns",
        category: "Whole Spices",
        main_image: "https://images.unsplash.com/photo-1586016404137-96e2e95ad5e1?w=300&h=300&fit=crop&crop=center",
        variants: [
          { product_code: "BPP002-50G", weight: "50g", quantity: 200 },
          { product_code: "BPP002-100G", weight: "100g", quantity: 120 },
          { product_code: "BPP002-250G", weight: "250g", quantity: 65 },
          { product_code: "BPP002-500G", weight: "500g", quantity: 35 }
        ]
      },
      {
        id: 3,
        name: "Turmeric Powder",
        category: "Ground Spices",
        main_image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300&h=300&fit=crop&crop=center",
        variants: [
          { product_code: "TMP003-100G", weight: "100g", quantity: 180 },
          { product_code: "TMP003-250G", weight: "250g", quantity: 95 },
          { product_code: "TMP003-500G", weight: "500g", quantity: 55 },
          { product_code: "TMP003-1KG", weight: "1kg", quantity: 40 }
        ]
      },
      {
        id: 4,
        name: "Cardamom Pods",
        category: "Whole Spices",
        main_image: "https://images.unsplash.com/photo-1596040033229-a8a1dbd6b69a?w=300&h=300&fit=crop&crop=center",
        variants: [
          { product_code: "CDP004-25G", weight: "25g", quantity: 120 },
          { product_code: "CDP004-50G", weight: "50g", quantity: 85 },
          { product_code: "CDP004-100G", weight: "100g", quantity: 60 },
          { product_code: "CDP004-250G", weight: "250g", quantity: 25 }
        ]
      },
      {
        id: 5,
        name: "Garam Masala Blend",
        category: "Spice Blends",
        main_image: "https://images.unsplash.com/photo-1596040033229-a8a1dbd6b69a?w=300&h=300&fit=crop&crop=center",
        variants: [
          { product_code: "GMB005-100G", weight: "100g", quantity: 140 },
          { product_code: "GMB005-250G", weight: "250g", quantity: 75 },
          { product_code: "GMB005-500G", weight: "500g", quantity: 40 }
        ]
      },
      {
        id: 6,
        name: "Curry Powder",
        category: "Spice Blends",
        main_image: "https://images.unsplash.com/photo-1596040033229-a8a1dbd6b69a?w=300&h=300&fit=crop&crop=center",
        variants: [
          { product_code: "CPW006-100G", weight: "100g", quantity: 160 },
          { product_code: "CPW006-250G", weight: "250g", quantity: 90 },
          { product_code: "CPW006-500G", weight: "500g", quantity: 50 },
          { product_code: "CPW006-1KG", weight: "1kg", quantity: 30 }
        ]
      },
      {
        id: 7,
        name: "Red Chili Powder",
        category: "Ground Spices",
        main_image: "https://images.unsplash.com/photo-1583227264993-7019a5c9838a?w=300&h=300&fit=crop&crop=center",
        variants: [
          { product_code: "RCP007-100G", weight: "100g", quantity: 200 },
          { product_code: "RCP007-250G", weight: "250g", quantity: 110 },
          { product_code: "RCP007-500G", weight: "500g", quantity: 70 },
          { product_code: "RCP007-1KG", weight: "1kg", quantity: 45 }
        ]
      },
      {
        id: 8,
        name: "Cumin Seeds",
        category: "Whole Spices",
        main_image: "https://images.unsplash.com/photo-1596040033229-a8a1dbd6b69a?w=300&h=300&fit=crop&crop=center",
        variants: [
          { product_code: "CMS008-100G", weight: "100g", quantity: 175 },
          { product_code: "CMS008-250G", weight: "250g", quantity: 85 },
          { product_code: "CMS008-500G", weight: "500g", quantity: 55 },
          { product_code: "CMS008-1KG", weight: "1kg", quantity: 35 }
        ]
      }
    ]
  };
};

// Mock toast function
const toast = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`)
};

// Mock BulkList component
const BulkList = ({ bulkList, isProcessed, setBulk }) => (
  <div className="h-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Bulk Order Summary</h3>
          <p className="text-gray-600">Review and confirm your bulk order</p>
        </div>
      </div>
      <button
        onClick={() => isProcessed(false)}
        className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
      >
        Back to Products
      </button>
    </div>
    
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-800">Items in Bulk Order ({bulkList.length})</h4>
      </div>
      <div className="p-6">
        {bulkList.length > 0 ? (
          <div className="space-y-4">
            {bulkList.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Scale className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-800">{item.item_code}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <button
                  onClick={() => setBulk(prev => prev.filter((_, i) => i !== index))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No items in bulk order</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

const AddBulk = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        if (response.success) {
          setProducts(response.data);
        } else {
          console.error("Error fetching products: ", response.message);
        }
      } catch (error) {
        console.error("Error getting products.", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const filteredProducts = filterProducts(products || [], searchQuery);
    const filteredCategoriesMap = filteredProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    const filterCategories = Object.entries(filteredCategoriesMap).map(
      ([name, products]) => ({
        name,
        products,
      }),
    );

    const filteredCategories = selectedCategory
      ? filterCategories.filter(
        (category) => category.name === selectedCategory.value
      )
      : filterCategories;

    setFilteredCategories(filteredCategories);
  }, [products, searchQuery, selectedCategory]);

  const categoriesMap = (products || []).reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const categories = Object.entries(categoriesMap).map(([name, products]) => ({
    name,
    products,
  }));

  const filterProducts = (products, keyword) => {
    if (!products || !Array.isArray(products)) return [];
    if (!keyword) return products;
    return products.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(keyword.toLowerCase());

      const variantMatch = product.variants && product.variants.some((variant) =>
        variant.product_code.toLowerCase().includes(keyword.toLowerCase())
      );

      return nameMatch || variantMatch;
    });
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

  const openProductDialog = (product) => {
    setSelectedProduct(product);
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
    <div className="w-full h-full bg-gradient-to-br from-orange-50 via-white to-yellow-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
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
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
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
      <div className="h-[calc(100%-200px)] p-6 overflow-y-auto">
        {isProcessed ? (
          <BulkList bulkList={productBulk} isProcessed={setIsProcessed} setBulk={setProductBulk} />
        ) : (
          <div className="h-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FaSpinner className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading spices inventory...</p>
                </div>
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-8">
                {filteredCategories.map((category, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5" />
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                          {category.products.length} products
                        </span>
                      </div>
                    </div>
                    
                    {category.products.length > 0 ? (
                      <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                          {category.products.map((product) => (
                            <div key={product.id} className="group">
                              <button
                                onClick={() => openProductDialog(product)}
                                className="w-full bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:scale-105"
                              >
                                <div className="aspect-square overflow-hidden">
                                  <img
                                    src={product.main_image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                <div className="p-4">
                                  <h4 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2">
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{product.variants.length} sizes</span>
                                    <Scale className="w-4 h-4" />
                                  </div>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No products found in this category</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">No products available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Dialog */}
      {dialogOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
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
                <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg border-4 border-gray-100">
                  <img
                    src={selectedProduct.main_image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                            ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getWeightBadgeColor(variant.weight)}`}>
                              {variant.weight}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{variant.product_code}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">{variant.quantity}</p>
                            <p className="text-xs text-gray-500">in stock</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quantity to Add
                  </label>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleDecrement}
                      className="p-3 border border-gray-300 rounded-l-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 py-3 text-center border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={handleIncrement}
                      className="p-3 border border-gray-300 rounded-r-xl bg-gray-50 hover:bg-gray-100 transition-colors"
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
                        ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Bulk
                  </button>
                  <button
                    onClick={handleDialogClose}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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