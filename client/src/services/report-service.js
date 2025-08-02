import api from "@lib/api";

export const dailySummary = async (summaryDate) => {
  try {
    const response = await api.get(`/report/daily-summary?date=${summaryDate}`);

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

export const qbSummary = async (summaryDate) => {
  try {
    const response = await api.get(`/report/qb-summary?date=${summaryDate}`);

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