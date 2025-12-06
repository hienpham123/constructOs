import { create } from 'zustand';
import { DashboardStats } from '../types';
import { dashboardAPI } from '../services/api';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await dashboardAPI.getStats();
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch dashboard stats', 
        isLoading: false 
      });
      console.error('Error fetching dashboard stats:', error);
    }
  },
}));
