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

  /**
   * Retrieves event booking & payment report with optional filtering.
   */
  getEventReportList: async (params) => {
    const response = await axiosInstance.get("/reports/event-report-list/", { params });
    return response.data;
  },

  /**
   * Retrieves event check-in report with optional filtering.
   */
  getCheckInReport: async (params) => {
    const response = await axiosInstance.get("/reports/check-in-report/", { params });
    return response.data;
  },
  /**
   * Retrieves dashboard summary, charts, and top statistics.
   */
  getDashboardStats: async (params) => {
    const response = await axiosInstance.get("/dashboard/stats/", { params });
    return response.data;
  },
};

export default reportApi;
