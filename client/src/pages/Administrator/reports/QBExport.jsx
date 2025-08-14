import { useEffect, useState } from "react";
import { qbSummary } from "@services/report-service.js";
import { CloudDownload } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QbExport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [qbSummaryData, setQbSummaryData] = useState({});
  const [reportDate, setReportDate] = useState(today);

  useEffect(() => {
    (async () => {
      try {
        console.log("reportDate: ", reportDate);
        const result = await qbSummary(reportDate);
        console.log("result", result);
        if (result.success) {
          const { data } = result.data;

          const reportData = data.flatMap((flatItem) => {
            const invoiceQuotation = flatItem["invoice-quotations"];
            console.log("invoiceQuotation", invoiceQuotation);

            return invoiceQuotation[0].quotationItems.map((item) => ({
              quotationId: invoiceQuotation[0].quotation_id,
              quotationDate: new Date(invoiceQuotation[0].quotation_date)
                .toISOString()
                .split("T")[0],
              invoiceId: flatItem.invoice_no,
              invoiceDate: new Date(flatItem.createdAt)
                .toISOString()
                .split("T")[0],
              customer_id: invoiceQuotation[0].customer_id,
              customer_name:
                invoiceQuotation[0].quotationCustomer[0].first_name,
              terms: invoiceQuotation[0].payment_term,
              dueDate: new Date(invoiceQuotation[0].quotation_due_date)
                .toISOString()
                .split("T")[0],
              company: invoiceQuotation[0].company,
              status: invoiceQuotation[0].status,
              salesRep: invoiceQuotation[0].sales_rep_id,
              itemCode: item.item_code,
              description: item.description,
              quantity: item.item_qty,
              unitPrice: item.unit_price,
              amount: item.total_amount,
            }));
          });

          console.log("report-data: ", reportData);

          setQbSummaryData(reportData);
        } else {
          console.error("No data found");
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [reportDate]);

  const handleExportSummary = () => {
    // validate qbSummaryData array
    if (Array.isArray(qbSummaryData) && !qbSummaryData.length) {
      toast.info("No data found for today.");
      return null;
    }

    exportToCSV(qbSummaryData, "qb-data.csv");
  };

  function exportToCSV(arr, filename = "qb.csv") {
    // convert the array of objects to CSV format
    const keys = Object.keys(arr[0]); // extract keys as the CSV header (column names)
    const csvRows = [];

    // add the header row
    csvRows.push(keys.join(","));

    // Add data rows
    for (const row of arr) {
      const values = keys.map((key) => row[key]);
      csvRows.push(values.join(","));
    }

    // create the CSV content (combine all rows into a single string)
    const csvData = csvRows.join("\n");

    // create a Blob from the CSV data and trigger a download
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // create an anchor element and simulate a click to download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    // clean up the URL object
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-full p-2 bg-white rounded-md">
      <div className="h-[10%] px-4 flex flex-row items-center gap-2 border-b border-gray-500">
        <CloudDownload className="w-6 h-6" />
        <h2 className="text-lg font-bold">Quick Book Export</h2>
      </div>
      <div className="h-[90%] p-4">
        <div className="flex flex-row items-center gap-2">
          <p>Download Report:</p>
          <div className="flex flex-row items-center gap-3">
            <div>
              <input
                type="date"
                className="px-6 py-2 border rounded-lg"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleExportSummary}
              className="px-6 py-2 rounded-lg bg-gray-950 text-white hover:bg-gray-800"
            >
              QB Data
            </button>
          </div>
        </div>
      </div>
      <ToastContainer autoClose={3000} />
    </div>
  );
};

export default QbExport;
