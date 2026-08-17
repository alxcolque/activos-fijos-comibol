import { create } from 'zustand';
import api from '../api/axios.instance';
import type { AssetModel, CreateAssetDTO, UpdateAssetDTO, AssetQueryParams } from '../interfaces/asset.interface';
import type { AssetCategory } from '../interfaces/category.interface';
import type { AssetStatus } from '../interfaces/status.interface';
import type { LocationNode } from '../interfaces/location.interface';
import type { PaginationMeta } from '../interfaces/api-response.interface';

interface AssetState {
  assets: AssetModel[];
  selectedAsset: AssetModel | null;
  categories: AssetCategory[];
  statuses: AssetStatus[];
  locations: LocationNode[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  fetchAssets: (params?: AssetQueryParams) => Promise<void>;
  fetchAssetById: (id: string) => Promise<AssetModel | null>;
  fetchInitialData: () => Promise<void>;
  createAsset: (data: CreateAssetDTO) => Promise<AssetModel>;
  updateAsset: (id: string, data: UpdateAssetDTO) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  selectedAsset: null,
  categories: [],
  statuses: [],
  locations: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchAssets: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetModel[]; pagination: PaginationMeta }>('/assets', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search,
          category: params?.categoryId,
          status: params?.statusId,
          location: params?.locationId,
        },
      });
      set({
        assets: response.data.data,
        pagination: response.data.pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar los activos fijos', isLoading: false });
    }
  },

  fetchAssetById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetModel }>(`/assets/${id}`);
      set({ selectedAsset: response.data.data, isLoading: false });
      return response.data.data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener activo fijo', isLoading: false });
      return null;
    }
  },

  fetchInitialData: async () => {
    try {
      const [catRes, statRes, locRes] = await Promise.all([
        api.get<{ success: boolean; data: AssetCategory[] }>('/categories'),
        api.get<{ success: boolean; data: AssetStatus[] }>('/statuses'),
        api.get<{ success: boolean; data: LocationNode[] }>('/locations?limit=200'),
      ]);
      set({
        categories: catRes.data.data || [],
        statuses: statRes.data.data || [],
        locations: locRes.data.data || [],
      });
    } catch (err) {
      console.error('Error preloading metadata for assets', err);
    }
  },

  createAsset: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; data: AssetModel }>('/assets', data);
      await get().fetchAssets();
      return response.data.data;
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear activo fijo');
    }
  },

  updateAsset: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      try {
        await api.put(`/assets/${id}`, data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.patch(`/assets/${id}`, data);
        } else {
          throw err;
        }
      }
      await get().fetchAssets();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar activo fijo');
    }
  },

  deleteAsset: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/assets/${id}`);
      await get().fetchAssets();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar activo fijo');
    }
  },
}));
