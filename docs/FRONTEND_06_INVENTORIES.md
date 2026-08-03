# Módulo de Procesos de Inventariado Físico Frontend
**Documento:** FRONTEND_06_INVENTORIES.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Campañas de Inventariado y Reconciliación Físico-Contable  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Inventariado Físico y Reconciliación** en el cliente frontend. Permite a los auditores y administradores crear campañas de verificación por sede o mina, registrar la presencia o estado de cada activo (`FOUND`, `NOT_FOUND`, `DAMAGED`) mediante interfaz rápida o escáner QR, y consultar reportes estadísticos de avance de inventario.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/v1/inventories` | Crear nueva campaña de inventariado asignada a una ubicación |
| `GET` | `/api/v1/inventories` | Listar campañas de inventario registradas |
| `GET` | `/api/v1/inventories/:id` | Obtener detalle de campaña, estadísticas de avance e ítems relevados |
| `POST` | `/api/v1/inventories/:id/items` | Registrar o actualizar la verificación física de un activo en la campaña |

---

# 3. Interfaces de Datos (`src/interfaces/inventory.interface.ts`)

```typescript
export type InventoryStatus = 'FOUND' | 'NOT_FOUND' | 'DAMAGED';

export interface InventoryCampaign {
  id: string;
  name: string;
  inventoryDate: string;
  locationId: string;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  location?: {
    id: string;
    name: string;
  };
  _count?: {
    items: number;
  };
}

export interface InventoryStats {
  totalExpected: number;
  foundCount: number;
  notFoundCount: number;
  damagedCount: number;
  completionPercentage: number;
}

export interface InventoryItemVerification {
  id: string;
  inventoryId: string;
  assetId: string;
  status: InventoryStatus;
  observations?: string | null;
  asset?: {
    id: string;
    code: string;
    name: string;
    serialNumber?: string | null;
  };
}

export interface CreateInventoryDTO {
  name: string;
  inventoryDate: string;
  locationId: string;
  observations?: string;
}

export interface RegisterInventoryItemDTO {
  assetId: string;
  status: InventoryStatus;
  observations?: string;
}
```

---

# 4. Servicio API (`src/services/inventory.service.ts`)

```typescript
import api from '../api/axios.instance';
import {
  InventoryCampaign,
  CreateInventoryDTO,
  RegisterInventoryItemDTO,
  InventoryItemVerification,
  InventoryStats,
} from '../interfaces/inventory.interface';

export const inventoryService = {
  async getAll() {
    const response = await api.get<{ success: boolean; data: InventoryCampaign[] }>('/inventories');
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get<{
      success: boolean;
      data: {
        campaign: InventoryCampaign;
        stats: InventoryStats;
        items: InventoryItemVerification[];
      };
    }>(`/inventories/${id}`);
    return response.data.data;
  },

  async create(data: CreateInventoryDTO) {
    const response = await api.post<{ success: boolean; data: InventoryCampaign }>('/inventories', data);
    return response.data.data;
  },

  async registerItem(inventoryId: string, data: RegisterInventoryItemDTO) {
    const response = await api.post<{ success: boolean; data: InventoryItemVerification }>(
      `/inventories/${inventoryId}/items`,
      data,
    );
    return response.data.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Vista Lista de Campañas (`src/pages/InventoriesPage.tsx`)
- Panel de campañas activas e históricas con indicadores de porcentaje de avance.
- Botón "Nueva Campaña de Inventario".

### 5.2 Formulario de Nueva Campaña (`src/components/inventories/InventoryFormModal.tsx`)
- Selector de **Ubicación** a auditar.
- Campo de fecha de ejecución.
- Denominación oficial de la campaña (ej: *"Relevamiento Físico 2026 - Mina Huanuni"*).

### 5.3 Panel de Auditoría Físico-Contable (`src/pages/InventoryAuditDetailPage.tsx`)
- **Indicadores Resumen (Cards):**
  - Esperados: Total de activos registrados en esa ubicación.
  - Presentes (`FOUND`): Verde.
  - Ausentes (`NOT_FOUND`): Rojo.
  - Dañados (`DAMAGED`): Ámbar.
  - Barra de Progreso de Cobertura.
- **Acción Rápida de Verificación:** Formulario de búsqueda por código patrimonial o lectura de QR que marca al instante el activo con botones de un clic (`ENCONTRADO`, `NO ENCONTRADO`, `DAÑADO`).

---

# 6. Criterios de Aceptación

- [ ] Creación de campañas conectada a `POST /api/v1/inventories`.
- [ ] Reconciliación en tiempo real conectada a `POST /api/v1/inventories/:id/items`.
- [ ] Cálculo dinámico del porcentaje de cobertura y estado de discrepancias.
