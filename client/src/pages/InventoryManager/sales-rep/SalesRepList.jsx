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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Contact, User, Mail, MapPin, Hash, Eye, Trash2, Users, Building, Phone } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";


const getSalesRepDetails= async()=>{  
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3000/api/users/sales-staff",
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

const SalesRepList = () => {
  const [loading, setLoading] = useState(true);
  const [salesReps, setSalesReps] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesReps();
  }, []);

  const fetchSalesReps = async () => {
    try {

      const result = await getSalesRepDetails();

      console.log("result: ", result.data.data.users);
      const data =result.data.data.users.map((user)=>({
        emp_code:user.sales_staff_id,
        commission_rate: parseFloat(user.performance_rating),
        target_amount:user.target,
        achievements:user.achieved,
        join_date:user.join_date,
        status:user.status,
        users:{
          name:user.full_name,
          email:user.email,
          phone:user.phone
        }
      }))
      setSalesReps(data); 
      if (result.success && result.data) {
        //tSalesReps(result.data);
      } else {
        console.error("Failed to fetch sales reps:", result.message);
      }
    } catch (error) {
      console.error("Error loading sales reps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (emp_code) => {
    console.log("Navigating to details for emp_code:", emp_code);
    navigate(`/inventorymanager/sales-rep/${emp_code}`);
  };

  const handleDelete = async (empCode) => {
    try {
      // Simulate delete operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Sales representative removed successfully");
      
      // Remove from current list (mock behavior)
      setSalesReps(prevReps => prevReps.filter(rep => rep.emp_code !== empCode));
    } catch (error) {
      console.error("Error remove sales rep: ", error);
      toast.error("Error removing sales representative");
    }
  };

  // Filter sales reps based on search query
  const filteredSalesReps = (salesReps || []).filter((rep) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rep.emp_code.toLowerCase().includes(query) ||
      rep.users?.name?.toLowerCase().includes(query) ||
      rep.users?.email?.toLowerCase().includes(query)
    );
  });

  const getInitials = (name) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || '';
  };

  

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading sales representatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Contact className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Sales Representatives</h2>
                <p className="text-white/80">Manage your sales team members</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search by name, code or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-200px)] p-6 overflow-y-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-blue-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{filteredSalesReps.length}</p>
                <p className="text-sm text-gray-600">Active Reps</p>
              </div>
            </div>
          </div>
        
          <div className="bg-white rounded-xl p-4 border-2 border-blue-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  Rs {new Intl.NumberFormat('en', { notation: 'compact' }).format(
                    (salesReps || []).reduce(
                      (sum, rep) => sum + Number(rep.target_amount || 0),
                      0
                    )
                  )}


                </p>
                <p className="text-sm text-gray-600">Total Targets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border-2 border-blue-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  Rs {new Intl.NumberFormat('en', { notation: 'compact' }).format(
                    (salesReps || []).reduce(
                      (sum, rep) => sum + Number(rep.achievements || 0),
                      0
                    )
                  )}

                </p>
                <p className="text-sm text-gray-600">Total Achieved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Reps Table */}
        {filteredSalesReps.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Code
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Representative
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact
                      </div>
                    </th>
                    {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Sales Area
                      </div>
                    </th> */}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target & Achievement
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSalesReps.map((rep) => (
                    <tr key={rep.emp_code} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(rep.users?.name)}
                          </div>
                          <span className="font-medium text-gray-800">{rep.emp_code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleClick(rep.emp_code)}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left transition-colors duration-200"
                        >
                          {rep.users?.name || 'N/A'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 text-sm">{rep.users?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 text-sm">{rep.users?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getAreaColor(rep.sales_area)}`}>
                          {rep.sales_area || 'N/A'}
                        </span>
                      </td> */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Target:</span>
                            <span className="font-semibold text-gray-800">
                              Rs{(rep.target_amount || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Achieved:</span>
                            <span className="font-semibold text-green-600">
                              Rs{(rep.achievements || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (rep.achievements || 0) >= (rep.target_amount || 0) 
                                  ? 'bg-green-500' 
                                  : (rep.achievements || 0) >= (rep.target_amount || 0) * 0.8 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                              }`}
                              style={{ 
                                width: `${Math.min(((rep.achievements || 0) / (rep.target_amount || 1)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                            (rep.achievements || 0) >= (rep.target_amount || 0) 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : (rep.achievements || 0) >= (rep.target_amount || 0) * 0.8 
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {Math.round(((rep.achievements || 0) / (rep.target_amount || 1)) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {rep.commission_rate || 0}% commission
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleClick(rep.emp_code)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
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
                                    {rep.users?.name || rep.emp_code}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium">No sales representatives found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default SalesRepList;
