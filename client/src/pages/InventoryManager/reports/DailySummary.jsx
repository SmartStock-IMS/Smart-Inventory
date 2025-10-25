import {useEffect, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import { NotebookPen, Download, Calendar, Filter, TrendingUp, FileText, Users, Package } from "lucide-react";
import { authenticatedFetch } from "../../../lib/api-utils";

const DailySummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dailySummaryData, setDailySummaryData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    total_quotations: 0,
    total_value: 0,
    total_items: 0,
    unique_customers: 0
  });
  const [statusOptions, setStatusOptions] = useState(["All"]);
  const [statusFilter, setStatusFilter] = useState("All");

  const today = new Date().toISOString().split("T")[0];
  const [reportDate, setReportDate] = useState(today);

  // API call functions
  const fetchDailySummary = async (date, status) => {
    const statusParam = status === "All" ? "" : `&status=${status}`; // Pass empty string for "All"
    const response = await authenticatedFetch(`/reports/daily-summary?date=${date}${statusParam}`, {
      method: 'GET'
    });
    const result = await response.json();
    return result;
  };

  const fetchDailySummaryStats = async (date) => {
    const response = await authenticatedFetch(`/reports/daily-summary-stats?date=${date}`, {
      method: 'GET'
    });
    const result = await response.json();
    return result;
  };

  const fetchDailyStatusOptions = async (date) => {
    const response = await authenticatedFetch(`/reports/daily-status-options?date=${date}`, {
      method: 'GET'
    });
    const result = await response.json();
    return result;
  };

  useEffect(() => {
    const loadDailyData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data concurrently
        const [summaryResult, statsResult, statusResult] = await Promise.all([
          fetchDailySummary(reportDate, statusFilter), // Pass statusFilter here
          fetchDailySummaryStats(reportDate),
          fetchDailyStatusOptions(reportDate)
        ]);

        // Set daily summary data
        if (summaryResult.success) {
          setDailySummaryData(summaryResult.data);
        } else {
          console.error("Failed to fetch daily summary:", summaryResult);
          setDailySummaryData([]);
        }

        // Set summary stats
        if (statsResult.success) {
          setSummaryStats({
            total_quotations: parseInt(statsResult.data.total_quotations) || 0,
            total_value: parseFloat(statsResult.data.total_value) || 0,
            total_items: parseInt(statsResult.data.total_items) || 0,
            unique_customers: parseInt(statsResult.data.unique_customers) || 0
          });
        } else {
          console.error("Failed to fetch summary stats:", statsResult);
          setSummaryStats({
            total_quotations: 0,
            total_value: 0,
            total_items: 0,
            unique_customers: 0
          });
        }

        // Set status options
        if (statusResult.success) {
          setStatusOptions(["All", ...statusResult.data]);
        } else {
          console.error("Failed to fetch status options:", statusResult);
          setStatusOptions(["All"]);
        }

      } catch (error) {
        console.error("Error loading daily data:", error);
        // Reset to empty state on error
        setDailySummaryData([]);
        setSummaryStats({
          total_quotations: 0,
          total_value: 0,
          total_items: 0,
          unique_customers: 0
        });
        setStatusOptions(["All"]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDailyData();
  }, [reportDate, statusFilter]); // Add statusFilter as a dependency

  // Filter data based on status
  const filteredData = (dailySummaryData || []).filter((data) => {
    return statusFilter === "All" || data.status === statusFilter;
  });

  const handleExportSummary = () => {
    if (!dailySummaryData || dailySummaryData.length === 0) {
      console.log("No data to export");
      return;
    }
    console.log("dailySummary: ", dailySummaryData);
    exportToCSV(dailySummaryData, "daily-summary.csv");
  }

  // Export to CSV file
  function exportToCSV(arr, filename = 'data.csv') {
    if (!arr || arr.length === 0) {
      console.error("No data to export");
      return;
    }
    
    // Convert the array of objects to CSV format
    const keys = Object.keys(arr[0]);
    const csvRows = [];

    // Add the header row
    csvRows.push(keys.join(','));

    // Add data rows
    for (const row of arr) {
      const values = keys.map(key => {
        const value = row[key];
        // Handle values that might contain commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    // Create the CSV content
    const csvData = csvRows.join('\n');

    // Create a Blob from the CSV data and trigger a download
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create an anchor element and simulate a click to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'from-emerald-500 to-green-600 text-white shadow-green-200',
      'pending': 'from-amber-400 to-yellow-500 text-white shadow-yellow-200',
      'processing': 'from-blue-500 to-indigo-600 text-white shadow-blue-200',
      'cancelled': 'from-red-500 to-rose-600 text-white shadow-red-200'
    };
    return colors[status?.toLowerCase()] || 'from-gray-400 to-gray-500 text-white shadow-gray-200';
  };

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-lg">
      {/* Enhanced Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-xl">
        <div className="flex flex-row items-center justify-between text-white">
          {/* Title */}
          <div className="flex flex-row items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <NotebookPen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">Daily Summary</h2>
              <p className="text-blue-100 text-sm">Real-time business insights</p>
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
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Quotations</p>
              <p className="text-2xl font-bold">{summaryStats.total_quotations}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Value</p>
              <p className="text-2xl font-bold">Rs {formatCurrency(summaryStats.total_value)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Items</p>
              <p className="text-2xl font-bold">{summaryStats.total_items}</p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Unique Customers</p>
              <p className="text-2xl font-bold">{summaryStats.unique_customers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
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
                {status === "All" ? "All Status" : `${status.charAt(0).toUpperCase() + status.slice(1)} Status`}
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
                <th className="py-4 px-6 text-left font-semibold">Customer</th>
                <th className="py-4 px-6 text-left font-semibold">Sales Rep</th>
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
                filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">No records found</p>
                          <p className="text-gray-500">No quotations available for the selected date and status.</p>
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
                        {formatDate(data.quotation_date)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{data.customer_name}</span>
                          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            {data.customer_id}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{data.sales_rep_name}</span>
                          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            {data.sales_rep_id}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                          {data.no_items}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-lg text-green-700">
                          Rs {formatCurrency(data.net_total)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r shadow-md ${getStatusColor(data.status)} capitalize`}>
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