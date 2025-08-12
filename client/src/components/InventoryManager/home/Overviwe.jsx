import { useState, useEffect } from "react";
import { User, Users, HandCoins, ChartNoAxesGantt } from "lucide-react";
import { getOverviewData } from "@services/dashboard-service";
import { FaSpinner } from "react-icons/fa";

const Overview = () => {
  const [timePeriod, setTimePeriod] = useState("This Month"); // default: This Month
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

  // Fetch data when component mounts or timePeriod changes
  useEffect(() => {
    fetchOverview(timePeriod);
  }, [timePeriod]);

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  return (
    <div className="p-4 bg-white rounded-md">
      {loading ? (
        <div className="h-full w-full flex flex-row items-center justify-center gap-2">
          Loading overview data
          <FaSpinner size={20} color="black" className="animate-spin" />
        </div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Header with dropdown */}
          <div className="flex justify-between items-center">
            <div className="flex flex-row items-center gap-2">
              <ChartNoAxesGantt className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Overview</h2>
            </div>
            <select
              className="bg-gray-50 px-3 py-1.5 rounded-md text-sm border border-gray-200"
              value={timePeriod}
              onChange={handleTimePeriodChange}
            >
              <option value="All Time">All Time</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          {/* Stats grid */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-3">
            {/* Customers stat */}
            <div className="w-full sm:w-1/2 py-4 px-4 sm:px-6 flex flex-row items-center gap-3 bg-gray-100 rounded-md">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 p-3 sm:p-4 bg-gray-200 rounded-full shadow text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-gray-600 text-sm font-light tracking-wide">
                  Customers
                </p>
                <p className="text-lg font-bold tracking-wider">
                  {overviewData?.totalCustomers || 0}
                </p>
              </div>
            </div>
            {/* Income stat */}
            <div className="w-full sm:w-1/2 py-4 px-4 sm:px-6 flex flex-row items-center gap-3 bg-gray-100 rounded-md">
              <HandCoins className="w-10 h-10 sm:w-12 sm:h-12 p-3 sm:p-4 bg-gray-200 rounded-full shadow text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-gray-600 text-sm font-light tracking-wide">
                  Income
                </p>
                <p className="text-lg font-bold tracking-wide">
                  Rs. {Number(overviewData?.totalIncome || 0).toLocaleString('en-LK', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
                </p>
              </div>
            </div>
          </div>

          {/* Sales Representatives */}
          <div className="p-4 flex flex-col gap-3 bg-gray-100 rounded-md">
            <p className="text-sm font-light">
              Monthly best sales representatives :{" "}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {overviewData?.bestSalesReps &&
              overviewData.bestSalesReps.length > 0 ? (
                overviewData.bestSalesReps.map((rep) => (
                  <div
                    key={rep.sales_rep_id}
                    className="py-4 flex flex-col items-center gap-2 bg-white rounded-md"
                  >
                    <User className="w-10 h-10 sm:w-12 sm:h-12 p-3 sm:p-4 bg-gray-100 rounded-full shadow text-gray-600" />
                    <p className="text-xs text-gray-600 text-center">
                      {rep.name}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500">No sales representative data available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
