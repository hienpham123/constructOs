import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI, usersAPI } from '../services/api';
import { showSuccess } from '../utils/notifications';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'project_manager' | 'accountant' | 'warehouse' | 'site_manager' | 'engineer' | 'client';
  role_description?: string;
  status?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  error: string | null;
  register: (name: string, email: string, password: string, phone?: string, role?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,

      register: async (name, email, password, phone, role) => {
        try {
          set({ error: null });
          const response = await authAPI.register(name, email, password, phone, role);
          set({
            user: response.user,
            isAuthenticated: true,
          });
          showSuccess('Đăng ký thành công');
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || 'Đăng ký thất bại';
          set({ error: errorMessage });
          throw error;
        }
      },

      login: async (email, password) => {
        try {
          set({ error: null });
          const response = await authAPI.login(email, password);
          set({
            user: response.user,
            isAuthenticated: true,
          });
          showSuccess('Đăng nhập thành công');
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || 'Đăng nhập thất bại';
          set({ error: errorMessage });
          throw error;
        }
      },

      logout: () => {
        authAPI.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      refreshUser: async () => {
        try {
          const userData = await usersAPI.getCurrent();
          set({
            user: userData,
          });
        } catch (error) {
          console.error('Error refreshing user:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

