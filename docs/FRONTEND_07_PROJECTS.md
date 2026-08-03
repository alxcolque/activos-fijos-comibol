# Módulo de Proyectos Mineros e Institucionales
**Documento:** FRONTEND_07_PROJECTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Administración de Proyectos y Centros de Costo  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Proyectos Mineros e Institucionales** (`/projects`) para gestionar los proyectos de exploración, explotación y administración de COMIBOL (ej. Proyecto Mesa Verde, Planta Hidrometalúrgica, Operación Huanuni). Permite registrar proyectos con rango de fechas, estado operativo y tipo.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | Obtiene lista paginada de proyectos con filtros | Sí |
| `POST` | `/api/v1/projects` | Crea un nuevo proyecto minero o administrativo | Sí |
| `GET` | `/api/v1/projects/:id` | Obtiene la información detallada de un proyecto | Sí |
| `PUT` | `/api/v1/projects/:id` | Actualiza los datos de un proyecto | Sí |
| `DELETE` | `/api/v1/projects/:id` | Elimina lógicamente un proyecto (Soft Delete) | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/project.interface.ts`)

```typescript
export type ProjectType = 'EXPLORATION' | 'EXPLOITATION' | 'ADMINISTRATIVE' | 'OTHER';
export type ProjectStatus = 'ACTIVE' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED';

export interface Project {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assetProjects: number;
  };
}

export interface CreateProjectDTO {
  code: string;
  name: string;
  type?: ProjectType;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export interface ProjectFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  type?: ProjectType;
}
```

---

# 4. Estado Global Zustand (`src/store/projectStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectFilterParams } from '../interfaces/project.interface';
import { PaginationMeta } from '../interfaces/api-response.interface';

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
      const response = await api.get<{ success: boolean; data: Project[]; pagination: PaginationMeta }>('/projects', { params });
      set({ projects: response.data.data, pagination: response.data.pagination, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar proyectos', isLoading: false });
    }
  },
  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/projects', data);
      await get().fetchProjects();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear proyecto');
    }
  },
  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/projects/${id}`, data);
      await get().fetchProjects();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar proyecto');
    }
  },
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      await get().fetchProjects();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar proyecto');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Projects.tsx`)

### Componentes Visuales:
1. **Filtros de Búsqueda (`SearchBar` + Selects):**
   - Búsqueda por Código o Nombre, Select por Tipo (`Exploración`, `Explotación`, `Administrativo`), Select por Estado (`Activo`, `Finalizado`, `Suspendido`).
2. **Tabla de Proyectos (`DataTable`):**
   - Código de Proyecto, Nombre, Tipo, Estado con Badge, Fechas Inicio/Fin, Total Activos Asignados, Acciones.
3. **Modal Formulario Proyecto (`ProjectFormModal.tsx`):**
   - Inputs para `code`, `name`, `type`, `status`, `startDate`, `endDate`, `description`.

---

# 6. Criterios de Aceptación

- [ ] Paginación y filtrado reactivo desde `GET /api/v1/projects`.
- [ ] Validación de código único de proyecto.
- [ ] Badges visuales temáticos para el tipo y estado de proyecto.
