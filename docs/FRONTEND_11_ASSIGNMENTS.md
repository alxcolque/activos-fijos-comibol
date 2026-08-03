# Módulo de Custodia y Asignación Personal
**Documento:** FRONTEND_11_ASSIGNMENTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Asignaciones de Custodios y Historial de Responsabilidad  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Custodia y Asignación Personal** (`/assignments`) para registrar el responsable directo (custodio) de cada activo fijo, gestionar traspasos y registrar la devolución o rotación de custodia.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/assignments/asset/:assetId` | Historial completo de asignaciones de un activo | Sí |
| `POST` | `/api/v1/assignments/assign` | Asigna un custodio responsable a un activo | Sí |
| `POST` | `/api/v1/assignments/return` | Registra la devolución de custodia de un activo | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/assignment.interface.ts`)

```typescript
export interface AssetAssignment {
  id: string;
  assetId: string;
  responsibleName: string;
  position?: string | null;
  assignedAt: string;
  returnedAt?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface AssignCustodianDTO {
  assetId: string;
  responsibleName: string;
  position?: string;
  observations?: string;
}

export interface ReturnCustodianDTO {
  assetId: string;
  observations?: string;
}
```

---

# 4. Estado Global Zustand (`src/store/assignmentStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { AssetAssignment, AssignCustodianDTO, ReturnCustodianDTO } from '../interfaces/assignment.interface';

interface AssignmentState {
  assignmentsHistory: AssetAssignment[];
  currentAssignment: AssetAssignment | null;
  isLoading: boolean;
  error: string | null;
  fetchAssignmentsByAsset: (assetId: string) => Promise<void>;
  assignCustodian: (data: AssignCustodianDTO) => Promise<void>;
  returnCustodian: (data: ReturnCustodianDTO) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignmentsHistory: [],
  currentAssignment: null,
  isLoading: false,
  error: null,
  fetchAssignmentsByAsset: async (assetId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetAssignment[] }>(`/assignments/asset/${assetId}`);
      const history = response.data.data;
      const current = history.find((a) => !a.returnedAt) || null;
      set({ assignmentsHistory: history, currentAssignment: current, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener asignaciones', isLoading: false });
    }
  },
  assignCustodian: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/assignments/assign', data);
      await get().fetchAssignmentsByAsset(data.assetId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al asignar custodio');
    }
  },
  returnCustodian: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/assignments/return', data);
      await get().fetchAssignmentsByAsset(data.assetId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al devolver custodia');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/components/assignments/AssetCustodianTab.tsx`)

### Vistas y Modales:
1. **Ficha de Custodio Actual:** Muestra el nombre del responsable activo, cargo, fecha de asignación y botón "Registrar Devolución".
2. **Historial de Custodios:** Timeline con todas las asignaciones pasadas (fecha inicio, fecha devolución, observaciones).
3. **Modal Asignar Custodio (`AssignCustodianModal.tsx`):** Formulario con `responsibleName`, `position` y `observations`.

---

# 6. Criterios de Aceptación

- [ ] Control de devolución requerida antes de asignar un nuevo custodio.
- [ ] Registro histórico completo por activo.
