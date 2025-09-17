import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@components/ui/Dialog.jsx";
import OrderDetails from "@components/InventoryManager/orders/OrderDetails.jsx";
import { ChevronLeft, User, Mail, Phone, MapPin, Edit, Package, Calendar, Hash, DollarSign, FileText } from "lucide-react";
import { getCustomerByUserCode } from "@services/customer-services";

// Simple toast implementation
const toast = {
  success: (message) => {
    alert(`✅ ${message}`);
  },
  error: (message) => {
    alert(`❌ ${message}`);
  }
};

const CustomerDetails = () => {
  const { customer_id } = useParams(); // Changed from user_code to customer_id
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        // Fetch customer details using service layer
        console.log('🔍 Fetching customer with ID:', customer_id);
        const customerResult = await getCustomerByUserCode(customer_id);
        console.log('📦 Customer service result:', customerResult);
        
        if (customerResult.success) {
          const customerData = customerResult.data?.customer || customerResult.data?.data?.customer || customerResult.data;
          setCustomer(customerData);
          
          console.log("✅ Customer found:", customerData);
          
          // For now, set empty quotations since quotations service might not be ready
          setQuotations([]);
          console.log("📋 Quotations set to empty array");
        } else {
          console.error("❌ Customer fetch failed:", customerResult);
          setError(customerResult.message || "Customer not found");
        }
      } catch (err) {
        console.error("💥 Error loading customer data:", err);
        setError(err.message || "Error loading customer data");
      } finally {
        setLoading(false);
        console.log("🏁 Loading completed");
      }
    };

    if (customer_id) {
      console.log("🚀 Starting customer fetch for ID:", customer_id);
      fetchCustomerData();
    } else {
      console.warn("⚠️ No customer_id provided");
      setLoading(false);
    }
  }, [customer_id]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 animate-pulse">
            <User className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 font-medium text-sm">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-red-50 via-white to-red-100 rounded-xl border border-red-200 shadow-sm flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-600 font-medium text-sm">{error || "Customer not found"}</p>
          <button
            onClick={() => navigate('/inventorymanager/customer-list')}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Back to Customer List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/inventorymanager/customer-list')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Customer List
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {getInitials(customer.first_name, customer.last_name)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="text-white/80 text-sm">Customer ID: {customer.customer_id}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-120px)] p-4 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Customer Information Card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Customer Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Hash className="w-3 h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Customer Code</p>
                    <p className="font-semibold text-gray-800 text-sm">{customer.customer_id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-3 h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-semibold text-gray-800 text-sm">{customer.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-3 h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-semibold text-gray-800 text-sm">{customer.contact_no}</p>
                    {customer.contact2 && (
                      <p className="text-xs text-gray-600">{customer.contact2}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                      {customer.address}
                    </p>
                  </div>
                </div>
                
                {customer.status && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        customer.status === 'INACTIVE' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                  </div>
                )}
                
                {customer.notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-3 h-3 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                        {customer.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate(`/inventorymanager/customer/edit/${customer.customer_id}`)}
                className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Customer Details
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{quotations.length}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    Rs{quotations.reduce((sum, q) => sum + q.net_total, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Value</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Order History</h2>
            </div>
          </div>
          
          <div className="p-6">
            {quotations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Quotation ID
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales Rep
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Total
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {new Date(quotation.quotation_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-blue-600">{quotation.quotation_id}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {quotation.sales_rep_id}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {quotation.no_items} items
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          Rs{quotation.net_total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)}`}>
                            {quotation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No orders found</p>
                <p className="text-sm text-gray-500 mt-2">This customer hasn't placed any orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
