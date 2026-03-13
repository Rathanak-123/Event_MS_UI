import axiosInstance from "./repuest.js";

const BASE = "/bookings/";

export const getAllBookings = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get bookings failed:", error);
    throw error;
  }
};

export const getPaginatedBookings = async ({
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
    console.error("Get paginated bookings failed:", error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post(BASE, bookingData);
    return response.data.data;
  } catch (error) {
    console.error("Create booking failed:", error);
    throw error;
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const response = await axiosInstance.put(`${BASE}${id}/`, bookingData);
    return response.data.data;
  } catch (error) {
    console.error("Update booking failed:", error);
    throw error;
  }
};

export const deleteBooking = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE}${id}/`);
    return response.data;
  } catch (error) {
    console.error("Delete booking failed:", error?.response?.data || error);
    throw error;
  }
};
