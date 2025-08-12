import { cn } from "@lib/utils.js";
import { useEffect, useState } from "react";
import {deleteProduct, getAllProducts, getProducts, updateProductQuantity} from "@services/product-services.js";
import {Link, useNavigate, Outlet} from "react-router-dom";
import {FaSearch, FaSpinner} from "react-icons/fa";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/Dialog.jsx";
import { Search, Minus, Plus, Layers } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BulkList from "./BulkList.jsx";

const AddBulk = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productBulk, setProductBulk] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedItemCode, setSelectedItemCode] = useState("");
  const [isProcessed, setIsProcessed] = useState(false);

  // fetch db-products
  useEffect(() => {
    (async () => {
      try {
        const response = await getProducts();
        if (response.success) {
          setProducts(response.data);
        } else {
          console.error("Error fetching products: ", response.message);
        }
      } catch (error) {
        console.error("Error getting products.", error);
      }
    })();
  }, []);

  useEffect(() => {
    const filteredProducts = filterProducts(products, searchQuery);
    const filteredCategoriesMap = filteredProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    const filterCategories = Object.entries(filteredCategoriesMap).map(
      ([name, products]) => ({
        name,
        products,
      }),
    );

    const filteredCategories = selectedCategory
      ? filterCategories.filter(
        (category) => category.name === selectedCategory.value
      )
      : filterCategories;

    setFilteredCategories(filteredCategories);
  }, [products, searchQuery, selectedCategory]);

  const categoriesMap = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const categories = Object.entries(categoriesMap).map(([name, products]) => ({
    name,
    products,
  }));

  const filterProducts = (products, keyword) => {
    if (!keyword) return products;
    return products.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(keyword.toLowerCase());

      const variantMatch = product.variants.some((variant) =>
        variant.product_code.toLowerCase().includes(keyword.toLowerCase())
      );

      return nameMatch || variantMatch;
    });
  };

  const handleCategoryChange = (selectedOption) => {
    if (selectedOption.value === "") {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(selectedOption);
    }
  };

  const handleAddBulk = (itemCode, quantity) => {
    setProductBulk((prev) => {
      const updatedBulk = Array.isArray(prev) ? [...prev] : [];

      return [...updatedBulk, { item_code: itemCode, quantity }];
    });

    setQuantity(1);
    setSelectedItemCode("");
    toast.success("Added to bulk order!");
  };

  const handleSelectColor = (code) => {
    // setSelectedColor(color);
    setSelectedItemCode(code);
  };

  // function: handle qty increment
  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };
  // function: handle qty decrement
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleDialogClose = () => {
    setSelectedItemCode(""); // reset item_code value when modal closing
    setQuantity(1);
  }

  const handleBulkAddFunction = async () => {
    // try {
    //   const response = await updateProductQuantity(productBulk);
    //   if (response.success) {
    //     toast.success("Bulk updated successfully.");
    //   }
    // } catch (error) {
    //   console.error(error);
    // }
    setIsProcessed(true);

    // navigate("/dashboard/bulk/add", {
    //   state: productBulk
    // });
  }

  return (
    <div className="w-full h-full p-2 flex flex-col gap-2 bg-white rounded-md">
      {/* bulk: header */}
      <div className="h-[10%] pb-2 px-3 flex flex-row items-center justify-between border-b border-gray-500">
        <div className="w-1/3 flex flex-row items-center gap-2">
          <Layers className="w-6 h-6" />
          <h2 className="text-lg font-bold">Add Bulk Product</h2>
        </div>
        <div className="w-2/3 flex flex-row items-center gap-3">
          <div className="w-2/4 px-3 flex flex-row items-center gap-1 text-sm bg-gray-200 rounded-md">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-2.5 bg-transparent focus:outline-none"
            />
          </div>
          <div className="w-2/4 flex flex-row items-center justify-between">
            <div className="w-2/3 px-2 bg-gray-200 rounded-md text-sm">
              <select
                value={selectedCategory?.value || ""}
                onChange={(e) =>
                  handleCategoryChange(
                    e.target.value
                      ? { value: e.target.value, label: e.target.value }
                      : { value: "", label: "All Categories" },
                  )
                }
                className="w-full p-3 bg-transparent focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option className="" key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/3 px-3 flex flex-grow items-center justify-end">
              <button
                className={cn(
                  "py-2.5 px-4 text-sm bg-black text-white hover:bg-black/80 rounded-md",
                  productBulk.length > 0 ? "bg-black" : "pointer-events-none bg-black/50",
                )}
                onClick={handleBulkAddFunction}
              >
                Add Bulk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* bulk: display data */}
      <div className="h-[90%] rounded-md overflow-y-auto">
        {isProcessed ? (
          <BulkList bulkList={productBulk} isProcessed={setIsProcessed} setBulk={setProductBulk} />
        ) : (
          <div className="h-full">
            {products.length > 0 ? (
              <div className="py-2 flex flex-grow flex-col gap-4">
                {filteredCategories.map((category, index) => {
                  return (
                    <div key={index} className="flex flex-col gap-4">
                      <div className="bg-gray-200 rounded-md">
                        <h2 className="py-2 px-4 text-sm font-medium">
                          {category.name}
                        </h2>
                      </div>
                      {category.products.length > 0 ? (
                        <div className="pb-3 px-3 grid grid-cols-6 gap-6">
                          {category.products.map((product) => (
                            <div key={product.id} className="flex flex-col gap-2">
                              <Dialog onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
                                <DialogTrigger asChild>
                                  <div>
                                    <button
                                      className="w-full shadow aspect-square rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                                    >
                                      <img
                                        src={product.main_image}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                      />
                                    </button>
                                    <span className="mt-2 px-2 text-xs text-gray-600 line-clamp-2 font-medium text-center">
                                      {product.name}
                                    </span>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-[40%] flex flex-col">
                                  <div className="h-fit py-2 flex flex-col gap-1">
                                    <DialogTitle>
                                      <p className="text-lg text-center font-medium">
                                        Add product to bulk update list
                                      </p>
                                    </DialogTitle>
                                    <DialogDescription>
                                      <p className="text-center text-sm font-normal">
                                        {product.name}
                                      </p>
                                    </DialogDescription>
                                  </div>
                                  <div className="flex flex-grow flex-col justify-between">
                                    <div className="flex flex-grow flex-col">
                                      <div className="h-fit w-full flex flex-row items-center justify-center">
                                        <img
                                          src={product.main_image}
                                          alt={product.name}
                                          className="w-56 h-56 p-2 object-contain border rounded-lg shadow"
                                        />
                                      </div>
                                      <div className="py-4 flex flex-grow flex-col justify-between items-center gap-6">
                                        <div className="w-5/6 flex flex-row items-center justify-center">
                                          <div className="flex flex-col gap-4">
                                            <p className="text-center text-sm text-gray-600 uppercase font-light">
                                              {selectedItemCode || "n/a"}
                                            </p>
                                            <div className="flex flex-wrap items-center justify-center gap-2">
                                              {product.variants.map((variant, index) => (
                                                <button
                                                  key={index}
                                                  onClick={() => handleSelectColor(variant.product_code)}
                                                  className={cn(
                                                    "w-16 h-16 p-1 border rounded-2xl",
                                                    selectedItemCode === variant.product_code
                                                      ? "ring-2 ring-black"
                                                      : "",
                                                  )}
                                                  style={{ backgroundColor: variant.color }}
                                                >
                                                  <span className="text-xs text-black">{variant.product_code}</span>
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="w-full flex flex-row items-center justify-center">
                                          <div className="w-full flex items-center justify-center">
                                            <button
                                              onClick={handleDecrement}
                                              className="p-2 border border-gray-400 rounded-s bg-gray-200 hover:bg-gray-300 transition-all duration-300"
                                            >
                                              <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                              type="text"
                                              value={quantity}
                                              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                                              className="w-2/12 py-1 text-center border-y border-gray-400 focus:outline-none"
                                            />
                                            <button
                                              onClick={handleIncrement}
                                              className="p-2 border border-gray-400 rounded-e bg-gray-200 hover:bg-gray-300 transition-all duration-300"
                                            >
                                              <Plus className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="h-fit mt-2 flex flex-row items-center justify-center gap-4">
                                      <div className="w-1/5">
                                        <button
                                          className={cn(
                                            "w-full border p-2 rounded-md bg-gray-950 text-white",
                                            "hover:bg-gray-800",
                                          )}
                                          onClick={() => handleAddBulk(selectedItemCode, quantity)}
                                        >
                                          Add
                                        </button>
                                      </div>
                                      <DialogClose asChild>
                                        <button className="w-1/5 border border-gray-300 p-2 rounded-md hover:border-gray-500">
                                          Cancel
                                        </button>
                                      </DialogClose>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No products found.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-row items-center justify-center">
                <FaSpinner size={20} color="black" className="animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position={"top-center"} autoClose={1000} />
    </div>
  );
};

export default AddBulk;
