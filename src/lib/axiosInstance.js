import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // Let axios pick the default adapter (xhr in browser, http in node).
  // The explicit `fetch` adapter in earlier versions silently returned
  // responses as strings in some browsers, leaving `res.data` as raw
  // JSON text and making admin tables look empty even though the
  // network panel showed 200 OK.
  headers: {
    Accept: "application/json",
  },
});

// Attach JWT token (from either "token" or legacy "adminToken") to every
// request. Admin pages historically stored the token under "adminToken"
// so we read both to stay backward compatible.
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Defensive response normalizer: if the body ever comes back as a JSON
// string (older fetch adapters, proxy misconfig, etc.) parse it so the
// callers that rely on `res.data.someField` don't silently get `undefined`.
axiosInstance.interceptors.response.use(
  (res) => {
    if (typeof res.data === "string") {
      try {
        res.data = JSON.parse(res.data);
      } catch {
        /* leave as-is */
      }
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect to login if we're inside the admin area; on the
      // public site a 401 just means the user isn't logged in.
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
