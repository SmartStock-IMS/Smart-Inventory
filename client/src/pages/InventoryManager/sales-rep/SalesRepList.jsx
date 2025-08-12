import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSalesReps, deleteSalesRep } from "@services/salesrep-service";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@components/ui/Dialog.jsx";
import {cn} from "@lib/utils.js";
import {deleteCustomer} from "@services/customer-services.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Contact} from "lucide-react";

const SalesRepList = () => {
  const [loading, setLoading] = useState(true);
  const [salesReps, setSalesReps] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesReps();
  }, []);

  const fetchSalesReps = async () => {
    const result = await getAllSalesReps();
    console.log("result: ", result);
    if (result.success) {
      setSalesReps(result.data);
    } else {
      console.error("Failed to fetch sales reps:", result.message);
    }
    setLoading(false);
  };

  const handleClick = (id) => {
    navigate(`/dashboard/sales-reps/${id}`);
  };

  const handleDelete = async (empCode) => {
    try {
      const result = await deleteSalesRep(empCode);
      console.log("result: ", result);
      if (result.success) {
        toast.success(result.message);
        await fetchSalesReps();
      } else {
        toast.error("Error removing customer");
      }
    } catch (error) {
      console.error("Error remove sales rep: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full px-2 bg-white rounded-md">
      <div className="h-[10%] px-3 border-b border-gray-500 flex flex-row items-center">
        <div className="flex flex-row items-center gap-3 font-bold">
          <Contact className="w-6 h-6" />
          <p className="text-lg">Sales Representative List</p>
        </div>
      </div>
      <div className="h-[90%] pt-2">
        <table className="min-w-full bg-white">
          <tbody>
          {salesReps.map((rep) => (
            <tr
              key={rep.emp_code}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <td className="p-4 border-b text-left">{rep.emp_code}</td>
              <td className="p-4 border-b">
                <div
                  className="text-blue-600 cursor-pointer hover:underline underline-offset-4"
                  onClick={() => handleClick(rep.emp_code)}
                >
                  {rep.users.name}
                </div>
              </td>
              <td className="p-4 border-b">{rep.users.email}</td>
              <td className="p-4 border-b">{rep.sales_area}</td>
              <td className="p-4 border-b">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </DialogTrigger>
                  <DialogContent className="">
                    <DialogHeader>
                      <DialogTitle>
                        <p className="text-center">Confirm removing Sales Representative</p>
                      </DialogTitle>
                      <DialogDescription>
                        <p className="mt-1 text-center text-base font-normal">
                          {rep.users.name}
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
                          onClick={() => handleDelete(rep.emp_code)}
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
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default SalesRepList;
