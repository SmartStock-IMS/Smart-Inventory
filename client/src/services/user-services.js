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

// Update User Profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const token = localStorage.getItem("token");
    console.log('updateUserProfile called with userId:', userId);
    console.log('Profile data:', profileData);
    
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }
    
    const response = await axios.put(
      `${API_URL}/users/${userId}`,
      profileData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('updateUserProfile response status:', response.status);
    console.log('updateUserProfile response data:', response.data);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        user: response.data.data?.user || response.data.user,
      };
    } else {
      return { success: false, error: response.data.message || response.statusText };
    }
  } catch (error) {
    console.error('updateUserProfile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Change User Password
export const changeUserPassword = async (userId, passwordData) => {
  try {
    const token = localStorage.getItem("token");
    console.log('changeUserPassword called with userId:', userId);
    
    if (!token) {
      return { success: false, message: "No token found, please login." };
    }
    
    const response = await axios.put(
      `${API_URL}/users/password/${userId}`,
      passwordData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('changeUserPassword response status:', response.status);
    console.log('changeUserPassword response data:', response.data);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.data.message || response.statusText };
    }
  } catch (error) {
    console.error('changeUserPassword error:', error);
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

// Delete Customer
export const deleteCustomer = async (customerData) => {
  try {
    const response = await api.post(`/customer/delete`, customerData);

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

// Update Customer
export const updateCustomer = async (user_code, customerData) => {
  try {
    const token = localStorage.getItem("token");
    
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

// Get Customer
export const getCustomer = async (user_code) => {
  try {
    const token = localStorage.getItem("token");
    
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