import axios from "axios";

// Cleanly grab the environment variable or fallback to local
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: baseURL,
});

// Request Interceptor: Attach the bearer token to outgoing requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global handler for auth drops and structural breaks
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the authentication token is expired or invalid, wipe state and force reload login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    if (!error.response) {
      console.error("Network error encountered:", error);
    }

    return Promise.reject(error);
  }
);

// ONLY ONE EXPORT AT THE VERY BOTTOM
export default api;