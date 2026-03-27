import axiosInstance from "./request.js";

const BASE = "/payments/";

export const generateKHQR = async (bookingId) => {
  try {
    const response = await axiosInstance.post(`${BASE}khqr/`, { booking_id: bookingId });
    return response.data;
  } catch (error) {
    console.error("KHQR generation failed:", error);
    throw error;
  }
};

export const getPaymentStatus = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`${BASE}status/${bookingId}/`);
    return response.data;
  } catch (error) {
    console.error("Get payment status failed:", error);
    throw error;
  }
};
