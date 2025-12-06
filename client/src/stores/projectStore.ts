import { create } from 'zustand';
import { Project, SiteLog } from '../types';
import { projectsAPI, siteLogsAPI } from '../services/api';
import { normalizeProject } from '../utils/normalize';
import { showSuccess, showError } from '../utils/notifications';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  siteLogs: SiteLog[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchSiteLogs: (projectId?: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'stages' | 'documents'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectProgress: (id: string, progress: number) => Promise<void>;
  addSiteLog: (log: Omit<SiteLog, 'id' | 'createdAt'>) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  siteLogs: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await projectsAPI.getAll();
      const projects = Array.isArray(data) ? data.map(normalizeProject) : [];
      set({ projects, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch projects', isLoading: false });
      console.error('Error fetching projects:', error);
    }
  },

  fetchSiteLogs: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const logs = await siteLogsAPI.getAll(projectId);
      set({ siteLogs: logs, isLoading: false });
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
      const newLog = await siteLogsAPI.create(logData);
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

  setSelectedProject: (project) => set({ selectedProject: project }),
}));

