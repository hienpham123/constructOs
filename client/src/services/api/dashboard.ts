import api from './instance';

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats').then((res) => res.data),
};

