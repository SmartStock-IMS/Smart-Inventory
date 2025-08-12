import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, Trash2, Plus, Minus, Package, Receipt, Percent, CheckCircle2, Circle } from "lucide-react";
import { useCart } from "../../context/cart/CartContext";
import { cn } from "@lib/utils";
import { ToastContainer, toast } from "react-toastify";
import { getAllProducts } from "../../services/product-services.js";

const AddItems = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, setCartState, updateQuantity: updateCartQuantity } = useCart();
  
  // Local state - optimized
  const [items, setItems] = useState(cart);
  const [discount, setDiscount] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoized calculations for performance
  const isAllSelected = useMemo(() => 
    items.length > 0 && selectedItems.size === items.length, 
    [items.length, selectedItems.size]
  );

  const cartSelectedItems = useMemo(() => 
    items.filter(item => selectedItems.has(item.code)), 
    [items, selectedItems]
  );

  const subtotal = useMemo(() => 
    cartSelectedItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartSelectedItems]
  );

  const discountAmount = useMemo(() => {
    const discountPercent = parseFloat(discount) || 0;
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discount]);

  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  // Sync local items with cart context
  useEffect(() => {
    setItems(cart);
    setSelectedItems(prevSelected => {
      const newSelected = new Set();
      cart.forEach(item => {
        if (prevSelected.has(item.code)) {
          newSelected.add(item.code);
        }
      });
      return newSelected;
    });
  }, [cart]);

  // Optimized handlers with useCallback
  const toggleItemSelection = useCallback((id) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.code)));
    }
  }, [isAllSelected, items]);

  const deleteSelected = useCallback(async () => {
    if (selectedItems.size === 0) return;
    
    setIsDeleting(true);
    try {
      const selectedCodes = Array.from(selectedItems);
      selectedCodes.forEach(code => removeFromCart(code));
      
      setSelectedItems(new Set());
      toast.success(`${selectedCodes.length} item${selectedCodes.length !== 1 ? 's' : ''} removed from order`);
    } catch (error) {
      toast.error("Failed to remove items");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedItems, removeFromCart]);

  const updateQuantity = useCallback((id, increment) => {
    const item = items.find(item => item.code === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + increment);
      updateCartQuantity(id, newQuantity);
    }
  }, [items, updateCartQuantity]);

  const handleDiscountChange = useCallback((value) => {
    const numValue = parseFloat(value);
    if (value === "" || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
      setDiscount(value);
    }
  }, []);

  const handleCheckout = useCallback(() => {
    if (selectedItems.size === 0) {
      toast.warning("Please select items to proceed");
      return;
    }

    const cartState = {
      items: items,
      selectedItems: cartSelectedItems,
      discount: discount,
      subtotal: subtotal,
      total: total,
    };
    
    console.log("cart state: ", cartState);
    setCartState(cartState);
    navigate("/order/billing-details");
  }, [selectedItems.size, items, cartSelectedItems, discount, subtotal, total, setCartState, navigate]);

  const formatCurrency = useCallback((amount) => 
    `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`, 
    []
  );

  // Mobile Summary Toggle
  const SummaryToggle = () => (
    <button
      onClick={() => setShowSummary(!showSummary)}
      className="fixed bottom-6 right-6 lg:hidden z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 touch-manipulation"
    >
      <Receipt className="w-6 h-6" />
      {cartSelectedItems.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {cartSelectedItems.length}
        </span>
      )}
    </button>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Your order is empty</h2>
          <p className="text-slate-600 mb-6">Start adding products to create an order for your customer</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 pt-20 sm:pt-32">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Order Management</h1>
                <p className="text-sm text-slate-600">Review and finalize customer order</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-slate-700">{items.length} items</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Cart Items Section */}
          <div className="flex-1 space-y-6">
            
            {/* Selection Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-3 text-slate-700 hover:text-slate-900 transition-colors touch-manipulation"
                >
                  {isAllSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="font-medium">
                    {isAllSelected ? "Deselect All" : "Select All"}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({selectedItems.size} of {items.length} selected)
                  </span>
                </button>
                
                <button
                  onClick={deleteSelected}
                  disabled={selectedItems.size === 0 || isDeleting}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 touch-manipulation",
                    selectedItems.size === 0 || isDeleting
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 active:bg-red-200"
                  )}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Remove Selected
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Cart Items */}
            <div className="lg:hidden space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleItemSelection(item.code)}
                        className="mt-1 touch-manipulation"
                      >
                        {selectedItems.has(item.code) ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 mb-2">{item.name}</h3>
                        
                        <div className="space-y-2">
                          {item.weight ? (
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {item.weight}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border-2 border-slate-200"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm text-slate-600">{item.color}</span>
                            </div>
                          )}
                          
                          <div className="text-sm text-slate-600">
                            Code: <span className="font-mono">{item.code}</span>
                          </div>
                          
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        Total: <span className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                      
                      <div className="flex items-center bg-slate-100 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.code, -1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-slate-800 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.code, 1)}
                          className="p-2 text-slate-600 hover:text-slate-800 transition-colors touch-manipulation"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Cart Items */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left text-slate-700">
                      <th className="p-4 font-semibold">SELECT</th>
                      <th className="p-4 font-semibold">PRODUCT</th>
                      <th className="p-4 font-semibold">VARIANT</th>
                      <th className="p-4 font-semibold">CODE</th>
                      <th className="p-4 font-semibold">PRICE</th>
                      <th className="p-4 font-semibold">QUANTITY</th>
                      <th className="p-4 font-semibold">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <button
                            onClick={() => toggleItemSelection(item.code)}
                            className="touch-manipulation"
                          >
                            {selectedItems.has(item.code) ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-semibold text-slate-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {item.weight ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {item.weight}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-slate-200"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm text-slate-600">{item.color}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-slate-600">{item.code}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-green-600">{formatCurrency(item.price)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center bg-slate-100 rounded-lg w-fit">
                            <button
                              onClick={() => updateQuantity(item.code, -1)}
                              disabled={item.quantity <= 1}
                              className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-semibold text-slate-800 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.code, 1)}
                              className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 lg:static lg:w-96",
              "transform transition-transform duration-300 ease-in-out",
              showSummary ? "translate-y-0" : "translate-y-full lg:translate-y-0",
              "bg-white shadow-2xl lg:shadow-lg rounded-t-2xl lg:rounded-xl",
              "border-t border-slate-200 lg:border lg:border-slate-200",
              "z-40"
            )}
          >
            <div className="p-6">
              {/* Summary Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h2>
                <button
                  onClick={() => setShowSummary(false)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Selected Items Count */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">Selected Items</span>
                    <span className="text-blue-800 font-bold">{selectedItems.size} of {items.length}</span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount Section */}
                <div className="space-y-3">
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Discount %"
                      value={discount}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      min="0"
                      max="100"
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  
                  {discount && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Discount ({discount}%)</span>
                      <span className="font-semibold text-orange-600">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.size === 0}
                  className={cn(
                    "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 touch-manipulation",
                    selectedItems.size === 0
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg active:shadow-md"
                  )}
                >
                  {selectedItems.size === 0 
                    ? "Select items to proceed" 
                    : `Proceed to Checkout (${selectedItems.size} items)`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SummaryToggle />
      
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

export default AddItems;