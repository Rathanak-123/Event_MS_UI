import axiosInstance from "./request.js";

const BASE = "/customers/";

export const getAllCustomers = async () => {
  try {
    const response = await axiosInstance.get(BASE);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : (data.items || data.results || []);
  } catch (error) {
    console.error("Get customers failed:", error);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE}${id}/`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get customer by ID failed:", error);
    throw error;
  }
};

export const getPaginatedCustomers = async ({
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
    return response?.data?.data;
  } catch (error) {
    console.error("Get paginated customers failed:", error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const formData = new FormData();

    Object.keys(customerData).forEach((key) => {
      if (
        customerData[key] !== null &&
        customerData[key] !== undefined &&
        customerData[key] !== ""
      ) {
        formData.append(key, customerData[key]);
      }
    });

    const response = await axiosInstance.post(BASE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Create customer failed:", error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const formData = new FormData();

    Object.keys(customerData).forEach((key) => {
      if (
        customerData[key] !== null &&
        customerData[key] !== undefined &&
        customerData[key] !== ""
      ) {
        formData.append(key, customerData[key]);
      }
    });

    const response = await axiosInstance.put(`${BASE}${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Update customer failed:", error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE}${id}/`);
    return response.data;
  } catch (error) {
    console.error("Delete customer failed:", error?.response?.data || error);
    throw error;
  }
};
