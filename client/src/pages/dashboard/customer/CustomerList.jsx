import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {deleteCustomer, getAllCustomersNoPage} from "@services/customer-services";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import {FaSpinner} from "react-icons/fa";
import { BookUser } from "lucide-react";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers().then(data => {setCustomers(data)});
  }, []);

  const fetchCustomers = async () => {
    try {
      const result = await getAllCustomersNoPage();
      if (result.success) {
        console.log("customers: ", result.data);
        return result.data;
      } else {
        console.error(result.message);
        return null;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (user_code) => {
    navigate(`/dashboard/customer/${user_code}`);
  };

  const handleDelete = async (userCode) => {
    console.log(userCode);
    try {
      setIsLoading(true);
      const result = await deleteCustomer(userCode);
      if (result.success) {
        toast.success(result.data.message);
        await fetchCustomers();
      } else {
        toast.error("Error removing customer");
      }
    } catch (error) {
      console.error("Error remove product: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    return searchQuery
      ? customer.user_code.toLowerCase().includes(searchQuery.toLowerCase()) || customer.first_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  return (
    <div className="h-full px-2 py-2 bg-white rounded-md">
      {/* customer-list: header */}
      <div className="h-[10%] pb-2 px-2 flex flex-row items-center justify-between border-b border-gray-500">
        <div className="w-2/3 flex flex-row items-center gap-2">
          <BookUser className="w-6 h-6" />
          <h2 className="text-lg font-bold">Customer List</h2>
        </div>
        <div className="w-1/3">
          <input
            type="text"
            className="w-full py-2 px-4 text-sm border border-gray-300 rounded-md"
            placeholder="Search customers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* customer-list: list-data */}
      <div className="h-[90%] pt-2 overflow-y-auto">
        {loading ? (
          <div className="h-full flex flex-row items-center justify-center">
            <FaSpinner size={20} color="black" className="animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm bg-white">
            <tbody className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.user_code}
                className="hover:bg-gray-100 rounded-md"
              >
                <td className="py-4 px-4 text-left">
                  {customer.user_code}
                </td>
                <td className="py-4 px-4">
                  <div
                    className="text-blue-600 cursor-pointer hover:underline underline-offset-4"
                    onClick={() => handleClick(customer.user_code)}
                  >
                    {customer.first_name} {customer.last_name}
                  </div>
                </td>
                <td className="py-4 px-4">{customer.contact1}</td>
                <td className="py-4 px-4">{customer.email}</td>
                <td className="py-4 px-4">{customer.city}</td>
                <td className="py-4 px-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </DialogTrigger>
                    <DialogContent className="">
                      <DialogHeader>
                        <DialogTitle>
                          <p className="text-center">Confirm removing customer</p>
                        </DialogTitle>
                        <DialogDescription>
                          <p className="mt-1 text-center text-base font-normal">
                            {customer.first_name} {customer.last_name}
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
                            onClick={() => handleDelete(customer.user_code)}
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
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default CustomerList;
