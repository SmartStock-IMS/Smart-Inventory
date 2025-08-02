import { useEffect, useState } from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {ChevronLeft, Edit2} from "lucide-react";
import {getSalesRep, updateSalesRep} from "@services/salesrep-service.js";
import Avatar from "@components/ui/Avatar.jsx";
import { FaSpinner } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SalesRepDetails = () => {
  const { id } = useParams(); // capture URL params
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  // init local-state-variables
  const [salesRepData, setSalesRepData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSalesRep(id);
  }, [id]);

  // fetch sales-rep data using emp_code
  const fetchSalesRep = async (id) => {
    try {
      setIsLoading(true);
      const result = await getSalesRep(id);
      if (result.success) {
        const resultData = result.data;
        setSalesRepData(resultData);
        reset({
          name: resultData.users.name,
          email: resultData.users.email,
          phone: resultData.users.contact,
          address: resultData.users.address,
          region: resultData.sales_area,
          status: resultData.is_active ? "Active" : "",
        });
      } else {
        console.log("sales-rep not found");
      }
    } catch (error) {
      console.error("Error fetching sales rep:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const salesRepEditForm = async (data) => {
    try {
      setIsEditing(true);
      const result = await updateSalesRep(id, data);
      if (result.success) {
        toast.success(result.data.message);
        setTimeout(() => {
          setIsEditing(false);
          navigate("/dashboard/repslist");
        }, 3000);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating sales rep form:", error);
    } finally {
      setIsEditing(false);
    }
  };

  // display error when no users found
  if (salesRepData === null) {
    return <div className="text-center text-red-500">Sales Rep not found.</div>;
  }

  return (
    <div className="h-full">
      {/* navigation: redirect to reps-list */}
      <div className="h-[6%] px-2 flex flex-row items-center">
        <Link
          to="/dashboard/repslist"
          className="flex flex-row items-center gap-1 text-blue-500 hover:underline hover:underline-offset-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <p>Back to Sales Rep List</p>
        </Link>
      </div>
      <div className="h-[94%] bg-white rounded-md">
        {isLoading ? (
          <div className="h-full w-full flex flex-row items-center justify-center">
            <FaSpinner
              size={20}
              color="black"
              className="animate-spin"
            />
          </div>
        ) : (
          <div className="h-full p-4 bg-white shadow-lg rounded-lg relative">
            <form onSubmit={handleSubmit(salesRepEditForm)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2 border rounded-lg border-gray-300`}
                    {...register("name")}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className={`w-full p-2 border rounded-lg border-gray-300`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register("phone")}
                    className={`w-full p-2 border rounded-lg border-gray-300`}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  {...register("address")}
                  className={`w-full p-2 border rounded-lg border-gray-300`}
                />
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sales Region
                </label>
                <input
                  type="text"
                  {...register("region")}
                  className={`w-full p-2 border rounded-lg border-gray-300`}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  {...register("status")}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 flex flex-row items-center text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  disabled={isEditing}
                >
                  Add Sales Rep
                  {isEditing && (
                    <FaSpinner
                      size={20}
                      color="white"
                      className="ms-3 animate-spin"
                    />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default SalesRepDetails;
