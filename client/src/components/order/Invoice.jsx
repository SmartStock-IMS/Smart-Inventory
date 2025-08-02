import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import generateId from "@lib/generate-id";
import {useCart} from "../../context/cart/CartContext.jsx";

// eslint-disable-next-line react/prop-types
const Invoice = ({ cartState, billingDetails, quotationData }) => {
  const invoiceRef = useRef();

  const { clearCart } = useCart();

  // const quotationId = generateId("QT");
  // const currentDate = new Date().toISOString().split("T")[0];
  // const initDueDate = new Date();
  // initDueDate.setMonth(new Date().getMonth() + 1);
  // const dueDate = initDueDate.toISOString().split("T")[0];

  const downloadPDF = async () => {
    const input = invoiceRef.current;
    
    // Get all section elements that should stay together
    const sections = input.querySelectorAll('[data-keep-together="true"]');
    const originalDisplay = [];
    
    // Store original display values and temporarily hide all sections
    sections.forEach((section, index) => {
      originalDisplay[index] = section.style.display;
      section.style.display = 'none';
    });

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 792,
      windowHeight: input.scrollHeight
    });

    // Restore original display values
    sections.forEach((section, index) => {
      section.style.display = originalDisplay[index];
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;

    // Calculate the scaled image height
    const scaledImgHeight = imgHeight * ratio;
    
    // Calculate the height of each section in PDF points
    const sectionHeights = Array.from(sections).map(section => {
      return section.offsetHeight * ratio;
    });

    // Calculate number of pages needed
    const totalPages = Math.ceil(scaledImgHeight / pdfHeight);

    // Add each page
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const sourceY = page * (pdfHeight / ratio);
      let yOffset = 0;

      // Check if any section would be split at this page break
      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop * ratio;
        const sectionBottom = sectionTop + sectionHeights[index];
        const pageBottom = (page + 1) * pdfHeight;

        // If section would be split, adjust yOffset to move it to next page
        if (sectionTop < pageBottom && sectionBottom > pageBottom) {
          yOffset = sectionBottom - pageBottom;
        }
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        -(sourceY * ratio) - yOffset,
        pdfWidth,
        scaledImgHeight
      );
    }

    pdf.save("invoice.pdf");
    clearCart();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-end">
        <button
          onClick={downloadPDF}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Download Quotation
        </button>
      </div>

      <div ref={invoiceRef} className="max-w-3xl mx-auto bg-white p-4 md:p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">QUOTATION</h1>
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div>
              <p className="text-base text-start">QT ID : {quotationData.quotation_id}</p>
              <p className="text-base text-start">DATE : {quotationData.quotation_date}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm md:text-base">TERMS: Due upon receipt</p>
              <p className="text-sm md:text-base">DUE DATE: {quotationData.quotation_due_date}</p>
              <p className="text-sm md:text-base">REP: KG</p>
              <p className="text-sm md:text-base">VIA: Direct</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-bold mb-2 text-sm md:text-base">Bill To</h2>
          <div className="text-sm md:text-base">
            <p>{billingDetails.firstName} {billingDetails.lastName}</p>
            <p>{billingDetails.addressLine1}</p>
            {billingDetails.addressLine2 && <p>{billingDetails.addressLine2}</p>}
            <p>{billingDetails.city}, {billingDetails.district}</p>
            <p>{billingDetails.province}, {billingDetails.postalCode}</p>
            <p>Tel: {billingDetails.contactNumber}</p>
            <p>Email: {billingDetails.email}</p>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2 text-left text-sm md:text-base">ITEM CODE</th>
                <th className="py-2 text-left text-sm md:text-base">DESCRIPTION</th>
                <th className="py-2 text-right text-sm md:text-base">QUANTITY</th>
                <th className="py-2 text-right text-sm md:text-base">UNIT PRICE</th>
                <th className="py-2 text-right text-sm md:text-base">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {cartState.selectedItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 text-sm md:text-base">{item.code}</td>
                  <td className="py-2 text-sm md:text-base">{item.name} ({item.color})</td>
                  <td className="py-2 text-right text-sm md:text-base">{item.quantity}</td>
                  <td className="py-2 text-right text-sm md:text-base">Rs.{item.price.toLocaleString()}</td>
                  <td className="py-2 text-right text-sm md:text-base">Rs.{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="text-right text-sm md:text-base">
            <p className="font-bold">Subtotal: Rs.{cartState.subtotal.toLocaleString()}</p>
            {cartState.discount > 0 && (
              <p className="font-bold">Discount ({cartState.discount}%): -Rs.{((cartState.subtotal * cartState.discount) / 100).toLocaleString()}</p>
            )}
            <p className="font-bold text-base md:text-lg">Total: Rs.{cartState.total.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-8 text-sm md:text-base">
          <p className="font-bold mb-2">Note: Thanks For your business</p>
          <div className="mb-4">
            <p className="font-bold">Account Details:</p>
            <p>Account Name: Trollious Cosmetics (Pvt) Ltd</p>
            <p>Account Number: 1000429495</p>
            <p>Bank: Commercial Bank</p>
            <p>Branch: Panadura City Office</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-sm md:text-base">Approved Signature</p>
              <p className="text-sm md:text-base">TROLLIOUS COSMETICS (PVT) LTD.</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-sm md:text-base">Customer Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-sm md:text-base">Authorised Signature</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs md:text-sm" data-keep-together="true">
          <p>No 182,</p>
          <p>Kuruppumulla Road,</p>
          <p>Panadura, 12500</p>
          <p>0707 577 500 / 502</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;