import { create } from 'zustand';
import api from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'receiver' | 'both';
  avatar?: string;
  businessName?: string;
  businessType?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await api.post('/auth/login', { email, password });
      const { token, ...user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (data) => {
    try {
      set({ loading: true });
      const response = await api.post('/auth/register', data);
      const { token, ...user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  setUser: (user) => set({ user }),
}));

