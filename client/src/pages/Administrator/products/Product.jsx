import { useEffect, useState } from "react";
import {
  Trash2,
  Edit3,
  Save,
  X,
  Package,
  Scale,
  Hash,
  DollarSign,
  Archive,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Eye,
  Image,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { set } from "react-hook-form";

// Mock components and services
const InputWithLabel = ({
  label,
  inputType,
  inputId,
  inputName,
  value,
  onChange,
  readOnly,
  className,
  ...props
}) => {
  const getIcon = () => {
    if (inputName?.includes("product_name") || inputName?.includes("name"))
      return <Package className="w-4 h-4" />;
    //if (inputName?.includes('category')) return <Archive className="w-4 h-4" />;
    if (inputName?.includes("variants")) return <Scale className="w-4 h-4" />;
    return <Hash className="w-4 h-4" />;
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 flex items-center gap-2"
      >
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
            ? "bg-gray-50 text-gray-600 cursor-not-allowed"
            : "bg-white hover:border-gray-400"
        } ${className}`}
        {...props}
      />
    </div>
  );
};

const getDetails = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:3000/api/products", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: error.message };
  }
};

const updateProduct = async (productCode, data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`http://localhost:3000/api/products/${productCode}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log("Update response:", response);
    return { success: true, message: "Product updated successfully", data: response.data };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

const deleteVariant = async (productCode) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`http://localhost:3000/api/products/${productCode}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { success: true, message: "Product variant deleted successfully", data: response.data };
  } catch (error) {
    console.error("Error deleting variant:", error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

const toast = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`),
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const mockProduct = {
  id: null,
  name: null,
  no_variants: null,
  main_image:
    null,
  variants: []
};

const ProductPage = () => {
  const initProduct = mockProduct;
  const location = useLocation();
  const id = location.state?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState(initProduct);
  const [updatedVariants, setUpdatedVariants] = useState(
    initProduct.variants || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [details, setDetails] = useState(null);
  
  useEffect(() => {
    (async () => {
      try {
        const response = await getDetails();

        const category = response.data.data.products.find(
          (cat) => cat.product_id === id
        );
        const categoryName = category ? category.category_name : null;
        
        const product = response.data.data.products.filter(
          (prod) => prod.category_name === categoryName
        );     
        
        const noOfVariants = product && Array.isArray(product) ? product.length : 0;

        const categoryImage = (name) => {
          switch (name) {
            case "Black Pepper":
              return "https://images.unsplash.com/photo-1591801058986-9e28e68670f7?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
            case "Herbs":
              return "https://plus.unsplash.com/premium_photo-1693266635481-37de41003239?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
            case "Cinnamon":
              return "https://images.unsplash.com/photo-1601379758962-cadba22b1e3a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
            case "Cardamom":
              return "https://images.unsplash.com/photo-1701190588800-67a7007492ad?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
            case "White Pepper":
              return "https://media.istockphoto.com/id/2159774748/photo/white-pepper-or-peppercorns-in-wooden-spoon-with-bowl.jpg?s=2048x2048&w=is&k=20&c=8E_80C-Xsj_iCRfzfJSwlTKUqmxrGKy5-puKqfc8glc=";
            case "Blends":
              return "https://media.istockphoto.com/id/2195466084/photo/curry-powder.jpg?s=2048x2048&w=is&k=20&c=BMSyanE-Q-2Sja8JrSeATaaEHW_R_V_4icRo0H0ioXs=";
            case "Spices":
              return "https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
          }}

        setUpdatedProduct(prev => ({
          ...prev,
          id: id,
          name: categoryName,
          no_variants: noOfVariants,
          main_image: categoryImage(categoryName)
        }));
        setUpdatedVariants(product);

        if (response.success) {
          setDetails(response.data);
        }
        console.log("Fetched details:", details);
      } catch (error) {
        console.error("Error fetching details", error);
      }
    })();
  }, [id]);

  // handle if product is missing
  if (!initProduct || Object.keys(initProduct).length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-3xl">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold text-red-700 mb-2">
            Product Not Found
          </h3>
          <p className="text-red-600">
            The requested product could not be loaded
          </p>
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
    console.log("Variant change:", { index, field, value });
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
    
    // Update each variant individually
    const updatePromises = updatedVariants.map(async (variant) => {
      const updateData = {
        name: variant.name,
        cost_price: variant.cost_price,
        selling_price: variant.selling_price,
        current_stock: variant.current_stock,
        min_stock_level: variant.min_stock_level,
        max_stock_level: variant.max_stock_level,
        reorder_point: variant.reorder_point,
        shelf_life: variant.shelf_life
      };
      
      return updateProduct(variant.product_id, updateData);
    });

    const results = await Promise.all(updatePromises);
    
    // Check if all updates were successful
    const failedUpdates = results.filter(result => !result.success);
    
    if (failedUpdates.length === 0) {
      toast.success("All variants updated successfully!");
      setIsEditing(false);
    } else {
      toast.error(`${failedUpdates.length} variant(s) failed to update`);
    }
    
  } catch (error) {
    console.error("Error updating variants:", error);
    toast.error("Failed to update variants");
  } finally {
    setIsLoading(false);
  }
};

  const handleVariantDelete = async (index, variant) => {
  try {
    setIsLoading(true);
    console.log("Variant to delete:", variant);
    // Use product_id as the productCode for deletion
    const productCode = variant.product_id;
    
    if (!productCode) {
      toast.error("Product code not found");
      return;
    }

    console.log(`Attempting to delete variant with product code: ${productCode}`);
    
    const response = await deleteVariant(productCode);
    
    if (response.success) {
      console.log("Delete response:", response);
      toast.success("Product variant deleted successfully!");
      
      // Remove variant from local state
      setUpdatedVariants((prev) => prev.filter((_, i) => i !== index));
      
      // Update the product variants count
      setUpdatedProduct(prev => ({
        ...prev,
        no_variants: prev.no_variants - 1
      }));
      
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    } else {
      toast.error(response.error || "Failed to delete variant");
    }
  } catch (error) {
    console.error("Error deleting variant:", error);
    toast.error("Failed to delete variant");
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
      case "Ground Spices":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Whole Spices":
        return "bg-green-100 text-green-800 border-green-200";
      case "Spice Blends":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStockStatusColor = (quantity, minQty, maxQty) => {
    if (quantity > maxQty ) return "bg-green-100 text-green-800";
    if (quantity > minQty) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // const getWeightBadgeColor = (weight) => {
  //   if (weight?.includes("100g"))
  //     return "bg-blue-100 text-blue-800 border-blue-200";
  //   if (weight?.includes("250g"))
  //     return "bg-green-100 text-green-800 border-green-200";
  //   if (weight?.includes("500g"))
  //     return "bg-orange-100 text-orange-800 border-orange-200";
  //   if (weight?.includes("1kg"))
  //     return "bg-red-100 text-red-800 border-red-200";
  //   return "bg-gray-100 text-gray-800 border-gray-200";
  // };

  return (
    <div className="h-full w-full bg-gradient-to-br from-orange-50 via-white to-yellow-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-6 relative overflow-hidden">
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
              <p className="text-white/80">
                View and manage spice product information
              </p>
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
            <div className="bg-gradient-to-r from-blue-400 to-blue-300 text-white p-4">
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
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(updatedProduct.category)}`}
                    >
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

                  <div className="lg:col-span-2 space-y-6">
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-4">
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price (Rs)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> 
                      Reorder Point
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {updatedVariants.map((variant, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
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
                          value={variant.product_id || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "product_code",
                              e.target.value
                            )
                          }
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
                            value={variant.name.match(/\d+g/)?.[0] || ""}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "weight",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                          />
                          
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
                            value={variant.selling_price !== undefined ? parseFloat(variant.selling_price) : ""}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "selling_price",
                                e.target.value
                              )
                            }
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
                            value={variant.current_stock }
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "current_stock",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                          />
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(variant.current_stock, variant.min_stock_level, variant.max_stock_level)}`}
                          >
                            {variant.current_stock > variant.max_stock_level 
                              ? "High"
                              : variant.current_stock > variant.min_stock_level
                                ? "Medium"
                                : "Low"}{" "}
                            Stock
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
                          value={variant.min_stock_level || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "min_stock_level",
                              e.target.value
                            )
                          }
                          readOnly={!isEditing}
                        />
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
                          value={variant.reorder_point || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "reorder_point",
                              e.target.value
                            )
                          }
                          readOnly={!isEditing}
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDeleteDialog(index, variant)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          disabled={isLoading}
                          title={"Delete Variant: ${variant.product_id}"}
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
                <p className="text-sm text-gray-500 mt-1">
                  Add variants to manage different sizes and weights
                </p>
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
                  <p className="text-white/80 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img
                    src={variantToDelete.variant.image || updatedProduct.main_image }
                    alt="variant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {variantToDelete.variant.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Price: Rs. {variantToDelete.variant.selling_price}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product variant? This will
                permanently remove it from the inventory.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleVariantDelete(
                      variantToDelete.index,
                      variantToDelete.variant
                    )
                  }
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
