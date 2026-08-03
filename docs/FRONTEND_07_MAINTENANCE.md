# Módulo de Gestión de Mantenimiento Frontend
**Documento:** FRONTEND_07_MAINTENANCE.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Mantenimientos Preventivos y Correctivos de Equipos y Maquinarias  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Gestión de Mantenimiento** en el cliente frontend. Permite registrar intervenciones técnicas preventivas y correctivas en maquinarias y equipos mineros/institucionales, controlar costos asociados, gestionar proveedores de servicio y programar fechas de próximo mantenimiento.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/maintenances` | Listar registros de mantenimiento (filtrables por `assetId` y `type`) |
| `POST` | `/api/v1/maintenances` | Registrar nueva intervención técnica preventiva o correctiva |
| `PATCH` | `/api/v1/maintenances/:id` | Editar datos de una intervención registrada |
| `DELETE` | `/api/v1/maintenances/:id` | Eliminar registro de mantenimiento |

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

# 4. Servicio API (`src/services/maintenance.service.ts`)

```typescript
import api from '../api/axios.instance';
import { AssetMaintenance, CreateMaintenanceDTO, UpdateMaintenanceDTO } from '../interfaces/maintenance.interface';

export const maintenanceService = {
  async getAll(params?: { assetId?: string; type?: MaintenanceType }) {
    const response = await api.get<{ success: boolean; data: AssetMaintenance[] }>('/maintenances', { params });
    return response.data.data;
  },

  async create(data: CreateMaintenanceDTO) {
    const response = await api.post<{ success: boolean; data: AssetMaintenance }>('/maintenances', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateMaintenanceDTO) {
    const response = await api.patch<{ success: boolean; data: AssetMaintenance }>(`/maintenances/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/maintenances/${id}`);
    return response.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Vista General de Mantenimientos (`src/pages/MaintenancesPage.tsx`)
- Pestañas de filtrado entre **Mantenimiento Preventivo** y **Mantenimiento Correctivo**.
- Indicadores visuales de costo acumulado e intervenciones programadas.

### 5.2 Formulario de Registro de Mantenimiento (`src/components/maintenances/MaintenanceFormModal.tsx`)
- Selector de Activo Fijo.
- Selector de Tipo (`PREVENTIVE` / `CORRECTIVE`).
- Campos de fecha de mantenimiento, proveedor, costo en Bolivianos (Bs.) y fecha recomendada de próximo mantenimiento (`nextMaintenance >= maintenanceDate`).

### 5.3 Historial de Mantenimientos en la Ficha del Activo (`src/components/assets/AssetMaintenanceHistory.tsx`)
- Desglose cronológico de las intervenciones sufridas por el activo con detalle de repuestos y observaciones técnicas.

---

# 6. Criterios de Aceptación

- [ ] Registro exitoso de mantenimientos conectado a `POST /api/v1/maintenances`.
- [ ] Validación de fechas en UI (`nextMaintenance` posterior a `maintenanceDate`).
- [ ] Cálculo visual de inversión total en mantenimiento por activo.
