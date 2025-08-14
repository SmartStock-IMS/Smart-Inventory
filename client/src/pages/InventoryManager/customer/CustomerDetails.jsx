import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCustomer } from "@services/user-services";
import { getCustomerByUserCode } from "@services/customer-services";
import {getQuotationsByCustomer} from "@services/quotation-service.js";
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

// Mock customer data matching the CustomerList data
const mockCustomers = [
  {
    user_code: "CUST001",
    first_name: "Rajesh",
    last_name: "Kumar",
    contact1: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    city: "Mumbai",
    address_line1: "123 Business Street",
    province: "Maharashtra"
  },
  {
    user_code: "CUST002", 
    first_name: "Priya",
    last_name: "Sharma",
    contact1: "+91 87654 32109",
    email: "priya.sharma@email.com",
    city: "Delhi",
    address_line1: "456 Market Road",
    province: "Delhi"
  },
  {
    user_code: "CUST003",
    first_name: "Amit",
    last_name: "Patel",
    contact1: "+91 76543 21098",
    email: "amit.patel@email.com",
    city: "Ahmedabad",
    address_line1: "789 Trade Center",
    province: "Gujarat"
  },
  {
    user_code: "CUST004",
    first_name: "Sunita",
    last_name: "Singh",
    contact1: "+91 65432 10987",
    email: "sunita.singh@email.com",
    city: "Pune",
    address_line1: "321 Industrial Area",
    province: "Maharashtra"
  },
  {
    user_code: "CUST005",
    first_name: "Vikram",
    last_name: "Gupta",
    contact1: "+91 54321 09876",
    email: "vikram.gupta@email.com",
    city: "Bangalore",
    address_line1: "654 Tech Park",
    province: "Karnataka"
  },
  {
    user_code: "CUST006",
    first_name: "Kavita",
    last_name: "Joshi",
    contact1: "+91 43210 98765",
    email: "kavita.joshi@email.com",
    city: "Hyderabad",
    address_line1: "987 Commercial Complex",
    province: "Telangana"
  },
  {
    user_code: "CUST007",
    first_name: "Rahul",
    last_name: "Verma",
    contact1: "+91 32109 87654",
    email: "rahul.verma@email.com",
    city: "Chennai",
    address_line1: "147 Export Hub",
    province: "Tamil Nadu"
  },
  {
    user_code: "CUST008",
    first_name: "Meera",
    last_name: "Reddy",
    contact1: "+91 21098 76543",
    email: "meera.reddy@email.com",
    city: "Kolkata",
    address_line1: "258 Wholesale Market",
    province: "West Bengal"
  }
];

// Mock quotations data
const mockQuotations = [
  {
    id: 1,
    quotation_id: "QUO001",
    quotation_date: "2024-01-15",
    customer_id: "CUST001",
    sales_rep_id: "REP001",
    net_total: 15000,
    no_items: 3,
    status: "Approved"
  },
  {
    id: 2,
    quotation_id: "QUO002",
    quotation_date: "2024-01-20",
    customer_id: "CUST001",
    sales_rep_id: "REP002",
    net_total: 8500,
    no_items: 2,
    status: "Pending"
  },
  {
    id: 3,
    quotation_id: "QUO003",
    quotation_date: "2024-02-05",
    customer_id: "CUST002",
    sales_rep_id: "REP001",
    net_total: 22000,
    no_items: 5,
    status: "Completed"
  }
];

const CustomerDetails = () => {
  const { user_code } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use mock data since backend isn't connected
    const fetchCustomer = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find customer in mock data
        const foundCustomer = mockCustomers.find(c => c.user_code === user_code);
        
        if (foundCustomer) {
          setCustomer(foundCustomer);
          
          // Filter quotations for this customer
          const customerQuotations = mockQuotations.filter(q => q.customer_id === user_code);
          setQuotations(customerQuotations);
          
          console.log("Customer found:", foundCustomer);
          console.log("Customer quotations:", customerQuotations);
        } else {
          setError("Customer not found");
        }
      } catch (err) {
        setError("Error loading customer data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [user_code]);

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
      <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl border border-red-200 shadow-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error || "Customer not found"}</p>
          <button
            onClick={() => navigate('/inventorymanager/customer-list')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Customer List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/inventorymanager/customer-list')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Customer List
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {getInitials(customer.first_name, customer.last_name)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="text-white/80 text-lg">Customer ID: {customer.user_code}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-[calc(100%-140px)] p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Customer Information Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Customer Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Hash className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer Code</p>
                    <p className="font-semibold text-gray-800">{customer.user_code}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-semibold text-gray-800">{customer.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold text-gray-800">{customer.contact1}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold text-gray-800">
                      {customer.address_line1}<br />
                      {customer.city}, {customer.province}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate(`/inventorymanager/customer/edit/${customer.user_code}`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
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
