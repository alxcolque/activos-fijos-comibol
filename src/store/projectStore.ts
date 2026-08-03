import { create } from 'zustand';
import api from '../api/axios.instance';
import type { Project, CreateProjectDTO, UpdateProjectDTO, ProjectFilterParams } from '../interfaces/project.interface';
import type { PaginationMeta } from '../interfaces/api-response.interface';

interface ProjectState {
  projects: Project[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: (params?: ProjectFilterParams) => Promise<void>;
  createProject: (data: CreateProjectDTO) => Promise<void>;
  updateProject: (id: string, data: UpdateProjectDTO) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  pagination: null,
  isLoading: false,
  error: null,
  fetchProjects: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: Project[]; pagination: PaginationMeta }>('/projects', {
        params,
      });
      set({
        projects: response.data.data,
        pagination: response.data.pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener proyectos', isLoading: false });
    }
  },
  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/projects', data);
      await get().fetchProjects();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear el proyecto');
    }
  },
  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      try {
        await api.put(`/projects/${id}`, data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.patch(`/projects/${id}`, data);
        } else {
          throw err;
        }
      }
      await get().fetchProjects();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar el proyecto');
    }
  },
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      await get().fetchProjects();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar el proyecto');
    }
  },
}));
