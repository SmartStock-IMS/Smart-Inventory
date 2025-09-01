import { useRef } from "react";
import { Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Mock functions for demo
const generateId = (prefix) => `${prefix}${Date.now()}`;
const useCart = () => ({
  clearCart: () => console.log("Cart cleared")
});

// Mock data for demo
const mockCartState = {
  selectedItems: [
    { id: 1, code: "ITEM001", name: "Premium Product", color: "Blue", quantity: 2, price: 15000 },
    { id: 2, code: "ITEM002", name: "Standard Product", color: "Red", quantity: 1, price: 8500 },
    { id: 3, code: "ITEM003", name: "Deluxe Product", color: "Green", quantity: 3, price: 12000 }
  ],
  subtotal: 66000,
  discount: 10,
  total: 59400
};

const mockBillingDetails = {
  firstName: "John",
  lastName: "Doe",
  addressLine1: "123 Business Street",
  addressLine2: "Suite 456",
  city: "Colombo",
  district: "Colombo",
  province: "Western",
  postalCode: "00100",
  contactNumber: "077 123 4567",
  email: "john.doe@email.com"
};

const mockQuotationData = {
  quotation_id: "QT202501001",
  quotation_date: "2025-01-15",
  quotation_due_date: "2025-02-15"
};

const Invoice = ({ cartState = mockCartState, billingDetails = mockBillingDetails, quotationData = mockQuotationData }) => {
  const invoiceRef = useRef();
  const { clearCart } = useCart();

  const downloadPDF = async () => {
    try {
      const input = invoiceRef.current;
      
      if (!input) {
        console.error("Invoice element not found");
        return;
      }

      // Show loading state
      const downloadButton = document.querySelector('[data-download-btn]');
      if (downloadButton) {
        downloadButton.disabled = true;
        downloadButton.innerHTML = '<div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>Generating PDF...';
      }

      // Configure canvas for good quality with reasonable file size
      const canvas = await html2canvas(input, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: input.scrollWidth,
        height: input.scrollHeight,
      });

      // Create PDF with compression
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
        // Smart page breaking - detect component boundaries
        const components = input.querySelectorAll('[data-keep-together="true"]');
        const componentPositions = [];
        
        // Get component positions and heights
        Array.from(components).forEach((component, index) => {
          const rect = component.getBoundingClientRect();
          const inputRect = input.getBoundingClientRect();
          const relativeTop = rect.top - inputRect.top + input.scrollTop;
          const relativeHeight = rect.height;
          
          componentPositions.push({
            index,
            top: relativeTop,
            height: relativeHeight,
            bottom: relativeTop + relativeHeight
          });
        });

        // Calculate page breaks that respect component boundaries
        let currentY = 0;
        let pageNumber = 0;
        const pageHeightInPixels = (pdfHeight * canvas.height) / imgHeight;
        
        while (currentY < canvas.height) {
          if (pageNumber > 0) {
            pdf.addPage();
          }
          
          let nextPageY = currentY + pageHeightInPixels;
          
          // Find components that would be split by this page break
          const componentsInRange = componentPositions.filter(comp => 
            comp.top < nextPageY && comp.bottom > nextPageY
          );
          
          // If any component would be split, adjust the page break
          if (componentsInRange.length > 0) {
            const firstSplitComponent = componentsInRange[0];
            
            // Check if moving the component to next page makes sense
            const spaceAvailable = nextPageY - currentY;
            const componentHeight = firstSplitComponent.height;
            
            // If component takes more than 70% of available space, move it to next page
            if (componentHeight < spaceAvailable * 0.7) {
              // Keep component on current page
              nextPageY = firstSplitComponent.bottom;
            } else {
              // Move component to next page
              nextPageY = firstSplitComponent.top;
            }
          }
          
          // Ensure we don't create empty pages or infinite loops
          let sectionHeight = Math.min(nextPageY - currentY, canvas.height - currentY);
          if (sectionHeight <= 0) {
            sectionHeight = Math.min(pageHeightInPixels, canvas.height - currentY);
          }
          
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
          
          // Add to PDF with JPEG compression
          pdf.addImage(
            pageCanvas.toDataURL('image/jpeg', 0.75),
            'JPEG', 
            0, 0, 
            imgWidth, pdfSectionHeight
          );
          
          currentY = nextPageY;
          pageNumber++;
          
          // Safety break to prevent infinite loops
          if (pageNumber > 10) break;
        }
      }

      // Generate filename
      const filename = `Quotation_${quotationData.quotation_id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      pdf.save(filename);
      
      // Clear cart
      clearCart();
      
      // Reset button
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Download Quotation';
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Reset button on error
      const downloadButton = document.querySelector('[data-download-btn]');
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Download Failed - Retry';
      }
      
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Download Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={downloadPDF}
            data-download-btn="true"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download Quotation
          </button>
        </div>

        {/* Invoice Container */}
        <div 
          ref={invoiceRef} 
          data-invoice-content="true"
          className="bg-white shadow-xl rounded-lg overflow-hidden border-2 border-black"
          style={{ pageBreakInside: 'avoid' }}
        >
          {/* Header Section */}
          <div className="bg-black text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">QUOTATION</h1>
                  <p className="text-gray-200 mt-1">Professional Business Document</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
                  <p className="text-lg font-semibold">QT ID: {quotationData.quotation_id}</p>
                  <p className="text-gray-200">DATE: {quotationData.quotation_date}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Document Info and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" data-keep-together="true" style={{ pageBreakInside: 'avoid' }}>
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
                <h3 className="font-semibold text-black mb-3">Document Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Quotation ID:</span> {quotationData.quotation_id}</p>
                  <p><span className="font-medium">Issue Date:</span> {quotationData.quotation_date}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-400">
                <h3 className="font-semibold text-black mb-3">Terms & Conditions</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">TERMS:</span> Due upon receipt</p>
                  <p><span className="font-medium">DUE DATE:</span> {quotationData.quotation_due_date}</p>
                  <p><span className="font-medium">REP:</span> KG</p>
                  <p><span className="font-medium">VIA:</span> Direct</p>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-8" data-keep-together="true" style={{ pageBreakInside: 'avoid' }}>
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
                <h2 className="font-bold text-black mb-4 text-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  Bill To
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="font-semibold text-black">{billingDetails.firstName} {billingDetails.lastName}</p>
                    <p className="text-gray-700">{billingDetails.addressLine1}</p>
                    {billingDetails.addressLine2 && <p className="text-gray-700">{billingDetails.addressLine2}</p>}
                    <p className="text-gray-700">{billingDetails.city}, {billingDetails.district}</p>
                    <p className="text-gray-700">{billingDetails.province}, {billingDetails.postalCode}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-700"><span className="font-medium">Tel:</span> {billingDetails.contactNumber}</p>
                    <p className="text-gray-700"><span className="font-medium">Email:</span> {billingDetails.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8" data-keep-together="true" style={{ pageBreakInside: 'avoid' }}>
              <div className="bg-white border-2 border-black rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="py-4 px-4 text-left font-semibold border-r border-gray-600">ITEM CODE</th>
                        <th className="py-4 px-4 text-left font-semibold border-r border-gray-600">DESCRIPTION</th>
                        <th className="py-4 px-4 text-right font-semibold border-r border-gray-600">QUANTITY</th>
                        <th className="py-4 px-4 text-right font-semibold border-r border-gray-600">UNIT PRICE</th>
                        <th className="py-4 px-4 text-right font-semibold">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartState.selectedItems.map((item, index) => (
                        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b-2 border-gray-300`}>
                          <td className="py-4 px-4 font-medium text-black border-r border-gray-300">{item.code}</td>
                          <td className="py-4 px-4 text-gray-700 border-r border-gray-300">{item.name} ({item.color})</td>
                          <td className="py-4 px-4 text-right text-gray-700 border-r border-gray-300">{item.quantity}</td>
                          <td className="py-4 px-4 text-right text-gray-700 border-r border-gray-300">Rs.{item.price.toLocaleString()}</td>
                          <td className="py-4 px-4 text-right font-semibold text-black">Rs.{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="flex justify-end mb-8" data-keep-together="true" style={{ pageBreakInside: 'avoid' }}>
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-400 min-w-80">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold text-black">Rs.{cartState.subtotal.toLocaleString()}</span>
                  </div>
                  {cartState.discount > 0 && (
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Discount ({cartState.discount}%):</span>
                      <span className="font-semibold">-Rs.{((cartState.subtotal * cartState.discount) / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-400 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-black">Total:</span>
                      <span className="text-xl font-bold text-black">Rs.{cartState.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note and Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" data-keep-together="true" style={{ pageBreakInside: 'avoid' }}>
              <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-400">
                <p className="font-bold text-black mb-2">Note: Thanks For your business</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
                <p className="font-bold text-black mb-3">Account Details:</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><span className="font-medium">Account Name:</span> ABC (PVT) LTD.</p>
                  <p><span className="font-medium">Account Number:</span> 9516</p>
                  <p><span className="font-medium">Bank:</span> Commercial Bank</p>
                  <p><span className="font-medium">Branch:</span> Panadura City Office</p>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-keep-together="true" style={{ pageBreakInside: 'avoid' }}>
              <div className="text-center">
                <div className="border-t-2 border-black pt-4">
                  <p className="font-medium text-black">Approved Signature</p>
                  <p className="text-gray-700 text-sm mt-1">ABC (PVT) LTD.</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-black pt-4">
                  <p className="font-medium text-black">Customer Signature</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-black pt-4">
                  <p className="font-medium text-black">Authorised Signature</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center bg-black text-white rounded-lg p-6 border-2 border-black" data-keep-together="true">
              <div className="space-y-1">
                <p className="font-medium">ABC (PVT) LTD.</p>
                <p>No 123, Katubedda Road,</p>
                <p>Moratuwa, 12500</p>
                <p className="font-medium">070 517 1707</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;