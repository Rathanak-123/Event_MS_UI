import axiosInstance from "./repuest.js";

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
