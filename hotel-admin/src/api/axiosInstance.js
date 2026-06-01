import axios from 'axios';
import { getCookie, deleteCookie } from './cookieHelper';


// Pull API base URL from Vite environment variables (fallback to local server)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into Authorization header if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error management and clear cookies if unauthenticated
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // If server responds with 401 Unauthorized, automatically log out user
    if (error.response && error.response.status === 401) {
      deleteCookie('adminToken');
      deleteCookie('adminUserEmail');
      // Redirect to login page if window is defined
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
