import axios from 'axios';

const base = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = base
  ? (base.endsWith('/api') ? base : `${base}/api`)
  : '/api';
const isBrowser = typeof window !== 'undefined';

const getToken = () => {
  if (!isBrowser) return null;
  return localStorage.getItem('token');
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    const requestUrl = error.config?.url || '';
    const isAuthProblem = status === 401 && (
      requestUrl.includes('/auth/') ||
      /not authorized|invalid token|jwt|token|no user found|account has been deactivated/i.test(message)
    );

    if (isAuthProblem && isBrowser) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export default api;