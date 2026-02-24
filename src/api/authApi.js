import axiosInstance from "./repuest";
export const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login/", credentials);
  return response.data;
};
export const refreshToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("No refresh token");

  const response = await axiosInstance.post("/auth/refresh/", { refresh });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  // optional: call /auth/logout/ if backend supports it
};
