import { create } from 'zustand';
import { Equipment, EquipmentUsage, MaintenanceSchedule } from '../types';
import { equipmentAPI } from '../services/api';
import { normalizeEquipment } from '../utils/normalize';
import { showSuccess } from '../utils/notifications';

interface EquipmentState {
  equipment: Equipment[];
  usage: EquipmentUsage[];
  maintenanceSchedules: MaintenanceSchedule[];
  selectedEquipment: Equipment | null;
  isLoading: boolean;
  error: string | null;
  fetchEquipment: () => Promise<void>;
  fetchUsage: (equipmentId?: string) => Promise<void>;
  fetchMaintenanceSchedules: (equipmentId?: string) => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt'>) => Promise<void>;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addUsage: (usage: Omit<EquipmentUsage, 'id'>) => Promise<void>;
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id'>) => Promise<void>;
  updateMaintenanceSchedule: (id: string, schedule: Partial<MaintenanceSchedule>) => Promise<void>;
  setSelectedEquipment: (equipment: Equipment | null) => void;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: [],
  usage: [],
  maintenanceSchedules: [],
  selectedEquipment: null,
  isLoading: false,
  error: null,

  fetchEquipment: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await equipmentAPI.getAll();
      const equipment = Array.isArray(data) ? data.map(normalizeEquipment) : [];
      set({ equipment, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch equipment', isLoading: false });
      console.error('Error fetching equipment:', error);
    }
  },

  fetchUsage: async (equipmentId) => {
    set({ isLoading: true, error: null });
    try {
      const usage = await equipmentAPI.getUsage(equipmentId);
      set({ usage, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch usage', isLoading: false });
      console.error('Error fetching usage:', error);
    }
  },

  fetchMaintenanceSchedules: async (equipmentId) => {
    set({ isLoading: true, error: null });
    try {
      const schedules = await equipmentAPI.getMaintenanceSchedules(equipmentId);
      set({ maintenanceSchedules: schedules, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch maintenance schedules', isLoading: false });
      console.error('Error fetching maintenance schedules:', error);
    }
  },

  addEquipment: async (equipmentData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await equipmentAPI.create(equipmentData);
      const newEquipment = normalizeEquipment(data);
      set((state) => ({
        equipment: [...state.equipment, newEquipment],
        isLoading: false,
      }));
      showSuccess('Thêm thiết bị thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể thêm thiết bị', isLoading: false });
      throw error;
    }
  },

  updateEquipment: async (id, equipmentData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await equipmentAPI.update(id, equipmentData);
      const updatedEquipment = normalizeEquipment(data);
      set((state) => ({
        equipment: state.equipment.map((eq) =>
          eq.id === id ? updatedEquipment : eq
        ),
        isLoading: false,
      }));
      showSuccess('Cập nhật thiết bị thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật thiết bị', isLoading: false });
      throw error;
    }
  },

  deleteEquipment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await equipmentAPI.delete(id);
      set((state) => ({
        equipment: state.equipment.filter((eq) => eq.id !== id),
        isLoading: false,
      }));
      showSuccess('Xóa thiết bị thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa thiết bị', isLoading: false });
      throw error;
    }
  },

  addUsage: async (usageData) => {
    set({ isLoading: true, error: null });
    try {
      const newUsage = await equipmentAPI.createUsage(usageData);
      set((state) => ({
        usage: [newUsage, ...state.usage],
        isLoading: false,
      }));
      // Refresh equipment to get updated status
      const data = await equipmentAPI.getAll();
      const equipment = Array.isArray(data) ? data.map(normalizeEquipment) : [];
      set({ equipment });
      showSuccess('Thêm bản ghi sử dụng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể thêm bản ghi sử dụng', isLoading: false });
      throw error;
    }
  },

  addMaintenanceSchedule: async (scheduleData) => {
    set({ isLoading: true, error: null });
    try {
      const newSchedule = await equipmentAPI.createMaintenanceSchedule(scheduleData);
      set((state) => ({
        maintenanceSchedules: [newSchedule, ...state.maintenanceSchedules],
        isLoading: false,
      }));
      showSuccess('Thêm lịch bảo trì thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể thêm lịch bảo trì', isLoading: false });
      throw error;
    }
  },

  updateMaintenanceSchedule: async (id, scheduleData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSchedule = await equipmentAPI.updateMaintenanceSchedule(id, scheduleData);
      set((state) => ({
        maintenanceSchedules: state.maintenanceSchedules.map((schedule) =>
          schedule.id === id ? updatedSchedule : schedule
        ),
        isLoading: false,
      }));
      showSuccess('Cập nhật lịch bảo trì thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật lịch bảo trì', isLoading: false });
      throw error;
    }
  },

  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
}));

