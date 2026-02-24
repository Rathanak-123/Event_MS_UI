import axiosInstance from "./repuest";

const BASE = "/events/";

export const getAllEvents = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    return response.data.data || [];
  } catch (error) {
    console.error("Get events failed:", error);
    throw error;
  }
};

export const createEvents = async (data) => {
  try {
    const payload = {
      ...data,
      category_id: Number(data.category_id),   // ← FIXED
      venue_id: Number(data.venue_id),
    };
    const response = await axiosInstance.post(BASE, payload);
    return response.data.data;
  } catch (error) {
    console.error("Create Event Error", error.response?.data || error);
    throw error;
  }
};

export const updateEvents = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${BASE}${id}/`, data);
    return response.data.data;
  } catch (error) {
    console.error("Update failed", error);
    throw error;
  }
};

export const deleteEvents = async (id) => {
  const response = await axiosInstance.delete(`${BASE}${id}/`);
  return response.data.data;
};