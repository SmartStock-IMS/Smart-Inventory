import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCustomer } from "@services/user-services";
import { getCustomerByUserCode } from "@services/customer-services";
import {getQuotationsByCustomer} from "@services/quotation-service.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@components/ui/Dialog.jsx";
import OrderDetails from "@components/dashboard/orders/OrderDetails.jsx";
import { ChevronLeft } from "lucide-react";

const CustomerDetails = () => {
  const { user_code } = useParams();
  const [customer, setCustomer] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch customer data using the provided user_code
    const fetchCustomer = async () => {
      try {
        const response = await getCustomerByUserCode(user_code);
        if (response.success) {
          console.log("customer: ", response);
          return response.data.customer;
          // setCustomer(response.data);
        } else {
          setError(response.message || "Error fetching customer data.");
          return null;
        }
      } catch (err) {
        setError(err.message || "Error fetching customer data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer().then((data) => {setCustomer(data)});

    (async () => {
      try {
        const response = await getQuotationsByCustomer(user_code);
        console.log("response: ", response); //testing
        setQuotations(response.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [user_code]);

  if (loading) {
    return <div className="container mx-auto p-6">Loading customer details...</div>;
  }

  return (
    <div className="h-full px-2">
      <div className="h-[6%] px-2 flex flex-row items-center">
        <Link to="/dashboard/customer-list" className="flex flex-row items-center gap-1 text-blue-500 hover:underline underline-offset-4 inline-block">
          <ChevronLeft className="w-5 h-5" />
          <p>Back to Customer List</p>
        </Link>
      </div>
      <div className="h-[94%] w-full p-2 flex flex-col items-center justify-center gap-3">
        <div className="h-fit w-full">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="w-full flex items-start justify-between">
              {/* Display customer photo if available, fallback to a placeholder */}
              <div>
                <h1 className="text-xl font-bold mb-4">{customer.first_name} {customer.last_name}</h1>
                <div className="space-y-2">
                  <p><strong>User Code:</strong> {customer.user_code}</p>
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Phone:</strong> {customer.contact1}</p>
                  <p><strong>Address:</strong> {customer.address_line1}, {customer.city}, {customer.province}</p>
                </div>
              </div>
              <div className="flex flex-row items-center justify-end">
                <Link to={`/dashboard/customer/edit/${user_code}`} className="py-2 px-4 border rounded-md bg-black text-white">Edit Details</Link>
              </div>
            </div>

            {/* {customer.transactions && customer.transactions.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-6 mb-4">Past Transactions</h2>
            <div className="space-y-4">
              {customer.transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </>
        )} */}
          </div>
        </div>
        <div className="flex flex-grow flex-col w-full p-4 bg-white rounded-md overflow-y-auto">
          <div className="mb-3">
            <h2 className="text-lg font-bold">Order History</h2>
          </div>
          {quotations.length > 0 ? (
            <table className="w-full divide-y divide-gray-200 text-sm">
              <tbody>
              {quotations.map((item) => {
                return (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-4 text-center">{new Date(item.quotation_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">{item.quotation_id}</td>
                    <td className="py-3 px-4 text-center">{item.customer_id}</td>
                    <td className="py-3 px-4 text-center">{item.sales_rep_id}</td>
                    <td className="py-3 px-4 text-right">
                      Rs. {item.net_total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">{item.no_items}</td>
                    <td className="py-3 px-4 text-center">{item.status}</td>
                    {/*<td className="py-2 px-4 flex flex-row items-center justify-center">*/}
                    {/*  <Dialog>*/}
                    {/*    <DialogTrigger asChild>*/}
                    {/*      <button*/}
                    {/*        // onClick={() => handleOrderView(item)}*/}
                    {/*        className="px-6 py-1 border rounded bg-black text-white hover:bg-black/80"*/}
                    {/*      >*/}
                    {/*        View*/}
                    {/*      </button>*/}
                    {/*    </DialogTrigger>*/}
                    {/*    <DialogContent className="h-[90%] max-w-[90%] overflow-y-auto">*/}
                    {/*      <DialogHeader>*/}
                    {/*        <DialogTitle>*/}
                    {/*          <p>Order Details - {item.quotation_id}</p>*/}
                    {/*        </DialogTitle>*/}
                    {/*        <DialogDescription>*/}
                    {/*          <OrderDetails item={item} />*/}
                    {/*        </DialogDescription>*/}
                    {/*      </DialogHeader>*/}
                    {/*    </DialogContent>*/}
                    {/*  </Dialog>*/}
                    {/*</td>*/}
                  </tr>
                )
              })}
              </tbody>
            </table>
          ) : (
            <div>No Data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
