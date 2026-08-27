import { create } from 'zustand';
import api from '../api/axios.instance';
import type {
  SupplyItem,
  CreateSupplyDTO,
  UpdateSupplyDTO,
  SupplyQueryParams,
} from '../interfaces/supply.interface';

interface SupplyState {
  supplies: SupplyItem[];
  totalSupplies: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  isLoading: boolean;
  error: string | null;

  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  fetchSupplies: (params?: SupplyQueryParams) => Promise<void>;
  createSupply: (data: CreateSupplyDTO) => Promise<SupplyItem>;
  updateSupply: (id: string, data: UpdateSupplyDTO) => Promise<SupplyItem>;
  deleteSupply: (id: string) => Promise<void>;
}

export const useSupplyStore = create<SupplyState>((set, get) => ({
  supplies: [],
  totalSupplies: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  search: '',
  isLoading: false,
  error: null,

  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),

  fetchSupplies: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const currentState = get();
      const page = params?.page ?? currentState.page;
      const limit = params?.limit ?? currentState.limit;
      const search = params?.search ?? currentState.search;

      const response = await api.get('/supplies', {
        params: { page, limit, search: search.trim() || undefined },
      });

      const { data, pagination } = response.data;
      set({
        supplies: data || [],
        totalSupplies: pagination?.total || (data || []).length,
        page: pagination?.page || page,
        limit: pagination?.limit || limit,
        totalPages: pagination?.totalPages || 1,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Error al cargar materiales/suministros.',
        isLoading: false,
      });
    }
  },

  createSupply: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/supplies', data);
      const newSupply = response.data.data;
      await get().fetchSupplies();
      return newSupply;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar material.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateSupply: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/supplies/${id}`, data);
      const updatedSupply = response.data.data;
      await get().fetchSupplies();
      return updatedSupply;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar material.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteSupply: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/supplies/${id}`);
      await get().fetchSupplies();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar material.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
}));
