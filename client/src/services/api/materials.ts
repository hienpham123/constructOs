import api from './instance';

// Materials API
export const materialsAPI = {
  getAll: (pageSize?: number, pageIndex?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    const params: any = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    return api.get('/materials', { params }).then((res) => res.data);
  },
  getById: (id: string) => api.get(`/materials/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/materials', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/materials/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/materials/${id}`),
  getTransactions: (pageSize?: number, pageIndex?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    const params: any = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    return api.get('/materials/transactions/list', { params }).then((res) => res.data);
  },
  getTransactionById: (id: string) => api.get(`/materials/transactions/${id}`).then((res) => res.data),
  createTransaction: (data: any) => api.post('/materials/transactions', data).then((res) => res.data),
  updateTransaction: (id: string, data: any) => api.put(`/materials/transactions/${id}`, data).then((res) => res.data),
  deleteTransaction: (id: string) => api.delete(`/materials/transactions/${id}`),
  getPurchaseRequests: (pageSize?: number, pageIndex?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    const params: any = {};
    if (pageSize !== undefined) params.pageSize = pageSize;
    if (pageIndex !== undefined) params.pageIndex = pageIndex;
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    return api.get('/materials/purchase-requests/list', { params }).then((res) => res.data);
  },
  getPurchaseRequestById: (id: string) => api.get(`/materials/purchase-requests/${id}`).then((res) => res.data),
  createPurchaseRequest: (data: any) => api.post('/materials/purchase-requests', data).then((res) => res.data),
  updatePurchaseRequest: (id: string, data: any) =>
    api.put(`/materials/purchase-requests/${id}`, data).then((res) => res.data),
  deletePurchaseRequest: (id: string) => api.delete(`/materials/purchase-requests/${id}`),
  uploadTransactionFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/materials/transactions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data);
  },
  deleteTransactionFile: (filename: string) => {
    // Extract filename from URL if needed
    let actualFilename = filename;
    if (filename.includes('/')) {
      const parts = filename.split('/');
      actualFilename = parts[parts.length - 1];
    }
    return api.delete(`/materials/transactions/files/${actualFilename}`).then((res) => res.data);
  },
};

