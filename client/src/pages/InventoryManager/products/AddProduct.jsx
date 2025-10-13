import { useCallback, useRef, useState, useEffect } from "react";
import { Box, Trash2, Plus, Package, Calendar, Hash, Palette, DollarSign, Archive, Clock, CheckCircle, AlertCircle, Sparkles, Star, ChevronDown } from "lucide-react";

// Category Dropdown Component
const CategoryDropdown = ({ categories, selectedCategory, onCategoryChange, register, required = false }) => {
  return (
    <div className="w-full">
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Package className="w-4 h-4" />
        Category
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          {...register("category_id", { required })}
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-white shadow-sm appearance-none"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

const InputWithLabel = ({ label, inputType, inputId, inputName, className = "", register, required = false, ...props }) => {
  const getIcon = () => {
    if (inputName.includes('cost_price')) return <DollarSign className="w-4 h-4" />;
    if (inputName.includes('selling_price')) return <DollarSign className="w-4 h-4" />;
    if (inputName.includes('stock_level') || inputName.includes('reorder_point') || inputName.includes('current_stock')) return <Archive className="w-4 h-4" />;
    if (inputName.includes('shelf_life')) return <Clock className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {getIcon()}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          {...register(inputName, { required })}
          type={inputType}
          id={inputId}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-white shadow-sm"
          {...props}
        />
      </div>
    </div>
  );
};

// API services
const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const response = await fetch('http://localhost:3000/api/categories', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    if (result.success && result.data) {
      return result.data.categories || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

const addProduct = async (payload) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error adding product:", error);
    return { success: false, message: error.message };
  }
};

const toast = {
  success: (message) => alert(`✅ ${message}`),
  error: (message) => alert(`❌ ${message}`)
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const AddProduct = () => {
  // init form default values
  const variantDefaultValues = {
    weight: "",
    cost_price: 0,
    selling_price: 0,
    min_stock_level: 0,
    max_stock_level: null,
    reorder_point: 0,
    shelf_life: null,
    current_stock: 0,
  };
  const productDefaultValues = {
    category_id: "",
  };

  // Mock useForm hook
  const createMockForm = (defaultValues) => {
    const [formData, setFormData] = useState(defaultValues);
    
    const register = (name, options = {}) => ({
      name,
      onChange: (e) => setFormData(prev => ({ ...prev, [name]: e.target.value })),
      value: formData[name] || '',
      required: options.required
    });

    const handleSubmit = (onSubmit) => (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const reset = () => setFormData(defaultValues);

    return { register, handleSubmit, reset };
  };

  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProduct,
  } = createMockForm(productDefaultValues);
  
  const {
    register: registerVariant,
    handleSubmit: handleSubmitVariant,
    reset: resetVariant,
  } = createMockForm(variantDefaultValues);

  // init local-state-variables
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [variantDetails, setVariantDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    };
    loadCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const onSubmitVariant = (variantData) => {
    const category = categories.find(cat => cat.category_id === selectedCategory);
    const categoryName = category?.category_name || "";

    // validations
    if (!selectedCategory) {
      return toast.error("Please select a category first");
    }
    if (!variantData.weight || String(variantData.weight).trim() === "") {
      return toast.error("Please enter weight/size (e.g., 50g, 100g)");
    }
    if (!variantData.cost_price || parseFloat(variantData.cost_price) <= 0) {
      return toast.error("Cost price must be greater than 0");
    }
    if (!variantData.selling_price || parseFloat(variantData.selling_price) <= 0) {
      return toast.error("Selling price must be greater than 0");
    }
    if (parseFloat(variantData.selling_price) < parseFloat(variantData.cost_price)) {
      return toast.error("Selling price cannot be less than cost price");
    }
    if (!variantData.current_stock || parseInt(variantData.current_stock) < 0) {
      return toast.error("Current stock must be 0 or more");
    }

    // enforce name format: "<CategoryName> <Weight>"
    const computedName = `${categoryName} ${variantData.weight}`.trim();

    const variantWithCategory = {
      ...variantData,
      name: computedName,
      category_id: selectedCategory,
    };

    setVariantDetails((prevVariants) => [...prevVariants, variantWithCategory]);
    resetVariant();
  };

  const removeVariant = (index) => {
    setVariantDetails((prevVariants) =>
      prevVariants.filter((_, i) => i !== index),
    );
  };

  const onSubmitProduct = async (productData) => {
    try {
      setIsLoading(true);

      // Add all variants as separate products
      const promises = variantDetails.map(async (variant) => {
        const productPayload = {
          name: variant.name,
          category_name: categories.find(cat => cat.category_id === variant.category_id)?.category_name || '',
          cost_price: parseFloat(variant.cost_price) || 0,
          selling_price: parseFloat(variant.selling_price) || 0,
          min_stock_level: parseInt(variant.min_stock_level) || 0,
          max_stock_level: variant.max_stock_level ? parseInt(variant.max_stock_level) : null,
          reorder_point: parseInt(variant.reorder_point) || 0,
          shelf_life: variant.shelf_life ? parseInt(variant.shelf_life) : null,
          initial_quantity: parseInt(variant.current_stock) || 0 // Current stock as initial quantity
        };

        return await addProduct(productPayload);
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        toast.success(`${variantDetails.length} product(s) added successfully!`);
        resetProduct();
        resetVariant();
        setSelectedCategory("");
        setVariantDetails([]);
      } else {
        toast.error("Some products failed to add");
      }
    } catch (error) {
      console.log("Error adding products: ", error);
      toast.error("Failed to add products");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Add Product Variants</h2>
            <p className="text-white/80">Create multiple product variants from one category</p>
          </div>
          <div className="ml-auto">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100%-96px)] p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Category Selection Section */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Select Category</h3>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <CategoryDropdown
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  register={registerProduct}
                  required={true}
                />
              </div>
            </div>

          {/* Variant Details Section */}
          {selectedCategory && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Add Product Variant</h3>
              </div>

              {/* Variant Form */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 mb-6">
                <div className="h-full">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 h-full flex flex-col">
                    <div className="grid grid-cols-1 gap-6 mb-6">
                      <InputWithLabel
                        label={"Weight / Size (e.g., 50g, 1kg)"}
                        inputType={"text"}
                        inputId={"variantWeight"}
                        inputName={"weight"}
                        register={registerVariant}
                        required={true}
                        placeholder="Enter product weight or size"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <InputWithLabel
                        label={"Cost Price"}
                        inputType={"number"}
                        inputId={"variantCostPrice"}
                        inputName={"cost_price"}
                        register={registerVariant}
                        required={true}
                        step="0.01"
                        min="0"
                      />
                      <InputWithLabel
                        label={"Selling Price"}
                        inputType={"number"}
                        inputId={"variantSellingPrice"}
                        inputName={"selling_price"}
                        register={registerVariant}
                        required={true}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <InputWithLabel
                        label={"Current Stock"}
                        inputType={"number"}
                        inputId={"variantCurrentStock"}
                        inputName={"current_stock"}
                        register={registerVariant}
                        required={true}
                        min="0"
                      />
                      <InputWithLabel
                        label={"Shelf Life (days)"}
                        inputType={"number"}
                        inputId={"variantShelfLife"}
                        inputName={"shelf_life"}
                        register={registerVariant}
                        required={false}
                        min="0"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <InputWithLabel
                        label={"Minimum Stock Level"}
                        inputType={"number"}
                        inputId={"variantMinStock"}
                        inputName={"min_stock_level"}
                        register={registerVariant}
                        required={true}
                        min="0"
                      />
                      <InputWithLabel
                        label={"Maximum Stock Level"}
                        inputType={"number"}
                        inputId={"variantMaxStock"}
                        inputName={"max_stock_level"}
                        register={registerVariant}
                        required={false}
                        min="0"
                      />
                      <InputWithLabel
                        label={"Reorder Point"}
                        inputType={"number"}
                        inputId={"variantReorderPoint"}
                        inputName={"reorder_point"}
                        register={registerVariant}
                        required={true}
                        min="0"
                      />
                    </div>
                    
                    <div className="flex justify-end mt-auto">
                      <button
                        type="button"
                        onClick={() => {
                          const variantData = {
                            weight: document.getElementById('variantWeight').value,
                            cost_price: document.getElementById('variantCostPrice').value,
                            selling_price: document.getElementById('variantSellingPrice').value,
                            current_stock: document.getElementById('variantCurrentStock').value,
                            shelf_life: document.getElementById('variantShelfLife').value,
                            min_stock_level: document.getElementById('variantMinStock').value,
                            max_stock_level: document.getElementById('variantMaxStock').value,
                            reorder_point: document.getElementById('variantReorderPoint').value,
                          };
                          onSubmitVariant(variantData);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variants Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Added Variants ({variantDetails.length})
                  </h4>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Point</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf Life</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {variantDetails.length > 0 ? (
                        variantDetails.map((variant, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{variant.name}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">{variant.weight}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                variant.current_stock <= variant.min_stock_level 
                                  ? 'bg-red-100 text-red-800' 
                                  : variant.current_stock <= variant.reorder_point 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {variant.current_stock}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 font-semibold">Rs. {variant.cost_price}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 font-semibold">Rs. {variant.selling_price}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">{variant.min_stock_level}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">{variant.max_stock_level || '-'}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">{variant.reorder_point}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">{variant.shelf_life ? `${variant.shelf_life} days` : '-'}</td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => removeVariant(index)}
                                className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all duration-300 group"
                              >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <AlertCircle className="w-12 h-12 text-gray-400" />
                              <p className="text-gray-500 font-medium">No variants added yet</p>
                              <p className="text-sm text-gray-400">Add product variants using the form above</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Submit Button */}
        {selectedCategory && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              onClick={handleSubmitProduct(onSubmitProduct)}
              className={cn(
                "py-3 px-8 flex items-center gap-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                variantDetails.length > 0
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
              disabled={isLoading || variantDetails.length === 0}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Products...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Add All Products ({variantDetails.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;