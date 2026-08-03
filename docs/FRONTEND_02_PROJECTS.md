# Módulo de Gestión de Proyectos Frontend
**Documento:** FRONTEND_02_PROJECTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Administración de Proyectos Mineros e Institucionales  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar el desarrollo del módulo de **Gestión de Proyectos** en el cliente frontend. Permite listar, filtrar, crear, editar, visualizar el detalle y desincorporar proyectos institucionales y de exploración/explotación minera de COMIBOL a los cuales se vinculan los activos fijos de la corporación.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | Listar proyectos con paginación, filtro por estado, tipo y búsqueda |
| `POST` | `/api/v1/projects` | Crear nuevo proyecto minero o administrativo |
| `GET` | `/api/v1/projects/:id` | Obtener detalle de un proyecto y conteo de activos asignados |
| `PATCH` | `/api/v1/projects/:id` | Actualizar datos del proyecto (valida estados permitidos) |
| `DELETE` | `/api/v1/projects/:id` | Eliminación lógica de proyecto (protegida si tiene activos) |

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
  deletedAt?: string | null;
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

# 4. Servicio API (`src/services/project.service.ts`)

```typescript
import api from '../api/axios.instance';
import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectFilterParams } from '../interfaces/project.interface';

export const projectService = {
  async getAll(params?: ProjectFilterParams) {
    const response = await api.get<{ success: boolean; data: Project[]; pagination: any }>('/projects', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Project }>(`/projects/${id}`);
    return response.data.data;
  },

  async create(data: CreateProjectDTO) {
    const response = await api.post<{ success: boolean; data: Project }>('/projects', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateProjectDTO) {
    const response = await api.patch<{ success: boolean; data: Project }>(`/projects/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/projects/${id}`);
    return response.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Vista Lista de Proyectos (`src/pages/ProjectsPage.tsx`)
- Barra superior con buscador en tiempo real por **Código** o **Nombre de Proyecto**.
- Filtros por **Estado** (`ACTIVE`, `FINISHED`, `SUSPENDED`, `CANCELLED`) y **Tipo** (`EXPLORATION`, `EXPLOITATION`, `ADMINISTRATIVE`).
- Tarjetas / Tabla interactiva con badges de estado estilizados:
  - `ACTIVE`: Verde esmeralda.
  - `FINISHED`: Azul corporativo.
  - `SUSPENDED`: Ámbar.
  - `CANCELLED`: Rojo rosado.
- Paginador reactivo.

### 5.2 Formulario Crear/Editar Proyecto (`src/components/projects/ProjectFormModal.tsx`)
- Modal intuitivo con validaciones:
  - `code` obligatorio y único (ej: `PROJ-MIN-001`).
  - `name` obligatorio.
  - Validación de rango de fechas: `startDate <= endDate`.
  - Control de restricción de estado: no permite cambiar un proyecto finalizado (`FINISHED`) de vuelta a activo (`ACTIVE`).

### 5.3 Modal de Detalle de Proyecto (`src/components/projects/ProjectDetailModal.tsx`)
- Resumen técnico, rango de ejecución, indicador de cantidad de activos fijos asignados actualmente y botón de acción rápida para gestión de activos.

---

# 6. Criterios de Aceptación

- [ ] Listado de proyectos conectado a `GET /api/v1/projects` con filtros y paginación.
- [ ] Creación y edición funcional con modal conectado a `POST` y `PATCH`.
- [ ] Validación de fechas y estados devueltos por la API Backend.
- [ ] Notificación amigable con toast si la eliminación falla por activos asignados activos.
