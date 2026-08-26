import { create } from 'zustand';
import api from '../api/axios.instance';
import type {
  UserItem,
  CreateUserDTO,
  UpdateUserDTO,
  UserQueryParams,
} from '../interfaces/user.interface';

interface UserState {
  users: UserItem[];
  totalUsers: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  isLoading: boolean;
  error: string | null;

  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  fetchUsers: (params?: UserQueryParams) => Promise<void>;
  createUser: (data: CreateUserDTO) => Promise<UserItem>;
  updateUser: (id: string, data: UpdateUserDTO) => Promise<UserItem>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  totalUsers: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  search: '',
  isLoading: false,
  error: null,

  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),

  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const currentState = get();
      const page = params?.page ?? currentState.page;
      const limit = params?.limit ?? currentState.limit;
      const search = params?.search ?? currentState.search;

      const response = await api.get('/users', {
        params: { page, limit, search: search.trim() || undefined },
      });

      const { data, meta } = response.data;
      set({
        users: data || [],
        totalUsers: meta?.pagination?.total || (data || []).length,
        page: meta?.pagination?.page || page,
        limit: meta?.pagination?.limit || limit,
        totalPages: meta?.pagination?.totalPages || 1,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Error al cargar usuarios.',
        isLoading: false,
      });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/users', data);
      const newUser = response.data.data;
      await get().fetchUsers();
      return newUser;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al crear usuario.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/users/${id}`, data);
      const updatedUser = response.data.data;
      await get().fetchUsers();
      return updatedUser;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar usuario.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/users/${id}`);
      await get().fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar usuario.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
}));
