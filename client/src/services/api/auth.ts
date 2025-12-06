import api from './instance';

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string, phone?: string, role?: string) => {
    const response = await api.post('/auth/register', { name, email, password, phone, role });
    if (response.data.token) {
      localStorage.setItem('auth-token', response.data.token);
    }
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth-token', response.data.token);
    }
    return response.data;
  },
  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email }).then((res) => res.data);
  },
  resetPassword: async (token: string, newPassword: string) => {
    return api.post('/auth/reset-password', { token, newPassword }).then((res) => res.data);
  },
  verifyToken: async (token: string) => {
    return api.post('/auth/verify-token', { token }).then((res) => res.data);
  },
  logout: () => {
    localStorage.removeItem('auth-token');
  },
};

