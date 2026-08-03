# Módulo de Mantenimiento Preventivo y Correctivo
**Documento:** FRONTEND_12_MAINTENANCE.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Control de Mantenimiento e Historial Técnico de Equipos  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Mantenimiento de Activos** (`/maintenance`) para programar, registrar y consultar las intervenciones preventivas y correctivas realizadas en maquinarias mineras, vehículos y equipos tecnológicos de COMIBOL.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/maintenances/asset/:assetId` | Lista los mantenimientos de un activo específico | Sí |
| `POST` | `/api/v1/maintenances` | Registra una nueva orden de mantenimiento | Sí |
| `PUT` | `/api/v1/maintenances/:id` | Actualiza un registro de mantenimiento | Sí |
| `DELETE` | `/api/v1/maintenances/:id` | Elimina una orden de mantenimiento | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/maintenance.interface.ts`)

```typescript
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE';

export interface AssetMaintenance {
  id: string;
  assetId: string;
  type: MaintenanceType;
  maintenanceDate: string;
  provider?: string | null;
  cost?: number | null;
  nextMaintenance?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreateMaintenanceDTO {
  assetId: string;
  type: MaintenanceType;
  maintenanceDate: string;
  provider?: string;
  cost?: number;
  nextMaintenance?: string;
  observations?: string;
}

export interface UpdateMaintenanceDTO extends Partial<CreateMaintenanceDTO> {}
```

---

# 4. Estado Global Zustand (`src/store/maintenanceStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { AssetMaintenance, CreateMaintenanceDTO, UpdateMaintenanceDTO } from '../interfaces/maintenance.interface';

interface MaintenanceState {
  maintenances: AssetMaintenance[];
  isLoading: boolean;
  error: string | null;
  fetchMaintenancesByAsset: (assetId: string) => Promise<void>;
  createMaintenance: (data: CreateMaintenanceDTO) => Promise<void>;
  updateMaintenance: (id: string, data: UpdateMaintenanceDTO) => Promise<void>;
  deleteMaintenance: (id: string, assetId: string) => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  maintenances: [],
  isLoading: false,
  error: null,
  fetchMaintenancesByAsset: async (assetId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetMaintenance[] }>(`/maintenances/asset/${assetId}`);
      set({ maintenances: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener mantenimientos', isLoading: false });
    }
  },
  createMaintenance: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/maintenances', data);
      await get().fetchMaintenancesByAsset(data.assetId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al registrar mantenimiento');
    }
  },
  updateMaintenance: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/maintenances/${id}`, data);
      if (data.assetId) await get().fetchMaintenancesByAsset(data.assetId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar mantenimiento');
    }
  },
  deleteMaintenance: async (id, assetId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/maintenances/${id}`);
      await get().fetchMaintenancesByAsset(assetId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar mantenimiento');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/components/maintenance/AssetMaintenanceTab.tsx`)

### Vistas y Modales:
1. **Historial de Mantenimientos:** Tabla con Fecha, Tipo (Preventivo/Correctivo), Proveedor/Taller, Costo (BOB), Próximo Mantenimiento y Observaciones.
2. **Modal Formulario de Mantenimiento (`MaintenanceFormModal.tsx`):** Campos para `type`, `maintenanceDate`, `provider`, `cost`, `nextMaintenance`, `observations`.

---

# 6. Criterios de Aceptación

- [ ] Registro de mantenimientos preventivos y correctivos conectado al backend.
- [ ] Cálculo acumulado del costo de mantenimiento por activo.
