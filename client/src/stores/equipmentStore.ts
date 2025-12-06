import { create } from 'zustand';
import { Equipment, EquipmentUsage, MaintenanceSchedule } from '../types';
import { equipmentAPI } from '../services/api';
import { normalizeEquipment, normalizeUsage, normalizeMaintenanceSchedule } from '../utils/normalize';
import { showSuccess } from '../utils/notifications';

interface EquipmentState {
  equipment: Equipment[];
  equipmentTotal: number;
  usage: EquipmentUsage[];
  usageTotal: number;
  maintenanceSchedules: MaintenanceSchedule[];
  maintenanceSchedulesTotal: number;
  selectedEquipment: Equipment | null;
  isLoading: boolean;
  error: string | null;
  fetchEquipment: (pageSize?: number, pageIndex?: number) => Promise<void>;
  fetchUsage: (equipmentId?: string, pageSize?: number, pageIndex?: number) => Promise<void>;
  fetchMaintenanceSchedules: (equipmentId?: string, pageSize?: number, pageIndex?: number) => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt'>) => Promise<void>;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addUsage: (usage: Omit<EquipmentUsage, 'id'>) => Promise<void>;
  updateUsage: (id: string, usage: Partial<EquipmentUsage>) => Promise<void>;
  deleteUsage: (id: string) => Promise<void>;
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id'>) => Promise<void>;
  updateMaintenanceSchedule: (id: string, schedule: Partial<MaintenanceSchedule>) => Promise<void>;
  deleteMaintenanceSchedule: (id: string) => Promise<void>;
  setSelectedEquipment: (equipment: Equipment | null) => void;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: [],
  equipmentTotal: 0,
  usage: [],
  usageTotal: 0,
  maintenanceSchedules: [],
  maintenanceSchedulesTotal: 0,
  selectedEquipment: null,
  isLoading: false,
  error: null,

  fetchEquipment: async (pageSize = 10, pageIndex = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await equipmentAPI.getAll(pageSize, pageIndex);
      // Handle both old format (array) and new format (object with data, total)
      const equipment = Array.isArray(response) 
        ? response.map(normalizeEquipment) 
        : (response.data || []).map(normalizeEquipment);
      const total = Array.isArray(response) ? equipment.length : (response.total || 0);
      set({ equipment, equipmentTotal: total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch equipment', isLoading: false });
      console.error('Error fetching equipment:', error);
    }
  },

  fetchUsage: async (equipmentId, pageSize = 10, pageIndex = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await equipmentAPI.getUsage(equipmentId, pageSize, pageIndex);
      const usageData = Array.isArray(response) 
        ? response 
        : (response.data || []);
      const usage = usageData.map(normalizeUsage);
      const total = Array.isArray(response) ? usage.length : (response.total || 0);
      set({ usage, usageTotal: total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch usage', isLoading: false });
      console.error('Error fetching usage:', error);
    }
  },

  fetchMaintenanceSchedules: async (equipmentId, pageSize = 10, pageIndex = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await equipmentAPI.getMaintenanceSchedules(equipmentId, pageSize, pageIndex);
      const schedulesData = Array.isArray(response) 
        ? response 
        : (response.data || []);
      const schedules = schedulesData.map(normalizeMaintenanceSchedule);
      const total = Array.isArray(response) ? schedules.length : (response.total || 0);
      set({ maintenanceSchedules: schedules, maintenanceSchedulesTotal: total, isLoading: false });
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
      await equipmentAPI.createUsage(usageData);
      // Refresh usage list to get all data with proper normalization
      const usageResponse = await equipmentAPI.getUsage(undefined, 10, 0);
      const usageDataList = Array.isArray(usageResponse) 
        ? usageResponse 
        : (usageResponse.data || []);
      const usage = usageDataList.map(normalizeUsage);
      const total = Array.isArray(usageResponse) ? usage.length : (usageResponse.total || 0);
      set({ usage, usageTotal: total, isLoading: false });
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

  updateUsage: async (id, usageData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await equipmentAPI.updateUsage(id, usageData);
      const updatedUsage = normalizeUsage(response);
      set((state) => ({
        usage: state.usage.map((u) =>
          u.id === id ? updatedUsage : u
        ),
        isLoading: false,
      }));
      showSuccess('Cập nhật bản ghi sử dụng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật bản ghi sử dụng', isLoading: false });
      throw error;
    }
  },

  deleteUsage: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await equipmentAPI.deleteUsage(id);
      set((state) => ({
        usage: state.usage.filter((u) => u.id !== id),
        usageTotal: state.usageTotal - 1,
        isLoading: false,
      }));
      showSuccess('Xóa bản ghi sử dụng thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa bản ghi sử dụng', isLoading: false });
      throw error;
    }
  },

  addMaintenanceSchedule: async (scheduleData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await equipmentAPI.createMaintenanceSchedule(scheduleData);
      const newSchedule = normalizeMaintenanceSchedule(response);
      set((state) => ({
        maintenanceSchedules: [newSchedule, ...state.maintenanceSchedules],
        maintenanceSchedulesTotal: state.maintenanceSchedulesTotal + 1,
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
      const response = await equipmentAPI.updateMaintenanceSchedule(id, scheduleData);
      const updatedSchedule = normalizeMaintenanceSchedule(response);
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

  deleteMaintenanceSchedule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await equipmentAPI.deleteMaintenanceSchedule(id);
      set((state) => ({
        maintenanceSchedules: state.maintenanceSchedules.filter((schedule) => schedule.id !== id),
        maintenanceSchedulesTotal: state.maintenanceSchedulesTotal - 1,
        isLoading: false,
      }));
      showSuccess('Xóa lịch bảo trì thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa lịch bảo trì', isLoading: false });
      throw error;
    }
  },

  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
}));

