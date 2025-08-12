import { useEffect, useState } from "react";
import { getQuotations } from "@services/quotation-service.js";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@components/ui/Dialog.jsx";
import OrderDetails from "@components/InventoryManager/orders/OrderDetails.jsx";
import { BookOpenCheck } from "lucide-react";

const OrderSummary = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchQuotations().then((data) => {
      if (data && Array.isArray(data)) {
        setQuotations(data);
      }
    });
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await getQuotations();
      if (response.success) {
        console.log("qt: ", response.data.data);
        return response.data.data || []; // Return empty array if data is null/undefined
      } else {
        console.error("Error fetching quotations");
        return [];
      }
    } catch (error) {
      console.error(error);
      return []; // Return empty array on error
    }
  }

  const handleOrderView = (orderItem) => {
    console.log("Order view: ", orderItem);
    setIsOpen(true);
    setSelectedItem(orderItem);
  };

  const statusOptions = ["All", ...new Set((quotations || []).map((item) => item.status))];

  const filteredQuotations = (quotations || []).filter((item) => {
    const matchesSearch = searchQuery
      ? item.quotation_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sales_rep_id.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    console.log("match: ", matchesSearch);

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setIsOpen(false);
    fetchQuotations().then((data) => {
      if (data && Array.isArray(data)) {
        setQuotations(data);
      }
    });
  }

  return (
    <div className="w-full h-full px-4 py-2 bg-white rounded">
      {isOpen ? (
        <div className="h-full overflow-y-auto">
          <OrderDetails item={selectedItem} changeOpen={() => handleRefresh()} />
        </div>
      ) : (
        <div className="h-full">
          <div className="h-[10%] pb-2 ps-4 flex flex-row items-center gap-2 border-b border-gray-500">
            <BookOpenCheck className="w-6 h-6" />
            <h2 className="text-lg font-bold">Order Summary</h2>
          </div>
          <div className="h-[90%] mt-4">
            <div className="h-full flex flex-col gap-3">
              <div className="flex flex-row items-center justify-between">
                <div className="w-1/2">
                  <div className="w-fit pe-4 border rounded-md">
                    <select
                      className="p-2 text-sm focus-visible:outline-none"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    className="w-full py-2 px-4 text-sm border border-gray-300 rounded-md"
                    placeholder="Seach Orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="h-full overflow-y-auto">
                <table className="w-full divide-y divide-gray-200 text-sm">
                  <thead>
                  <tr className="border-b-2">
                    <th className="py-2">Order Date</th>
                    <th className="py-2">Order Id</th>
                    <th className="py-2">Customer Id</th>
                    <th className="py-2">Sales Rep Id</th>
                    <th className="py-2">Total Amount</th>
                    <th className="py-2">No of Products</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                  </thead>
                  <tbody className="">
                  {filteredQuotations.map((item) => {
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-4 text-center">{new Date(item.quotation_date).toLocaleDateString()}</td>
                        <td className="py-2 px-4 text-center">{item.quotation_id}</td>
                        <td className="py-2 px-4 text-center">{item.customer_id}</td>
                        <td className="py-2 px-4 text-center">{item.sales_rep_id}</td>
                        <td className="py-2 px-4 text-right">
                          Rs. {item.net_total.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-center">{item.no_items}</td>
                        <td className="py-2 px-4 text-center">{item.status}</td>
                        <td className="py-2 px-4 flex flex-row items-center justify-center">
                          <div>
                            <button
                              onClick={() => handleOrderView(item)}
                              className="px-6 py-1 border rounded bg-black text-white hover:bg-black/80"
                            >
                              View
                            </button>
                          </div>
                          {/*<Dialog open={isOpen} onOpenChange={setIsOpen}>*/}
                          {/*  <DialogTrigger asChild>*/}
                          {/*    <button*/}
                          {/*      onClick={() => handleOrderView(item)}*/}
                          {/*      className="px-6 py-1 border rounded bg-black text-white hover:bg-black/80"*/}
                          {/*    >*/}
                          {/*      View*/}
                          {/*    </button>*/}
                          {/*  </DialogTrigger>*/}
                          {/*  <DialogContent className="h-[90%] max-w-[90%] overflow-y-auto">*/}
                          {/*    <DialogHeader>*/}
                          {/*      <DialogTitle>*/}
                          {/*        <p>Order Details - {item.quotation_id}</p>*/}
                          {/*      </DialogTitle>*/}
                          {/*      <DialogDescription>*/}
                          {/*        <OrderDetails item={item} closeModal={() => setIsOpen(false)} />*/}
                          {/*      </DialogDescription>*/}
                          {/*    </DialogHeader>*/}
                          {/*  </DialogContent>*/}
                          {/*</Dialog>*/}
                        </td>
                      </tr>
                    )
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
