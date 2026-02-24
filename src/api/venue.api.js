import axiosInstance from "./repuest.js"; // ← your axios instance with interceptors & baseURL

const BASE = "/venue/";

export const getAllVenues = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    return response.data.data || []; // your API returns { success, message, status_code, data: [...] }
  } catch (error) {
    console.error("Get venues failed:", error);
    throw error;
  }
};

export const createVenue = async (venueData) => {
  try {
    const response = await axiosInstance.post(BASE, venueData);
    return response.data.data; // assuming it returns the created object
  } catch (error) {
    console.error("Create venue failed:", error);
    throw error;
  }
};

export const updateVenue = async (venueId, venueData) => {
  try {
    const response = await axiosInstance.put(`${BASE}${venueId}/`, venueData);
    return response.data.data;
  } catch (error) {
    console.error("Update venue failed:", error);
    throw error;
  }
};

export const deleteVenue = async (venueId) => {
  try {
    await axiosInstance.delete(`${BASE}${venueId}/`);
    return true;
  } catch (error) {
    console.error("Delete venue failed:", error);
    throw error;
  }
};
