import api from './instance';

// Personnel API
export const personnelAPI = {
  getAll: (pageSize?: number, pageIndex?: number) => {
    const params: any = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    return api.get('/personnel', { params }).then((res) => res.data);
  },
  getById: (id: string) => api.get(`/personnel/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/personnel', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/personnel/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/personnel/${id}`),
};

