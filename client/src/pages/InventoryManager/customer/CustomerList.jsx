import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookUser, Search, Trash2, Eye, User, Mail, Phone, MapPin, Hash, Users, Sparkles, AlertCircle, UserCheck, Building, Grid3X3, TableProperties } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";

const getAllCustomersNoPage= async()=>{  
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:3000/api/customers",
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log("API response:", response.data.data.customers);
    return { success: true, data: response.data.data.customers };
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

const deleteCustomer = async (userCode) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, data: { message: "Customer removed successfully" } };
};

const toast = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`)
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers().then(data => {
      setCustomers(data || []);
    });
  }, []);

  const fetchCustomers = async () => {
    try {
      const result = await getAllCustomersNoPage();
      if (result.success) {
        console.log("customers: ", result.data);
        return result.data;
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error(error);
      console.log("Backend error");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (user_code) => {
    navigate(`/inventorymanager/customer/${user_code}`);
  };

  const handleDelete = async (userCode) => {
    console.log(userCode);
    try {
      setIsLoading(true);
      const result = await deleteCustomer(userCode);
      if (result.success) {
        toast.success(result.data.message);
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      } else {
        toast.error("Error removing customer");
      }
    } catch (error) {
      console.error("Error remove product: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = (customers || []).filter((customer) => {
    return searchQuery
      ? customer.customer_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  const openDeleteDialog = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || '';
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCustomers.map((customer) => (
        <div key={customer.customer_id} className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {getInitials(customer.name)}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleClick(customer.customer_id)}
                  className="text-left hover:text-blue-600 transition-colors duration-200"
                >
                  <h3 className="font-semibold text-gray-800 truncate">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-gray-500">{customer.customer_id}</p>
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="truncate">{customer.contact_no}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border`}>
                  {customer.address}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleClick(customer.customer_id)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => openDeleteDialog(customer)}
                className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
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
                  Customer
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.customer_id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(customer.name)}
                    </div>
                    <span className="font-medium text-gray-800">{customer.customer_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleClick(customer.customer_id)}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left transition-colors duration-200"
                  >
                    {customer.name}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-600">{customer.contact_no}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{customer.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className='text-gray-600'>
                    {customer.address}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleClick(customer.customer_id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => openDeleteDialog(customer)}
                      disabled={isLoading}
                      className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookUser className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Customer Management</h2>
                <p className="text-white/80">Manage and view all customer information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search customers by name, code, email, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-200",
                    viewMode === 'table' 
                      ? "bg-white/30 text-white" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <TableProperties className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-200",
                    viewMode === 'grid' 
                      ? "bg-white/30 text-white" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-200px)] p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FaSpinner className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Loading customers...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{filteredCustomers.length}</p>
                    <p className="text-sm text-gray-600">Total Customers</p>
                  </div>
                </div>
              </div>
                            
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {new Set(customers.map(c => c.address)).size}
                    </p>
                    <p className="text-sm text-gray-600">Cities Covered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customers Display */}
            {filteredCustomers.length > 0 ? (
              viewMode === 'table' ? <TableView /> : <GridView />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">No customers found</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && customerToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Remove Customer</h3>
                  <p className="text-white/80 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(customerToDelete.name)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {customerToDelete.name}
                  </h4>
                  <p className="text-sm text-gray-600">{customerToDelete.customer_id}</p>
                  <p className="text-xs text-gray-500 mt-1">{customerToDelete.email}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this customer from your database? This will permanently delete all customer information.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(customerToDelete.customer_id)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Remove Customer
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setCustomerToDelete(null);
                  }}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;