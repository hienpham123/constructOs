import api from './instance';

// Project Reports API
export const projectReportsAPI = {
  getReports: (params?: {
    projectId?: string;
    pageSize?: number;
    pageIndex?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.projectId) queryParams.append('projectId', params.projectId);
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.pageIndex) queryParams.append('pageIndex', params.pageIndex.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    return api.get(`/project-reports?${queryParams.toString()}`).then((res) => res.data);
  },
  
  getReportById: (id: string) =>
    api.get(`/project-reports/${id}`).then((res) => res.data),
  
  createReport: (data: FormData) =>
    api.post('/project-reports', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data),
  
  updateReport: (id: string, data: FormData) =>
    api.put(`/project-reports/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data),
  
  deleteReport: (id: string) =>
    api.delete(`/project-reports/${id}`).then((res) => res.data),
  
  deleteAttachment: (id: string) =>
    api.delete(`/project-reports/attachments/${id}`).then((res) => res.data),
};

