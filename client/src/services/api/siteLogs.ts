import api from './instance';

// Site Logs API
export const siteLogsAPI = {
  getAll: (projectId?: string, pageSize?: number, pageIndex?: number) => {
    const params: any = {};
    if (projectId) params.projectId = projectId;
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    return api.get('/site-logs', { params }).then((res) => res.data);
  },
  getById: (id: string) => api.get(`/site-logs/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/site-logs', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/site-logs/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/site-logs/${id}`),
};

