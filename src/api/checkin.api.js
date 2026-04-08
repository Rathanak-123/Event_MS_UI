import axiosInstance from "./request.js";

const BASE = "/checkins/";

/**
 * Get all checkins.
 * @returns {Promise<Array>} List of checkins.
 */
export const getCheckins = async () => {
  try {
    const response = await axiosInstance.get(`${BASE}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to fetch checkins:", error);
    throw error;
  }
};

/**
 * Create a new checkin.
 * @param {Object} data - { booking_id, ticket_code, status }
 * @returns {Promise<Object>} Created checkin.
 */
export const createCheckin = async (data) => {
  try {
    const response = await axiosInstance.post(`${BASE}`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to create checkin:", error);
    throw error;
  }
};

/**
 * Confirm a checkin.
 * @param {Object} data - { ticket_code }
 * @returns {Promise<Object>} The checkin result.
 */
export const confirmCheckin = async (data) => {
  try {
    const response = await axiosInstance.post(`${BASE}confirm/`, data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to confirm checkin:", error);
    throw error;
  }
};

/**
 * Paginate checkins.
 * @param {Object} params - { page, limit, sort_by, sort_order, search, filters }
 * @returns {Promise<Object>} Paginated checkins.
 */
export const paginateCheckins = async (params) => {
  try {
    const response = await axiosInstance.post(`${BASE}paginate/`, params);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to paginate checkins:", error);
    throw error;
  }
};

/**
 * Get check-in statistics for a specific event.
 * @param {number|string} eventId - The ID of the event.
 * @returns {Promise<Object>} Statistics data.
 */
export const getCheckinStats = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/event-tickets/checkin-stats/`, {
      params: { event_id: eventId },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to fetch check-in stats:", error);
    throw error;
  }
};
