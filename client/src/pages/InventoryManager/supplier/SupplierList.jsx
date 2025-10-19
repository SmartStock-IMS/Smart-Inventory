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
  Truck
} from "lucide-react";
import { useTheme } from "../../../context/theme/ThemeContext";
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
    if (!window.confirm(`Are you sure you want to delete supplier "${supplierName}"?`)) {
      return;
    }

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

      setSuccess(`Supplier "${supplierName}" deleted successfully!`);
      fetchSuppliers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete supplier");
      setTimeout(() => setError(""), 3000);
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

  if (loading) {
    return (
      <div className={`h-full w-full rounded-3xl border shadow-xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-gray-200'}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building className="w-8 h-8 text-white" />
          </div>
          <p className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-gray-200'}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Supplier Management</h1>
                <p className="text-white/80">Manage your suppliers and assign products</p>
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
            </div>
          </div>
          <div className="text-white/90">
            <span className="font-semibold">{filteredSuppliers.length}</span> suppliers found
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-160px)] p-6 overflow-y-auto">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className={`rounded-2xl border shadow-sm p-6 mb-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suppliers by name, email, phone, or address..."
                className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'}`}
              />
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        {filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.supplier_id}
                className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-600 hover:border-gray-500' : 'bg-white border-gray-100 hover:border-gray-200'}`}
              >
                {/* Supplier Header */}
                <div className={`p-6 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
                      <Building className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {supplier.name}
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ID: {supplier.supplier_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supplier Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {supplier.email || 'No email provided'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {supplier.contact_no || 'No phone provided'}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {supplier.address || 'No address provided'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Added: {formatDate(supplier.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`px-6 pb-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={() => handleViewProducts(supplier.supplier_id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Package className="w-4 h-4" />
                      Assign
                    </button>
                    <button
                      onClick={() => handleEditSupplier(supplier.supplier_id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.supplier_id, supplier.name)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`rounded-2xl border shadow-sm p-12 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Building className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {searchTerm ? 'No suppliers found' : 'No suppliers yet'}
            </h3>
            <p className={`mb-6 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm 
                ? 'Try adjusting your search criteria or clear the search to see all suppliers.'
                : 'Get started by adding your first supplier to the system.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/inventorymanager/addsupplier")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium transition-all duration-200 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="w-5 h-5" />
                Add Your First Supplier
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierList;
