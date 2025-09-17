import api from "@lib/api";

export const createCustomer = async (customerData) => {
  try {
    // Updated to use microservices API endpoint
    const response = await api.post(`/api/customers`, customerData);

    if (response.status === 201) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('Error in createCustomer:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getCustomerByUserCode = async (userCode) => {
  try {
    console.log('Fetching customer by userCode:', userCode);
    // Updated to use microservices API endpoint
    const response = await api.get(`/api/customers/${userCode}`);

    if (response.status === 200) {
      console.log('Customer service response:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('Error in getCustomerByUserCode:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getAllCustomers = async (cursor, limit) => {
  try {
    // Updated to use microservices API endpoint
    const response = await api.get(`/api/customers?cursor=${cursor}&limit=${limit}`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.customers || response.data.data?.customers,
        nextCursor: response.data.nextCursor,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getAllCustomersNoPage = async () => {
  try {
    const response = await api.get(`/customer/get-all-customers-no-page`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.customers,
        nextCursor: response.data.nextCursor,
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

export const updateCustomer = async (user_code, customerData) => {
  try {
    console.log('Updating customer:', user_code, customerData);
    // Updated to use microservices API endpoint
    const response = await api.put(
      `/api/customers/${user_code}`,
      customerData,
    );

    if (response.status === 200) {
      console.log('Customer update response:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const deleteCustomer = async (userCode) => {
  try {
    const response = await api.delete(`/customer/delete/${userCode}`);

    // handle success (201 Created or 200 OK)
    if (response.status === 201 || response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      // handle unexpected status codes
      return {
        success: false,
        error: response.statusText || "Unexpected error occurred",
        status: response.status, // include status code for debugging
      };
    }
  } catch (error) {
    // handle network errors, 500 errors, etc.
    if (error.response) {
      // the request was made, but the server responded with an error (e.g., 500, 400)
      return {
        success: false,
        message: error.response.data?.message || "Server error occurred",
        status: error.response.status, // include status code for debugging
      };
    } else if (error.request) {
      // the request was made, but no response was received (e.g., network error)
      return {
        success: false,
        message: "No response received from the server",
      };
    } else {
      // something happened in setting up the request (e.g., invalid request config)
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
};
