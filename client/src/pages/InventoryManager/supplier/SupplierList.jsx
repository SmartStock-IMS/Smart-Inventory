import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  RefreshCw,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  Building2,
  ContactIcon,
  Truck,
  Hash,
  User
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/Dialog.jsx";
import { cn } from "../../../lib/utils.js";
import { useTheme } from "../../../context/theme/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const SupplierList = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // State management
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch suppliers data
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/suppliers`,
        { headers }
      );

      const suppliersData = response.data?.data || [];
      setSuppliers(suppliersData);
      setFilteredSuppliers(suppliersData);
    } catch (err) {
      setError("Failed to load suppliers. Please try again.");
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Filter suppliers based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_no?.includes(searchTerm) ||
        supplier.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
  }, [searchTerm, suppliers]);

  // Refresh suppliers data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSuppliers();
    setRefreshing(false);
  };

  // Navigate to assign products page
  const handleViewProducts = (supplierId) => {
    navigate(`/inventorymanager/supplier-products/${supplierId}`);
  };

  // Navigate to edit supplier page
  const handleEditSupplier = (supplierId) => {
    navigate(`/inventorymanager/edit-supplier/${supplierId}`);
  };

  // Delete supplier
  const handleDeleteSupplier = async (supplierId, supplierName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/suppliers/${supplierId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(`Supplier "${supplierName}" deleted successfully!`);
      fetchSuppliers();
    } catch (err) {
      console.error("Error deleting supplier:", err);
      toast.error(err.response?.data?.message || "Failed to delete supplier");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase() || "SP"
    );
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading suppliers...</p>
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
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Suppliers</h2>
                <p className="text-white/80">Manage your supplier partnerships</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => navigate("/inventorymanager/addsupplier")}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search suppliers by name, email, phone, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredSuppliers.length}
                </p>
                <p className="text-sm text-gray-600">Active Suppliers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-blue-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {suppliers.length}
                </p>
                <p className="text-sm text-gray-600">Total Suppliers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-blue-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {suppliers.filter(s => s.email && s.contact_no).length}
                </p>
                <p className="text-sm text-gray-600">Verified Contacts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        {filteredSuppliers.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        ID
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Supplier
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Added Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.supplier_id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(supplier.name)}
                          </div>
                          <span className="font-medium text-gray-800">
                            {supplier.supplier_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewProducts(supplier.supplier_id)}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left transition-colors duration-200"
                        >
                          {supplier.name || "N/A"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 text-sm">
                              {supplier.email || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 text-sm">
                              {supplier.contact_no || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm max-w-xs truncate block">
                          {supplier.address || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">
                          {formatDate(supplier.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewProducts(supplier.supplier_id)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                          >
                            <Package className="w-4 h-4" />
                            Assign
                          </button>
                          <button
                            onClick={() => handleEditSupplier(supplier.supplier_id)}
                            className="px-4 py-2 text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </DialogTrigger>
                            <DialogContent className="">
                              <DialogHeader>
                                <DialogTitle>
                                  Confirm Supplier Deletion
                                </DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete supplier "{supplier.name}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-2 flex flex-row items-center justify-center gap-4">
                                <DialogClose asChild>
                                  <button
                                    className={cn(
                                      "w-1/5 border p-2 rounded-md bg-gray-950 text-white",
                                      "hover:bg-gray-800"
                                    )}
                                    onClick={() => handleDeleteSupplier(supplier.supplier_id, supplier.name)}
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
              <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium">
                No suppliers found
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Add your first supplier to get started'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate("/inventorymanager/addsupplier")}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl font-medium transition-all duration-200 hover:from-blue-600 hover:to-blue-500"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Supplier
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default SupplierList;
