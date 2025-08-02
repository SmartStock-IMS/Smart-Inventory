import api from "@lib/api";

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

export const getCustomerByUserCode = async (userCode) => {
  try {
    const response = await api.get(`/customer/get/${userCode}`);

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

export const getAllCustomers = async (cursor, limit) => {
  try {
    const response = await api.get(`/customer/get-all-customers?cursor=${cursor}&limit=${limit}`);

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
    const response = await api.put(
      `/customer/update/${user_code}`,
      customerData,
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
