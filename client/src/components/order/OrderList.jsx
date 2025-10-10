import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchOrders } from "../../services/order-service.js";

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  // get Orders
  useEffect(() => {
    //TODO: add pagination
    const handleGetOrders = async () => {
      const response = await fetchOrders("PENDING");
      if (response.success) {
        console.log("orders: ", response.data);
        // setItems(response.data);

        const order = {
          id: 122,
          subtotal: 0,
          discount: 0,
          selected_items: [
            {
              id: 1,
              category: "APPLICATORS",
              name: "COSMETIC APPLICATOR",
              main_image:
                "https://res.cloudinary.com/dbdbn416o/image/upload/v1739968044/logo_cnekfn.png",
              no_variants: 1,
              createdAt: "2025-02-02T00:00:00.000Z",
              updatedAt: "2025-02-02T00:00:00.000Z",
              variants: [
                {
                  id: 1,
                  product_id: 1,
                  product_code: "CA",
                  color: "#",
                  price: "0.00",
                  image: null,
                  quantity: 50,
                  min_qty: 10,
                  mfd_date: "2025-01-01T00:00:00.000Z",
                  exp_date: "2099-12-31T00:00:00.000Z",
                  createdAt: "2025-02-02T00:00:00.000Z",
                  updatedAt: "2025-02-02T00:00:00.000Z",
                },
              ],
              product_id: 1,
              product_code: "CA",
              color: "#",
              price: "0.00",
              image: null,
              quantity: 50,
              min_qty: 10,
              mfd_date: "2025-01-01T00:00:00.000Z",
              exp_date: "2099-12-31T00:00:00.000Z",
            },
            {
              id: 3,
              category: "BLUSH",
              name: "INGLOT CREAM BLUSH",
              main_image:
                "https://res.cloudinary.com/dbdbn416o/image/upload/v1739968044/logo_cnekfn.png",
              no_variants: 1,
              createdAt: "2025-02-02T00:00:00.000Z",
              updatedAt: "2025-02-02T00:00:00.000Z",
              variants: [
                {
                  id: 3,
                  product_id: 3,
                  product_code: "ICB98",
                  color: "#000",
                  price: "0.00",
                  image: null,
                  quantity: 50,
                  min_qty: 10,
                  mfd_date: "2025-01-01T00:00:00.000Z",
                  exp_date: "2099-12-31T00:00:00.000Z",
                  createdAt: "2025-02-02T00:00:00.000Z",
                  updatedAt: "2025-02-02T00:00:00.000Z",
                },
                {
                  id: 4,
                  product_id: 3,
                  product_code: "ICBL98",
                  color: "#000",
                  price: "0.00",
                  image: null,
                  quantity: 50,
                  min_qty: 10,
                  mfd_date: "2025-01-01T00:00:00.000Z",
                  exp_date: "2099-12-31T00:00:00.000Z",
                  createdAt: "2025-02-02T00:00:00.000Z",
                  updatedAt: "2025-02-02T00:00:00.000Z",
                },
                {
                  id: 5,
                  product_id: 3,
                  product_code: "ICBL99",
                  color: "#000",
                  price: "0.00",
                  image: null,
                  quantity: 50,
                  min_qty: 10,
                  mfd_date: "2025-01-01T00:00:00.000Z",
                  exp_date: "2099-12-31T00:00:00.000Z",
                  createdAt: "2025-02-02T00:00:00.000Z",
                  updatedAt: "2025-02-02T00:00:00.000Z",
                },
              ],
              product_id: 3,
              product_code: "ICB98",
              color: "#000",
              price: "0.00",
              image: null,
              quantity: 50,
              min_qty: 10,
              mfd_date: "2025-01-01T00:00:00.000Z",
              exp_date: "2099-12-31T00:00:00.000Z",
            },
          ],
          customer_code: "ts1100",
          status: "CREATED",
          created_at: new Date(),
        };
        setOrders([order]);
      } else {
        // toast.error("Error loading products");
        console.error(response.message);
      }
    };
    console.log("==== getAllProducts ==");
    handleGetOrders();
  }, []);

  const handleClickOpenOrder = async () => {
    navigate("../view-quotation");
  };

  return (
    <div className="bg-white flex flex-col items-center py-8 pt-32">
      <div className="max-w-7xl ">
        <h1 className="text-3xl md:text-5xl font-medium text-center text-black mb-6">
          Order Listing
        </h1>
        <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="p-4">ORDER NO</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">SUB-TOTAL</th>
                <th className="p-4">DATE</th>
                <th className="p-4">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-gray-600">{item.id}</td>
                  <td className="p-4 text-gray-600">{item.status}</td>
                  <td className="p-4 font-medium">Rs.{item.subtotal}</td>
                  <td className="p-4 font-medium">
                    {item.created_at.toDateString()}
                  </td>
                  <td className="p-4 font-medium">
                    <button
                      onClick={() => handleClickOpenOrder(item)}
                      className="w-full bg-black text-white py-1 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
