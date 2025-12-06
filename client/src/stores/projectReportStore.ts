import { create } from 'zustand';
import { projectReportsAPI } from '../services/api';

interface ProjectReport {
  id: string;
  project_id: string;
  project_name: string;
  project_code?: string;
  project_status: string;
  project_progress: number;
  report_date: string;
  content: string;
  comment?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_size?: number;
    file_type?: string;
  }>;
}

interface ProjectReportState {
  reports: ProjectReport[];
  reportsTotal: number;
  isLoading: boolean;
  error: string | null;
  fetchReports: (
    pageSize?: number,
    pageIndex?: number,
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    projectId?: string
  ) => Promise<void>;
  getReportById: (id: string) => Promise<ProjectReport | null>;
  createReport: (data: FormData) => Promise<void>;
  updateReport: (id: string, data: FormData) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
}

export const useProjectReportStore = create<ProjectReportState>((set) => ({
  reports: [],
  reportsTotal: 0,
  isLoading: false,
  error: null,

  fetchReports: async (pageSize = 10, pageIndex = 0, search, sortBy, sortOrder, projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectReportsAPI.getReports({
        pageSize,
        pageIndex,
        search,
        sortBy,
        sortOrder,
        projectId,
      });
      set({
        reports: response.data || [],
        reportsTotal: response.total || 0,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error fetching project reports:', error);
      set({
        error: error.message || 'Không thể lấy danh sách báo cáo dự án',
        isLoading: false,
      });
    }
  },

  getReportById: async (id: string) => {
    try {
      const report = await projectReportsAPI.getReportById(id);
      return report;
    } catch (error: any) {
      console.error('Error fetching project report:', error);
      return null;
    }
  },

  createReport: async (data: FormData) => {
    try {
      await projectReportsAPI.createReport(data);
    } catch (error: any) {
      console.error('Error creating project report:', error);
      throw error;
    }
  },

  updateReport: async (id: string, data: FormData) => {
    try {
      await projectReportsAPI.updateReport(id, data);
    } catch (error: any) {
      console.error('Error updating project report:', error);
      throw error;
    }
  },

  deleteReport: async (id: string) => {
    try {
      await projectReportsAPI.deleteReport(id);
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== id),
        reportsTotal: state.reportsTotal - 1,
      }));
    } catch (error: any) {
      console.error('Error deleting project report:', error);
      throw error;
    }
  },
}));

