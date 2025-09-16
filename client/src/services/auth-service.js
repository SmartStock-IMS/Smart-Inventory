import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const userLogin = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (response.status === 200) {
      // Handle new response structure from updated user service
      const { data } = response.data;
      localStorage.setItem("authToken", data.accessToken);
      return {
        success: true,
        user: response.data,
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

export const validateUser = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/auth/validate`, 
      { token }, 
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );
    if (response.status === 200) {
      return { success: true, user: response.data.data.user };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.log("Token validation error: ", error);
    return { success: false, error: error.message };
  }
};
