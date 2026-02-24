import axiosInstance from "./repuest";

const BASE = "/tickets/"; // Fixed: plural to match Swagger

export const getAllTickets = async () => {
  const response = await axiosInstance.get(BASE);
  return response.data.data || [];
};

export const createTicket = async (data) => {
  try {
    const payload = {
      event_id: Number(data.event_id),
      ticket_type: data.ticket_type,
      price: Number(data.price),
      quantity: Number(data.quantity) || 0,
      sold: Number(data.sold) || 0,
    };
    const response = await axiosInstance.post(BASE, payload);
    return response.data.data;
  } catch (error) {
    console.error("Create Ticket Error", error.response?.data || error);
    throw error;
  }
};

export const updateTicket = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${BASE}${id}/`, data);
    return response.data.data;
  } catch (error) {
    console.error("Update Ticket Error", error.response?.data || error);
    throw error;
  }
};

export const deleteTicket = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE}${id}/`);
    return response.data.data;
  } catch (error) {
    console.error("Delete Ticket Error", error.response?.data || error);
    throw error;
  }
};
