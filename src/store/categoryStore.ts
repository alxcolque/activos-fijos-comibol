import { create } from 'zustand';
import api from '../api/axios.instance';
import type { AssetCategory, CreateCategoryDTO, UpdateCategoryDTO, CategoryType } from '../interfaces/category.interface';

interface CategoryState {
  categories: AssetCategory[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: (params?: { search?: string; type?: CategoryType }) => Promise<void>;
  createCategory: (data: CreateCategoryDTO) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryDTO) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  fetchCategories: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetCategory[] }>('/categories', {
        params,
      });
      set({ categories: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener categorías', isLoading: false });
    }
  },
  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/categories', data);
      await get().fetchCategories({ type: data.type });
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear categoría');
    }
  },
  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      try {
        await api.put(`/categories/${id}`, data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.patch(`/categories/${id}`, data);
        } else {
          throw err;
        }
      }
      await get().fetchCategories({ type: data.type });
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar categoría');
    }
  },
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/categories/${id}`);
      await get().fetchCategories();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar categoría');
    }
  },
}));
