import axios from 'axios';

// Extend axios config to include showLoading option
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    showLoading?: boolean;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2222/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track active requests for loading state
let activeRequests = 0;

// Request interceptor to add auth token and show loading
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Show loading for API calls (except if explicitly disabled)
    if (config.showLoading !== false) {
      activeRequests++;
      // Dynamically import to avoid circular dependency
      import('../../stores/loadingStore').then(({ useLoadingStore }) => {
        useLoadingStore.getState().setLoading(true);
      });
    }
    
    return config;
  },
  (error) => {
    // Decrease active requests on error
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
      import('../../stores/loadingStore').then(({ useLoadingStore }) => {
        useLoadingStore.getState().setLoading(false);
      });
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and hide loading
api.interceptors.response.use(
  (response) => {
    // Hide loading when request completes
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
      import('../../stores/loadingStore').then(({ useLoadingStore }) => {
        useLoadingStore.getState().setLoading(false);
      });
    }
    return response;
  },
  (error) => {
    // Hide loading on error
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
      import('../../stores/loadingStore').then(({ useLoadingStore }) => {
        useLoadingStore.getState().setLoading(false);
      });
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    
    // Extract error message
    const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Đã xảy ra lỗi';
    
    // Import notification helper dynamically to avoid circular dependency
    import('../../utils/notifications').then(({ showError }) => {
      showError(errorMessage);
    });
    
    return Promise.reject(error);
  }
);

export default api;

