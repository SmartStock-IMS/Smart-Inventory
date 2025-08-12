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
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

// Mock service function for demo - now supports different granularities
const getDashboardIncomeData = async (fromDate, toDate, granularity = 'month') => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const data = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  if (granularity === 'day') {
    // Generate daily data
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      data.push({
        date: new Date(dt).toISOString(),
        totalIncome: Math.floor(Math.random() * 50000) + 10000,
        granularity: 'day'
      });
    }
  } else if (granularity === 'week') {
    // Generate weekly data
    const startWeek = new Date(start);
    startWeek.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let dt = new Date(startWeek); dt <= end; dt.setDate(dt.getDate() + 7)) {
      if (dt >= start) {
        data.push({
          date: new Date(dt).toISOString(),
          totalIncome: Math.floor(Math.random() * 200000) + 50000,
          granularity: 'week'
        });
      }
    }
  } else {
    // Generate monthly data
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    
    for (let dt = new Date(startMonth); dt <= endMonth; dt.setMonth(dt.getMonth() + 1)) {
      data.push({
        date: dt.toISOString(),
        totalIncome: Math.floor(Math.random() * 500000) + 100000,
        granularity: 'month'
      });
    }
  }
  
  return { success: true, data };
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
  return `${month}/${year}`;
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
    day: "numeric" 
  });
};

