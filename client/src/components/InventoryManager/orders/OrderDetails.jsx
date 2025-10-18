import PropTypes from "prop-types";
import { InputWithLabel } from "@components/ui/InputWithLabel";
import { useEffect, useState, useRef, useCallback } from "react";
import { getCustomerByUserCode } from "@services/customer-services.js";
import { FaSpinner } from "react-icons/fa";
import { cn } from "@lib/utils.js";
import {updateQuotationStatus, updateQuotationItemsQuantity, getInvoice} from "@services/quotation-service.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/auth/AuthContext.jsx";
import { useTheme } from "../../../context/theme/ThemeContext.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ChevronLeft, Calendar, Hash, User, Users, DollarSign, Package, Activity } from "lucide-react";
import {Link} from "react-router-dom";

// eslint-disable-next-line react/prop-types
const OrderDetails = ({ item, changeOpen }) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [userType, setUserType] = useState();
  const [customerData, setCustomerData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isDownload, setIsDownload] = useState(
    item.status === "Paid Invoice");
  const [quotationStatus, setQuotationStatus] = useState(item.status);
  const [invoiceTerm, setInvoiceTerm] = useState(item.payment_term);
  const [company, setCompany] = useState(item.company);
  const invoiceRef = useRef();

  useEffect(() => {
    // console.log("=== DEBUG INFO ===");
    // console.log("item: ", item);
    // console.log("item.status: ", item.status);
    // console.log("quotationStatus: ", quotationStatus);
    // console.log("Status type:", typeof item.status);
    // console.log("Status trimmed:", item.status?.trim());
    // console.log("=================");
    
    // Fetch customer data from backend
    const fetchCustomerData = async () => {
      try {
        const response = await getCustomerByUserCode(item.customer_id);
        if (response.success) {
          setCustomerData(response.data);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    setUserType(user?.type || "002");
    fetchCustomerData();
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

  const handleDownloadInvoice = useCallback(async () => {
    try {
      // Add loading state to prevent multiple clicks
      setIsDownload(true);
      
      const input = invoiceRef.current;
      
      if (!input) {
        console.error("Invoice element not found");
        toast.error("Invoice element not found");
        return;
      }

      // Show loading state
      toast.info('Generating Invoice PDF...');

      // Use setTimeout to ensure DOM updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Temporarily make visible and position off-screen
      const originalStyle = input.style.cssText;
      input.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 210mm; background: white; padding: 20px;';
      input.classList.remove('hidden');
      
      // Force the header to show "INVOICE" by temporarily modifying the content
      const headerElement = input.querySelector('h1');
      const originalHeaderText = headerElement ? headerElement.textContent : '';
      if (headerElement) {
        headerElement.textContent = 'INVOICE';
      }
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Configure canvas for good quality
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: input.scrollWidth,
        height: input.scrollHeight,
      });

      // Restore original styling and content
      input.style.cssText = originalStyle;
      input.classList.add('hidden');
      if (headerElement) {
        headerElement.textContent = originalHeaderText;
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If content fits in one page, add it directly
      if (imgHeight <= pdfHeight) {
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.8), 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // Handle multi-page documents
        let currentY = 0;
        let pageNumber = 0;
        const pageHeightInPixels = (pdfHeight * canvas.height) / imgHeight;
        
        while (currentY < canvas.height) {
          if (pageNumber > 0) {
            pdf.addPage();
          }
          
          const sectionHeight = Math.min(pageHeightInPixels, canvas.height - currentY);
          
          // Create canvas for this page section
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sectionHeight;
          
          // Draw the section
          pageCtx.drawImage(
            canvas, 
            0, currentY, 
            canvas.width, sectionHeight,
            0, 0, 
            canvas.width, sectionHeight
          );
          
          // Calculate proportional height for PDF
          const pdfSectionHeight = (sectionHeight * imgWidth) / canvas.width;
          
          // Add to PDF
          pdf.addImage(
            pageCanvas.toDataURL('image/jpeg', 0.75),
            'JPEG', 
            0, 0, 
            imgWidth, pdfSectionHeight
          );
          
          currentY += sectionHeight;
          pageNumber++;
          
          // Safety break
          if (pageNumber > 10) break;
        }
      }

      // Generate filename and save PDF
      const filename = `Invoice_${item.quotation_id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Use setTimeout to ensure PDF generation doesn't block UI
      setTimeout(() => {
        pdf.save(filename);
        toast.success('Invoice downloaded successfully!');
        // Clean up PDF object
        pdf = null;
      }, 100);
      
    } catch (error) {
      console.error('Error generating Invoice PDF:', error);
      toast.error('Failed to generate Invoice PDF. Please try again.');
    } finally {
      // Ensure loading state is reset and navigation isn't blocked
      setTimeout(() => {
        setIsDownload(false);
        // Force cleanup of any canvas or PDF-related DOM changes
        const canvasElements = document.querySelectorAll('canvas[data-html2canvas-ignore]');
        canvasElements.forEach(canvas => canvas.remove());
      }, 1000);
    }
  }, [item.quotation_id]);

  const downloadPDF = useCallback(async () => {
    try {
      // Add loading state to prevent multiple clicks
      setIsDownload(true);
      
      const input = invoiceRef.current;
      
      if (!input) {
        console.error("Invoice element not found");
        toast.error("Invoice element not found");
        return;
      }

      // Determine if it's quotation or invoice based on status
      const currentStatus = (quotationStatus || item.status || '').toLowerCase().trim();
      const isInvoice = currentStatus === 'accepted' || currentStatus === 'inprogress' || currentStatus === 'completed';
      const documentType = isInvoice ? 'Invoice' : 'Quotation';

      // Show loading state
      toast.info(`Generating ${documentType} PDF...`);

      // Use setTimeout to ensure DOM updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Temporarily make the element visible for capture
      const originalStyle = input.style.cssText;
      input.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 210mm; background: white; padding: 20px;';
      input.classList.remove('hidden');
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Configure canvas for good quality
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: input.scrollWidth,
        height: input.scrollHeight,
      });

      // Restore original styling (hide again)
      input.style.cssText = originalStyle;
      input.classList.add('hidden');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If content fits in one page, add it directly
      if (imgHeight <= pdfHeight) {
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.8), 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // Handle multi-page documents
        let currentY = 0;
        let pageNumber = 0;
        const pageHeightInPixels = (pdfHeight * canvas.height) / imgHeight;
        
        while (currentY < canvas.height) {
          if (pageNumber > 0) {
            pdf.addPage();
          }
          
          const sectionHeight = Math.min(pageHeightInPixels, canvas.height - currentY);
          
          // Create canvas for this page section
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sectionHeight;
          
          // Draw the section
          pageCtx.drawImage(
            canvas, 
            0, currentY, 
            canvas.width, sectionHeight,
            0, 0, 
            canvas.width, sectionHeight
          );
          
          // Calculate proportional height for PDF
          const pdfSectionHeight = (sectionHeight * imgWidth) / canvas.width;
          
          // Add to PDF
          pdf.addImage(
            pageCanvas.toDataURL('image/jpeg', 0.75),
            'JPEG', 
            0, 0, 
            imgWidth, pdfSectionHeight
          );
          
          currentY += sectionHeight;
          pageNumber++;
          
          // Safety break
          if (pageNumber > 10) break;
        }
      }

      // Generate filename and save PDF
      const filename = `${documentType}_${item.quotation_id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Use setTimeout to ensure PDF generation doesn't block UI
      setTimeout(() => {
        pdf.save(filename);
        toast.success(`${documentType} downloaded successfully!`);
        // Clean up PDF object
        pdf = null;
      }, 100);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      // Ensure loading state is reset and navigation isn't blocked
      setTimeout(() => {
        setIsDownload(false);
        // Force cleanup of any canvas or PDF-related DOM changes
        const canvasElements = document.querySelectorAll('canvas[data-html2canvas-ignore]');
        canvasElements.forEach(canvas => canvas.remove());
      }, 1000);
    }
  }, [item.quotation_id, item.status, quotationStatus]);

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

  return (
    <div className={`h-full py-3 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`} key={`order-details-${item.quotation_id}`}>
      {/* Quick Action Button - Top */}
      <div className="px-3 mb-4">
        <button
          type="button"
          className={`w-fit flex flex-row items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            isDarkMode
              ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-800 border-blue-500 hover:border-blue-400'
              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 hover:border-blue-300'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Force a slight delay to ensure any ongoing operations complete
            setTimeout(() => {
              changeOpen();
            }, 100);
          }}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Go Back to Orders</span>
        </button>
      </div>

      {/* Order Summary Information */}
      <div className={`mt-5 px-4 pt-4 pb-4 border rounded-lg transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="-mt-6 mb-4">
          <h2 className={`w-fit ms-2 px-3 py-1 text-lg font-semibold border rounded-lg shadow-sm transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-800 text-gray-200 border-gray-600'
              : 'bg-white text-gray-800 border-gray-200'
          }`}>
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
                <p className="text-lg font-bold text-emerald-900">Rs. {item.net_total.toLocaleString()}</p>
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
        <div className={`mt-5 px-4 pt-4 pb-4 border rounded-lg transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="-mt-6 mb-4">
            <h2 className={`w-fit ms-2 px-3 py-1 text-lg font-semibold border rounded-lg shadow-sm transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-800 text-gray-200 border-gray-600'
                : 'bg-white text-gray-800 border-gray-200'
            }`}>
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
      <div className={`mt-8 px-4 pt-2 pb-4 border rounded-lg transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Order Title */}
        {/*<div className="-mt-5">*/}
        {/*  <h2 className="w-fit ms-2 px-2 bg-white text-base font-medium">*/}
        {/*    Order Details*/}
        {/*  </h2>*/}
        {/*</div>*/}
        {/* Order Status */}
        {userType === "002" && (
          <div className="w-full mt-4 flex flex-row gap-3">
            {/* Status Selector */}
            <div className="w-1/5">
              <div className="mb-1">
                <p className={`ps-2 font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Status</p>
              </div>
              <div className={`p-2 border rounded-md transition-colors duration-300 ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700' 
                  : 'border-gray-200 bg-white'
              }`}>
                <select
                  name="order-status"
                  id="orderStatus"
                  className={`w-full pe-2 focus-visible:outline-none transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-200' 
                      : 'bg-white text-gray-700'
                  }`}
                  value={quotationStatus}
                  onChange={(e) => {
                    setQuotationStatus(e.target.value);
                  }}
                >
                  <option value="Order Process Completed">
                    Order Process Completed
                  </option>
                  <option value="Generate Invoice">
                    Generate Invoice
                  </option>
                  <option value="Handover Delivery Team">
                    Handover Delivery Team
                  </option>
                  <option value="Delivered Officer - Chalaka">
                    Delivered Officer - Chalaka
                  </option>
                  <option value="Delivered Officer - Madushan">
                    Delivered Officer - Madushan
                  </option>
                  <option value="Delivered - Domex">Delivered - Domex</option>
                  <option value="Delivered Domex - Credit">
                    Delivered Domex - Credit
                  </option>
                  <option value="Paid Invoice">Paid Invoice</option>
                </select>
              </div>
            </div>
            {/* Invoice Terms */}
            <div className="w-3/5">
              {/* Terms Selector */}
              {quotationStatus === "Generate Invoice" && (
                <div className="w-full flex flex-row items-end gap-3">
                  {/* Payment Term */}
                  <div className="w-2/5">
                    <div className="mb-1">
                      <p className={`ps-2 font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Term</p>
                    </div>
                    <div className={`p-2 border rounded-md transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <select
                        name="invoice-terms"
                        id="invoiceTemrs"
                        className={`w-full pe-2 focus-visible:outline-none transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-200' 
                            : 'bg-white text-gray-700'
                        }`}
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
                      <p className={`ps-2 font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Company</p>
                    </div>
                    <div className={`p-2 border rounded-md transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <select
                        name="company"
                        id="company"
                        className={`w-full pe-2 focus-visible:outline-none transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-200' 
                            : 'bg-white text-gray-700'
                        }`}
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
                    "w-3/4 py-2 px-4 flex flex-row items-center justify-center gap-2 border rounded-md text-white transition-colors duration-300",
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                      : "bg-black hover:bg-black/80 border-black",
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
        <div className={`mt-3 border rounded-lg overflow-hidden transition-colors duration-300 ${
          isDarkMode 
            ? 'border-gray-700' 
            : 'border-slate-300'
        }`}>
          <div className={`px-4 py-3 border-b transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-slate-300'
          }`}>
            <h3 className={`font-semibold flex items-center gap-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              📦 Product Details for Delivery
            </h3>
            <p className={`text-sm mt-1 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Complete variant information for accurate delivery</p>
          </div>
          
          <table className={`w-full divide-y text-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'divide-gray-700 bg-gray-800' 
              : 'divide-gray-300 bg-white'
          }`}>
            <thead className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr className={`divide-x transition-colors duration-300 ${
                isDarkMode ? 'divide-gray-600' : 'divide-gray-300'
              }`}>
                <th className={`py-3 px-4 text-left font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Product Code</th>
                <th className={`py-3 px-4 text-left font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Product Name</th>
                <th className={`py-3 px-4 text-left font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Variant Details</th>
                <th className={`py-3 px-4 text-center font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Quantity to Deliver</th>
                <th className={`py-3 px-4 text-right font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Unit Price</th>
                <th className={`py-3 px-4 text-right font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Total Amount</th>
                <th className={`py-3 px-4 text-center font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Delivery Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              isDarkMode 
                ? 'divide-gray-700 bg-gray-800' 
                : 'divide-gray-200 bg-white'
            }`}>
              {item.quotationItems.map((quotationItem, index) => (
                <tr key={index} className={`divide-x transition-colors duration-300 ${
                  isDarkMode 
                    ? 'divide-gray-700 hover:bg-gray-700' 
                    : 'divide-gray-200 hover:bg-gray-50'
                }`}>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className={`font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>{quotationItem.item_code}</span>
                      <span className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>SKU</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className={`font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>{quotationItem.description}</span>
                      <span className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Product Name</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      {/* Product Image */}
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gray-100 border-gray-200'
                        }`}>
                          <span className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>IMG</span>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Variant Info</span>
                          <span className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Color/Weight/Size</span>
                        </div>
                      </div>
                      {/* Additional variant details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`px-2 py-1 rounded transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-blue-900/30 text-blue-300' 
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          <span className="font-medium">Category:</span>
                          <span className="ml-1">Cosmetics</span>
                        </div>
                        <div className={`px-2 py-1 rounded transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-green-900/30 text-green-300' 
                            : 'bg-green-50 text-green-600'
                        }`}>
                          <span className="font-medium">Weight:</span>
                          <span className="ml-1">250g</span>
                        </div>
                        <div className={`px-2 py-1 rounded transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-purple-900/30 text-purple-300' 
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          <span className="font-medium">Batch:</span>
                          <span className="ml-1">B2024-{index + 1}</span>
                        </div>
                        <div className={`px-2 py-1 rounded transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-orange-900/30 text-orange-300' 
                            : 'bg-orange-50 text-orange-600'
                        }`}>
                          <span className="font-medium">Exp:</span>
                          <span className="ml-1">Dec 2025</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>{quotationItem.item_qty}</span>
                      <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                        isDarkMode 
                          ? 'text-gray-400 bg-gray-700' 
                          : 'text-gray-500 bg-gray-100'
                      }`}>
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
                      <span className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        Rs. {quotationItem.unit_price.toLocaleString()}
                      </span>
                      <span className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>per unit</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        Rs. {quotationItem.total_amount.toLocaleString()}
                      </span>
                      <span className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>line total</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {/* Delivery status badge */}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        📋 Ready to Pack
                      </span>
                      {/* Delivery priority */}
                      <span className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Priority: Normal
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Delivery Summary Section */}
          <div className={`px-4 py-4 border-t transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600'
              : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`px-3 py-2 rounded-lg border transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Total Items: </span>
                  <span className="font-bold text-blue-600">{item.quotationItems.reduce((sum, item) => sum + item.item_qty, 0)} units</span>
                </div>
                <div className={`px-3 py-2 rounded-lg border transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Product Variants: </span>
                  <span className="font-bold text-purple-600">{item.quotationItems.length}</span>
                </div>
                <div className={`px-3 py-2 rounded-lg border transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Estimated Weight: </span>
                  <span className="font-bold text-green-600">{(item.quotationItems.length * 0.25).toFixed(2)} kg</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>📦 Packaging Notes:</p>
                <p className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>Handle with care • Fragile items • Keep upright</p>
              </div>
            </div>
          </div>
        </div>
        {/* Order Total */}
        <div className={`mt-2 border rounded-lg font-medium transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-gray-200' 
            : 'bg-slate-100 border-slate-300 text-black'
        }`}>
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">Sub Total</div>
            <div className={`flex-grow border transition-colors duration-300 ${
              isDarkMode ? 'border-gray-600' : 'border-white'
            }`}></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {item.sub_total.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">
              Discount ({item.discount}%)
            </div>
            <div className={`flex-grow border transition-colors duration-300 ${
              isDarkMode ? 'border-gray-600' : 'border-white'
            }`}></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {(item.sub_total * item.discount) / 100}
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">Net Total</div>
            <div className={`flex-grow border transition-colors duration-300 ${
              isDarkMode ? 'border-gray-600' : 'border-white'
            }`}></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {item.net_total.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons at Bottom */}
        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          {/* Download Button - Always visible, text and function changes based on status */}
          {(() => {
            const currentStatus = (quotationStatus || item.status || '').toLowerCase().trim();
            const isInvoiceStatus = currentStatus === 'accepted' || currentStatus === 'inprogress' || currentStatus === 'completed';
            const buttonText = isInvoiceStatus ? 'Download Invoice' : 'Download Quotation';
            
            return (
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  (isSubmit || isDownload) && "cursor-not-allowed opacity-50"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isSubmit && !isDownload) {
                    // Mark this as a PDF generation operation
                    window.pdfGenerationTimer = setTimeout(() => {
                      if (isInvoiceStatus) {
                        handleDownloadInvoice();
                      } else {
                        downloadPDF();
                      }
                    }, 10);
                  }
                }}
                disabled={isSubmit || isDownload}
              >
                {(isSubmit || isDownload) ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {buttonText}
                  </>
                )}
              </button>
            );
          })()}

          {/* Accept Button - Only show when status is exactly "Pending" */}
          {(() => {
            const currentStatus = (quotationStatus || item.status || '').toLowerCase().trim();
            const isPending = currentStatus === 'pending';
            
            return isPending && (
              <button
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                onClick={async () => {
                  setIsSubmit(true);
                  try {
                    // Call backend API to update order status
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                      `${import.meta.env.VITE_API_URL}/orders/status/${item.order_id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          status: "approved",
                        }),
                      }
                    );
                    const result = await response.json();
                    if (response.ok && result.success) {
                      setQuotationStatus('Accepted');
                      toast.success('Order accepted successfully!');
                    } else {
                      throw new Error(result.message || "Failed to accept order");
                    }
                  } catch (error) {
                    toast.error('Failed to accept order');
                    console.error(error);
                  } finally {
                    setIsSubmit(false);
                  }
                }}
                disabled={isSubmit}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept Order
                {isSubmit && <FaSpinner className="ml-2 animate-spin" />}
              </button>
            );
          })()}

          {/* Reject Button - Only show when status is exactly "Pending" */}
          {(() => {
            const currentStatus = (quotationStatus || item.status || '').toLowerCase().trim();
            const isPending = currentStatus === 'pending';
            
            return isPending && (
              <button
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                onClick={async () => {
                  setIsSubmit(true);
                  try {
                    // Call backend API to update order status
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                      `${import.meta.env.VITE_API_URL}/orders/status/${item.order_id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          status: "rejected",
                        }),
                      }
                    );
                    const result = await response.json();
                    if (response.ok && result.success) {
                      setQuotationStatus('Rejected');
                      toast.success('Order rejected successfully!');
                    } else {
                      throw new Error(result.message || "Failed to reject order");
                    }
                  } catch (error) {
                    toast.error('Failed to reject order');
                    console.error(error);
                  } finally {
                    setIsSubmit(false);
                  }
                }}
                disabled={isSubmit}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Order
                {isSubmit && <FaSpinner className="ml-2 animate-spin" />}
              </button>
            );
          })()}
        </div>
      </div>

      {/* Hidden Quotation/Invoice Content for PDF Generation */}
      <div ref={invoiceRef} className="hidden">
        <div className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
          {/* Header Section */}
          <div className="bg-black text-white p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {(() => {
                    const currentStatus = (quotationStatus || item.status || '').toLowerCase().trim();
                    const isInvoice = currentStatus === 'accepted' || currentStatus === 'inprogress' || currentStatus === 'completed';
                    return isInvoice ? 'INVOICE' : 'QUOTATION';
                  })()}
                </h1>
                <p className="text-gray-300 mt-2">TROLLIOUS COSMETICS (PVT) LTD.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">#{item.quotation_id}</div>
                <div className="text-gray-300 mt-1">
                  Date: {new Date(item.quotation_date || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Company and Customer Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* From Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">FROM</h3>
              <div className="text-gray-700">
                <p className="font-bold text-lg">TROLLIOUS COSMETICS (PVT) LTD.</p>
                <p>No 182, Kuruppumulla Road</p>
                <p>Panadura, 12500</p>
                <p>Phone: 0707 577 500 / 502</p>
                <p className="mt-2 text-sm text-gray-600">Sales Rep: {item.sales_rep_id}</p>
              </div>
            </div>

            {/* To Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">TO</h3>
              <div className="text-gray-700">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    <span>Loading customer details...</span>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-lg">
                      {customerData?.first_name || ''} {customerData?.last_name || ''}
                    </p>
                    <p>Customer ID: {item.customer_id}</p>
                    <p>{customerData?.address_line1 || ''}</p>
                    {customerData?.address_line2 && <p>{customerData.address_line2}</p>}
                    <p>{customerData?.city || ''}, {customerData?.province || ''}</p>
                    <p>{customerData?.postal_code || ''}</p>
                    {customerData?.phone && <p>Phone: {customerData.phone}</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-700">Due Date:</span>
                <p className="mt-1">
                  {new Date(item.quotation_due_date || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-700">Payment Terms:</span>
                <p className="mt-1">{item.payment_term || 'Cash'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-700">Company:</span>
                <p className="mt-1">{item.company || 'Trollius'}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold">Item Code</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                  <th className="border border-gray-300 p-3 text-center font-semibold">Quantity</th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">Unit Price</th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {item.quotationItems.map((quotationItem, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">{quotationItem.item_code}</td>
                    <td className="border border-gray-300 p-3">{quotationItem.description}</td>
                    <td className="border border-gray-300 p-3 text-center">{quotationItem.item_qty}</td>
                    <td className="border border-gray-300 p-3 text-right">
                      Rs. {quotationItem.unit_price.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">
                      Rs. {quotationItem.total_amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="font-medium">Sub Total:</span>
                  <span className="font-semibold">Rs. {item.sub_total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="font-medium">Discount ({item.discount}%):</span>
                  <span className="font-semibold">Rs. {((item.sub_total * item.discount) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-black text-white px-4 -mx-4 -mb-4 rounded-b-lg">
                  <span className="font-bold text-lg">Net Total:</span>
                  <span className="font-bold text-xl">Rs. {item.net_total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              Terms & Conditions
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>• Payment is due within {item.payment_term || 'agreed terms'}</p>
              <p>• All prices are in Sri Lankan Rupees (LKR)</p>
              <p>• Goods once sold will not be taken back or exchanged</p>
              <p>• Interest will be charged on overdue amounts</p>
              <p>• All disputes are subject to Panadura jurisdiction</p>
            </div>
          </div>

          {/* Bank Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              Bank Details
            </h3>
            <div className="text-sm text-gray-700 grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Account Name:</span> Trollious Cosmetics (Pvt) Ltd</p>
                <p><span className="font-medium">Account Number:</span> 1000429495</p>
              </div>
              <div>
                <p><span className="font-medium">Bank:</span> Commercial Bank</p>
                <p><span className="font-medium">Branch:</span> Panadura City Office</p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-12">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="border-b border-gray-400 mb-2 h-12"></div>
                <p className="text-sm font-medium">Approved Signature</p>
                <p className="text-xs text-gray-600 mt-1">TROLLIOUS COSMETICS (PVT) LTD.</p>
              </div>
              <div>
                <div className="border-b border-gray-400 mb-2 h-12"></div>
                <p className="text-sm font-medium">Customer Signature</p>
                <p className="text-xs text-gray-600 mt-1">Date: _______________</p>
              </div>
              <div>
                <div className="border-b border-gray-400 mb-2 h-12"></div>
                <p className="text-sm font-medium">Authorized Signature</p>
                <p className="text-xs text-gray-600 mt-1">Finance Department</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-300 pt-4">
            <p className="font-medium">Thank you for your business!</p>
            <p className="mt-2">For any queries, please contact us at 0707 577 500 / 502</p>
          </div>
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
    quotation_date: PropTypes.string,
    quotation_due_date: PropTypes.string,
    sub_total: PropTypes.number,
    discount: PropTypes.number,
    net_total: PropTypes.number,
    payment_term: PropTypes.string,
    company: PropTypes.string,
    quotationItems: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        quotation_id: PropTypes.string,
        item_code: PropTypes.string,
        item_qty: PropTypes.number,
        unit_price: PropTypes.number,
        total_amount: PropTypes.number,
        description: PropTypes.string,
      }),
    ),
  }).isRequired,
  changeOpen: PropTypes.func.isRequired,
};

export default OrderDetails;
