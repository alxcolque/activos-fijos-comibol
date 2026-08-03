# Módulo de Auditorías e Inventario Físico
**Documento:** FRONTEND_13_INVENTORIES.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Campañas de Levantamiento Físico y Reconciliación de Activos  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Inventarios y Auditorías Físicas** (`/inventories`) para planificar campañas de inspección física en minas y sedes de COMIBOL, conciliar presencia de activos y verificar discrepancias.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/inventories` | Lista todas las campañas de inventario físico | Sí |
| `POST` | `/api/v1/inventories` | Crea una nueva campaña de inventario | Sí |
| `GET` | `/api/v1/inventories/:id` | Obtiene el detalle e ítems de una campaña | Sí |
| `POST` | `/api/v1/inventories/:id/reconcile` | Registra la verificación física de activos | Sí |
| `PUT` | `/api/v1/inventories/:id/complete` | Cierra y finaliza la campaña de inventario | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/inventory.interface.ts`)

```typescript
export type InventoryStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface InventoryItem {
  id: string;
  inventoryId: string;
  assetId: string;
  verified: boolean;
  verifiedAt?: string | null;
  observations?: string | null;
  asset?: {
    id: string;
    code: string;
    name: string;
    locationId: string;
  };
}

export interface InventoryCampaign {
  id: string;
  title: string;
  description?: string | null;
  status: InventoryStatus;
  startDate: string;
  endDate?: string | null;
  locationId?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: InventoryItem[];
  location?: {
    id: string;
    name: string;
  };
}

export interface CreateInventoryDTO {
  title: string;
  description?: string;
  startDate: string;
  locationId?: string;
}

export interface ReconcileItemsDTO {
  items: {
    assetId: string;
    verified: boolean;
    observations?: string;
  }[];
}
```

---

# 4. Estado Global Zustand (`src/store/inventoryStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { InventoryCampaign, CreateInventoryDTO, ReconcileItemsDTO } from '../interfaces/inventory.interface';

interface InventoryState {
  inventories: InventoryCampaign[];
  activeInventory: InventoryCampaign | null;
  isLoading: boolean;
  error: string | null;
  fetchInventories: () => Promise<void>;
  fetchInventoryById: (id: string) => Promise<void>;
  createInventory: (data: CreateInventoryDTO) => Promise<void>;
  reconcileItems: (inventoryId: string, data: ReconcileItemsDTO) => Promise<void>;
  completeInventory: (inventoryId: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventories: [],
  activeInventory: null,
  isLoading: false,
  error: null,
  fetchInventories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: InventoryCampaign[] }>('/inventories');
      set({ inventories: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener campañas de inventario', isLoading: false });
    }
  },
  fetchInventoryById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: InventoryCampaign }>(`/inventories/${id}`);
      set({ activeInventory: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener detalle del inventario', isLoading: false });
    }
  },
  createInventory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/inventories', data);
      await get().fetchInventories();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear campaña de inventario');
    }
  },
  reconcileItems: async (inventoryId, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/inventories/${inventoryId}/reconcile`, data);
      await get().fetchInventoryById(inventoryId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al reconciliar ítems');
    }
  },
  completeInventory: async (inventoryId) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/inventories/${inventoryId}/complete`);
      await get().fetchInventoryById(inventoryId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al finalizar inventario');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Inventories.tsx`)

### Vistas:
1. **Listado de Campañas:** Tarjetas y tabla con título, fecha inicio, ubicación objetivo, estado (Borrador, En Progreso, Completado) y porcentaje de avance (verificados/totales).
2. **Pantalla de Reconciliación (`InventoryReconcileView.tsx`):** Checkbox interactivo rápido por cada activo para marcar presencia física y agregar observaciones de discrepancia.

---

# 6. Criterios de Aceptación

- [ ] Reconciliación física rápida con barras de progreso en tiempo real.
- [ ] Cierre y consolidación del estado final de la campaña.
