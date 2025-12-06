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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    
    // Extract error message
    const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Đã xảy ra lỗi';
    
    // Import notification helper dynamically to avoid circular dependency
    import('../utils/notifications').then(({ showError }) => {
      showError(errorMessage);
    });
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string, phone?: string, role?: string) => {
    const response = await api.post('/auth/register', { name, email, password, phone, role });
    if (response.data.token) {
      localStorage.setItem('auth-token', response.data.token);
    }
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth-token', response.data.token);
    }
    return response.data;
  },
  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email }).then((res) => res.data);
  },
  resetPassword: async (token: string, newPassword: string) => {
    return api.post('/auth/reset-password', { token, newPassword }).then((res) => res.data);
  },
  verifyToken: async (token: string) => {
    return api.post('/auth/verify-token', { token }).then((res) => res.data);
  },
  logout: () => {
    localStorage.removeItem('auth-token');
  },
};

// Users API
export const usersAPI = {
  getCurrent: () => api.get('/users/me').then((res) => res.data),
  getAll: () => api.get('/users').then((res) => res.data),
  getById: (id: string) => api.get(`/users/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/users', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/users/${id}`),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    // Don't set Content-Type - let browser set it with boundary
    return api.post('/users/me/avatar', formData).then((res) => res.data);
  },
};

// Materials API
export const materialsAPI = {
  getAll: () => api.get('/materials').then((res) => res.data),
  getById: (id: string) => api.get(`/materials/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/materials', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/materials/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/materials/${id}`),
  getTransactions: () => api.get('/materials/transactions/list').then((res) => res.data),
  createTransaction: (data: any) => api.post('/materials/transactions', data).then((res) => res.data),
  getPurchaseRequests: () => api.get('/materials/purchase-requests/list').then((res) => res.data),
  createPurchaseRequest: (data: any) => api.post('/materials/purchase-requests', data).then((res) => res.data),
  updatePurchaseRequest: (id: string, data: any) =>
    api.put(`/materials/purchase-requests/${id}`, data).then((res) => res.data),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects').then((res) => res.data),
  getById: (id: string) => api.get(`/projects/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/projects', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Personnel API
export const personnelAPI = {
  getAll: () => api.get('/personnel').then((res) => res.data),
  getById: (id: string) => api.get(`/personnel/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/personnel', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/personnel/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/personnel/${id}`),
};

// Equipment API
export const equipmentAPI = {
  getAll: () => api.get('/equipment').then((res) => res.data),
  getById: (id: string) => api.get(`/equipment/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/equipment', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/equipment/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/equipment/${id}`),
  getUsage: (equipmentId?: string) => {
    const params = equipmentId ? { equipmentId } : {};
    return api.get('/equipment/usage/list', { params }).then((res) => res.data);
  },
  createUsage: (data: any) => api.post('/equipment/usage', data).then((res) => res.data),
  getMaintenanceSchedules: (equipmentId?: string) => {
    const params = equipmentId ? { equipmentId } : {};
    return api.get('/equipment/maintenance/list', { params }).then((res) => res.data);
  },
  createMaintenanceSchedule: (data: any) => api.post('/equipment/maintenance', data).then((res) => res.data),
  updateMaintenanceSchedule: (id: string, data: any) =>
    api.put(`/equipment/maintenance/${id}`, data).then((res) => res.data),
};

// Contracts API
export const contractsAPI = {
  getAll: () => api.get('/contracts').then((res) => res.data),
  getById: (id: string) => api.get(`/contracts/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/contracts', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/contracts/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/contracts/${id}`),
};

// Site Logs API
export const siteLogsAPI = {
  getAll: (projectId?: string) => {
    const params = projectId ? { projectId } : {};
    return api.get('/site-logs', { params }).then((res) => res.data);
  },
  getById: (id: string) => api.get(`/site-logs/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/site-logs', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/site-logs/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/site-logs/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats').then((res) => res.data),
  getMonthlyStats: (year?: number, month?: number) => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return api.get('/dashboard/monthly', { params }).then((res) => res.data);
  },
};

export default api;

