import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''; // Use Vite's environment variable

if (!apiBaseUrl) {
  console.warn('VITE_API_BASE_URL is not defined. Falling back to same-origin relative API paths.');
}

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: apiBaseUrl || undefined, // Use same-origin base path if not configured
  headers: {
    'Content-Type': 'application/json', // Default headers
  },
});

// Add a request interceptor (optional, e.g., for adding auth tokens)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken'); // Get token from sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to headers
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;