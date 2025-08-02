import { useEffect, useState } from "react";
import { Search, ExternalLink, Trash2, List} from "lucide-react";
import { Link } from "react-router-dom";
import {deleteProduct, getAllProducts, getProducts} from "@services/product-services";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@components/ui/Dialog.jsx";
import OrderDetails from "@components/dashboard/orders/OrderDetails.jsx";
import { cn } from "@lib/utils.js";
import {FaSpinner} from "react-icons/fa";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [limit] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getProducts();
        if (response.success) {
          setAllProducts(response.data);
        } else {
          console.error("Error fetching products: ", response.message);
        }
      } catch (error) {
        console.error("Error getting products.", error);
      }
    })();

    fetchProducts(cursor, limit);
  }, [cursor, limit]);

  const fetchProducts = async (cursor, limit) => {
    try {
      const response = await getAllProducts(cursor, limit);
      // console.log("response: ", response); //testing
      setProducts(response.data);
      setHasMore(response.nextCursor !== null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      setIsLoading(true);
      const result = await deleteProduct(productId);
      console.log("result: ", result);
      if (result.success) {
        console.log("Product deleted successfully");
        toast.success("Product deleted successfully");
        await fetchProducts(cursor, limit);
      } else {
        console.log("Error deleting product");
        toast.error("Error deleting product");
      }
    } catch (error) {
      console.error("Error remove product: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = allProducts.filter((item) => {

    return searchQuery
      ? item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variants.some((variant) =>
        variant.product_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : true;
  });

  return (
    <div className="h-full w-full p-2 bg-white rounded-md">
      <div className="h-[10%] pb-2 px-3 flex flex-row items-center justify-between border-b border-gray-500">
        <div className="w-1/3 flex flex-row items-center gap-2">
          <List className="h-6 w-6" />
          <h2 className="text-lg font-bold">Product List</h2>
        </div>
        <div className="w-1/3 px-3 flex flex-row items-center gap-1 text-sm bg-gray-200 rounded-md">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search Products by code or category"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-2.5 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      <div className="h-[90%] overflow-y-auto">
        {products.length > 0 ? (
          <table className="w-full table-auto border-collapse text-sm">
            <tbody>
            {filteredProducts.map((product, index) => (
              <tr
                key={index}
                className="border-b border-slate-300 hover:bg-gray-50"
              >
                <td className="px-4 py-2">
                  <img
                    src={product.main_image}
                    alt={product.name}
                    className="w-16 h-16 p-1 object-contain rounded-lg border"
                  />
                </td>
                <td className="px-4 py-2">
                  <Link
                    to={`/dashboard/product/${product.id}`}
                    state={product}
                    className="text-blue-500 hover:underline"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-center">{product.category}</td>
                <td className="px-4 py-2 text-center">{product.no_variants}</td>
                <td className="px-4 py-2 text-center">
                  <div className="flex flex-row items-center gap-2">
                    {/* Show Product Button */}
                    <Link
                      to={`/dashboard/product/${product.id}`}
                      state={product}
                      className="px-4 py-1.5 flex flex-row items-center justify-center gap-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    {/* Remove Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="flex flex-row items-center justify-center gap-2 px-3 py-1.5 text-red-500 border border-red-500 rounded-lg text-sm font-medium hover:bg-red-50"
                          // onClick={() => handleRemoveProduct(product.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
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
                              {product.name}
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
                              onClick={() => handleRemoveProduct(product.id)}
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
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        ) : (
          <div className="h-full flex flex-row items-center justify-center">
            <FaSpinner size={20} color="black" className="animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
