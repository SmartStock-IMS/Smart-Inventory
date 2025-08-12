import { useCallback, useRef, useState } from "react";
import { Box, Trash2, Upload, Plus, Package, Image, Calendar, Hash, Palette, DollarSign, Archive, Clock, CheckCircle, AlertCircle, Sparkles, Star } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

// Mock components for demo
const FileUpload = ({ onChange, resetFileInput }) => {
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
    }
  };

  // Expose reset function to parent
  if (resetFileInput) {
    resetFileInput(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  }

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group-hover:scale-105">
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
        <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
};

const InputWithLabel = ({ label, inputType, inputId, inputName, className = "", register, required = false, ...props }) => {
  const getIcon = () => {
    if (inputName.includes('productCode')) return <Hash className="w-4 h-4" />;
    if (inputName.includes('color')) return <Palette className="w-4 h-4" />;
    if (inputName.includes('Price')) return <DollarSign className="w-4 h-4" />;
    if (inputName.includes('Qty') || inputName.includes('Quantity')) return <Archive className="w-4 h-4" />;
    if (inputName.includes('Date')) return <Calendar className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
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

// Mock services for demo
const uploadImage = async (formData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, data: "mock_image_url" };
};

const addProduct = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, data: { message: "Product added successfully!" } };
};

const removeImage = async (publicId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};

