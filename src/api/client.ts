import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ??
  (location.hostname === "localhost"
    ? "http://localhost:4000"
    : location.origin);

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
