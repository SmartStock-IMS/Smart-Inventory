import {useEffect, useState} from "react";
import {dailySummary} from "@services/report-service.js";
import {FaSpinner} from "react-icons/fa";
import { NotebookPen } from "lucide-react";

const DailySummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dailySummaryData, setDailySummaryData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const today = new Date().toISOString().split("T")[0];
  const [reportDate, setReportDate] = useState(today);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const result = await dailySummary(reportDate);
        console.log("result", result);
        if (result.success) {
          setDailySummaryData(result.data.data);
        } else {
          console.error("No data found");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }) ();
  }, [reportDate]);

  const statusOptions = ["All", ...new Set(dailySummaryData.map((data) => data.status))];

  const filteredData = dailySummaryData.filter((data) => {
    return statusFilter === "All" || data.status === statusFilter;
  });

  const handleExportSummary = () => {
    console.log("dailySummary: ", dailySummaryData);
    exportToCSV(dailySummaryData, "daily-summary.csv");
  }

  // export to csv file
  function exportToCSV(arr, filename = 'data.csv') {
    // convert the array of objects to CSV format
    const keys = Object.keys(arr[0]); // extract keys as the CSV header (column names)
    const csvRows = [];

    // add the header row
    csvRows.push(keys.join(','));

    // Add data rows
    for (const row of arr) {
      const values = keys.map(key => row[key]);
      csvRows.push(values.join(','));
    }

    // create the CSV content (combine all rows into a single string)
    const csvData = csvRows.join('\n');

    // create a Blob from the CSV data and trigger a download
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // create an anchor element and simulate a click to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // clean up the URL object
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full h-full p-2 bg-white rounded-md">
      {/* summary: heading */}
      <div className="h-[10%] px-4 flex flex-row items-center justify-between border-b border-gray-500">
        {/* heading: title */}
        <div className="flex flex-row items-center gap-3">
          <NotebookPen className="w-5 h-5" />
          <h2 className="text-lg font-bold">Daily Summary</h2>
        </div>
        {/* heading: action-button */}
        <div className="flex flex-row items-start">
          <button onClick={handleExportSummary} className="px-4 py-2 rounded-lg bg-gray-950 text-white hover:bg-gray-800">Export Summary</button>
        </div>
      </div>

      {/* summary: content */}
      <div className="h-[90%] pt-4 px-4 rounded-lg">
        <div className="flex flex-row items-center justify-between">
          <div className="w-fit mb-3 pe-4 border rounded-md">
            <select
              className="p-2 text-sm focus-visible:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              className="mb-3 px-6 py-2 border rounded-lg"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>
        </div>
        <table className="w-full divide-y divide-gray-300 bg-gray-100 rounded-md text-sm">
          <thead>
            <tr className="divide-x divide-gray-300">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Customer ID</th>
              <th className="py-2 px-3">Sales Rep ID</th>
              <th className="py-2 px-3">No. Items</th>
              <th className="py-2 px-3">Order Total</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {}
            {isLoading ? (
              <tr className="border-b border-gray-300 divide-x divide-gray-300">
                <td colSpan={7} className="py-4 px-3 text-center">
                  <div className="w-full flex flex-row items-center justify-center">
                    <FaSpinner
                      size={20}
                      color="black"
                      className="animate-spin"
                    />
                  </div>
                </td>
              </tr>
            ) : (
              dailySummaryData.length === 0 ? (
                <tr className="border-b border-gray-300 divide-x divide-gray-300">
                  <td colSpan={7} className="py-2 px-3 text-center">No records for the day.</td>
                </tr>
              ) : (
                filteredData.map((data, index) => (
                  <tr key={index} className="border-b border-gray-300 divide-x divide-gray-300">
                    <td className="py-2 px-3 text-center">{data.quotation_id}</td>
                    <td className="py-2 px-3 text-center">{new Date(data.quotation_date).toLocaleDateString()}</td>
                    <td className="py-2 px-3 text-center">{data.customer_id}</td>
                    <td className="py-2 px-3 text-center">{data.sales_rep_id}</td>
                    <td className="py-2 px-3 text-center">{data.no_items}</td>
                    <td className="py-2 px-3 text-center">{data.net_total}</td>
                    <td className="py-2 px-3 text-center">{data.status}</td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailySummary;