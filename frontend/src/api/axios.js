// src/api/axios.js
// Real axios client for production / dev when backend is available

import axios from "axios";

const raw = import.meta.env.VITE_API_URL || "";
const baseURL = raw
  ? raw.replace(/\/api\/?$/, "") + "/api"
  : "/api";

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
