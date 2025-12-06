import api from './instance';

export interface RolePermission {
  view_drawing: boolean;
  view_contract: boolean;
  view_report: boolean;
  view_daily_report: boolean;
  view_project_report: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: RolePermission;
  created_at?: string;
  updated_at?: string;
}

// Roles API
export const rolesAPI = {
  getAll: (params?: { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    const queryString = queryParams.toString();
    return api.get(`/roles${queryString ? `?${queryString}` : ''}`).then((res) => res.data);
  },
  getById: (id: string) => api.get(`/roles/${id}`).then((res) => res.data),
  create: (data: Partial<Role>) => api.post('/roles', data).then((res) => res.data),
  update: (id: string, data: Partial<Role>) => api.put(`/roles/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/roles/${id}`),
  getMyPermissions: () => api.get('/roles/my-permissions').then((res) => res.data),
};

