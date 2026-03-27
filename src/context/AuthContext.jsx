import { createContext, useState, useEffect, useContext } from "react";
import { login, googleLogin, logout as apiLogout } from "../api/authApi";
import { extractErrorMessage } from "../utils/errorHandler";
import { getCustomerById } from "../api/customer.api";
import { getUserById } from "../api/user.api";

const AuthContext = createContext();

// localStorage key helpers
const KEYS = {
  admin: {
    accessToken: "admin_accessToken",
    refreshToken: "admin_refreshToken",
    user: "admin_user",
  },
  client: {
    accessToken: "client_accessToken",
    refreshToken: "client_refreshToken",
    user: "client_user",
  },
};

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
}

function loadUser(type) {
  const keys = KEYS[type];
  const token = localStorage.getItem(keys.accessToken);
  const stored = localStorage.getItem(keys.user);
  if (!token) return null;
  if (stored) {
    try {
      return { ...JSON.parse(stored), isAuthenticated: true };
    } catch {
      return { isAuthenticated: true };
    }
  }
  return { isAuthenticated: true };
}

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [clientUser, setClientUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAdminUser(loadUser("admin"));
    setClientUser(loadUser("client"));
    setLoading(false);
  }, []);

  // Determine which user is "active" based on current path (convenience)
  const user = adminUser || clientUser;
  const isAuthenticated = !!user;

  const signIn = async (email, password, loginType = "client") => {
    try {
      const data = await login({ email, password });
      const keys = KEYS[loginType];

      const accessToken =
        data.data?.tokens?.access_token ||
        data.tokens?.access_token ||
        data.data?.access_token ||
        data.accessToken ||
        data.data?.accessToken ||
        data.data?.access ||
        data.access ||
        data.access_token ||
        data.token?.access ||
        data.tokens?.access ||
        data.data?.token?.access;

      const refreshToken =
        data.data?.tokens?.refresh_token ||
        data.tokens?.refresh_token ||
        data.data?.refresh_token ||
        data.refreshToken ||
        data.data?.refreshToken ||
        data.data?.refresh ||
        data.refresh ||
        data.refresh_token ||
        data.token?.refresh ||
        data.tokens?.refresh ||
        data.data?.token?.refresh;

      const payload = parseJwt(accessToken);
      let userObj = { ...payload, isAuthenticated: true };
      const userId = payload.user_id || payload.id;

      localStorage.setItem(keys.accessToken, accessToken);
      if (refreshToken) localStorage.setItem(keys.refreshToken, refreshToken);

      try {
        const backendProfile =
          data.data?.customer ||
          data.customer ||
          data.data?.user ||
          data.user;

        if (backendProfile) {
          userObj = { ...userObj, ...backendProfile };
        } else if (userId) {
          if (loginType === "admin") {
            const userRes = await getUserById(userId).catch((err) => {
              console.error("Admin profile fetch failed:", err);
              return null;
            });
            const userProfile =
              userRes && typeof userRes === "object"
                ? Array.isArray(userRes.data)
                  ? userRes.data[0]
                  : userRes.data || userRes
                : userRes;
            userObj = { ...userObj, ...(userProfile || {}), role: "admin" };
          } else {
            const custRes = await getCustomerById(userId).catch((err) => {
              console.error("Customer profile fetch failed:", err);
              return null;
            });
            const custData = custRes?.data || custRes;
            const custProfile = Array.isArray(custData)
              ? custData[0]
              : custData;
            if (custProfile) {
              userObj = { ...userObj, ...custProfile };
            }
          }
        }
        userObj.role =
          userObj.role || (loginType === "admin" ? "admin" : "customer");
      } catch (e) {
        console.error("Failed to fetch extended profile on login:", e);
      }

      localStorage.setItem(keys.user, JSON.stringify(userObj));

      if (loginType === "admin") {
        setAdminUser(userObj);
      } else {
        setClientUser(userObj);
      }

      return { success: true, user: userObj };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err),
      };
    }
  };

  const signInWithGoogle = async (idToken, loginType = "client") => {
    try {
      const roleId = loginType === "admin" ? 1 : 2;
      const data = await googleLogin(idToken, roleId);
      const keys = KEYS[loginType];

      const accessToken =
        data.data?.tokens?.access_token ||
        data.tokens?.access_token ||
        data.data?.access_token ||
        data.accessToken ||
        data.data?.accessToken ||
        data.data?.access ||
        data.access ||
        data.access_token ||
        data.token?.access ||
        data.tokens?.access ||
        data.data?.token?.access ||
        (typeof data.data === "string" ? data.data : null) ||
        (typeof data === "string" ? data : null);

      const refreshToken =
        data.data?.tokens?.refresh_token ||
        data.tokens?.refresh_token ||
        data.data?.refresh_token ||
        data.refreshToken ||
        data.data?.refreshToken ||
        data.data?.refresh ||
        data.refresh ||
        data.refresh_token ||
        data.token?.refresh ||
        data.tokens?.refresh ||
        data.data?.token?.refresh;

      if (!accessToken) {
        console.error("No access token found. Full data:", JSON.stringify(data, null, 2));
        return { success: false, error: "Authentication failed: No access token returned." };
      }

      const payload = parseJwt(accessToken);
      let userObj = { ...payload, isAuthenticated: true };
      const userId = payload.user_id || payload.id;

      localStorage.setItem(keys.accessToken, accessToken);
      if (refreshToken) localStorage.setItem(keys.refreshToken, refreshToken);

      try {
        const backendProfile =
          data.data?.customer ||
          data.customer ||
          data.data?.user ||
          data.user;

        if (backendProfile) {
          userObj = { ...userObj, ...backendProfile };
        } else if (userId) {
          if (loginType === "admin") {
            const userRes = await getUserById(userId).catch((err) => {
              console.error("Admin profile fetch failed:", err);
              return null;
            });
            const userProfile =
              userRes && typeof userRes === "object"
                ? Array.isArray(userRes.data)
                  ? userRes.data[0]
                  : userRes.data || userRes
                : userRes;
            userObj = { ...userObj, ...(userProfile || {}), role: "admin" };
          } else {
            const custRes = await getCustomerById(userId).catch((err) => {
              console.warn("Customer profile fetch failed:", err);
              return null;
            });
            const custData = custRes?.data || custRes;
            const custProfile = Array.isArray(custData)
              ? custData[0]
              : custData;
            if (custProfile) {
              userObj = { ...userObj, ...custProfile };
            }
          }
        }
        userObj.role =
          userObj.role || (loginType === "admin" ? "admin" : "customer");
      } catch (e) {
        console.error("Critical error in profile population:", e);
      }

      localStorage.setItem(keys.user, JSON.stringify(userObj));

      if (loginType === "admin") {
        setAdminUser(userObj);
      } else {
        setClientUser(userObj);
      }

      return { success: true, user: userObj };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err),
      };
    }
  };

  const signOut = (loginType = "client") => {
    const keys = KEYS[loginType];
    apiLogout(loginType);
    if (loginType === "admin") {
      setAdminUser(null);
    } else {
      setClientUser(null);
    }
  };

  const value = {
    user,
    adminUser,
    clientUser,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