const ModernDateSelector = ({ fromDate, toDate, setFromDate, setToDate, onGranularityChange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(fromDate);
  const [tempToDate, setTempToDate] = useState(toDate);

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const quickSelectOptions = [
    {
      label: "Last 7 Days",
      icon: "📅",
      granularity: "day",
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("day");
        setShowCustomPicker(false);
      }
    },
    {
      label: "Last 30 Days",
      icon: "📊",
      granularity: "week",
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("week");
        setShowCustomPicker(false);
      }
    },
    {
      label: "This Month",
      icon: "🗓️",
      granularity: "week",
      action: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("week");
        setShowCustomPicker(false);
      }
    },
    {
      label: "Last Month",
      icon: "📈",
      granularity: "week",
      action: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("week");
        setShowCustomPicker(false);
      }
    },
    {
      label: "This Year",
      icon: "🎯",
      granularity: "month",
      action: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        setFromDate(start);
        setToDate(end);
        onGranularityChange("month");
        setShowCustomPicker(false);
      }
    }
  ];

  const handleCustomDateApply = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    
    // Determine granularity based on date range
    const diffTime = Math.abs(tempToDate - tempFromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 14) {
      onGranularityChange("day");
    } else if (diffDays <= 90) {
      onGranularityChange("week");
    } else {
      onGranularityChange("month");
    }
    
    setShowCustomPicker(false);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      {/* Quick Select Cards */}
      <div className="flex flex-wrap gap-3">
        {quickSelectOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            className="group flex items-center gap-2 px-4 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-lg">{option.icon}</span>
            <div className="text-left">
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs text-white/70 capitalize">{option.granularity} view</div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Date Picker */}
      <div className="relative">
        <button
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="flex items-center gap-3 px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl"
        >
          <Calendar className="w-5 h-5" />
          <div className="text-left">
            <div className="text-sm font-medium">Custom Range</div>
            <div className="text-xs text-white/80">
              {formatFullDate(fromDate)} - {formatFullDate(toDate)}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showCustomPicker ? 'rotate-180' : ''}`} />
        </button>

        {/* Modern Custom Date Picker Modal */}
        {showCustomPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Select Date Range</h3>
                    <p className="text-blue-100 text-sm mt-1">Choose your custom period</p>
                  </div>
                  <button
                    onClick={() => setShowCustomPicker(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Date Inputs */}
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      From Date
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(tempFromDate)}
                      onChange={(e) => setTempFromDate(new Date(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      To Date
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(tempToDate)}
                      onChange={(e) => setTempToDate(new Date(e.target.value))}
                      min={formatDateForInput(tempFromDate)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800 font-medium"
                    />
                  </div>
                </div>

                {/* Date Range Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-800 mb-1">Selected Range:</div>
                    <div>{Math.ceil(Math.abs(tempToDate - tempFromDate) / (1000 * 60 * 60 * 24))} days</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Chart will auto-adjust: ≤14 days (daily), ≤90 days (weekly), &gt;90 days (monthly)
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <button
                  onClick={() => {
                    setTempFromDate(fromDate);
                    setTempToDate(toDate);
                    setShowCustomPicker(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const today = new Date();
                      setTempFromDate(today);
                      setTempToDate(today);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleCustomDateApply}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${color} shadow-lg isolate`}>
    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent rounded-full transform rotate-12 scale-150"></div>
    </div>
    <div className="relative z-0">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {change > 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span className="text-xs font-semibold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="h-full w-full flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
        <Sparkles className="w-8 h-8 text-white animate-spin" />
      </div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-ping"></div>
    </div>
    <div className="flex items-center gap-2 text-gray-600">
      <span className="text-lg font-medium">Loading financial data</span>
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
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  );
  const [toDate, setToDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [granularity, setGranularity] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDashboardIncomeData(fromDate, toDate, granularity);
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
        case 'day':
          name = formatDay(date);
          break;
        case 'week':
          name = formatWeek(date);
          break;
        case 'month':
        default:
          name = formatMonth(date);
          break;
      }
      
      return {
        name,
        income: Number(item.totalIncome),
        date: date,
        granularity: item.granularity
      };
    });
  }, [data, granularity]);

  const totalIncome = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.income, 0);
  }, [chartData]);

  const averageIncome = useMemo(() => {
    return chartData.length > 0 ? totalIncome / chartData.length : 0;
  }, [totalIncome, chartData]);

  const highestMonth = useMemo(() => {
    return chartData.reduce((max, item) => item.income > max.income ? item : max, { income: 0, name: 'N/A' });
  }, [chartData]);

  const getBarColor = (income, maxIncome) => {
    const intensity = income / maxIncome;
    if (intensity > 0.8) return '#3366FF';
    if (intensity > 0.6) return '#4F7CFF';
    if (intensity > 0.4) return '#6B92FF';
    if (intensity > 0.2) return '#87A8FF';
    return '#A3BEFF';
  };

  const maxIncome = Math.max(...chartData.map(item => item.income));

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CircleDollarSign className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-red-700 font-semibold text-lg mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative">
      {/* Header Section */}
      <div className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden dashboard-header">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-white/10 bg-opacity-10"></div>
        </div>
        
        <div className="relative z-10 flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Income Analytics</h2>
                <div className="flex items-center gap-2 text-white/80">
                  <span>Track your financial performance over time</span>
                  <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-medium capitalize">
                    {granularity} View
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChartType(chartType === 'bar' ? 'area' : 'bar')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {chartType === 'bar' ? 'Area View' : 'Bar View'}
                </span>
              </button>
              
              <ModernDateSelector 
                fromDate={fromDate} 
                toDate={toDate} 
                setFromDate={setFromDate} 
                setToDate={setToDate}
                onGranularityChange={setGranularity}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 stats-section relative z-0">
        <StatCard
          title="Total Income"
          value={`Rs.${totalIncome.toLocaleString()}`}
          change={12.5}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Average Monthly"
          value={`Rs.${Math.round(averageIncome).toLocaleString()}`}
          change={8.2}
          icon={TrendingUp}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Best Performance"
          value={highestMonth.name}
          change={null}
          icon={Sparkles}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
        />
      </div>

      {/* Chart Section */}
      <div className="px-6 pb-6 chart-section">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Income Trend ({granularity === 'day' ? 'Daily' : granularity === 'week' ? 'Weekly' : 'Monthly'})
              </h3>
              <p className="text-sm text-gray-600">
                {chartData.length} {granularity === 'day' ? 'days' : granularity === 'week' ? 'weeks' : 'months'} of data
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                granularity === 'day' ? 'bg-green-100 text-green-700' :
                granularity === 'week' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {granularity.charAt(0).toUpperCase() + granularity.slice(1)} View
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `Rs.${value / 1000}K`}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.income, maxIncome)} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3366FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3366FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `Rs.${value / 1000}K`}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#3366FF"
                    strokeWidth={3}
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
  );
};

export default DashboardIncome;