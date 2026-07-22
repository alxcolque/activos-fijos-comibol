import { create } from 'zustand';
import type { SystemSettings } from '../interfaces';
import { getSettings } from '../services/api';

interface SettingsState {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: SystemSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  error: null,
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await getSettings();
      set({ settings, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Error al cargar ajustes', loading: false });
    }
  },
  updateSettings: (settings) => set({ settings }),
}));
