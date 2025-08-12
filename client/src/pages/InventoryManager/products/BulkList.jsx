import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { Trash2, Plus, Minus, Save, ArrowLeft, Package, ShoppingCart, CheckCircle, AlertCircle, Truck } from "lucide-react";

// Comprehensive spice product database that matches AddBulk
const spiceProductDatabase = [
  {
    id: 1,
    name: "Ceylon Cinnamon Sticks",
    category: "Whole Spices",
    main_image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=300&h=300&fit=crop&crop=center",
    variants: [
      { product_code: "CCS001-100G", weight: "100g", price: 180, current_stock: 150 },
      { product_code: "CCS001-250G", weight: "250g", price: 420, current_stock: 80 },
      { product_code: "CCS001-500G", weight: "500g", price: 800, current_stock: 45 },
      { product_code: "CCS001-1KG", weight: "1kg", price: 1500, current_stock: 30 }
    ]
  },
  {
    id: 2,
    name: "Black Peppercorns",
    category: "Whole Spices",
    main_image: "https://images.unsplash.com/photo-1586016404137-96e2e95ad5e1?w=300&h=300&fit=crop&crop=center",
    variants: [
      { product_code: "BPP002-50G", weight: "50g", price: 120, current_stock: 200 },
      { product_code: "BPP002-100G", weight: "100g", price: 220, current_stock: 120 },
      { product_code: "BPP002-250G", weight: "250g", price: 500, current_stock: 65 },
      { product_code: "BPP002-500G", weight: "500g", price: 950, current_stock: 35 }
    ]
  },
  {
    id: 3,
    name: "Turmeric Powder",
    category: "Ground Spices",
    main_image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300&h=300&fit=crop&crop=center",
    variants: [
      { product_code: "TMP003-100G", weight: "100g", price: 45, current_stock: 180 },
      { product_code: "TMP003-250G", weight: "250g", price: 95, current_stock: 95 },
      { product_code: "TMP003-500G", weight: "500g", price: 180, current_stock: 55 },
      { product_code: "TMP003-1KG", weight: "1kg", price: 340, current_stock: 40 }
    ]
  },
  {
    id: 4,
    name: "Cardamom Pods",
    category: "Whole Spices",
    main_image: "https://images.unsplash.com/photo-1596040033229-a8a1dbd6b69a?w=300&h=300&fit=crop&crop=center",
    variants: [
      { product_code: "CDP004-25G", weight: "25g", price: 220, current_stock: 120 },
      { product_code: "CDP004-50G", weight: "50g", price: 420, current_stock: 85 },
      { product_code: "CDP004-100G", weight: "100g", price: 800, current_stock: 60 },
      { product_code: "CDP004-250G", weight: "250g", price: 1900, current_stock: 25 }
    ]
  },
  {
    id: 5,
    name: "Garam Masala Blend",
    category: "Spice Blends",
    main_image: "https://images.unsplash.com/photo-1596040033229-a8a1dbd6b69a?w=300&h=300&fit=crop&crop=center",
    variants: [
      { product_code: "GMB005-100G", weight: "100g", price: 75, current_stock: 140 },
      { product_code: "GMB005-250G", weight: "250g", price: 140, current_stock: 75 },
      { product_code: "GMB005-500G", weight: "500g", price: 320, current_stock: 40 }
    ]
  },
  {
    id: 6,
    name: "Curry Powder",
    category: "Spice Blends",
    main_image: "https://images.unsplash.com/photo-1596040033229-a8a1dbd6b69a?w=300&h=300&fit=crop&crop=center",
    variants: [
      { product_code: "CPW006-100G", weight: "100g", price: 65, current_stock: 160 },
      { product_code: "CPW006-250G", weight: "250g", price: 150, current_stock: 90 },
      { product_code: "CPW006-500G", weight: "500g", price: 280, current_stock: 50 },
      { product_code: "CPW006-1KG", weight: "1kg", price: 530, current_stock: 30 }
    ]
  },
  {
    id: 7,
    name: "Red Chili Powder",
    category: "Ground Spices",
    main_image: "https://images.unsplash.com/photo-1583227264993-7019a5c9838a?w=300&h=300&fit=crop&crop=center",
    variants: [
      { product_code: "RCP007-100G", weight: "100g", price: 55, current_stock: 200 },
      { product_code: "RCP007-250G", weight: "250g", price: 125, current_stock: 110 },
      { product_code: "RCP007-500G", weight: "500g", price: 230, current_stock: 70 },
      { product_code: "RCP007-1KG", weight: "1kg", price: 430, current_stock: 45 }
    ]
  },
  {
    id: 8,
    name: "Cumin Seeds",
    category: "Whole Spices",
    main_image: "https://images.unsplash.com/photo-1596040033229-a8a1dbd6b69a?w=300&h=300&fit=crop&crop=center",
    variants: [
      { product_code: "CMS008-100G", weight: "100g", price: 65, current_stock: 175 },
      { product_code: "CMS008-250G", weight: "250g", price: 150, current_stock: 85 },
      { product_code: "CMS008-500G", weight: "500g", price: 280, current_stock: 55 },
      { product_code: "CMS008-1KG", weight: "1kg", price: 520, current_stock: 35 }
    ]
  }
];

