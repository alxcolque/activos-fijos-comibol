# Módulo de Asignación Exclusiva Activo-Proyecto
**Documento:** FRONTEND_09_ASSET_PROJECTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Asignación y Desasignación de Activos a Proyectos Mineros  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Asignación Activo-Proyecto** para controlar la relación entre los activos fijos y los proyectos mineros. Un activo solo puede pertenecer a un proyecto activo simultáneamente.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/asset-projects/project/:projectId` | Obtiene activos actualmente asignados a un proyecto | Sí |
| `POST` | `/api/v1/asset-projects/assign` | Asigna un activo a un proyecto minero | Sí |
| `POST` | `/api/v1/asset-projects/unassign` | Libera (desasigna) un activo de un proyecto | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/asset-project.interface.ts`)

```typescript
export interface AssetProjectRelation {
  id: string;
  assetId: string;
  projectId: string;
  assignmentDate: string;
  unassignmentDate?: string | null;
  observations?: string | null;
  asset?: {
    id: string;
    code: string;
    name: string;
  };
  project?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface AssignAssetToProjectDTO {
  assetId: string;
  projectId: string;
  assignmentDate: string;
  observations?: string;
}

export interface UnassignAssetFromProjectDTO {
  assetId: string;
  projectId: string;
  unassignmentDate: string;
  observations?: string;
}
```

---

# 4. Estado Global Zustand (`src/store/assetProjectStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { AssetProjectRelation, AssignAssetToProjectDTO, UnassignAssetFromProjectDTO } from '../interfaces/asset-project.interface';

interface AssetProjectState {
  projectAssets: AssetProjectRelation[];
  isLoading: boolean;
  error: string | null;
  fetchProjectAssets: (projectId: string) => Promise<void>;
  assignAsset: (data: AssignAssetToProjectDTO) => Promise<void>;
  unassignAsset: (data: UnassignAssetFromProjectDTO) => Promise<void>;
}

export const useAssetProjectStore = create<AssetProjectState>((set) => ({
  projectAssets: [],
  isLoading: false,
  error: null,
  fetchProjectAssets: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetProjectRelation[] }>(`/asset-projects/project/${projectId}`);
      set({ projectAssets: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener activos del proyecto', isLoading: false });
    }
  },
  assignAsset: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/asset-projects/assign', data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al asignar activo al proyecto');
    }
  },
  unassignAsset: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/asset-projects/unassign', data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al desasignar activo del proyecto');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/components/projects/ProjectAssetAssignmentModal.tsx`)

### Flujo de Interfaz:
1. **Pestaña Activos Asignados:** Muestra tabla con activos pertenecientes al proyecto actual y botón "Liberar de Proyecto".
2. **Pestaña Asignar Nuevo Activo:** Selector autocompletado de activos disponibles (no asignados a otros proyectos activos) con fecha de asignación y observaciones.

---

# 6. Criterios de Aceptación

- [ ] Control de exclusividad: Impedir asignación simultánea de un activo a dos proyectos activos.
- [ ] Actualización dinámica del listado tras asignar o liberar un activo.
