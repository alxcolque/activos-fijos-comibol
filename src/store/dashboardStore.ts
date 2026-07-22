import { create } from 'zustand';
import type { ActivityLog } from '../interfaces';
import { getDashboard } from '../services/api';

interface DashboardState {
  recentActivities: ActivityLog[];
  loading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  addActivity: (log: Omit<ActivityLog, 'id' | 'time'>) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  recentActivities: [],
  loading: false,
  error: null,
  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const { stats } = await getDashboard();
      set({
        recentActivities: stats.recentActivities,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Error al cargar datos del dashboard', loading: false });
    }
  },
  addActivity: (log) => {
    const id = `act-log-${Date.now()}`;
    const newLog: ActivityLog = {
      ...log,
      id,
      time: 'Hace un momento'
    };
    set((state) => ({
      recentActivities: [newLog, ...state.recentActivities.slice(0, 9)], // Mantiene los últimos 10 logs
    }));
  }
}));
