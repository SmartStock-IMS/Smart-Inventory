import PropTypes from "prop-types";
import { InputWithLabel } from "@components/ui/InputWithLabel";
import { useEffect, useState } from "react";
import { getCustomerByUserCode } from "@services/customer-services.js";
import { FaSpinner } from "react-icons/fa";
import { cn } from "@lib/utils.js";
import {updateQuotationStatus, updateQuotationItemsQuantity, getInvoice} from "@services/quotation-service.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/auth/AuthContext.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ChevronLeft, Calendar, Hash, User, Users, DollarSign, Package, Activity } from "lucide-react";
import {Link} from "react-router-dom";

// eslint-disable-next-line react/prop-types
const OrderDetails = ({ item, changeOpen = () => {} }) => {
  const { user } = useAuth();

  const [userType, setUserType] = useState();
  const [customerData, setCustomerData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isDownload, setIsDownload] = useState(
    item.status === "Paid Invoice");
  const [quotationStatus, setQuotationStatus] = useState(item.status);
  const [invoiceTerm, setInvoiceTerm] = useState(item.payment_term);
  const [company, setCompany] = useState(item.company);
  const [isOrderAccepted, setIsOrderAccepted] = useState(false); // New state to track order acceptance
  const [isCreatingQuotation, setIsCreatingQuotation] = useState(false); // New state to track quotation creation
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // New state to track status update
  const [orderStatus, setOrderStatus] = useState(item.status); // Track the order status locally

  useEffect(() => {
    console.log("item: ", item);
    const getCustomerData = (customerId) => {
      const customerDatabase = {
        "CUST-001": {
          first_name: "Priya",
          last_name: "Fernando",
          email: "priya.fernando@gmail.com",
          address_line1: "No. 45, Galle Road",
          address_line2: "Mount Lavinia",
          city: "Colombo",
          province: "Western",
          postal_code: "10370",
          contact1: "+94 77 123 4567",
          contact2: "+94 71 987 6543"
        }
      };
      
      return customerDatabase[customerId] || customerDatabase["CUST-001"];
    };
    
    setUserType(user?.type || "002");
    setCustomerData(getCustomerData(item.customer_id));
    setIsLoading(false);
  }, [item, user]);

  const handleQuotationStatusChange = async () => {
    setIsSubmit(true);
    try {
      const quotationId = item.quotation_id;

      const statusData = {
        status: quotationStatus,
        payment_term: invoiceTerm,
        company: company,
      };

      const response = await updateQuotationStatus(quotationId, statusData);
      if (response.success) {
        toast.success(response.data.message); // status update success message

        // update item quantity
        if (quotationStatus === "Generate Invoice") {
          const response = await updateQuotationItemsQuantity(quotationId);
          if (response.success) {
            setIsDownload(true);
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error: ", error);
    } finally {
      setIsSubmit(false);
      changeOpen();
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await getInvoice(item.quotation_id);
      if (response.success) {
        const invoiceId = response.data.invoice.invoice_no;
        await downloadInvoice(invoiceId, customerData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const downloadInvoice = async (invoiceId, customerData) => {
    const doc = new jsPDF();
    
    // Set page margins
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const invoiceInfoX = pageWidth - margin;
    doc.text(`INVOICE DATE: ${new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})}`, invoiceInfoX, 30, { align: "right" });
    doc.text(`INVOICE # ${invoiceId}`, invoiceInfoX, 35, { align: "right" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Bill To:", margin, 35);
    doc.text(`${customerData?.first_name || ""} ${customerData?.last_name || ""}`, margin, 45);
    doc.text(`${customerData?.address_line1 || ""}`, margin, 50);
    if (customerData?.address_line2) {
      doc.text(`${customerData?.address_line2 || ""}`, margin, 55);
      doc.text(`${customerData?.city || ""}, ${customerData?.province || ""}`, margin, 60);
      doc.text(`${customerData?.postal_code || ""}`, margin, 65);
    } else {
      doc.text(`${customerData?.city || ""}, ${customerData?.province || ""}`, margin, 55);
      doc.text(`${customerData?.postal_code || ""}`, margin, 60);
    }
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`TERMS: ${item.payment_term}`, invoiceInfoX, 50, { align: "right" });
    doc.text(`DUE DATE: ${new Date(item.quotation_due_date).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})}`, invoiceInfoX, 55, { align: "right" });
    doc.text(`REP: ${item.sales_rep_id}`, invoiceInfoX, 60, { align: "right" });
    doc.text(`VIA:`, invoiceInfoX, 65, { align: "right" });
  
    const tableColumn = [
      "ITEM CODE",
      "DESCRIPTION",
      "QUANTITY",
      "UNIT PRICE",
      "AMOUNT"
    ];
    
    const tableRows = item.quotationItems.map((itemData) => {
      const unitPrice = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
      }).format(itemData.unit_price);

      const totalAmount = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
      }).format(itemData.total_amount);

      return [
        itemData.item_code,
        itemData.description,
        itemData.item_qty,
        unitPrice,
        totalAmount,
      ];
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3, fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });
  
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total", pageWidth - 80, finalY);
    doc.text("Balance Due", pageWidth - 80, finalY + 8);
    doc.text("Customer Total Balance", pageWidth - 80, finalY + 16);
    
    doc.text(`LKR ${Number(item.net_total).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`, pageWidth - margin, finalY, { align: "right" });
    doc.text("LKR 0.00", pageWidth - margin, finalY + 8, { align: "right" });
    doc.text("LKR 0.00", pageWidth - margin, finalY + 16, { align: "right" });
  
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Note : Thanks For your business", margin, finalY + 30);
    doc.text("Account Name : Trollious Cosmetics (Pvt) Ltd", margin, finalY + 36);
    doc.text("Account Number : 1000429495", margin, finalY + 42);
    doc.text("Bank : Commercial Bank", margin, finalY + 48);
    doc.text("Branch : Panadura City Office", margin, finalY + 54);
  
    const signatureY = finalY + 70;
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineDashPattern([1, 1], 0);
    
    doc.line(margin, signatureY, margin + 60, signatureY);
    doc.setFontSize(8);
    doc.text("Approved Signature", margin, signatureY + 5);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TROLLIOUS COSMETICS (PVT) LTD.", margin, signatureY + 15);
    
    doc.setLineDashPattern([1, 1], 0);
    doc.line(pageWidth/2 - 30, signatureY, pageWidth/2 + 30, signatureY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Customer Signature", pageWidth/2, signatureY + 5, { align: "center" });
    
    doc.setLineDashPattern([1, 1], 0);
    doc.line(pageWidth - margin - 60, signatureY, pageWidth - margin, signatureY);
    doc.text("Authorised Signature", pageWidth - margin - 30, signatureY + 5, { align: "center" });
    
    const companyInfoY = signatureY + 25;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("No 182,", margin, companyInfoY);
    doc.text("Kuruppumulla Road,", margin, companyInfoY + 5);
    doc.text("Panadura, 12500", margin, companyInfoY + 10);
    doc.text("0707 577 500 / 502", margin, companyInfoY + 15);
  
    doc.save(`invoice_${invoiceId}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAcceptOrder = () => {
    setIsOrderAccepted(true); // Set the state to true when the order is accepted
    // TODO: Implement additional logic for accepting the order
  };

  const handleCreateQuotation = () => {
    setIsCreatingQuotation(true);

    try {
      // Simulate quotation creation logic
      const quotationData = {
        customer_id: item.customer_id,
        sales_staff_id: item.sales_rep_id,
        items: item.quotationItems.map((qItem) => ({
          product_id: qItem.item_code,
          quantity: qItem.item_qty,
        })),
        order_type: "quotation",
        delivery_date: new Date().toISOString().split("T")[0], // Use today's date
      };

      console.log("Quotation created:", quotationData);
      toast.success("Quotation created successfully!");

      // Simulate navigation to a confirmation page
      setTimeout(() => {
        changeOpen(); // Close the dialog or modal
      }, 1500);
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast.error("Failed to create quotation. Try again.");
    } finally {
      setIsCreatingQuotation(false);
    }
  };

  const updateOrderStatus = async (status) => {
    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/orders/status/${item.order_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(`Order ${status} successfully!`);
        setOrderStatus(status); // Update the local state to reflect the new status
      } else {
        throw new Error(result.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="h-full py-3">
      {/* Quick Action Button - Top */}
      <div className="px-3 mb-4">
        <button
          className="w-fit flex flex-row items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200"
          onClick={() => changeOpen()}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Go Back to Orders</span>
        </button>
      </div>

      {/* Order Summary Information */}
      <div className="mt-5 px-4 pt-4 pb-4 border rounded-lg">
        <div className="-mt-6 mb-4">
          <h2 className="w-fit ms-2 px-3 py-1 bg-white text-lg font-semibold text-gray-800 border rounded-lg shadow-sm">
            📋 Order Summary Information
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Order Date */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Order Date</p>
                <p className="text-lg font-bold text-blue-900">
                  {new Date(item.quotation_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Order ID */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Order ID</p>
                <p className="text-lg font-bold text-purple-900">{item.quotation_id}</p>
              </div>
            </div>
          </div>

          {/* Customer ID */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Customer ID</p>
                <p className="text-lg font-bold text-green-900">{item.customer_id}</p>
              </div>
            </div>
          </div>

          {/* Sales Rep ID */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Sales Rep ID</p>
                <p className="text-lg font-bold text-orange-900">{item.sales_rep_id}</p>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Total Amount</p>
                <p className="text-lg font-bold text-emerald-900">
                  Rs. {typeof item.net_total !== "undefined" && item.net_total !== null && !isNaN(Number(item.net_total))
                    ? Number(item.net_total).toLocaleString()
                    : typeof item.total_amount !== "undefined" && item.total_amount !== null && !isNaN(Number(item.total_amount))
                      ? Number(item.total_amount).toLocaleString()
                      : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Number of Products */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-700">No of Products</p>
                <p className="text-lg font-bold text-indigo-900">{item.no_items}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Action Row */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          {/* Status */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Order Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Manager Information */}
      {item.assignedResourceManager && (
        <div className="mt-5 px-4 pt-4 pb-4 border rounded-lg">
          <div className="-mt-6 mb-4">
            <h2 className="w-fit ms-2 px-3 py-1 bg-white text-lg font-semibold text-gray-800 border rounded-lg shadow-sm">
              👤 Resource Manager Details
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Manager Name */}
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-700">Manager Name</p>
                  <p className="text-lg font-bold text-teal-900">{item.assignedResourceManager.name}</p>
                </div>
              </div>
            </div>

            {/* Resource Manager ID */}
            <div className="bg-gradient-to-r from-rose-50 to-rose-100 p-4 rounded-xl border border-rose-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-rose-700">Resource Manager ID</p>
                  <p className="text-lg font-bold text-rose-900">{item.assignedResourceManager.id}</p>
                </div>
              </div>
            </div>

            {/* Assignment Date */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700">Assigned On</p>
                  <p className="text-lg font-bold text-amber-900">
                    {new Date(item.assignedResourceManager.assignedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order */}
      <div className="mt-8 px-4 pt-2 pb-4 border rounded-lg">
        {/* Order Title */}
        {/*<div className="-mt-5">*/}
        {/*  <h2 className="w-fit ms-2 px-2 bg-white text-base font-medium">*/}
        {/*    Order Details*/}
        {/*  </h2>*/}
        {/*</div>*/}
        {/* Order Status */}
        {userType === "002" && (
          <div className="w-full mt-4 flex flex-row gap-3">
            {/* Invoice Terms */}
            <div className="w-3/5">
              {/* Terms Selector */}
              {quotationStatus === "Generate Invoice" && (
                <div className="w-full flex flex-row items-end gap-3">
                  {/* Payment Term */}
                  <div className="w-2/5">
                    <div className="mb-1">
                      <p className="ps-2 font-semibold">Term</p>
                    </div>
                    <div className="p-2 border border-gray-200 rounded-md">
                      <select
                        name="invoice-terms"
                        id="invoiceTemrs"
                        className="w-full pe-2 focus-visible:outline-none"
                        value={invoiceTerm}
                        onChange={(e) => setInvoiceTerm(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Credit">Credit</option>
                        <option value="30 Days">30 Days</option>
                        <option value="45 Days">45 Days</option>
                        <option value="60 Days">60 Days</option>
                      </select>
                    </div>
                  </div>
                  {/* Company */}
                  <div className="w-2/5">
                    <div className="mb-1">
                      <p className="ps-2 font-semibold">Company</p>
                    </div>
                    <div className="p-2 border border-gray-200 rounded-md">
                      <select
                        name="company"
                        id="company"
                        className="w-full pe-2 focus-visible:outline-none"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      >
                        <option value="" disabled>Select Company...</option>
                        <option value="Trollius">Trollius</option>
                        <option value="Mehera">Mehera</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Status Update Buttons */}
            <div className="w-1/5 flex flex-row items-end justify-end">
              {item.status !== quotationStatus && (
                <button
                  className={cn(
                    "w-3/4 py-2 px-4 flex flex-row items-center justify-center gap-2 border rounded-md bg-black text-white",
                    "hover:bg-black/80",
                  )}
                  onClick={handleQuotationStatusChange}
                  disabled={isSubmit}
                >
                  Update
                  {isSubmit && (
                    <FaSpinner
                      size={20}
                      color="white"
                      className="ms-3 animate-spin"
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        {/* Order Table - Enhanced with Product Variant Details */}
        <div className="mt-3 border rounded-lg border-slate-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-slate-300">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              📦 Product Details for Delivery
            </h3>
            <p className="text-sm text-gray-600 mt-1">Complete variant information for accurate delivery</p>
          </div>
          
          <table className="w-full divide-y divide-gray-300 text-sm bg-white">
            <thead className="bg-gray-50">
              <tr className="divide-x divide-gray-300">
                <th className="py-3 px-4 text-left font-medium text-gray-700">Product Code</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Product Name</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Variant Details</th>
                <th className="py-3 px-4 text-center font-medium text-gray-700">Quantity to Deliver</th>
                <th className="py-3 px-4 text-right font-medium text-gray-700">Unit Price</th>
                <th className="py-3 px-4 text-right font-medium text-gray-700">Total Amount</th>
                <th className="py-3 px-4 text-center font-medium text-gray-700">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.isArray(item.quotationItems) && item.quotationItems.length > 0 ? (
                item.quotationItems.map((quotationItem, index) => (
                  <tr key={index} className="divide-x divide-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{quotationItem.item_code}</span>
                        <span className="text-xs text-gray-500">SKU</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{quotationItem.description}</span>
                        <span className="text-xs text-gray-500">Product Name</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-2">
                        {/* Product Image */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border">
                            <span className="text-xs text-gray-500">IMG</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">Variant Info</span>
                            <span className="text-xs text-gray-500">Color/Weight/Size</span>
                          </div>
                        </div>
                        {/* Additional variant details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-blue-50 px-2 py-1 rounded">
                            <span className="text-blue-700 font-medium">Category:</span>
                            <span className="text-blue-600 ml-1">Cosmetics</span>
                          </div>
                          <div className="bg-green-50 px-2 py-1 rounded">
                            <span className="text-green-700 font-medium">Weight:</span>
                            <span className="text-green-600 ml-1">250g</span>
                          </div>
                          <div className="bg-purple-50 px-2 py-1 rounded">
                            <span className="text-purple-700 font-medium">Batch:</span>
                            <span className="text-purple-600 ml-1">B2024-{index + 1}</span>
                          </div>
                          <div className="bg-orange-50 px-2 py-1 rounded">
                            <span className="text-orange-700 font-medium">Exp:</span>
                            <span className="text-orange-600 ml-1">Dec 2025</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-gray-900">{quotationItem.item_qty}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          units
                        </span>
                        {/* Stock status indicator */}
                        <div className="mt-2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">In Stock</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-gray-900">
                          Rs. {typeof quotationItem.unit_price !== "undefined" && quotationItem.unit_price !== null && !isNaN(Number(quotationItem.unit_price))
                            ? Number(quotationItem.unit_price).toLocaleString()
                            : "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">per unit</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-gray-900">
                          Rs. {typeof quotationItem.total_amount !== "undefined" && quotationItem.total_amount !== null && !isNaN(Number(quotationItem.total_amount))
                            ? Number(quotationItem.total_amount).toLocaleString()
                            : "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">line total</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {/* Delivery status badge */}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          📋 Ready to Pack
                        </span>
                        {/* Delivery priority */}
                        <span className="text-xs text-gray-500">
                          Priority: Normal
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    No product details available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Delivery Summary Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white px-3 py-2 rounded-lg border">
                  <span className="text-sm font-medium text-gray-700">Total Items: </span>
                  <span className="font-bold text-blue-600">
                    {Array.isArray(item.quotationItems)
                      ? item.quotationItems.reduce((sum, i) => sum + (i.item_qty || 0), 0)
                      : 0} units
                  </span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg border">
                  <span className="text-sm font-medium text-gray-700">Product Variants: </span>
                  <span className="font-bold text-purple-600">
                    {Array.isArray(item.quotationItems) ? item.quotationItems.length : 0}
                  </span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg border">
                  <span className="text-sm font-medium text-gray-700">Estimated Weight: </span>
                  <span className="font-bold text-green-600">
                    {Array.isArray(item.quotationItems)
                      ? (item.quotationItems.length * 0.25).toFixed(2)
                      : "0.00"} kg
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">📦 Packaging Notes:</p>
                <p className="text-xs text-gray-500">Handle with care • Fragile items • Keep upright</p>
              </div>
            </div>
          </div>
        </div>
        {/* Order Total */}
        <div className="mt-2 bg-slate-100 border border-slate-300 rounded-lg font-medium text-black">
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">Sub Total</div>
            <div className="flex-grow border border-white"></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {typeof item.sub_total !== "undefined" && item.sub_total !== null && !isNaN(Number(item.sub_total))
                ? Number(item.sub_total).toLocaleString()
                : "N/A"}
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">
              Discount ({item.discount}%)
            </div>
            <div className="flex-grow border border-white"></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {typeof item.sub_total !== "undefined" && typeof item.discount !== "undefined" && item.sub_total !== null && item.discount !== null && !isNaN(Number(item.sub_total)) && !isNaN(Number(item.discount))
                ? ((item.sub_total * item.discount) / 100).toLocaleString()
                : "N/A"}
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">Net Total</div>
            <div className="flex-grow border border-white"></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {typeof item.net_total !== "undefined" && item.net_total !== null && !isNaN(Number(item.net_total))
                ? Number(item.net_total).toLocaleString()
                : typeof item.total_amount !== "undefined" && item.total_amount !== null && !isNaN(Number(item.total_amount))
                  ? Number(item.total_amount).toLocaleString()
                  : "N/A"}
            </div>
          </div>
        </div>

        {/* Download invoice */}
        {userType === "002" && (
          <div>
            {isDownload || quotationStatus === 'Generate Invoice' && (
              <div className="w-full mt-2 flex flex-row items-center justify-end">
                <button
                  className={cn(
                    "w-fit py-2 px-6 bg-black rounded-md shadow-lg text-white",
                    "hover:bg-black/80",
                  )}
                  onClick={handleDownloadInvoice}
                >
                  Download
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons: Accept, Reject, Create Quotation */}
        <div className="mt-8 flex flex-row gap-4 justify-end">
          {orderStatus === "approved" ? (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              onClick={() => {
                /* TODO: Implement create invoice logic */
              }}
            >
              Create Invoice
            </button>
          ) : orderStatus === "rejected" ? null : !isOrderAccepted ? (
            <>
              <button
                className={cn(
                  "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition",
                  isUpdatingStatus && "cursor-not-allowed opacity-50"
                )}
                onClick={() => updateOrderStatus("approved")}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin mr-2" />
                    Approving...
                  </>
                ) : (
                  "Approve Order"
                )}
              </button>
              <button
                className={cn(
                  "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition",
                  isUpdatingStatus && "cursor-not-allowed opacity-50"
                )}
                onClick={() => updateOrderStatus("rejected")}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin mr-2" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Order"
                )}
              </button>
              <button
                className={cn(
                  "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition",
                  isCreatingQuotation && "cursor-not-allowed opacity-50"
                )}
                onClick={handleCreateQuotation}
                disabled={isCreatingQuotation}
              >
                {isCreatingQuotation ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Quotation"
                )}
              </button>
            </>
          ) : (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              onClick={() => {
                /* TODO: Implement create invoice logic */
              }}
            >
              Create Invoice
            </button>
          )}
        </div>
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

OrderDetails.propTypes = {
  item: PropTypes.shape({
    customer_id: PropTypes.string,
    sales_rep_id: PropTypes.string,
    quotation_id: PropTypes.string,
    status: PropTypes.string,
    quotationItems: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        quotation_id: PropTypes.string,
        item_code: PropTypes.string,
        item_qty: PropTypes.number,
        unit_price: PropTypes.number,
        total_amount: PropTypes.number,
        description: PropTypes.string,
      }),
    ),
    quotation_due_date: PropTypes.string,
    sub_total: PropTypes.number,
    discount: PropTypes.number,
    net_total: PropTypes.number,
    payment_term: PropTypes.string,
    company: PropTypes.string,
  }).isRequired,
};

export default OrderDetails;
