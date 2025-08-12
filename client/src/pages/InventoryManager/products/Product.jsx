import { useState } from "react";
import { Trash2, Edit3, Save, X, Package, Scale, Calendar, Hash, DollarSign, Archive, AlertCircle, CheckCircle, Sparkles, Eye, Image } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

// Mock components and services
const InputWithLabel = ({ label, inputType, inputId, inputName, value, onChange, readOnly, className, ...props }) => {
  const getIcon = () => {
    if (inputName?.includes('product_name') || inputName?.includes('name')) return <Package className="w-4 h-4" />;
    if (inputName?.includes('category')) return <Archive className="w-4 h-4" />;
    if (inputName?.includes('variants')) return <Scale className="w-4 h-4" />;
    return <Hash className="w-4 h-4" />;
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 flex items-center gap-2">
        {getIcon()}
        {label}
      </label>
      <input
        type={inputType}
        id={inputId}
        name={inputName}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
          readOnly 
            ? 'bg-gray-50 text-gray-600 cursor-not-allowed' 
            : 'bg-white hover:border-gray-400'
        } ${className}`}
        {...props}
      />
    </div>
  );
};

// Mock services
const updateProduct = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: "Product updated successfully" };
};

const deleteVariant = async (productId, variantId) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: "Variant deleted successfully" };
};

const toast = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`)
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Mock product data for demo
const mockProduct = {
  id: "SP001",
  name: "Premium Turmeric Powder",
  category: "Ground Spices",
  no_variants: 3,
  main_image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400",
  variants: [
    {
      id: "V001",
      product_code: "TUR-100G",
      color: "Golden Yellow",
      weight: "100g",
      price: 45,
      quantity: 150,
      min_qty: 20,
      mfd_date: "2024-01-15",
      exp_date: "2025-01-15",
      image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=200"
    },
    {
      id: "V002",
      product_code: "TUR-250G",
      color: "Golden Yellow",
      weight: "250g",
      price: 95,
      quantity: 80,
      min_qty: 15,
      mfd_date: "2024-02-01",
      exp_date: "2025-02-01",
      image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=200"
    },
    {
      id: "V003",
      product_code: "TUR-500G",
      color: "Golden Yellow",
      weight: "500g",
      price: 180,
      quantity: 45,
      min_qty: 10,
      mfd_date: "2024-01-20",
      exp_date: "2025-01-20",
      image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=200"
    }
  ]
};

