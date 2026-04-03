import axiosInstance from "./request.js";

const BASE = "/event-tickets/";

/**
 * Get all event tickets, optionally filtered by booking ID.
 * @param {Object} params - Query parameters.
 * @returns {Promise<Array>} List of tickets.
 */
export const getEventTickets = async (params = {}) => {
  try {
    const response = await axiosInstance.get(BASE, { params });
    // Assuming backend returns { data: [...] } or just [...]
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get event tickets failed:", error);
    throw error;
  }
};

/**
 * Create a new event ticket.
 * @param {Object} ticketData - Ticket data (booking, ticket_code, qr_code, status).
 * @returns {Promise<Object>} Created ticket.
 */
export const createEventTicket = async (ticketData) => {
  try {
    const response = await axiosInstance.post(BASE, ticketData);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Create event ticket failed:", error);
    throw error;
  }
};

/**
 * Get a specific event ticket by ID.
 * @param {number|string} id - Ticket ID.
 * @returns {Promise<Object>} Ticket details.
 */
export const getEventTicketById = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE}${id}/`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Get event ticket ${id} failed:`, error);
    throw error;
  }
};

/**
 * Generate a simulated ticket data object and send to API.
 * @param {number|string} bookingId - Booking ID.
 * @returns {Promise<Object>} Created ticket.
 */
export const generateEventTicket = async (bookingId) => {
  const code = `TIX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${code}`;
  
  return await createEventTicket({
    booking: bookingId,
    ticket_code: code,
    qr_code: qrUrl,
    status: 'ACTIVE'
  });
};
