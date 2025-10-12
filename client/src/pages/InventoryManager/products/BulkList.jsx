import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { Trash2, Plus, Minus, Save, ArrowLeft, Package, ShoppingCart, CheckCircle, AlertCircle, Truck } from "lucide-react";
import axios from "axios";

// Resolve a single product/variant by product_id from backend list
const resolveProductById = (allProducts, productId) => {
  const p = (allProducts || []).find(x => x.product_id === productId);
  if (!p) return null;
  return {
    id: p.product_id,
    product_code: p.product_id,
    name: p.name || p.category_name,
    image: `https://loremflickr.com/300/300/${encodeURIComponent(p.category_name || 'product')}`,
    category: p.category_name,
    weight: p.name,
    price: parseFloat(p.selling_price || 0),
    current_stock: p.current_stock || 0,
    bulk_qty: 1
  };
};

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

const updateProductQuantity = async (bulkItems) => {
  try {
    const token = localStorage.getItem('token');
    // fetch current products to get latest stock
    const listRes = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: { page: 1, limit: 500 }
    });
    const all = listRes.data?.data?.products || [];
    const idToRow = new Map(all.map(p => [p.product_id, p]));
    const idToCurrent = new Map(all.map(p => [p.product_id, Number(p.current_stock || 0)]));

    // sequentially update by setting quantity = current + delta
    for (const item of bulkItems) {
      const current = idToCurrent.get(item.item_code) ?? 0;
      const nextQty = Number(current) + Number(item.quantity || 0);
      const base = idToRow.get(item.item_code) || {};
      const payload = {
        // preserve existing fields
        name: base.name,
        cost_price: base.cost_price !== undefined ? Number(base.cost_price) : undefined,
        selling_price: base.selling_price !== undefined ? Number(base.selling_price) : undefined,
        min_stock_level: base.min_stock_level !== undefined ? Number(base.min_stock_level) : undefined,
        max_stock_level: base.max_stock_level !== undefined ? Number(base.max_stock_level) : undefined,
        reorder_point: base.reorder_point !== undefined ? Number(base.reorder_point) : undefined,
        shelf_life: base.shelf_life !== undefined ? Number(base.shelf_life) : undefined,
        // only change quantity
        quantity: nextQty
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/products/${encodeURIComponent(item.item_code)}`,
        payload,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      // update map for potential subsequent items with same id
      idToCurrent.set(item.item_code, nextQty);
    }
    return { success: true };
  } catch (error) {
    console.error('Bulk update error:', error);
    return { success: false, error: error.message };
  }
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
  
  // Get bulk list from navigation state
  const initialBulkList = location.state?.bulkList || [];

  const [reqData, setReqData] = useState(initialBulkList);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const all = await fetchAllProducts();
        const list = all.success ? all.data : [];

        if (initialBulkList && initialBulkList.length > 0) {
          // Map navigation list to products resolved from backend list
          const bulkProducts = initialBulkList.map(bulkItem => {
            const p = resolveProductById(list, bulkItem.item_code);
            if (!p) return null;
            return { ...p, bulk_qty: bulkItem.quantity };
          }).filter(Boolean);
          setProducts(bulkProducts);
        } else {
          setProducts([]);
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
    return products.reduce((total, item) => total + (Number(item.price || 0) * Number(item.bulk_qty || 0)), 0);
  };

  const getTotalItems = () => {
    return products.reduce((total, item) => total + item.bulk_qty, 0);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
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
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <div className="text-center">
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-white/80">Items</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
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
      <div className="h-[calc(100%-180px)] p-5 overflow-y-auto">
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
