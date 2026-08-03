# Módulo de Ajustes y Configuración Institucional
**Documento:** FRONTEND_17_SETTINGS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Configuración Institucional, Parámetros del Sistema y Logs de Auditoría  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Configuración Institucional** (`/settings`) para gestionar la información corporativa de COMIBOL (Razón Social, NIT, Dirección, Teléfono, Moneda por defecto, Prefijo de Activos) y consultar el registro de auditoría del sistema (`Audit Logs`).

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/settings` | Obtiene los parámetros institucionales configurados | Sí |
| `PUT` | `/api/v1/settings` | Actualiza la información y ajustes del sistema | Sí |
| `GET` | `/api/v1/audit-logs` | Lista los registros de auditoría HTTP (mutaciones en el sistema) | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/setting.interface.ts`)

```typescript
export interface CompanySettings {
  companyName: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  assetPrefix: string;
}

export interface UpdateSettingsDTO extends Partial<CompanySettings> {}

export interface AuditLogEntry {
  id: string;
  userId?: string | null;
  method: string;
  url: string;
  statusCode: number;
  ip: string;
  userAgent?: string | null;
  createdAt: string;
}
```

---

# 4. Estado Global Zustand (`src/store/settingsStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { CompanySettings, UpdateSettingsDTO, AuditLogEntry } from '../interfaces/setting.interface';

interface SettingsState {
  settings: CompanySettings | null;
  auditLogs: AuditLogEntry[];
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: UpdateSettingsDTO) => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  auditLogs: [],
  isLoading: false,
  error: null,
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: CompanySettings }>('/settings');
      set({ settings: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener configuraciones', isLoading: false });
    }
  },
  updateSettings: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put('/settings', data);
      await get().fetchSettings();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al guardar configuraciones');
    }
  },
  fetchAuditLogs: async () => {
    try {
      const response = await api.get<{ success: boolean; data: AuditLogEntry[] }>('/audit-logs');
      set({ auditLogs: response.data.data });
    } catch (err: any) {
      console.error('Error fetching audit logs', err);
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Settings.tsx`)

### Pestañas y Secciones:
1. **Pestaña Datos Institucionales:** Formulario con Razón Social (`CORPORACION MINERA DE BOLIVIA`), NIT, Dirección, Teléfono, Correo Institucional, Moneda (`BOB`), Prefijo de Código (`AF-`).
2. **Pestaña Registro de Auditoría (`AuditLogsTable.tsx`):** Muestra el historial de operaciones de mutación HTTP (`POST`, `PUT`, `DELETE`), método, dirección IP, código de estado HTTP y sello de tiempo.

---

# 6. Criterios de Aceptación

- [ ] Persistencia de cambios institucionales mediante `PUT /api/v1/settings`.
- [ ] Visualización clara del log de auditoría con filtrado por método HTTP.
