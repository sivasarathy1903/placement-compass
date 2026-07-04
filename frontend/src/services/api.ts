import axios from 'axios';
import type { TokenRefreshResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject access token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Intercept 401 Unauthorized and attempt to refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error response is 401 Unauthorized and we haven't already retried this request
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/login' &&
      originalRequest.url !== '/api/auth/register'
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Request a new access token from the backend
          const response = await axios.post<TokenRefreshResponse>(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Save new tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update header and retry the original request
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or revoked -> Force logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, force logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
