import { useState, useEffect } from "react";
import {
  User,
  Users,
  HandCoins,
  ChartNoAxesGantt,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { useTheme } from "../../../context/theme/ThemeContext.jsx";
import api from "../../../lib/api";
import axios from "axios";

const getOverviewData = async (period) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/customers", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const totalCustomers = response.data.data.customers[0].total_count;

    const response2 = await api.get("/users/sales-staff", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const rankedUsers = response2.data.data.users
      .sort(
        (a, b) =>
          parseFloat(b.performance_rating) - parseFloat(a.performance_rating)
      )
      .map((user, i) => ({ ...user, rank: i + 1 }));

    const responseIncome = await axios.get(
      "http://localhost:3000/api/reports/yearly-summary?year=2025",
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    // Calculate total income from all records (use only approved/completed)
    const incomeData = responseIncome.data.data || [];
    const totalIncome = incomeData
      .filter((item) => item.status !== "rejeced")
      .reduce((sum, item) => sum + parseFloat(item.net_total || 0), 0);

    const baseData = {
      totalCustomers: totalCustomers,
      totalIncome,
      bestSalesReps: rankedUsers.slice(0, 5).map((u, i) => ({
        sales_rep_id: i + 1,
        name: u.full_name,
      })),
    };

    return { success: true, data: baseData };
    //return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: error.message };
  }
};

const Overview = () => {
  const { isDarkMode } = useTheme();
  const [timePeriod, setTimePeriod] = useState("This Year");
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

  const StatCard = ({
    icon: Icon,
    title,
    value,
    gradient,
    iconBg,
    textColor = "text-gray-900",
  }) => (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 ${
        isDarkMode ? "border-blue-400 bg-gray-800" : "border-blue-500 bg-white"
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="absolute inset-0 bg-white rounded-full transform rotate-12 scale-150"></div>
      </div>
      <div className="relative z-10 flex items-center gap-4">
        <div
          className={`w-16 h-16 ${iconBg} rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <p
            className={`opacity-90 text-sm font-medium tracking-wide mb-1 transition-colors duration-300 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold tracking-wide transition-colors duration-300 ${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
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
      "from-blue-300 to-blue-500",
    ];

    const iconBgs = [
      "bg-indigo-500/20",
      "bg-blue-500/20",
      "bg-blue-500/20",
      "bg-blue-500/20",
      "bg-blue-500/20",
    ];

    return (
      <div className="group relative">
        <div
          className={`rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border group-hover:border-gray-200 ${
            isDarkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${colors[index % colors.length]} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <User className="w-8 h-8 text-white" />
              </div>
              {index === 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Award className="w-3 h-3 text-yellow-800" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p
                className={`text-sm font-semibold transition-colors group-hover:text-gray-900 ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {rep.name}
              </p>
              {index === 0 && (
                <p className="text-xs text-yellow-600 font-medium mt-1">
                  Top Performer
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-3xl border shadow-xl overflow-hidden transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-700"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50 border-gray-200"
      }`}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div
          className={`p-8 text-center transition-colors duration-300 ${
            isDarkMode ? "text-gray-300" : "text-gray-800"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? "bg-red-900/20" : "bg-red-100"
            }`}
          >
            <ChartNoAxesGantt className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-red-400 font-semibold text-lg mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-400">{error}</p>
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
                  <h2 className="text-2xl font-bold mb-1">
                    Overview Dashboard
                  </h2>
                  <p className="text-white/80">Real-time business insights</p>
                </div>
              </div>

              <div className="relative">
                <select
                  className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white/30 transition-colors appearance-none pr-10"
                  value={timePeriod}
                  onChange={handleTimePeriodChange}
                >
                  <option value="This Year" className="text-gray-800">
                    This Year
                  </option>
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
              value={`Rs. ${Number(
                overviewData?.totalIncome || 0
              ).toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              gradient="border-2 border border-blue-500"
              iconBg="bg-gradient-to-br from-blue-400 to-blue-500"
            />
          </div>

          {/* Sales Representatives Section */}
          <div
            className={`rounded-2xl border-2 border-blue-500 shadow-sm overflow-hidden transition-colors duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`px-6 py-4 border-b transition-colors duration-300 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Top Sales Representatives
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Best performers
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {overviewData?.bestSalesReps &&
              overviewData.bestSalesReps.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {overviewData.bestSalesReps.map((rep, index) => (
                    <SalesRepCard
                      key={rep.sales_rep_id}
                      rep={rep}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <Users
                      className={`w-8 h-8 transition-colors duration-300 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No sales representative data available
                  </p>
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
