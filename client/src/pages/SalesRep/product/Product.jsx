import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/cart/CartContext";
import { cn } from "../../../lib/utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaMinus, FaPlus, FaShoppingCart, FaClipboardList, FaArrowLeft, FaStore, FaBoxes, FaCalculator, FaTags } from "react-icons/fa";

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state || {};
  const { variants = [], ...productData } = product;
  
  // Context data
  const { cart, addToCart, addMultipleToCart } = useCart();
  
  // Local state variables - optimized for B2B
  const [selectedVariants, setSelectedVariants] = useState(new Map()); // Map to store variant id -> quantity
  const [isAddingToOrder, setIsAddingToOrder] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Memoized calculations for multi-variant selection
  const totalOrderValue = useMemo(() => {
    return Array.from(selectedVariants.entries()).reduce((total, [variantId, quantity]) => {
      const variant = variants.find(v => v.id === variantId);
      return total + (variant ? variant.price * quantity : 0);
    }, 0);
  }, [selectedVariants, variants]);

  const totalItemCount = useMemo(() => {
    return Array.from(selectedVariants.values()).reduce((total, quantity) => total + quantity, 0);
  }, [selectedVariants]);

  const hasSelectedVariants = selectedVariants.size > 0;

  // Optimized handlers with useCallback for multi-variant selection
  const handleVariantQuantityChange = useCallback((variantId, quantity) => {
    setSelectedVariants(prev => {
      const newMap = new Map(prev);
      if (quantity <= 0) {
        newMap.delete(variantId);
      } else {
        const variant = variants.find(v => v.id === variantId);
        const maxStock = variant ? variant.quantity : 999;
        newMap.set(variantId, Math.min(quantity, maxStock));
      }
      return newMap;
    });
  }, [variants]);

  const handleVariantIncrement = useCallback((variantId) => {
    const variant = variants.find(v => v.id === variantId);
    const currentQuantity = selectedVariants.get(variantId) || 0;
    const maxStock = variant ? variant.quantity : 999;
    
    if (currentQuantity < maxStock) {
      handleVariantQuantityChange(variantId, currentQuantity + 1);
    }
  }, [selectedVariants, variants, handleVariantQuantityChange]);

  const handleVariantDecrement = useCallback((variantId) => {
    const currentQuantity = selectedVariants.get(variantId) || 0;
    handleVariantQuantityChange(variantId, currentQuantity - 1);
  }, [selectedVariants, handleVariantQuantityChange]);

  const setSuggestedQuantity = useCallback((variantId) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      const suggestedQty = Math.min(Math.max(5, Math.floor(variant.quantity * 0.1)), 50);
      handleVariantQuantityChange(variantId, suggestedQty);
    }
  }, [variants, handleVariantQuantityChange]);

  const clearAllSelections = useCallback(() => {
    setSelectedVariants(new Map());
  }, []);

  const handleOrderItemAdd = useCallback(async () => {
    if (selectedVariants.size === 0) {
      toast.error("Please select at least one variant with quantity.");
      return;
    }

    setIsAddingToOrder(true);
    
    try {
      // Prepare variant-quantity map for bulk addition
      const validVariantQuantityMap = new Map();
      let hasValidItems = false;
      
      for (const [variantId, quantity] of selectedVariants.entries()) {
        const variant = variants.find(v => v.id === variantId);
        if (variant && quantity > 0) {
          if (quantity > variant.quantity) {
            toast.error(`Insufficient stock for ${variant.weight}. Only ${variant.quantity} units available.`);
            continue;
          }
          
          validVariantQuantityMap.set(variant, quantity);
          hasValidItems = true;
        }
      }
      
      if (hasValidItems) {
        // Add all valid variants to cart in one operation
        addMultipleToCart(productData, validVariantQuantityMap);
        
        const addedItemsCount = validVariantQuantityMap.size;
        toast.success(`${addedItemsCount} variant${addedItemsCount > 1 ? 's' : ''} of ${product.name} added to order`);
        
        // Clear selections after successful add
        setSelectedVariants(new Map());
      } else {
        toast.error("No items were added to the order.");
      }
    } catch (error) {
      toast.error("Failed to add items to order. Please try again.");
      console.error("Add to order error:", error);
    } finally {
      setIsAddingToOrder(false);
    }
  }, [selectedVariants, variants, productData, addMultipleToCart, product.name]);

  const handleViewOrder = useCallback(() => {
    console.log("Navigating to order summary");
    navigate("../order/add-items");
  }, [navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  if (!product.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Product not found</h2>
          <button 
            onClick={handleGoBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 pt-20 sm:pt-32">
        
        {/* Sales Rep Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
              >
                <FaArrowLeft className="w-4 h-4 text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Add to Order</h1>
                <p className="text-sm text-slate-600">Sales Representative Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaStore className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Creating Order</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Product Display - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Product Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{product.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {product.category}
                      </span>
                      <span className="text-sm text-slate-600">
                        {variants.length} variant{variants.length !== 1 ? 's' : ''} available
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Product Image */}
                  <div>
                    <div className="aspect-square bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden relative">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={product.main_image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                      />
                    </div>
                  </div>

                  {/* Variant Selection - Multi-select */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <FaTags className="w-4 h-4 text-blue-600" />
                        Select Variants & Quantities
                      </h3>
                      {hasSelectedVariants && (
                        <button
                          onClick={clearAllSelections}
                          className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    {variants.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {variants.map((variant, index) => {
                          const selectedQuantity = selectedVariants.get(variant.id) || 0;
                          const isSelected = selectedQuantity > 0;
                          const isLowStock = variant.quantity < 10;
                          const isOutOfStock = variant.quantity === 0;
                          const suggestedQty = Math.min(Math.max(5, Math.floor(variant.quantity * 0.1)), 50);
                          
                          return (
                            <div
                              key={index}
                              className={cn(
                                "p-4 rounded-lg border-2 transition-all duration-200",
                                isSelected
                                  ? "border-blue-500 bg-blue-50"
                                  : isOutOfStock
                                  ? "border-slate-200 bg-slate-50 opacity-50"
                                  : "border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="font-semibold text-slate-800">
                                    {variant.weight}
                                  </div>
                                  <div className="text-sm text-slate-600 mt-1">
                                    Name: {variant.name}
                                  </div>
                                  <div className="text-lg font-bold text-green-600 mt-2">
                                    {formatCurrency(variant.price)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={cn(
                                    "text-sm font-medium",
                                    isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-green-600"
                                  )}>
                                    {isOutOfStock ? "Out of Stock" : `${variant.quantity} in stock`}
                                  </div>
                                  {isLowStock && !isOutOfStock && (
                                    <div className="text-xs text-orange-600 mt-1">Low Stock</div>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              {!isOutOfStock && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-slate-100 rounded-lg">
                                      <button
                                        onClick={() => handleVariantDecrement(variant.id)}
                                        disabled={selectedQuantity <= 0}
                                        className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                      >
                                        <FaMinus className="w-3 h-3" />
                                      </button>
                                      <input
                                        type="number"
                                        value={selectedQuantity}
                                        onChange={(e) => handleVariantQuantityChange(variant.id, parseInt(e.target.value) || 0)}
                                        min="0"
                                        max={variant.quantity}
                                        className="w-12 text-center py-2 text-sm font-semibold bg-transparent border-0 focus:outline-none"
                                        placeholder="0"
                                      />
                                      <button
                                        onClick={() => handleVariantIncrement(variant.id)}
                                        disabled={selectedQuantity >= variant.quantity}
                                        className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                      >
                                        <FaPlus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    
                                    <button
                                      onClick={() => setSuggestedQuantity(variant.id)}
                                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                                    >
                                      Suggest: {suggestedQty}
                                    </button>
                                  </div>
                                  
                                  {isSelected && (
                                    <div className="text-sm font-medium text-blue-600">
                                      {formatCurrency(variant.price * selectedQuantity)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No variants available
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Description */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Product Information</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Classic face blush that adds healthy colour to one's face. Rich formula allows smooth application and buildable colour. The unique Freedom System allows you to mix and match products and colours to make your own custom designed palette of almost any size.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Panel - Right Column */}
          <div className="space-y-6">
            
            {/* Current Selection Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FaBoxes className="w-4 h-4 text-blue-600" />
                Order Details
              </h3>
              
              {hasSelectedVariants ? (
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-2">Order Summary</div>
                    <div className="space-y-2">
                      {Array.from(selectedVariants.entries()).map(([variantId, quantity]) => {
                        const variant = variants.find(v => v.id === variantId);
                        if (!variant) return null;
                        
                        return (
                          <div key={variantId} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{variant.weight}</span>
                              <span className="text-slate-600 ml-2">× {quantity}</span>
                            </div>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(variant.price * quantity)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Total Summary */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-600">Total Items</div>
                      <div className="font-semibold text-slate-800">{totalItemCount} units</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Selected Variants</div>
                      <div className="font-semibold text-slate-800">{selectedVariants.size} variant{selectedVariants.size !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  
                  {/* Order Total */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaCalculator className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-800">Order Total</span>
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {formatCurrency(totalOrderValue)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleOrderItemAdd}
                      disabled={isAddingToOrder || selectedVariants.size === 0}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                    >
                      {isAddingToOrder ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding to Order...
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="w-5 h-5" />
                          Add {selectedVariants.size} Variant{selectedVariants.size !== 1 ? 's' : ''} to Order
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleViewOrder}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors touch-manipulation"
                    >
                      <FaClipboardList className="w-5 h-5" />
                      Review Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FaTags className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                  <p>Select variants and quantities to add to order</p>
                  <p className="text-sm mt-2">You can select multiple variants at once</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Product;