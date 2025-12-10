import { create } from 'zustand';
import { ProjectTask } from '../types';
import { tasksAPI } from '../services/api';
import { showError, showSuccess } from '../utils/notifications';

interface TaskState {
  tasks: ProjectTask[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
  addTask: (projectId: string, payload: { title: string; description?: string; priority?: ProjectTask['priority']; dueDate?: string; assignedTo: string; parentTaskId?: string | null }) => Promise<void>;
  updateTask: (taskId: string, payload: Partial<ProjectTask>) => Promise<void>;
  updateStatus: (taskId: string, status: ProjectTask['status'], note?: string) => Promise<void>;
  deleteTask: (taskId: string, projectId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await tasksAPI.getByProject(projectId);
      set({ tasks, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      set({ error: error.message || 'Không thể tải công việc', isLoading: false });
      showError('Không thể tải công việc');
    }
  },

  addTask: async (projectId, payload) => {
    set({ isLoading: true, error: null });
    try {
      await tasksAPI.create(projectId, payload);
      await get().fetchTasks(projectId);
      set({ isLoading: false });
      showSuccess('Tạo công việc thành công');
    } catch (error: any) {
      console.error('Error creating task:', error);
      set({ error: error.message || 'Không thể tạo công việc', isLoading: false });
      showError(error.message || 'Không thể tạo công việc');
      throw error;
    }
  },

  updateTask: async (taskId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await tasksAPI.update(taskId, payload);
      // Update in-place for performance
      const updateNode = (items: ProjectTask[]): ProjectTask[] =>
        items.map((item) => {
          if (item.id === updated.id) return { ...item, ...updated };
          if (item.children) return { ...item, children: updateNode(item.children) };
          return item;
        });
      set((state) => ({ tasks: updateNode(state.tasks), isLoading: false }));
      showSuccess('Cập nhật công việc thành công');
    } catch (error: any) {
      console.error('Error updating task:', error);
      set({ error: error.message || 'Không thể cập nhật công việc', isLoading: false });
      showError(error.message || 'Không thể cập nhật công việc');
      throw error;
    }
  },

  updateStatus: async (taskId, status, note) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`📤 Frontend: Gửi request update status task ${taskId} → ${status}`);
      const response = await tasksAPI.updateStatus(taskId, status, note);
      console.log(`📥 Frontend: Nhận response từ server:`, response);
      // Refresh tasks from server to ensure consistency
      const currentTasks = get().tasks;
      if (currentTasks.length > 0) {
        // Get projectId from first task
        const projectId = currentTasks[0].projectId;
        await get().fetchTasks(projectId);
      }
      set({ isLoading: false });
      showSuccess('Cập nhật trạng thái thành công');
    } catch (error: any) {
      console.error('Error updating status:', error);
      set({ error: error.message || 'Không thể cập nhật trạng thái', isLoading: false });
      showError(error.message || 'Không thể cập nhật trạng thái');
      throw error;
    }
  },

  deleteTask: async (taskId, projectId) => {
    set({ isLoading: true, error: null });
    try {
      await tasksAPI.delete(taskId);
      await get().fetchTasks(projectId);
      set({ isLoading: false });
      showSuccess('Xóa công việc thành công');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      set({ error: error.message || 'Không thể xóa công việc', isLoading: false });
      showError(error.message || 'Không thể xóa công việc');
      throw error;
    }
  },
}));


