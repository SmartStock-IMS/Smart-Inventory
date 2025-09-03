import { useState, useEffect } from "react";
import { User, Users, HandCoins, ChartNoAxesGantt, TrendingUp, Award, Sparkles, Calendar } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

// Mock service function for demo
const getOverviewData = async (period) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock data based on period
  const baseData = {
    totalCustomers: Math.floor(Math.random() * 500) + 100,
    totalIncome: Math.floor(Math.random() * 5000000) + 1000000,
    bestSalesReps: [
      { sales_rep_id: 1, name: "Alice Johnson" },
      { sales_rep_id: 2, name: "Bob Smith" },
      { sales_rep_id: 3, name: "Carol Davis" },
      { sales_rep_id: 4, name: "David Wilson" },
      { sales_rep_id: 5, name: "Eva Brown" }
    ]
  };
  
  return { success: true, data: baseData };
};

const Overview = () => {
  const [timePeriod, setTimePeriod] = useState("This Month");
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async (period) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOverviewData(period);
      if (result.success) {
        setOverviewData(result.data);
      } else {
        setOverviewData(null);
        setError(result.message);
      }
    } catch (err) {
      console.error("Failed to fetch overview data:", err);
      setOverviewData(null);
      setError(err.message || "Failed to fetch overview data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(timePeriod);
  }, [timePeriod]);

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

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

  const StatCard = ({ icon: Icon, title, value, gradient, iconBg, textColor = "text-gray-900" }) => (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="absolute inset-0 bg-white rounded-full transform rotate-12 scale-150"></div>
      </div>
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-16 h-16 ${iconBg} rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <p className={`${textColor} opacity-90 text-sm font-medium tracking-wide mb-1`}>
            {title}
          </p>
          <p className={`${textColor} text-2xl font-bold tracking-wide`}>
            {value}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
    </div>
  );

  const SalesRepCard = ({ rep, index }) => {
    const colors = [
      "from-blue-400 to-indigo-500",
      "from-blue-300 to-blue-500", 
      "from-blue-300 to-blue-500",
      "from-blue-300 to-blue-500",
      "from-blue-300 to-blue-500"
    ];
    
    const iconBgs = [
      "bg-indigo-500/20",
      "bg-blue-500/20",
      "bg-blue-500/20", 
      "bg-blue-500/20",
      "bg-blue-500/20"
    ];

    return (
      <div className="group relative">
        <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-gray-200">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className={`w-16 h-16 bg-gradient-to-br ${colors[index % colors.length]} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <User className="w-8 h-8 text-white" />
              </div>
              {index === 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Award className="w-3 h-3 text-yellow-800" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                {rep.name}
              </p>
              {index === 0 && (
                <p className="text-xs text-yellow-600 font-medium mt-1">Top Performer</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartNoAxesGantt className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-red-700 font-semibold text-lg mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-white/10"></div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ChartNoAxesGantt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Overview Dashboard</h2>
                  <p className="text-white/80">Real-time business insights</p>
                </div>
              </div>
              
              <div className="relative">
                <select
                  className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white/30 transition-colors appearance-none pr-10"
                  value={timePeriod}
                  onChange={handleTimePeriodChange}
                >
                  <option value="All Time" className="text-gray-800">All Time</option>
                  <option value="This Month" className="text-gray-800">This Month</option>
                  <option value="This Year" className="text-gray-800">This Year</option>
                </select>
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatCard
              icon={Users}
              title="Total Customers"
              value={overviewData?.totalCustomers || 0}
              gradient="border-2 border border-blue-500"
              iconBg="bg-gradient-to-br from-blue-400 to-blue-500"
            />
            <StatCard
              icon={HandCoins}
              title="Total Income"
              value={`Rs. ${Number(overviewData?.totalIncome || 0).toLocaleString('en-LK', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`}
              gradient="border-2 border border-blue-500"
              iconBg="bg-gradient-to-br from-blue-400 to-blue-500"
            />
          </div>

          {/* Sales Representatives Section */}
          <div className="bg-white rounded-2xl border border-2 border-blue-500 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Top Sales Representatives</h3>
                  <p className="text-sm text-gray-600">Monthly best performers</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {overviewData?.bestSalesReps && overviewData.bestSalesReps.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {overviewData.bestSalesReps.map((rep, index) => (
                    <SalesRepCard key={rep.sales_rep_id} rep={rep} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No sales representative data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;