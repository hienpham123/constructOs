import api from './instance';

// Daily Reports API
export const dailyReportsAPI = {
  getReports: (params?: {
    date?: string;
    pageSize?: number;
    pageIndex?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.pageIndex) queryParams.append('pageIndex', params.pageIndex.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    return api.get(`/daily-reports?${queryParams.toString()}`).then((res) => res.data);
  },
  
  getReportByUserAndDate: (userId: string, date: string) =>
    api.get(`/daily-reports/${userId}/${date}`).then((res) => res.data),
  
  createOrUpdateReport: (userId: string, date: string, data: { content: string; suggestion?: string; status?: string }) =>
    api.post(`/daily-reports/${userId}/${date}`, data).then((res) => res.data),
  
  deleteReport: (id: string) =>
    api.delete(`/daily-reports/${id}`).then((res) => res.data),
};

