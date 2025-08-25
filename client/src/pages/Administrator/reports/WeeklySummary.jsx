import {useEffect, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import { NotebookPen, Download, Calendar, Filter, TrendingUp, FileText, Users, Package, CalendarDays } from "lucide-react";

// Mock data for testing - weekly aggregated data
const mockWeeklySummaryData = [
  {
    week_start: "2025-08-11",
    week_end: "2025-08-17",
    quotation_id: "QUO001",
    quotation_date: "2025-08-13",
    customer_id: "CUST001",
    sales_rep_id: "EMP001",
    no_items: 5,
    net_total: 15750.00,
    status: "Completed"
  },
  {
    week_start: "2025-08-11",
    week_end: "2025-08-17",
    quotation_id: "QUO002",
    quotation_date: "2025-08-14",
    customer_id: "CUST002",
    sales_rep_id: "EMP002",
    no_items: 3,
    net_total: 8900.50,
    status: "Pending"
  },
  {
    week_start: "2025-08-11",
    week_end: "2025-08-17",
    quotation_id: "QUO003",
    quotation_date: "2025-08-15",
    customer_id: "CUST003",
    sales_rep_id: "EMP001",
    no_items: 7,
    net_total: 22300.75,
    status: "Processing"
  },
  {
    week_start: "2025-08-11",
    week_end: "2025-08-17",
    quotation_id: "QUO004",
    quotation_date: "2025-08-16",
    customer_id: "CUST004",
    sales_rep_id: "EMP003",
    no_items: 2,
    net_total: 5600.00,
    status: "Completed"
  },
  {
    week_start: "2025-08-04",
    week_end: "2025-08-10",
    quotation_id: "QUO005",
    quotation_date: "2025-08-07",
    customer_id: "CUST005",
    sales_rep_id: "EMP002",
    no_items: 4,
    net_total: 12450.25,
    status: "Cancelled"
  },
  {
    week_start: "2025-08-04",
    week_end: "2025-08-10",
    quotation_id: "QUO006",
    quotation_date: "2025-08-08",
    customer_id: "CUST006",
    sales_rep_id: "EMP001",
    no_items: 6,
    net_total: 18900.00,
    status: "Pending"
  },
  {
    week_start: "2025-08-04",
    week_end: "2025-08-10",
    quotation_id: "QUO007",
    quotation_date: "2025-08-09",
    customer_id: "CUST007",
    sales_rep_id: "EMP003",
    no_items: 8,
    net_total: 31200.50,
    status: "Completed"
  },
  {
    week_start: "2025-08-04",
    week_end: "2025-08-10",
    quotation_id: "QUO008",
    quotation_date: "2025-08-10",
    customer_id: "CUST008",
    sales_rep_id: "EMP002",
    no_items: 1,
    net_total: 2750.00,
    status: "Processing"
  }
];

const WeeklySummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [weeklySummaryData, setWeeklySummaryData] = useState(mockWeeklySummaryData);
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

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        // Use mock data for now - comment out the API call
        // const result = await weeklySummary(weekStartDate);
        // console.log("result", result);
        // if (result.success) {
        //   setWeeklySummaryData(result.data.data);
        // } else {
        //   console.error("No data found");
        // }
        
        // Filter mock data by selected week
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        const weekEndStr = weekEndDate.toISOString().split("T")[0];
        
        const filteredMockData = mockWeeklySummaryData.filter(item => 
          item.week_start === weekStartDate && item.week_end === weekEndStr
        );
        setWeeklySummaryData(filteredMockData);
        
      } catch (error) {
        console.error(error);
        // Fallback to mock data on error
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        const weekEndStr = weekEndDate.toISOString().split("T")[0];
        
        setWeeklySummaryData(mockWeeklySummaryData.filter(item => 
          item.week_start === weekStartDate && item.week_end === weekEndStr
        ));
      } finally {
        setIsLoading(false);
      }
    }) ();
  }, [weekStartDate]);

  const statusOptions = ["All", ...new Set(weeklySummaryData?.map((data) => data.status) || [])];

  const filteredData = (weeklySummaryData || []).filter((data) => {
    return statusFilter === "All" || data.status === statusFilter;
  });

  // Calculate summary stats
  const totalQuotations = filteredData.length;
  const totalValue = filteredData.reduce((sum, item) => sum + (typeof item.net_total === 'number' ? item.net_total : 0), 0);
  const totalItems = filteredData.reduce((sum, item) => sum + item.no_items, 0);
  const uniqueCustomers = new Set(filteredData.map(item => item.customer_id)).size;

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
  }

  // export to csv file
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
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-xl">
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
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Weekly Quotations</p>
              <p className="text-2xl font-bold">{totalQuotations}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Weekly Revenue</p>
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
              <p className="text-orange-100 text-sm">Active Customers</p>
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
