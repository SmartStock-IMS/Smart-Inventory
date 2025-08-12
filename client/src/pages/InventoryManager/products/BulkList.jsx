import { useEffect, useState } from "react";
import {
  getProductVariants,
  updateProductQuantity,
} from "@services/product-services.js";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";

// eslint-disable-next-line react/prop-types
const BulkList = ({ bulkList, isProcessed, setBulk }) => {
  const navigate = useNavigate();

  const [reqData, setReqData] = useState(bulkList);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log("getProductVariants: ", bulkList);
        const response = await getProductVariants();
        if (response.success) {
          // eslint-disable-next-line react/prop-types
          const bulkItemCodes = bulkList.map((item) => item.item_code);

          const bulkData = response.data
            .filter((data) => bulkItemCodes.includes(data.product_code))
            .map((item) => {
              // eslint-disable-next-line react/prop-types
              const bulkItem = bulkList.find(
                (product) => product.item_code === item.product_code,
              );
              return {
                ...item,
                bulk_qty: bulkItem.quantity,
              };
            });

          console.log("filtered:", bulkData);

          setProducts(bulkData);
        } else {
          console.error("Error fetching products: ", response.message);
        }
      } catch (error) {
        console.error("Error getting products.", error);
      }
    })();
  }, [bulkList]);

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

  const handleBulkSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await updateProductQuantity(reqData);
      if (response.success) {
        toast.success("Bulk updated successfully.");
        setTimeout(() => {
          setIsLoading(false);
          setBulk([]);
          isProcessed(false);
          navigate("/dashboard/bulk");
        }, 2500);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating products.");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-between">
      {products.length > 0 ? (
        <div className="w-full px-3 flex flex-grow overflow-y-auto">
          <table className="w-full h-fit text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="p-4">PRODUCT</th>
                <th className="p-4">COLOR</th>
                <th className="p-4">ITEM CODE</th>
                <th className="p-4">PRICE</th>
                <th className="p-4">QUANTITY</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain rounded-lg border-2 border-gray-200"
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-row gap-2 space-y-1">
                      <div
                        className={`w-6 h-6 rounded-full border-2 border-gray-200`}
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span>{item.color}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{item.product_code}</td>
                  <td className="p-4 font-medium">Rs.{item.price}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.product_code, -1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.bulk_qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_code, 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-full flex flex-row items-center justify-center">
          <FaSpinner size={20} color="black" className="animate-spin" />
        </div>
      )}
      <div className="h-fit w-full border-t border-gray-200">
        <div className="w-full px-4 py-3 flex flex-row items-center justify-end gap-3 text-sm">
          <Link
            to={"/dashboard/bulk"}
            className="w-[15%]"
            onClick={() => isProcessed(false)}
          >
            <button className="w-full py-2 px-6 bg-gray-300 uppercase font-light rounded-md">
              Cancel
            </button>
          </Link>
          <button
            className="w-[15%] py-2 px-6 flex flex-row items-center justify-center gap-3 bg-black text-white uppercase font-light rounded-md"
            onClick={handleBulkSubmit}
            disabled={isLoading}
          >
            Save
            {isLoading && (
              <FaSpinner size={16} color="white" className="animate-spin" />
            )}
          </button>
        </div>
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default BulkList;
