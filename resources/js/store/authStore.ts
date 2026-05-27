import { create } from 'zustand';
import api from '../lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  setUser: (user: User, token: string, role: string) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  role: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/login', { email, password });
      
      const { token, user, role } = response.data;

      localStorage.setItem('token', token);

      set({
        token,
        user,
        role: role || user?.role || 'Staff',
        isLoading: false,
      });

      return response.data;
    } catch (error: any) {
      set({ isLoading: false });
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, role: null });
    window.location.href = '/login';
  },

  setUser: (user: User, token: string, role: string) => {
    set({ user, token, role });
  },
}));

export default useAuthStore;