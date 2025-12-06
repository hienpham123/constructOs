import { create } from 'zustand';
import { Project, SiteLog } from '../types';
import { projectsAPI, siteLogsAPI } from '../services/api';
import { normalizeProject, normalizeSiteLog } from '../utils/normalize';
import { showSuccess, showError } from '../utils/notifications';

interface ProjectState {
  projects: Project[];
  projectsTotal: number;
  selectedProject: Project | null;
  siteLogs: SiteLog[];
  siteLogsTotal: number;
  isLoading: boolean;
  error: string | null;
  fetchProjects: (pageSize?: number, pageIndex?: number) => Promise<void>;
  fetchSiteLogs: (projectId?: string, pageSize?: number, pageIndex?: number) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'stages' | 'documents'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectProgress: (id: string, progress: number) => Promise<void>;
  addSiteLog: (log: Omit<SiteLog, 'id' | 'createdAt'>) => Promise<void>;
  updateSiteLog: (id: string, log: Partial<SiteLog>) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  projectsTotal: 0,
  selectedProject: null,
  siteLogs: [],
  siteLogsTotal: 0,
  isLoading: false,
  error: null,

  fetchProjects: async (pageSize = 10, pageIndex = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.getAll(pageSize, pageIndex);
      // Handle both old format (array) and new format (object with data, total)
      const projects = Array.isArray(response) 
        ? response.map(normalizeProject) 
        : (response.data || []).map(normalizeProject);
      const total = Array.isArray(response) ? projects.length : (response.total || 0);
      set({ projects, projectsTotal: total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch projects', isLoading: false });
      console.error('Error fetching projects:', error);
    }
  },

      fetchSiteLogs: async (projectId, pageSize = 10, pageIndex = 0) => {
        set({ isLoading: true, error: null });
        try {
          const response = await siteLogsAPI.getAll(projectId, pageSize, pageIndex);
          // Handle both old format (array) and new format (object with data, total)
          const logs = Array.isArray(response) 
            ? response.map(normalizeSiteLog) 
            : (response.data || []).map(normalizeSiteLog);
          const total = Array.isArray(response) ? logs.length : (response.total || 0);
          set({ siteLogs: logs, siteLogsTotal: total, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch site logs', isLoading: false });
          console.error('Error fetching site logs:', error);
        }
      },

  addProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await projectsAPI.create(projectData);
      const newProject = normalizeProject(data);
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
      showSuccess('Thêm dự án thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể thêm dự án', isLoading: false });
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await projectsAPI.update(id, projectData);
      const updatedProject = normalizeProject(data);
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? updatedProject : project
        ),
        isLoading: false,
      }));
      showSuccess('Cập nhật dự án thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật dự án', isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await projectsAPI.delete(id);
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        isLoading: false,
      }));
      showSuccess('Xóa dự án thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa dự án', isLoading: false });
      throw error;
    }
  },

  updateProjectProgress: async (id, progress) => {
    set({ isLoading: true, error: null });
    try {
      const projectData = await projectsAPI.getById(id);
      const project = normalizeProject(projectData);
      const data = await projectsAPI.update(id, { ...project, progress });
      const updatedProject = normalizeProject(data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update progress', isLoading: false });
      throw error;
    }
  },

      addSiteLog: async (logData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await siteLogsAPI.create(logData);
          const newLog = normalizeSiteLog(data);
          set((state) => ({
            siteLogs: [newLog, ...state.siteLogs],
            isLoading: false,
          }));
          showSuccess('Thêm nhật ký công trường thành công');
        } catch (error: any) {
          set({ error: error.message || 'Không thể thêm nhật ký công trường', isLoading: false });
          throw error;
        }
      },

      updateSiteLog: async (id, logData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await siteLogsAPI.update(id, logData);
          const updatedLog = normalizeSiteLog(data);
          set((state) => ({
            siteLogs: state.siteLogs.map((log) => (log.id === id ? updatedLog : log)),
            isLoading: false,
          }));
          showSuccess('Cập nhật nhật ký công trường thành công');
        } catch (error: any) {
          set({ error: error.message || 'Không thể cập nhật nhật ký công trường', isLoading: false });
          throw error;
        }
      },

  setSelectedProject: (project) => set({ selectedProject: project }),
}));

