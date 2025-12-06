import api from './instance';

// Equipment API
export const equipmentAPI = {
  getAll: (pageSize?: number, pageIndex?: number) => {
    const params: any = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    return api.get('/equipment', { params }).then((res) => res.data);
  },
  getById: (id: string) => api.get(`/equipment/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/equipment', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/equipment/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/equipment/${id}`),
      getUsage: (equipmentId?: string, pageSize?: number, pageIndex?: number) => {
        const params: any = {};
        if (equipmentId) params.equipmentId = equipmentId;
        if (pageSize !== undefined) params.pageSize = pageSize;
        if (pageIndex !== undefined) params.pageIndex = pageIndex;
        return api.get('/equipment/usage/list', { params }).then((res) => res.data);
      },
      getUsageById: (id: string) => api.get(`/equipment/usage/${id}`).then((res) => res.data),
      createUsage: (data: any) => api.post('/equipment/usage', data).then((res) => res.data),
      updateUsage: (id: string, data: any) => api.put(`/equipment/usage/${id}`, data).then((res) => res.data),
      deleteUsage: (id: string) => api.delete(`/equipment/usage/${id}`),
      getMaintenanceSchedules: (equipmentId?: string, pageSize?: number, pageIndex?: number) => {
        const params: any = {};
        if (equipmentId) params.equipmentId = equipmentId;
        if (pageSize !== undefined) params.pageSize = pageSize;
        if (pageIndex !== undefined) params.pageIndex = pageIndex;
        return api.get('/equipment/maintenance/list', { params }).then((res) => res.data);
      },
      getMaintenanceScheduleById: (id: string) => api.get(`/equipment/maintenance/${id}`).then((res) => res.data),
      createMaintenanceSchedule: (data: any) => api.post('/equipment/maintenance', data).then((res) => res.data),
      updateMaintenanceSchedule: (id: string, data: any) =>
        api.put(`/equipment/maintenance/${id}`, data).then((res) => res.data),
      deleteMaintenanceSchedule: (id: string) => api.delete(`/equipment/maintenance/${id}`),
};

