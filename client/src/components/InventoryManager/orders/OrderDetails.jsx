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
import { ChevronLeft } from "lucide-react";
import {Link} from "react-router-dom";

// eslint-disable-next-line react/prop-types
const OrderDetails = ({ item, changeOpen }) => {
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

  useEffect(() => {
    console.log("item: ", item);
    fetchCustomers(item.customer_id).then((data) => {
      setCustomerData(data);
    });
  }, [item]);

  const fetchCustomers = async (customerId) => {
    setUserType(user.type ? user.type : "");
    setIsLoading(true);
    try {
      const response = await getCustomerByUserCode(customerId);
      if (response.success) {
        console.log("customers: ", response.data.customer);
        // setCustomerData(response.data);
        return response.data.customer;
      } else {
        console.error("Error fetching customers");
        return null;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

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

  return (
    <div className="h-full py-3">
      {userType === "002" && (
        <div className="px-3">
          <button
            className="w-fit flex flex-row items-center gap-2 text-blue-600 hover:underline underline-offset-4"
            onClick={() => changeOpen()}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      )}

      {/* Billing Details */}
      <div className="mt-5 px-4 pt-2 pb-4 border rounded-lg">
        {/*<div className="-mt-5">*/}
        {/*  <h2 className="w-fit ms-2 px-2 bg-white text-base font-medium">*/}
        {/*    Billing Details*/}
        {/*  </h2>*/}
        {/*</div>*/}
        {isLoading ? (
          <div className="mt-3 flex flex-row items-center justify-center">
            <FaSpinner size={20} color="black" className="animate-spin" />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <InputWithLabel
                label="Customer Name"
                inputType="text"
                inputId="customerName"
                inputName="customer_name"
                value={customerData.first_name}
                readOnly={true}
                className="w-full text-black border-slate-300 focus-visible:ring-0 "
              />
            </div>
            <div>
              <InputWithLabel
                label="Email Address"
                inputType="email"
                inputId="emailAddress"
                inputName="customer_email"
                value={customerData.email}
                readOnly={true}
                className="w-full text-black border-slate-300 focus-visible:ring-0 "
              />
            </div>
            <div className="w-full lg:col-span-2 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="w-full lg:w-1/4">
                <InputWithLabel
                  label="Address Line 1"
                  inputType="text"
                  inputId="customerAddressLine1"
                  inputName="customer_addressLine1"
                  value={customerData.address_line1}
                  readOnly={true}
                  className="w-full text-black border-slate-300 focus-visible:ring-0 "
                />
              </div>
              <div className="w-full lg:w-1/4">
                <InputWithLabel
                  label="Address Line 2"
                  inputType="text"
                  inputId="customerAddressLine2"
                  inputName="customer_addressLine2"
                  value={customerData.address_line2}
                  readOnly={true}
                  className="w-full text-black border-slate-300 focus-visible:ring-0 "
                />
              </div>
              <div className="w-full lg:w-1/4">
                <InputWithLabel
                  label="City"
                  inputType="text"
                  inputId="city"
                  inputName="customer_city"
                  value={customerData.city}
                  readOnly={true}
                  className="w-full text-black border-slate-300 focus-visible:ring-0 "
                />
              </div>
              <div className="w-full lg:w-1/4">
                <InputWithLabel
                  label="Province"
                  inputType="text"
                  inputId="province"
                  inputName="customer_province"
                  value={customerData.province}
                  readOnly={true}
                  className="w-full text-black border-slate-300 focus-visible:ring-0 "
                />
              </div>
            </div>
            <div>
              <InputWithLabel
                label="Contact Number"
                inputType="text"
                inputId="contactNumber"
                inputName="contact_number"
                value={customerData.contact1}
                readOnly={true}
                className="w-full text-black border-slate-300 focus-visible:ring-0 "
              />
            </div>
            <div>
              <InputWithLabel
                label="WhatsApp Number"
                inputType="text"
                inputId="whatsappNumber"
                inputName="whatsapp_number"
                value={customerData.contact2}
                readOnly={true}
                className="w-full text-black border-slate-300 focus-visible:ring-0 "
              />
            </div>
          </div>
        )}
      </div>

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
            {/* Status Selector */}
            <div className="w-1/5">
              <div className="mb-1">
                <p className="ps-2 font-semibold">Status</p>
              </div>
              <div className="p-2 border border-gray-200 rounded-md">
                <select
                  name="order-status"
                  id="orderStatus"
                  className="w-full pe-2 focus-visible:outline-none"
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
        {/* Order Table */}
        <div className="mt-3 border rounded-lg border-slate-300">
          <table className="w-full divide-y divide-gray-300 text-sm bg-slate-100 rounded-lg shadow-sm text-black">
            <thead>
              <tr className="divide-x divide-gray-300">
                <th className="py-2 text-center">Code</th>
                <th className="py-2 text-center">Name</th>
                <th className="py-2 text-center">Quantity</th>
                <th className="py-2 text-center">Unit Price</th>
                <th className="py-2 text-center">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {item.quotationItems.map((quotationItem, index) => (
                <tr key={index} className="divide-x divide-gray-300">
                  <td className="py-2 px-4 text-start">
                    {quotationItem.item_code}
                  </td>
                  <td className="py-2 px-4 text-start">
                    {quotationItem.description}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {quotationItem.item_qty}
                  </td>
                  <td className="py-2 px-4 text-right">
                    Rs. {quotationItem.unit_price.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    Rs. {quotationItem.total_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Order Total */}
        <div className="mt-2 bg-slate-100 border border-slate-300 rounded-lg font-medium text-black">
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">Sub Total</div>
            <div className="flex-grow border border-white"></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {item.sub_total.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">
              Discount ({item.discount}%)
            </div>
            <div className="flex-grow border border-white"></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {(item.sub_total * item.discount) / 100}
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="w-fit py-2 px-4 text-start">Net Total</div>
            <div className="flex-grow border border-white"></div>
            <div className="w-fit py-2 px-4 text-end">
              Rs. {item.net_total.toLocaleString()}
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
