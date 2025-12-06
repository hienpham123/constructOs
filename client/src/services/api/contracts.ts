import api from './instance';

// Contracts API
export const contractsAPI = {
  getAll: (pageSize?: number, pageIndex?: number) => {
    const params: any = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    return api.get('/contracts', { params }).then((res) => res.data);
  },
  getById: (id: string) => api.get(`/contracts/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/contracts', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/contracts/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/contracts/${id}`),
};