const toast = {
  success: (message) => alert(`✅ ${message}`),
  error: (message) => alert(`❌ ${message}`)
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const AddProduct = () => {
  // init form default values
  const variantDefaultValues = {
    productCode: "",
    color: "",
    unitPrice: 0,
    totalQty: 0,
    minQty: 0,
    mfdDate: "",
    expDate: "",
    productImage: "",
  };
  const productDefaultValues = {
    productName: "",
    category: "",
    noVariants: 0,
    mainImage: "",
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
  const [variantDetails, setVariantDetails] = useState([]);
  const [variantImage, setVariantImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const resetFileInputRef = useRef(null);
  const resetVariantFileInputRef = useRef(null);

  const handleVariantImageUpload = async (file) => {
    setVariantImage(file);
  };

  const uploadImageToStorage = async (file, category) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder_name", category);
      const response = await uploadImage(formData);
      if (!response.success) {
        console.log("file upload error: ", response.error);
        return null;
      } else {
        setUploadedImages((prev) => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.log("Error uploading main image: ", error);
      return null;
    }
  };

  const onSubmitVariant = (variantData) => {
    const variantWithImage = {
      ...variantData,
      productImage: variantImage,
    };

    setVariantDetails((prevVariants) => [...prevVariants, variantWithImage]);

    resetVariant();
    if (resetVariantFileInputRef.current) {
      resetVariantFileInputRef.current();
    }
    setVariantImage(null);
  };

  const removeVariant = (productCode) => {
    setVariantDetails((prevVariants) =>
      prevVariants.filter((variant) => variant.productCode !== productCode),
    );
  };

  const onSubmitProduct = async (productData) => {
    try {
      setIsLoading(true);

      const variantData = await Promise.all(
        variantDetails.map(async (variant) => {
          let variantImageURL =
            "https://res.cloudinary.com/dbdbn416o/image/upload/v1739968044/logo_cnekfn.png";
          if (variant.productImage) {
            const uploadedVariantImage = await uploadImageToStorage(
              variant.productImage,
              productData.category,
            );
            if (uploadedVariantImage) {
              variantImageURL = uploadedVariantImage;
            }
          }

          return {
            product_code: variant.productCode,
            color: variant.color,
            price: parseFloat(variant.unitPrice),
            image: variantImageURL,
            quantity: parseInt(variant.totalQty),
            min_qty: parseInt(variant.minQty),
            mfd_date: variant.mfdDate,
            exp_date: variant.expDate,
          };
        }),
      );

      const productPayload = {
        name: productData.productName,
        category: productData.category,
        main_image: variantData[0].image,
        no_variants: parseInt(productData.noVariants),
        variants: variantData,
      };

      const response = await addProduct(productPayload);
      if (response.success) {
        toast.success(response.data.message);
        resetProduct();
        if (resetFileInputRef.current) {
          resetFileInputRef.current();
        }
        setVariantDetails([]);
      } else {
        await removeUploadedImages();
        toast.error("Failed to add product");
      }
    } catch (error) {
      console.log("Error adding product: ", error);
      toast.error("Failed to add product");
      await removeUploadedImages();
    } finally {
      setIsLoading(false);
    }
  };

  const removeUploadedImages = async () => {
    if (uploadedImages.length > 0) {
      await Promise.all(
        uploadedImages.map(async (publicId) => {
          await removeImage(publicId);
        }),
      );
      setUploadedImages([]);
    }
  }

  const setVariantResetFileInputFn = useCallback((resetFn) => {
    resetVariantFileInputRef.current = resetFn;
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Add New Product</h2>
            <p className="text-white/80">Create and manage product variants</p>
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
          <form onSubmit={handleSubmitProduct(onSubmitProduct)}>
            {/* Product Details Section */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Product Information</h3>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <InputWithLabel
                      label={"Product Name"}
                      inputType={"text"}
                      inputId={"productName"}
                      inputName={"productName"}
                      register={registerProduct}
                      required={true}
                    />
                  </div>
                  <div>
                    <InputWithLabel
                      label={"Category"}
                      inputType={"text"}
                      inputId={"category"}
                      inputName={"category"}
                      register={registerProduct}
                      required={true}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <InputWithLabel
                    label={"Number of Variants"}
                    inputType={"number"}
                    inputId={"noVariants"}
                    inputName={"noVariants"}
                    register={registerProduct}
                    required={true}
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Variant Details Section */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Add Product Variant</h3>
            </div>

            {/* Variant Form */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Variant Image Upload */}
                <div className="lg:col-span-1">
                  <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Variant Image
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <FileUpload
                      onChange={handleVariantImageUpload}
                      resetFileInput={setVariantResetFileInputFn}
                    />
                  </div>
                </div>

                {/* Variant Details Form */}
                <div className="lg:col-span-2">
                  <form onSubmit={handleSubmitVariant(onSubmitVariant)} className="h-full">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 h-full flex flex-col">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <InputWithLabel
                          label={"Product Code"}
                          inputType={"text"}
                          inputId={"productCode"}
                          inputName={"productCode"}
                          register={registerVariant}
                          required={true}
                        />
                        <InputWithLabel
                          label={"Product Weight"}
                          inputType={"text"}
                          inputId={"productWeight"}
                          inputName={"color"}
                          register={registerVariant}
                          required={true}
                        />
                        <InputWithLabel
                          label={"Unit Price"}
                          inputType={"number"}
                          inputId={"productPrice"}
                          inputName={"unitPrice"}
                          register={registerVariant}
                          required={true}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <InputWithLabel
                          label={"Total Quantity"}
                          inputType={"number"}
                          inputId={"productQuantity"}
                          inputName={"totalQty"}
                          register={registerVariant}
                          required={true}
                        />
                        <InputWithLabel
                          label={"Minimum Quantity"}
                          inputType={"number"}
                          inputId={"productMinQuantity"}
                          inputName={"minQty"}
                          register={registerVariant}
                          required={true}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <InputWithLabel
                          label={"Manufacturer Date"}
                          inputType={"date"}
                          inputId={"mfdDate"}
                          inputName={"mfdDate"}
                          register={registerVariant}
                          required={true}
                        />
                        <InputWithLabel
                          label={"Expiration Date"}
                          inputType={"date"}
                          inputId={"expDate"}
                          inputName={"expDate"}
                          register={registerVariant}
                          required={true}
                        />
                      </div>
                      
                      <div className="flex justify-end mt-auto">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add to List
                        </button>
                      </div>
                    </div>
                  </form>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFD Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EXP Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {variantDetails.length > 0 ? (
                      variantDetails.map((variant, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md">
                              <img
                                src={URL.createObjectURL(variant.productImage)}
                                alt="product-image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{variant.productCode}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {variant.color}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 font-semibold">Rs. {variant.unitPrice}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{variant.totalQty}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{variant.minQty}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{variant.mfdDate}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{variant.expDate}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => removeVariant(variant.productCode)}
                              className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all duration-300 group"
                            >
                              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-4 py-12 text-center">
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
        </div>

        {/* Submit Button */}
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
                <FaSpinner className="w-5 h-5 animate-spin" />
                Adding Product...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Add Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;