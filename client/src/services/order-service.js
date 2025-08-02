import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("authToken");

export const createNewOrder = async () => {
  try {
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }

    const response = await axios.get(`${API_URL}/orders/create`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.products,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const fetchOrders = async (orderStatus) => {
  try {
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }

    const response = await axios.get(`${API_URL}/orders/get/${orderStatus}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.orders,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};
