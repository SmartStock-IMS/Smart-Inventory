import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
} from "recharts";
import {
  Calendar,
  CircleDollarSign,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

const API_BASE_URL = "http://localhost:3000/api/reports";

const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDashboardIncomeData = async (
  fromDate,
  toDate,
  granularity = "month"
) => {
  try {
    const data = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (granularity === "day") {
      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const dateStr = formatDateForAPI(new Date(dt));
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_BASE_URL}/daily-summary-stats?date=${dateStr}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );
          const result = await response.json();

          if (result.success && result.data) {
            data.push({
              date: new Date(dt).toISOString(),
              totalIncome: parseFloat(result.data.total_value || 0),
              totalItems: parseInt(result.data.total_items || 0),
              uniqueCustomers: parseInt(result.data.unique_customers || 0),
              granularity: "day",
            });
          }
        } catch (err) {
          console.error(`Error fetching daily data for ${dateStr}:`, err);
        }
      }
    } else if (granularity === "week") {
      const startWeek = new Date(start);
      startWeek.setDate(start.getDate() - start.getDay());

      for (
        let dt = new Date(startWeek);
        dt <= end;
        dt.setDate(dt.getDate() + 7)
      ) {
        if (
          dt >= start ||
          dt.getTime() + 6 * 24 * 60 * 60 * 1000 >= start.getTime()
        ) {
          const dateStr = formatDateForAPI(new Date(dt));
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(
              `${API_BASE_URL}/weekly-summary-stats?week_start_date=${dateStr}`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }
            );
            const result = await response.json();

            if (result.success && result.data) {
              data.push({
                date: new Date(dt).toISOString(),
                totalIncome: parseFloat(result.data.total_value || 0),
                totalItems: parseInt(result.data.total_items || 0),
                uniqueCustomers: parseInt(result.data.unique_customers || 0),
                weekStart: result.data.week_start,
                weekEnd: result.data.week_end,
                granularity: "week",
              });
            }
          } catch (err) {
            console.error(`Error fetching weekly data for ${dateStr}:`, err);
          }
        }
      }
    } else {
      const year = start.getFullYear();
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/monthly-breakdown?year=${year}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const result = await response.json();

        // Create a map of existing data by month number
        const monthDataMap = new Map();

        if (result.success && result.data && Array.isArray(result.data)) {
          result.data.forEach((monthData) => {
            monthDataMap.set(monthData.month_number, monthData);
          });
        }

        // Generate all 12 months
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        for (let monthNum = 1; monthNum <= 12; monthNum++) {
          const monthDate = new Date(year, monthNum - 1, 1);
          const existingData = monthDataMap.get(monthNum);

          data.push({
            date: monthDate.toISOString(),
            totalIncome: existingData
              ? parseFloat(existingData.revenue || 0)
              : 0,
            totalItems: existingData ? parseInt(existingData.items || 0) : 0,
            uniqueCustomers: existingData
              ? parseInt(existingData.quotations || 0)
              : 0,
            month: monthNames[monthNum - 1],
            monthNumber: monthNum,
            granularity: "month",
          });
        }
      } catch (err) {
        console.error(`Error fetching yearly data for ${year}:`, err);
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in getDashboardIncomeData:", error);
    return { success: false, message: error.message, data: [] };
  }
};

const formatFullDate = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatMonth = (date) => {
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.toLocaleString("en-US", { year: "2-digit" });
  return `${month}`; // Just show month name for yearly view
};

const formatWeek = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
};

