import {useEffect, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import { NotebookPen, Download, Calendar, Filter, TrendingUp, FileText, Users, Package, CalendarRange } from "lucide-react";

const YearlySummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [yearlySummaryData, setYearlySummaryData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [summaryStats, setSummaryStats] = useState({
    total_quotations: 0,
    total_value: 0,
    total_items: 0,
    unique_customers: 0
  });
  const [monthlyBreakdown, setMonthlyBreakdown] = useState({});
  const [statusOptions, setStatusOptions] = useState(["All"]);

  useEffect(() => {
    const loadYearlyData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data concurrently
        const [summaryResult, statsResult, breakdownResult, statusResult] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/reports/yearly-summary?year=${selectedYear}&status=${statusFilter === "All" ? "" : statusFilter}`, {
            headers: {
              'authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).then(res => res.json()),
          fetch(`${import.meta.env.VITE_API_URL}/reports/yearly-summary-stats?year=${selectedYear}&status=${statusFilter === "All" ? "" : statusFilter}`, {
            headers: {
              'authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).then(res => res.json()),
          fetch(`${import.meta.env.VITE_API_URL}/reports/monthly-breakdown?year=${selectedYear}&status=${statusFilter === "All" ? "" : statusFilter}`, {
            headers: {
              'authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).then(res => res.json()),
          fetch(`${import.meta.env.VITE_API_URL}/reports/yearly-status-options?year=${selectedYear}`, {
            headers: {
              'authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).then(res => res.json())
        ]);

        // Set yearly summary data
        if (summaryResult.success) {
          setYearlySummaryData(summaryResult.data);
        } else {
          console.error("Failed to fetch yearly summary:", summaryResult);
          setYearlySummaryData([]);
        }

        // Set summary stats
        if (statsResult.success) {
          setSummaryStats({
            total_quotations: statsResult.data.total_quotations || 0,
            total_value: statsResult.data.total_value || 0,
            total_items: statsResult.data.total_items || 0,
            unique_customers: statsResult.data.unique_customers || 0
          });
        } else {
          console.error("Failed to fetch yearly stats:", statsResult);
          setSummaryStats({
            total_quotations: 0,
            total_value: 0,
            total_items: 0,
            unique_customers: 0
          });
        }

        // Set monthly breakdown
        if (breakdownResult.success) {
          // Map backend data to a format suitable for rendering
          const breakdown = breakdownResult.data.reduce((acc, item) => {
            acc[item.month] = {
              quotations: item.quotations,
              revenue: item.revenue,
              items: item.items
            };
            return acc;
          }, {});
          setMonthlyBreakdown(breakdown);
        } else {
          console.error("Failed to fetch monthly breakdown:", breakdownResult);
          setMonthlyBreakdown({});
        }

        // Set status options
        if (statusResult.success) {
          setStatusOptions(["All", ...statusResult.data]);
        } else {
          console.error("Failed to fetch status options:", statusResult);
          setStatusOptions(["All"]);
        }

      } catch (error) {
        console.error("Error loading yearly data:", error);
        setYearlySummaryData([]);
        setSummaryStats({
          total_quotations: 0,
          total_value: 0,
          total_items: 0,
          unique_customers: 0
        });
        setMonthlyBreakdown({});
        setStatusOptions(["All"]);
      } finally {
        setIsLoading(false);
      }
    };

    loadYearlyData();
  }, [selectedYear, statusFilter]);

  const filteredData = (yearlySummaryData || []).filter((data) => {
    return statusFilter === "All" || data.status === statusFilter;
  });

  // Calculate summary stats
  const totalQuotations = filteredData.length;
  const totalValue = filteredData.reduce((sum, item) => sum + (typeof item.net_total === 'number' ? item.net_total : 0), 0);
  const totalItems = filteredData.reduce((sum, item) => sum + item.no_items, 0);
  const uniqueCustomers = new Set(filteredData.map(item => item.customer_id)).size;

  // Calculate monthly breakdown
  const monthlyBreakdownData = filteredData.reduce((acc, item) => {
    if (!acc[item.month]) {
      acc[item.month] = {
        quotations: 0,
        revenue: 0,
        items: 0
      };
    }
    acc[item.month].quotations += 1;
    acc[item.month].revenue += item.net_total;
    acc[item.month].items += item.no_items;
    return acc;
  }, {});

  const handleExportSummary = () => {
    if (!yearlySummaryData || yearlySummaryData.length === 0) {
      console.log("No data to export");
      return;
    }
    console.log("yearlySummary: ", yearlySummaryData);
    exportToCSV(yearlySummaryData, "yearly-summary.csv");
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

  // Generate year options (current year and previous 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 6; i++) {
    yearOptions.push((currentYear - i).toString());
  }

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-lg">
      {/* Enhanced Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-xl">
        <div className="flex flex-row items-center justify-between text-white">
          {/* Title */}
          <div className="flex flex-row items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <CalendarRange className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">Yearly Summary</h2>
              <p className="text-blue-100 text-sm">Annual business performance analysis</p>
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
              <p className="text-blue-100 text-sm">Annual Quotations</p>
              <p className="text-2xl font-bold">{summaryStats.total_quotations}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Annual Value</p>
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
              <p className="text-blue-100 text-sm">Total Customers</p>
              <p className="text-2xl font-bold">{summaryStats.unique_customers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Breakdown - {selectedYear}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(monthlyBreakdown).map(([month, data]) => (
            <div key={month} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 text-sm mb-2">{month}</h4>
              <div className="space-y-1 text-xs">
                <p className="text-gray-600">Quotations: <span className="font-semibold text-blue-600">{data.quotations}</span></p>
                <p className="text-gray-600">Value: <span className="font-semibold text-green-600">Rs {data.revenue.toLocaleString('en-IN')}</span></p>
                <p className="text-gray-600">Items: <span className="font-semibold text-purple-600">{data.items}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="flex flex-row items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
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
            <span className="text-sm font-medium text-gray-700">Year:</span>
            <select
              className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">Year</th>
                <th className="py-4 px-6 text-left font-semibold">Month</th>
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
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FaSpinner className="w-8 h-8 text-purple-600 animate-spin" />
                      <p className="text-gray-500 font-medium">Loading yearly summary data...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (yearlySummaryData || []).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <CalendarRange className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">No records found</p>
                          <p className="text-gray-500">No quotations available for the selected year.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded text-sm">
                          {data.year}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded text-sm">
                          {data.month}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
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
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full font-bold text-sm">
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

export default YearlySummary;
