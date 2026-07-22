import { create } from 'zustand';
import type { User } from '../interfaces';
import { getDashboard } from '../services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = await getDashboard();
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Error al cargar usuario', loading: false });
    }
  },
  setUser: (user) => set({ user }),
}));
