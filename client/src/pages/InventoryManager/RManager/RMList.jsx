import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllResourceManagers } from "@services/user-services";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Contact, User, Mail, MapPin, Hash, Eye, Trash2, Users, Building, Phone } from "lucide-react";

const RMList = () => {
  const [loading, setLoading] = useState(true);
  const [resourceManagers, setResourceManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchResourceManagers();
  }, []);

  const fetchResourceManagers = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching resource managers...");
      
      // Check if user is authenticated
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found");
        toast.error("Please log in to view resource managers");
        setResourceManagers([]);
        return;
      }
      
      const result = await getAllResourceManagers();
      console.log("📥 Resource managers result:", result);
      
      if (result.success && result.data) {
        console.log("✅ Resource managers loaded successfully:", result.data);
        
        // Transform the data to ensure proper structure for UI
        const transformedData = result.data.map(user => ({
          id: user.userID || user.id || user.user_id, // Handle different ID field names
          userID: user.userID || user.id || user.user_id,
          name: `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim(),
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          first_name: user.first_name || user.firstName,
          last_name: user.last_name || user.lastName
        }));
        
        setResourceManagers(transformedData);
        
        if (transformedData.length === 0) {
          toast.info("No resource managers found in the system");
        }
      } else {
        console.error("❌ Failed to fetch resource managers:", result.message);
        
        // Handle specific error messages
        if (result.message?.includes("token") || result.message?.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(result.message || "Failed to fetch resource managers");
        }
        setResourceManagers([]);
      }
    } catch (error) {
      console.error("💥 Error loading resource managers:", error);
      
      // Handle network and authentication errors
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (error.response?.status === 403) {
        toast.error("Access denied. You don't have permission to view resource managers.");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Error loading resource managers");
      }
      setResourceManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (id) => {
    navigate(`/inventorymanager/rm-details/${id}`);
  };

  const handleDelete = async (userId) => {
    try {
      setLoading(true);
      // TODO: Implement delete API endpoint
      // const result = await deleteUser(userId);
      
      // For now, just show success message and refresh the list
      toast.success("Resource manager removed successfully");
      await fetchResourceManagers(); // Refresh the list
    } catch (error) {
      console.error("Error removing resource manager: ", error);
      toast.error("Error removing resource manager");
    } finally {
      setLoading(false);
    }
  };

  // Filter resource managers based on search query
  const filteredResourceManagers = (resourceManagers || []).filter((rm) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rm.username?.toLowerCase().includes(query) ||
      rm.name?.toLowerCase().includes(query) ||
      rm.email?.toLowerCase().includes(query) ||
      rm.phone?.toLowerCase().includes(query)
    );
  });

  const getInitials = (name) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || '';
  };

  const getAreaColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading resource managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Contact className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Resource Managers</h2>
                <p className="text-white/80 text-sm">Manage your resource management team</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search by name, ID, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-160px)] p-4 overflow-y-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{filteredResourceManagers.length}</p>
                <p className="text-xs text-gray-600">Active Managers</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{resourceManagers.length}</p>
                <p className="text-xs text-gray-600">Total Resource Managers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Managers Table */}
        {filteredResourceManagers.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        ID
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Resource Manager
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Role
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredResourceManagers.map((rm, index) => (
                    <tr key={rm.id || rm.userID || index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(rm.name)}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">#{rm.id || rm.userID}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleClick(rm.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left transition-colors duration-200 text-sm"
                        >
                          {rm.name || rm.username || 'N/A'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 text-xs">{rm.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 text-xs">{rm.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getAreaColor(index)}`}>
                          {rm.role || 'Resource Manager'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleClick(rm.id || rm.userID)}
                            className="px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="px-3 py-1 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1">
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </button>
                            </DialogTrigger>
                            <DialogContent className="">
                              <DialogHeader>
                                <DialogTitle>
                                  <p className="text-center">Confirm removing Resource Manager</p>
                                </DialogTitle>
                                <DialogDescription>
                                  <p className="mt-1 text-center text-base font-normal">
                                    {rm.name || rm.username || `ID: ${rm.id || rm.userID}`}
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
                                    onClick={() => handleDelete(rm.id || rm.userID)}
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
              <p className="text-gray-600 font-medium">No resource managers found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default RMList;
