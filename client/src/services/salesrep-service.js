import api from "@lib/api";

// Create a new SalesRep
export const createSalesRep = async (salesRepData) => {
  try {
    const response = await api.post("/salesrep/add", salesRepData);

    if (response.status === 201) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get all SalesReps
export const getAllSalesReps = async () => {
  try {
    const response = await api.get("/salesrep/get-all");

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get a single SalesRep by emp_code
export const getSalesRep = async (empCode) => {
  try {
    const response = await api.get(`/salesrep/get/${empCode}`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Update a SalesRep by emp_code
export const updateSalesRep = async (empCode, salesRepData) => {
  try {
    const response = await api.put(
      `/salesrep/update/${empCode}`,
      salesRepData,
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      // TODO: add function to handle validation errors
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Delete a SalesRep by emp_code
export const deleteSalesRep = async (emp_code) => {
  try {
    const response = await api.delete(`/salesrep/delete/${emp_code}`);

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message,
      };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
