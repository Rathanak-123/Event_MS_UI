import axiosInstance from "./repuest.js";

const BASE = "/categories/";

export const getAllCategories = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    return response.data.data || []; // your API returns { success, message, status_code, data: [...] }
  } catch (error) {
    console.error("Get venues failed:", error);
    throw error;
  }
};

export const createCategory = async (categoriesData) => {
  try {
    const response = await axiosInstance.post(BASE, categoriesData);
    return response.data.data; // assuming it returns the created object
  } catch (error) {
    console.error("Create venue failed:", error);
    throw error;
  }
};

export const updateCategory = async (id, categorieseData) => {
  try {
    const response = await axiosInstance.put(`${BASE}${id}/`, categorieseData);
    return response.data.data;
  } catch (error) {
    console.error("Update venue failed:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  return axiosInstance.delete(`${BASE}${id}/`);
};
