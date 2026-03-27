import axiosInstance from "./request.js";

const BASE = "/users/";

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get users failed:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE}${id}/`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get user by ID failed:", error);
    throw error;
  }
};
