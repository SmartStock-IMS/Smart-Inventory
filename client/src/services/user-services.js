import api from "@lib/api";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Profile Management Functions
export const getUserProfile = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    console.log('getUserProfile called with userId:', userId);
    console.log('Token available:', !!token);
    
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }
    
    const response = await axios.get(
      `${API_URL}/users/profile/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('getUserProfile response status:', response.status);
    console.log('getUserProfile response data:', response.data);

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        user: response.data.data.user,
        data: response.data.data,
      };
    } else {
      return { success: false, error: response.data.message || response.statusText };
    }
  } catch (error) {
    console.error('getUserProfile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Existing functions
export const createCustomer = async (customerData) => {
  try {
    const response = await api.post(`/customer/add`, customerData);

    if (response.status === 201) {
      return {
        success: true,
        data: response.data,
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

export const getUser = async (email) => {
  try {
    const response = await api.get(`/users/get-user?email=${email}`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
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

export const getAllCustomers = async () => {
  try {
    const response = await api.get(`/users/get-customers`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
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

//Bishan Kulasekara
// New functions for updating, deleting, and retrieving a single customer
export const updateCustomer = async (user_code, customerData) => {
  try {
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }
    
    const response = await axios.put(
      `${API_URL}/customer/update/${user_code}`,
      customerData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
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

export const deleteCustomer = async (user_code) => {
  try {
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }
    
    const response = await axios.delete(
      `${API_URL}/customer/delete/${user_code}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message,
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

export const getCustomer = async (user_code) => {
  try {
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }
    
    const response = await axios.get(
      `${API_URL}/customer/get/${user_code}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
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