const ProductPage = () => {
  // Mock location state - in real app this would come from useLocation
  const initProduct = mockProduct;

  const [isEditing, setIsEditing] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState(initProduct);
  const [updatedVariants, setUpdatedVariants] = useState(initProduct.variants || []);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);

  // handle if product is missing
  if (!initProduct || Object.keys(initProduct).length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-3xl">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold text-red-700 mb-2">Product Not Found</h3>
          <p className="text-red-600">The requested product could not be loaded</p>
        </div>
      </div>
    );
  }

  // handle input changes
  const handleProductChange = (e) => {
    setUpdatedProduct({ ...updatedProduct, [e.target.name]: e.target.value });
  };

  // handle input changes for variants
  const handleVariantChange = (index, field, value) => {
    const updated = [...updatedVariants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setUpdatedVariants(updated);
  };

  // handle product update
  const handleProductUpdate = async () => {
    try {
      setIsLoading(true);
      const { ...productDetails } = updatedProduct;
      const updatedData = {
        ...productDetails,
        variants: updatedVariants.map((variant) => {
          return {
            ...variant,
            price: parseFloat(variant.price),
          };
        }),
      };

      const response = await updateProduct(initProduct.id, updatedData);
      if (response.success) {
        console.log(response);
        toast.success("Product updated!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating product", error);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantDelete = async (index, id) => {
    try {
      setIsLoading(true);
      const response = await deleteVariant(initProduct.id, id);
      if (response.success) {
        console.log(response);
        toast.success("Product variant deleted!");
        // Remove variant from local state
        setUpdatedVariants(prev => prev.filter((_, i) => i !== index));
        setDeleteDialogOpen(false);
        setVariantToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting variant", error);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (index, variant) => {
    setVariantToDelete({ index, variant });
    setDeleteDialogOpen(true);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Ground Spices': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Whole Spices': return 'bg-green-100 text-green-800 border-green-200';
      case 'Spice Blends': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockStatusColor = (quantity, minQty) => {
    if (quantity > minQty * 3) return 'bg-green-100 text-green-800';
    if (quantity > minQty) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getWeightBadgeColor = (weight) => {
    if (weight?.includes('100g')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (weight?.includes('250g')) return 'bg-green-100 text-green-800 border-green-200';
    if (weight?.includes('500g')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (weight?.includes('1kg')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-orange-50 via-white to-yellow-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Product Details</h2>
              <p className="text-white/80">View and manage spice product information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2",
                isEditing
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white text-orange-600 hover:bg-gray-100"
              )}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
            {isEditing && (
              <button
                onClick={handleProductUpdate}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-120px)] p-6 overflow-y-auto">
        <div className="space-y-8">
          {/* Product Information Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Information
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Image */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Product Image
                  </label>
                  <div className="relative">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100">
                      <img
                        src={updatedProduct?.main_image}
                        alt={updatedProduct?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(updatedProduct.category)}`}>
                      {updatedProduct.category}
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="lg:col-span-2 space-y-6">
                  <InputWithLabel
                    label="Product Name"
                    inputType="text"
                    inputId="productName"
                    inputName="name"
                    value={updatedProduct.name || ""}
                    onChange={handleProductChange}
                    readOnly={!isEditing}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputWithLabel
                      label="Category"
                      inputType="text"
                      inputId="category"
                      inputName="category"
                      value={updatedProduct.category || ""}
                      onChange={handleProductChange}
                      readOnly={!isEditing}
                    />
                    <InputWithLabel
                      label="Number of Variants"
                      inputType="number"
                      inputId="noVariants"
                      inputName="no_variants"
                      value={updatedProduct.no_variants || ""}
                      onChange={handleProductChange}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Product Variants ({updatedVariants.length})
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Code</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Rs)</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFD Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EXP Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {updatedVariants.map((variant, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                          <img
                            src={variant.image}
                            alt="variant"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className={cn(
                            "w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200",
                            isEditing 
                              ? "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                          )}
                          value={variant.product_code || ""}
                          onChange={(e) => handleVariantChange(index, "product_code", e.target.value)}
                          readOnly={!isEditing}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            className={cn(
                              "w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200",
                              isEditing 
                                ? "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            )}
                            value={variant.weight || variant.color || ""}
                            onChange={(e) => handleVariantChange(index, "weight", e.target.value)}
                            readOnly={!isEditing}
                          />
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getWeightBadgeColor(variant.weight)}`}>
                            {variant.weight}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            className={cn(
                              "w-full pl-8 pr-3 py-2 text-sm border rounded-lg transition-all duration-200",
                              isEditing 
                                ? "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            )}
                            value={variant.price || ""}
                            onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                            readOnly={!isEditing}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <input
                            type="number"
                            className={cn(
                              "w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200",
                              isEditing 
                                ? "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            )}
                            value={variant.quantity || ""}
                            onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
                            readOnly={!isEditing}
                          />
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(variant.quantity, variant.min_qty)}`}>
                            {variant.quantity > variant.min_qty * 3 ? 'High' : 
                             variant.quantity > variant.min_qty ? 'Medium' : 'Low'} Stock
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          className={cn(
                            "w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200",
                            isEditing 
                              ? "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                          )}
                          value={variant.min_qty || ""}
                          onChange={(e) => handleVariantChange(index, "min_qty", e.target.value)}
                          readOnly={!isEditing}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          className={cn(
                            "w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200",
                            isEditing 
                              ? "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                          )}
                          value={variant.mfd_date || ""}
                          onChange={(e) => handleVariantChange(index, "mfd_date", e.target.value)}
                          readOnly={!isEditing}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          className={cn(
                            "w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200",
                            isEditing 
                              ? "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                          )}
                          value={variant.exp_date || ""}
                          onChange={(e) => handleVariantChange(index, "exp_date", e.target.value)}
                          readOnly={!isEditing}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDeleteDialog(index, variant)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {updatedVariants.length === 0 && (
              <div className="p-12 text-center">
                <Scale className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium">No variants found</p>
                <p className="text-sm text-gray-500 mt-1">Add variants to manage different sizes and weights</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && variantToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete Product Variant</h3>
                  <p className="text-white/80 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img
                    src={variantToDelete.variant.image}
                    alt="variant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{variantToDelete.variant.product_code}</h4>
                  <p className="text-sm text-gray-600">{variantToDelete.variant.weight || variantToDelete.variant.color}</p>
                  <p className="text-xs text-gray-500 mt-1">Price: Rs. {variantToDelete.variant.price}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product variant? This will permanently remove it from the inventory.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleVariantDelete(variantToDelete.index, variantToDelete.variant.id)}
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
                      Delete Variant
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setVariantToDelete(null);
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

export default ProductPage;