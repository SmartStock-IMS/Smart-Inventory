import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, CircleDollarSign } from "lucide-react";
import { getDashboardIncomeData } from "@services/dashboard-service";
import { FaSpinner } from "react-icons/fa";

// Helper function to format a full date in dd/MM/yyyy format
const formatFullDate = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// Helper function to format a month as "Mon/YY"
const formatMonth = (date) => {
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.toLocaleString("en-US", { year: "2-digit" });
  return `${month}/${year}`;
};

const DateRangeSelector = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  className = "",
}) => {
  // Maximum selectable "toDate" is one year from the "fromDate"
  const maxSelectableDate = new Date(
    fromDate.getFullYear() + 1,
    fromDate.getMonth(),
    fromDate.getDate(),
  );

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <div className="relative w-full sm:w-auto">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition duration-200 px-3 py-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <DatePicker
            selected={fromDate}
            onChange={(date) => {
              setFromDate(date);
              // Adjust "toDate" if it exceeds the new maxSelectableDate
              const newMax = new Date(
                date.getFullYear() + 1,
                date.getMonth(),
                date.getDate(),
              );
              if (toDate > newMax) {
                setToDate(newMax);
              }
            }}
            selectsStart
            startDate={fromDate}
            endDate={toDate}
            dateFormat="dd/MM/yyyy"
            className="bg-transparent cursor-pointer text-sm font-medium text-gray-700 focus:outline-none w-24 sm:w-36"
            wrapperClassName="w-full"
            popperClassName="z-50"
            customInput={
              <div className="flex items-center space-x-2 w-full">
                <span>{formatFullDate(fromDate)}</span>
              </div>
            }
          />
        </div>
      </div>

      <span className="text-gray-400 hidden sm:inline">→</span>

      <div className="relative w-full sm:w-auto">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition duration-200 px-3 py-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            selectsEnd
            startDate={fromDate}
            endDate={toDate}
            minDate={fromDate}
            maxDate={maxSelectableDate}
            dateFormat="dd/MM/yyyy"
            className="bg-transparent cursor-pointer text-sm font-medium text-gray-700 focus:outline-none w-24 sm:w-36"
            wrapperClassName="w-full"
            popperClassName="z-50"
            customInput={
              <div className="flex items-center space-x-2 w-full">
                <span>{formatFullDate(toDate)}</span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

const DashboardIncome = () => {
  // Default fromDate is one year ago; toDate is today.
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  );
  const [toDate, setToDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch income data whenever the selected dates change.
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDashboardIncomeData(fromDate, toDate);
        if (result.success) {
          // Ensure we always set an array
          setData(Array.isArray(result.data) ? result.data : []);
        } else {
          setData([]); // Set empty array on failure
          throw new Error(result.message);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setData([]); // Ensure data is always an array
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate]);

  // Generate a complete list of months between the selected dates.
  const chartData = useMemo(() => {
    // Map fetched data by year-month key.
    const monthMap = {};
    
    // Ensure data is an array before calling forEach
    if (Array.isArray(data)) {
      data.forEach((item) => {
        const date = new Date(item.month);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthMap[key] = Number(item.totalIncome); // Ensure numeric value.
      });
    }

    const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    const end = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
    const months = [];

    // Loop through each month between start and end.
    for (let dt = new Date(start); dt <= end; dt.setMonth(dt.getMonth() + 1)) {
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      months.push({
        name: formatMonth(new Date(dt)),
        income: monthMap[key] || 0,
        date: new Date(dt),
      });
    }
    return months;
  }, [data, fromDate, toDate]);

  return (
    <div className="w-full h-full p-4 bg-white rounded-md">
      {loading ? (
        <div className="h-full w-full flex flex-row items-center justify-center gap-2">
          Loading data
          <FaSpinner size={20} color="black" className="animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
      ) : (
        <div className="h-full flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="w-full sm:w-1/2 flex flex-row items-center gap-2">
              <CircleDollarSign className="w-6 h-6" />
              <p className="text-lg font-semibold text-gray-800">Total Income</p>
            </div>
            <div className="w-full sm:w-1/2 flex flex-row items-center justify-start sm:justify-end">
              <DateRangeSelector
                className=""
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                interval={0}
                tick={{ fontSize: 12, fill: "#555" }}
              />
              <YAxis
                tickFormatter={(value) => `Rs.${value / 1000}K`}
                tick={{ fontSize: 12, fill: "#555" }}
              />
              <Tooltip
                formatter={(value) => `Rs.${Number(value).toLocaleString()}`}
              />
              <Bar dataKey="income" fill="#3366FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardIncome;
