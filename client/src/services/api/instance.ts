import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2222/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    
    // Don't show error notification for 404 on daily-reports endpoint
    // (404 is expected when a report doesn't exist yet)
    const isDailyReport404 = error.response?.status === 404 && 
                             error.config?.url?.includes('/daily-reports/') &&
                             error.config?.method === 'get';
    
    // Don't show error notification for message sending endpoints
    // (errors are handled in the component by showing status in message)
    const isMessageSendError = error.config?.method === 'post' && (
      error.config?.url?.includes('/group-chats/') && error.config?.url?.includes('/messages') ||
      error.config?.url?.includes('/direct-messages/users/') && error.config?.url?.includes('/messages')
    );
    
    if (!isDailyReport404 && !isMessageSendError) {
      // Extract error message
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Đã xảy ra lỗi';
      
      // Import notification helper dynamically to avoid circular dependency
      import('../../utils/notifications').then(({ showError }) => {
        showError(errorMessage);
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

