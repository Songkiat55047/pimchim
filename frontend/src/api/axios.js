// src/api/axios.js
import axios from "axios";
import useAuthStore from "../stores/authStore";

const raw = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const BASE_URL = raw.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export default api;
