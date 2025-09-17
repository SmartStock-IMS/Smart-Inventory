import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookUser, Search, Trash2, Eye, User, Mail, Phone, MapPin, Hash, Users, Building } from "lucide-react";

// API services
const API_BASE_URL = 'http://localhost:3000/api'; // API Gateway URL

const getAllCustomers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch customers');
    }

    return data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

const deleteCustomer = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete customer');
    }

    return data;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Simple toast implementation
const toast = {
  success: (message) => {
    // You can replace this with a proper toast library like react-hot-toast
    alert(`✅ ${message}`);
  },
  error: (message) => {
    // You can replace this with a proper toast library like react-hot-toast
    alert(`❌ ${message}`);
  }
};

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const result = await getAllCustomers();
      if (result.success) {
        // Handle both direct array and nested data structure
        const customersData = result.data?.customers || result.data || [];
        setCustomers(customersData);
      } else {
        toast.error(result.message || 'Failed to load customers');
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error('Failed to load customers. Please try again.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    try {
      setIsLoading(true);
      const result = await deleteCustomer(customerId);
      if (result.success) {
        toast.success(result.message || 'Customer deleted successfully');
        // Remove customer from local state
        setCustomers(customers.filter(c => c.customer_id !== customerId));
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      } else {
        toast.error(result.message || "Error removing customer");
      }
    } catch (error) {
      console.error("Error removing customer: ", error);
      toast.error(error.message || "Error removing customer");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const filteredCustomers = (customers || []).filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.customer_id?.toLowerCase().includes(query) || 
      customer.first_name?.toLowerCase().includes(query) ||
      customer.last_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.address?.toLowerCase().includes(query)
    );
  });

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
                <BookUser className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Customer Management</h2>
                <p className="text-white/80 text-sm">Manage and track customer information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/inventorymanager/addcustomer')}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors backdrop-blur-sm"
              >
                <BookUser className="w-4 h-4" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search by name, code, email, or city..."
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <BookUser className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 font-medium">Loading customers...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">{filteredCustomers.length}</p>
                    <p className="text-xs text-gray-600">Active Customers</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">{customers.length}</p>
                    <p className="text-xs text-gray-600">Total Customers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customers Table */}
            {filteredCustomers.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Code
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer
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
                            <Users className="w-4 h-4" />
                            Status & Location
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCustomers.map((customer, index) => (
                        <tr key={customer.customer_id || customer.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                {((customer.first_name?.charAt(0) || '') + (customer.last_name?.charAt(0) || '')).toUpperCase() || 'C'}
                              </div>
                              <span className="font-medium text-gray-800 text-sm">#{customer.customer_id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/inventorymanager/customer/${customer.customer_id}`)}
                              className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left transition-colors duration-200 text-sm"
                            >
                              {`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600 text-xs">{customer.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600 text-xs">{customer.contact_no || customer.phone || 'N/A'}</span>
                              </div>
                              {customer.contact2 && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600 text-xs">{customer.contact2}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getAreaColor(index)}`}>
                                {customer.status || 'Active'}
                              </span>
                              {customer.address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600 text-xs truncate max-w-32" title={customer.address}>
                                    {customer.address}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/inventorymanager/customer/${customer.customer_id}`)}
                                className="px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </button>
                              <button
                                onClick={() => openDeleteDialog(customer)}
                                className="px-3 py-1 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
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
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookUser className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">No customers found</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Confirm removing Customer</h3>
            <p className="text-gray-600 mb-6 text-center text-base font-normal">
              {customerToDelete?.first_name} {customerToDelete?.last_name}
            </p>
            <div className="flex flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleDelete(customerToDelete?.customer_id)}
                disabled={isLoading}
                className="w-1/5 border p-2 rounded-md bg-gray-950 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isLoading ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="w-1/5 border border-gray-300 p-2 rounded-md hover:border-gray-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;