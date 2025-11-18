// src/api/client.ts
import axios from "axios";

// In dev -> local backend
// In prod -> Render backend
const BASE_URL =
  import.meta.env.DEV
    ? "http://localhost:4000"
    : "https://survease-backend.onrender.com";

console.log("[API BASE_URL]", BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// optional: clear token on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(err);
  }
);
