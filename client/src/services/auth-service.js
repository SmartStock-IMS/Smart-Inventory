import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const userLogin = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (response.status === 200 && response.data.success) {
      // Store the token from the backend response
      localStorage.setItem("token", response.data.data.token);
      return {
        success: true,
        user: response.data.data,
      };
    } else {
      return { success: false, error: response.data.message || response.statusText };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const validateUser = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/auth/validate`, {
      token: token
    }, {
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      return { 
        success: true, 
        user: response.data.data.user
      };
    } else {
      return { success: false, error: response.data.message || response.statusText };
    }
  } catch (error) {
    console.log("Token validation error: ", error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};
