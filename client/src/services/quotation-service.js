import api from "@lib/api";

export const createNewQuotation = async (quotationData) => {
  try {
    const response = await api.post("/quotation/create", quotationData);

    if (response.status === 201) {
      return {
        success: true,
        data: response.data.products,
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

export const getQuotationsBySalesRep = async (salesRepId) => {
  try {
    const response = await api.get(
      `/quotation/get-quotations?sales_rep_id=${salesRepId}`,
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

export const getQuotationsByCustomer = async (customerId) => {
  try {
    const response = await api.get(
      `/quotation/get-quotations-by-customer?id=${customerId}`,
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

export const getQuotations = async () => {
  try {
    const response = await api.get(`/quotation/get-all-quotations`);

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

export const updateQuotationStatus = async (quotationId, statusData) => {
  try {
    const response = await api.put(`/quotation/${quotationId}`, statusData);
    if (response.status === 201) {
      console.log("Quotation updated: ", response);
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
      error: error,
    };
  }
};

export const updateQuotationItemsQuantity = async (quotationId) => {
  try {
    const response = await api.put(`/quotation/update-qty/${quotationId}`);
    if (response.status === 201) {
      console.log("Quotation items quantity updated: ", response);
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
      error: error,
    };
  }
};

export const getInvoice = async (quotationId) => {
  try {
    const response = await api.get(`/quotation/get-invoice/${quotationId}`);

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