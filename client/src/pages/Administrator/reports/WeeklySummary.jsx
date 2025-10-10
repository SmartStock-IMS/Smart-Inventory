import {useEffect, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import { Download, Calendar, Filter, TrendingUp, FileText, Users, Package, CalendarDays } from "lucide-react";

const WeeklySummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [weeklySummaryData, setWeeklySummaryData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    total_quotations: 0,
    total_value: 0,
    total_items: 0,
    unique_customers: 0
  });
  const [statusOptions, setStatusOptions] = useState(["All"]);
  const [statusFilter, setStatusFilter] = useState("All");

  // Get current week's start date (Monday)
  const getCurrentWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStart());

  // API call functions
  const fetchWeeklySummary = async (weekStartDate, status) => {
    const token = localStorage.getItem('token'); // Adjust based on your auth implementation
    const statusParam = status === "All" ? "" : `&status=${status}`; // Pass empty string for "All"
    const response = await fetch(`http://localhost:3000/api/reports/weekly-summary?week_start_date=${weekStartDate}${statusParam}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      method: 'GET'
    });
    const result = await response.json();
    return result;
  };

  const fetchWeeklySummaryStats = async (weekStartDate, status) => {
    const token = localStorage.getItem('token'); // Adjust based on your auth implementation
    const statusParam = status === "All" ? "" : `&status=${status}`; // Pass empty string for "All"
    const response = await fetch(`http://localhost:3000/api/reports/weekly-summary-stats?week_start_date=${weekStartDate}${statusParam}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      method: 'GET'
    });
    const result = await response.json();
    return result;
  };

  const fetchWeeklyStatusOptions = async (weekStartDate) => {
    const token = localStorage.getItem('token'); // Adjust based on your auth implementation
    const response = await fetch(`http://localhost:3000/api/reports/weekly-status-options?week_start_date=${weekStartDate}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      method: 'GET'
    });
    const result = await response.json();
    return result;
  };

  useEffect(() => {
    const loadWeeklyData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data concurrently
        const [summaryResult, statsResult, statusResult] = await Promise.all([
          fetchWeeklySummary(weekStartDate, statusFilter), // Pass statusFilter here
          fetchWeeklySummaryStats(weekStartDate, statusFilter),
          fetchWeeklyStatusOptions(weekStartDate)
        ]);

        // Set weekly summary data
        if (summaryResult.success) {
          setWeeklySummaryData(summaryResult.data);
        } else {
          console.error("Failed to fetch weekly summary:", summaryResult);
          setWeeklySummaryData([]);
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
        console.error("Error loading weekly data:", error);
        // Reset to empty state on error
        setWeeklySummaryData([]);
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

    loadWeeklyData();
  }, [weekStartDate, statusFilter]); // Add statusFilter as a dependency

  // Filter data based on status
  const filteredData = (weeklySummaryData || []).filter((data) => {
    return statusFilter === "All" || data.status === statusFilter;
  });

  // Calculate week end date for display
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEndStr = weekEndDate.toISOString().split("T")[0];

  const handleExportSummary = () => {
    if (!weeklySummaryData || weeklySummaryData.length === 0) {
      console.log("No data to export");
      return;
    }
    console.log("weeklySummary: ", weeklySummaryData);
    exportToCSV(weeklySummaryData, "weekly-summary.csv");
  };

  // Export to CSV file
  function exportToCSV(arr, filename = 'data.csv') {
    if (!arr || arr.length === 0) {
      console.error("No data to export");
      return;
    }
    
    const keys = Object.keys(arr[0]);
    const csvRows = [];
    csvRows.push(keys.join(','));
    
    for (const row of arr) {
      const values = keys.map(key => row[key]);
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
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
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-xl">
        <div className="flex flex-row items-center justify-between text-white">
          {/* Title */}
          <div className="flex flex-row items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">Weekly Summary</h2>
              <p className="text-blue-100 text-sm">Weekly business performance overview</p>
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
              <p className="text-blue-100 text-sm">Weekly Quotations</p>
              <p className="text-2xl font-bold">{summaryStats.total_quotations}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Weekly Value</p>
              <p className="text-2xl font-bold">Rs {summaryStats.total_value.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
              <p className="text-blue-100 text-sm">Active Customers</p>
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
            className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Week of:</span>
            <input
              type="date"
              className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
            />
            <span className="text-sm text-gray-500">to {weekEndStr}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">Week Period</th>
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
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FaSpinner className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-gray-500 font-medium">Loading weekly summary data...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (weeklySummaryData || []).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <CalendarDays className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">No records found</p>
                          <p className="text-gray-500">No quotations available for the selected week.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{data.week_start} to {data.week_end}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
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

export default WeeklySummary;
