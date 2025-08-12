import { useCallback, useRef, useState } from "react";
import { FileUpload } from "@components/ui/FileUpload";
import { Box, Trash2 } from "lucide-react";
import { InputWithLabel } from "@components/ui/InputWithLabel";
import { useForm } from "react-hook-form";
import {
  addProduct,
  removeImage,
  uploadImage,
} from "@services/product-services.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";
import { cn } from "@lib/utils.js";

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

  // init react-hook-form methods
  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProduct,
  } = useForm({ defaultValues: productDefaultValues }); // for product-form
  const {
    register: registerVariant,
    handleSubmit: handleSubmitVariant,
    reset: resetVariant,
  } = useForm({ defaultValues: variantDefaultValues }); // for variant-form

  // init local-state-variables
  const [variantDetails, setVariantDetails] = useState([]);
  const [variantImage, setVariantImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]); // track uploaded images
  const resetFileInputRef = useRef(null); // clear file upload input
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
        setUploadedImages((prev) => [...prev, response.data]); // track uploaded image
        return response.data;
      }
    } catch (error) {
      console.log("Error uploading main image: ", error);
      return null;
    }
  };

  // submit variants form
  const onSubmitVariant = (variantData) => {
    // add variant image to variant data
    const variantWithImage = {
      ...variantData,
      productImage: variantImage,
    };

    // add variant to the list
    setVariantDetails((prevVariants) => [...prevVariants, variantWithImage]);

    // reset variant form and input-image
    resetVariant();
    if (resetVariantFileInputRef.current) {
      resetVariantFileInputRef.current(); // reset variant image upload
    }
    setVariantImage(null); // clear variant image state
  };

  const removeVariant = (productCode) => {
    setVariantDetails((prevVariants) =>
      prevVariants.filter((variant) => variant.productCode !== productCode),
    );
  };

  // submit products form
  const onSubmitProduct = async (productData) => {
    try {
      setIsLoading(true); // set loading status

      // upload variant images
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

      console.log("variantData: ", variantData);

      // prepare product data
      const productPayload = {
        name: productData.productName,
        category: productData.category,
        main_image: variantData[0].image,
        no_variants: parseInt(productData.noVariants),
        variants: variantData,
      };

      console.log("productPayload: ", productPayload);

      // submit product data
      const response = await addProduct(productPayload);
      if (response.success) {
        console.log("success response: ", response);
        toast.success(response.data.message);

        // clear form data
        resetProduct(); // clear form input fields
        if (resetFileInputRef.current) {
          resetFileInputRef.current(); // calling reset file-input
        }
        setVariantDetails([]);
      } else {
        await removeUploadedImages();
        console.error("Failed to add product:", response.message);
        if (response.status) {
          console.error("Status code:", response.status);
        }
        toast.error("Failed to add product");
        // TODO: test removeUploadedImages function
      }
    } catch (error) {
      console.log("Error adding product: ", error);
      toast.error("Failed to add product");
      await removeUploadedImages();
    } finally {
      setIsLoading(false); // set loading status
    }
  };

  const removeUploadedImages = async () => {
    // delete orphaned images
    if (uploadedImages.length > 0) {
      await Promise.all(
        uploadedImages.map(async (publicId) => {
          await removeImage(publicId);
        }),
      );
      setUploadedImages([]); // reset images track
    }
  }

  const setVariantResetFileInputFn = useCallback((resetFn) => {
    resetVariantFileInputRef.current = resetFn;
  }, []);

  return (
    <div className="h-full px-2 bg-white rounded-md">
      <div className="h-[10%] px-3 border-b border-gray-500 flex flex-row items-center">
        <div className="flex flex-row items-center gap-3 font-bold">
          <Box className="w-6 h-6" />
          <h2 className="text-lg">Add Product</h2>
        </div>
      </div>
      <div className="h-[90%] pt-2 overflow-y-auto">
        <div className="py-3 px-4 border rounded-lg bg-gray-50">
          <form onSubmit={handleSubmitProduct(onSubmitProduct)}>
            <div className="mt-4 w-full flex flex-col gap-3">
              {/* product: details */}
              <div className="flex flex-row gap-4">
                {/* product: main-image */}
                {/*<div className="w-1/3">*/}
                {/*  <div className="w-full px-4 pb-4 pt-3 rounded-lg border border-gray-200 bg-white">*/}
                {/*    <label className="text-sm flex items-center mb-2 font-medium">*/}
                {/*      Product Main Image*/}
                {/*    </label>*/}
                {/*    <div className="w-full mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">*/}
                {/*      <FileUpload*/}
                {/*        onChange={handleMainImageUpload}*/}
                {/*        resetFileInput={setResetFileInputFn}*/}
                {/*      />*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*</div>*/}
                {/* product: details */}
                <div className="w-full p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <InputWithLabel
                      label={"Product Name"}
                      inputType={"text"}
                      inputId={"productName"}
                      inputName={"productName"}
                      className="mt-2"
                      register={registerProduct}
                      required={true}
                    />
                  </div>
                  <div className="mt-4 flex flex-row items-center gap-4">
                    <InputWithLabel
                      label={"Category"}
                      inputType={"text"}
                      inputId={"category"}
                      inputName={"category"}
                      className="mt-2"
                      register={registerProduct}
                      required={true}
                    />
                    <InputWithLabel
                      label={"No of Variants"}
                      inputType={"number"}
                      inputId={"noVariants"}
                      inputName={"noVariants"}
                      className="mt-2"
                      register={registerProduct}
                      required={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
          {/* variant: details */}
          <div className="w-full mt-3 p-4 border rounded-lg bg-white">
            {/* variant: details-form */}
            <div className="w-full mt-2 flex flex-row gap-4">
              {/* variant: product-image */}
              <div className="w-1/3">
                <div className="w-full px-4 pb-4 pt-3 rounded-lg border border-gray-200 bg-white">
                  <label className="text-sm flex items-center mb-2 font-medium">
                    Variant Image
                  </label>
                  <div className="w-full mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                    <FileUpload
                      onChange={handleVariantImageUpload}
                      resetFileInput={setVariantResetFileInputFn}
                    />
                  </div>
                </div>
              </div>
              {/* variant: details */}
              <div className="w-2/3 p-2">
                <form
                  onSubmit={handleSubmitVariant(onSubmitVariant)}
                  className="flex flex-grow flex-col gap-y-4"
                >
                  <div className="flex flex-grow flex-col gap-y-4">
                    <div className="w-full flex flex-row items-center gap-4">
                      <InputWithLabel
                        label={"Product Code"}
                        inputType={"text"}
                        inputId={"productCode"}
                        inputName={"productCode"}
                        register={registerVariant}
                        required={true}
                      />
                      <InputWithLabel
                        label={"Product Color"}
                        inputType={"text"}
                        inputId={"productColor"}
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
                    <div className="w-full flex flex-row items-center gap-4">
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
                    <div className="w-full flex flex-row items-center gap-4">
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
                  </div>
                  <div className="flex flex-row justify-end">
                    <button
                      type="submit"
                      className="px-10 py-2 rounded-lg border border-black hover:bg-black hover:text-white transition-all duration-300"
                    >
                      Add to List
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/* variant: product-list */}
            <div className="mt-3 p-4 border rounded-lg">
              <div className="border rounded-lg border-gray-400">
                <table className="w-full bg-slate-200 rounded-lg text-sm divide-y divide-gray-400">
                  <thead>
                  <tr className="divide-x divide-gray-400">
                    <th className="p-2.5 text-center">Product Image</th>
                    <th className="p-2.5 text-center">Product Code</th>
                    <th className="p-2.5 text-center">Color Code</th>
                    <th className="p-2.5 text-center">Unit Price (Rs)</th>
                    <th className="p-2.5 text-center">Total Quantity</th>
                    <th className="p-2.5 text-center">Minimum Quantity</th>
                    <th className="p-2.5 text-center">Manufacturer Date</th>
                    <th className="p-2.5 text-center">Expiry Date</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-400">
                  {variantDetails.length > 0 ? (
                    variantDetails.map((variant, index) => (
                      <tr key={index} className="divide-x divide-gray-400">
                        <td className="p-2.5 text-center">
                          <div className="flex flex-row items-center justify-center rounded-lg">
                            <img
                              src={URL.createObjectURL(variant.productImage)}
                              alt="product-image"
                              className="h-24 w-24 aspect-square object-cover rounded-lg shadow-md"
                            />
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          {variant.productCode}
                        </td>
                        <td className="p-2.5 text-center">#{variant.color}</td>
                        <td className="p-2.5 text-end">{variant.unitPrice}</td>
                        <td className="p-2.5 text-center">{variant.totalQty}</td>
                        <td className="p-2.5 text-center">{variant.minQty}</td>
                        <td className="p-2.5 text-center">{variant.mfdDate}</td>
                        <td className="p-2.5 text-center">{variant.expDate}</td>
                        <td>
                          <div className="flex flex-row items-center justify-center">
                            <div
                              onClick={() => removeVariant(variant.productCode)}
                              className="p-2 rounded-lg hover:bg-red-100 hover:border hover:border-red-200 hover:text-red-400 transition-all duration-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-2.5 text-center">
                        No variants added.
                      </td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div
            className="pt-2 flex flex-row items-center justify-end"
            style={{
              pointerEvents: variantDetails.length > 0 ? "auto" : "none",
            }}
          >
            <button
              type="submit"
              className={cn(
                "py-2 px-4 flex flex-row items-center justify-center gap-2 border rounded-lg bg-black text-white",
                variantDetails.length > 0
                  ? "bg-black text-white"
                  : "bg-gray-300",
              )}
              disabled={isLoading}
            >
              Add Product
              {isLoading && (
                <FaSpinner
                  size={20}
                  color="white"
                  className="ms-3 animate-spin"
                />
              )}
            </button>
          </div>
          <ToastContainer autoClose={2000} />
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
