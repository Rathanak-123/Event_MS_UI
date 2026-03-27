import axiosInstance from "./request.js";

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

export const getPaginatedEvents = async ({
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
    console.log("event pagianted data:", response?.data?.data);
    return response?.data?.data;
  } catch (error) {
    console.error("Get paginated events failed:", error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const formData = new FormData();

    Object.keys(eventData).forEach((key) => {
      if (
        eventData[key] !== null &&
        eventData[key] !== undefined &&
        eventData[key] !== ""
      ) {
        formData.append(key, eventData[key]);
      }
    });

    const response = await axiosInstance.post(BASE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Create event failed:", error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const formData = new FormData();

    Object.keys(eventData).forEach((key) => {
      if (
        eventData[key] !== null &&
        eventData[key] !== undefined &&
        eventData[key] !== ""
      ) {
        formData.append(key, eventData[key]);
      }
    });

    const response = await axiosInstance.put(`${BASE}${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Update event failed:", error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE}${id}/`);
    return response.data;
  } catch (error) {
    console.error("Delete event failed:", error?.response?.data || error);
    throw error;
  }
};
export const getEventById = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE}${id}/`);
    return response.data.data;
  } catch (error) {
    console.error("Get event by ID failed:", error);
    throw error;
  }
};
