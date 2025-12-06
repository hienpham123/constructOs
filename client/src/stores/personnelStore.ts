import { create } from 'zustand';
import { Personnel, Attendance } from '../types';
import { personnelAPI } from '../services/api';
import { normalizePersonnel } from '../utils/normalize';
import { showSuccess, showError } from '../utils/notifications';

interface PersonnelState {
  personnel: Personnel[];
  personnelTotal: number;
  attendance: Attendance[];
  selectedPersonnel: Personnel | null;
  isLoading: boolean;
  error: string | null;
  fetchPersonnel: (pageSize?: number, pageIndex?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => Promise<void>;
  fetchAttendance: (projectId?: string, date?: string) => Promise<void>;
  addPersonnel: (personnel: Omit<Personnel, 'id' | 'createdAt'>) => Promise<void>;
  updatePersonnel: (id: string, personnel: Partial<Personnel>) => Promise<void>;
  deletePersonnel: (id: string) => Promise<void>;
  addAttendance: (attendance: Omit<Attendance, 'id'>) => Promise<void>;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => Promise<void>;
  setSelectedPersonnel: (personnel: Personnel | null) => void;
}

export const usePersonnelStore = create<PersonnelState>((set) => ({
  personnel: [],
  personnelTotal: 0,
  attendance: [],
  selectedPersonnel: null,
  isLoading: false,
  error: null,

  fetchPersonnel: async (pageSize = 10, pageIndex = 0, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    set({ isLoading: true, error: null });
    try {
      const response = await personnelAPI.getAll(pageSize, pageIndex, search, sortBy, sortOrder);
      // Handle both old format (array) and new format (object with data, total)
      const personnel = Array.isArray(response) 
        ? response.map(normalizePersonnel) 
        : (response.data || []).map(normalizePersonnel);
      const total = Array.isArray(response) ? personnel.length : (response.total || 0);
      set({ personnel, personnelTotal: total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch personnel', isLoading: false });
      console.error('Error fetching personnel:', error);
    }
  },

  fetchAttendance: async (projectId, date) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API endpoint for attendance when backend is ready
      // For now, return empty array
      set({ attendance: [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch attendance', isLoading: false });
      console.error('Error fetching attendance:', error);
    }
  },

  addPersonnel: async (personnelData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await personnelAPI.create(personnelData);
      const newPersonnel = normalizePersonnel(data);
      set((state) => ({
        personnel: [...state.personnel, newPersonnel],
        isLoading: false,
      }));
      showSuccess('Thêm nhân sự thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể thêm nhân sự', isLoading: false });
      throw error;
    }
  },

  updatePersonnel: async (id, personnelData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await personnelAPI.update(id, personnelData);
      const updatedPersonnel = normalizePersonnel(data);
      set((state) => ({
        personnel: state.personnel.map((person) =>
          person.id === id ? updatedPersonnel : person
        ),
        isLoading: false,
      }));
      showSuccess('Cập nhật nhân sự thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể cập nhật nhân sự', isLoading: false });
      throw error;
    }
  },

  deletePersonnel: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await personnelAPI.delete(id);
      set((state) => ({
        personnel: state.personnel.filter((person) => person.id !== id),
        isLoading: false,
      }));
      showSuccess('Xóa nhân sự thành công');
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa nhân sự', isLoading: false });
      throw error;
    }
  },

  addAttendance: async (attendanceData) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API endpoint for attendance
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newAttendance: Attendance = {
        ...attendanceData,
        id: Date.now().toString(),
      };
      set((state) => ({
        attendance: [newAttendance, ...state.attendance],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add attendance', isLoading: false });
      throw error;
    }
  },

  updateAttendance: async (id, attendanceData) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API endpoint for attendance
      await new Promise((resolve) => setTimeout(resolve, 300));
      set((state) => ({
        attendance: state.attendance.map((att) =>
          att.id === id ? { ...att, ...attendanceData } : att
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update attendance', isLoading: false });
      throw error;
    }
  },

  setSelectedPersonnel: (personnel) => set({ selectedPersonnel: personnel }),
}));

