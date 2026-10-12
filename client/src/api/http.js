import axios from "axios";

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong.";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

http.interceptors.request.use((config) => {
  const persisted = localStorage.getItem("exam-seating-auth");

  if (persisted) {
    try {
      const parsed = JSON.parse(persisted);
      const token = parsed?.state?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_error) {
      localStorage.removeItem("exam-seating-auth");
    }
  }

  return config;
});

export default http;
