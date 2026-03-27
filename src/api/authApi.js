import axiosInstance from "./request";

export const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login/", credentials);
  return response.data;
};

export const signup = async (userData) => {
  const response = await axiosInstance.post("/auth/register/", userData);
  return response.data;
};

export const googleLogin = async (id_token, role_id) => {
  const response = await axiosInstance.post("/auth/google/", { id_token, role_id });
  return response.data;
};

export const refreshToken = async () => {
  const isAdmin = window.location.pathname.startsWith("/admin");
  const key = isAdmin ? "admin_refreshToken" : "client_refreshToken";
  const refresh = localStorage.getItem(key);
  if (!refresh) throw new Error("No refresh token");

  const response = await axiosInstance.post("/auth/refresh/", { refresh });
  return response.data;
};

export const logout = async (loginType = "client") => {
  const prefix = loginType === "admin" ? "admin" : "client";
  try {
    await axiosInstance.post("/auth/logout/");
  } catch (error) {
    console.error("Logout API failed:", error);
  } finally {
    localStorage.removeItem(`${prefix}_accessToken`);
    localStorage.removeItem(`${prefix}_refreshToken`);
    localStorage.removeItem(`${prefix}_user`);
  }
};
