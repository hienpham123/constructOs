import api from './instance';

// Projects API
export const projectsAPI = {
  getAll: (pageSize?: number, pageIndex?: number) => {
    const params: any = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    return api.get('/projects', { params }).then((res) => res.data);
  },
  getById: (id: string) => api.get(`/projects/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/projects', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

