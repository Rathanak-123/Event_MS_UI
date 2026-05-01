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
 * Get paginated event tickets.
 * @param {Object} params - Pagination params including filters.
 * @returns {Promise<Object>} Paginated ticket search results.
 */
export const getPaginatedEventTickets = async ({
  page = 1,
  limit = 10,
  sort_by = "id",
  sort_order = "asc",
  search = "",
  filters = {},
}) => {
  try {
    const payload = {
      page,
      limit,
      sort_by,
      sort_order,
      search,
      filters,
    };
    const response = await axiosInstance.post(`${BASE}paginate/`, payload);
    return response.data?.data || response.data || {};
  } catch (error) {
    console.error("Get paginated event tickets failed:", error);
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
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("Create event ticket failed WITH DETAILS:", errorDetails);
    
    // Add debugging alert so we can see the exact backend error
    if (typeof window !== 'undefined') {
        window.alert(`Ticket Creation Failed (400) from Backend:\n\n${errorDetails}`);
    }
    
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
  // First, check if a ticket already exists for this booking
  try {
    const existing = await getPaginatedEventTickets({ 
        filters: { "booking.id": bookingId },
        limit: 1 
    });
    
    // Check both standard paginated response and potential direct array response
    const tickets = existing?.data || (Array.isArray(existing) ? existing : []);
    
    if (tickets.length > 0) {
        console.log("Ticket already exists for booking:", bookingId);
        return tickets[0];
    }
  } catch (e) {
    console.warn("Check for existing ticket failed, proceeding with generation:", e);
  }

  const code = `TIX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${code}`;
  
  return await createEventTicket({
    booking: bookingId,
    ticket_code: code,
    qr_code: qrUrl,
    status: 'UNUSED'
  });
};
