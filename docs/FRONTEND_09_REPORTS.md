# Módulo de Reportes e Informes Institucionales Frontend
**Documento:** FRONTEND_09_REPORTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Centro de Reportes Patrimoniales, Financieros y Depreciación  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del **Centro de Generación de Reportes** en el cliente frontend. Permite a los contadores, auditores y directivos de COMIBOL consultar y exportar informes oficiales valorizados, cuadro de depreciación lineal contable, resúmenes de mantenimientos e historial de asignaciones a proyectos.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reports/assets` | Reporte consolidado de inventario de activos fijos |
| `GET` | `/api/v1/reports/depreciation` | Reporte de cálculo de depreciación lineal contable acumulada |
| `GET` | `/api/v1/reports/assignments` | Reporte de asignaciones por custodios y proyectos |
| `GET` | `/api/v1/reports/maintenances` | Reporte de costos e intervenciones técnicas de mantenimiento |

---

# 3. Interfaces de Datos (`src/interfaces/report.interface.ts`)

```typescript
export interface AssetsReportSummary {
  totalAssets: number;
  totalPurchaseValue: number;
  totalCurrentValue: number;
}

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

# 4. Servicio API (`src/services/report.service.ts`)

```typescript
import api from '../api/axios.instance';
import { ReportQueryParams, DepreciationReportSummary, DepreciationReportItem } from '../interfaces/report.interface';

export const reportService = {
  async getAssetsReport(params?: ReportQueryParams) {
    const response = await api.get<{ success: boolean; data: { summary: any; items: any[] } }>(
      '/reports/assets',
      { params },
    );
    return response.data.data;
  },

  async getDepreciationReport(params?: ReportQueryParams) {
    const response = await api.get<{
      success: boolean;
      data: { summary: DepreciationReportSummary; items: DepreciationReportItem[] };
    }>('/reports/depreciation', { params });
    return response.data.data;
  },

  async getAssignmentsReport(params?: ReportQueryParams) {
    const response = await api.get<{ success: boolean; data: { summary: any; items: any[] } }>(
      '/reports/assignments',
      { params },
    );
    return response.data.data;
  },

  async getMaintenancesReport(params?: ReportQueryParams) {
    const response = await api.get<{ success: boolean; data: { summary: any; items: any[] } }>(
      '/reports/maintenances',
      { params },
    );
    return response.data.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Vista Principal del Centro de Reportes (`src/pages/ReportsPage.tsx`)
- Pestañas de selección de reporte:
  1. **Inventario Patrimonial Valorizado.**
  2. **Depreciación Lineal Acumulada.**
  3. **Historial de Asignaciones.**
  4. **Costos de Mantenimiento.**

### 5.2 Filtros Avanzados y Exportación (`src/components/reports/ReportFilterBar.tsx`)
- Selectores dinámicos por **Categoría**, **Estado**, **Ubicación** y **Rango de Fechas**.
- Selector de **Año de Cálculo** para el Cuadro de Depreciación.
- Botones de exportación rápida a **Imprimir / PDF** y **Exportar Excel (CSV)**.

### 5.3 Tabla de Depreciación Contable (`src/components/reports/DepreciationTable.tsx`)
- Muestra el cuadro oficial con columnas: Código | Nombre | Valor Original (Bs.) | Vida Útil (Años) | Años Transcurridos | Depreciación Anual (Bs.) | Depreciación Acumulada (Bs.) | Valor Neto en Libros (Bs.).
- Fila resumen de totales en el pie de tabla.

---

# 6. Criterios de Aceptación

- [ ] Generación instantánea de reportes basada en `GET /api/v1/reports/*`.
- [ ] Visualización exacta de la depreciación acumulada y valor neto en libros devuelto por el backend.
- [ ] Exportación limpia de datos en tabla lista para impresión contable.
