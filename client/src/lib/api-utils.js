// Enhanced API utilities for consistent authentication across the app
import axios from 'axios';

// Base URL configuration
const BASE_URL = `${import.meta.env.VITE_API_URL}`;

// Create configured axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Utility function for fetch API calls with authentication
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // If URL doesn't start with http, prepend BASE_URL
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Helper functions for common HTTP methods
export const apiGet = (url, options = {}) => api.get(url, options);
export const apiPost = (url, data, options = {}) => api.post(url, data, options);
export const apiPut = (url, data, options = {}) => api.put(url, data, options);
export const apiDelete = (url, options = {}) => api.delete(url, options);

export default api;