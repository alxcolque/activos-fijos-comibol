# Módulo de Dashboard y Estadísticas Patrimoniales
**Documento:** FRONTEND_03_DASHBOARD.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Dashboard Principal y Resumen de Actividades  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del **Dashboard Principal** (`/`) en el cliente frontend React para la Corporación Minera de Bolivia (COMIBOL). El módulo debe consumir el endpoint `GET /api/v1/dashboard/stats` para desplegar tarjetas de indicadores clave (KPIs), gráfico interactivo de valoración por categoría, log de actividades recientes y la tabla resumen de últimos activos registrados.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/stats` | Obtiene KPIs patrimoniales, gráfico por categoría y actividades recientes | Sí |
| `GET` | `/api/v1/assets?limit=5` | Obtiene los 5 activos más recientemente registrados | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/dashboard.interface.ts`)

```typescript
export interface DashboardKPIs {
  totalAssets: number;
  totalValue: number;
  operationalCount: number;
  maintenanceCount: number;
}

export interface CategoryValueDistribution {
  categoryName: string;
  totalValue: number;
  assetCount: number;
}

export interface ActivityLogItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

export interface DashboardStatsResponse {
  kpis: DashboardKPIs;
  categoryDistribution: CategoryValueDistribution[];
  recentActivities: ActivityLogItem[];
}
```

---

# 4. Estado Global Zustand (`src/store/dashboardStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { DashboardStatsResponse } from '../interfaces/dashboard.interface';

interface DashboardState {
  stats: DashboardStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: DashboardStatsResponse }>('/dashboard/stats');
      set({ stats: response.data.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Error al cargar estadísticas del dashboard',
        isLoading: false,
      });
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Dashboard.tsx`)

### Componentes Visuales:
1. **Tarjetas StatCard:**
   - Total Activos Fijos (Con ícono `HiOutlineBriefcase` y formateador numérico).
   - Valoración Total Patrimonial (En Bolivianos `BOB` o dólares `USD` formateado con separadores de miles).
   - Activos Operativos (Indicador verde de estado).
   - Activos en Mantenimiento (Indicador ámbar de advertencia).
2. **Gráfico de Distribución Patrimonial por Categoría:**
   - Renderizado con barras progresivas SVG/CSS o Recharts mostrando el porcentaje del valor total del patrimonio minero.
3. **Sección de Actividades Recientes:**
   - Timeline con insignias de color (`success`, `warning`, `info`, `danger`) detallando la fecha, usuario y acción ejecutada.
4. **Tabla de Últimos Registros:**
   - Muestra los activos recién creados con botón directo "Ver Detalle" (`/assets/:id`) y botón de acceso rápido "+ Nuevo Activo" (`/assets/new`).

---

# 6. Criterios de Aceptación

- [ ] Carga asíncrona mediante `fetchDashboardStats()` al montar el componente `Dashboard.tsx`.
- [ ] Indicador visual de carga (`LoadingSpinner`) activo durante la petición HTTP.
- [ ] Formateo estricto de valores monetarios utilizando utilidades de moneda (`currencyUtils`).
- [ ] Redirección limpia desde las tarjetas hacia el módulo de activos filtrado.
