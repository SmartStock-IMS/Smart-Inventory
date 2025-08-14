import {useEffect, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import { NotebookPen, Download, Calendar, Filter, TrendingUp, FileText, Users, Package } from "lucide-react";

// Mock data for testing
const mockDailySummaryData = [
  {
    quotation_id: "QUO001",
    quotation_date: "2025-08-13", // Today's date
    customer_id: "CUST001",
    sales_rep_id: "EMP001",
    no_items: 5,
    net_total: 15750.00,
    status: "Completed"
  },
  {
    quotation_id: "QUO002",
    quotation_date: "2025-08-13", // Today's date
    customer_id: "CUST002",
    sales_rep_id: "EMP002",
    no_items: 3,
    net_total: 8900.50,
    status: "Pending"
  },
  {
    quotation_id: "QUO003",
    quotation_date: "2025-08-13", // Today's date
    customer_id: "CUST003",
    sales_rep_id: "EMP001",
    no_items: 7,
    net_total: 22300.75,
    status: "Processing"
  },
  {
    quotation_id: "QUO004",
    quotation_date: "2025-08-13", // Today's date
    customer_id: "CUST004",
    sales_rep_id: "EMP003",
    no_items: 2,
    net_total: 5600.00,
    status: "Completed"
  },
  {
    quotation_id: "QUO005",
    quotation_date: "2025-08-12",
    customer_id: "CUST005",
    sales_rep_id: "EMP002",
    no_items: 4,
    net_total: 12450.25,
    status: "Cancelled"
  },
  {
    quotation_id: "QUO006",
    quotation_date: "2025-08-12",
    customer_id: "CUST006",
    sales_rep_id: "EMP001",
    no_items: 6,
    net_total: 18900.00,
    status: "Pending"
  },
  {
    quotation_id: "QUO007",
    quotation_date: "2025-08-11",
    customer_id: "CUST007",
    sales_rep_id: "EMP003",
    no_items: 8,
    net_total: 31200.50,
    status: "Completed"
  },
  {
    quotation_id: "QUO008",
    quotation_date: "2025-08-11",
    customer_id: "CUST008",
    sales_rep_id: "EMP002",
    no_items: 1,
    net_total: 2750.00,
    status: "Processing"
  }
];

const DailySummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dailySummaryData, setDailySummaryData] = useState(mockDailySummaryData);
  const [statusFilter, setStatusFilter] = useState("All");

  const today = new Date().toISOString().split("T")[0];
  const [reportDate, setReportDate] = useState(today);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        // Use mock data for now - comment out the API call
        // const result = await dailySummary(reportDate);
        // console.log("result", result);
        // if (result.success) {
        //   setDailySummaryData(result.data.data);
        // } else {
        //   console.error("No data found");
        // }
        
        // Filter mock data by selected date
        const filteredMockData = mockDailySummaryData.filter(item => 
          item.quotation_date === reportDate
        );
        setDailySummaryData(filteredMockData);
        
      } catch (error) {
        console.error(error);
        // Fallback to mock data on error
        setDailySummaryData(mockDailySummaryData.filter(item => 
          item.quotation_date === reportDate
        ));
      } finally {
        setIsLoading(false);
      }
    }) ();
  }, [reportDate]);

  const statusOptions = ["All", ...new Set(dailySummaryData?.map((data) => data.status) || [])];

  const filteredData = (dailySummaryData || []).filter((data) => {
    return statusFilter === "All" || data.status === statusFilter;
  });

  // Calculate summary stats
  const totalQuotations = filteredData.length;
  const totalValue = filteredData.reduce((sum, item) => sum + (typeof item.net_total === 'number' ? item.net_total : 0), 0);
  const totalItems = filteredData.reduce((sum, item) => sum + item.no_items, 0);
  const uniqueCustomers = new Set(filteredData.map(item => item.customer_id)).size;

  const handleExportSummary = () => {
    if (!dailySummaryData || dailySummaryData.length === 0) {
      // Use console.log instead of alert to avoid popup
      console.log("No data to export");
      return;
    }
    console.log("dailySummary: ", dailySummaryData);
    exportToCSV(dailySummaryData, "daily-summary.csv");
  }

  // export to csv file
  function exportToCSV(arr, filename = 'data.csv') {
    if (!arr || arr.length === 0) {
      console.error("No data to export");
      return;
    }
    
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

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'from-emerald-500 to-green-600 text-white shadow-green-200',
      'Pending': 'from-amber-400 to-yellow-500 text-white shadow-yellow-200',
      'Processing': 'from-blue-500 to-indigo-600 text-white shadow-blue-200',
      'Cancelled': 'from-red-500 to-rose-600 text-white shadow-red-200'
    };
    return colors[status] || 'from-gray-400 to-gray-500 text-white shadow-gray-200';
  };

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-lg">
      {/* Enhanced Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-xl">
        <div className="flex flex-row items-center justify-between text-white">
          {/* Title */}
          <div className="flex flex-row items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <NotebookPen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">Daily Summary</h2>
              <p className="text-indigo-100 text-sm">Real-time business insights</p>
            </div>
          </div>
          {/* Export Button */}
          <button 
            onClick={handleExportSummary} 
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors border border-white/20"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="font-medium">Export Summary</span>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Quotations</p>
              <p className="text-2xl font-bold">{totalQuotations}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Value</p>
              <p className="text-2xl font-bold">Rs {totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Items</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Unique Customers</p>
              <p className="text-2xl font-bold">{uniqueCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="flex flex-row items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status} Status
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">Quotation ID</th>
                <th className="py-4 px-6 text-left font-semibold">Date</th>
                <th className="py-4 px-6 text-left font-semibold">Customer ID</th>
                <th className="py-4 px-6 text-left font-semibold">Sales Rep ID</th>
                <th className="py-4 px-6 text-center font-semibold">No. Items</th>
                <th className="py-4 px-6 text-right font-semibold">Order Total</th>
                <th className="py-4 px-6 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-gray-500 font-medium">Loading summary data...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (dailySummaryData || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">No records found</p>
                          <p className="text-gray-500">No quotations available for the selected date.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {data.quotation_id}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {new Date(data.quotation_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {data.customer_id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {data.sales_rep_id}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                          {data.no_items}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-lg text-green-700">
                          Rs {typeof data.net_total === 'number' ? data.net_total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : data.net_total}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r shadow-md ${getStatusColor(data.status)}`}>
                          {data.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;