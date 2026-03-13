import axiosInstance from "./repuest.js";

const BASE = "/venue/";

export const getAllVenues = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    return response.data.data || [];
  } catch (error) {
    console.error("Get venues failed:", error);
    throw error;
  }
};

export const getPaginatedVenues = async ({
  page = 1,
  limit = 10,
  sort_by = "name",
  sort_order = "asc",
  search = "",
  filters = {},
}) => {
  try {
    const response = await axiosInstance.post(`${BASE}paginated/`, {
      page,
      limit,
      sort_by,
      sort_order,
      search,
      filters,
    });
    return response.data.data;
  } catch (error) {
    console.error("Get paginated venues failed:", error);
    throw error;
  }
};

export const createVenue = async (venueData) => {
  try {
    const response = await axiosInstance.post(BASE, venueData);
    return response.data.data;
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
    const response = await axiosInstance.delete(`${BASE}${venueId}/`);
    return response.data;
  } catch (error) {
    console.error("Delete venue failed:", error?.response?.data || error);
    throw error;
  }
};
