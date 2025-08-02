import api from "@lib/api";

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
