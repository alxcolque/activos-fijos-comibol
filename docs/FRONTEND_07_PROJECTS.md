# Módulo de Proyectos Mineros e Institucionales
**Documento:** FRONTEND_07_PROJECTS.md  
**Versión:** 1.1.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Administración de Proyectos y Centros de Costo  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Proyectos Mineros e Institucionales** (`/projects`) para gestionar los proyectos de exploración, explotación y administración de COMIBOL. Permite registrar proyectos con nombre, dirección, responsable, rango de fechas, estado operativo y descripción.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | Obtiene lista paginada de proyectos con filtros | Sí |
| `POST` | `/api/v1/projects` | Crea un nuevo proyecto | Sí |
| `GET` | `/api/v1/projects/:id` | Obtiene la información detallada de un proyecto | Sí |
| `PUT` | `/api/v1/projects/:id` | Actualiza los datos de un proyecto | Sí |
| `PATCH` | `/api/v1/projects/:id` | Actualiza parcialmente los datos de un proyecto | Sí |
| `DELETE` | `/api/v1/projects/:id` | Elimina lógicamente un proyecto (Soft Delete) | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/project.interface.ts`)

```typescript
export type ProjectStatus = 'ACTIVE' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED';

export interface Project {
  id: string;
  name: string;
  address?: string | null;
  responsible?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  totalAssets?: number;
  _count?: {
    assetProjects: number;
  };
}

export interface CreateProjectDTO {
  name: string;
  address?: string | null;
  responsible?: string | null;
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
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Projects.tsx`)

### Componentes Visuales:
1. **Filtros de Búsqueda (`SearchBar` + Select):**
   - Búsqueda por Nombre, Dirección, Responsable o Descripción. Select por Estado (`Activo`, `Finalizado`, `Suspendido`, `Cancelado`).
2. **Tabla de Proyectos (`DataTable`):**
   - N°, Nombre de Proyecto, Dirección, Responsable, Estado con Badge, Fechas Inicio/Fin, Total Activos Asignados, Acciones.
3. **Modal Formulario Proyecto (`ProjectFormModal.tsx`):**
   - Inputs para `name`, `address`, `responsible`, `status`, `startDate`, `endDate`, `description`.
