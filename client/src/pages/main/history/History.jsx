import { useEffect, useState } from "react";
import { getQuotationsBySalesRep } from "@services/quotation-service.js";
import { useAuth } from "../../../context/auth/AuthContext.jsx";
import {FaSpinner} from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@components/ui/Dialog.jsx";
import OrderDetails from "@components/dashboard/orders/OrderDetails.jsx";

const History = () => {
  const { user } = useAuth();

  // const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await getQuotationsBySalesRep(user.user_code);
        if (!response.success) {
          console.log("Error fetching Quotations");
        }
        setOrders(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user.user_code]);

  // const filteredOrders = orders.filter(order =>
  //   order.id.includes(searchQuery) ||
  //   order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   order.date.includes(searchQuery)
  // );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-24 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      {/* history: search */}
      {/*<div className="relative mb-6">*/}
      {/*  <input*/}
      {/*    type="text"*/}
      {/*    placeholder="Search..."*/}
      {/*    className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"*/}
      {/*    value={searchQuery}*/}
      {/*    onChange={(e) => setSearchQuery(e.target.value)}*/}
      {/*  />*/}
      {/*  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">*/}
      {/*    <svg*/}
      {/*      className="w-5 h-5 text-gray-400"*/}
      {/*      fill="none"*/}
      {/*      stroke="currentColor"*/}
      {/*      viewBox="0 0 24 24"*/}
      {/*    >*/}
      {/*      <path*/}
      {/*        strokeLinecap="round"*/}
      {/*        strokeLinejoin="round"*/}
      {/*        strokeWidth="2"*/}
      {/*        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"*/}
      {/*      />*/}
      {/*    </svg>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {/* history: quotation-list */}
      {isLoading ? (
        <div className="mt-3 flex flex-row items-center justify-center">
          <FaSpinner size={20} color="black" className="animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
        {orders.map((order, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 ${
              index % 2 === 0 ? "bg-gray-100" : "bg-white"
            }`}
          >
            <div className="w-1/3">
              <span className="font-mono">#{order.quotation_id}</span>
            </div>
            <div className="w-1/3">
              <span className="text-sm">
                {order.quotation_date.split("T")[0]}
              </span>
            </div>
            <div className="w-1/3">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="w-3/4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                    onClick={() =>
                      console.log(`View invoice for order ${order.id}`)
                    }
                  >
                    View
                  </button>
                </DialogTrigger>
                <DialogContent className="h-screen lg:h-[90%] max-w-scree lg:max-w-[90%] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Order Details - {order.quotation_id}</DialogTitle>
                    <DialogDescription>
                      <OrderDetails item={order} />
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default History;
