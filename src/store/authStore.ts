import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, LoginCredentials } from '../interfaces/auth.interface';
import { authService } from '../services/auth.service';

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, loading: true, error: null });
        try {
          const { token, user } = await authService.login(credentials);
          set({ token, user, isAuthenticated: true, isLoading: false, loading: false });
        } catch (err: any) {
          const message =
            err.customMessage ||
            err.response?.data?.message ||
            (err.message === 'Network Error'
              ? 'Servidor no disponible. Verifique que el backend esté en ejecución.'
              : err.message) ||
            'Error al iniciar sesión';
          set({ error: message, isLoading: false, loading: false, isAuthenticated: false });
          throw new Error(message);
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, error: null });
        localStorage.removeItem('auth-storage');
      },

      checkAuth: async () => {
        set({ isLoading: true, loading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false, loading: false });
        } catch {
          set({ token: null, user: null, isAuthenticated: false, isLoading: false, loading: false });
        }
      },

      fetchUser: async () => {
        await get().checkAuth();
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
