import axiosInstance from "./request.js";

const BASE = "/payments/";

export const generateKHQR = async (bookingId, amount) => {
  try {
    const response = await axiosInstance.post(`${BASE}`, {
      booking_id: bookingId,
      amount: String(amount),
      payment_method: "bakong",
      qr_method: "khqr",
      currency: "usd",
      status: "pending",
    });
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
export const checkPaymentByMD5 = async (md5) => {
  try {
    const response = await axiosInstance.post(`${BASE}check-status/`, { md5: md5 });
    return response.data;
  } catch (error) {
    console.error("Check payment failed:", error);
    throw error;
  }
}
  