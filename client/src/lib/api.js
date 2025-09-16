import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    // Try multiple token storage keys
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 API Request: Adding auth token to request");
    } else {
      console.warn("⚠️ API Request: No auth token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("🔒 Authentication failed - token may be expired");
      // Optionally redirect to login or refresh token
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
