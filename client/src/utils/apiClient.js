import axios from "axios";


export const apiClient = axios.create({
  baseURL: "/",
  withCredentials: true,
});

// Attach JWT token from localStorage to every request if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