// Function to get product details by product code
const getProductByCode = (productCode) => {
  for (const product of spiceProductDatabase) {
    const variant = product.variants.find(v => v.product_code === productCode);
    if (variant) {
      return {
        id: product.id,
        product_code: variant.product_code,
        name: product.name,
        image: product.main_image,
        category: product.category,
        weight: variant.weight,
        price: variant.price,
        current_stock: variant.current_stock,
        bulk_qty: 1 // Default quantity
      };
    }
  }
  return null;
};

// Mock service functions
const getProductVariants = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Flatten all variants from the database
  const allVariants = [];
  spiceProductDatabase.forEach(product => {
    product.variants.forEach(variant => {
      allVariants.push({
        id: product.id,
        product_code: variant.product_code,
        name: product.name,
        image: product.main_image,
        category: product.category,
        weight: variant.weight,
        price: variant.price,
        current_stock: variant.current_stock
      });
    });
  });
  return { success: true, data: allVariants };
};

const updateProductQuantity = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log("Updating product quantities:", data);
  return { success: true, message: "Bulk quantities updated successfully" };
};

const toast = {
  success: (message) => {
    console.log(`✅ ${message}`);
    // You can integrate with react-toastify here
  },
  error: (message) => {
    console.log(`❌ ${message}`);
    // You can integrate with react-toastify here
  }
};

const BulkList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get bulk list from navigation state or use mock data
  const initialBulkList = location.state?.bulkList || mockBulkData.map(item => ({
    item_code: item.product_code,
    quantity: item.bulk_qty
  }));

  const [reqData, setReqData] = useState(initialBulkList);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        console.log("Loading product variants for bulk list:", initialBulkList);
        
        if (initialBulkList && initialBulkList.length > 0) {
          // Map the bulk list to actual product data
          const bulkProducts = initialBulkList.map(bulkItem => {
            const productData = getProductByCode(bulkItem.item_code);
            if (productData) {
              return {
                ...productData,
                bulk_qty: bulkItem.quantity
              };
            }
            return null;
          }).filter(Boolean); // Remove null entries
          
          console.log("Mapped bulk products:", bulkProducts);
          setProducts(bulkProducts);
        } else {
          // If no bulk list provided, show some sample products
          console.log("No bulk list provided, showing sample products");
          const sampleProducts = [
            getProductByCode("TMP003-100G"),
            getProductByCode("BPP002-250G"),
            getProductByCode("CDP004-50G")
          ].filter(Boolean).map(product => ({ ...product, bulk_qty: 10 }));
          setProducts(sampleProducts);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        // Fallback to sample products
        const fallbackProducts = [
          getProductByCode("TMP003-100G"),
          getProductByCode("RCP007-250G")
        ].filter(Boolean).map(product => ({ ...product, bulk_qty: 5 }));
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateQuantity = (id, increment) => {
    setProducts(
      products.map((item) =>
        item.product_code === id
          ? { ...item, bulk_qty: Math.max(1, item.bulk_qty + increment) }
          : item
      ),
    );

    setReqData(
      reqData.map((item) =>
        item.item_code === id
          ? { ...item, quantity: Math.max(1, item.quantity + increment) }
          : item
      ),
    );
  };

  const removeItem = (productCode) => {
    setProducts(products.filter(item => item.product_code !== productCode));
    setReqData(reqData.filter(item => item.item_code !== productCode));
  };

  const handleBulkSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await updateProductQuantity(reqData);
      if (response.success) {
        toast.success("Bulk quantities updated successfully!");
        setTimeout(() => {
          navigate("/inventorymanager/bulk");
        }, 2000);
      } else {
        toast.error("Error updating product quantities");
      }
    } catch (error) {
      console.error("Error updating bulk quantities:", error);
      toast.error("Error updating product quantities");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalValue = () => {
    return products.reduce((total, item) => total + (item.price * item.bulk_qty), 0);
  };

  const getTotalItems = () => {
    return products.reduce((total, item) => total + item.bulk_qty, 0);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/inventorymanager/bulk")}
                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold mb-1">Bulk Order Review</h2>
                <p className="text-white/80">Review and confirm your bulk inventory update</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-center">
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-white/80">Items</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-center">
                  <p className="text-2xl font-bold">{getTotalItems()}</p>
                  <p className="text-sm text-white/80">Total Qty</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold">Products</span>
                </div>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-semibold">Total Quantity</span>
                </div>
                <p className="text-2xl font-bold">{getTotalItems()}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Truck className="w-5 h-5" />
                  <span className="font-semibold">Total Value</span>
                </div>
                <p className="text-2xl font-bold">Rs{getTotalValue().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-240px)] p-6 overflow-y-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FaSpinner className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Loading bulk order details...</p>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight/Size
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">Stock: {item.current_stock}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                          {item.weight}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                          {item.product_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">Rs{item.price}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.product_code, -1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                            disabled={item.bulk_qty <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold text-lg">
                            {item.bulk_qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_code, 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600 text-lg">
                          Rs{(item.price * item.bulk_qty).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => removeItem(item.product_code)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from bulk order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium mb-2">No items in bulk order</p>
              <p className="text-sm text-gray-500 mb-4">Add some products to your bulk order first</p>
              <Link
                to="/inventorymanager/bulk"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
              >
                <Package className="w-4 h-4" />
                Add Products
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {products.length > 0 && (
        <div className="h-20 border-t border-gray-200 bg-white">
          <div className="h-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-xl font-bold text-gray-800">{getTotalItems()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-xl font-bold text-green-600">Rs{getTotalValue().toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/inventorymanager/bulk"
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Products
              </Link>
              <button
                onClick={handleBulkSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Inventory
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkList;
