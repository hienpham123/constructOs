import api from './instance';

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

