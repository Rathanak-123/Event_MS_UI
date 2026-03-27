import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10800,
});

/**
 * Pick the correct access token based on the current page path.
 * Admin pages (starting with /admin) use admin_accessToken,
 * everything else uses client_accessToken.
 */
function getActiveAccessToken() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  const key = isAdmin ? "admin_accessToken" : "client_accessToken";
  return localStorage.getItem(key);
}

function getActiveRefreshToken() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  const key = isAdmin ? "admin_refreshToken" : "client_refreshToken";
  return localStorage.getItem(key);
}

function getActiveTokenKey() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin ? "admin_accessToken" : "client_accessToken";
}

// Request interceptor – add token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getActiveAccessToken();
    const isAuthEndpoint = config.url.includes("/auth/login") || 
                           config.url.includes("/auth/register") || 
                           config.url.includes("/auth/google");
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const refreshTokenFn = async () => {
  const refresh = getActiveRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const response = await axios.post(`${baseURL}/auth/refresh/`, { refresh });
  return response.data;
};

// Response interceptor – handle 401 → refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url.includes("/auth/login") || 
                           originalRequest.url.includes("/auth/register") || 
                           originalRequest.url.includes("/auth/google");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const data = await refreshTokenFn();
        const accessToken = data.data?.accessToken || data.accessToken || data.access;
        const tokenKey = getActiveTokenKey();
        localStorage.setItem(tokenKey, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // refresh failed → clear only the relevant tokens
        const isAdmin = window.location.pathname.startsWith("/admin");
        const prefix = isAdmin ? "admin" : "client";
        localStorage.removeItem(`${prefix}_accessToken`);
        localStorage.removeItem(`${prefix}_refreshToken`);
        localStorage.removeItem(`${prefix}_user`);

        // Redirect to the appropriate login page
        const publicPaths = ["/", "/login", "/signup"];
        if (isAdmin) {
          window.location.href = "/admin/login";
        } else if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
