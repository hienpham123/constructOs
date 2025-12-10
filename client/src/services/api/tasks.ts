import api from './instance';
import type { ProjectTask } from '../../types';

export const tasksAPI = {
  getByProject: (projectId: string) =>
    api.get(`/projects/${projectId}/tasks`).then((res) => res.data as ProjectTask[]),

  create: (projectId: string, data: Partial<ProjectTask> & { title: string; assignedTo: string; parentTaskId?: string | null }) =>
    api.post(`/projects/${projectId}/tasks`, data).then((res) => res.data as ProjectTask),

  update: (taskId: string, data: Partial<ProjectTask>) =>
    api.put(`/tasks/${taskId}`, data).then((res) => res.data as ProjectTask),

  updateStatus: (taskId: string, status: ProjectTask['status'], note?: string) =>
    api.post(`/tasks/${taskId}/status`, { status, note }).then((res) => res.data as ProjectTask),

  delete: (taskId: string) =>
    api.delete(`/tasks/${taskId}`),
};


