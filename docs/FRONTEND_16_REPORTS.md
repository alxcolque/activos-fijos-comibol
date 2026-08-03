# Módulo de Reportes Contables y Depreciación
**Documento:** FRONTEND_16_REPORTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Reportes Patrimoniales, Depreciación Anual y Cuadros Financieros  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Reportes y Depreciación Contable** (`/reports`) para generar tablas financieras de depreciación lineal acumulada, informes por categoría, resumen de asignaciones a custodios y registro de mantenimientos.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/assets` | Reporte general consolidado de activos | Sí |
| `GET` | `/api/v1/reports/depreciation` | Tabla de cálculo de depreciación y valor neto en libros | Sí |
| `GET` | `/api/v1/reports/assignments` | Resumen de custodios y bienes asignados | Sí |
| `GET` | `/api/v1/reports/maintenances` | Informe financiero de gastos de mantenimiento | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/report.interface.ts`)

```typescript
export interface DepreciationReportItem {
  id: string;
  code: string;
  name: string;
  category: string;
  purchaseYear: number | null;
  purchaseValue: number;
  usefulLife: number;
  elapsedYears: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  netBookValue: number;
}

export interface DepreciationReportSummary {
  totalAssets: number;
  totalOriginalValue: number;
  totalAccumulatedDepreciation: number;
  totalNetBookValue: number;
}

export interface DepreciationResponseData {
  summary: DepreciationReportSummary;
  items: DepreciationReportItem[];
}

export interface ReportQueryParams {
  category?: string;
  status?: string;
  location?: string;
  projectId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  activeOnly?: boolean;
}
```

---

# 4. Estado Global Zustand (`src/store/reportStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { DepreciationResponseData, ReportQueryParams } from '../interfaces/report.interface';

interface ReportState {
  depreciationData: DepreciationResponseData | null;
  isLoading: boolean;
  error: string | null;
  fetchDepreciationReport: (params?: ReportQueryParams) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  depreciationData: null,
  isLoading: false,
  error: null,
  fetchDepreciationReport: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: DepreciationResponseData }>('/reports/depreciation', { params });
      set({ depreciationData: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener reporte de depreciación', isLoading: false });
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Reports.tsx`)

### Pestañas y Secciones:
1. **Pestaña Depreciación Contable:**
   - Tarjetas de Resumen: Valor Original Total, Depreciación Acumulada Total, Valor Neto en Libros.
   - Tabla de Depreciación: Código, Nombre del Activo, Categoría, Fecha Compra, Valor de Compra (BOB), Vida Útil, Años Transcurridos, Depreciación Anual, Depreciación Acumulada, Valor Residual / Neto en Libros.
2. **Pestaña Inventarios por Ubicación:** Agrupación por sede o proyecto minero.
3. **Barra de Filtros:** Selector por Año Contable, Categoría de Activo, Proyecto y Estado.

---

# 6. Criterios de Aceptación

- [ ] Cálculo automático de depreciación en backend renderizado correctamente en la tabla.
- [ ] Totales financieros acumulados formateados en moneda BOB.
- [ ] Exportación directa de la tabla a Excel y PDF.
