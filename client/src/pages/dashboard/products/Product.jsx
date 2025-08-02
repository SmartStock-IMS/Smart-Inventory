import { useState } from "react";
import { useLocation } from "react-router-dom";
import { InputWithLabel } from "@components/ui/InputWithLabel";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/Dialog.jsx";
import { cn } from "@lib/utils.js";
import { deleteVariant, updateProduct } from "@services/product-services.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductPage = () => {
  const location = useLocation();
  const initProduct = location.state || {};

  const [isEditing, setIsEditing] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState(initProduct);
  const [updatedVariants, setUpdatedVariants] = useState(
    initProduct.variants || [],
  );

  // handle if product is missing
  if (!initProduct || Object.keys(initProduct).length === 0) {
    return <div className="text-center text-red-500">Product not found</div>;
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
      }
    } catch (error) {
      console.error("Error updating product", error);
      toast.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleVariantDelete = async (index, id) => {
    try {
      const response = await deleteVariant(initProduct.id, id);
      if (response.success) {
        console.log(response);
        toast.success("Product variant deleted!");
      }
    } catch (error) {
      console.error("Error updating product", error);
      toast.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full h-full mx-auto p-4 bg-white shadow-lg rounded-md overflow-y-auto">
      {/* Product Details */}
      <div className="w-full p-4 flex flex-row gap-4 rounded-lg bg-slate-50">
        {/* product: main-image */}
        <div className="w-1/3">
          <img
            src={updatedProduct?.main_image}
            alt={updatedProduct?.name}
            className="w-40 h-40 object-contain rounded-lg border shadow-lg"
          />
        </div>
        {/* product: details */}
        <div className="w-2/3">
          <div>
            <InputWithLabel
              label={"Product Name"}
              inputType={"text"}
              inputId={"productName"}
              inputName={"product_name"}
              value={updatedProduct.name || ""}
              onChange={handleProductChange}
              readOnly={!isEditing}
              className={
                isEditing
                  ? "focus-visible:outline-1"
                  : "bg-white pointer-events-none"
              }
            />
          </div>
          <div className="mt-4 flex flex-row items-center gap-4">
            <InputWithLabel
              label={"Category"}
              inputType={"text"}
              inputId={"category"}
              inputName={"category"}
              value={updatedProduct.category || ""}
              onChange={handleVariantChange}
              readOnly={!isEditing}
              className={
                isEditing
                  ? "focus-visible:outline-1"
                  : "bg-white pointer-events-none"
              }
            />
            <InputWithLabel
              label={"No of Variants"}
              inputType={"number"}
              inputId={"noVariants"}
              inputName={"no_variants"}
              value={updatedProduct.no_variants || ""}
              onChange={handleVariantChange}
              readOnly={!isEditing}
              className={
                isEditing
                  ? "focus-visible:outline-1"
                  : "bg-white pointer-events-none"
              }
            />
          </div>
        </div>
      </div>
      {/* Variant Details */}
      <div className="w-full mt-3">
        <div className="flex flex-col gap-4">
          <div className="border rounded-lg border-gray-400">
            <table className="w-full bg-slate-100 rounded-lg text-sm divide-y divide-gray-400">
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
                  <th className="p-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400">
                {updatedVariants.map((variant, index) => (
                  <tr key={index} className="divide-x divide-gray-400">
                    <td className="w-1/12 p-2 text-center">
                      <div className="flex flex-row items-center justify-center rounded-lg">
                        <img
                          src={variant.image}
                          alt="product-image"
                          className="h-16 w-16 aspect-square object-cover rounded-lg shadow-md"
                        />
                      </div>
                    </td>
                    {[
                      { key: "product_code", type: "text" },
                      { key: "color", type: "text" },
                      { key: "price", type: "number" },
                      { key: "quantity", type: "number" },
                      { key: "min_qty", type: "number" },
                      { key: "mfd_date", type: "date" },
                      { key: "exp_date", type: "date" },
                    ].map(({ key, type }) => (
                      <td key={key} className="w-1/12 h-full p-2 text-center">
                        <input
                          type={type}
                          className="w-full px-2 py-4 rounded-md border text-center focus-visible:outline-none"
                          value={variant[key] || ""}
                          onChange={(e) =>
                            handleVariantChange(index, key, e.target.value)
                          }
                          readOnly={!isEditing}
                        />
                      </td>
                    ))}
                    <td className="w-[3%] text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="p-2">
                            <Trash2 className="w-5 h-5 text-red-400 hover:scale-110 transition duration-200" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="">
                          <DialogHeader>
                            <DialogTitle>
                              <p className="text-center">
                                Confirm deleting product
                              </p>
                            </DialogTitle>
                            <DialogDescription>
                              <p className="mt-1 text-center text-base font-normal">
                                Product ID: {variant.product_code}
                              </p>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-2 flex flex-row items-center justify-center gap-4">
                            <DialogClose asChild>
                              <button
                                className={cn(
                                  "w-1/5 border p-2 rounded-md bg-gray-950 text-white",
                                  "hover:bg-gray-800",
                                )}
                                onClick={() =>
                                  handleVariantDelete(index, variant.id)
                                }
                              >
                                Yes
                              </button>
                            </DialogClose>
                            <DialogClose asChild>
                              <button className="w-1/5 border border-gray-300 p-2 rounded-md hover:border-gray-500">
                                No
                              </button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        {/*<div className="mt-4 flex justify-end gap-4">*/}
        {/*  <button*/}
        {/*    className="w-1/12 px-4 py-2 bg-gray-500 text-white rounded-md shadow-md"*/}
        {/*    onClick={() => setIsEditing(!isEditing)}*/}
        {/*  >*/}
        {/*    {isEditing ? "Cancel" : "Edit"}*/}
        {/*  </button>*/}
        {/*  {isEditing && (*/}
        {/*    <button*/}
        {/*      className="w-1/12 px-4 py-2 bg-black text-white rounded-md shadow-md hover:bg-black/80"*/}
        {/*      onClick={handleProductUpdate}*/}
        {/*    >*/}
        {/*      Save*/}
        {/*    </button>*/}
        {/*  )}*/}
        {/*</div>*/}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProductPage;
