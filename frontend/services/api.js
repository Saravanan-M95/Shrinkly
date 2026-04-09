import axios from 'axios';
import { Platform } from 'react-native';
import { API_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => authToken;

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid
      setAuthToken(null);
    }

    return Promise.reject({ message, status, errors: error.response?.data?.errors });
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.patch('/api/auth/me', data),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, password) => api.post('/api/auth/reset-password', { email, otp, password }),
};

// URL API
export const urlAPI = {
  create: (data) => api.post('/api/urls', data),
  getAll: (params) => api.get('/api/urls', { params }),
  getById: (id) => api.get(`/api/urls/${id}`),
  update: (id, data) => api.patch(`/api/urls/${id}`, data),
  delete: (id) => api.delete(`/api/urls/${id}`),
  getAnalytics: (id, params) => api.get(`/api/urls/${id}/analytics`, { params }),
  getStats: () => api.get('/api/urls/stats'),
};

// Redirect API (for interstitial)
export const redirectAPI = {
  getRedirectInfo: (code) => api.get(`/${code}`, {
    headers: { Accept: 'application/json' },
  }),
};

export default api;
