import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getDashboardIncomeData = async (fromDate, toDate) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }
    const response = await axios.get(`${API_URL}/dashboard/income`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { fromDate, toDate },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getPopularProductsData = async () => {
  try {
    // Retrieve token from local storage (or wherever you store it)
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }
    
    const response = await axios.get(`${API_URL}/dashboard/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      // Assuming response.data is structured as: { success: true, data: [...] }
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false, message: response.statusText };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getOverviewData = async (timePeriod = "This Month") => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }

    const response = await axios.get(
      `${API_URL}/dashboard/overview?timePeriod=${encodeURIComponent(timePeriod)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200) {
      // Expecting response.data to have shape: { success: true, data: { totalCustomers, totalIncome, bestSalesReps } }
      return { success: true, data: response.data.data };
    } else {
      return { success: false, message: response.statusText };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};