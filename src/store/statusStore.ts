import { create } from 'zustand';
import api from '../api/axios.instance';
import type { AssetStatus, CreateStatusDTO, UpdateStatusDTO } from '../interfaces/status.interface';

interface StatusState {
  statuses: AssetStatus[];
  isLoading: boolean;
  error: string | null;
  fetchStatuses: () => Promise<void>;
  createStatus: (data: CreateStatusDTO) => Promise<void>;
  updateStatus: (id: string, data: UpdateStatusDTO) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  statuses: [],
  isLoading: false,
  error: null,
  fetchStatuses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetStatus[] }>('/statuses');
      set({ statuses: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener estados operativos', isLoading: false });
    }
  },
  createStatus: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/statuses', data);
      await get().fetchStatuses();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear estado operativo');
    }
  },
  updateStatus: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      try {
        await api.put(`/statuses/${id}`, data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.patch(`/statuses/${id}`, data);
        } else {
          throw err;
        }
      }
      await get().fetchStatuses();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar estado operativo');
    }
  },
  deleteStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/statuses/${id}`);
      await get().fetchStatuses();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar estado operativo');
    }
  },
}));
