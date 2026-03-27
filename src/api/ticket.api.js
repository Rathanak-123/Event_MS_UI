import axiosInstance from "./request.js";

const BASE = "/tickets/";

export const getAllTickets = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    return response.data.data || [];
  } catch (error) {
    console.error("Get tickets failed:", error);
    throw error;
  }
};

export const getPaginatedTickets = async ({
  page = 1,
  limit = 10,
  sort_by = "id",
  sort_order = "asc",
  search = "",
  filters = {},
}) => {
  try {
    const response = await axiosInstance.post(`${BASE}paginate/`, {
      page,
      limit,
      sort_by,
      sort_order,
      search,
      filters,
    });

    return response.data.data;
  } catch (error) {
    console.error("Get paginated tickets failed:", error);
    throw error;
  }
};

export const createTicket = async (ticketData) => {
  try {
    const response = await axiosInstance.post(BASE, ticketData);
    return response.data.data;
  } catch (error) {
    console.error("Create ticket failed:", error);
    throw error;
  }
};

export const updateTicket = async (id, ticketData) => {
  try {
    const response = await axiosInstance.put(`${BASE}${id}/`, ticketData);
    return response.data.data;
  } catch (error) {
    console.error("Update ticket failed:", error);
    throw error;
  }
};

export const deleteTicket = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE}${id}/`);
    return response.data;
  } catch (error) {
    console.error("Delete ticket failed:", error?.response?.data || error);
    throw error;
  }
};