const formatDay = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const ModernDateSelector = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  onGranularityChange,
  selectedOption,
  setSelectedOption,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const quickSelectOptions = [
    {
      label: "Last 7 Days",
      granularity: "day",
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("day");
        setSelectedOption("Last 7 Days");
        setShowDropdown(false);
      },
    },
    {
      label: "Last 30 Days",
      granularity: "week",
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("week");
        setSelectedOption("Last 30 Days");
        setShowDropdown(false);
      },
    },
    {
      label: "This Month",
      granularity: "week",
      action: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("week");
        setSelectedOption("This Month");
        setShowDropdown(false);
      },
    },
    {
      label: "Last Month",
      granularity: "week",
      action: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("week");
        setSelectedOption("Last Month");
        setShowDropdown(false);
      },
    },
    {
      label: "This Year",
      granularity: "month",
      action: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("month");
        setSelectedOption("This Year");
        setShowDropdown(false);
      },
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm min-w-[200px]"
      >
        <Calendar className="w-5 h-5 text-gray-600" />
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold">{selectedOption}</div>
          <div className="text-xs text-gray-500">
            {formatFullDate(fromDate)} - {formatFullDate(toDate)}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
        />
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[250px] overflow-hidden">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 px-3 py-2">
              SELECT TIME PERIOD
            </div>
            {quickSelectOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-150 ${
                  selectedOption === option.label
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option.label}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {option.granularity}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
  <div className="relative overflow-hidden rounded-lg p-6 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change !== null && change !== undefined && (
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
            change > 0
              ? "bg-green-50 text-green-700"
              : change < 0
                ? "bg-red-50 text-red-700"
                : "bg-gray-50 text-gray-700"
          }`}
        >
          {change > 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : change < 0 ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : null}
          <span>
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        </div>
      )}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-gray-900 text-2xl font-bold mb-1">{value}</p>
    {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
  </div>
);

const LoadingSpinner = () => (
  <div className="h-full w-full flex flex-col items-center justify-center gap-6 py-12">
    <div className="relative">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
        <FaSpinner size={32} color="white" className="animate-spin" />
      </div>
      <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-full animate-ping opacity-75"></div>
    </div>
    <div className="flex items-center gap-3 text-gray-600">
      <span className="text-xl font-medium">Loading overview data</span>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
        <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
        <p className="text-blue-600 text-lg font-bold">
          Rs.{Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const DashboardIncome = () => {
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [toDate, setToDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [granularity, setGranularity] = useState("day");
  const [selectedOption, setSelectedOption] = useState("Last 7 Days");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDashboardIncomeData(
          fromDate,
          toDate,
          granularity
        );
        if (result.success) {
          setData(Array.isArray(result.data) ? result.data : []);
        } else {
          setData([]);
          throw new Error(result.message);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setData([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate, granularity]);

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((item) => {
      const date = new Date(item.date);
      let name;

      switch (granularity) {
        case "day":
          name = formatDay(date);
          break;
        case "week":
          name = formatWeek(date);
          break;
        case "month":
        default:
          console.log(item.month);
          name = item.month || formatMonth(date);
          break;
      }

      return {
        name,
        income: Number(item.totalIncome),
        items: Number(item.totalItems || 0),
        customers: Number(item.uniqueCustomers || 0),
        date: date,
        granularity: item.granularity,
      };
    });
  }, [data, granularity]);

  const totalIncome = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.income, 0);
  }, [chartData]);

  const averageIncome = useMemo(() => {
    return chartData.length > 0 ? totalIncome / chartData.length : 0;
  }, [totalIncome, chartData]);

  const totalItems = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.items || 0), 0);
  }, [chartData]);

  const uniqueCustomers = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.customers || 0), 0);
  }, [chartData]);

  const getBarColor = (income, maxIncome) => {
    const intensity = income / maxIncome;
    if (intensity > 0.8) return "#3B82F6";
    if (intensity > 0.6) return "#60A5FA";
    if (intensity > 0.4) return "#93C5FD";
    if (intensity > 0.2) return "#BFDBFE";
    return "#DBEAFE";
  };

  const maxIncome = Math.max(...chartData.map((item) => item.income), 1);

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-50 rounded-lg">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CircleDollarSign className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-red-700 font-semibold text-lg mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="w-full h-full bg-gray-50 rounded-lg">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl p-6 text-white relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <CircleDollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Income Report</h2>
                  <p className="text-gray-300 text-sm">
                    Track your financial performance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setChartType(chartType === "bar" ? "area" : "bar")
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {chartType === "bar" ? "Area Chart" : "Bar Chart"}
                  </span>
                </button>

                <ModernDateSelector
                  fromDate={fromDate}
                  toDate={toDate}
                  setFromDate={setFromDate}
                  setToDate={setToDate}
                  onGranularityChange={setGranularity}
                  selectedOption={selectedOption}
                  setSelectedOption={setSelectedOption}
                />
              </div>
            </div>
          </div>

          <div className="py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Value"
              value={`Rs.${totalIncome.toLocaleString()}`}
              change={null}
              icon={DollarSign}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              subtitle="Total quotation value"
            />

            <StatCard
              title="Total Items"
              value={totalItems.toLocaleString()}
              change={null}
              icon={BarChart3}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              subtitle="Items quoted"
            />
            <StatCard
              title="Unique Customers"
              value={uniqueCustomers.toLocaleString()}
              change={null}
              icon={TrendingUp}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              subtitle="Customer count"
            />
          </div>

          <div className="px-6 pb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Revenue Trend -{" "}
                    {granularity === "day"
                      ? "Daily"
                      : granularity === "week"
                        ? "Weekly"
                        : "Monthly"}{" "}
                    View
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {chartData.length}{" "}
                    {granularity === "day"
                      ? "days"
                      : granularity === "week"
                        ? "weeks"
                        : "months"}{" "}
                    • Total: Rs.{totalIncome.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                    granularity === "day"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : granularity === "week"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}
                >
                  {granularity.charAt(0).toUpperCase() + granularity.slice(1)}{" "}
                  Data
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        axisLine={{ stroke: "#E5E7EB" }}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `Rs.${(value / 1000).toFixed(0)}K`
                        }
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={{ stroke: "#E5E7EB" }}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="income" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry.income, maxIncome)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <AreaChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorIncome"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        axisLine={{ stroke: "#E5E7EB" }}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `Rs.${(value / 1000).toFixed(0)}K`
                        }
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={{ stroke: "#E5E7EB" }}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIncome;
