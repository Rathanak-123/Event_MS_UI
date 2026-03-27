import axiosInstance from "./request.js";

const BASE = "/categories/";

export const getAllCategories = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    return response.data.data || [];
  } catch (error) {
    console.error("Get categories failed:", error);
    throw error;
  }
};

export const getPaginatedCategories = async ({
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
    console.error("Get paginated categories failed:", error);
    throw error;
  }
};

export const createCategory = async (categoriesData) => {
  try {
    const response = await axiosInstance.post(BASE, categoriesData);
    return response.data.data;
  } catch (error) {
    console.error("Create category failed:", error);
    throw error;
  }
};

export const updateCategory = async (id, categoriesData) => {
  try {
    const response = await axiosInstance.put(`${BASE}${id}/`, categoriesData);
    return response.data.data;
  } catch (error) {
    console.error("Update category failed:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE}${id}/`);
    return response.data;
  } catch (error) {
    console.error("Delete category failed:", error);
    throw error;
  }
};
