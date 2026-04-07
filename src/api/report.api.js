import axiosInstance from "./request";

const reportApi = {
  /**
   * Retrieves paginated, searchable, and filterable booking report.
   * @param {Object} params - { page, limit, search, filters: { event_id, status, start_date, end_date, ... } }
   */
  getBookingReport: async (params) => {
    const response = await axiosInstance.post("/reports/booking-report/", params);
    return response.data;
  },

  /**
   * Retrieves revenue summary report per event.
   */
  getRevenueReport: async (params) => {
    const response = await axiosInstance.post("/reports/revenue/", params);
    return response.data;
  },

  /**
   * Retrieves payment method analysis report.
   */
  getPaymentMethodReport: async (params) => {
    const response = await axiosInstance.post("/reports/payment-methods/", params);
    return response.data;
  },

  /**
   * Retrieves attendance versus booking report.
   */
  getAttendanceReport: async (params) => {
    const response = await axiosInstance.post("/reports/attendance/", params);
    return response.data;
  },
};

export default reportApi;
