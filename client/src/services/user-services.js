import api from "@lib/api";

// Register user function for adding sales reps and resource managers
export const registerUser = async (userData) => {
  try {
    console.log("📤 registerUser: Sending data to API:", userData);
    
    const response = await api.post('/api/auth/register', userData);
    console.log("📥 registerUser: API response:", response);

    if (response.status === 200 || response.status === 201) {
      return {
        success: true,
        data: response.data,
        message: response.data.message || "User registered successfully"
      };
    } else {
      return { 
        success: false, 
        message: response.data?.message || response.statusText || "Registration failed"
      };
    }
  } catch (error) {
    console.error("💥 registerUser: Error occurred:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Registration failed"
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

// Get all users
export const getAllUsers = async (role = null, page = 1, limit = 100) => {
  try {
    // Check if auth token exists
    const token = localStorage.getItem("authToken");
    console.log("🔐 Auth token exists:", !!token);
    console.log("🔑 Auth token preview:", token ? `${token.substring(0, 20)}...` : 'No token');
    
    let url = `/api/users?page=${page}&limit=${limit}`;
    if (role) {
      url += `&role=${role}`;
    }
    
    console.log("🌐 getAllUsers: Making API call to:", url);
    const response = await api.get(url);
    console.log("📡 getAllUsers: API response status:", response.status);
    console.log("📊 getAllUsers: API response data:", response.data);

    if (response.status === 200) {
      const result = {
        success: true,
        data: response.data.data.users,
        pagination: response.data.data.pagination
      };
      console.log("✅ getAllUsers: Returning result:", result);
      return result;
    } else {
      console.log("⚠️ getAllUsers: Non-200 status:", response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error("💥 getAllUsers: Error occurred:", error);
    console.error("📋 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return {
      success: false,
      message: error.response?.data?.message || error.message || error,
    };
  }
};

// Get all sales staff
export const getAllSalesStaff = async () => {
  try {
    console.log("🔍 getAllSalesStaff: Fetching sales staff...");
    return await getAllUsers('sales_staff');
  } catch (error) {
    console.error("💥 getAllSalesStaff: Error occurred:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch sales staff"
    };
  }
};

// Get all resource managers
export const getAllResourceManagers = async () => {
  try {
    console.log("🔍 getAllResourceManagers: Fetching resource managers...");
    
    const response = await api.get('/api/resource-managers');
    console.log("📥 getAllResourceManagers: API response:", response);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Resource managers retrieved successfully"
      };
    } else {
      return { 
        success: false, 
        message: response.data?.message || response.statusText || "Failed to fetch resource managers"
      };
    }
  } catch (error) {
    console.error("💥 getAllResourceManagers: Error occurred:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to fetch resource managers"
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

// Update user function for editing resource managers and other users
export const updateUser = async (userId, userData) => {
  try {
    console.log("📤 updateUser: Sending data to API:", { userId, userData });
    
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }
    
    const response = await api.put(`/api/users/${userId}`, userData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("📥 updateUser: API response:", response);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: response.data.message || "User updated successfully"
      };
    } else {
      return { 
        success: false, 
        message: response.data?.message || response.statusText || "Update failed"
      };
    }
  } catch (error) {
    console.error("💥 updateUser: API error:", error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || error.response.statusText || "Update failed",
        status: error.response.status
      };
    } else if (error.request) {
      return {
        success: false,
        message: "Network error. Please check your connection and try again."
      };
    } else {
      return {
        success: false,
        message: error.message || "An unexpected error occurred"
      };
    }
  }
};
