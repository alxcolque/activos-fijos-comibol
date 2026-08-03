import { create } from 'zustand';
import api from '../api/axios.instance';
import type { LocationNode, CreateLocationDTO, UpdateLocationDTO } from '../interfaces/location.interface';

interface LocationState {
  locationsTree: LocationNode[];
  locationsFlat: LocationNode[];
  isLoading: boolean;
  error: string | null;
  fetchLocationsTree: () => Promise<void>;
  fetchLocationsFlat: () => Promise<void>;
  createLocation: (data: CreateLocationDTO) => Promise<void>;
  updateLocation: (id: string, data: UpdateLocationDTO) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locationsTree: [],
  locationsFlat: [],
  isLoading: false,
  error: null,
  fetchLocationsTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: LocationNode[] }>('/locations/tree');
      set({ locationsTree: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener el árbol de ubicaciones', isLoading: false });
    }
  },
  fetchLocationsFlat: async () => {
    try {
      const response = await api.get<{ success: boolean; data: LocationNode[] }>('/locations?limit=200');
      set({ locationsFlat: response.data.data });
    } catch (err: any) {
      console.error('Error fetching flat locations', err);
    }
  },
  createLocation: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/locations', data);
      await Promise.all([get().fetchLocationsTree(), get().fetchLocationsFlat()]);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear la ubicación');
    }
  },
  updateLocation: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      try {
        await api.put(`/locations/${id}`, data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.patch(`/locations/${id}`, data);
        } else {
          throw err;
        }
      }
      await Promise.all([get().fetchLocationsTree(), get().fetchLocationsFlat()]);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar la ubicación');
    }
  },
  deleteLocation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/locations/${id}`);
      await Promise.all([get().fetchLocationsTree(), get().fetchLocationsFlat()]);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar la ubicación');
    }
  },
}));
