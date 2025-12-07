import api from './instance';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Users API
export const usersAPI = {
  getCurrent: () => api.get('/users/me').then((res) => res.data),
  getAll: (pageSize?: number, pageIndex?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    const params: any = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    return api.get('/users', { params }).then((res) => res.data);
  },
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users', { params: { pageSize: 1000 } });
    return response.data.data || response.data || [];
  },
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

