import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("🔧 API Request interceptor - Token:", token ? token.substring(0, 20) + "..." : "No token found");
    console.log("🔧 API Request interceptor - URL:", config.baseURL + config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header added");
    } else {
      console.log("❌ No token available for authorization");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor to log errors
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response success:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log("❌ API Response error:", error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
